import React, { Suspense, useRef, useEffect, useMemo, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { io, Socket } from 'socket.io-client';
import { uzbekistanBorder, loadUzbekistanBorder } from '../../components/uzbekistanBorder';
import {useGetMapObjects, useGetGeologyProjectDetail, useGetInvestProjectDetail, useGetFactoryDetail} from "../../hooks/map";
import type { MapItem, MapLinkRef, MapFactoryDetail, MapGeologyDetail, MapInvestDetail } from "../../services/map";
import { GC, alpha } from '../../theme/palette';
import { DRACO_DECODER_PATH } from '../FactoryModel/constants';
import FactoryModel from "../FactoryModel/FactoryModel";



// GET /map/objects `items[].type` diskriminatoriga ko'ra marker rangi —
// uchalasi ham ko'k oilasidan, bir-biridan farqlanishi uchun ochiq/to'q
// darajasi boshqacha. `geology` — avvalgi marker rangi (GC.marker) saqlanadi.
const SOURCE_COLORS: Record<string, string> = {
    geology: '#07ae6e',
    factory: '#0a779c',
    invest: '#0e74e3',
};

const SOURCE_LABELS: Record<string, string> = {
    geology: 'Geologiya',
    factory: 'Sanoat',
    invest: 'Investitsiya',
};

// `factory` uchun aniqlangan #00213F to'q rang xarita foniga deyarli qo'shilib
// ketadi — panel/tugma/matn kabi UI elementlarida shu rang o'rniga ochroq
// (lekin bir xil ko'k oiladagi) variant ishlatiladi, faqat legibility uchun.
// Xarita markeri/klaster to'ldirishi hamon aniq SOURCE_COLORS'dan oladi.
const SOURCE_UI_ACCENT: Record<string, string> = {
    geology: SOURCE_COLORS.geology,
    factory: GC.accent2,
    invest: SOURCE_COLORS.invest,
};

const STATUS_COLORS: Record<string, string> = {
    REGISTRATION: GC.amber,
    CONSTRUCTION: 'var(--gc-title)',
    STARTED: GC.accent1,
};

const IMPORTANCE_COLORS: Record<string, string> = {
    HIGH: GC.red,
    AVERAGE: GC.amber,
    LOW: GC.slate,
};

// Pin ichidagi kichik ikonka — turga qarab (asset taxmin qilib ishlatilmaydi,
// har doim to'g'ri ko'rinishi uchun inline SVG, rang pin chegarasiga mos).
const getMarkerTypeIcon = (type: string, color: string): string => {
    if (type === 'factory') {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21V10.5l4.5 3V10.5l4.5 3V10.5l4.5 3V21H3z" fill="${color}"/><rect x="3" y="19.5" width="16.5" height="1.6" fill="${color}"/></svg>`;
    }
    if (type === 'invest') {
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17l5-5 4 4 8-9" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7h5v5" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    // geology (standart)
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 20L9 8l3.5 5.5L14.5 11 21.5 20H2.5z" fill="${color}"/></svg>`;
};

// Marker teg (title) matnini qisqartiradi — uzunroq nomlar bitta so'zgacha,
// ancha uzun bo'lsa "..." bilan kesiladi.
const formatMarkerText = (text = "", count: number) => {
    if (!text) return "";
    const value = text.trim();
    if (value.length > count) return value.slice(0, count) + "...";
    const firstSpaceIndex = value.indexOf(" ");
    return firstSpaceIndex === -1 ? value : value.slice(0, firstSpaceIndex);
};

// Markerlarni "declutter" (ustma-ustlikni yashirish) uchun piksellardagi radiuslar.
// Ikki marker markazi orasidagi ekran masofasi (r1 + r2) dan kichik bo'lsa —
// ustuvorroq (avval kelgan) marker ko'rinib qoladi, ikkinchisi yashiriladi.
// Kartani yaqinlashtirsangiz masofa oshadi => ko'proq marker ochiladi,
// uzoqlashtirsangiz => yaqinlari birlashib, bittasi qoladi. Cluster ikonkasi yo'q.
// Qiymatlarni ko'paytirsangiz kamroq, kamaytirsangiz ko'proq marker ko'rinadi.
// Dumaloq klaster (son bilan aylana) ko'rinishidan butunlay voz kechilgan —
// factory/geology/invest (jami ~50-60 ta obyekt) ham shu declutter
// mexanizmidan foydalanadi (pastda).
const MINERAL_CLUSTER_R = 12;   // mineral markeri kichik (14px shakl)
const OBJECT_CLUSTER_R = 60;    // pin+teg dizayni kattaroq, ustma-ust tushmasligi uchun
// Juda uzoq zoomda hammasi ustma-ust tushib butunlay yo'qolib qolmasligi
// uchun kamida shuncha obyekt doim ko'rinib turadi (qolganlari radius
// tekshiruvidan qat'i nazar, xaritaga bir tekis "diagonal" tarqatib qo'shiladi).
const MIN_VISIBLE_OBJECTS = 5;


/* ── Baza xarita uslubidagi YASHIL/TEAL qatlamlarni ko'kka o'tkazish ─────
   MapTiler uslubida fon qatlami (`Background`) teal — `hsl(182, 35%, 17%)`,
   ya'ni butun xarita yashilroq ko'rinadi. "Situatsion markaz" palitrasida
   yashil faqat status uchun, shuning uchun bunday sirtlar navy-ko'k tonga
   almashtiriladi.

   Shart: yashil kanal qizildan sezilarli yuqori VA ko'kdan past emas.
   Shu sababli suv/daryo kabi aniq ko'k qatlamlar (b >> g) tegilmaydi —
   uslub allaqachon ko'k bo'lsa, funksiya hech narsani o'zgartirmaydi. */
const NAVY_DARK: [number, number, number] = [11, 17, 24];   // GC.bg900
const NAVY_LIGHT: [number, number, number] = [42, 54, 70];  // GC.axisLine

const deGreenBasemap = (map: maplibregl.Map) => {
    let layers: any[];
    try {
        layers = map.getStyle()?.layers ?? [];
    } catch {
        return;
    }

    let changed = false;

    /* Rangni rgb ga o'girish uchun bitta yashirin element (hex/rgb/hsl/nom —
       barchasini brauzerning o'zi hisoblab beradi). */
    const probe = document.createElement('span');
    probe.style.display = 'none';
    document.body.appendChild(probe);

    const toRgb = (value: string): [number, number, number] | null => {
        probe.style.color = '';
        probe.style.color = value;
        if (!probe.style.color) return null;
        const m = getComputedStyle(probe).color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
    };

    /* Faqat SIRT qatlamlari. `line` ataylab yo'q: chegara chiziqlari yorqin
       siyan (`hsl(181, 92%, 54%)`) bo'lib, kanal nisbati bo'yicha "teal" ga
       o'xshaydi — ular ranglansa xarita konturlari yo'qolib qolardi. */
    const PROPS: Record<string, string> = {
        background: 'background-color',
        fill: 'fill-color',
        'fill-extrusion': 'fill-extrusion-color',
    };

    for (const layer of layers) {
        const prop = PROPS[layer.type];
        if (!prop) continue;

        let raw: unknown;
        try {
            raw = map.getPaintProperty(layer.id, prop);
        } catch {
            continue;
        }
        /* Ifoda (expression) yoki bo'sh qiymatlarga tegilmaydi. */
        if (typeof raw !== 'string') continue;

        const rgb = toRgb(raw);
        if (!rgb) continue;
        const [r, g, b] = rgb;
        if (!(g > r + 6 && g >= b - 4)) continue; // yashil/teal emas — qoldiriladi

        /* Yorqinligini saqlab, navy gradient ichiga ko'chiriladi. */
        const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        const mix = (i: 0 | 1 | 2) => Math.round(NAVY_DARK[i] + (NAVY_LIGHT[i] - NAVY_DARK[i]) * l);
        try {
            map.setPaintProperty(layer.id, prop, `rgb(${mix(0)}, ${mix(1)}, ${mix(2)})`);
            changed = true;
        } catch {
            /* qatlam qulflangan bo'lsa — o'tkazib yuboriladi */
        }
    }

    probe.remove();

    /* Plitkalar yuklanmagan holatda karta render siklini o'zi qayta
       chizmasligi mumkin — yangi ranglar ko'rinishi uchun majburiy repaint. */
    if (changed) map.triggerRepaint();
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
        border: 2px solid ${GC.marker};
    }
    .marker-icon-inner {
        transform: rotate(45deg);
        width: 24px;
        height: 24px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .marker-line {
        width: 3px;
        height: 80px;
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
    .marker-info-box {
        background: rgba(10, 10, 10, 0.85);
        color: white;
        padding: 6px 12px;
        margin-left: 5%;
        font-size: 13px;
        border-radius: 4px;
        border-left: 4px solid;
        backdrop-filter: blur(4px);
        display: flex;
        justify-content: space-between;
        align-items: center;
        white-space: nowrap;
    }
    .marker-info-value {
        color: ${GC.amber};
        margin-left: 10px;
    }
    .mineral-popup .maplibregl-popup-content {
        background: rgba(2, 11, 24, 0.92);
        color: white;
        font-size: 12px;
        font-weight: bold;
        padding: 6px 10px;
        border-radius: 6px;
        border: 1px solid rgba(0, 245, 255, 0.3);
    }
    .mineral-popup .maplibregl-popup-tip {
        border-top-color: rgba(2, 11, 24, 0.92);
        border-bottom-color: rgba(2, 11, 24, 0.92);
    }
`;

// Mineral markers array (name, type, color, coords)
// Row 1: 6 triangle + 7 circle = 13  |  Row 2: 5 rhombus + 8 star = 13  |  Row 3: 12 square
const MINERAL_MARKERS: { name: string; type: 'square' | 'triangle' | 'circle' | 'rhombus' | 'star'; color: string; coords: [number, number] }[] = [
    // Triangles (6)
    { name: 'Oltin',       type: 'triangle', color: GC.amber, coords: [64.6, 40.9] },
    { name: 'Kumush',      type: 'triangle', color: '#C0C0C0', coords: [67.3, 39.7] },
    { name: 'Platina',     type: 'triangle', color: '#E0E0E0', coords: [61.4, 41.5] },
    { name: 'Volfram',     type: 'triangle', color: GC.blue, coords: [60.9, 43.8] },
    { name: 'Molibden',    type: 'triangle', color: GC.violet, coords: [61.0, 42.5] },
    { name: 'Palladiy',    type: 'triangle', color: '#ADD8E6', coords: [63.2, 40.3] },
    // Circles (7)
    { name: 'Reniy',       type: 'circle',   color: GC.cyan, coords: [71.8, 40.1] },
    { name: 'Rodiy',       type: 'circle',   color: '#E0C8FF', coords: [65.1, 39.5] },
    { name: 'Indiy',       type: 'circle',   color: GC.red, coords: [67.7, 41.4] },
    { name: 'Galliy',      type: 'circle',   color: GC.cyan, coords: [68.4, 40.6] },
    { name: 'Tellurid',    type: 'circle',   color: GC.amber, coords: [64.9, 42.2] },
    { name: 'Selen',       type: 'circle',   color: GC.magenta, coords: [67.9, 41.0] },
    { name: 'Surma',       type: 'circle',   color: GC.magenta, coords: [68.9, 40.1] },
    // Rhombuses (5)
    { name: 'Litiy',       type: 'rhombus',  color: GC.amber, coords: [66.5, 40.2] },
    { name: 'Berilliy',    type: 'rhombus',  color: GC.amber, coords: [63.8, 39.2] },
    { name: 'Skandiy',     type: 'rhombus',  color: GC.magenta, coords: [70.1, 41.2] },
    { name: 'Stronsiy',    type: 'rhombus',  color: GC.accent1, coords: [62.5, 41.7] },
    { name: 'Vismut',      type: 'rhombus',  color: GC.cyan, coords: [72.0, 40.5] },
    // Stars (8)
    { name: 'Rubidiy',     type: 'star',     color: GC.magenta, coords: [69.0, 41.3] },
    { name: 'Sesiy',       type: 'star',     color: GC.cyan, coords: [68.9, 32.5] },
    { name: 'Lantan',      type: 'star',     color: GC.magenta, coords: [65.8, 38.8] },
    { name: 'Seriy',       type: 'star',     color: GC.amber, coords: [68.2, 38.9] },
    { name: 'Neodim',      type: 'star',     color: GC.accent1, coords: [71.5, 40.6] },
    { name: 'Erbiy',       type: 'star',     color: GC.red, coords: [63.5, 41.8] },
    { name: 'Ytterbiy',    type: 'star',     color: GC.accent3, coords: [60.6, 43.1] },
    { name: 'Gadoliniy',   type: 'star',     color: GC.violet, coords: [70.7, 41.5] },
    // Squares (12)
    { name: 'Temir',       type: 'square',   color: '#8B8B8B', coords: [60.6, 41.3] },
    { name: 'Mis',         type: 'square',   color: GC.amber, coords: [69.3, 40.8] },
    { name: 'Rux',         type: 'square',   color: GC.blue, coords: [67.8, 38.6] },
    { name: "Qo'rg'oshin", type: 'square',   color: GC.slate, coords: [70.5, 40.5] },
    { name: 'Alyuminiy',   type: 'square',   color: GC.blue, coords: [65.4, 41.8] },
    { name: 'Nikel',       type: 'square',   color: GC.accent3, coords: [58.5, 43.2] },
    { name: 'Xrom',        type: 'square',   color: GC.accent4, coords: [62.1, 40.5] },
    { name: 'Marganes',    type: 'square',   color: GC.amber, coords: [64.4, 40.1] },
    { name: 'Kobalt',      type: 'square',   color: GC.cyan, coords: [66.9, 38.1] },
    { name: 'Titan',       type: 'square',   color: GC.magenta, coords: [71.2, 40.7] },
    { name: 'Vanadiy',     type: 'square',   color: GC.blue, coords: [60.8, 42.9] },
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
    /* Modellar Draco bilan siqilgan. Dekoder `public/draco/` dan olinadi —
       drei'ning standarti Google CDN (gstatic.com) bo'lib, ilova internetsiz
       tarmoqda ishlaganda model yuklanishi jimgina osilib qolardi. */
    const gltf = useGLTF(modelPath, DRACO_DECODER_PATH) as any;
    const clonedScene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
    const ref = useRef<THREE.Group>(null);
    // useFrame o'rniga oddiy useEffect yoki alternativ ishlatish kerak, chunki bu erda Canvas Modal ichida
    return (
        <group ref={ref} scale={zoom}>
            <primitive object={clonedScene} scale={0.35} />
        </group>
    );
};

/* ── Marker modallari uchun umumiy kichik qismlar ─────────────────────────
   3 ta obyekt turi (factory/geology/invest) uchun 3 xil ko'rinishdagi modal
   quyida alohida-alohida yozilgan; faqat qator/chip kabi eng kichik
   qismlar shu yerda umumlashtirilgan. */
const closeBtnStyle: React.CSSProperties = {
    width: '32px', height: '32px', border: '1px solid rgba(255,255,255,0.35)',
    background: 'rgba(255,255,255,0.12)', color: 'white', borderRadius: '8px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
};

const InfoRow: React.FC<{ label: string; value?: React.ReactNode; valueColor?: string }> = ({ label, value, valueColor }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <span style={{ color: GC.slate, fontSize: '13px', flexShrink: 0 }}>{label}:</span>
            <span style={{ fontWeight: 600, fontSize: '13px', textAlign: 'right', color: valueColor || '#e0f0ff' }}>{value}</span>
        </div>
    );
};

// Uzun erkin matn maydonlari uchun (masalan geologiya rejasi, invest xavflari) —
// InfoRow'ning qator (label: qiymat) shakli emas, label ustida, matn pastida.
const TextBlock: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div>
            <div style={{ color: GC.slate, fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
            <div style={{ fontSize: '13px', color: '#e0f0ff', lineHeight: 1.5 }}>{value}</div>
        </div>
    );
};

const ElementChips: React.FC<{ elements?: string[] | null; accent: string }> = ({ elements, accent }) => {
    if (!elements || elements.length === 0) return null;
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {elements.map((el, i) => (
                <span key={i} style={{ fontSize: '12px', fontWeight: 600, color: accent, border: `1px solid ${accent}`, borderRadius: '4px', padding: '3px 10px' }}>{el}</span>
            ))}
        </div>
    );
};

const Card: React.FC<{ title: string; titleColor: string; borderColor: string; children: React.ReactNode }> = ({ title, titleColor, borderColor, children }) => (
    <div style={{ background: GC.panelBg, padding: '14px', height: "100%",  borderRadius: '8px', border: `1px solid ${borderColor}` }}>
        <div style={{ marginBottom: '10px', color: titleColor, fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{children}</div>
    </div>
);

// `paybackYears`/`irrShare`/`npvMlnUsd`/`annualOutputQty` kabi "ikki qavatli"
// maydonlar uchun: son bo'lsa formatlanadi, bo'lmasa mos *Text ("ТИАда
// аниқланади" kabi aniq izoh) ko'rsatiladi — bo'sh katak emas.
const numOrText = (num: number | null | undefined, text: string | null | undefined, format?: (n: number) => string): string | undefined => {
    if (num != null) return format ? format(num) : String(num);
    if (text) return text;
    return undefined;
};

// `coordsSource === 'linked'` bo'lganda ko'rsatiladigan shaffoflik ogohlantirishi —
// MAP_API'ga ko'ra bu "ochiq belgilanishi shart": nuqta zavoddan meros
// qilingan, ya'ni taxminiy joylashuv.
const LinkedCoordsNotice: React.FC<{ linkedFrom?: string | null }> = ({ linkedFrom }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px',
        color: GC.amber, background: alpha(GC.amber, 0.1), border: `1px solid ${alpha(GC.amber, 0.3)}`,
        borderRadius: '4px', padding: '5px 9px', marginTop: '6px',
    }}>
        <span>⚠</span>
        <span>Taxminiy joylashuv{linkedFrom ? ` — ${linkedFrom} dan meros qilingan` : ''}</span>
    </div>
);

const LINK_TYPE_LABEL: Record<string, string> = { factory: 'Sanoat', geology: 'Geologiya', invest: 'Investitsiya' };

// Obyektga bog'langan boshqa elementlar (ikki tomonlama havolalar, `links[]`).
const LinkedItemsCard: React.FC<{ links?: MapLinkRef[]; accent: string }> = ({ links, accent }) => {
    if (!links || links.length === 0) return null;
    return (
        <Card title="Bog'langan loyihalar" titleColor={accent} borderColor={alpha(accent, 0.2)}>
            {links.map((l, i) => (
                <div key={`${l.type}-${l.id}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '12px', color: '#e0f0ff' }}>
                        <span style={{ color: SOURCE_UI_ACCENT[l.type] || GC.slate, fontWeight: 700 }}>{LINK_TYPE_LABEL[l.type] || l.type}: </span>
                        {l.name || l.id}
                    </span>
                    <span style={{ fontSize: '10px', color: l.confidence === 'exact' ? GC.accent1 : GC.slate, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {l.confidence === 'exact' ? 'aniq' : 'taxminiy'}
                    </span>
                </div>
            ))}
        </Card>
    );
};

