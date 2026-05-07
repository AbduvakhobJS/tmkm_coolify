import React, { Suspense, useRef, useEffect, useMemo, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { io, Socket } from 'socket.io-client';
import { factoryData } from '../data/factorys';
import StreamGrid from "./VideoStream";
import ProjectDashboard from "./ProjectDashboard";
import { uzbekistanBorder, loadUzbekistanBorder } from './uzbekistanBorder';

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

    .toifa-2 .marker-pin { border-color: #0EA8C7; }
    .toifa-2 .marker-line { background: #0EA8C7; }
    .toifa-2 .marker-title-tag { background: #0EA8C7; }
    .toifa-2 .marker-info-box { border-left-color: #0EA8C7; }

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
    const socketRef = useRef<Socket | null>(null);
    const [isManual, setIsManual] = React.useState(false);
    const [openDetailIndex, setOpenDetailIndex] = React.useState<number | null>(null);
    const timerRef = useRef<any>(null);
    const markersRef = useRef<Record<number, maplibregl.Marker>>({});
    const vehicleMarkersRef = useRef<Record<number, maplibregl.Marker>>({});
    const [visibleToifas, setVisibleToifas] = React.useState<string[]>(['toifa_1', 'toifa_2', 'toifa_3', 'toifa_4', 'toifa_5']);
    const [vehicles, setVehicles] = React.useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = React.useState<any | null>(null);
    const [wsConnected, setWsConnected] = React.useState(false);

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
                        'fill-color': '#0EA8C7',
                        'fill-opacity': 0.05
                    }
                });

                // Tashqi neon glow (katta)
                map.current.addLayer({
                    id: 'uzbekistan-outline-glow',
                    type: 'line',
                    source: 'uzbekistan-border',
                    paint: {
                        'line-color': '#0EA8C7',
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
                        'line-color': '#0EA8C7',
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
            updateMarkers();
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

    const updateMarkers = () => {
        if (!map.current) return;

        // Eskilarini tozalash
        Object.values(markersRef.current).forEach(m => m.remove());
        markersRef.current = {};

        factorys.forEach((f, index) => {
            if (f.coords && visibleToifas.includes(f.marker_icon || 'toifa_1')) {
                const el = document.createElement('div');
                const toifaNum = f.marker_icon?.split('_')[1] || '1';
                el.className = `custom-html-marker toifa-${toifaNum}`;

                let iconPath = '/icons/factory1.png';
                if (f.marker_icon === 'toifa_2') iconPath = '/icons/factory2.png';
                else if (f.marker_icon === 'toifa_3') iconPath = '/icons/factory3.png';
                else if (f.marker_icon === 'toifa_4') iconPath = '/icons/factory1.png';
                else if (f.marker_icon === 'toifa_5') iconPath = '/icons/factory2.png';

                el.innerHTML = `
                <div class="marker-pin-wrapper" style="transform: scale(0.65); transform-origin: bottom left;">
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
        
        updateVehicleMarkers();
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

    // Toifalar o'zgarganda markerlarni yangilash
    useEffect(() => {
        updateMarkers();
    }, [visibleToifas]);


    return (
        <div style={{
            width: '100%', height: '100%', position: 'relative',
            background: '#020B18', borderRadius: '12px', overflow: 'hidden',
        }}>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />

            {/* Filter Panel */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(2, 11, 24, 0.85)',
                border: '1px solid rgba(0, 245, 255, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                backdropFilter: 'blur(8px)',
                color: 'white',
                minWidth: '160px'
            }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid rgba(0, 245, 255, 0.2)', paddingBottom: '5px', marginBottom: '10px' }}>
                    FILTRLASH
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {[1, 2, 3, 4, 5].map(num => {
                        const toifa = `toifa_${num}`;
                        const isChecked = visibleToifas.includes(toifa);
                        const colors = ['#ff1493', '#0EA8C7', '#32cd32', '#ffa500', '#9370db'];
                        const color = colors[num - 1];
                        const label = `Toifa ${num}`;
                        
                        return (
                            <label key={toifa} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px', fontSize: '13px' }}>
                                <input 
                                    type="checkbox" 
                                    checked={isChecked} 
                                    onChange={() => toggleToifa(toifa)}
                                    style={{ cursor: 'pointer', accentColor: color }}
                                />
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 5px ${color}` }}></div>
                                {label}
                            </label>
                        );
                    })}
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px', fontSize: '13px' }}>
                        <input 
                            type="checkbox" 
                            checked={visibleToifas.includes('active_car')} 
                            onChange={() => toggleToifa('active_car')}
                            style={{ cursor: 'pointer', accentColor: '#39ff14' }}
                        />
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#39ff14', boxShadow: '0 0 5px #39ff14' }}></div>
                        Active
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px', fontSize: '13px' }}>
                        <input 
                            type="checkbox" 
                            checked={visibleToifas.includes('inactive_car')} 
                            onChange={() => toggleToifa('inactive_car')}
                            style={{ cursor: 'pointer', accentColor: '#ff2d55' }}
                        />
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff2d55', boxShadow: '0 0 5px #ff2d55' }}></div>
                        Inactive
                    </label>
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
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0EA8C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#0EA8C7', textTransform: 'uppercase', letterSpacing: '1px' }}>{selectedVehicle.name}</h3>
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#0EA8C7', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: '#0EA8C7', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase' }}>
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
                                    color: '#0EA8C7', 
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
                                color: '#0EA8C7',
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
                                color: '#0EA8C7',
                                fontWeight: 'bold',
                                fontSize: '22px',
                            }}
                        >
                                <div className="view-model" style={{ width: '100%', height: "100%", padding: "20px", background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', boxSizing: 'border-box' }}>
                                    <div style={{ position: 'absolute', top: '15px', left: '20px', zIndex: 10, color: '#0EA8C7', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        Tanlangan Zavod: {factorys[openDetailIndex]?.title}
                                    </div>

                                    <div style={{ position: 'absolute', bottom: '10px',
                                        right: '10px',
                                        zIndex: 10, color: '#00f5ff', fontWeight: 'bold',
                                        textTransform: 'uppercase', letterSpacing: '1px' ,
                                        backgroundColor: '#00f5ff33', padding: '5px 10px', borderRadius: '5px',
                                    }}>
                                        <div>
                              <span style={{ color: '#00f5ff', fontWeight: 'bold', fontSize: '10px'}}>
                                Hudud:
                              </span>
                                            <span style={{ color: '#00f5ff', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  Buxoro viloyati, Peshku tumani
                              </span>
                                        </div>
                                        <div>
                              <span style={{ color: '#00f5ff', fontWeight: 'bold', fontSize: '10px'}}>
                                NPV:
                              </span>
                                            <span style={{ color: '#00f5ff', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  49 mln. dollor
                              </span>
                                        </div>
                                        <div>
                              <span style={{ color: '#00f5ff', fontWeight: 'bold', fontSize: '10px'}}>
                                ROI:
                              </span>
                                            <span style={{ color: '#00f5ff', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                 6 yil 6 oy Investitsiya qoplanishi
                              </span>
                                        </div>
                                        <div>
                              <span style={{ color: '#00f5ff', fontWeight: 'bold', fontSize: '10px'}}>
                                Zaxira:
                              </span>
                                            <span style={{ color: '#00f5ff', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  9.17 mln. tonna
                              </span>
                                        </div>
                                    </div>
                                    <Canvas shadows camera={{ position: [0, 2, 5], fov: 40 }}>
                                        <ambientLight intensity={0.8} />
                                        <pointLight position={[10, 10, 10]} intensity={1.5} />
                                        <Suspense fallback={<Html center><div style={{ color: '#0EA8C7' }}>Model yuklanmoqda...</div></Html>}>
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
                                color: '#0EA8C7',
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
                                color: '#0EA8C7',
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