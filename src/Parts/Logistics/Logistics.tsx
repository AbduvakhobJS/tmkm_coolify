import React, { Suspense, useRef, useEffect, useMemo, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { io, Socket } from 'socket.io-client';
import { loadUzbekistanBorder, uzbekistanBorder } from '../../components/uzbekistanBorder';
import ProjectDashboard from '../../components/ProjectDashboard';
import WebRTCPlayer from '../../components/WebRTCPlayer';
import {useGetTypeObjectAll, useGetFactoryMarkers, useGetFactoryDetail} from "../../hooks/map";



// Zavod modallari uchun 3D model yo'llari — har bir zavod uchun real model ma'lumoti
// bo'lmagani sababli, modal ochilganda shu ro'yxatdan tasodifiy biri tanlanadi.
const factoryModels = [
    '/models/factory.glb',
    '/models/factory2.glb',
    '/models/factory3.glb'
];

// Factory API "coords" maydoni amalda turlicha kelishi mumkin:
// - JSON-string ko'rinishidagi massiv: '["66.729483","40.278469"]' (=> [lng, lat])
// - to'g'ridan-to'g'ri massiv: [66.729483, 40.278469] (=> [lng, lat])
// - "lat,lng" vergul bilan ajratilgan string (docs'da yozilgan format)
// maplibre esa har doim [lng, lat] tartibini kutadi.
const parseFactoryCoords = (coords: any): [number, number] | null => {
    if (!coords) return null;

    let value: any = coords;
    if (typeof value === 'string') {
        try {
            value = JSON.parse(value);
        } catch {
            // JSON emas — pastdagi vergul bilan ajratish logikasi ishlaydi
        }
    }

    if (Array.isArray(value) && value.length === 2) {
        const lng = Number(value[0]);
        const lat = Number(value[1]);
        return isNaN(lng) || isNaN(lat) ? null : [lng, lat];
    }

    if (typeof value === 'string') {
        const parts = value.split(',').map((p: string) => parseFloat(p.trim()));
        if (parts.length === 2 && !parts.some((n: number) => isNaN(n))) {
            return [parts[1], parts[0]];
        }
    }

    return null;
};

const CATEGORY_TOIFA: Record<string, string> = {
    factory: 'toifa-1',
    mine: 'toifa-2',
    'mine-cart': 'toifa-3',
};

const CATEGORY_ICON: Record<string, string> = {
    factory: '/icons/factory1.png',
    mine: '/icons/factory2.png',
    'mine-cart': '/icons/factory3.png',
};

const STATUS_COLORS: Record<string, string> = {
    REGISTRATION: '#ffa500',
    CONSTRUCTION: 'var(--gc-title)',
    STARTED: '#39ff14',
};

const IMPORTANCE_COLORS: Record<string, string> = {
    HIGH: '#ff2d55',
    AVERAGE: '#ffa500',
    LOW: '#7aa5cc',
};

const CYBER_LOGISTICS_MAP = {
    background: '#06111B',
    land: '#10202b',
    water: '#0b426d',
    waterGlow: '#22b8ff',
    border: '#00f5ff',
    province: 'rgba(0, 245, 255, 0.26)',
    road: 'rgba(104, 177, 205, 0.16)',
};

const UZBEKISTAN_VIEW_BOUNDS: maplibregl.LngLatBoundsLike = [
    [54.8, 35.9],
    [74.7, 44.3],
];

const LOGISTICS_ROUTE_POINTS = [
    { id: 1, name: 'Nukus', coords: [59.61, 42.46] },
    { id: 2, name: 'Urganch', coords: [60.63, 41.55] },
    { id: 3, name: 'Muynoq', coords: [59.02, 43.77] },
    { id: 4, name: 'Zarafshon', coords: [64.20, 41.58] },
    { id: 5, name: 'Navoiy', coords: [65.38, 40.08] },
    { id: 6, name: 'Jizzax', coords: [67.84, 40.12] },
    { id: 7, name: 'Toshkent', coords: [69.24, 41.31] },
    { id: 8, name: 'Chirchiq', coords: [69.58, 41.47] },
    { id: 9, name: 'Namangan', coords: [71.67, 40.99] },
    { id: 10, name: 'Andijon', coords: [72.34, 40.78] },
    { id: 11, name: "Farg'ona", coords: [71.78, 40.39] },
    { id: 12, name: 'Guliston', coords: [68.78, 40.49] },
    { id: 13, name: 'Qarshi', coords: [65.80, 38.86] },
    { id: 14, name: 'Termiz', coords: [67.28, 37.22] },
    { id: 15, name: 'Denov', coords: [67.90, 38.27] },
    { id: 16, name: 'Samarqand', coords: [66.96, 39.65] },
    { id: 17, name: 'Kattaqo‘rg‘on', coords: [66.26, 39.90] },
];

const LOGISTICS_ROUTES = [
    ['Nukus', 'Muynoq', 'Zarafshon', 'Navoiy', 'Toshkent', 'Namangan', 'Andijon', "Farg'ona"],
    ['Nukus', 'Urganch', 'Jizzax', 'Samarqand', 'Qarshi', 'Termiz'],
    ['Jizzax', 'Samarqand', 'Kattaqo‘rg‘on', 'Navoiy'],
    ['Toshkent', 'Chirchiq'],
    ['Toshkent', 'Guliston', 'Qarshi'],
    ['Qarshi', 'Denov', 'Termiz'],
    ['Toshkent', "Farg'ona"],
];

const safeSetPaint = (
    mapInstance: maplibregl.Map,
    layerId: string,
    property: string,
    value: unknown
) => {
    try {
        mapInstance.setPaintProperty(layerId, property, value as any);
    } catch {
        // External map styles vary; unsupported paint properties are intentionally skipped.
    }
};

const applyCyberLogisticsBaseStyle = (mapInstance: maplibregl.Map) => {
    mapInstance.getStyle().layers?.forEach((layer) => {
        if (layer.type === 'symbol') {
            mapInstance.setLayoutProperty(layer.id, 'visibility', 'none');
            return;
        }

        const id = layer.id.toLowerCase();

        if (layer.type === 'background') {
            safeSetPaint(mapInstance, layer.id, 'background-color', CYBER_LOGISTICS_MAP.background);
            return;
        }

        if (layer.type === 'raster') {
            safeSetPaint(mapInstance, layer.id, 'raster-brightness-min', 0.02);
            safeSetPaint(mapInstance, layer.id, 'raster-brightness-max', 0.52);
            safeSetPaint(mapInstance, layer.id, 'raster-contrast', 0.42);
            safeSetPaint(mapInstance, layer.id, 'raster-saturation', -0.65);
            safeSetPaint(mapInstance, layer.id, 'raster-hue-rotate', 195);
            return;
        }

        if (layer.type === 'fill') {
            if (id.includes('water') || id.includes('lake') || id.includes('river')) {
                safeSetPaint(mapInstance, layer.id, 'fill-color', CYBER_LOGISTICS_MAP.water);
                safeSetPaint(mapInstance, layer.id, 'fill-opacity', 0.72);
            } else {
                safeSetPaint(mapInstance, layer.id, 'fill-color', CYBER_LOGISTICS_MAP.land);
                safeSetPaint(mapInstance, layer.id, 'fill-opacity', 0.78);
            }
        }

        if (layer.type === 'line') {
            if (id.includes('road') || id.includes('transport') || id.includes('highway')) {
                safeSetPaint(mapInstance, layer.id, 'line-color', CYBER_LOGISTICS_MAP.road);
                safeSetPaint(mapInstance, layer.id, 'line-opacity', 0.18);
                safeSetPaint(mapInstance, layer.id, 'line-width', 0.55);
                return;
            }

            if (id.includes('water') || id.includes('river')) {
                safeSetPaint(mapInstance, layer.id, 'line-color', CYBER_LOGISTICS_MAP.waterGlow);
                safeSetPaint(mapInstance, layer.id, 'line-opacity', 0.4);
                safeSetPaint(mapInstance, layer.id, 'line-blur', 1.2);
                return;
            }

            if (id.includes('boundary') || id.includes('border') || id.includes('admin')) {
                safeSetPaint(mapInstance, layer.id, 'line-color', CYBER_LOGISTICS_MAP.province);
                safeSetPaint(mapInstance, layer.id, 'line-opacity', 0.28);
                safeSetPaint(mapInstance, layer.id, 'line-width', 0.6);
            }
        }
    });

    mapInstance.setMaxBounds([
        [51.5, 33.5],
        [78.5, 46.8],
    ]);
};

// --- Chegaradan chiqmaslik tekshiruvi -----------------------------------------
// Marshrut chiziqlari O'zbekiston chegara poligonidan tashqariga chiqmasligi kerak.
// Ray-casting algoritmi bilan berilgan nuqta poligon (yoki multipoligon) ichida
// ekanini tekshiramiz.
type Ring = [number, number][];

const rayCastInRing = (point: [number, number], ring: Ring): boolean => {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1];
        const xj = ring[j][0], yj = ring[j][1];
        const intersect = ((yi > y) !== (yj > y)) &&
            (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

const isPointInPolygonRings = (point: [number, number], rings: Ring[]): boolean => {
    if (!rings.length) return false;
    if (!rayCastInRing(point, rings[0])) return false;
    for (let i = 1; i < rings.length; i++) {
        if (rayCastInRing(point, rings[i])) return false; // teshik (hole) ichida
    }
    return true;
};

const isPointInsideGeometry = (point: [number, number], geometry: any): boolean => {
    if (!geometry) return true;
    if (geometry.type === 'Polygon') {
        return isPointInPolygonRings(point, geometry.coordinates);
    }
    if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates.some((rings: Ring[]) => isPointInPolygonRings(point, rings));
    }
    return true;
};

// borderData — /data/countries.geojson dan yuklangan O'zbekiston Feature'i (yoki fetch
// muvaffaqiyatsiz bo'lsa, komponent ichidagi taxminiy statik chegara). Natija — berilgan
// [lng, lat] nuqta chegara ichidami yo'qmi tekshiradigan funksiya.
const buildBorderChecker = (borderData: any): ((point: [number, number]) => boolean) => {
    const geometry = borderData?.features?.[0]?.geometry;
    if (!geometry) return () => true;
    return (point: [number, number]) => isPointInsideGeometry(point, geometry);
};

// --- Yo'l-ko'rinishidagi (road-like) egri segmentlar ----------------------------
// Har bir "chiziqcha" (2 nuqta orasidagi segment) uchun kvadratik Bezier egri chizig'i
// yasaladi — to'g'ri chiziq o'rtasiga perpendikulyar tomonga siljigan nazorat nuqtasi bilan.
// Agar hosil bo'lgan egri chiziq O'zbekiston chegarasidan tashqariga chiqsa, siljish
// miqdori chegara ichiga tushguncha asta-sekin kamaytiriladi (охир-oqibat to'g'ri chiziqqa qaytadi).
const buildRoadLikeEdge = (
    a: [number, number],
    b: [number, number],
    isInsideBorder: (point: [number, number]) => boolean,
    bulgeSign: number,
    segments = 20
): [number, number][] => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const length = Math.hypot(dx, dy);
    if (length === 0) return [a, b];

    const nx = -dy / length;
    const ny = dx / length;

    const sampleCurve = (amp: number): [number, number][] => {
        const control: [number, number] = [
            (a[0] + b[0]) / 2 + nx * amp * bulgeSign,
            (a[1] + b[1]) / 2 + ny * amp * bulgeSign,
        ];
        const pts: [number, number][] = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const it = 1 - t;
            pts.push([
                it * it * a[0] + 2 * it * t * control[0] + t * t * b[0],
                it * it * a[1] + 2 * it * t * control[1] + t * t * b[1],
            ]);
        }
        return pts;
    };

    let amplitude = length * 0.16;
    let curve = sampleCurve(amplitude);
    let attempts = 0;
    while (attempts < 6 && !curve.every(isInsideBorder)) {
        amplitude *= 0.5;
        curve = sampleCurve(amplitude);
        attempts++;
    }
    if (!curve.every(isInsideBorder)) {
        curve = [a, b];
    }

    return curve;
};