/* ── FACTORY modali — geology/invest bilan bir xil to'liq ekran ("dashboard")
   ko'rinishi. `/map/objects`dagi haqiqiy maydonlar (nom, hudud, obyekt turi,
   bajarilish %, muhimlik) bor joyda ishlatiladi, qolgani hozircha demo —
   shu sabab 2/3/4-kartalar sariq ramkali. Pastdagi "Sexlar ro'yxati"dan
   birortasini bossa ustiga yana bir (sex tafsiloti) modal ochiladi. ── */
const FACTORY_STATUS_LABEL: Record<string, string> = {
    REGISTRATION: "Ro'yxatdan o'tgan",
    CONSTRUCTION: 'Qurilmoqda',
    STARTED: 'Ishlab turibdi',
};

const DEMO_FACTORY_KPI: { label: string; value: string; unit?: string; delta?: string }[] = [
    { label: 'Qabul qilingan ruda', value: '4 820', unit: 't/kun', delta: '+2.4%' },
    { label: 'Qayta ishlangan ruda', value: '4 360', unit: 't/kun', delta: '+1.8%' },
    { label: 'Volfram kontsentrati', value: '286', unit: 't', delta: '+3.1%' },
    { label: 'Ajratib olish', value: '87.6', unit: '%', delta: '+0.6%' },
    { label: 'OPEX', value: '124', unit: 'ming $/kun', delta: '-4.1%' },
    { label: '1 tonna tannarx', value: '28.4', unit: '$', delta: '-3.6%' },
    { label: "Energiya sig'imi", value: '214', unit: 'kWh/t', delta: '-2.5%' },
    { label: 'Suv sarfi', value: '1.86', unit: 'm³/t', delta: '+1.9%' },
];

const DEMO_ORE_MONTHLY = [120, 128, 132, 140, 145, 150, 158, 162, 168, 172, 178, 182];
const DEMO_CONC_MONTHLY = [78, 82, 85, 90, 93, 96, 100, 103, 107, 110, 113, 116];
const DEMO_WEEK_DAYS = ['28.08', '29.08', '30.08', '31.08', '01.09', '02.09', '03.09'];
const DEMO_WEEK_ORE = [4700, 4750, 4800, 4820, 4790, 4810, 4820];
const DEMO_WEEK_CONC = [280, 282, 284, 286, 283, 285, 286];

const DEMO_OPEX_BREAKDOWN = [
    { label: 'Energiya', pct: 42, color: GC.accent1 },
    { label: 'Reagentlar', pct: 26, color: GC.amber },
    { label: 'Ish haqi', pct: 14, color: GC.violet },
    { label: 'Servis', pct: 11, color: GC.accent3 },
    { label: 'Boshqa', pct: 7, color: GC.slate },
];

const DEMO_SECTION_PLAN_FACT = [
    { name: 'Maydalash', plan: 1200, fact: 1140, pct: 95 },
    { name: 'Tegirmon', plan: 1100, fact: 1015, pct: 92 },
    { name: 'Flotatsiya', plan: 780, fact: 725, pct: 93 },
    { name: 'Filtrlash', plan: 420, fact: 398, pct: 95 },
    { name: 'Qadoqlash', plan: 300, fact: 282, pct: 94 },
];

const DEMO_FACTORY_CAMERAS = [
    { code: 'KAM-01', label: 'Kirish darvozasi' },
    { code: 'KAM-02', label: 'Flotatsiya sexi' },
    { code: 'KAM-03', label: 'Tayyor mahsulot ombori' },
    { code: 'KAM-04', label: 'Umumiy hudud' },
];

const DEMO_FACTORY_STAFF_STATS: { label: string; value: string; warn?: boolean }[] = [
    { label: 'Maydondagi xodimlar', value: '146' },
    { label: 'Bugun kirganlar', value: '392' },
    { label: 'Bugun chiqqanlar', value: '374' },
    { label: 'Faol propusklar', value: '158' },
    { label: 'Xavfli zonadagi xodimlar', value: '4', warn: true },
    { label: 'Pudratchilar', value: '12' },
];

const DEMO_FACTORY_STAFF_COMPOSITION = [
    { label: 'Ishlab chiqarish', pct: 52, color: GC.accent1 },
    { label: 'Texnik xizmat', pct: 18, color: GC.amber },
    { label: "Ma'muriy", pct: 12, color: GC.violet },
    { label: 'Xavfsizlik', pct: 8, color: GC.red },
    { label: 'Boshqa', pct: 10, color: GC.slate },
];

const DEMO_FACTORY_ENTRY = [370, 380, 375, 390, 385, 392, 392];
const DEMO_FACTORY_EXIT = [355, 365, 360, 372, 368, 374, 374];

const DEMO_FACTORY_SKUD_EVENTS = [
    { time: '14:24', staff: 'M. Karimov', event: 'Kirish (RFID)' },
    { time: '14:18', staff: 'S. Tursunov', event: 'Chiqish (RFID)' },
    { time: '14:12', staff: 'A. Qudratov', event: 'Kirish (QR)' },
    { time: '14:05', staff: 'N. Saidova', event: 'Kirish (RFID)' },
    { time: '13:57', staff: 'D. Xolikov', event: 'Chiqish (RFID)' },
];

const DEMO_FACTORY_AI_EVENTS: { time: string; text: string; status: string; level: keyof typeof AI_LEVEL_COLOR }[] = [
    { time: '14:20', text: 'PPE qoidasi buzilishi', status: "Ko'rib chiqilmoqda", level: 'warn' },
    { time: '13:48', text: 'Ruxsatsiz zona kirish', status: 'Aniqlangan', level: 'warn' },
    { time: '12:16', text: "Texnika to'xtashi", status: 'Bartaraf etildi', level: 'ok' },
    { time: '10:52', text: 'Tutun aniqlangan', status: "Yolg'on signal", level: 'muted' },
];

const SEX_STATUS_META: Record<'active' | 'maintenance' | 'idle', { label: string; color: string }> = {
    active: { label: 'Ishlab turibdi', color: GC.green },
    maintenance: { label: 'Texnik xizmat', color: GC.amber },
    idle: { label: "To'xtab turibdi", color: GC.slate },
};

// `raw` — API'dan kelgan xom obyekt (bo'lsa), SexDetailModal'da qo'shimcha
// maydonlarni (manager, shiftMode va h.k.) pickField orqali o'qish uchun.
type SexListItem = { id: string; label: string; status: keyof typeof SEX_STATUS_META; utilization: number; staff: number; raw?: any };

const SEX_NAMES = ['Maydalash', 'Tegirmon', 'Flotatsiya', 'Filtrlash', 'Quritish', 'Qadoqlash', 'Boyitish-1', 'Boyitish-2', 'Reagent', 'Nasos stansiyasi', 'Ombor', 'Energiya bloki'];
const DEMO_SEX_LIST: SexListItem[] = SEX_NAMES.map((name, i) => ({
    id: `sex-${i + 1}`,
    label: name,
    status: i === 3 ? 'maintenance' : i === 10 ? 'idle' : 'active',
    utilization: 74 + ((i * 7) % 24),
    staff: 14 + ((i * 5) % 26),
}));

