import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { factoryData } from '../data/factorys';
import StreamGrid from "./VideoStream";
import KpiCard from "./KpiCard";
import {EnergyChart, RealtimeChart} from "./Charts";
import ProjectsSection from "./ProjectsSection";

// 1. RIGHTPANEL VIEW MODEL
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
    useFrame(() => {
        if (ref.current) ref.current.rotation.y += 0.01 * rotationSpeed;
    });
    return (
        <group ref={ref} scale={zoom}>
            <primitive object={clonedScene} scale={0.35} />
        </group>
    );
};

const FactoryItem = ({
                         factory, isHighlighted, onManualOpen, index,
                     }: {
    factory: any; isHighlighted: boolean;
    onManualOpen: (i: number) => void; index: number;
}) => {
    const gltf = useGLTF(factory.map_model) as any;
    const clonedScene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
    const s = factory.map_model_scale;

    return (
        <group
            position={factory.position}
            rotation={factory.rotation || [0, 0, 0]}
            scale={s}
        >
            <mesh
                onClick={(e) => { e.stopPropagation(); onManualOpen(index); }}
                onPointerOver={() => (document.body.style.cursor = 'pointer')}
                onPointerOut={() => (document.body.style.cursor = 'auto')}
            >
                <boxGeometry args={[3000, 3000, 3000]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>

            <primitive object={clonedScene} />

            {isHighlighted && (
                <Html
                    position={[0, 260, 0]}
                    center
                    transform
                    distanceFactor={1200}
                    style={{ pointerEvents: 'none', zIndex: 1 }}
                >
                    {/* strelka animation */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            color: '#00f5ff',
                            textShadow: '0 0 14px rgba(0,245,255,0.95), 0 0 22px rgba(42,255,170,0.6)',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            position: 'relative',
                            minWidth: '120px',
                        }}
                    >
                        <span style={{ fontSize: '13px', letterSpacing: '1.8px', textTransform: 'uppercase' }}>
                            Zavod
                        </span>
                        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '50%',
                                    top: 0,
                                    width: '24px',
                                    height: '72px',
                                    borderRadius: '999px',
                                    border: '2px solid rgba(0,245,255,0.95)',
                                    transform: 'translateX(-50%)',
                                    boxShadow: '0 0 14px rgba(0,245,255,0.98), 0 0 24px rgba(42,255,170,0.75)',
                                    background: 'linear-gradient(180deg, rgba(0,245,255,0.72) 0%, rgba(0,245,255,0.18) 100%)',
                                    animation: 'map-icon-cylinder-run 1.8s ease-in-out infinite',
                                }}
                            />
                            {/*<span*/}
                            {/*    style={{*/}
                            {/*        position: 'absolute',*/}
                            {/*        left: '50%',*/}
                            {/*        bottom: '0px',*/}
                            {/*        width: '26px',*/}
                            {/*        height: '26px',*/}
                            {/*        borderRadius: '999px',*/}
                            {/*        border: '2px solid rgba(0,245,255,0.95)',*/}
                            {/*        transform: 'translate(-50%, 50%)',*/}
                            {/*        boxShadow: '0 0 18px rgba(0,245,255,0.95)',*/}
                            {/*        animation: 'map-icon-neon-ripple 1.6s ease-out infinite',*/}
                            {/*    }}*/}
                            {/*/>*/}
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
};

type CardSide = 'top' | 'bottom' | 'left' | 'right';

type OverlayLayout = {
    side: CardSide;
    sideIndex: number;
    sideTotal: number;
};

const CARD_GAP = 12;
const TOP_BOTTOM_COUNT = 5;
const SIDE_BASE_COUNT = 2;

const buildOverlayLayoutMap = (items: any[]): Record<number, OverlayLayout> => {
    const sortedItems = [...items].sort((a, b) => a.id - b.id);
    const topItems = sortedItems.slice(0, TOP_BOTTOM_COUNT);
    const bottomItems = sortedItems.slice(TOP_BOTTOM_COUNT, TOP_BOTTOM_COUNT * 2);
    const remainingItems = sortedItems.slice(TOP_BOTTOM_COUNT * 2);

    const leftItems = remainingItems.slice(0, SIDE_BASE_COUNT);
    const rightItems = remainingItems.slice(SIDE_BASE_COUNT, SIDE_BASE_COUNT * 2);

    remainingItems.slice(SIDE_BASE_COUNT * 2).forEach((item, idx) => {
        if (idx % 2 === 0) {
            leftItems.push(item);
        } else {
            rightItems.push(item);
        }
    });

    const layoutMap: Record<number, OverlayLayout> = {};
    const register = (side: CardSide, sideItems: any[]) => {
        sideItems.forEach((item, idx) => {
            layoutMap[item.id] = { side, sideIndex: idx, sideTotal: sideItems.length };
        });
    };

    register('top', topItems);
    register('bottom', bottomItems);
    register('left', leftItems);
    register('right', rightItems);

    return layoutMap;
};

const getOverlayPosition = (layout: OverlayLayout): React.CSSProperties => {
    const horizontalCardWidth = `calc((100% - ${(TOP_BOTTOM_COUNT - 1) * CARD_GAP}px) / ${TOP_BOTTOM_COUNT})`;

    if (layout.side === 'top') {
        return {
            top: '1px',
            left: `calc(${layout.sideIndex} * (${horizontalCardWidth} + ${CARD_GAP}px))`,
            width: horizontalCardWidth,
            transform: 'translateX(0)',
        };
    }

    if (layout.side === 'bottom') {
        return {
            bottom: '1px',
            left: `calc(${layout.sideIndex} * (${horizontalCardWidth} + ${CARD_GAP}px))`,
            width: horizontalCardWidth,
            transform: 'translateX(0)',
        };
    }

    const sideSpreadStart = 28;
    const sideSpreadEnd = 72;
    const sideTopPercent = layout.sideTotal <= 1
        ? 50
        : sideSpreadStart + (layout.sideIndex * (sideSpreadEnd - sideSpreadStart)) / (layout.sideTotal - 1);

    if (layout.side === 'left') {
        return {
            top: `${sideTopPercent}%`,
            left: '0px',
            width: '19%',
            transform: 'translateY(-50%)',
        };
    }

    return {
        top: `${sideTopPercent}%`,
        right: '0px',
        width: '19%',
        transform: 'translateY(-50%)',
    };
};

const FactoryLabelCard = ({
    factory,
    layout,
    isHighlighted,
    onManualOpen,
    onOpenDetails,
    index,
}: {
    factory: any;
    layout: OverlayLayout;
    isHighlighted: boolean;
    onManualOpen: (i: number) => void;
    onOpenDetails: (i: number) => void;
    index: number;
}) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(index);
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'absolute',
                ...getOverlayPosition(layout),
                borderRadius: '12px',
                border: isHighlighted
                    ? '2px solid #00f5ff'
                    : '1px solid rgba(0,245,255,0.2)',
                height: '20%',
                boxSizing: 'border-box',
                overflow: 'hidden',
                boxShadow: isHighlighted
                    ? '0 0 25px rgba(0,245,255,0.5)'
                    : '0 4px 15px rgba(0,0,0,0.5)',
                userSelect: 'none',
                pointerEvents: 'auto',
                transition: 'transform 0.4s ease, box-shadow 0.4s ease',
                transformOrigin: 'bottom center',
                zIndex: isHighlighted ? 30 : 20,
                cursor: 'pointer',
                backgroundImage: `url(${factory.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'flex-end',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `rgba(2, 11, 24, ${isHovered ? 0.7 : 0.5})`,
                    transition: 'background 0.3s ease',
                }}
            />

            <h3
                style={{
                    margin: 0,
                    fontSize: '13px',
                    color: '#00f5ff',
                    fontWeight: 'bold',
                    position: 'relative',
                    zIndex: 1,
                    padding: '12px',
                    width: '100%',
                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                }}
            >
                {factory.title}
            </h3>

            <a
                href={factory.link}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenDetails(index);
                }}
                style={{ display: 'none' }}
            >
                Batafsil ma'lumot
            </a>
        </div>
    );
};

// 3. XARITA
const MapBackground = () => {
    const { scene } = useGLTF('/models/map2.glb');
    return (
        <group scale={1000}>
            <primitive object={scene} />
        </group>
    );
};

// 4. KAMERA
const CameraHandler = ({ controlsRef }: { controlsRef: React.RefObject<any> }) => {
    useFrame((state) => {
        if (!controlsRef.current) return;
        const t = state.clock.getElapsedTime() * 0.04;
        const dist = controlsRef.current.getDistance();
        const polar = controlsRef.current.getPolarAngle();
        const angle = Math.sin(t) * 0.25;
        state.camera.position.set(
            Math.sin(angle) * dist * Math.sin(polar),
            dist * Math.cos(polar),
            Math.cos(angle) * dist * Math.sin(polar),
        );
        state.camera.lookAt(controlsRef.current.target);
    });
    return null;
};

// 5. ASOSIY
const Map3D = ({
                   highlightIndex,
                   setHighlightIndex,
               }: {
    highlightIndex: number;
    setHighlightIndex: React.Dispatch<React.SetStateAction<number>>;
}) => {
    const controlsRef = useRef<any>(null);
    const [isManual, setIsManual] = React.useState(false);
    const [openDetailIndex, setOpenDetailIndex] = React.useState<number | null>(null);
    const [selectedField, setSelectedField] = React.useState<number>(0);
    const [selectedBudget, setSelectedBudget] = React.useState<number>(0);
    const [selectedParam, setSelectedParam] = React.useState<number>(0);
    const timerRef = useRef<any>(null);
    const factorys = factoryData;
    const overlayLayoutMap = useMemo(() => buildOverlayLayoutMap(factorys), [factorys]);

    const extraFields = [
        { label: 'Maydoni', value: '104 ga' },
        { label: 'Temir yo‘lgacha', value: '75 km' },
        { label: 'Chiqindi zaxirasi', value: '29,0 mln tn' },
        { label: 'Elektr energiyagacha', value: '1,5 km' },
        { label: 'Yo‘ldosh komponentlar', value: 'Au, Ag, As' },
        { label: 'Aholi punkti Navoiy shahrigacha', value: '1,8 km' },
        { label: 'Foydali qazilmalarni o‘tish chuqurligi', value: '30-35 m' },
    ];

    const projectCosts = [
        { title: 'Loyihaning qiymati', value: '260 ming dollar', color: '#84cc16' },
        { title: 'Burg‘ilash ishlari', value: '8 ming dollar', color: '#22c55e' },
        { title: 'Metallurgiya sinovlari', value: '150 ming dollar', color: '#38bdf8' },
        { title: 'Namunalarni kimyoviy tahlillari', value: '2 ming dollar', color: '#a3e635' },
    ];

    const parameters = [
        'Takliflar olinishi',
        'TEO',
        'Qurilish loyihasi',
        'Qurilishni boshlash',
        'Qurilma to‘lovi',
        'Qurilmalarni o‘rnatish va ishga tushirish',
        'Texnik shartlar',
        'Yillik ishlab chiqarish',
        'Maydoni',
        'Konsepsiya',
        'Qurilmalar ro‘yxati',
        'Loyihalash (Layout)',
        'Qurilishni tugatish sanasi',
        'Ish o‘rni',
        'Loyihaning qiymati',
    ];

    useEffect(() => {
        if (!isManual) {
            const interval = setInterval(() => {
                setHighlightIndex(prev => (prev >= factorys.length - 1 ? 0 : prev + 1));
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [isManual, factorys.length]);

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
            <Canvas shadows camera={{ position: [0, 80, 150], fov: 45 }}>
                {/*<CameraHandler controlsRef={controlsRef} />*/}
                <ambientLight intensity={0.6} />
                <directionalLight position={[200, 200, 100]} intensity={1} castShadow />
                <Suspense fallback={
                    <Html center><div style={{ color: 'white' }}>Yuklanmoqda...</div></Html>
                }>
                    <MapBackground />
                    {factorys.map((f, i) => (
                        <FactoryItem
                            key={f.id}
                            factory={f}
                            index={i}
                            isHighlighted={highlightIndex === i}
                            onManualOpen={handleManualOpen}
                        />
                    ))}
                    <Environment preset="city" />
                    <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={1500} blur={2.5} far={20} />
                </Suspense>
                <OrbitControls
                    ref={controlsRef}
                    enablePan enableRotate enableZoom
                    minDistance={30} maxDistance={2000}
                    maxPolarAngle={Math.PI / 2.1} // Xarita pastiga tushmasligi uchun cheklov
                    makeDefault
                />
            </Canvas>

            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
                <style>{`
                    @keyframes map-icon-cylinder-run {
                        0% { opacity: 0.2; transform: translate(-50%, -10px); height: 72px; }
                        22% { opacity: 1; }
                        55% { opacity: 1; transform: translate(-50%, 24px); height: 34px; }
                        78% { opacity: 0.9; transform: translate(-50%, 40px); height: 18px; }
                        100% { opacity: 0; transform: translate(-50%, 56px); height: 72px; }
                    }
                    @keyframes map-icon-neon-ripple {
                        0% { opacity: 0.85; transform: translate(-50%, 50%) scale(0.55); }
                        70% { opacity: 0.25; }
                        100% { opacity: 0; transform: translate(-50%, 50%) scale(1.9); }
                    }
                `}</style>
                {factorys.map((f, i) => (
                    <FactoryLabelCard
                        key={`label-${f.id}`}
                        factory={f}
                        layout={overlayLayoutMap[f.id]}
                        index={i}
                        isHighlighted={highlightIndex === i}
                        onManualOpen={handleManualOpen}
                        onOpenDetails={handleOpenDetails}
                    />
                ))}
            </div>

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
                                borderRight: 0 % 2 === 0 ? '1px solid rgba(0,245,255,0.2)' : 'none',
                                borderBottom: 0 < 2 ? '1px solid rgba(0,245,255,0.2)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#00f5ff',
                                fontWeight: 'bold',
                                fontSize: '22px',
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
                                borderRight: 1 % 2 === 0 ? '1px solid rgba(0,245,255,0.2)' : 'none',
                                borderBottom: 1 < 2 ? '1px solid rgba(0,245,255,0.2)' : 'none',
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
                                        Tanlangan Zavod: {factorys[highlightIndex]?.title}
                                    </div>
                                    <Canvas shadows camera={{ position: [0, 2, 5], fov: 40 }}>
                                        <ambientLight intensity={0.8} />
                                        <pointLight position={[10, 10, 10]} intensity={1.5} />
                                        <Suspense fallback={<Html center><div style={{ color: '#00f5ff' }}>Model yuklanmoqda...</div></Html>}>
                                            <FactoryViewer
                                                modelPath={factorys[highlightIndex].factory_model}
                                                rotationSpeed={0.5}
                                                zoom={0.06} // factory.glb kichik bo'lgani uchun masshtabni mosladik
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
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                borderRight: 2 % 2 === 0 ? '1px solid rgba(0,245,255,0.2)' : 'none',
                                borderBottom: 2 < 2 ? '1px solid rgba(0,245,255,0.2)' : 'none',
                                // display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#00f5ff',
                                fontWeight: 'bold',
                                fontSize: '22px',
                            }}
                        >

                            {/*<div style={{*/}
                            {/*    width: '100%',*/}
                            {/*    height: '100%',*/}
                            {/*    display: 'grid',*/}
                            {/*    gridTemplateColumns: '1fr 1fr',*/}
                            {/*    gap: '10px',*/}
                            {/*    padding: '10px',*/}
                            {/*    boxSizing: 'border-box',*/}
                            {/*    color: 'white',*/}
                            {/*    fontSize: '14px',*/}
                            {/*    alignItems: 'stretch',*/}
                            {/*    background: 'linear-gradient(135deg, rgba(2,11,24,0.95), rgba(6,18,38,0.9))',*/}
                            {/*}}>*/}
                                {/*<div style={{*/}
                                {/*    border: '1px solid rgba(132,204,22,0.28)',*/}
                                {/*    borderRadius: '10px',*/}
                                {/*    background: 'rgba(124, 190, 42, 0.08)',*/}
                                {/*    minWidth: 0,*/}
                                {/*    minHeight: 0,*/}
                                {/*    overflow: 'auto',*/}
                                {/*    padding: '10px',*/}
                                {/*    boxSizing: 'border-box',*/}
                                {/*    boxShadow: 'inset 0 0 20px rgba(132,204,22,0.08)',*/}
                                {/*}}>*/}
                                    {/*<div style={{ marginBottom: '8px', color: '#d9f99d', fontWeight: 700 }}>Qo‘shimcha maydonlar</div>*/}
                                    {/*{extraFields.map((item, idx) => (*/}
                                    {/*    <button*/}
                                    {/*        key={item.label}*/}
                                    {/*        onClick={() => setSelectedField(idx)}*/}
                                    {/*        style={{*/}
                                    {/*            width: '100%',*/}
                                    {/*            textAlign: 'left',*/}
                                    {/*            marginBottom: '6px',*/}
                                    {/*            borderRadius: '8px',*/}
                                    {/*            border: idx === selectedField ? '1px solid #84cc16' : '1px solid rgba(255,255,255,0.08)',*/}
                                    {/*            background: idx === selectedField ? 'rgba(132,204,22,0.16)' : 'rgba(255,255,255,0.03)',*/}
                                    {/*            color: 'white',*/}
                                    {/*            padding: '8px',*/}
                                    {/*            cursor: 'pointer',*/}
                                    {/*            transition: 'all .2s ease',*/}
                                    {/*            boxShadow: idx === selectedField ? '0 0 0 1px rgba(132,204,22,0.22), 0 8px 16px rgba(132,204,22,0.12)' : 'none',*/}
                                    {/*        }}*/}
                                    {/*    >*/}
                                    {/*        <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '4px' }}>{item.label}</div>*/}
                                    {/*        <div style={{ fontSize: '16px', fontWeight: 700, color: '#ecfccb' }}>{item.value}</div>*/}
                                    {/*    </button>*/}
                                    {/*))}*/}
                                {/*</div>*/}

                                {/*<div style={{*/}
                                {/*    border: '1px solid rgba(56,189,248,0.3)',*/}
                                {/*    borderRadius: '10px',*/}
                                {/*    background: 'rgba(56,189,248,0.07)',*/}
                                {/*    minWidth: 0,*/}
                                {/*    minHeight: 0,*/}
                                {/*    overflow: 'auto',*/}
                                {/*    padding: '10px',*/}
                                {/*    boxSizing: 'border-box',*/}
                                {/*    boxShadow: 'inset 0 0 20px rgba(56,189,248,0.08)',*/}
                                {/*}}>*/}
                                {/*    <div style={{ marginBottom: '8px', color: '#bae6fd', fontWeight: 700 }}>Loyiha qiymatlari</div>*/}
                                {/*    {projectCosts.map((item, idx) => (*/}
                                {/*        <button*/}
                                {/*            key={item.title}*/}
                                {/*            onClick={() => setSelectedBudget(idx)}*/}
                                {/*            style={{*/}
                                {/*                width: '100%',*/}
                                {/*                marginBottom: '8px',*/}
                                {/*                borderRadius: '10px',*/}
                                {/*                border: idx === selectedBudget ? `1px solid ${item.color}` : '1px solid rgba(255,255,255,0.1)',*/}
                                {/*                background: idx === selectedBudget ? `${item.color}22` : 'rgba(255,255,255,0.03)',*/}
                                {/*                color: 'white',*/}
                                {/*                padding: '10px',*/}
                                {/*                cursor: 'pointer',*/}
                                {/*                transition: 'all .2s ease',*/}
                                {/*                boxShadow: idx === selectedBudget ? `0 0 0 1px ${item.color}44, 0 10px 18px ${item.color}22` : 'none',*/}
                                {/*            }}*/}
                                {/*        >*/}
                                {/*            <div style={{ fontSize: '12px', opacity: 0.85 }}>{item.title}</div>*/}
                                {/*            <div style={{ fontSize: '28px', fontWeight: 800, color: item.color }}>{item.value}</div>*/}
                                {/*        </button>*/}
                                {/*    ))}*/}
                                {/*</div>*/}

                                {/*<div style={{*/}
                                {/*    gridColumn: '1 / -1',*/}
                                {/*    border: '1px solid rgba(34,211,238,0.28)',*/}
                                {/*    borderRadius: '10px',*/}
                                {/*    background: 'rgba(34,211,238,0.07)',*/}
                                {/*    minWidth: 0,*/}
                                {/*    minHeight: 0,*/}
                                {/*    overflow: 'auto',*/}
                                {/*    padding: '10px',*/}
                                {/*    boxSizing: 'border-box',*/}
                                {/*    boxShadow: 'inset 0 0 20px rgba(34,211,238,0.08)',*/}
                                {/*}}>*/}
                                {/*    <div style={{ marginBottom: '8px', color: '#a5f3fc', fontWeight: 700 }}>Parametrlar</div>*/}
                                {/*    <div style={{*/}
                                {/*        display: 'grid',*/}
                                {/*        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',*/}
                                {/*        gap: '8px',*/}
                                {/*    }}>*/}
                                {/*        {parameters.map((item, idx) => (*/}
                                {/*            <button*/}
                                {/*                key={item}*/}
                                {/*                onClick={() => setSelectedParam(idx)}*/}
                                {/*                style={{*/}
                                {/*                    textAlign: 'left',*/}
                                {/*                    borderRadius: '8px',*/}
                                {/*                    border: idx === selectedParam ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.1)',*/}
                                {/*                    background: idx === selectedParam ? 'rgba(34,211,238,0.12)' : 'rgba(255,255,255,0.03)',*/}
                                {/*                    color: 'white',*/}
                                {/*                    padding: '8px 10px',*/}
                                {/*                    cursor: 'pointer',*/}
                                {/*                    display: 'flex',*/}
                                {/*                    alignItems: 'center',*/}
                                {/*                    justifyContent: 'space-between',*/}
                                {/*                    gap: '8px',*/}
                                {/*                    transition: 'all .2s ease',*/}
                                {/*                    boxShadow: idx === selectedParam ? '0 8px 16px rgba(34,211,238,0.14)' : 'none',*/}
                                {/*                }}*/}
                                {/*            >*/}
                                {/*                <span style={{ fontSize: '12px' }}>{item}</span>*/}
                                {/*                <span style={{*/}
                                {/*                    fontSize: '11px',*/}
                                {/*                    padding: '2px 8px',*/}
                                {/*                    borderRadius: '999px',*/}
                                {/*                    background: 'rgba(255,255,255,0.12)',*/}
                                {/*                    whiteSpace: 'nowrap',*/}
                                {/*                }}>{idx === selectedParam ? 'Faol' : 'Normal'}</span>*/}
                                {/*            </button>*/}
                                {/*        ))}*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                            {/*</div>*/}

                            <div style={{
                                width: '100%',
                                display: 'grid',
                                padding: '10px',
                                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                                gap: '10px',
                            }}>
                                <KpiCard
                                    icon="🏭"
                                    target={2847193}
                                    decimals={0}
                                    unit="tonnes"
                                    label="Total Output YTD"
                                    trend="▲ 12.4%"
                                    trendUp={true}
                                />
                                <KpiCard
                                    icon="⚙️"
                                    target={18}
                                    decimals={0}
                                    unit="active"
                                    label="Operating Facilities"
                                    trend="▲ 2"
                                    trendUp={true}
                                />
                                <KpiCard
                                    icon="📊"
                                    target={94.7}
                                    decimals={1}
                                    unit="%"
                                    label="Avg. Efficiency"
                                    trend="▼ 0.3%"
                                    trendUp={false}
                                />
                                <KpiCard
                                    icon="👷"
                                    target={34219}
                                    decimals={0}
                                    unit="personnel"
                                    label="Active Workforce"
                                    trend="▲ 847"
                                    trendUp={true}
                                />
                                <KpiCard
                                    icon="🏭"
                                    target={2847193}
                                    decimals={0}
                                    unit="tonnes"
                                    label="Total Output YTD"
                                    trend="▲ 12.4%"
                                    trendUp={true}
                                />
                                <KpiCard
                                    icon="⚙️"
                                    target={18}
                                    decimals={0}
                                    unit="active"
                                    label="Operating Facilities"
                                    trend="▲ 2"
                                    trendUp={true}
                                />
                                <KpiCard
                                    icon="📊"
                                    target={94.7}
                                    decimals={1}
                                    unit="%"
                                    label="Avg. Efficiency"
                                    trend="▼ 0.3%"
                                    trendUp={false}
                                />
                                <KpiCard
                                    icon="👷"
                                    target={34219}
                                    decimals={0}
                                    unit="personnel"
                                    label="Active Workforce"
                                    trend="▲ 847"
                                    trendUp={true}
                                />
                            </div>

                            <div style={{
                                width: '100%',
                                height: '100%',
                                padding: '10px',
                                minWidth: 0,
                                minHeight: 0,
                                display: 'flex',
                                gap: '10px',
                                boxSizing: 'border-box',
                                overflow: 'hidden',
                            }}>
                                <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                                    <EnergyChart />
                                </div>
                                <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                                    <RealtimeChart />
                                </div>

                            </div>
                        </div>

                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                minWidth: 0,
                                minHeight: 0,
                                overflow: 'hidden',
                                boxSizing: 'border-box',
                                borderRight: 3 % 2 === 0 ? '1px solid rgba(0,245,255,0.2)' : 'none',
                                borderBottom: 3 < 2 ? '1px solid rgba(0,245,255,0.2)' : 'none',
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