// Har bir marshrutdagi 2 nuqta oralig'i (segment) alohida "chiziqcha" sifatida
// chiziladi va navbatma-navbat har xil neon rangga bo'yaladi.
const NEON_ROUTE_PALETTE = [
    '#39ff14', // neon yashil
    '#00f5ff', // neon firuza
    '#2979ff', // neon ko'k
    '#7dfcff', // neon havorang
    '#00ffa3', // neon zumrad-yashil
    '#aefc03', // neon laym
    '#18e0c9', // neon aqua
];

const createLogisticsRouteData = (isInsideBorder: (point: [number, number]) => boolean) => {
    const pointByName = new Map(LOGISTICS_ROUTE_POINTS.map((point) => [point.name, point]));

    const edgeFeatures: any[] = [];
    let edgeIndex = 0;

    LOGISTICS_ROUTES.forEach((route) => {
        for (let i = 0; i < route.length - 1; i++) {
            const a = pointByName.get(route[i]);
            const b = pointByName.get(route[i + 1]);
            if (!a || !b) continue;

            const bulgeSign = edgeIndex % 2 === 0 ? 1 : -1;
            const coordinates = buildRoadLikeEdge(
                a.coords as [number, number],
                b.coords as [number, number],
                isInsideBorder,
                bulgeSign
            );

            edgeFeatures.push({
                type: 'Feature',
                properties: {
                    id: edgeIndex + 1,
                    color: NEON_ROUTE_PALETTE[edgeIndex % NEON_ROUTE_PALETTE.length],
                },
                geometry: {
                    type: 'LineString',
                    coordinates,
                },
            });

            edgeIndex++;
        }
    });

    return {
        routes: {
            type: 'FeatureCollection',
            features: edgeFeatures,
        },
        points: {
            type: 'FeatureCollection',
            features: LOGISTICS_ROUTE_POINTS.map((point) => ({
                type: 'Feature',
                properties: {
                    id: point.id,
                    label: point.name,
                },
                geometry: {
                    type: 'Point',
                    coordinates: point.coords,
                },
            })),
        },
    };
};

// Mapbox/MapLibre'da "line-dasharray"ni har freymda almashtirish orqali hosil
// qilinadigan standart "yurayotgan chiziqchalar" (marching dashes) animatsiyasi.
const LOGISTICS_DASH_SEQUENCE: number[][] = [
    [0, 4, 3],
    [0.5, 4, 2.5],
    [1, 4, 2],
    [1.5, 4, 1.5],
    [2, 4, 1],
    [2.5, 4, 0.5],
    [3, 4, 0],
    [0, 0.5, 3, 3.5],
    [0, 1, 3, 3],
    [0, 1.5, 3, 2.5],
    [0, 2, 3, 2],
    [0, 2.5, 3, 1.5],
    [0, 3, 3, 1],
    [0, 3.5, 3, 0.5],
];

const addLogisticsRouteLayers = (
    mapInstance: maplibregl.Map,
    isInsideBorder: (point: [number, number]) => boolean
) => {
    const { routes, points } = createLogisticsRouteData(isInsideBorder);

    mapInstance.addSource('logistics-routes', {
        type: 'geojson',
        data: routes as any,
        lineMetrics: true,
    });

    mapInstance.addSource('logistics-route-points', {
        type: 'geojson',
        data: points as any,
    });

    mapInstance.addLayer({
        id: 'logistics-route-outer-glow',
        type: 'line',
        source: 'logistics-routes',
        paint: {
            'line-color': ['get', 'color'],
            'line-width': 8,
            'line-blur': 8,
            'line-opacity': 0.32,
        },
    });

    mapInstance.addLayer({
        id: 'logistics-route-inner-glow',
        type: 'line',
        source: 'logistics-routes',
        paint: {
            'line-color': ['get', 'color'],
            'line-width': 3,
            'line-blur': 2.5,
            'line-opacity': 0.6,
        },
    });

    mapInstance.addLayer({
        id: 'logistics-route-core',
        type: 'line',
        source: 'logistics-routes',
        paint: {
            'line-color': ['get', 'color'],
            'line-width': 2,
            'line-opacity': 0.95,
            'line-dasharray': LOGISTICS_DASH_SEQUENCE[0],
        },
    });

    mapInstance.addLayer({
        id: 'logistics-node-halo',
        type: 'circle',
        source: 'logistics-route-points',
        paint: {
            'circle-radius': 14,
            'circle-color': 'rgba(255, 161, 22, 0.28)',
            'circle-blur': 0.65,
            'circle-stroke-color': '#ffb02e',
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.8,
        },
    });

    mapInstance.addLayer({
        id: 'logistics-node-core',
        type: 'circle',
        source: 'logistics-route-points',
        paint: {
            'circle-radius': 7,
            'circle-color': '#17130b',
            'circle-stroke-color': '#ffd166',
            'circle-stroke-width': 2,
            'circle-stroke-opacity': 1,
        },
    });

    mapInstance.addLayer({
        id: 'logistics-node-number',
        type: 'symbol',
        source: 'logistics-route-points',
        layout: {
            'text-field': ['to-string', ['get', 'id']],
            'text-size': 10,
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-allow-overlap': true,
            'text-ignore-placement': true,
        },
        paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#ff9f1c',
            'text-halo-width': 1.2,
        },
    });

    mapInstance.addLayer({
        id: 'logistics-node-label',
        type: 'symbol',
        source: 'logistics-route-points',
        layout: {
            'text-field': ['get', 'label'],
            'text-size': 11,
            'text-offset': [1.1, 0.75],
            'text-anchor': 'left',
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Regular'],
            'text-allow-overlap': false,
            'text-ignore-placement': false,
        },
        paint: {
            'text-color': '#f6fbff',
            'text-halo-color': 'rgba(2, 11, 24, 0.95)',
            'text-halo-width': 1.8,
        },
    });
};

// Markerlarni "declutter" (ustma-ustlikni yashirish) uchun piksellardagi radiuslar.
// Ikki marker markazi orasidagi ekran masofasi (r1 + r2) dan kichik bo'lsa —
// ustuvorroq (avval kelgan) marker ko'rinib qoladi, ikkinchisi yashiriladi.
// Kartani yaqinlashtirsangiz masofa oshadi => ko'proq marker ochiladi,
// uzoqlashtirsangiz => yaqinlari birlashib, bittasi qoladi. Cluster ikonkasi yo'q.
// Qiymatlarni ko'paytirsangiz kamroq, kamaytirsangiz ko'proq marker ko'rinadi.
const FACTORY_CLUSTER_R = 58;   // fabrika markeri katta (pin + sarlavha qutisi)
const MINERAL_CLUSTER_R = 12;   // mineral markeri kichik (14px shakl)

