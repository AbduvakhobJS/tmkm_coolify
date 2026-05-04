import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { factoryData } from '../data/factorys';
import StreamGrid from "./VideoStream";
import ProjectDashboard from "./ProjectDashboard";
import { uzbekistanBorder, loadUzbekistanBorder } from './uzbekistanBorder';

const MARKER_STYLES = `
    .custom-html-marker {
        display: flex;
        align-items: flex-end;
        cursor: pointer;
        filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));
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
        box-shadow: 0 0 15px rgba(255, 20, 147, 0.4);
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

    .toifa-2 .marker-pin { border-color: #00f5ff; }
    .toifa-2 .marker-line { background: #00f5ff; }
    .toifa-2 .marker-title-tag { background: #00f5ff; }
    .toifa-2 .marker-info-box { border-left-color: #00f5ff; }

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
const Map3D = ({
                   highlightIndex,
                   setHighlightIndex,
               }: {
    highlightIndex: number;
    setHighlightIndex: React.Dispatch<React.SetStateAction<number>>;
}) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [isManual, setIsManual] = React.useState(false);
    const [openDetailIndex, setOpenDetailIndex] = React.useState<number | null>(null);
    const timerRef = useRef<any>(null);
    const markersRef = useRef<Record<number, maplibregl.Marker>>({});

    const factorys = factoryData;

    // O'zbekiston chegara neon animatsiyasi uchun state yoki ref
    const animationFrameRef = useRef<number>();

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
            zoom: 5.5,
            fadeDuration: 0
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

                // Ichki to'ldirish
                map.current.addLayer({
                    id: 'uzbekistan-fill',
                    type: 'fill',
                    source: 'uzbekistan-border',
                    paint: {
                        'fill-color': '#00f5ff',
                        'fill-opacity': 0.05
                    }
                });

                // Tashqi neon glow (katta)
                map.current.addLayer({
                    id: 'uzbekistan-outline-glow',
                    type: 'line',
                    source: 'uzbekistan-border',
                    paint: {
                        'line-color': '#00f5ff',
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
                        'line-color': '#00f5ff',
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
                        'line-color': '#00ffff',
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

            // 2. FABRIKA MARKERLARINI QO'SHISH
            factorys.forEach((f, index) => {
                if (f.coords) {
                    const el = document.createElement('div');
                    const toifaNum = f.marker_icon?.split('_')[1] || '1';
                    el.className = `custom-html-marker toifa-${toifaNum}`;

                    let iconPath = '/icons/factory1.png';
                    if (f.marker_icon === 'toifa_2') iconPath = '/icons/factory2.png';
                    else if (f.marker_icon === 'toifa_3') iconPath = '/icons/factory3.png';
                    else if (f.marker_icon === 'toifa_4') iconPath = '/icons/factory1.png';
                    else if (f.marker_icon === 'toifa_5') iconPath = '/icons/factory2.png';

                    el.innerHTML = `
                        <div class="marker-pin-wrapper">
                            <div class="marker-content-box">
                                <div class="marker-title-tag">
                                    ${f.title}
                                    <span class="marker-info-small">${(f as any).info || ''}</span>
                                </div>
                                <div class="marker-info-box">
                                    <span>${(f as any).description?.split(' ')[0] || 'Ma\'lumot'}</span>
                                    <span class="marker-info-value">${(f as any).description?.split(' ').slice(1).join(' ') || ''}</span>
                                </div>
                            </div>
                            <div class="marker-pin">
                                <div class="marker-icon-inner" style="background-image: url(${iconPath})"></div>
                            </div>
                            <div class="marker-line"></div>
                        </div>
                    `;

                    el.onclick = () => {
                        handleOpenDetails(index);
                    };

                    const marker = new maplibregl.Marker({
                        element: el,
                        anchor: 'bottom-left'
                    })
                        .setLngLat(f.coords as [number, number])
                        .addTo(map.current!);
                    
                    markersRef.current[f.id] = marker;
                }
            });
        });

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            map.current?.remove();
        };
    }, []);

    const handleManualOpen = (index: number) => {
        setHighlightIndex(index);
        setIsManual(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsManual(false), 30000);
    };

    const handleOpenDetails = (index: number) => {
        handleManualOpen(index);
        setOpenDetailIndex(index);
    };

    const handleCloseDetails = () => {
        setOpenDetailIndex(null);
    };


    return (
        <div style={{
            width: '100%', height: '100%', position: 'relative',
            background: '#020B18', borderRadius: '12px', overflow: 'hidden',
        }}>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

            {openDetailIndex !== null && (
                <div
                    onClick={handleCloseDetails}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 100,
                        pointerEvents: 'auto',
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '80vw',
                            height: '80vh',
                            background: 'rgba(2, 11, 24, 0.98)',
                            border: '1px solid rgba(0,245,255,0.3)',
                            borderRadius: '12px',
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'grid',
                            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                            gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr)',
                        }}
                    >
                        <button
                            onClick={handleCloseDetails}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                width: '32px',
                                height: '32px',
                                border: '1px solid rgba(255,255,255,0.35)',
                                background: 'rgba(255,255,255,0.08)',
                                color: 'white',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                zIndex: 2,
                            }}
                        >
                            X
                        </button>
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                minWidth: 0,
                                minHeight: 0,
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                borderRight: '1px solid rgba(0,245,255,0.2)',
                                borderBottom: '1px solid rgba(0,245,255,0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#00f5ff',
                                // padding: '20px',
                                background: '#020B18'
                            }}
                        >
                            <img src="./imgs/scada12.png" alt="..." style={{ width: '100%', height: '100%' }} />
                        </div>
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                minWidth: 0,
                                minHeight: 0,
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                borderBottom: '1px solid rgba(0,245,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#00f5ff',
                                fontWeight: 'bold',
                                fontSize: '22px',
                            }}
                        >
                                <div className="view-model" style={{ width: '100%', height: "100%", padding: "20px", background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', boxSizing: 'border-box' }}>
                                    <div style={{ position: 'absolute', top: '15px', left: '20px', zIndex: 10, color: '#00f5ff', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        Tanlangan Zavod: {factorys[openDetailIndex]?.title}
                                    </div>
                                    <Canvas shadows camera={{ position: [0, 2, 5], fov: 40 }}>
                                        <ambientLight intensity={0.8} />
                                        <pointLight position={[10, 10, 10]} intensity={1.5} />
                                        <Suspense fallback={<Html center><div style={{ color: '#00f5ff' }}>Model yuklanmoqda...</div></Html>}>
                                            <FactoryViewer
                                                modelPath={factorys[openDetailIndex].factory_model}
                                                rotationSpeed={0.5}
                                                zoom={0.06}
                                            />
                                            <Environment preset="city" />
                                            <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={15} blur={3} />
                                        </Suspense>
                                        <OrbitControls enablePan={false} enableRotate={true} enableZoom={true} minDistance={2} maxDistance={15} />
                                    </Canvas>
                            </div>
                        </div>
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                minWidth: 0,
                                minHeight: 0,
                                overflow: 'auto',
                                boxSizing: 'border-box',
                                borderRight: '1px solid rgba(0,245,255,0.2)',
                                color: '#00f5ff',
                                fontWeight: 'bold',
                                fontSize: '22px',
                            }}
                        >
                            <ProjectDashboard />
                        </div>

                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                minWidth: 0,
                                minHeight: 0,
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#00f5ff',
                                fontWeight: 'bold',
                                fontSize: '22px',
                            }}
                        >
                            <StreamGrid />
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Map3D;