import React, { useRef } from "react";
import {
    AdaptiveDpr,
    AdaptiveEvents,
    BakeShadows,
    Cloud,
    Clouds,
    ContactShadows,
    Environment,
    OrbitControls,
    Sky,
} from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
    BLOOM_INTENSITY,
    BLOOM_LUMINANCE_SMOOTHING,
    BLOOM_LUMINANCE_THRESHOLD,
    BUILDING_MARKERS,
    FOG_COLOR,
    FOG_FAR,
    FOG_NEAR,
    ORBIT_DAMPING,
    ORBIT_MAX_DISTANCE,
    ORBIT_MAX_POLAR_ANGLE,
    ORBIT_MIN_DISTANCE,
    SCENE_BACKGROUND,
} from "../constants";
import type { BuildingMarker } from "../types";
import CameraMarker from "./CameraMarker";
import FactoryModelMesh from "./FactoryModelMesh";
import FpsControls from "./FpsControls";

interface FactorySceneProps {
    onSelectMarker: (marker: BuildingMarker) => void;
}

/**
 * All in-Canvas content: premium HDRI-lit environment, soft key light + contact
 * shadows, drifting clouds, light fog, the normalised factory model, billboard
 * CCTV markers, user-driven OrbitControls + WASD walk, and a subtle bloom pass.
 */
const FactoryScene: React.FC<FactorySceneProps> = ({ onSelectMarker }) => {
    const controlsRef = useRef<OrbitControlsImpl | null>(null);
    const modelRef = useRef<THREE.Group | null>(null);

    return (
        <>
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            <BakeShadows />

            <Sky 
                distance={450000} 
                sunPosition={[5, 1, 8]} 
                inclination={0.6} 
                azimuth={0.25} 
                mieCoefficient={0.005}
                mieDirectionalG={0.8}
                rayleigh={3}
                turbidity={10}
            />
            <fog attach="fog" args={["#0a1428", 30, 160]} />

            {/* ── Lighting ─────────────────────────────────────────────────── */}
            <ambientLight intensity={0.55} color="#cfe6ff" />
            <hemisphereLight args={["#bcd8ff", "#0a1428", 0.6]} />
            <directionalLight
                position={[24, 34, 18]}
                intensity={1.85}
                color="#ffffff"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-near={1}
                shadow-camera-far={120}
                shadow-camera-left={-40}
                shadow-camera-right={40}
                shadow-camera-top={40}
                shadow-camera-bottom={-40}
                shadow-bias={-0.0004}
            />

            {/* ── Environment reflections + atmosphere ─────────────────────── */}
            <Environment preset="city" />
            <Clouds material={THREE.MeshBasicMaterial} limit={100}>
                <Cloud
                    seed={7}
                    segments={20}
                    bounds={[60, 6, 60]}
                    volume={6}
                    color="#43617f"
                    opacity={0.12}
                    position={[0, 34, -6]}
                    speed={0.1}
                />
            </Clouds>

            {/* ── Factory model ────────────────────────────────────────────── */}
            <FactoryModelMesh onReady={(g) => (modelRef.current = g)} />

            {/* ── Ground contact shadow ────────────────────────────────────── */}
            <ContactShadows
                position={[0, 0.01, 0]}
                opacity={0.62}
                scale={70}
                blur={2.6}
                far={30}
                resolution={512}
                color="#02060f"
            />

            {/* ── Building markers ─────────────────────────────────────────── */}
            {BUILDING_MARKERS.map((marker) => (
                <CameraMarker key={marker.id} marker={marker} onSelect={onSelectMarker} />
            ))}

            {/* ── Camera controls ──────────────────────────────────────────── */}
            <OrbitControls
                ref={controlsRef}
                enableDamping
                dampingFactor={ORBIT_DAMPING}
                enablePan
                enableZoom
                enableRotate
                minDistance={ORBIT_MIN_DISTANCE}
                maxDistance={ORBIT_MAX_DISTANCE}
                maxPolarAngle={Math.PI / 2.2}
                makeDefault
            />
            <FpsControls controlsRef={controlsRef} modelRef={modelRef} />

            {/* ── Post-processing ──────────────────────────────────────────── */}
            <EffectComposer enableNormalPass={false}>
                <Bloom
                    intensity={BLOOM_INTENSITY}
                    luminanceThreshold={BLOOM_LUMINANCE_THRESHOLD}
                    luminanceSmoothing={BLOOM_LUMINANCE_SMOOTHING}
                    mipmapBlur
                />
                <Vignette eskil={false} offset={0.22} darkness={0.72} />
            </EffectComposer>
        </>
    );
};

export default FactoryScene;