// /factory/:id javobidagi "cameras" massivi elementidan WebRTC stream URL yasaydi.
// Kamera obyektining aniq maydon nomlari docs'da berilmagan — shuning uchun bir nechta
// mumkin bo'lgan maydon nomini sinab ko'ramiz (global /cameras endpointi bilan bir xil shakl deb taxmin qilinadi).
const buildCameraStreamUrl = (cam: any): string | undefined => {
    if (!cam) return undefined;
    if (cam.streamUrl) return cam.streamUrl;
    if (cam.stream_url) return cam.stream_url;
    if (cam.url) return cam.url;
    if (cam.webrtc_server && cam.stream_uuid) {
        return `${cam.webrtc_server}/stream/${cam.stream_uuid}/channel/1/webrtc?uuid=${cam.stream_uuid}&channel=1`;
    }
    return undefined;
};


const MARKER_STYLES = `
    .custom-html-marker {
        display: flex;
        align-items: flex-end;
        cursor: pointer;
    }
    .custom-html-marker:hover {
        transform: scale(1.1);
        z-index: 100;
    }
    .marker-pin-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .marker-pin {
        width: 40px;
        height: 40px;
        background: white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ff1493;
    }
    .marker-icon-inner {
        transform: rotate(45deg);
        width: 24px;
        height: 24px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
    }
    .marker-line {
        width: 3px;
        height: 80px;
        background: #ff1493;
        margin-left: 0px;
        margin-top: -2px;
    }
    .marker-content-box {
        position: absolute;
        left: 20px;
        bottom: 25px;
        display: flex;
        flex-direction: column;
        min-width: 180px;
    }
    .marker-title-tag {
        background: #ff1493;
        color: white;
        padding: 4px 12px;
        font-size: 16px;
        font-weight: bold;
        border-radius: 4px 15px 4px 4px;
        margin-bottom: 2px;
        white-space: nowrap;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .marker-info-small {
        font-size: 10px;
        opacity: 0.8;
        font-weight: normal;
        margin-left: 10px;
    }
    .marker-info-box {
        background: rgba(10, 10, 10, 0.85);
        color: white;
        padding: 6px 12px;
        margin-left: 5%;
        font-size: 13px;
        border-radius: 4px;
        border-left: 4px solid #ff1493;
        backdrop-filter: blur(4px);
        display: flex;
        justify-content: space-between;
        align-items: center;
        white-space: nowrap;
    }
    .marker-info-value {
        color: #ffd700;
        margin-left: 10px;
    }

    /* Toifalar ranglari */
    .toifa-1 .marker-pin { border-color: #ff1493; }
    .toifa-1 .marker-line { background: #ff1493; }
    .toifa-1 .marker-title-tag { background: #ff1493; }
    .toifa-1 .marker-info-box { border-left-color: #ff1493; }

    .toifa-2 .marker-pin { border-color: var(--gc-title); }
    .toifa-2 .marker-line { background: var(--gc-title); }
    .toifa-2 .marker-title-tag { background: var(--gc-title); }
    .toifa-2 .marker-info-box { border-left-color: var(--gc-title); }

    .toifa-3 .marker-pin { border-color: #32cd32; }
    .toifa-3 .marker-line { background: #32cd32; }
    .toifa-3 .marker-title-tag { background: #32cd32; }
    .toifa-3 .marker-info-box { border-left-color: #32cd32; }

    .toifa-4 .marker-pin { border-color: #ffa500; }
    .toifa-4 .marker-line { background: #ffa500; }
    .toifa-4 .marker-title-tag { background: #ffa500; }
    .toifa-4 .marker-info-box { border-left-color: #ffa500; }

    .toifa-5 .marker-pin { border-color: #9370db; }
    .toifa-5 .marker-line { background: #9370db; }
    .toifa-5 .marker-title-tag { background: #9370db; }
    .toifa-5 .marker-info-box { border-left-color: #9370db; }
`;

// Mineral markers array (name, type, color, coords)
// Row 1: 6 triangle + 7 circle = 13  |  Row 2: 5 rhombus + 8 star = 13  |  Row 3: 12 square
const MINERAL_MARKERS: { name: string; type: 'square' | 'triangle' | 'circle' | 'rhombus' | 'star'; color: string; coords: [number, number] }[] = [
    // Triangles (6)
    { name: 'Oltin',       type: 'triangle', color: '#FFD700', coords: [64.6, 40.9] },
    { name: 'Kumush',      type: 'triangle', color: '#C0C0C0', coords: [67.3, 39.7] },
    { name: 'Platina',     type: 'triangle', color: '#E0E0E0', coords: [61.4, 41.5] },
    { name: 'Volfram',     type: 'triangle', color: '#4682B4', coords: [60.9, 43.8] },
    { name: 'Molibden',    type: 'triangle', color: '#9370DB', coords: [61.0, 42.5] },
    { name: 'Palladiy',    type: 'triangle', color: '#ADD8E6', coords: [63.2, 40.3] },
    // Circles (7)
    { name: 'Reniy',       type: 'circle',   color: '#87CEEB', coords: [71.8, 40.1] },
    { name: 'Rodiy',       type: 'circle',   color: '#E0C8FF', coords: [65.1, 39.5] },
    { name: 'Indiy',       type: 'circle',   color: '#FF6347', coords: [67.7, 41.4] },
    { name: 'Galliy',      type: 'circle',   color: '#20B2AA', coords: [68.4, 40.6] },
    { name: 'Tellurid',    type: 'circle',   color: '#FFA07A', coords: [64.9, 42.2] },
    { name: 'Selen',       type: 'circle',   color: '#DA70D6', coords: [67.9, 41.0] },
    { name: 'Surma',       type: 'circle',   color: '#DDA0DD', coords: [68.9, 40.1] },
    // Rhombuses (5)
    { name: 'Litiy',       type: 'rhombus',  color: '#FF4500', coords: [66.5, 40.2] },
    { name: 'Berilliy',    type: 'rhombus',  color: '#FFA500', coords: [63.8, 39.2] },
    { name: 'Skandiy',     type: 'rhombus',  color: '#FF00FF', coords: [70.1, 41.2] },
    { name: 'Stronsiy',    type: 'rhombus',  color: '#00FF7F', coords: [62.5, 41.7] },
    { name: 'Vismut',      type: 'rhombus',  color: '#5F9EA0', coords: [72.0, 40.5] },
    // Stars (8)
    { name: 'Rubidiy',     type: 'star',     color: '#FF1493', coords: [69.0, 41.3] },
    { name: 'Sesiy',       type: 'star',     color: '#00CED1', coords: [68.9, 32.5] },
    { name: 'Lantan',      type: 'star',     color: '#EE82EE', coords: [65.8, 38.8] },
    { name: 'Seriy',       type: 'star',     color: '#F0E68C', coords: [68.2, 38.9] },
    { name: 'Neodim',      type: 'star',     color: '#7FFFD4', coords: [71.5, 40.6] },
    { name: 'Erbiy',       type: 'star',     color: '#FF8C69', coords: [63.5, 41.8] },
    { name: 'Ytterbiy',    type: 'star',     color: '#00FA9A', coords: [60.6, 43.1] },
    { name: 'Gadoliniy',   type: 'star',     color: '#BA55D3', coords: [70.7, 41.5] },
    // Squares (12)
    { name: 'Temir',       type: 'square',   color: '#8B8B8B', coords: [60.6, 41.3] },
    { name: 'Mis',         type: 'square',   color: '#B87333', coords: [69.3, 40.8] },
    { name: 'Rux',         type: 'square',   color: '#6BAED6', coords: [67.8, 38.6] },
    { name: "Qo'rg'oshin", type: 'square',   color: '#708090', coords: [70.5, 40.5] },
    { name: 'Alyuminiy',   type: 'square',   color: '#A6BDDB', coords: [65.4, 41.8] },
    { name: 'Nikel',       type: 'square',   color: '#98FB98', coords: [58.5, 43.2] },
    { name: 'Xrom',        type: 'square',   color: '#32CD32', coords: [62.1, 40.5] },
    { name: 'Marganes',    type: 'square',   color: '#FF8C00', coords: [64.4, 40.1] },
    { name: 'Kobalt',      type: 'square',   color: '#00BFFF', coords: [66.9, 38.1] },
    { name: 'Titan',       type: 'square',   color: '#FF69B4', coords: [71.2, 40.7] },
    { name: 'Vanadiy',     type: 'square',   color: '#1E90FF', coords: [60.8, 42.9] },
    { name: 'Qalay',       type: 'square',   color: '#BC8F8F', coords: [59.2, 44.1] },
];

const getMineralSVG = (type: 'square' | 'triangle' | 'circle' | 'rhombus' | 'star', color: string) => {
    if (type === 'square') {
        return `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="1" width="12" height="12" fill="${color}" stroke="white" stroke-width="1.2" rx="1"/></svg>`;
    } else if (type === 'triangle') {
        return `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><polygon points="7,1 13,13 1,13" fill="${color}" stroke="white" stroke-width="1.2"/></svg>`;
    } else if (type === 'circle') {
        return `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="6" fill="${color}" stroke="white" stroke-width="1.2"/></svg>`;
    } else if (type === 'rhombus') {
        return `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><polygon points="7,1 13,7 7,13 1,7" fill="${color}" stroke="white" stroke-width="1.2"/></svg>`;
    } else {
        return `<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><path d="M7,1 L8.6,5.1 L13,5.1 L9.7,7.9 L10.9,12.2 L7,9.8 L3.1,12.2 L4.3,7.9 L1,5.1 L5.4,5.1 Z" fill="${color}" stroke="white" stroke-width="0.8"/></svg>`;
    }
};

