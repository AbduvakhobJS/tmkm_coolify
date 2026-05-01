import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { factoryData } from '../data/factorys';
import StreamGrid from "./VideoStream";
import KpiCard from "./KpiCard";
import {EnergyChart, RealtimeChart} from "./Charts";
import ProjectDashboard from "./ProjectDashboard";

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

    useEffect(() => {
        if (!mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://api.maptiler.com/maps/019de314-aca9-7a9c-b341-37636688bb6a/style.json?key=YqciQrrpszIp23MCz2am',
            // center: [longitude, latitude] - Xarita yuklanganda ko'rinadigan markaziy nuqta
            // O'zbekiston markazi uchun taxminan: [66.9, 40.0]
            center: [66.9, 40.0], 
            // zoom: Xarita yaqinligi. 0-22 gacha. 
            // 6 - mamlakat darajasi, 10 - viloyat, 15 - shahar/tuman
            zoom: 6
        });

        map.current.on('load', () => {
            factorys.forEach((f, index) => {
                if (f.coords) {
                    // Marker elementini yaratish
                    const el = document.createElement('div');
                    el.className = 'custom-marker';
                    el.style.width = '64px';
                    el.style.height = '64px';
                    el.style.cursor = 'pointer';
                    el.style.display = 'flex';
                    el.style.alignItems = 'center';
                    el.style.justifyContent = 'center';
                    el.style.backgroundSize = 'contain';
                    el.style.backgroundRepeat = 'no-repeat';
                    el.style.backgroundPosition = 'center';
                    // Transition markerning silliq o'zgarishi (scale/filter) uchun.
                    // MUHIM: MapLibre-gl markerlarni o'zi absolute position bilan boshqaradi,
                    // shuning uchun transition faqat transform va filterga berilgan.
                    // Agar drag paytida qotish bo'lsa, transitionni butunlay olib tashlash tavsiya etiladi.
                    el.style.transition = 'transform 0.3s ease, filter 0.3s ease';
                    el.style.willChange = 'transform'; // GPU renderlash uchun

                    // Toifaga qarab rasm tanlash
                    let iconPath = '/icons/factory1.png';
                    if (f.marker_icon === 'toifa_2') iconPath = '/icons/factory2.png';
                    else if (f.marker_icon === 'toifa_3') iconPath = '/icons/factory3.png';
                    
                    el.style.backgroundImage = `url(${iconPath})`;

                    el.onclick = () => {
                        handleOpenDetails(index);
                    };

                    const marker = new maplibregl.Marker({ element: el })
                        .setLngLat(f.coords as [number, number])
                        .addTo(map.current!);
                    
                    markersRef.current[f.id] = marker;
                }
            });
        });

        return () => {
            map.current?.remove();
        };
    }, []);

    useEffect(() => {
        if (!isManual) {
            const interval = setInterval(() => {
                setHighlightIndex(prev => (prev >= factorys.length - 1 ? 0 : prev + 1));
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [isManual, factorys.length]);

    // Highlight o'zgarganda xaritani markerga yo'naltirish
    useEffect(() => {
        const currentFactory = factorys[highlightIndex];
        if (currentFactory?.coords && map.current) {
            map.current.flyTo({
                center: currentFactory.coords as [number, number],
                zoom: 10,
                speed: 1.2
            });

            // Markerni vizual ajratish (highlight effect)
            Object.values(markersRef.current).forEach(m => {
                const el = m.getElement();
                el.style.transform = 'scale(1)';
                el.style.filter = 'none';
            });

            const activeMarker = markersRef.current[currentFactory.id];
            if (activeMarker) {
                const activeEl = activeMarker.getElement();
                activeEl.style.transform = 'scale(1.4)';
                activeEl.style.filter = 'drop-shadow(0 0 10px #00f5ff)';
            }
        }
    }, [highlightIndex, factorys]);

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
                            {/*<div style={{ marginTop: '20px', width: '100%', textAlign: 'left' }}>*/}
                            {/*    <div style={{ fontSize: '18px', marginBottom: '10px' }}>Korxona: {factorys[openDetailIndex]?.enterprise_name || 'Noma\'lum'}</div>*/}
                            {/*    <div style={{ fontSize: '16px', opacity: 0.8 }}>Maqsad: {factorys[openDetailIndex]?.projectGoal || 'Noma\'lum'}</div>*/}
                            {/*    <div style={{ fontSize: '16px', opacity: 0.8 }}>Holat: {factorys[openDetailIndex]?.status || 'Noma\'lum'}</div>*/}
                            {/*    <div style={{ fontSize: '14px', marginTop: '10px', color: '#fff', opacity: 0.6 }}>{factorys[openDetailIndex]?.content}</div>*/}
                            {/*</div>*/}
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
                            {/*<div style={{*/}
                            {/*    width: '100%',*/}
                            {/*    display: 'grid',*/}
                            {/*    padding: '10px',*/}
                            {/*    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',*/}
                            {/*    gap: '10px',*/}
                            {/*}}>*/}
                            {/*    <KpiCard icon="🏭" target={2847193} decimals={0} unit="tonnes" label="Total Output YTD" trend="▲ 12.4%" trendUp={true} />*/}
                            {/*    <KpiCard icon="⚙️" target={18} decimals={0} unit="active" label="Operating Facilities" trend="▲ 2" trendUp={true} />*/}
                            {/*    <KpiCard icon="📊" target={94.7} decimals={1} unit="%" label="Avg. Efficiency" trend="▼ 0.3%" trendUp={false} />*/}
                            {/*    <KpiCard icon="👷" target={34219} decimals={0} unit="personnel" label="Active Workforce" trend="▲ 847" trendUp={true} />*/}
                            {/*</div>*/}

                            {/*<div style={{*/}
                            {/*    width: '100%',*/}
                            {/*    padding: '10px',*/}
                            {/*    boxSizing: 'border-box',*/}
                            {/*}}>*/}
                            {/*    <EnergyChart />*/}
                            {/*    <RealtimeChart />*/}
                            {/*</div>*/}

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