// Xom holat matnini (API'dan qanday kelishi noma'lum) uchta bilinigan
// toifaga moslaydi — hech biriga to'g'ri kelmasa "ishlab turibdi" deb olinadi.
const normalizeSexStatus = (raw: any): keyof typeof SEX_STATUS_META => {
    if (raw === false) return 'idle';
    const s = String(raw ?? '').toUpperCase();
    if (/(MAINT|TEXNIK|XIZMAT|REPAIR|TA'MIR)/.test(s)) return 'maintenance';
    if (/(IDLE|STOP|INACTIVE|TO'XTA|TOXTA|OFF)/.test(s)) return 'idle';
    return 'active';
};

// `/factory/:id` javobidagi sexlar/uchastkalar ro'yxatini o'qiydi — maydon
// nomi hali hujjatlashtirilmagan, shu sabab bir nechta ehtimoliy kalit va
// har bir element uchun bir nechta ehtimoliy nom moslashuvchan sinaladi
// (geology/invest modallaridagi kabi). Mos massiv topilmasa `null` qaytadi —
// shunda chaqiruvchi tomon DEMO_SEX_LIST bilan namuna ko'rsatadi.
const readFactorySexList = (detail: any): SexListItem[] | null => {
    const rawList = pickField(detail, ['sexes', 'shops', 'workshops', 'sections', 'departments', 'sexList', 'shopFloors', 'factoryShops', 'units']);
    if (!Array.isArray(rawList) || rawList.length === 0) return null;
    return rawList.map((s: any, i: number) => ({
        id: String(pickField(s, ['id', 'sexId', 'code']) ?? `sex-${i + 1}`),
        label: pickField(s, ['name', 'label', 'title', 'sexName']) ?? `Sex-${i + 1}`,
        status: normalizeSexStatus(pickField(s, ['status', 'state'])),
        utilization: (() => {
            const v = pickField(s, ['utilization', 'workPercent', 'loadPercent', 'work_persent']);
            return typeof v === 'number' ? v : 80;
        })(),
        staff: (() => {
            const v = pickField(s, ['staff', 'staffCount', 'employeeCount', 'totalStaff']);
            return typeof v === 'number' ? v : 20;
        })(),
        raw: s,
    }));
};

const IconFactorySmall = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 21V10.5l4.5 3V10.5l4.5 3V10.5l4.5 3V21H3z" fill="currentColor" />
        <rect x="3" y="19.5" width="16.5" height="1.6" fill="currentColor" />
    </svg>
);
const IconPersonSmall = () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

/* ── Sex (ichki bo'lim) tafsiloti — factory modali ustiga ochiladigan
   ikkinchi qatlam modal, 4 ga bo'lingan: chap-tepa ma'lumotlar, o'ng-tepa
   ko'rsatkichlar, chap-past rasmi, o'ng-past kameralar. To'liq demo. ── */
const SexDetailModal: React.FC<{ sex: SexListItem; onClose: () => void }> = ({ sex, onClose }) => {
    const titleColor = GC.accent2;
    // `sex.raw` faqat API'dan (`/factory/:id`) haqiqiy sexlar ro'yxati kelganda
    // to'ladi — shunda mos maydon topilsa haqiqiy qiymat, topilmasa (yoki
    // butunlay demo elementda) "namuna" belgili standart qiymat ko'rsatiladi.
    const field = (keys: string[], fallback: string): { value: string; demo: boolean } => {
        const v = pickField(sex.raw, keys);
        return v != null && v !== '' ? { value: String(v), demo: false } : { value: fallback, demo: true };
    };
    const type = field(['type', 'category', 'kind'], "Ishlab chiqarish bo'limi");
    const launchYear = field(['launchYear', 'startYear', 'commissionedYear'], '2021');
    const shiftMode = field(['shiftMode'], '3 smena, 24/7');
    const manager = field(['manager', 'responsiblePerson', 'head'], '—');
    const lastInspection = field(['lastInspection', 'lastTxh', 'lastMaintenance'], '15.02.2026');
    const outputVolume = field(['outputVolume', 'productionVolume', 'volume'], '410');
    const efficiency = field(['efficiency', 'productivity'], '92.4');
    const energyUsage = field(['energyUsage', 'powerUsage'], '38');
    const faults = field(['faults', 'issues', 'incidents'], '1');
    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 900000001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div onClick={(e) => e.stopPropagation()} style={{
                width: '96vw', maxWidth: '1470px', maxHeight: '94vh', background: '#020B18',
                border: `1px solid ${alpha(GC.amber, 0.45)}`, borderRadius: '12px', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', color: '#e0f0ff', boxShadow: '0 0 50px rgba(0,0,0,0.6)',
            }}>
                <div style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${alpha(titleColor, 0.3)}`, background: `linear-gradient(90deg, ${alpha(titleColor, 0.25)}, #020B18)` }}>
                    <div>
                        <div style={{ fontSize: '11px', letterSpacing: '2px', color: titleColor, fontWeight: 700 }}>SEX TAFSILOTI</div>
                        <h3 style={{ margin: '3px 0 0', fontSize: '24px', fontWeight: 700, color: '#fff' }}>{sex.label}</h3>
                    </div>
                    <button onClick={onClose} style={closeBtnStyle}>✕</button>
                </div>
                <div style={{ flex: 1, overflow: 'auto', padding: '22px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', gap: '18px', minHeight: 0 }}>
                    <Card title="Ma'lumotlar" titleColor="#ffffff" borderColor={alpha(GC.amber, 0.4)}>
                        <PassportRow label="Sex nomi" value={sex.label} />
                        <PassportRow label="Turi" value={type.value} />
                        <PassportRow label="Ishga tushirilgan" value={launchYear.value} />
                        <PassportRow label="Xodimlar soni" value={sex.staff} />
                        <PassportRow label="Smena rejimi" value={shiftMode.value} />
                        <PassportRow label="Mas'ul shaxs" value={manager.value} />
                        <PassportRow label="Holati" value={SEX_STATUS_META[sex.status].label} />
                        <PassportRow label="Oxirgi TXH" value={lastInspection.value} />
                    </Card>
                    <Card title="Ko'rsatkichlar" titleColor="#ffffff" borderColor={alpha(GC.amber, 0.4)}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            <KpiTile label="Ishlab chiqarish hajmi" value={outputVolume.value} unit="t/kun" delta="+1.8%" demo={outputVolume.demo} />
                            <KpiTile label="Unumdorlik" value={efficiency.value} unit="%" delta="+0.4%" demo={efficiency.demo} />
                            <KpiTile label="Energiya sarfi" value={energyUsage.value} unit="kWh/t" delta="-1.2%" demo={energyUsage.demo} />
                            <KpiTile label="Nosozliklar" value={faults.value} demo={faults.demo} />
                        </div>
                    </Card>
                    <ImageFillCard title="Sex rasmi" accent={titleColor} src={`/imgs/factory/${sex.label.toLowerCase()}.jpg`} icon={<Icon3DCube />} />
                    <div style={{ minHeight: 0 }}>
                        <SubPanel title="Kameralar" minWidth={260} demo>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                {DEMO_FACTORY_CAMERAS.map((c, i) => (
                                    <div key={i} style={{ position: 'relative', height: '92px', borderRadius: '6px', overflow: 'hidden', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                                            <IconCamSmall />
                                        </div>
                                        <span style={{ position: 'absolute', top: 4, left: 5, fontSize: '8.5px', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>{c.code}</span>
                                    </div>
                                ))}
                            </div>
                        </SubPanel>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Sex kartasi — "Sexlar ro'yxati" bo'limidagi har bir bo'lim uchun: nomi,
// joriy holati (rang bilan), yuklama % (progress) va smenadagi xodimlar soni.
// Bosilganda SexDetailModal ochiladi.
const SexCard: React.FC<{ sex: SexListItem; accent: string; onClick: () => void }> = ({ sex, accent, onClick }) => {
    const meta = SEX_STATUS_META[sex.status];
    const [hover, setHover] = React.useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '9px',
                padding: '11px 12px', borderRadius: '8px', cursor: 'pointer', font: 'inherit',
                background: GC.cardBg,
                border: `1px solid ${hover ? accent : GC.border}`,
                transform: hover ? 'translateY(-2px)' : 'none',
                transition: 'background 0.15s ease, border-color 0.15s ease, transform 0.15s ease',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sex.label}</span>
                <StatusDot color={meta.color} />
            </div>
            <span style={{ fontSize: '9.5px', color: meta.color, fontWeight: 600 }}>{meta.label}</span>
            <div>
                <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ width: `${sex.utilization}%`, height: '100%', background: accent, borderRadius: '2px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '9px', color: GC.slate }}>
                    <span>Yuklama</span>
                    <span style={{ color: '#dfe9f5', fontWeight: 700 }}>{sex.utilization}%</span>
                </div>
            </div>
            <span style={{ fontSize: '9.5px', color: GC.slate }}>{sex.staff} xodim smenada</span>
        </button>
    );
};

const FactoryFullScreenModal: React.FC<{ object: MapItem; onClose: () => void }> = ({ object, onClose }) => {
    const titleColor = GC.accent2; // #00213F juda to'q — UI uchun ochroq ko'k ishlatiladi
    const staticDetail = (object.detail || {}) as MapFactoryDetail;
    // `/map/objects` dagi `id` — "factory-12" ko'rinishida; `/factory/:id`
    // haqiqiy zavod raqamini kutadi, shu sababli prefiks olib tashlanadi.
    const rawId = staticDetail.factoryId ?? String(object.id).replace(/^factory-/, '');
    const { data: fullDetailRaw, isLoading: detailLoading, isError: detailIsError } = useGetFactoryDetail(rawId, 'uz');
    // To'liq javob kelguncha ham modal darhol `/map/objects`dagi qisqa ma'lumot bilan to'ladi;
    // to'liq javob kelgach ustiga qo'shiladi (mavjud maydonlar ustiga yoziladi).
    const detail: any = { ...staticDetail, ...(fullDetailRaw || {}) };
    const [selectedSex, setSelectedSex] = React.useState<SexListItem | null>(null);
    // `/factory/:id` javobida sexlar ro'yxati topilsa — haqiqiy ma'lumot;
    // topilmasa (maydon hali API'da yo'q) — DEMO_SEX_LIST bilan "namuna" ko'rsatiladi.
    const realSexList = readFactorySexList(detail);
    const sexList = realSexList ?? DEMO_SEX_LIST;
    const sexListIsDemo = realSexList === null;

    const projectCode = pickField(detail, ['projectCode', 'code']) || `OPR-${detail.factoryId ?? object.id}`;
    const statusLabel = object.status ? (FACTORY_STATUS_LABEL[object.status] || object.status) : null;
    const isImportant = detail.importance === 'HIGH' || !!detail.importanceRaw;
    const lastUpdatedText = React.useMemo(() => new Date().toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }), []);
    const workPercentValue = detail.workPercent != null ? detail.workPercent : 94.8;
    const workPercentIsDemo = detail.workPercent == null;

    return (
        <div style={{
            position: 'fixed', top: FULLSCREEN_TOP_OFFSET, left: 0, right: 0, bottom: 0, zIndex: 900000000,
            background: '#020B18', display: 'flex', flexDirection: 'column', color: '#e0f0ff', overflow: 'hidden',
            borderTop: `1px solid ${alpha(titleColor, 0.4)}`,
        }}>
            {/* Breadcrumb */}
            <div style={{ padding: '7px 24px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <IconHomeSmall />
                <span>TMK</span>
                <span>›</span>
                <span>Interaktiv xarita</span>
                <span>›</span>
                <span style={{ color: 'rgba(255,255,255,0.75)' }}>Obyekt tafsiloti</span>
            </div>

            {/* Header */}
            <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: `1px solid ${alpha(titleColor, 0.3)}`, background: `linear-gradient(90deg, ${alpha(titleColor, 0.25)}, #020B18)`, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>{object.name || detail.enterpriseName || 'Zavod'}</h2>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', padding: '3px 8px', borderRadius: '5px', whiteSpace: 'nowrap' }}>{projectCode}</span>
                    {statusLabel && <StatusPill color={GC.green} text={statusLabel} />}
                    <StatusPill color={GC.accent1} text="Onlayn monitoring" />
                    {isImportant && <StatusPill color={GC.amber} text="Muhim obyekt" />}
                    {object.coordsSource === 'linked' && <LinkedCoordsNotice linkedFrom={object.linkedFrom} />}
                </div>
                <button onClick={onClose} style={closeBtnStyle}>✕</button>
            </div>
            {/* Holat lentasi — bosh sahifaning "hero" o'qish nuqtasi: zavod
                shu daqiqada qanday ishlayotgani bitta qarashda ko'rinadi. */}
            <div style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusDot color={statusLabel ? GC.green : GC.slate} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#dfe9f5' }}>{statusLabel || "Holati noma'lum"}</span>
                </div>
                <span style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.08)' }} />
                <div>
                    <div style={{ fontSize: '10px', color: GC.slate }}>Bugungi konsentrat</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
                        286<span style={{ fontSize: '12px', fontWeight: 600, color: GC.slate, marginLeft: '4px' }}>t</span>
                        <span style={{ fontSize: '7px', fontWeight: 700, color: GC.amber, marginLeft: '6px', verticalAlign: 'top' }}>namuna</span>
                    </div>
                </div>
                <span style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.08)' }} />
                <div>
                    <div style={{ fontSize: '10px', color: GC.slate }}>Reja bajarilishi</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                        {workPercentValue}%
                        {workPercentIsDemo && <span style={{ fontSize: '7px', fontWeight: 700, color: GC.amber, marginLeft: '5px' }}>namuna</span>}
                    </div>
                </div>
                <span style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.08)' }} />
                <div>
                    <div style={{ fontSize: '10px', color: GC.slate }}>Ochiq nosozliklar</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: GC.amber }}>3<span style={{ fontSize: '7px', fontWeight: 700, marginLeft: '5px' }}>namuna</span></div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Oxirgi yangilanish: {lastUpdatedText}</span>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gridTemplateRows: 'auto auto', gap: '14px' }}>
                    {/* Obyekt pasporti */}
                    <div style={{ gridColumn: '1', gridRow: '1' }}>
                        <Card title="Obyekt pasporti" titleColor="#ffffff" borderColor={alpha(titleColor, 0.3)}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                                <div>
                                    <PassportRow label="Obyekt nomi" value={object.name} />
                                    <PassportRow label="Obyekt turi" value={detail.objectType} />
                                    <PassportRow label="Joylashuv" value={object.region} />
                                    <PassportRow label="Ishga tushirilgan yil" value={pickField(detail, ['startYear', 'launchYear']) || '2021'} />
                                    <PassportRow label="Loyiha quvvati" value={pickField(detail, ['capacity']) || '1,6 mln t/yil ruda'} />
                                    <PassportRow label="Joriy yuklama" value={pickField(detail, ['currentLoad']) || '92%'} />
                                    <PassportRow label="Asosiy mahsulot" value={pickField(detail, ['mainProduct']) || (object.elements?.length ? object.elements.join(', ') : 'Volfram kontsentrati')} />
                                    <PassportRow label="Qo'shimcha mahsulot" value={pickField(detail, ['byProduct']) || 'Molibden aralash mahsuloti'} />
                                    <PassportRow label="Boshqaruvchi bo'linma" value={detail.enterpriseName || 'Boyitish direksiyasi'} />
                                    <PassportRow label="Smena rejimi" value={pickField(detail, ['shiftMode']) || '3 smena, 24/7'} />
                                </div>
                                <div>
                                    <PassportRow label="Jami xodimlar" value={pickField(detail, ['totalStaff']) || '428'} />
                                    <PassportRow label="Hozir smenada" value={pickField(detail, ['onShiftStaff']) || '146'} />
                                    <PassportRow label="Asosiy uskunalar" value={pickField(detail, ['equipment']) || 'maydalagichlar, tegirmonlar, flotatsiya bloklari, nasoslar, filtrlash uskunalari'} />
                                    <PassportRow label="Elektr talabi" value={pickField(detail, ['powerDemand']) || '18,4 MW'} />
                                    <PassportRow label="Suv talabi" value={pickField(detail, ['waterDemand']) || '520 m³/soat'} />
                                    <PassportRow label="Ombor zaxirasi" value={pickField(detail, ['stockDays']) || '18 kun'} />
                                    <PassportRow label="Xavf toifasi" value={pickField(detail, ['hazardClass']) || "O'rta"} />
                                    <PassportRow label="Aloqa holati" value="Barqaror" />
                                    <PassportRow label="Obyekt rahbari" value={pickField(detail, ['manager']) || 'B. Raximov'} />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Ishlab chiqarish va sarf-xarajatlar holati */}
                    <div style={{ gridColumn: '2', gridRow: '1' }}>
                        <Card title="Ishlab chiqarish va sarf-xarajatlar holati" titleColor="#ffffff" borderColor={alpha(GC.amber, 0.4)}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                {DEMO_FACTORY_KPI.map((t, i) => <KpiTile key={i} {...t} demo />)}
                                <KpiTile label="Reja bajarilishi" value={detail.workPercent != null ? String(detail.workPercent) : '94.8'} unit="%" delta="+2.2%" demo={detail.workPercent == null} />
                                <KpiTile label="Ochiq nosozliklar" value="3" demo />
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                <SubPanel title="Oylar kesimida ishlab chiqarish dinamikasi" minWidth={170} demo>
                                    <DualBarChart seriesA={DEMO_ORE_MONTHLY} seriesB={DEMO_CONC_MONTHLY} labels={DEMO_MONTHS} colorA={GC.accent1} colorB={GC.green} height={58} />
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '8.5px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dfe9f5' }}><StatusDot color={GC.accent1} />Ruda</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dfe9f5' }}><StatusDot color={GC.green} />Konsentrat</span>
                                    </div>
                                </SubPanel>
                                <SubPanel title="So'nggi 7 kunlik ishlab chiqarish" minWidth={170} demo>
                                    <DualBarChart seriesA={DEMO_WEEK_ORE} seriesB={DEMO_WEEK_CONC} labels={DEMO_WEEK_DAYS} colorA={GC.accent1} colorB={GC.green} height={58} />
                                </SubPanel>
                                <SubPanel title="Xarajatlar tarkibi (OPEX)" minWidth={170} demo>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <DonutChart segments={DEMO_OPEX_BREAKDOWN} centerValue="$124" centerLabel="ming/kun" size={88} />
                                        <DonutLegend segments={DEMO_OPEX_BREAKDOWN} />
                                    </div>
                                </SubPanel>
                                <SubPanel title="Reja va fakt (uchastkalar kesimida)" minWidth={210} demo>
                                    <div style={{ display: 'flex', fontSize: '9px', color: GC.slate, fontWeight: 700, marginBottom: '4px' }}>
                                        <span style={{ flex: 1 }}>Uchastka</span>
                                        <span style={{ width: '40px', textAlign: 'right' }}>Reja</span>
                                        <span style={{ width: '40px', textAlign: 'right' }}>Fakt</span>
                                        <span style={{ width: '34px', textAlign: 'right' }}>%</span>
                                    </div>
                                    {DEMO_SECTION_PLAN_FACT.map((s, i) => (
                                        <div key={i} style={{ display: 'flex', fontSize: '10px', alignItems: 'center', padding: '2px 0' }}>
                                            <span style={{ flex: 1, color: '#dfe9f5' }}>{s.name}</span>
                                            <span style={{ width: '40px', textAlign: 'right', color: GC.slate }}>{s.plan}</span>
                                            <span style={{ width: '40px', textAlign: 'right', color: '#fff' }}>{s.fact}</span>
                                            <span style={{ width: '34px', textAlign: 'right', color: s.pct >= 94 ? GC.green : GC.amber, fontWeight: 700 }}>{s.pct}%</span>
                                        </div>
                                    ))}
                                </SubPanel>
                            </div>
                            {detailLoading && <div style={{ fontSize: 11, color: GC.slate, marginTop: 10 }}>To'liq ma'lumot yuklanmoqda...</div>}
                        </Card>
                    </div>

                    {/* Obyekt 3D modeli */}
                    <div style={{ gridColumn: '1', gridRow: '2', display: 'flex', alignItems: 'flex-start', minWidth: 0 }}>
                        {/*<ImageFillCard title="Obyekt 3D modeli" accent={GC.amber} src={`/imgs/factory/${object.id}.jpg`} icon={<Icon3DCube />} />*/}
                        <FactoryModel embedded />
                    </div>

                    {/* Video, xodimlar va SKUD */}
                    <div style={{ gridColumn: '2', gridRow: '2', minHeight: 0 }}>
                        <Card title="Video, xodimlar va SKUD" titleColor="#ffffff" borderColor={alpha(GC.amber, 0.4)}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                                <SubPanel title="Onlayn kameralar" minWidth={230} demo>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                                        {DEMO_FACTORY_CAMERAS.map((c, i) => (
                                            <div key={i} style={{ position: 'relative', height: '58px', borderRadius: '6px', overflow: 'hidden', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                                                    <IconCamSmall />
                                                </div>
                                                <span style={{ position: 'absolute', top: 3, left: 4, fontSize: '7px', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>{c.code}</span>
                                            </div>
                                        ))}
                                    </div>
                                </SubPanel>
                                <SubPanel title="Asosiy ko'rsatkichlar" minWidth={160} demo>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {DEMO_FACTORY_STAFF_STATS.map((s, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                                <span style={{ color: GC.slate }}>{s.label}</span>
                                                <span style={{ color: s.warn ? GC.red : '#fff', fontWeight: 700 }}>{s.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </SubPanel>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                                <SubPanel title="Xodimlar tarkibi (bo'limlar kesimida)" minWidth={180} demo>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <DonutChart segments={DEMO_FACTORY_STAFF_COMPOSITION} centerValue={String(pickField(detail, ['totalStaff']) || '428')} centerLabel="jami" size={82} />
                                        <DonutLegend segments={DEMO_FACTORY_STAFF_COMPOSITION} />
                                    </div>
                                </SubPanel>
                                <SubPanel title="Kirish/chiqish dinamikasi (so'nggi 7 kun)" minWidth={180} demo>
                                    <DualBarChart seriesA={DEMO_FACTORY_ENTRY} seriesB={DEMO_FACTORY_EXIT} labels={DEMO_WEEK_DAYS} colorA={GC.accent1} colorB={GC.accent3} height={50} />
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '8.5px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dfe9f5' }}><StatusDot color={GC.accent1} />Kirish</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dfe9f5' }}><StatusDot color={GC.accent3} />Chiqish</span>
                                    </div>
                                </SubPanel>
                                <div style={{ flex: '1 1 150px', minWidth: '150px', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${alpha(GC.red, 0.35)}`, background: '#04101f', minHeight: '110px' }}>
                                    <div style={{ position: 'absolute', top: 6, left: 8, zIndex: 2, fontSize: '8px', fontWeight: 700, color: GC.amber, textTransform: 'uppercase' }}>namuna</div>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: alpha(GC.red, 0.5) }}>
                                        <IconPersonSmall />
                                    </div>
                                    <span style={{ position: 'absolute', top: 6, right: 6, fontSize: '9px', fontWeight: 700, color: '#fff', background: GC.red, borderRadius: '4px', padding: '2px 6px' }}>AI</span>
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(2,11,24,0.85)', padding: '5px 8px' }}>
                                        <div style={{ fontSize: '9px', fontWeight: 700, color: '#fff' }}>PPE qoidasi buzilishi</div>
                                        <div style={{ fontSize: '8px', color: GC.slate }}>Flotatsiya sexi</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                <SubPanel title="So'nggi SKUD hodisalari" minWidth={220} demo>
                                    {DEMO_FACTORY_SKUD_EVENTS.map((e, i) => (
                                        <div key={i} style={{ display: 'flex', fontSize: '9.5px', padding: '3px 0', borderBottom: i < DEMO_FACTORY_SKUD_EVENTS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap: '6px' }}>
                                            <span style={{ color: GC.slate, width: '32px', flexShrink: 0 }}>{e.time}</span>
                                            <span style={{ flex: 1, color: '#dfe9f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.staff}</span>
                                            <span style={{ color: e.event.startsWith('Kirish') ? GC.green : GC.amber, fontWeight: 600, flexShrink: 0 }}>{e.event}</span>
                                        </div>
                                    ))}
                                </SubPanel>
                                <SubPanel title="AI video hodisalari" minWidth={200} demo>
                                    {DEMO_FACTORY_AI_EVENTS.map((e, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9.5px', padding: '3px 0' }}>
                                            <StatusDot color={AI_LEVEL_COLOR[e.level]} />
                                            <span style={{ color: GC.slate, width: '30px', flexShrink: 0 }}>{e.time}</span>
                                            <span style={{ color: '#dfe9f5', flex: 1 }}>{e.text}</span>
                                            <span style={{ color: GC.slate, fontSize: '8.5px', flexShrink: 0 }}>{e.status}</span>
                                        </div>
                                    ))}
                                </SubPanel>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Sexlar ro'yxati */}
                <Card title="Sexlar ro'yxati" titleColor="#ffffff" borderColor={alpha(sexListIsDemo ? GC.amber : titleColor, 0.4)}>
                    {sexListIsDemo && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px' }}>
                            <span style={{ fontSize: '8px', fontWeight: 700, color: GC.amber, textTransform: 'uppercase', letterSpacing: '0.5px' }}>namuna</span>
                        </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(152px, 1fr))', gap: '10px' }}>
                        {sexList.map((s) => (
                            <SexCard key={s.id} sex={s} accent={titleColor} onClick={() => setSelectedSex(s)} />
                        ))}
                    </div>
                </Card>
            </div>

            {selectedSex && (
                <SexDetailModal sex={selectedSex} onClose={() => setSelectedSex(null)} />
            )}
        </div>
    );
};

/* ── GEOLOGY modali — to'liq ekran ("dashboard" ko'rinishi), faqat tepada
   ilova navbari ko'rinib turadi (FULLSCREEN_TOP_OFFSET). 5 ta karta:
   Loyiha Pasporti / Asosiy ko'rsatkichlar / Geologik ma'lumotlar /
   Loyiha 3D modeli / Geologik model. `/map/objects`dagi qisqa `detail` bilan
   darhol chiziladi, so'ng `GET /geology-projects/:id` orqali to'liq
   "pasport" ma'lumoti kelganda ustiga qo'shiladi (javob shakli hali to'liq
   hujjatlashtirilmagan — shuning uchun moslashuvchan o'qiladi). ── */
const FULLSCREEN_TOP_OFFSET = 100; // px — NavbarOverlay balandligiga mos (NavbarOverlay.css)

// Backend'dan turli nom bilan kelishi mumkin bo'lgan maydonni birinchi topilgani bo'yicha o'qiydi.
const pickField = (obj: any, keys: string[]): any => {
    if (!obj) return undefined;
    for (const k of keys) {
        if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
    }
    return undefined;
};

const PassportRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ color: GC.slate, fontSize: '14px', flexShrink: 0 }}>{label}</span>
        <span style={{ color: '#e7f1ff', fontSize: '14px', fontWeight: 600, textAlign: 'right' }}>{value ?? '—'}</span>
    </div>
);

const StatTile: React.FC<{ label: string; value: React.ReactNode; accent: string }> = ({ label, value, accent }) => (
    <div style={{ background: 'rgba(3,13,34,0.7)', border: `1px solid ${alpha(accent, 0.25)}`, borderRadius: '8px', padding: '10px 14px', minWidth: '120px', flex: '1 1 120px' }}>
        <div style={{ fontSize: '10px', color: GC.slate, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: accent, marginTop: '4px' }}>{value}</div>
    </div>
);

const Icon3DCube = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l8 4.6v10.8L12 22l-8-4.6V6.6L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M4 6.6L12 11l8-4.4M12 11v11" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
);

const IconStrata = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6h18M3 11h18M3 16h18M3 21h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M3 6l18 0M6 3v3M18 3v3" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    </svg>
);

// Karta ichini to'liq qoplaydigan rasm — hali rasm bo'lmasa (404) chiroyli
// ikonkali placeholder ko'rsatadi, siniq-rasm belgisi chiqmaydi.
const ImageFillCard: React.FC<{ title: string; accent: string; src: string; icon: React.ReactNode }> = ({ title, accent, src, icon }) => {
    const [errored, setErrored] = React.useState(false);
    return (
        <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${alpha(accent, 0.3)}`, background: `linear-gradient(145deg, ${alpha(accent, 0.12)}, #04101f)`, minHeight: '200px', height: '100%' }}>
            <div style={{ position: 'absolute', top: 10, left: 12, zIndex: 2, fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#ffffff', textTransform: 'uppercase', textShadow: '0 1px 6px rgba(0,0,0,0.85)' }}>{title}</div>
            {!errored ? (
                <img src={src} alt={title} onError={() => setErrored(true)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: alpha(accent, 0.7) }}>
                    {icon}
                    <span style={{ fontSize: '11px', color: GC.slate }}>Rasm hali yuklanmagan</span>
                </div>
            )}
        </div>
    );
};

/* ── "2. Asosiy ko'rsatkichlar" va "3. Geologik ma'lumotlar" uchun demo
   (namuna) ko'rsatkichlar — bunday darajadagi tafsilot hozircha API'da yo'q,
   shu sababli joylashuvni ko'rsatish uchun statik namuna bilan shakllantirilgan. ── */
const DEMO_MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
const DEMO_DRILLING = [18, 22, 25, 24, 29, 33, 36, 40, 43, 47, 45, 48];
const DEMO_SAMPLES = [90, 115, 140, 150, 168, 188, 205, 222, 238, 252, 262, 270];

const DEMO_KPI_TILES: { label: string; value: string; unit?: string; delta?: string }[] = [
    { label: 'Uchastka maydoni', value: '245.6', unit: 'km²', delta: '+12%' },
    { label: 'Prognoz zaxira', value: '520', unit: 'mln t', delta: '+8%' },
    { label: "Cu (o'rtacha)", value: '0.42', unit: '%', delta: '+5%' },
    { label: "Mo (o'rtacha)", value: '0.018', unit: '%', delta: '+6%' },
    { label: "Burg'ulash", value: '48.2', unit: 'ming m', delta: '+14%' },
    { label: 'Namunalar', value: '1 260', unit: 'ta', delta: '+11%' },
    { label: 'Tahlil natijalari', value: '892', unit: 'ta', delta: '+9%' },
    { label: 'Qamrov', value: '68', unit: '%', delta: '+7%' },
];

const DEMO_JORC = [
    { label: 'Measured (M)', pct: 22, color: GC.accent1 },
    { label: 'Indicated (I)', pct: 41, color: GC.accent2 },
    { label: 'Inferred (Inf)', pct: 28, color: GC.violet },
    { label: 'Potential (P)', pct: 9, color: GC.slate },
];

const DEMO_PROGRESS_SEGMENTS = [
    { label: 'Geologiya', pct: 70, color: GC.accent1 },
    { label: "Burg'ulash", pct: 62, color: GC.amber },
    { label: 'Tahlil', pct: 65, color: GC.violet },
    { label: 'Hisobot', pct: 45, color: GC.accent3 },
];
const DEMO_PROGRESS_OVERALL = 68;

const DEMO_MINERAL_COMPOSITION = [
    { label: 'Mis (Cu)', pct: 62, color: GC.accent1 },
    { label: 'Molibden (Mo)', pct: 18, color: GC.amber },
    { label: 'Oltin (Au)', pct: 8, color: '#E0C070' },
    { label: 'Kumush (Ag)', pct: 6, color: '#C7CDD6' },
    { label: 'Boshqalar', pct: 6, color: GC.slate },
];

const DEMO_GEOLOGIC_LAYERS = [
    { label: 'Qoplama qatlam', range: '5 – 50', pct: 12, color: GC.accent2 },
    { label: 'Oksidlanish zonasi', range: '50 – 200', pct: 18, color: GC.amber },
    { label: 'Sulfid zonasi', range: '200 – 600', pct: 35, color: GC.violet },
    { label: 'Ruda zonasi', range: '600 – 1000', pct: 25, color: GC.red },
    { label: 'Meta-sedimentlar', range: '1000 – 1200', pct: 10, color: GC.slate },
];

const DEMO_ANALYSIS_RESULTS: { element: string; value: string; unit: string; norm: string; trend: 'up' | 'down' | 'flat' }[] = [
    { element: 'Cu', value: '0.38', unit: '%', norm: '≥ 0.3', trend: 'up' },
    { element: 'Mo', value: '0.015', unit: '%', norm: '≥ 0.010', trend: 'up' },
    { element: 'Au', value: '0.28', unit: 'g/t', norm: '≥ 0.1', trend: 'up' },
    { element: 'Ag', value: '1.2', unit: 'g/t', norm: '≥ 1.0', trend: 'down' },
    { element: 'Zn', value: '0.05', unit: '%', norm: '< 0.2', trend: 'flat' },
    { element: 'Pb', value: '0.03', unit: '%', norm: '< 0.1', trend: 'down' },
];

// `demo` — bu sub-panel hali haqiqiy API maydoniga ega bo'lmagan, faqat
// joylashuvni ko'rsatish uchun namuna ma'lumot bilan chizilgan bo'lsa true.
// Shunda ramka sariq bo'ladi va burchakda kichik "namuna" belgisi chiqadi —
// foydalanuvchi qaysi widget hali demo ekanini bir qarashda ko'radi.
const SubPanel: React.FC<{ title: string; children: React.ReactNode; minWidth?: number; demo?: boolean }> = ({ title, children, minWidth = 170, demo }) => (
    <div style={{ flex: `1 1 ${minWidth}px`, minWidth, background: GC.cardBg, border: `1px solid ${demo ? alpha(GC.amber, 0.45) : GC.border}`, borderRadius: '8px', padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#dfe9f5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</div>
            {demo && <span style={{ fontSize: '8px', fontWeight: 700, color: GC.amber, textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>namuna</span>}
        </div>
        {children}
    </div>
);

const TrendArrow: React.FC<{ trend: 'up' | 'down' | 'flat' }> = ({ trend }) => {
    if (trend === 'up') return <span style={{ color: GC.green }}>▲</span>;
    if (trend === 'down') return <span style={{ color: GC.red }}>▼</span>;
    return <span style={{ color: GC.slate }}>—</span>;
};

const KpiTile: React.FC<{ label: string; value: string; unit?: string; delta?: string; demo?: boolean }> = ({ label, value, unit, delta, demo }) => {
    const isDown = !!delta && delta.trim().startsWith('-');
    return (
        <div style={{ background: GC.cardBg, border: `1px solid ${demo ? alpha(GC.amber, 0.45) : GC.border}`, borderRadius: '8px', padding: '10px 12px', flex: '1 1 108px', minWidth: '108px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                <div style={{ fontSize: '9.5px', color: GC.slate, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                {demo && <span style={{ fontSize: '7px', fontWeight: 700, color: GC.amber, flexShrink: 0 }}>namuna</span>}
            </div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                {value}{unit && <span style={{ fontSize: '10px', color: GC.slate, fontWeight: 500, marginLeft: '3px' }}>{unit}</span>}
            </div>
            {delta && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px', fontSize: '10px', color: isDown ? GC.red : GC.green, fontWeight: 700 }}>
                    {isDown ? (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 20L5 12h5V4h4v8h5l-7 8z" fill="currentColor" /></svg>
                    ) : (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M12 4l7 8h-5v8h-4v-8H5l7-8z" fill="currentColor" /></svg>
                    )}
                    {delta}
                </div>
            )}
        </div>
    );
};

const MiniBarChart: React.FC<{ data: number[]; labels: string[]; color: string }> = ({ data, labels, color }) => {
    const max = Math.max(...data) * 1.15;
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '64px' }}>
                {data.map((v, i) => (
                    <div key={i} title={`${labels[i]}: ${v}`} style={{ flex: 1, height: `${Math.max((v / max) * 100, 3)}%`, background: i === data.length - 1 ? color : alpha(color, 0.55), borderRadius: '2px 2px 0 0' }} />
                ))}
            </div>
            <div style={{ display: 'flex', gap: '3px', marginTop: '4px' }}>
                {labels.map((l, i) => (<div key={i} style={{ flex: 1, fontSize: '7px', color: GC.slate, textAlign: 'center' }}>{l}</div>))}
            </div>
        </div>
    );
};

// Ikki seriyali (Reja/Fakt, Kirish/Chiqish kabi) ustunli grafik — har bir
// nuqtada ikkita ustun yonma-yon, umumiy shkala bo'yicha (MiniBarChart'ning
// ikki seriyali varianti).
const DualBarChart: React.FC<{ seriesA: number[]; seriesB: number[]; labels: string[]; colorA: string; colorB: string; height?: number }> = ({ seriesA, seriesB, labels, colorA, colorB, height = 58 }) => {
    const max = Math.max(...seriesA, ...seriesB) * 1.12;
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: `${height}px` }}>
                {labels.map((l, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', gap: '2px', alignItems: 'flex-end', height: '100%' }}>
                        <div title={`${l}: ${seriesA[i]}`} style={{ flex: 1, height: `${Math.max((seriesA[i] / max) * 100, 3)}%`, background: colorA, borderRadius: '2px 2px 0 0' }} />
                        <div title={`${l}: ${seriesB[i]}`} style={{ flex: 1, height: `${Math.max((seriesB[i] / max) * 100, 3)}%`, background: colorB, borderRadius: '2px 2px 0 0' }} />
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                {labels.map((l, i) => (<div key={i} style={{ flex: 1, fontSize: '7px', color: GC.slate, textAlign: 'center' }}>{l}</div>))}
            </div>
        </div>
    );
};

const CategoryBarRow: React.FC<{ label: string; pct: number; color: string }> = ({ label, pct, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', marginBottom: '6px' }}>
        <span style={{ width: '76px', color: '#dfe9f5', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px' }} />
        </div>
        <span style={{ width: '30px', textAlign: 'right', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{pct}%</span>
    </div>
);

const DonutChart: React.FC<{ segments: { label: string; pct: number; color: string }[]; centerValue: string; centerLabel?: string; size?: number }> = ({ segments, centerValue, centerLabel, size = 104 }) => {
    const r = size / 2 - 12;
    const c = size / 2;
    const circumference = 2 * Math.PI * r;
    let acc = 0;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {segments.map((s, i) => {
                const len = (s.pct / 100) * circumference;
                const dashoffset = -acc;
                acc += len;
                return (
                    <circle key={i} cx={c} cy={c} r={r} fill="none" stroke={s.color} strokeWidth={13}
                        strokeDasharray={`${len} ${circumference - len}`} strokeDashoffset={dashoffset}
                        transform={`rotate(-90 ${c} ${c})`} />
                );
            })}
            <text x={c} y={c - 1} textAnchor="middle" fontSize={size * 0.17} fontWeight={700} fill="#fff">{centerValue}</text>
            {centerLabel && <text x={c} y={c + 15} textAnchor="middle" fontSize={size * 0.09} fill={GC.slate}>{centerLabel}</text>}
        </svg>
    );
};

const DonutLegend: React.FC<{ segments: { label: string; pct: number; color: string }[] }> = ({ segments }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {segments.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9.5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
                <span style={{ color: '#dfe9f5', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.label}</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{s.pct}%</span>
            </div>
        ))}
    </div>
);

const GeologyFullScreenModal: React.FC<{ object: MapItem; onClose: () => void }> = ({ object, onClose }) => {
    const accent = SOURCE_COLORS.geology;
    const staticDetail = (object.detail || {}) as MapGeologyDetail;
    // `/map/objects` dagi `id` — "geology-3" ko'rinishida; /geology-projects/:id
    // haqiqiy loyiha raqamini kutadi, shu sababli prefiks olib tashlanadi.
    const rawId = staticDetail.projectNo ?? String(object.id).replace(/^geology-/, '');
    const { data: fullDetailRaw, isLoading: detailLoading, isError: detailIsError } = useGetGeologyProjectDetail(rawId, 'uz');
    // To'liq javob kelguncha ham modal darhol `/map/objects`dagi qisqa ma'lumot bilan to'ladi;
    // to'liq javob kelgach ustiga qo'shiladi (mavjud maydonlar ustiga yoziladi).
    const detail: any = { ...staticDetail, ...(fullDetailRaw || {}) };

    const projectCode = pickField(detail, ['code', 'projectCode', 'licenseNumber']) || `GR-${detail.projectNo ?? object.id}`;

    return (
        <div style={{
            position: 'fixed', top: FULLSCREEN_TOP_OFFSET, left: 0, right: 0, bottom: 0, zIndex: 90000000000,
            background: '#020B18', display: 'flex', flexDirection: 'column', color: '#e0f0ff', overflow: 'hidden',
            borderTop: `1px solid ${alpha(accent, 0.4)}`,
        }}>
            {/* Header */}
           <div>
               <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: `1px solid ${alpha(accent, 0.3)}`, background: `linear-gradient(90deg, ${alpha(accent, 0.28)}, #020B18)`, flexWrap: 'wrap' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>

                       <img src="/icons/grricon.png" style={{width: 40, height: 40}} alt="."/>

                       <div>
                           <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 700, color: '#fff' }}>{object.name || detail.fullName || 'Geologiya loyihasi'}</h2>
                           <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>#{projectCode}{object.region ? ` · ${object.region}` : ''}</div>
                       </div>
                       {object.status && (
                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: alpha(GC.green, 0.15), border: `1px solid ${alpha(GC.green, 0.4)}`, color: GC.green, whiteSpace: 'nowrap' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                               {object.status}
                        </span>
                       )}
                       {pickField(detail, ['importance', 'priority', 'significance']) && (
                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: alpha(GC.amber, 0.15), border: `1px solid ${alpha(GC.amber, 0.4)}`, color: GC.amber, whiteSpace: 'nowrap' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                               {pickField(detail, ['importance', 'priority', 'significance'])}
                        </span>
                       )}
                       {object.coordsSource === 'linked' && <LinkedCoordsNotice linkedFrom={object.linkedFrom} />}
                   </div>
                   <button onClick={onClose} style={closeBtnStyle}>✕</button>
               </div>

               {/* Body — 1&3 chapda, 2 o'ngda-tepa, 4&5 o'ngda-pastda yonma-yon (dizayn maketiga mos) */}
               <div style={{
                   flex: 1, overflow: 'auto', padding: '16px 24px', display: 'grid',
                   gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto 1fr', gap: '16px', minHeight: 0,
               }}>
                   {/* 1. Loyiha Pasporti */}
                   <div style={{ gridColumn: '1', gridRow: '1' }}>
                       <Card title="1. Loyiha Pasporti" titleColor="#ffffff" borderColor={alpha(accent, 0.3)}>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 20px' }}>
                               <div>
                                   <PassportRow label="Obyekt nomi" value={object.name || detail.fullName} />
                                   <PassportRow label="Loyiha kodi" value={projectCode} />
                                   <PassportRow label="Joylashuvi" value={object.region} />
                                   <PassportRow label="Ma'muriy hudud" value={detail.district} />
                                   <PassportRow label="Loyiha turi" value={detail.category} />
                                   <PassportRow label="Foydali qazilma" value={detail.mineral || detail.metals} />
                                   <PassportRow label="Loyiha bosqichi" value={detail.groupName} />
                                   <PassportRow label="Litsenziya raqami" value={pickField(detail, ['licenseNumber', 'license_no', 'licenseNo'])} />
                                   <PassportRow label="Litsenziya muddati" value={pickField(detail, ['licenseValidity', 'licenseTerm'])} />
                               </div>
                               <div>
                                   <PassportRow label="Yo'nalish" value={detail.direction} />
                                   <PassportRow label="Hamkor tashkilot" value={detail.partner} />
                                   <PassportRow label="Moliyalashtirish" value={detail.funding} />
                                   <PassportRow label="Umumiy qiymati" value={object.costMlnUsd != null ? `$${object.costMlnUsd} mln` : undefined} />
                                   <PassportRow label="Tugash yili" value={detail.endYear} />
                                   <PassportRow label="Mas'ul rahbar" value={pickField(detail, ['manager', 'responsiblePerson'])} />
                                   <PassportRow label="Jamoa soni" value={pickField(detail, ['teamSize', 'staffCount'])} />
                                   <PassportRow label="So'nggi yangilanish" value={pickField(detail, ['updatedAt', 'lastUpdated'])} />
                                   <PassportRow label="Holati" value={object.status} />
                               </div>
                               <div>


                                   <PassportRow label="Mineral" value={detail.mineral} />
                                   <PassportRow label="Metallar" value={detail.metals} />
                                   <PassportRow label="Ruda zaxirasi" value={detail.oreReserve} />
                                   <PassportRow label="Metall zaxirasi" value={detail.metalReserve} />
                                   <PassportRow label="2026-yil rejasi" value={detail.plan2026} />
                                   <PassportRow label="Bajarildi" value={detail.done2026} />
                                   <PassportRow label="Natija" value={detail.result} />
                                   {/*<PassportRow label="Izoh" value={detail.note} /> */}
                               </div>
                           </div>
                       </Card>
                   </div>

                   {/* 2. Asosiy ko'rsatkichlar */}
                   <div style={{ gridColumn: '2', gridRow: '1' }}>
                       <Card title="2. Asosiy ko'rsatkichlar" titleColor="#ffffff" borderColor={alpha(GC.amber, 0.4)}>
                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                               {DEMO_KPI_TILES.map((t, i) => <KpiTile key={i} {...t} demo />)}
                           </div>
                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                               <SubPanel title="Burg'ulash hajmi (ming metr)" minWidth={150} demo>
                                   <MiniBarChart data={DEMO_DRILLING} labels={DEMO_MONTHS} color={GC.accent1} />
                               </SubPanel>
                               <SubPanel title="Geologik namunalar soni" minWidth={150} demo>
                                   <MiniBarChart data={DEMO_SAMPLES} labels={DEMO_MONTHS} color={GC.accent2} />
                               </SubPanel>
                               <SubPanel title="Resurslar toifasi (JORC)" minWidth={160} demo>
                                   {DEMO_JORC.map((j, i) => <CategoryBarRow key={i} label={j.label} pct={j.pct} color={j.color} />)}
                               </SubPanel>
                               <SubPanel title="Loyiha bajarilish darajasi" minWidth={190} demo>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                       <DonutChart segments={DEMO_PROGRESS_SEGMENTS} centerValue={`${DEMO_PROGRESS_OVERALL}%`} size={92} />
                                       <DonutLegend segments={DEMO_PROGRESS_SEGMENTS} />
                                   </div>
                               </SubPanel>
                           </div>
                           {detailLoading && <div style={{ fontSize: 11, color: GC.slate, marginTop: 10 }}>To'liq ma'lumot yuklanmoqda...</div>}
                           {/*{detailIsError && <div style={{ fontSize: 11, color: GC.red, marginTop: 10 }}>To'liq pasport ma'lumoti olinmadi — mavjud qisqa ma'lumot ko'rsatilmoqda</div>}*/}
                       </Card>
                   </div>

                   {/* 3. Geologik ma'lumotlar */}
                   <div style={{ gridColumn: '1', gridRow: '2', minHeight: 0, overflow: 'auto' }}>
                       <Card title="3. Geologik ma'lumotlar" titleColor="#ffffff" borderColor={alpha(GC.amber, 0.4)}>
                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                               <SubPanel title="Foydali qazilma tarkibi (prognoz)" minWidth={200} demo>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                       <DonutChart
                                           segments={DEMO_MINERAL_COMPOSITION}
                                           centerValue={detail.oreReserve ? String(detail.oreReserve).split(' ')[0] : (object.costMlnUsd != null ? String(object.costMlnUsd) : '520')}
                                           centerLabel={detail.oreReserve ? undefined : 'mln t'}
                                           size={160}
                                       />
                                       <DonutLegend segments={DEMO_MINERAL_COMPOSITION} />
                                   </div>
                               </SubPanel>
                               <SubPanel title="Geologik qatlamlar" minWidth={220} demo>
                                   <div style={{ display: 'flex', fontSize: '9px', color: GC.slate, marginBottom: '4px' }}>
                                       <span style={{ flex: '0 0 84px' }} />
                                       <span style={{ flex: 1 }}>Qalinlik (m)</span>
                                       <span style={{ width: '30px', textAlign: 'right' }}>Ulushi</span>
                                   </div>
                                   {DEMO_GEOLOGIC_LAYERS.map((l, i) => (
                                       <div key={i} style={{ marginBottom: '6px' }}>
                                           <CategoryBarRow label={l.label} pct={l.pct} color={l.color} />
                                           <div style={{ fontSize: '8.5px', color: GC.slate, marginLeft: '84px', marginTop: '-3px' }}>{l.range} m</div>
                                       </div>
                                   ))}
                               </SubPanel>
                               <SubPanel title="So'nggi tahlil natijalari" minWidth={190} demo>
                                   <div style={{ display: 'flex', fontSize: '9px', color: GC.slate, fontWeight: 700, marginBottom: '4px' }}>
                                       <span style={{ flex: 1 }}>Element</span>
                                       <span style={{ width: '52px', textAlign: 'right' }}>Qiymat</span>
                                       <span style={{ width: '52px', textAlign: 'right' }}>Me'yor</span>
                                       <span style={{ width: '16px' }} />
                                   </div>
                                   {DEMO_ANALYSIS_RESULTS.map((r, i) => (
                                       <div key={i} style={{ display: 'flex', fontSize: '10.5px', alignItems: 'center', padding: '2px 0' }}>
                                           <span style={{ flex: 1, color: '#dfe9f5', fontWeight: 600 }}>{r.element}</span>
                                           <span style={{ width: '52px', textAlign: 'right', color: '#fff' }}>{r.value}{r.unit}</span>
                                           <span style={{ width: '52px', textAlign: 'right', color: GC.slate }}>{r.norm}</span>
                                           <span style={{ width: '16px', textAlign: 'right' }}><TrendArrow trend={r.trend} /></span>
                                       </div>
                                   ))}
                               </SubPanel>
                           </div>

                       </Card>
                   </div>

                   {/* 4 & 5. 3D / Geologik model — rasm butun kartani qoplaydi */}
                   <div style={{ gridColumn: '2', gridRow: '2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: '120px' }}>
                       <ImageFillCard title="4. Loyiha 3D modeli" accent={accent} src={`https://tmk.bgs.uz/upload/mnt/tmkupload/photoPath/${object.photoPath}-3d.jpg`} icon={<Icon3DCube />} />
                       <ImageFillCard title="5. Geologik model" accent={GC.violet} src={`/imgs/geology/${object.id}-geo.jpg`} icon={<IconStrata />} />
                   </div>
               </div>
           </div>
        </div>
    );
};

/* ── 3) INVEST modali — chapda ochiq-ko'k statistik panel, o'ngda tafsilot —
   "profil" ko'rinishidagi layout, boshqa ikkalasidan farqli. ── */
/* ── INVEST modali uchun demo (namuna) ko'rsatkichlar — foydalanuvchi yuborgan
   maketga 1:1 mos struktura, lekin ko'p sub-panel uchun hali API maydoni yo'q.
   Shu sababli bunday joylar sariq ramka bilan aniq "namuna" deb belgilanadi;
   haqiqiy maydon mavjud bo'lgan joylarda (byudjet, o'zlashtirilgan, bajarilish %,
   ish o'rinlari va h.k.) haqiqiy qiymat ishlatiladi. ── */
const DEMO_INVEST_WORK_PACKAGES = [
    { label: 'Yer ishlari', pct: 100, color: GC.green },
    { label: 'Beton ishlari', pct: 68, color: GC.green },
    { label: 'Metallokonstruksiya', pct: 45, color: GC.accent1 },
    { label: 'Texnologik uskunalar', pct: 32, color: GC.red },
    { label: 'Elektr ishlari', pct: 28, color: GC.accent1 },
    { label: 'Avtomatika', pct: 18, color: GC.accent1 },
    { label: "Ichki yo'llar", pct: 55, color: GC.accent1 },
    { label: 'Infratuzilma', pct: 40, color: GC.accent1 },
];

const DEMO_CAPEX_MONTHLY = [12, 18, 22, 20, 28, 32, 35, 38, 42, 45, 40, 44];

const DEMO_CONTRACT_PACKAGES = [
    { no: 1, name: 'Yer ishlari', fact: 48, status: 'ok' },
    { no: 2, name: 'Asosiy bino (beton)', fact: 82, status: 'warn' },
    { no: 3, name: 'Metallokonstruksiya', fact: 50, status: 'warn' },
    { no: 4, name: 'Texnologik uskunalar', fact: 80, status: 'warn' },
    { no: 5, name: 'Elektr va AVT', fact: 25, status: 'warn' },
    { no: 6, name: 'Infratuzilma', fact: 32, status: 'ok' },
    { no: 7, name: 'Boshqa xarajatlar', fact: 27, status: 'ok' },
];

const DEMO_SITE_PINS = [
    { label: "Maydalash bo'limi", color: GC.accent1, x: 26, y: 28 },
    { label: 'Flotatsiya sexi', color: GC.amber, x: 58, y: 20 },
    { label: 'Bosh korpus', color: GC.accent1, x: 42, y: 46 },
    { label: 'Reagent ombori', color: GC.green, x: 18, y: 54 },
    { label: 'Qurilish lageri', color: GC.slate, x: 16, y: 78 },
    { label: "Ma'muriy bino", color: GC.accent1, x: 38, y: 82 },
    { label: "Temir yo'l tarmog'i", color: GC.slate, x: 66, y: 72 },
    { label: 'Podstansiya', color: GC.accent1, x: 72, y: 44 },
];

const DEMO_SITE_LEGEND = [
    { label: 'Asosiy binolar', color: GC.accent1 },
    { label: 'Yordamchi inshootlar', color: GC.green },
    { label: 'Qurilish jarayoni', color: GC.amber },
    { label: 'Rejalashtirilgan', color: GC.slate },
];

const DEMO_CAMERAS = [
    { code: 'KAM-01', label: 'Bosh korpus' },
    { code: 'KAM-02', label: 'Flotatsiya sexi' },
    { code: 'KAM-03', label: 'Ombor hududi' },
    { code: 'KAM-04', label: "Umumiy ko'rinish" },
];

const DEMO_STAFF_STATS: { label: string; value: string; warn?: boolean }[] = [
    { label: 'Maydondagi xodimlar', value: '318 / 520' },
    { label: 'Pudratchilar', value: '7 ta' },
    { label: 'Bugun kirganlar', value: '412 kishi' },
    { label: 'Bugun chiqqanlar', value: '394 kishi' },
    { label: 'Faol propusklar', value: '318 ta' },
    { label: 'Xavfli zonadagi xodimlar', value: '2 kishi', warn: true },
    { label: 'Texnika kirishlari', value: '56 ta' },
];

const DEMO_STAFF_COMPOSITION = [
    { label: 'Enter Engineering', pct: 45, color: GC.accent1 },
    { label: 'Chinese MCC', pct: 25, color: GC.red },
    { label: "O'zbektroy", pct: 14, color: GC.amber },
    { label: 'TMK (nazorat)', pct: 9, color: GC.green },
    { label: 'Boshqalar', pct: 7, color: GC.slate },
];

const DEMO_ENTRY_EXIT_DAYS = ['28.08', '29.08', '30.08', '31.08', '01.09', '02.09', '03.09'];
const DEMO_ENTRY = [380, 410, 395, 420, 405, 415, 412];
const DEMO_EXIT = [360, 390, 380, 400, 388, 398, 394];

const DEMO_SKUD_EVENTS = [
    { time: '14:21', staff: 'A. Karimov', event: 'Kirish' },
    { time: '13:56', staff: 'S. Liu', event: 'Chiqish' },
    { time: '13:18', staff: 'B. Toshov', event: 'Kirish' },
    { time: '12:15', staff: 'D. Chen', event: 'Kirish' },
    { time: '12:04', staff: 'M. Qodirov', event: 'Chiqish' },
];

const AI_LEVEL_COLOR: Record<string, string> = { danger: GC.red, warn: GC.amber, muted: GC.slate, ok: GC.green };
const DEMO_AI_EVENTS: { time: string; text: string; level: keyof typeof AI_LEVEL_COLOR }[] = [
    { time: '14:21', text: 'PPE qoidasi buzilishi (2 kishi)', level: 'danger' },
    { time: '13:56', text: "Og'ir texnika harakati", level: 'warn' },
    { time: '12:40', text: 'Ruxsatsiz zonaga kirish', level: 'warn' },
    { time: '11:22', text: 'Tutun aniqlandi (soxta signal)', level: 'muted' },
    { time: '09:15', text: 'Xavfsizlik himoyasi mavjud', level: 'ok' },
];

// Haqiqiy QR generatori ulanmagan — faqat vizual "QR kodga o'xshash" namuna (5x5).
const QR_DEMO_PATTERN = [
    1, 1, 1, 0, 1,
    1, 0, 1, 0, 0,
    1, 1, 1, 0, 1,
    0, 0, 0, 1, 0,
    1, 0, 1, 0, 1,
];

const actionBtnStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 600, padding: '7px 12px', borderRadius: '6px',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
    color: '#dfe9f5', cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
};

const StatusDot: React.FC<{ color: string }> = ({ color }) => (
    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
);

const StatusPill: React.FC<{ color: string; text: string }> = ({ color, text }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', background: alpha(color, 0.15), border: `1px solid ${alpha(color, 0.4)}`, color, whiteSpace: 'nowrap' }}>
        <StatusDot color="currentColor" />
        {text}
    </span>
);

const IconDiamond = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l4.5 3.2-1.7 5.5H9.2L7.5 5.2 12 2z" fill="currentColor" opacity="0.9" />
        <path d="M9.2 10.7L4 14.3 8.3 22h7.4l4.3-7.7-5.2-3.6H9.2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconHomeSmall = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
);
const IconLayersSmall = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3l9 5-9 5-9-5 9-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M3 13l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
);
const IconExpandSmall = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const IconPinSmall = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.6" /></svg>
);
const IconRulerSmall = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="8" width="19" height="8" rx="1.5" transform="rotate(-8 12 12)" stroke="currentColor" strokeWidth="1.4" /></svg>
);
const IconCamSmall = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M16.5 10.5l5-3v9l-5-3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
);

// Passport kartasidagi kichik rasm + demo QR — hali rasm bo'lmasa (404) ikonkali fallback.
const PassportPhotoQR: React.FC<{ src: string; accent: string; caption: string }> = ({ src, accent, caption }) => {
    const [errored, setErrored] = React.useState(false);
    return (
        <div style={{ width: '150px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ position: 'relative', height: '105px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${alpha(accent, 0.25)}`, background: `linear-gradient(145deg, ${alpha(accent, 0.12)}, #04101f)` }}>
                {!errored ? (
                    <img src={src} alt="" onError={() => setErrored(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: alpha(accent, 0.6) }}>
                        <Icon3DCube />
                    </div>
                )}
            </div>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9.5px', color: '#dfe9f5', fontWeight: 600 }}>{caption}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '2px', width: '64px', margin: '6px auto 0', padding: '6px', background: '#fff', borderRadius: '4px' }}>
                    {QR_DEMO_PATTERN.map((on, i) => (
                        <div key={i} style={{ aspectRatio: '1', background: on ? '#020B18' : '#fff' }} />
                    ))}
                </div>
                <div style={{ fontSize: '8.5px', color: GC.slate, marginTop: '4px' }}>Skanerlash orqali to'liq ma'lumot</div>
            </div>
        </div>
    );
};

const InvestFullScreenModal: React.FC<{ object: MapItem; onClose: () => void }> = ({ object, onClose }) => {
    const accent = SOURCE_COLORS.invest;
    const staticDetail = (object.detail || {}) as MapInvestDetail;
    // `/map/objects` dagi `id` — "invest-ingichka" ko'rinishida; `/invest-projects/:id`
    // `detail.key` (backend `invest_projects.key`) yoki xom id'ni kutishi mumkin.
    const rawId = (staticDetail as any).key ?? String(object.id).replace(/^invest-/, '');
    const { data: fullDetailRaw, isLoading: detailLoading, isError: detailIsError } = useGetInvestProjectDetail(rawId, 'uz');
    const detail: any = { ...staticDetail, ...(fullDetailRaw || {}) };

    const projectCode = pickField(detail, ['projectCode', 'code']) || detail.key || object.id;
    const progressPct = typeof object.progress === 'number' ? Math.round(object.progress * 100) : null;
    const remainingMlnUsd = (object.costMlnUsd != null && detail.disbursedMlnUsd != null) ? Math.max(object.costMlnUsd - detail.disbursedMlnUsd, 0) : null;
    const budgetPctReal = (object.costMlnUsd != null && detail.disbursedMlnUsd != null && object.costMlnUsd > 0)
        ? Math.round((detail.disbursedMlnUsd / object.costMlnUsd) * 100) : null;
    const budgetPct = budgetPctReal ?? 42;
    const budgetSegments = [
        { label: "O'zlashtirilgan", pct: budgetPct, color: accent },
        { label: 'Qolgan', pct: 100 - budgetPct, color: GC.slate },
    ];
    const lastUpdatedText = React.useMemo(() => new Date().toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }), []);

    return (
        <div style={{
            position: 'fixed', top: FULLSCREEN_TOP_OFFSET, left: 0, right: 0, bottom: 0, zIndex: 900000000,
            background: '#020B18', display: 'flex', flexDirection: 'column', color: '#e0f0ff', overflow: 'hidden',
            borderTop: `1px solid ${alpha(accent, 0.4)}`,
        }}>
            {/* Breadcrumb */}
            <div style={{ padding: '7px 24px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <IconHomeSmall />
                <span>TMK</span>
                <span>›</span>
                <span>Interaktiv xarita</span>
                <span>›</span>
                <span style={{ color: 'rgba(255,255,255,0.75)' }}>Obyekt tafsiloti</span>
            </div>

            {/* Header */}
            <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: `1px solid ${alpha(accent, 0.3)}`, background: `linear-gradient(90deg, ${alpha(accent, 0.25)}, #020B18)`, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: alpha(accent, 0.18), border: `1px solid ${alpha(accent, 0.5)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0 }}>
                        <IconDiamond />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>{object.name || 'Investitsiya loyihasi'}</h2>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', padding: '3px 8px', borderRadius: '5px', whiteSpace: 'nowrap' }}>{projectCode}</span>
                    {object.status && <StatusPill color={GC.green} text={object.status} />}
                    {detail.priority != null && <StatusPill color={GC.amber} text="Ustuvor investitsiya" />}
                    {progressPct != null && <StatusPill color={GC.accent1} text={`Bajarilish: ${progressPct}%`} />}
                    {object.coordsSource === 'linked' && <LinkedCoordsNotice linkedFrom={object.linkedFrom} />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button style={actionBtnStyle}>🛡 Ma'lumot</button>
                    <button style={actionBtnStyle}>📄 Hisobot</button>
                    <button style={actionBtnStyle}>🧊 3D ko'rish ▾</button>
                    <button onClick={onClose} style={closeBtnStyle}>✕</button>
                </div>
            </div>
            <div style={{ padding: '4px 24px 0', textAlign: 'right', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                Oxirgi yangilanish: {lastUpdatedText}
            </div>

            {/* Body — 2x2 karta */}
            <div style={{
                flex: 1, overflow: 'auto', padding: '12px 24px', display: 'grid',
                gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto 1fr', gap: '14px', minHeight: 0,
            }}>
                {/* 1. Loyiha Pasporti */}
                <div style={{ gridColumn: '1', gridRow: '1' }}>
                    <Card title="1. Loyiha Pasporti" titleColor="#ffffff" borderColor={alpha(accent, 0.3)}>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 200px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                                <div>
                                    <PassportRow label="Loyiha nomi" value={object.name} />
                                    <PassportRow label="Loyiha kodi" value={projectCode} />
                                    <PassportRow label="Joylashuv" value={object.region} />
                                    <PassportRow label="Obyekt turi" value={detail.objectKind} />
                                    <PassportRow label="Buyurtmachi" value={pickField(detail, ['customer', 'buyurtmachi']) || detail.enterprise} />
                                    <PassportRow label="Bosh pudratchi" value={pickField(detail, ['contractor', 'mainContractor'])} />
                                    <PassportRow label="Loyiha quvvati" value={detail.capacity} />
                                    <PassportRow label="Ishga tushgach xodimlar" value={detail.jobs} />
                                    <PassportRow label="Asosiy risklar" value={detail.risks} />
                                    <PassportRow label="Ruxsatnomalar holati" value={detail.docState} />
                                </div>
                                <div>
                                    <PassportRow label="Amaldagi bosqich" value={detail.fsState || object.status} />
                                    <PassportRow label="Yer maydoni" value={detail.areaHa != null ? `${detail.areaHa} ga` : undefined} />
                                    <PassportRow label="Maqsadli mahsulot" value={detail.product} />
                                    <PassportRow label="Umumiy qiymati" value={object.costMlnUsd != null ? `${object.costMlnUsd} mln $` : undefined} />
                                    <PassportRow label="Moliyalashtirish manbai" value={detail.funding} />
                                    <PassportRow label="Qurilish boshlangan sana" value={detail.buildStartText || detail.startDateText} />
                                    <PassportRow label="Reja yakuni" value={detail.commissioningText || detail.endDateText} />
                                    <PassportRow label="Viloyat kesimi" value={object.regionGroup} />
                                    <PassportRow label="Maqsad" value={detail.goal} />
                                </div>
                            </div>
                            {/*<PassportPhotoQR src={`/imgs/invest/${object.id}.jpg`} accent={accent} caption="Loyiha pasporti QR-kod" />*/}
                        </div>
                        {/*<LinkedItemsCard links={object.links} accent={accent} />*/}
                        {/*{detailLoading && <div style={{ fontSize: 11, color: GC.slate, marginTop: 8 }}>To'liq ma'lumot yuklanmoqda...</div>}*/}
                        {/*{detailIsError && <div style={{ fontSize: 11, color: GC.red, marginTop: 8 }}>To'liq pasport ma'lumoti olinmadi — mavjud qisqa ma'lumot ko'rsatilmoqda</div>}*/}
                    </Card>
                </div>

                {/* 2. Moliyaviy o'zlashtirish va qurilish holati */}
                <div style={{ gridColumn: '2', gridRow: '1' }}>
                    <Card title="2. Moliyaviy o'zlashtirish va qurilish holati" titleColor="#ffffff" borderColor={alpha(GC.amber, 0.4)}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                            <KpiTile label="Umumiy budjet" value={object.costMlnUsd != null ? String(object.costMlnUsd) : '—'} unit="mln $" />
                            <KpiTile label="O'zlashtirilgan" value={detail.disbursedMlnUsd != null ? String(detail.disbursedMlnUsd) : '—'} unit="mln $" />
                            <KpiTile label="Qolgan" value={remainingMlnUsd != null ? String(remainingMlnUsd) : '—'} unit="mln $" />
                            <KpiTile label="Qurilish bajarilishi" value={progressPct != null ? String(progressPct) : '—'} unit="%" />
                            <KpiTile label="SMR" value="38" unit="%" demo />
                            <KpiTile label="Uskunalar yetkazilishi" value="56" unit="%" demo />
                            <KpiTile label="Montaj" value="28" unit="%" demo />
                            <KpiTile label="Tayyorgarlik" value="12" unit="%" demo />
                            <KpiTile label="Pudratchilar soni" value={object.links?.length ? String(object.links.length) : '7'} demo={!object.links?.length} />
                            <KpiTile label="Ochiq masalalar" value="5" demo />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            <SubPanel title="CAPEX va o'zlashtirish dinamikasi (mln $)" minWidth={160} demo>
                                <MiniBarChart data={DEMO_CAPEX_MONTHLY} labels={DEMO_MONTHS} color={accent} />
                            </SubPanel>
                            <SubPanel title="Ish paketlari bo'yicha bajarilish" minWidth={175} demo>
                                {DEMO_INVEST_WORK_PACKAGES.map((w, i) => <CategoryBarRow key={i} label={w.label} pct={w.pct} color={w.color} />)}
                            </SubPanel>
                            <SubPanel title="Budjet o'zlashtirish" minWidth={170} demo={budgetPctReal == null}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <DonutChart segments={budgetSegments} centerValue={`${budgetPct}%`} size={88} />
                                    <DonutLegend segments={budgetSegments} />
                                </div>
                            </SubPanel>
                            <SubPanel title="Shartnoma paketlari" minWidth={210} demo>
                                <div style={{ display: 'flex', fontSize: '9px', color: GC.slate, fontWeight: 700, marginBottom: '4px' }}>
                                    <span style={{ width: '14px' }}>#</span>
                                    <span style={{ flex: 1 }}>Paket</span>
                                    <span style={{ width: '42px', textAlign: 'right' }}>Fakt</span>
                                    <span style={{ width: '14px' }} />
                                </div>
                                {DEMO_CONTRACT_PACKAGES.map((p) => (
                                    <div key={p.no} style={{ display: 'flex', fontSize: '10px', alignItems: 'center', padding: '2px 0' }}>
                                        <span style={{ width: '14px', color: GC.slate }}>{p.no}</span>
                                        <span style={{ flex: 1, color: '#dfe9f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                                        <span style={{ width: '42px', textAlign: 'right', color: '#fff' }}>{p.fact}</span>
                                        <span style={{ width: '14px', textAlign: 'right' }}><StatusDot color={p.status === 'ok' ? GC.green : GC.amber} /></span>
                                    </div>
                                ))}
                            </SubPanel>
                        </div>
                    </Card>
                </div>

                {/* 3. Loyiha 3D modeli */}
                <div style={{ gridColumn: '1', gridRow: '2', minHeight: 0 }}>
                    <Card title="3. Loyiha 3D modeli" titleColor="#ffffff" borderColor={alpha(GC.amber, 0.4)}>
                        <div style={{ position: 'relative', minHeight: '220px', height: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: `linear-gradient(145deg, ${alpha(accent, 0.1)}, #04101f)` }}>
                            <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 3, background: 'rgba(2,11,24,0.75)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 8px' }}>
                                <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#dfe9f5', marginBottom: '4px' }}>Obyektlar</div>
                                {DEMO_SITE_LEGEND.map((l, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '8px', color: '#c7d2dd', marginBottom: '2px' }}>
                                        <StatusDot color={l.color} />{l.label}
                                    </div>
                                ))}
                            </div>
                            <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 3, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {[IconHomeSmall, IconLayersSmall, IconExpandSmall, IconPinSmall, IconRulerSmall].map((Ic, i) => (
                                    <div key={i} style={{ width: '22px', height: '22px', borderRadius: '5px', background: 'rgba(2,11,24,0.8)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c7d2dd' }}>
                                        <Ic />
                                    </div>
                                ))}
                            </div>
                            {DEMO_SITE_PINS.map((p, i) => (
                                <div key={i} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, zIndex: 2, display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(2,11,24,0.82)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', padding: '2px 7px 2px 5px', fontSize: '8px', color: '#e7f1ff', whiteSpace: 'nowrap' }}>
                                    <StatusDot color={p.color} />{p.label}
                                </div>
                            ))}
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: alpha(accent, 0.3), pointerEvents: 'none' }}>
                                <Icon3DCube />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 4. Qurilish jarayoni, video va xodimlar */}
                <div style={{ gridColumn: '2', gridRow: '2', minHeight: 0, overflow: 'auto' }}>
                    <Card title="4. Qurilish jarayoni, video va xodimlar" titleColor="#ffffff" borderColor={alpha(GC.amber, 0.4)}>
                        <div style={{ marginBottom: '12px' }}>
                            <SubPanel title="Onlayn kameralar (4/12)" minWidth={300} demo>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                                    {DEMO_CAMERAS.map((c, i) => (
                                        <div key={i} style={{ position: 'relative', height: '62px', borderRadius: '6px', overflow: 'hidden', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)' }}>
                                                <IconCamSmall />
                                            </div>
                                            <span style={{ position: 'absolute', top: 3, left: 4, fontSize: '7.5px', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>{c.code}</span>
                                            <span style={{ position: 'absolute', bottom: 3, right: 4, fontSize: '7px', fontWeight: 700, color: GC.red, display: 'flex', alignItems: 'center', gap: '3px' }}><StatusDot color={GC.red} />LIVE</span>
                                        </div>
                                    ))}
                                </div>
                            </SubPanel>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                            <SubPanel title="Asosiy ko'rsatkichlar" minWidth={170} demo>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {DEMO_STAFF_STATS.map((s, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                                            <span style={{ color: GC.slate }}>{s.label}</span>
                                            <span style={{ color: s.warn ? GC.red : '#fff', fontWeight: 700 }}>{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </SubPanel>
                            <SubPanel title="Xodimlar tarkibi (pudratchilar bo'yicha)" minWidth={190} demo>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <DonutChart segments={DEMO_STAFF_COMPOSITION} centerValue={String(detail.jobs ?? 318)} centerLabel="jami" size={86} />
                                    <DonutLegend segments={DEMO_STAFF_COMPOSITION} />
                                </div>
                            </SubPanel>
                            <SubPanel title="Kirish-chiqish dinamikasi (so'nggi 7 kun)" minWidth={190} demo>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '52px' }}>
                                    {DEMO_ENTRY_EXIT_DAYS.map((d, i) => {
                                        const max = Math.max(...DEMO_ENTRY, ...DEMO_EXIT) * 1.1;
                                        return (
                                            <div key={i} style={{ flex: 1, display: 'flex', gap: '2px', alignItems: 'flex-end', height: '100%' }}>
                                                <div style={{ flex: 1, height: `${(DEMO_ENTRY[i] / max) * 100}%`, background: GC.accent1, borderRadius: '2px 2px 0 0' }} />
                                                <div style={{ flex: 1, height: `${(DEMO_EXIT[i] / max) * 100}%`, background: GC.accent3, borderRadius: '2px 2px 0 0' }} />
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                    {DEMO_ENTRY_EXIT_DAYS.map((d, i) => <div key={i} style={{ flex: 1, fontSize: '7px', color: GC.slate, textAlign: 'center' }}>{d}</div>)}
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '8.5px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dfe9f5' }}><StatusDot color={GC.accent1} />Kirish</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dfe9f5' }}><StatusDot color={GC.accent3} />Chiqish</span>
                                </div>
                            </SubPanel>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            <SubPanel title="So'nggi SKUD hodisalari" minWidth={210} demo>
                                {DEMO_SKUD_EVENTS.map((e, i) => (
                                    <div key={i} style={{ display: 'flex', fontSize: '9.5px', padding: '3px 0', borderBottom: i < DEMO_SKUD_EVENTS.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap: '6px' }}>
                                        <span style={{ color: GC.slate, width: '34px', flexShrink: 0 }}>{e.time}</span>
                                        <span style={{ flex: 1, color: '#dfe9f5' }}>{e.staff}</span>
                                        <span style={{ color: e.event === 'Kirish' ? GC.green : GC.amber, fontWeight: 600 }}>{e.event}</span>
                                    </div>
                                ))}
                            </SubPanel>
                            <SubPanel title="AI video hodisalari" minWidth={190} demo>
                                {DEMO_AI_EVENTS.map((e, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '9.5px', padding: '3px 0' }}>
                                        <StatusDot color={AI_LEVEL_COLOR[e.level]} />
                                        <span style={{ color: GC.slate, width: '32px', flexShrink: 0 }}>{e.time}</span>
                                        <span style={{ color: '#dfe9f5', flex: 1 }}>{e.text}</span>
                                    </div>
                                ))}
                            </SubPanel>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '8px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span>Ma'lumot manbalari:</span>
                    {['TMK GIS', 'ERP', 'SCADA', 'SKUD', 'Kameralar', 'Qurilish PMO'].map((s, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><StatusDot color={GC.green} />{s}</span>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    <span>So'nggi sinxronizatsiya: {lastUpdatedText}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><StatusDot color={GC.green} />Tizim holati: Onlayn</span>
                </div>
            </div>
        </div>
    );
};

// 5. ASOSIY MAP KOMPONENTI
const Map3D = ({
                   highlightIndex,
                   setHighlightIndex,
               }: {
    highlightIndex: number;
    setHighlightIndex: React.Dispatch<React.SetStateAction<number>>;
}) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const socketRef = useRef<Socket | null>(null);
    /* Socket effekti faqat mount'da ishlashi kerak — shu sabab u ichida
       o'qiladigan o'zgaruvchan qiymatlar state emas, ref orqali beriladi. */
    const wsConnectedRef = useRef(false);
    const [isManual, setIsManual] = React.useState(false);
    // Tanlangan xarita obyekti (factory | geology | invest) — /map/objects
    // javobidan olingan to'liq ma'lumot bilan, qo'shimcha so'rovsiz.
    const [selectedObject, setSelectedObject] = React.useState<MapItem | null>(null);
    const [mineralsOpen, setMineralsOpen] = React.useState(false);
    const [carsOpen, setCarsOpen] = React.useState(false);
    const timerRef = useRef<any>(null);
    const vehicleMarkersRef = useRef<Record<number, maplibregl.Marker>>({});
    const mineralMarkersRef = useRef<maplibregl.Marker[]>([]);
    const mineralPopupRef = useRef<maplibregl.Popup | null>(null);
    // Factory/geology/invest markerlari — dumaloq klaster yo'q, barchasi doim
    // asl pin+teg dizayni bilan HTML marker sifatida chiziladi; ustma-ust
    // tushganda declutter (pastda) zoomga qarab faqat bittasini ko'rsatadi.
    const objectMarkersRef = useRef<Record<string, maplibregl.Marker>>({});
    // `links[]` orqali bog'langan elementlarni (koordinatasi bo'lmasa ham) topish uchun —
    // filtrdan qat'i nazar HAMMA item shu yerda.
    const allItemsByIdRef = useRef<Record<string, MapItem>>({});
    const [mapLoaded, setMapLoaded] = React.useState(false);
    const [visibleToifas, setVisibleToifas] = React.useState<string[]>([]);
    // '' = barchasi, aks holda 'factory' | 'geology' | 'invest'
    const [sourceFilter, setSourceFilter] = React.useState<string>('');
    const [vehicles, setVehicles] = React.useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = React.useState<any | null>(null);
    const [wsConnected, setWsConnected] = React.useState(false);

    const {data: mapObjectsData, isError: mapObjectsIsError, error: mapObjectsErrorObj, isLoading: mapObjectsLoading} = useGetMapObjects('uz');

    useEffect(() => {
        const map2: Record<string, MapItem> = {};
        (mapObjectsData?.items ?? []).forEach((it) => { map2[it.id] = it; });
        allItemsByIdRef.current = map2;
    }, [mapObjectsData]);

    // Sidebar (OBYEKTLAR) — turi bo'yicha filtrlangan, koordinatasi bo'lmasa ham
    // ro'yxatda ko'rinadi (MAP_API (2).md: ~35 ta itemsWithoutAnyCoords bor).
    const filteredItems = useMemo<MapItem[]>(() => {
        const list = mapObjectsData?.items ?? [];
        return sourceFilter ? list.filter((o) => o.type === sourceFilter) : list;
    }, [mapObjectsData, sourceFilter]);

    // Xarita GL manbasi — faqat haqiqiy koordinatali (o'z yoki meros) elementlar.
    const mappableItems = useMemo<MapItem[]>(() => {
        return filteredItems.filter((o) => typeof o.lat === 'number' && typeof o.lon === 'number');
    }, [filteredItems]);


    // O'zbekiston chegara neon animatsiyasi uchun state yoki ref
    const animationFrameRef = useRef<number>();

    // Markerlarni declutter qilish (bir freymda faqat bir marta ishlashi uchun rAF throttle)
    const declutterRafRef = useRef<number | null>(null);

    // Ekran koordinatalari bo'yicha yaqin mineral/factory/geology/invest
    // markerlarni yashirib, faqat bittasini qoldiradi. Faqat visibility'ni
    // almashtiradi — marker/data/dizaynga tegmaydi. Dumaloq klaster (son bilan
    // aylana) yo'q — jami obyektlar soni oz (50-60 ta) bo'lgani uchun barchasi
    // shu declutter orqali, zoomga qarab boshqariladi. Obyektlar (factory/
    // geology/invest) uchun MIN_VISIBLE_OBJECTS kafolatlanadi — juda uzoq
    // zoomda ham xarita butunlay bo'shab qolmaydi.
    const declutterMarkers = useCallback(() => {
        const mapInstance = map.current;
        if (!mapInstance) return;

        type Item = { el: HTMLElement; lngLat: maplibregl.LngLat; r: number };
        type Projected = { el: HTMLElement; x: number; y: number; r: number; visible: boolean };

        const shown: { x: number; y: number; r: number }[] = [];

        // Berilgan ro'yxatni navbat bilan tekshiradi: `shown`dagi (avvalgi
        // bosqichlardan qolgan) nuqtalar bilan to'qnashmasa ko'rinadi va
        // o'zi ham `shown`ga qo'shiladi. Natija — har biri uchun proyeksiya
        // (x, y) va ko'rinish holati (keyingi bosqich shundan foydalanadi).
        const runPass = (list: Item[]): Projected[] =>
            list.map(({ el, lngLat, r }) => {
                const p = mapInstance.project(lngLat);
                let collides = false;
                for (let i = 0; i < shown.length; i++) {
                    const s = shown[i];
                    const dx = s.x - p.x;
                    const dy = s.y - p.y;
                    const minDist = s.r + r;
                    if (dx * dx + dy * dy < minDist * minDist) { collides = true; break; }
                }
                if (!collides) shown.push({ x: p.x, y: p.y, r });
                return { el, x: p.x, y: p.y, r, visible: !collides };
            });

        const mineralItems: Item[] = mineralMarkersRef.current.map((m) => ({ el: m.getElement(), lngLat: m.getLngLat(), r: MINERAL_CLUSTER_R }));
        runPass(mineralItems).forEach(({ el, visible }) => {
            el.style.visibility = visible ? '' : 'hidden';
        });

        const objectItems: Item[] = Object.values(objectMarkersRef.current).map((m) => ({ el: m.getElement(), lngLat: m.getLngLat(), r: OBJECT_CLUSTER_R }));
        const objectResults = runPass(objectItems);

        // Uzoq zoomda hammasi bir-biriga ustma-ust tushib, radius tekshiruvi
        // deyarli hammasini yashirib qo'yishi mumkin. Shuning oldini olish
        // uchun ko'rinadiganlar soni MIN_VISIBLE_OBJECTS'dan kam bo'lsa,
        // hali yashiringanlar orasidan — har safar ALLAQACHON tanlanganlardan
        // ENG UZOQ turgani — birma-bir majburan ko'rsatiladi (farthest-point
        // sampling). Natijada qolgan markerlar xarita bo'ylab bir tekis,
        // "diagonal" tarqalib ko'rinadi, bir burchakka to'planib qolmaydi.
        let visibleCount = objectResults.reduce((n, o) => n + (o.visible ? 1 : 0), 0);
        if (visibleCount < MIN_VISIBLE_OBJECTS) {
            const chosen = objectResults.filter((o) => o.visible).map((o) => ({ x: o.x, y: o.y }));
            const remaining = objectResults.filter((o) => !o.visible);

            while (visibleCount < MIN_VISIBLE_OBJECTS && remaining.length > 0) {
                let bestIdx = 0;
                let bestDist = -1;
                remaining.forEach((cand, idx) => {
                    const minDistToChosen = chosen.length === 0
                        ? Infinity
                        : Math.min(...chosen.map((c) => (c.x - cand.x) ** 2 + (c.y - cand.y) ** 2));
                    if (minDistToChosen > bestDist) { bestDist = minDistToChosen; bestIdx = idx; }
                });
                const [picked] = remaining.splice(bestIdx, 1);
                picked.visible = true;
                chosen.push({ x: picked.x, y: picked.y });
                visibleCount++;
            }
        }

        objectResults.forEach(({ el, visible }) => {
            el.style.visibility = visible ? '' : 'hidden';
        });
    }, []);

    // Karta harakati/zoom paytida ko'p marta chaqirilmasligi uchun rAF bilan throttle
    const scheduleDeclutter = useCallback(() => {
        if (declutterRafRef.current != null) return;
        declutterRafRef.current = requestAnimationFrame(() => {
            declutterRafRef.current = null;
            declutterMarkers();
        });
    }, [declutterMarkers]);

    // Asl pin+teg dizayni: rangli aylanacha pin, ostida vertikal chiziq, yoniga
    // nom/teg va hudud/status qutisi — 3 turga (factory/geology/invest) mos rangda.
    const buildObjectMarkerEl = useCallback((obj: MapItem) => {
        const color = SOURCE_COLORS[obj.type] || GC.marker;
        const el = document.createElement('div');
        el.className = 'custom-html-marker';
        // `coordsSource: 'linked'` — zavoddan meros qilingan taxminiy joylashuv,
        // shaffoflik uchun xiraroq (MAP_API'ning "ochiq belgilanishi shart" talabi).
        el.style.opacity = obj.coordsSource === 'linked' ? '0.65' : '1';

        const name = obj.name || '';
        const regionLabel = obj.region || 'Hudud';
        const statusLabel = obj.status || '';

        el.innerHTML = `
            <div class="marker-pin-wrapper" style="transform: scale(0.65); transform-origin: bottom left;">
                    <div class="marker-content-box">
                        <div class="marker-title-tag" style="background:${color};">
                            ${formatMarkerText(name, 12)}
                        </div>
                        <div class="marker-info-box" style="border-left-color:${color};">
                            <span>${formatMarkerText(regionLabel, 10)}</span>
                            ${statusLabel ? `<span class="marker-info-value">${statusLabel}</span>` : ''}
                        </div>
                    </div>
                    <div class="marker-pin" style="border-color:${color};">
                        <div class="marker-icon-inner">${getMarkerTypeIcon(obj.type, color)}</div>
                    </div>
                    <div class="marker-line" style="background:${color};"></div>
                </div>
        `;

        el.onclick = (e) => {
            e.stopPropagation();
            handleManualOpen(0);
            setSelectedObject(obj);
        };

        return el;
    }, []);

    // Dumaloq klaster (son bilan aylana) butunlay olib tashlangan: bor-yo'g'i
    // 50-60 ta obyekt bor, shuning uchun GL cluster manbasi shart emas — barcha
    // koordinatali factory/geology/invest obyektlari uchun to'g'ridan-to'g'ri
    // HTML pin marker yaratiladi/yangilanadi. Ustma-ust tushganda kimni
    // ko'rsatish/yashirish — zoomga qarab `declutterMarkers` hal qiladi:
    // yaqinlashtirilsa ko'proq marker ochiladi, uzoqlashtirilsa yaqinlari
    // birlashib bittasi qoladi (pastda).
    const syncObjectMarkers = useCallback((items: MapItem[]) => {
        const mapInstance = map.current;
        if (!mapInstance) return;

        const currentIds = new Set<string>();
        items.forEach((obj) => {
            if (typeof obj.lon !== 'number' || typeof obj.lat !== 'number') return;
            const id = String(obj.id);
            currentIds.add(id);

            const existing = objectMarkersRef.current[id];
            if (existing) {
                existing.setLngLat([obj.lon, obj.lat]);
            } else {
                const el = buildObjectMarkerEl(obj);
                const marker = new maplibregl.Marker({ element: el, anchor: 'bottom-left' })
                    .setLngLat([obj.lon, obj.lat])
                    .addTo(mapInstance);
                objectMarkersRef.current[id] = marker;
            }
        });

        Object.keys(objectMarkersRef.current).forEach((id) => {
            if (!currentIds.has(id)) {
                objectMarkersRef.current[id].remove();
                delete objectMarkersRef.current[id];
            }
        });

        scheduleDeclutter();
    }, [buildObjectMarkerEl, scheduleDeclutter]);

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
            zoom: 5,
            pitch: 45,
            fadeDuration: 0
        });

        // Karta har harakat/zoom qilinganda markerlarni qayta declutter qilish
        map.current.on('move', scheduleDeclutter);

        /* Fon ranglarini ko'kka o'tkazish `load` ga emas, `styledata` ga
           bog'langan: `load` sprite/glyph so'rovlari muvaffaqiyatsiz bo'lsa
           umuman ishga tushmaydi, `styledata` esa uslub o'qilishi bilanoq
           chaqiriladi. Funksiya idempotent — rang bir marta ko'kka aylangach
           keyingi chaqiruvlarda tegilmaydi. */
        map.current.on('styledata', () => {
            if (map.current) deGreenBasemap(map.current);
        });

        map.current.on('load', async () => {
            if (!map.current) return;

            // 1. O'ZBEKISTON CHEGARASINI YUKLASH
            const uzbekistanData = await loadUzbekistanBorder();

            if (uzbekistanData) {
                map.current.addSource('uzbekistan-border', {
                    type: 'geojson',
                    data: uzbekistanData as any
                });

                /* DIQQAT: MapLibre `paint` qiymatlari CSS o'zgaruvchini
                   (`var(--gc-*)`) tushunmaydi — bunday yozuvda qatlam butunlay
                   qo'shilmay, xarita ostidagi yashil relyef ochiq qolardi.
                   Shuning uchun bu yerda faqat haqiqiy rang qiymatlari (GC). */

                // Ichki to'ldirish
                map.current.addLayer({
                    id: 'uzbekistan-fill',
                    type: 'fill',
                    source: 'uzbekistan-border',
                    paint: {
                        'fill-color': GC.bg900,
                        'fill-opacity': 0.55
                    }
                });

                // Tashqi neon glow (katta)
                map.current.addLayer({
                    id: 'uzbekistan-outline-glow',
                    type: 'line',
                    source: 'uzbekistan-border',
                    paint: {
                        'line-color': GC.accent2,
                        'line-width': 8,
                        'line-blur': 12,
                        'line-opacity': 0.4
                    }
                });

                // O'rta neon layer
                map.current.addLayer({
                    id: 'uzbekistan-outline-mid',
                    type: 'line',
                    source: 'uzbekistan-border',
                    paint: {
                        'line-color': GC.accent2,
                        'line-width': 4,
                        'line-blur': 6,
                        'line-opacity': 0.7
                    }
                });

                // Asosiy o'tkir chiziq
                map.current.addLayer({
                    id: 'uzbekistan-outline',
                    type: 'line',
                    source: 'uzbekistan-border',
                    paint: {
                        'line-color': GC.accent3,
                        'line-width': 1.5,
                        'line-opacity': 0.8
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

            // 2. XARITA OBYEKTLARI (factory / geology / invest) —
            // Dumaloq klaster (son bilan aylana) yo'q. Jami obyektlar soni oz
            // (~50-60 ta) bo'lgani uchun har biri to'g'ridan-to'g'ri HTML pin
            // marker sifatida chiziladi (syncObjectMarkers, pastdagi
            // [mappableItems, mapLoaded] effekti); ustma-ust tushganlar zoomga
            // qarab declutter orqali boshqariladi.
            setMapLoaded(true);

            // 3. MINERAL MARKERLARINI QO'SHISH
            addMineralMarkers();
        });

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (declutterRafRef.current != null) cancelAnimationFrame(declutterRafRef.current);
            mineralMarkersRef.current.forEach(m => m.remove());
            Object.values(objectMarkersRef.current).forEach(m => m.remove());
            map.current?.remove();
        };
    }, []);

    const handleManualOpen = (index: number) => {
        setHighlightIndex(index);
        setIsManual(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsManual(false), 30000);
    };

    const handleOpenDetails = (obj: MapItem, index: number = 0) => {
        handleManualOpen(index);
        setSelectedObject(obj);
    };

    const handleCloseDetails = () => {
        setSelectedObject(null);
    };

    // Sidebar ro'yxatidan bosilganda: xaritani o'sha markerga fokuslaydi VA turiga mos modalni ochadi —
    // marker ustiga bosilganda ham xuddi shu oqim ishlaydi (map 'click' handleri, yuqorida).
    const focusObject = (obj: MapItem, index: number) => {
        if (map.current && typeof obj.lon === 'number' && typeof obj.lat === 'number') {
            map.current.flyTo({ center: [obj.lon, obj.lat], zoom: 12, pitch: 45, speed: 1.2 });
        }
        handleOpenDetails(obj, index);
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
            // Marker ustiga bosilganda — faqat nomi ko'rsatilgan popup.
            el.onclick = (e) => {
                e.stopPropagation();
                if (!map.current) return;
                mineralPopupRef.current?.remove();
                mineralPopupRef.current = new maplibregl.Popup({ offset: 14, closeButton: false, className: 'mineral-popup' })
                    .setLngLat(mineral.coords)
                    .setText(mineral.name)
                    .addTo(map.current);
            };

            const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
                .setLngLat(mineral.coords)
                .addTo(map.current!);
            mineralMarkersRef.current.push(marker);
        });

        // Mineral markerlari qo'shilgach declutter (fabrikalar bilan birga)
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

    /* Handler'lar har doim eng oxirgi `updateVehicleMarkersOptimized` ni chaqirsin
       (u `visibleToifas` o'zgarganda qayta yaratiladi), lekin bu socketni qayta
       ulashga sabab bo'lmasin. */
    const updateMarkersOptimizedRef = useRef(updateVehicleMarkersOptimized);
    useEffect(() => {
        updateMarkersOptimizedRef.current = updateVehicleMarkersOptimized;
    }, [updateVehicleMarkersOptimized]);

    /* WebSocket — real vaqtda transport kuzatuvi.
       DIQQAT: effekt FAQAT mount'da ishlaydi. Ilgari bog'liqliklarda
       `wsConnected` turgan edi va socketning o'z `connect`/`disconnect`/
       `connect_error` handleri o'sha state'ni o'zgartirgani uchun effekt
       o'zini-o'zi qayta ishga tushirar edi: ulanish → state → cleanup →
       disconnect → yangi socket → ... Natijada `reconnectionAttempts: 5`
       hech qachon tugamay, konsol cheksiz "websocket error" bilan to'lardi. */
    useEffect(() => {
        /* Token loyihada faqat `tmk-token-bgs` kalitida saqlanadi (LoginPage.tsx)
           va "Bearer " prefiksi bilan yoziladi. Avval `"token"` kaliti o'qilardi —
           u hech qachon mavjud emas, shuning uchun so'rovlar `Bearer null` ketardi. */
        const stored = localStorage.getItem('tmk-token-bgs') ?? '';
        const authHeader = stored
            ? (stored.startsWith('Bearer ') ? stored : `Bearer ${stored}`)
            : '';
        const rawToken = authHeader.replace(/^Bearer\s+/, '');

        const socket = io('wss://tmk.bgs.uz/tracking', {
            transports: ['websocket', 'polling'],
            timeout: 20000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            auth: { token: rawToken },
        });
        socketRef.current = socket;

        const setConnected = (value: boolean) => {
            wsConnectedRef.current = value;
            setWsConnected(value);
        };

        socket.on('connect', () => {
            setConnected(true);
            // Enable real-time tracking with 1 second interval
            setTimeout(() => {
                socket.emit('enableRealTimeTracking', {
                    interval: 1000,
                    includePosition: true,
                    includeStatus: true,
                    realTime: true,
                });
            }, 1000);
        });

        socket.on('disconnect', () => setConnected(false));

        /* Urinishlar soni cheklangan (5 ta), shundan keyin REST polling ishlaydi. */
        socket.on('connect_error', (error: Error) => {
            console.warn('WebSocket ulanmadi, REST polling ishlatiladi:', error.message);
            setConnected(false);
        });

        socket.on('realTimeVehicleUpdate', (data: { vehicles: any[]; totalCount: number }) => {
            if (data?.vehicles) {
                setVehicles(data.vehicles);
                updateMarkersOptimizedRef.current(data.vehicles);
            }
        });

        socket.on('vehicleUpdates', (data: { status: string; vehicles?: any[] }) => {
            if (data.status === 'success' && data.vehicles) {
                setVehicles(data.vehicles);
                updateMarkersOptimizedRef.current(data.vehicles);
            }
        });

        // Fallback to REST polling if WebSocket fails
        const fetchVehicles = async () => {
            if (wsConnectedRef.current) return; // socket ishlayotgan bo'lsa — kerak emas
            if (!authHeader) return;            // token yo'q — bekorga 401 olmaymiz

            try {
                const response = await fetch('https://tmk.bgs.uz/api/api/vehicles/realtime', {
                    headers: { Authorization: authHeader },
                });
                if (!response.ok) return;
                const result = await response.json();
                const list = result.success ? result.data : result;
                if (Array.isArray(list)) {
                    setVehicles(list);
                    updateMarkersOptimizedRef.current(list);
                }
            } catch (err) {
                console.error('Vehicle fetch error:', err);
            }
        };

        fetchVehicles();
        const interval = setInterval(fetchVehicles, 5000);

        return () => {
            clearInterval(interval);
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    const toggleToifa = (toifa: string) => {
        setVisibleToifas(prev => {
            const isChecked = prev.includes(toifa);
            const next = isChecked ? prev.filter(t => t !== toifa) : [...prev, toifa];
            return next;
        });
    };

    // Transport (active/inactive) filtri o'zgarganda mashina markerlarini qayta chizish.
    useEffect(() => {
        updateVehicleMarkers();
    }, [visibleToifas]);

    // /map/objects natijasi yoki toifa filtri o'zgarganda HTML pin markerlarni
    // yangilash. `mapLoaded` xarita 'load' hodisasidan keyin true bo'ladi.
    // Dumaloq klaster yo'q — factory/geology/invest barchasi shu yerdan,
    // to'g'ridan-to'g'ri syncObjectMarkers orqali chiziladi.
    useEffect(() => {
        if (!mapLoaded) return;
        syncObjectMarkers(mappableItems);
    }, [mappableItems, mapLoaded, syncObjectMarkers]);


    return (
        <div style={{
            width: '100%', height: '100%', position: 'relative',
            background: '#020B18', borderRadius: '12px', overflow: 'hidden',
        }}>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

            {/* Minerals — burchakdagi kichik toggle icon, bosilsa to'liq panel ochiladi */}
            {!mineralsOpen ? (
                <button
                    onClick={() => setMineralsOpen(true)}
                    title="Minerallar"
                    style={{
                        position: 'absolute',
                        bottom: '2%',
                        left: '2%',
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: 'rgba(2, 11, 24, 0.65)',
                        border: '1px solid rgba(0, 245, 255, 0.35)',
                        backdropFilter: 'blur(8px)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        color: 'rgba(0,245,255,0.85)',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2l4.5 3.2-1.7 5.5H9.2L7.5 5.2 12 2z" fill="currentColor" opacity="0.9" />
                        <path d="M9.2 10.7L4 14.3 8.3 22h7.4l4.3-7.7-5.2-3.6H9.2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                </button>
            ) : (
                <div style={{
                    position: 'absolute',
                    bottom: '2%',
                    left: '2%',
                    width: 'auto',
                    background: 'rgba(2, 11, 24, 0.55)',
                    border: '1px solid rgba(0, 245, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    backdropFilter: 'blur(8px)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', borderBottom: '1px solid rgba(0,245,255,0.2)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'rgba(0,245,255,0.8)', letterSpacing: '1px' }}>
                            MINERALLAR
                        </span>
                        <button
                            onClick={() => setMineralsOpen(false)}
                            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '11px', lineHeight: 1, padding: 0 }}
                        >
                            ✕
                        </button>
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
                                        <span style={{ fontSize: '8px', color: "#fff", fontWeight: 'bold', whiteSpace: 'nowrap' }}>{m.name}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Transport (Active/Inactive) — MINERALLAR bilan bir xil uslubda,
               bosilsa ochiladigan/yopiladigan kichik toggle, minerallar ikonkasi yonida. */}
            {!carsOpen ? (
                <button
                    onClick={() => setCarsOpen(true)}
                    title="Transport"
                    style={{
                        position: 'absolute',
                        bottom: '2%',
                        left: 'calc(2% + 44px)',
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: 'rgba(2, 11, 24, 0.65)',
                        border: '1px solid rgba(0, 245, 255, 0.35)',
                        backdropFilter: 'blur(8px)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        color: 'rgba(0,245,255,0.85)',
                    }}
                >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 16v-3.5L6 7h12l2 5.5V16" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M4 16h16v2.2a0.8 0.8 0 0 1-.8.8H16a0.8 0.8 0 0 1-.8-.8V17H8.8v1.2a0.8 0.8 0 0 1-.8.8H4.8a0.8 0.8 0 0 1-.8-.8V16z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                        <circle cx="7.5" cy="13.2" r="1.1" fill="currentColor" />
                        <circle cx="16.5" cy="13.2" r="1.1" fill="currentColor" />
                    </svg>
                </button>
            ) : (
                <div style={{
                    position: 'absolute',
                    bottom: '2%',
                    left: 'calc(2% + 44px)',
                    width: 'auto',
                    background: 'rgba(2, 11, 24, 0.55)',
                    border: '1px solid rgba(0, 245, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    backdropFilter: 'blur(8px)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', borderBottom: '1px solid rgba(0,245,255,0.2)', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'rgba(0,245,255,0.8)', letterSpacing: '1px' }}>
                            TRANSPORT
                        </span>
                        <button
                            onClick={() => setCarsOpen(false)}
                            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '11px', lineHeight: 1, padding: 0 }}
                        >
                            ✕
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '11px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: GC.accent1, boxShadow: `0 0 6px ${GC.accent1}` }}></div>
                            <span style={{ color: GC.accent1, fontWeight: 'bold' }}>Active</span>
                            <input
                                type="checkbox"
                                checked={visibleToifas.includes('active_car')}
                                onChange={() => toggleToifa('active_car')}
                                style={{ cursor: 'pointer', accentColor: GC.accent1, width: '13px', height: '13px' }}
                            />
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '11px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: GC.red, boxShadow: `0 0 6px ${GC.red}` }}></div>
                            <span style={{ color: GC.red, fontWeight: 'bold' }}>Inactive</span>
                            <input
                                type="checkbox"
                                checked={visibleToifas.includes('inactive_car')}
                                onChange={() => toggleToifa('inactive_car')}
                                style={{ cursor: 'pointer', accentColor: GC.red, width: '13px', height: '13px' }}
                            />
                        </label>
                    </div>
                </div>
            )}

            {/* Chap-tepa: FILTRLASH */}
            <div style={{
                position: 'absolute',
                top: '6%',
                left: '2%',
                maxWidth: 'calc(100% - 260px)',
                width: 'fit-content',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
            }}>
                {/* FILTRLASH — obyekt turi (source) bo'yicha */}
                <div style={{
                    background: 'rgba(2, 11, 24, 0.55)',
                    border: '1px solid rgba(0, 245, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '10px 14px',
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

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {[
                            { value: '', label: 'Barchasi', color: 'var(--gc-title)', text: sourceFilter === '' ? '#020B18' : 'var(--gc-title)' },
                            { value: 'geology', label: SOURCE_LABELS.geology, color: SOURCE_UI_ACCENT.geology, text: GC.white },
                            { value: 'factory', label: SOURCE_LABELS.factory, color: SOURCE_UI_ACCENT.factory, text: '#020B18' },
                            { value: 'invest', label: SOURCE_LABELS.invest, color: SOURCE_UI_ACCENT.invest, text: '#020B18' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setSourceFilter(opt.value)}
                                style={{
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    color: sourceFilter === opt.value ? opt.text : opt.color,
                                    background: sourceFilter === opt.value ? opt.color : 'transparent',
                                    border: `1px solid ${opt.color}`,
                                    transition: 'all 0.2s',
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Obyektlar ro'yxati — o'ng tomondagi sidebar */}
            <div style={{
                position: 'absolute',
                top: '6%',
                right: '2%',
                width: '220px',
                maxHeight: '90%',
                background: 'rgba(2, 11, 24, 0.55)',
                border: '1px solid rgba(0, 245, 255, 0.3)',
                borderRadius: '8px',
                padding: '10px',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                backdropFilter: 'blur(8px)',
                color: 'white',
            }}>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(0,245,255,0.8)', borderBottom: '1px solid rgba(0,245,255,0.2)', paddingBottom: '6px', textAlign: 'center', letterSpacing: '1px' }}>
                    OBYEKTLAR ({filteredItems.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1 }}>
                    {filteredItems.map((obj, index) => {
                        const color = SOURCE_UI_ACCENT[obj.type] || GC.marker;
                        const hasCoords = typeof obj.lat === 'number' && typeof obj.lon === 'number';
                        return (
                            <div
                                key={obj.id ?? index}
                                onClick={() => focusObject(obj, index)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '2px',
                                    padding: '6px 8px',
                                    borderRadius: '4px',
                                    borderLeft: `3px solid ${color}`,
                                    background: 'rgba(255,255,255,0.04)',
                                    cursor: 'pointer',
                                    opacity: hasCoords ? 1 : 0.7,
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,245,255,0.1)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                            >
                                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {obj.name || '—'}
                                </span>
                                <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)' }}>
                                    {obj.region || SOURCE_LABELS[obj.type] || ''}
                                    {!hasCoords ? ' · koordinatasiz' : obj.coordsSource === 'linked' ? ' · taxminiy' : ''}
                                </span>
                            </div>
                        );
                    })}
                    {mapObjectsLoading && (
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '10px 0' }}>
                            Yuklanmoqda...
                        </div>
                    )}
                    {mapObjectsIsError && (
                        <div style={{ fontSize: '11px', color: GC.red, textAlign: 'center', padding: '10px 0' }}>
                            Xatolik: {(mapObjectsErrorObj as any)?.response?.status === 401 ? 'Token yo\'q yoki muddati o\'tgan, qayta login qiling' : ((mapObjectsErrorObj as any)?.message || 'ma\'lumot olinmadi')}
                        </div>
                    )}
                    {!mapObjectsLoading && !mapObjectsIsError && filteredItems.length === 0 && (
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
                                        color: selectedVehicle.status?.isOnline ? GC.accent1 : GC.red,
                                        background: selectedVehicle.status?.isOnline ? alpha(GC.accent1, 0.1) : alpha(GC.red, 0.1),
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        marginTop: '4px',
                                        border: `1px solid ${selectedVehicle.status?.isOnline ? alpha(GC.accent1, 0.3) : alpha(GC.red, 0.3)}`
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
                                        <span style={{ color: GC.slate }}>Kenglik:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.position?.latitude?.toFixed(6)}°</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: GC.slate }}>Uzunlik:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.position?.longitude?.toFixed(6)}°</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: GC.slate }}>Balandlik:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.position?.altitude || 0} m</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: GC.slate }}>Yo'nalish:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.position?.course || 0}°</span>
                                    </div>
                                </div>
                            </div>

                            {/* Harakat */}
                            <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: GC.accent1, fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                    Harakat
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: GC.slate }}>Tezlik:</span>
                                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: GC.accent1, textShadow: `0 0 5px ${alpha(GC.accent1, 0.5)}` }}>{selectedVehicle.position?.speed || 0} km/h</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: GC.slate }}>Dvigatel:</span>
                                        <span style={{ fontWeight: '600', color: selectedVehicle.sensors?.ignition ? GC.accent1 : GC.red }}>
                                            {selectedVehicle.sensors?.ignition ? 'Yoqilgan' : 'O\'chirilgan'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: GC.slate }}>Oxirgi yangilanish:</span>
                                        <span style={{ fontWeight: '600', fontSize: '11px', color: '#e0f0ff' }}>
                                            {selectedVehicle.position?.lastUpdate ? new Date(selectedVehicle.position.lastUpdate).toLocaleString('uz-UZ') : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Sensorlar */}
                            <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: GC.violet, fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                    Sensorlar
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: GC.slate }}>GPS sun'iy yo'ldoshlar:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.sensors?.satellites || selectedVehicle.position?.satellites || 0}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: GC.slate }}>Kuchlanish:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.sensors?.voltage || 0} V</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: GC.slate }}>Yoqilg'i:</span>
                                            <span style={{ fontWeight: '600' }}>{selectedVehicle.sensors?.fuel || 0}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ width: `${selectedVehicle.sensors?.fuel || 0}%`, height: '100%', background: GC.amber, boxShadow: `0 0 5px ${GC.amber}` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Elektr ta'minoti */}
                            <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: GC.amber, fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="9"></line></svg>
                                    Quvvat
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: GC.slate }}>Tashqi quvvat:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.sensors?.externalPower || 0} V</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: GC.slate }}>Ichki quvvat:</span>
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
                                        <span style={{ color: GC.slate }}>Holat:</span>
                                        <span style={{ fontWeight: '600', color: selectedVehicle.status?.isOnline ? GC.accent1 : GC.red }}>
                                            {selectedVehicle.status?.isOnline ? 'Onlayn' : 'Oflayn'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: GC.slate }}>Oxirgi aloqa:</span>
                                        <span style={{ fontWeight: '600', fontSize: '11px' }}>
                                            {selectedVehicle.status?.lastMessage ? new Date(selectedVehicle.status.lastMessage * 1000).toLocaleString('uz-UZ') : '-'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span style={{ color: GC.slate }}>Ulanish vaqti:</span>
                                        <span style={{ fontWeight: '600', fontSize: '11px' }}>
                                            {selectedVehicle.status?.connectionTime ? new Date(selectedVehicle.status.connectionTime * 1000).toLocaleString('uz-UZ') : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Qo'shimcha ma'lumotlar */}
                            <div style={{ background: 'rgba(3, 13, 34, 0.7)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(0,245,255,0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: GC.slate, fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                    Ma'lumot
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: GC.slate }}>ID:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.id}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: GC.slate }}>Sinf:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedVehicle.className || 'Noma\'lum'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: GC.slate }}>Xabar ID:</span>
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

            {/* Turi bo'yicha modal — factory / geology / invest uchunham to'liq ekran
               "pasport" dashboard ko'rinishi, har birining o'z kartalari bilan. */}
            {selectedObject?.type === 'factory' && (
                <FactoryFullScreenModal object={selectedObject} onClose={handleCloseDetails} />
            )}
            {selectedObject?.type === 'geology' && (
                <GeologyFullScreenModal object={selectedObject} onClose={handleCloseDetails} />
            )}
            {selectedObject?.type === 'invest' && (
                <InvestFullScreenModal object={selectedObject} onClose={handleCloseDetails} />
            )}
        </div>
    );
};

export default Map3D;