// 1. RIGHTPANEL VIEW MODEL (Modal uchun 3D model)
export const FactoryViewer = ({
                                  modelPath,
                                  rotationSpeed = 0.5,
                                  zoom = 0.05,
                              }: {
    modelPath: string;
    rotationSpeed?: number;
    zoom?: number;
}) => {
    const gltf = useGLTF(modelPath) as any;
    const clonedScene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
    const ref = useRef<THREE.Group>(null);
    // useFrame o'rniga oddiy useEffect yoki alternativ ishlatish kerak, chunki bu erda Canvas Modal ichida
    return (
        <group ref={ref} scale={zoom}>
            <primitive object={clonedScene} scale={0.35} />
        </group>
    );
};

// 5. ASOSIY MAP KOMPONENTI
const Logistics = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const [isManual, setIsManual] = React.useState(false);
    const [openDetailId, setOpenDetailId] = React.useState<number | string | null>(null);
    const timerRef = useRef<any>(null);
    const markersRef = useRef<Record<string, maplibregl.Marker>>({});
    const vehicleMarkersRef = useRef<Record<number, maplibregl.Marker>>({});
    const mineralMarkersRef = useRef<maplibregl.Marker[]>([]);
    const [visibleToifas, setVisibleToifas] = React.useState<string[]>([]);
    const [projectCategory, setProjectCategory] = React.useState<string>('');
    const [objectTypeFilter, setObjectTypeFilter] = React.useState<string>('');
    const [vehicles, setVehicles] = React.useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = React.useState<any | null>(null);
    const [wsConnected, setWsConnected] = React.useState(false);

    const {data: typeObject} = useGetTypeObjectAll();
    const {data: markersData, isError: markersIsError, error: markersErrorObj, isLoading: markersLoading} = useGetFactoryMarkers({
        lang: 'uz',
        ...(projectCategory ? { project_category: projectCategory } : {}),
        ...(objectTypeFilter ? { object_type: objectTypeFilter } : {}),
    });
    const {data: factoryDetail} = useGetFactoryDetail(openDetailId, 'uz');

    // Backend javobi turli ko'rinishda kelishi mumkin — barchasini tekshirib chiqamiz
    const unwrapList = (payload: any): any[] => {
        if (!payload) return [];
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload.factories)) return payload.factories;
        if (Array.isArray(payload.data)) return payload.data;
        if (Array.isArray(payload.data?.factories)) return payload.data.factories;
        if (Array.isArray(payload.items)) return payload.items;
        if (Array.isArray(payload.result)) return payload.result;
        return [];
    };

    const factorys = useMemo(() => {
        const list = unwrapList(markersData);
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.debug('[factory/marker] raw:', markersData, '-> parsed:', list);
        }
        return list;
    }, [markersData]);

    const objectTypeOptions = useMemo(() => {
        const raw = unwrapList(typeObject);
        const options = raw.map((item: any) => {
            if (typeof item === 'string') return { value: item, label: item };
            const value = item.value ?? item.object_type ?? item.code ?? item.key ?? item.slug ?? item.id ?? item.name ?? item.title;
            const label = item.label ?? item.name ?? item.title ?? item.nameUz ?? String(value ?? '');
            return { value, label };
        }).filter((opt: any) => opt.value !== undefined && opt.value !== null && opt.value !== '');
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.debug('[factory/object-types] raw:', typeObject, '-> parsed:', options);
        }
        return options;
    }, [typeObject]);

    const randomFactoryModel = useMemo(() => {
        return factoryModels[Math.floor(Math.random() * factoryModels.length)];
    }, [openDetailId]);

    // O'zbekiston chegara neon animatsiyasi uchun state yoki ref
    const animationFrameRef = useRef<number>();
    const logisticsAnimationFrameRef = useRef<number>();

    // Markerlarni declutter qilish (bir freymda faqat bir marta ishlashi uchun rAF throttle)
    const declutterRafRef = useRef<number | null>(null);

    // Ekran koordinatalari bo'yicha yaqin markerlarni yashirib, faqat bittasini qoldiradi.
    // Faqat visibility'ni almashtiradi — marker/data/dizaynga tegmaydi.
    // Vehicle (transport) markerlari bu yerga QO'SHILMAYDI: ular real-time yangilanadi.
    const declutterMarkers = useCallback(() => {
        const mapInstance = map.current;
        if (!mapInstance) return;

        type Item = { el: HTMLElement; lngLat: maplibregl.LngLat; r: number };
        const items: Item[] = [];

        // 1) Fabrika markerlari — ustuvor (avval joy egallaydi)
        Object.values(markersRef.current).forEach((m) => {
            items.push({ el: m.getElement(), lngLat: m.getLngLat(), r: FACTORY_CLUSTER_R });
        });
        // 2) Mineral markerlari — keyin (fabrika yonida bo'lsa yashiriladi)
        mineralMarkersRef.current.forEach((m) => {
            items.push({ el: m.getElement(), lngLat: m.getLngLat(), r: MINERAL_CLUSTER_R });
        });

        const shown: { x: number; y: number; r: number }[] = [];

        for (const { el, lngLat, r } of items) {
            const p = mapInstance.project(lngLat);
            let collides = false;
            for (let i = 0; i < shown.length; i++) {
                const s = shown[i];
                const dx = s.x - p.x;
                const dy = s.y - p.y;
                const minDist = s.r + r;
                if (dx * dx + dy * dy < minDist * minDist) {
                    collides = true;
                    break;
                }
            }
            if (collides) {
                if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
            } else {
                if (el.style.visibility === 'hidden') el.style.visibility = '';
                shown.push({ x: p.x, y: p.y, r });
            }
        }
    }, []);

    // Karta harakati/zoom paytida ko'p marta chaqirilmasligi uchun rAF bilan throttle
    const scheduleDeclutter = useCallback(() => {
        if (declutterRafRef.current != null) return;
        declutterRafRef.current = requestAnimationFrame(() => {
            declutterRafRef.current = null;
            declutterMarkers();
        });
    }, [declutterMarkers]);

    useEffect(() => {
        if (!mapContainer.current) return;

        // CSS uslublarni qo'shish
        const style = document.createElement('style');
        style.textContent = MARKER_STYLES;
        document.head.appendChild(style);

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://api.maptiler.com/maps/019de83b-bc0c-7558-9ffe-1761aa83c410/style.json?key=YqciQrrpszIp23MCz2am',
            center: [66.9, 40.0],
            zoom: 5.25,
            pitch: 0,
            bearing: 0,
            fadeDuration: 0
        });

        // Karta har harakat/zoom qilinganda markerlarni qayta declutter qilish
        map.current.on('move', scheduleDeclutter);

        map.current.on('load', async () => {
            if (!map.current) return;

            applyCyberLogisticsBaseStyle(map.current);
            map.current.fitBounds(UZBEKISTAN_VIEW_BOUNDS, {
                padding: { top: 34, right: 34, bottom: 34, left: 34 },
                duration: 0,
                pitch: 0,
                bearing: 0,
            });

            try {
                const response = await fetch('/data/countries.geojson');
                const countriesData = await response.json();

                map.current.addSource('neighboring-countries', {
                    type: 'geojson',
                    data: countriesData as any
                });

                map.current.addLayer({
                    id: 'neighboring-countries-fill',
                    type: 'fill',
                    source: 'neighboring-countries',
                    paint: {
                        'fill-color': CYBER_LOGISTICS_MAP.land,
                        'fill-opacity': 0.16
                    }
                });

                map.current.addLayer({
                    id: 'neighboring-countries-outline',
                    type: 'line',
                    source: 'neighboring-countries',
                    paint: {
                        'line-color': CYBER_LOGISTICS_MAP.province,
                        'line-width': 0.7,
                        'line-opacity': 0.22,
                        'line-blur': 0.6
                    }
                });
            } catch (error) {
                console.error('Qo\'shni davlatlar chegaralarini yuklashda xatolik:', error);
            }

            // 1. O'ZBEKISTON CHEGARASINI YUKLASH
            const uzbekistanData = await loadUzbekistanBorder();

            if (uzbekistanData) {
                map.current.addSource('uzbekistan-border', {
                    type: 'geojson',
                    data: uzbekistanData as any
                });

                // Ichki to'ldirish
                map.current.addLayer({
                    id: 'uzbekistan-fill',
                    type: 'fill',
                    source: 'uzbekistan-border',
                    paint: {
                        'fill-color': CYBER_LOGISTICS_MAP.land,
                        'fill-opacity': 0.18
                    }
                });

                // Tashqi neon glow (katta)
                map.current.addLayer({
                    id: 'uzbekistan-outline-glow',
                    type: 'line',
                    source: 'uzbekistan-border',
                    paint: {
                        'line-color': CYBER_LOGISTICS_MAP.border,
                        'line-width': 9,
                        'line-blur': 14,
                        'line-opacity': 0.36
                    }
                });

                // O'rta neon layer
                map.current.addLayer({
                    id: 'uzbekistan-outline-mid',
                    type: 'line',
                    source: 'uzbekistan-border',
                    paint: {
                        'line-color': CYBER_LOGISTICS_MAP.border,
                        'line-width': 4,
                        'line-blur': 6,
                        'line-opacity': 0.62
                    }
                });

                // Asosiy o'tkir chiziq
                map.current.addLayer({
                    id: 'uzbekistan-outline',
                    type: 'line',
                    source: 'uzbekistan-border',
                    paint: {
                        'line-color': CYBER_LOGISTICS_MAP.border,
                        'line-width': 1.6,
                        'line-opacity': 0.92
                    }
                });


                // Neon animatsiyasi
                let step = 0;
                const animateNeon = () => {
                    step += 0.03;
                    const opacity = 0.2 + Math.abs(Math.sin(step)) * 0.4;
                    const glowWidth = 4 + Math.abs(Math.sin(step)) * 8;

                    if (map.current && map.current.getLayer('uzbekistan-outline-glow')) {
                        map.current.setPaintProperty('uzbekistan-outline-glow', 'line-opacity', opacity);
                        map.current.setPaintProperty('uzbekistan-outline-glow', 'line-width', glowWidth);

                        // O'rta qatlamni ham ozgina o'zgartirish
                        const midOpacity = 0.4 + Math.abs(Math.sin(step)) * 0.3;
                        map.current.setPaintProperty('uzbekistan-outline-mid', 'line-opacity', midOpacity);

                        animationFrameRef.current = requestAnimationFrame(animateNeon);
                    }
                };
                animateNeon();
            }

            // Marshrut chiziqlari O'zbekiston chegarasidan chiqmasligi uchun,
            // real chegara poligoni (yoki fetch muvaffaqiyatsiz bo'lsa taxminiy statik chegara) asosida tekshiruvchi tuziladi.
            const isInsideBorder = buildBorderChecker(uzbekistanData ?? uzbekistanBorder);
            addLogisticsRouteLayers(map.current, isInsideBorder);

            // "Chiziqcha-chiziqcha" (marching dashes) harakat animatsiyasi + tugun halosining pulsi
            let dashStep = 0;
            const animateLogisticsRoutes = (timestamp: number) => {
                if (!map.current || !map.current.getLayer('logistics-route-core')) return;

                const newStep = Math.floor((timestamp / 60) % LOGISTICS_DASH_SEQUENCE.length);
                if (newStep !== dashStep) {
                    map.current.setPaintProperty('logistics-route-core', 'line-dasharray', LOGISTICS_DASH_SEQUENCE[newStep]);
                    dashStep = newStep;
                }

                const pulse = 13 + Math.abs(Math.sin(timestamp / 250)) * 4;
                map.current.setPaintProperty('logistics-node-halo', 'circle-radius', pulse);

                logisticsAnimationFrameRef.current = requestAnimationFrame(animateLogisticsRoutes);
            };
            logisticsAnimationFrameRef.current = requestAnimationFrame(animateLogisticsRoutes);
        });

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (logisticsAnimationFrameRef.current) cancelAnimationFrame(logisticsAnimationFrameRef.current);
            if (declutterRafRef.current != null) cancelAnimationFrame(declutterRafRef.current);
            mineralMarkersRef.current.forEach(m => m.remove());
            map.current?.remove();
        };
    }, []);

    const handleManualOpen = (index: number) => {
        setIsManual(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsManual(false), 30000);
    };

    const handleOpenDetails = (id: number | string, index: number = 0) => {
        handleManualOpen(index);
        setOpenDetailId(id);
    };

    const handleCloseDetails = () => {
        setOpenDetailId(null);
    };

    // Sidebar ro'yxatidan bosilganda: xaritani o'sha markerga fokuslaydi VA detail modalni ochadi —
    // marker ustiga bosilganda ham xuddi shu handleOpenDetails ishlaydi.
    const focusFactory = (f: any, index: number) => {
        const coords = parseFactoryCoords(f.coords);
        if (coords && map.current) {
            map.current.flyTo({ center: coords, zoom: 12, pitch: 0, bearing: 0, speed: 1.2 });
        }
        handleOpenDetails(f.id, index);
    };

    const addMineralMarkers = () => {
        if (!map.current) return;
        mineralMarkersRef.current.forEach(m => m.remove());
        mineralMarkersRef.current = [];

        MINERAL_MARKERS.forEach((mineral) => {
            const el = document.createElement('div');
            el.title = mineral.name;
            el.style.cssText = 'width:14px;height:14px;cursor:pointer;';

            const inner = document.createElement('div');
            inner.style.cssText = `
                width:14px;height:14px;
                filter: drop-shadow(0 0 3px ${mineral.color});
                transition: transform 0.15s, filter 0.15s;
                transform: scale(0.7);
                transform-origin: center center;
            `;
            inner.innerHTML = getMineralSVG(mineral.type, mineral.color);
            el.appendChild(inner);

            el.onmouseenter = () => {
                inner.style.transform = 'scale(1.1)';
                inner.style.filter = `drop-shadow(0 0 6px ${mineral.color})`;
            };
            el.onmouseleave = () => {
                inner.style.transform = 'scale(0.7)';
                inner.style.filter = `drop-shadow(0 0 3px ${mineral.color})`;
            };

            const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
                .setLngLat(mineral.coords)
                .addTo(map.current!);
            mineralMarkersRef.current.push(marker);
        });

        // Mineral markerlari qo'shilgach declutter (fabrikalar bilan birga)
        scheduleDeclutter();
    };
    const formatText = (text = "", count: number) => {
        if (!text) return "";

        const value = text.trim();

        // 10 ta belgidan ko'p bo'lsa
        if (value.length > count) {
            return value.slice(0, count) + "...";
        }

        // 10 tadan kam yoki teng bo'lsa
        const firstSpaceIndex = value.indexOf(" ");

        return firstSpaceIndex === -1
            ? value
            : value.slice(0, firstSpaceIndex);
    };
    const updateMarkers = () => {
        if (!map.current) return;

        // Eskilarini tozalash
        Object.values(markersRef.current).forEach(m => m.remove());
        markersRef.current = {};

        factorys.forEach((f: any, index: number) => {
            const coords = parseFactoryCoords(f.coords);
            if (!coords) return;

            // alert('test')
            const el = document.createElement('div');
            const toifaClass = CATEGORY_TOIFA[f.marker_icon] || 'toifa-1';
            el.className = `custom-html-marker ${toifaClass}`;

            const iconPath = CATEGORY_ICON[f.marker_icon] || '/icons/factory1.png';
            const name = f.name || f.title || '';
            const subInfo = f.objectType || f.object_type || '';
            const regionLabel = f.region || 'Hudud';
            const statusLabel = f.status || '';

            el.innerHTML = `
            <div class="marker-pin-wrapper" style="transform: scale(0.65); transform-origin: bottom left;">
                    <div class="marker-content-box">
                        <div class="marker-title-tag">
                            ${formatText(name, 10)}
<!--                            <span class="marker-info-small">${subInfo}</span>-->
                        </div>
                        <div class="marker-info-box">
                            <span>${formatText(regionLabel, 8)}</span>
                            <span class="marker-info-value">${statusLabel}</span>
                        </div>
                    </div>
                    <div class="marker-pin">
                        <div class="marker-icon-inner" style="background-image: url(${iconPath})"></div>
                    </div>
                    <div class="marker-line"></div>
                </div>
            `;

            el.onclick = () => {
                handleOpenDetails(f.id, index);
            };

            const marker = new maplibregl.Marker({
                element: el,
                anchor: 'bottom-left'
            })
                .setLngLat(coords)
                .addTo(map.current!);

            markersRef.current[f.id] = marker;
        });

        updateVehicleMarkers();

        // Yangi chizilgan markerlarni darhol declutter qilish (ustma-ustlikni yashirish)
        scheduleDeclutter();
    };

    const updateVehicleMarkers = () => {
        if (!map.current) return;

        // Toifa 6 yoki avtomobillar o'chirilgan bo'lsa barcha mashina markerlarini olib tashlash
        const showActive = visibleToifas.includes('active_car');
        const showInactive = visibleToifas.includes('inactive_car');

        if (!showActive && !showInactive) {
            Object.values(vehicleMarkersRef.current).forEach(m => m.remove());
            vehicleMarkersRef.current = {};
            return;
        }

        // Yangi ma'lumotlar bo'yicha yangilash
        vehicles.forEach((v) => {
            const isOnline = v.status?.isOnline;

            // Filtrni tekshirish
            if ((isOnline && !showActive) || (!isOnline && !showInactive)) {
                if (vehicleMarkersRef.current[v.id]) {
                    vehicleMarkersRef.current[v.id].remove();
                    delete vehicleMarkersRef.current[v.id];
                }
                return;
            }

            const iconUrl = isOnline ? '/icons/activeCar.png' : '/icons/inActiveCar.png';
            const lngLat: [number, number] = [v.position.longitude, v.position.latitude];

            if (vehicleMarkersRef.current[v.id]) {
                // Marker allaqachon bor, faqat pozitsiya va iconni yangilash
                const marker = vehicleMarkersRef.current[v.id];
                marker.setLngLat(lngLat);

                const el = marker.getElement();
                const iconInner = el.querySelector('.marker-icon-inner') as HTMLElement;
                if (iconInner) {
                    iconInner.style.backgroundImage = `url(${iconUrl})`;
                }
            } else {
                // Yangi marker yaratish - faqat icon
                const el = document.createElement('div');
                el.className = `custom-html-marker toifa-6 ${isOnline ? 'active' : 'inactive'}`;

                el.innerHTML = `
                    <div class="marker-pin-wrapper">
                        <div class="marker-pin" style="border: none; background: transparent; width: 34px; height: 34px; transform: none; border-radius: 50%;">
                            <div class="marker-icon-inner" style="background-image: url(${iconUrl}); background-size: contain; width: 30px; height: 30px; transform: none; background-repeat: no-repeat; background-position: center;"></div>
                        </div>
                    </div>
                `;

                el.onclick = (e) => {
                    e.stopPropagation();
                    setSelectedVehicle(v);
                };

                const marker = new maplibregl.Marker({
                    element: el,
                    anchor: 'center'
                })
                    .setLngLat(lngLat)
                    .addTo(map.current!);

                vehicleMarkersRef.current[v.id] = marker;
            }
        });

        // Ro'yxatda yo'q yoki filtrdan o'tmagan markerlarni o'chirish
        const currentVehicleIds = vehicles
            .filter(v => (v.status?.isOnline && showActive) || (!v.status?.isOnline && showInactive))
            .map(v => v.id);

        Object.keys(vehicleMarkersRef.current).forEach(idStr => {
            const id = parseInt(idStr);
            if (!currentVehicleIds.includes(id)) {
                vehicleMarkersRef.current[id].remove();
                delete vehicleMarkersRef.current[id];
            }
        });
    };

    // Optimized vehicle marker update - only updates positions, doesn't recreate markers
    const updateVehicleMarkersOptimized = useCallback((newVehicles: any[]) => {
        if (!map.current) return;

        const showActive = visibleToifas.includes('active_car');
        const showInactive = visibleToifas.includes('inactive_car');

        // If both are disabled, remove all vehicle markers
        if (!showActive && !showInactive) {
            Object.values(vehicleMarkersRef.current).forEach(m => m.remove());
            vehicleMarkersRef.current = {};
            return;
        }

        // Filter vehicles based on visibility
        const visibleVehicles = newVehicles.filter(v => {
            const isOnline = v.status?.isOnline;
            return (isOnline && showActive) || (!isOnline && showInactive);
        });

        const visibleVehicleIds = new Set(visibleVehicles.map(v => v.id));

        // Remove markers for vehicles that are no longer visible or in the list
        Object.keys(vehicleMarkersRef.current).forEach(idStr => {
            const id = parseInt(idStr);
            if (!visibleVehicleIds.has(id)) {
                vehicleMarkersRef.current[id].remove();
                delete vehicleMarkersRef.current[id];
            }
        });

        // Update or create markers for visible vehicles
        visibleVehicles.forEach((v) => {
            const isOnline = v.status?.isOnline;
            const iconUrl = isOnline ? '/icons/activeCar.png' : '/icons/inActiveCar.png';
            const lngLat: [number, number] = [v.position.longitude, v.position.latitude];

            if (vehicleMarkersRef.current[v.id]) {
                // Marker exists - just update position (this keeps markers stable during zoom)
                const marker = vehicleMarkersRef.current[v.id];
                marker.setLngLat(lngLat);

                // Update icon if online status changed
                const el = marker.getElement();
                const iconInner = el.querySelector('.marker-icon-inner') as HTMLElement;
                if (iconInner && iconInner.style.backgroundImage !== `url(${iconUrl})`) {
                    iconInner.style.backgroundImage = `url(${iconUrl})`;
                }
            } else {
                // Create new marker
                const el = document.createElement('div');
                el.className = `custom-html-marker toifa-6 ${isOnline ? 'active' : 'inactive'}`;

                el.innerHTML = `
                    <div class="marker-pin-wrapper">
                        <div class="marker-pin" style="border: none; background: transparent; width: 34px; height: 34px; transform: none; border-radius: 50%;">
                            <div class="marker-icon-inner" style="background-image: url(${iconUrl}); background-size: contain; width: 30px; height: 30px; transform: none; background-repeat: no-repeat; background-position: center;"></div>
                        </div>
                    </div>
                `;

                el.onclick = (e) => {
                    e.stopPropagation();
                    setSelectedVehicle(v);
                };

                const marker = new maplibregl.Marker({
                    element: el,
                    anchor: 'center'
                })
                    .setLngLat(lngLat)
                    .addTo(map.current!);

                vehicleMarkersRef.current[v.id] = marker;
            }
        });
    }, [visibleToifas]);

    // WebSocket connection for real-time vehicle tracking
    useEffect(() => {
        const token = localStorage.getItem("token");
        const wsUrl = 'wss://tmk.bgs.uz/tracking';

        // Initialize WebSocket connection
        socketRef.current = io(wsUrl, {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            auth: {
                token: token || ''
            }
        });

        socketRef.current.on('connect', () => {
            console.log('WebSocket connected');
            setWsConnected(true);

            // Enable real-time tracking with 1 second interval
            setTimeout(() => {
                socketRef.current?.emit('enableRealTimeTracking', {
                    interval: 1000,
                    includePosition: true,
                    includeStatus: true,
                    realTime: true,
                });
            }, 1000);
        });

        socketRef.current.on('disconnect', (reason: string) => {
            console.log('WebSocket disconnected:', reason);
            setWsConnected(false);
        });

        socketRef.current.on('connect_error', (error: Error) => {
            console.error('WebSocket connection error:', error);
            setWsConnected(false);
        });

        // Handle real-time vehicle updates
        socketRef.current.on('realTimeVehicleUpdate', (data: { vehicles: any[]; totalCount: number }) => {
            if (data?.vehicles) {
                setVehicles(data.vehicles);
                updateVehicleMarkersOptimized(data.vehicles);
            }
        });

        // Handle regular vehicle updates
        socketRef.current.on('vehicleUpdates', (data: { status: string; vehicles?: any[] }) => {
            if (data.status === 'success' && data.vehicles) {
                setVehicles(data.vehicles);
                updateVehicleMarkersOptimized(data.vehicles);
            }
        });

        // Fallback to REST polling if WebSocket fails
        const fetchVehicles = async () => {
            if (wsConnected) return; // Skip if WebSocket is connected

            try {
                const response = await fetch('https://tmk.bgs.uz/api/api/vehicles/realtime', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await response.json();
                const list = result.success ? result.data : result;
                if (Array.isArray(list)) {
                    setVehicles(list);
                    updateVehicleMarkersOptimized(list);
                }
            } catch (err) {
                console.error("Vehicle fetch error:", err);
            }
        };

        // Initial fetch
        fetchVehicles();

        // Polling interval for fallback
        const interval = setInterval(fetchVehicles, 5000);

        return () => {
            clearInterval(interval);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [wsConnected, updateVehicleMarkersOptimized]);

    const toggleToifa = (toifa: string) => {
        setVisibleToifas(prev => {
            const isChecked = prev.includes(toifa);
            const next = isChecked ? prev.filter(t => t !== toifa) : [...prev, toifa];
            return next;
        });
    };

    // Filtr yoki fabrika ma'lumotlari o'zgarganda markerlarni yangilash.
    // Vaqtinchalik xatolik (fon rejimidagi so'rov muvaffaqiyatsiz bo'lsa) allaqachon
    // chizilgan markerlarni bekorga o'chirib yubormasligi uchun bunday holatda yangilanish o'tkazib yuboriladi.
    useEffect(() => {
        Object.values(markersRef.current).forEach(m => m.remove());
        markersRef.current = {};
        updateVehicleMarkersOptimized(vehicles);
    }, [visibleToifas, vehicles, updateVehicleMarkersOptimized]);


    return (
        <div style={{
            width: '100%', height: '100%', position: 'relative',
            background: '#020B18', borderRadius: '12px', overflow: 'hidden',
        }}>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

            {/* Minerals Legend Panel */}
            <div style={{
                position: 'absolute',
                bottom: '2%',
                left: "2%",
                width: 'auto',
                background: 'rgba(2, 11, 24, 0.55)',
                border: '1px solid rgba(0, 245, 255, 0.3)',
                borderRadius: '0 0 8px 0',
                padding: '8px 10px',
                zIndex: 10,
                display: 'none',
                flexDirection: 'column',
                gap: '5px',
                backdropFilter: 'blur(8px)',
            }}>
                <div style={{ fontSize: '9px', fontWeight: 'bold', color: 'rgba(0,245,255,0.8)', borderBottom: '1px solid rgba(0,245,255,0.2)', paddingBottom: '4px', textAlign: 'center', letterSpacing: '1px' }}>
                    MINERALLAR
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: '0 10px', alignItems: 'start' }}>
                    {[
                        MINERAL_MARKERS.filter(m => m.type === 'triangle' || m.type === 'circle'),
                        MINERAL_MARKERS.filter(m => m.type === 'rhombus'  || m.type === 'star'),
                        MINERAL_MARKERS.filter(m => m.type === 'square'),
                    ].map((col, ci) => (
                        <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: '3px', borderRight: ci < 2 ? '1px solid rgba(0,245,255,0.1)' : 'none', paddingRight: ci < 2 ? '10px' : 0 }}>
                            {col.map(m => (
                                <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ flexShrink: 0, lineHeight: 0, filter: `drop-shadow(0 0 2px ${m.color})` }} dangerouslySetInnerHTML={{ __html: getMineralSVG(m.type, m.color) }} />
                                    <span style={{ fontSize: '8px', color: m.color, fontWeight: 'bold', whiteSpace: 'nowrap' }}>{m.name}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter Panel — top-left, horizontal row */}
            <div style={{
                position: 'absolute',
                top: '2%',
                left: '2%',
                maxWidth: '96%',
                width: 'fit-content',
                background: 'rgba(2, 11, 24, 0.55)',
                border: '1px solid rgba(0, 245, 255, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: '16px',
                alignItems: 'center',
                backdropFilter: 'blur(8px)',
                color: 'white',
            }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(0,245,255,0.8)', letterSpacing: '1px', paddingRight: '10px', borderRight: '1px solid rgba(0,245,255,0.2)' }}>
                    FILTRLASH
                </div>

                {/* Loyiha kategoriyasi */}
                {/*<div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>*/}
                {/*    {[*/}
                {/*        { value: '', label: 'Barchasi', color: 'var(--gc-title)' },*/}
                {/*        { value: 'factory', label: 'Metall', color: '#ff1493' },*/}
                {/*        { value: 'mine', label: 'Kon', color: '#32cd32' },*/}
                {/*        { value: 'mine-cart', label: 'Market', color: '#ffa500' },*/}
                {/*    ].map(opt => (*/}
                {/*        <button*/}
                {/*            key={opt.value}*/}
                {/*            onClick={() => setProjectCategory(opt.value)}*/}
                {/*            style={{*/}
                {/*                fontSize: '11px',*/}
                {/*                fontWeight: 'bold',*/}
                {/*                padding: '5px 10px',*/}
                {/*                borderRadius: '4px',*/}
                {/*                cursor: 'pointer',*/}
                {/*                color: projectCategory === opt.value ? '#020B18' : opt.color,*/}
                {/*                background: projectCategory === opt.value ? opt.color : 'transparent',*/}
                {/*                border: `1px solid ${opt.color}`,*/}
                {/*                transition: 'all 0.2s',*/}
                {/*            }}*/}
                {/*        >*/}
                {/*            {opt.label}*/}
                {/*        </button>*/}
                {/*    ))}*/}
                {/*</div>*/}
                
                {/*/!* Obyekt turi *!/*/}
                {/*<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>*/}
                {/*    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Obyekt turi:</span>*/}
                {/*    <select*/}
                {/*        value={objectTypeFilter}*/}
                {/*        onChange={(e) => setObjectTypeFilter(e.target.value)}*/}
                {/*        style={{*/}
                {/*            fontSize: '11px',*/}
                {/*            background: 'rgba(2, 11, 24, 0.8)',*/}
                {/*            color: 'white',*/}
                {/*            border: '1px solid rgba(0,245,255,0.4)',*/}
                {/*            borderRadius: '4px',*/}
                {/*            padding: '5px 8px',*/}
                {/*            cursor: 'pointer',*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        <option value="">Barchasi</option>*/}
                {/*        {objectTypeOptions.map((opt: any, i: number) => (*/}
                {/*            <option key={`${opt.value}-${i}`} value={opt.value}>{opt.label}</option>*/}
                {/*        ))}*/}
                {/*    </select>*/}
                {/*</div>*/}

                {/* Transport holati */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '11px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#39ff14', boxShadow: '0 0 6px #39ff14' }}></div>
                        <span style={{ color: '#39ff14', fontWeight: 'bold' }}>Active</span>
                        <input
                            type="checkbox"
                            checked={visibleToifas.includes('active_car')}
                            onChange={() => toggleToifa('active_car')}
                            style={{ cursor: 'pointer', accentColor: '#39ff14', width: '13px', height: '13px' }}
                        />
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '11px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff2d55', boxShadow: '0 0 6px #ff2d55' }}></div>
                        <span style={{ color: '#ff2d55', fontWeight: 'bold' }}>Inactive</span>
                        <input
                            type="checkbox"
                            checked={visibleToifas.includes('inactive_car')}
                            onChange={() => toggleToifa('inactive_car')}
                            style={{ cursor: 'pointer', accentColor: '#ff2d55', width: '13px', height: '13px' }}
                        />
                    </label>
                </div>
            </div>

            {/* Fabrika ro'yxati — o'ng tomondagi sidebar */}
            <div style={{
                position: 'absolute',
                top: '2%',
                right: '2%',
                width: '220px',
                maxHeight: '90%',
                background: 'rgba(2, 11, 24, 0.55)',
                border: '1px solid rgba(0, 245, 255, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                zIndex: 10,
                display: 'none',
                flexDirection: 'column',
                gap: '6px',
                backdropFilter: 'blur(8px)',
                color: 'white',
            }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(0,245,255,0.8)', borderBottom: '1px solid rgba(0,245,255,0.2)', paddingBottom: '6px', textAlign: 'center', letterSpacing: '1px' }}>
                    OBYEKTLAR ({factorys.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
                    {factorys.map((f: any, index: number) => {
                        const color = f.marker_icon === 'mine' ? '#32cd32' : f.marker_icon === 'mine-cart' ? '#ffa500' : '#ff1493';
                        return (
                            <div
                                key={f.id ?? index}
                                onClick={() => focusFactory(f, index)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    padding: '6px 8px',
                                    borderRadius: '4px',
                                    borderLeft: `3px solid ${color}`,
                                    background: 'rgba(255,255,255,0.04)',
                                    cursor: 'pointer',
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,245,255,0.1)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                            >
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {f.name || f.title}
                                </span>
                                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)' }}>
                                    {f.region || f.objectType || ''}
                                </span>
                            </div>
                        );
                    })}
                    {markersLoading && (
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '10px 0' }}>
                            Yuklanmoqda...
                        </div>
                    )}
                    {markersIsError && (
                        <div style={{ fontSize: '11px', color: '#ff2d55', textAlign: 'center', padding: '10px 0' }}>
                            Xatolik: {(markersErrorObj as any)?.response?.status === 401 ? 'Token yo\'q yoki muddati o\'tgan, qayta login qiling' : ((markersErrorObj as any)?.message || 'ma\'lumot olinmadi')}
                        </div>
                    )}
                    {!markersLoading && !markersIsError && factorys.length === 0 && (
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '10px 0' }}>
                            Obyektlar topilmadi
                        </div>
                    )}
                </div>
            </div>

            {/* Vehicle Detail Modal */}
            {selectedVehicle && (
                <div
                    onClick={() => setSelectedVehicle(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        pointerEvents: 'auto',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '800px',
                            maxWidth: '90vw',
                            maxHeight: '85vh',
                            background: '#020B18',
                            border: '1px solid rgba(0,245,255,0.3)',
                            borderRadius: '12px',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            color: '#e0f0ff',
                            fontFamily: 'var(--font-body), sans-serif',
                            boxShadow: '0 0 30px rgba(0,245,255,0.15)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,245,255,0.2)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,245,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,245,255,0.3)' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gc-title)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'var(--gc-title)', textTransform: 'uppercase', letterSpacing: '1px' }}>{selectedVehicle.name}</h3>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        fontSize: '12px',
                                        color: selectedVehicle.status?.isOnline ? '#39ff14' : '#ff2d55',
                                        background: selectedVehicle.status?.isOnline ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 45, 85, 0.1)',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        marginTop: '4px',
                                        border: `1px solid ${selectedVehicle.status?.isOnline ? 'rgba(57, 255, 20, 0.3)' : 'rgba(255, 45, 85, 0.3)'}`
                                    }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 5px currentColor' }}></span>
                                        {selectedVehicle.status?.isOnline ? 'Onlayn' : 'Oflayn'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedVehicle(null)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    border: '1px solid rgba(255,255,255,0.35)',
                                    background: 'rgba(255,255,255,0.08)',
                                    color: 'white',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                X
                            </button>
                        </div>

                        {/* Content Grid */}
                        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', background: 'rgba(0,0,0,0.2)', overflowY: 'auto' }}>
                            {/* Joylashuv */}
                            <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--gc-title)', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    Joylashuv
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#7aa5cc' }}>Kenglik:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.position?.latitude?.toFixed(6)}°</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#7aa5cc' }}>Uzunlik:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.position?.longitude?.toFixed(6)}°</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#7aa5cc' }}>Balandlik:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.position?.altitude || 0} m</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#7aa5cc' }}>Yo'nalish:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.position?.course || 0}°</span>
                                    </div>
                                </div>
                            </div>

                            {/* Harakat */}
                            <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#39ff14', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                    Harakat
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#7aa5cc' }}>Tezlik:</span>
                                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#39ff14', textShadow: '0 0 5px rgba(57, 255, 20, 0.5)' }}>{selectedVehicle.position?.speed || 0} km/h</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#7aa5cc' }}>Dvigatel:</span>
                                        <span style={{ fontWeight: '600', color: selectedVehicle.sensors?.ignition ? '#39ff14' : '#ff2d55' }}>
                                            {selectedVehicle.sensors?.ignition ? 'Yoqilgan' : 'O\'chirilgan'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: '#7aa5cc' }}>Oxirgi yangilanish:</span>
                                        <span style={{ fontWeight: '600', fontSize: '11px', color: '#e0f0ff' }}>
                                            {selectedVehicle.position?.lastUpdate ? new Date(selectedVehicle.position.lastUpdate).toLocaleString('uz-UZ') : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Sensorlar */}
                            <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#bf5fff', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                    Sensorlar
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#7aa5cc' }}>GPS sun'iy yo'ldoshlar:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.sensors?.satellites || selectedVehicle.position?.satellites || 0}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#7aa5cc' }}>Kuchlanish:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.sensors?.voltage || 0} V</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#7aa5cc' }}>Yoqilg'i:</span>
                                            <span style={{ fontWeight: '600' }}>{selectedVehicle.sensors?.fuel || 0}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ width: `${selectedVehicle.sensors?.fuel || 0}%`, height: '100%', background: '#ffa500', boxShadow: '0 0 5px #ffa500' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Elektr ta'minoti */}
                            <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#ffa500', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="9"></line></svg>
                                    Quvvat
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#7aa5cc' }}>Tashqi quvvat:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.sensors?.externalPower || 0} V</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#7aa5cc' }}>Ichki quvvat:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.sensors?.internalPower || 0} V</span>
                                    </div>
                                </div>
                            </div>

                            {/* Aloqa ma'lumotlari */}
                            <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--gc-title)', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    Aloqa
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#7aa5cc' }}>Holat:</span>
                                        <span style={{ fontWeight: '600', color: selectedVehicle.status?.isOnline ? '#39ff14' : '#ff2d55' }}>
                                            {selectedVehicle.status?.isOnline ? 'Onlayn' : 'Oflayn'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: '#7aa5cc' }}>Oxirgi aloqa:</span>
                                        <span style={{ fontWeight: '600', fontSize: '11px' }}>
                                            {selectedVehicle.status?.lastMessage ? new Date(selectedVehicle.status.lastMessage * 1000).toLocaleString('uz-UZ') : '-'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: '#7aa5cc' }}>Ulanish vaqti:</span>
                                        <span style={{ fontWeight: '600', fontSize: '11px' }}>
                                            {selectedVehicle.status?.connectionTime ? new Date(selectedVehicle.status.connectionTime * 1000).toLocaleString('uz-UZ') : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Qo'shimcha ma'lumotlar */}
                            <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#7aa5cc', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                    Ma'lumot
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#7aa5cc' }}>ID:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.id}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#7aa5cc' }}>Sinf:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.className || 'Noma\'lum'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#7aa5cc' }}>Xabar ID:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.additional?.lastMessageId || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '15px 20px', background: 'rgba(2, 11, 24, 0.9)', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(0,245,255,0.2)' }}>
                            <button
                                onClick={() => setSelectedVehicle(null)}
                                style={{
                                    padding: '8px 24px',
                                    background: 'transparent',
                                    color: 'var(--gc-title)',
                                    border: '1px solid rgba(0,245,255,0.5)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(0,245,255,0.1)';
                                    e.currentTarget.style.boxShadow = '0 0 10px rgba(0,245,255,0.3)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                Yopish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {openDetailId !== null && (
                <div
                    onClick={handleCloseDetails}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 900000000,
                        pointerEvents: 'auto',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100vw',
                            maxWidth: '100vw',
                            height: '95vh',
                            maxHeight: '95vh',
                            background: '#020B18',
                            // border: '1px solid rgba(0,245,255,0.3)',
                            // borderRadius: '12px',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            color: '#e0f0ff',
                            fontFamily: 'var(--font-body), sans-serif',
                            // boxShadow: '0 0 30px rgba(0,245,255,0.15)',
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,245,255,0.2)' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'var(--gc-title)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {factoryDetail?.name || factoryDetail?.enterprise_name || 'Zavod'}
                                </h3>
                                {factoryDetail?.status && (
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', marginTop: '6px',
                                        color: STATUS_COLORS[factoryDetail.status] || '#e0f0ff',
                                        background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px',
                                        border: `1px solid ${STATUS_COLORS[factoryDetail.status] || 'rgba(255,255,255,0.2)'}`,
                                    }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 5px currentColor' }}></span>
                                        {factoryDetail.status}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleCloseDetails}
                                style={{
                                    width: '32px', height: '32px', border: '1px solid rgba(255,255,255,0.35)',
                                    background: 'rgba(255,255,255,0.08)', color: 'white', borderRadius: '8px',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                X
                            </button>
                        </div>

                        {/* Content — 2x2: chap-tepa umumiy ma'lumot, o'ng-tepa 3D model, chap-past ProjectDashboard, o'ng-past kameralar */}
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '1px', background: 'rgba(0,245,255,0.15)', overflow: 'hidden', minHeight: 0 }}>
                            {!factoryDetail ? (
                                <div style={{ gridColumn: '1 / -1', gridRow: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', background: '#020B18' }}>
                                    Ma'lumot yuklanmoqda...
                                </div>
                            ) : (
                                <>
                                    {/* Chap-tepa: umumiy ma'lumot */}
                                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0 }}>
                                        {/* Joylashuv */}
                                        <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                            <div style={{ marginBottom: '15px', color: 'var(--gc-title)', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>Joylashuv</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#7aa5cc' }}>Manzil:</span>
                                                    <span style={{ fontWeight: '600', textAlign: 'right' }}>{factoryDetail.location || '-'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#7aa5cc' }}>Viloyat:</span>
                                                    <span style={{ fontWeight: '600' }}>{factoryDetail.region || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Loyiha */}
                                        <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                            <div style={{ marginBottom: '15px', color: '#39ff14', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>Loyiha</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#7aa5cc' }}>Maqsad:</span>
                                                    <span style={{ fontWeight: '600', textAlign: 'right' }}>{factoryDetail.projectGoal || '-'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#7aa5cc' }}>Obyekt turi:</span>
                                                    <span style={{ fontWeight: '600' }}>{factoryDetail.objectType || '-'}</span>
                                                </div>
                                                {typeof factoryDetail.work_persent === 'number' && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <span style={{ color: '#7aa5cc' }}>Bajarilish:</span>
                                                            <span style={{ fontWeight: '600' }}>{factoryDetail.work_persent}%</span>
                                                        </div>
                                                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${factoryDetail.work_persent}%`, height: '100%', background: '#39ff14', boxShadow: '0 0 5px #39ff14' }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Holat va muhimlik */}
                                        <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                            <div style={{ marginBottom: '15px', color: '#bf5fff', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>Holat</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#7aa5cc' }}>Holat:</span>
                                                    <span style={{ fontWeight: '600', color: STATUS_COLORS[factoryDetail.status] || '#e0f0ff' }}>{factoryDetail.status || '-'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#7aa5cc' }}>Muhimlik:</span>
                                                    <span style={{ fontWeight: '600', color: IMPORTANCE_COLORS[factoryDetail.importance] || '#e0f0ff' }}>{factoryDetail.importance || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Boshqaruv */}
                                        <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                            <div style={{ marginBottom: '15px', color: '#ffa500', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>Boshqaruv</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#7aa5cc' }}>Korxona:</span>
                                                    <span style={{ fontWeight: '600', textAlign: 'right' }}>{factoryDetail.enterprise_name || '-'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#7aa5cc' }}>Rahbar:</span>
                                                    <span style={{ fontWeight: '600' }}>{factoryDetail.manager || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Elementlar */}
                                        {Array.isArray(factoryDetail.elements) && factoryDetail.elements.length > 0 && (
                                            <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                                <div style={{ marginBottom: '15px', color: '#7aa5cc', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>Elementlar</div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                    {factoryDetail.elements.map((el: string, i: number) => (
                                                        <span key={i} style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gc-title)', border: '1px solid rgba(0,245,255,0.3)', borderRadius: '4px', padding: '3px 10px' }}>{el}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* O'ng-tepa: 3D model */}
                                    <div style={{ background: 'var(--gc-panel-bg)', overflow: 'hidden', position: 'relative', minHeight: 0 }}>
                                        <div style={{ position: 'absolute', top: '10px', left: '12px', zIndex: 10, color: 'var(--gc-title)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            3D Model
                                        </div>
                                        <Canvas shadows camera={{ position: [0, 2, 5], fov: 40 }}>

                                            <ambientLight intensity={0.8} />
                                            <pointLight position={[10, 10, 10]} intensity={1.5} />
                                            <Suspense fallback={<Html center><div style={{ color: 'var(--gc-title)', fontSize: '11px' }}>Model yuklanmoqda...</div></Html>}>
                                                <FactoryViewer
                                                    modelPath={randomFactoryModel}
                                                    rotationSpeed={0.5}
                                                    zoom={0.06}
                                                />
                                                <Environment preset="city" />
                                                <ContactShadows frames={1} position={[0, -1.5, 0]} opacity={0.6} scale={15} blur={3} />
                                            </Suspense>
                                            <OrbitControls enablePan={false} enableRotate={true} enableZoom={true} minDistance={2} maxDistance={25} />
                                        </Canvas>
                                    </div>

                                    {/* Chap-past: ProjectDashboard (real API ma'lumotlari bilan) */}
                                    <div style={{ background: '#0a1420', overflowY: 'auto', minHeight: 0 }}>
                                        <ProjectDashboard factory={factoryDetail} />
                                    </div>

                                    {/* O'ng-past: Kameralar (4 ta, /factory/:id javobidagi "cameras" massividan) */}
                                    <div style={{ background: '#020B18', overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)', gap: '2px', minHeight: 0 }}>
                                        {Array.from({ length: 4 }).map((_, i) => {
                                            const cam = Array.isArray(factoryDetail.cameras) ? factoryDetail.cameras[i] : undefined;
                                            const streamUrl = buildCameraStreamUrl(cam);
                                            return (
                                                <div key={i} style={{ position: 'relative', background: '#0d0d0d', overflow: 'hidden' }}>
                                                    {streamUrl ? (
                                                        <WebRTCPlayer url={streamUrl} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>
                                                            {cam ? 'Stream mavjud emas' : 'Kamera yo\'q'}
                                                        </div>
                                                    )}
                                                    {cam && (
                                                        <span style={{ position: 'absolute', top: '4px', left: '5px', background: 'rgba(0,0,0,0.7)', color: '#ccc', fontSize: '10px', padding: '2px 6px', borderRadius: '3px' }}>
                                                            {cam.label || cam.name || cam.modelUz || cam.model || `Kamera ${i + 1}`}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}

                    </div>
                </div>
            )}
        </div>
    );
};

export default Logistics;
