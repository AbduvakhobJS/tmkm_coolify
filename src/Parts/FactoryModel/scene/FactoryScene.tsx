import React, { useRef } from "react";
import {
    AdaptiveEvents,
    BakeShadows,
    Cloud,
    Clouds,
    ContactShadows,
    Environment,
    Lightformer,
    OrbitControls,
    Sky,
} from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
    BUILDING_MARKERS,
    FOG_COLOR,
    FOG_FAR,
    FOG_NEAR,
    GROUND_COLOR,
    GROUND_RADIUS,
    ORBIT_DAMPING,
    ORBIT_MAX_DISTANCE,
    ORBIT_MAX_POLAR_ANGLE,
    ORBIT_MIN_DISTANCE,
    SCENE_BACKGROUND,
    SKY_DISTANCE,
    VIDEO_MARKERS,
    WARNING_MARKERS,
} from "../constants";
import type { BuildingMarker, VideoMarker, WarningMarker } from "../types";
import CameraMarker from "./CameraMarker";
import FactoryModelMesh from "./FactoryModelMesh";
import FpsControls from "./FpsControls";
import VideoMarkerMesh from "./VideoMarkerMesh";
import WarningMarkerMesh from "./WarningMarkerMesh";

interface FactorySceneProps {
    onSelectMarker: (marker: BuildingMarker) => void;
    openVideos: Record<string, boolean>;
    onToggleVideo: (marker: VideoMarker) => void;
    onExpandVideo: (marker: VideoMarker) => void;
    openWarnings: Record<string, boolean>;
    onToggleWarning: (marker: WarningMarker) => void;
    onExpandWarning: (marker: WarningMarker) => void;
}

/**
 * All in-Canvas content: sky + ground + fog atmosphere, soft key light + contact
 * shadows, drifting clouds, the normalised factory model, billboard CCTV
 * markers, and user-driven OrbitControls + WASD walk.
 */
const FactoryScene: React.FC<FactorySceneProps> = ({
    onSelectMarker,
    openVideos,
    onToggleVideo,
    onExpandVideo,
    openWarnings,
    onToggleWarning,
    onExpandWarning,
}) => {
    const controlsRef = useRef<OrbitControlsImpl | null>(null);
    const modelRef = useRef<THREE.Group | null>(null);

    return (
        <>
            <AdaptiveEvents />
            <BakeShadows />

            {/* Fallback paint behind the sky dome — without this, any pixel the
               dome doesn't cover (e.g. once it's pushed past the camera's far
               clip) renders as flat black instead of the scene's night-sky tone. */}
            <color attach="background" args={[SCENE_BACKGROUND]} />

            <Sky
                distance={SKY_DISTANCE}
                sunPosition={[5, 1, 8]}
                inclination={0.6}
                azimuth={0.25}
                mieCoefficient={0.005}
                mieDirectionalG={0.8}
                rayleigh={3}
                turbidity={10}
            />
            <fog attach="fog" args={[FOG_COLOR, FOG_NEAR, FOG_FAR]} />

            {/* ── Lighting ─────────────────────────────────────────────────── */}
            <ambientLight intensity={0.55} color="#cfe6ff" />
            <hemisphereLight args={["#bcd8ff", "#0a1428", 0.6]} />
            <directionalLight
                position={[24, 34, 18]}
                intensity={2.4}
                color="#fff3d6"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-near={1}
                shadow-camera-far={120}
                shadow-camera-left={-40}
                shadow-camera-right={40}
                shadow-camera-top={40}
                shadow-camera-bottom={-40}
                shadow-bias={-0.0004}
                shadow-normalBias={0.02}
            />

            {/* ── Reflections for glass/metal surfaces ────────────────────────
               Procedural env map (no external HDRI, nothing fetched over the
               network) so glass windows on the model actually catch highlights
               instead of looking flat. The bright panel is aimed to match the
               directional "sun" above so the reflected glint lines up with it. */}
            {/*<Environment resolution={256} frames={1}>*/}
            {/*    <Lightformer form="rect" intensity={6} color="#fff3d6" position={[24, 34, 18]} scale={[14, 14, 1]} />*/}
            {/*    <Lightformer form="rect" intensity={1.4} color="#bcd8ff" position={[0, 30, -20]} scale={[50, 25, 1]} />*/}
            {/*    <Lightformer form="ring" intensity={0.8} color="#eafaff" position={[-25, 15, 15]} scale={[16, 16, 1]} />*/}
            {/*</Environment>*/}

            {/* ── Atmosphere ───────────────────────────────────────────────── */}
            {/*<Clouds material={THREE.MeshBasicMaterial} limit={100}>*/}
            {/*    <Cloud*/}
            {/*        seed={7}*/}
            {/*        segments={20}*/}
            {/*        bounds={[60, 6, 60]}*/}
            {/*        volume={6}*/}
            {/*        color="#43617f"*/}
            {/*        opacity={0.12}*/}
            {/*        position={[0, 34, -6]}*/}
            {/*        speed={0.1}*/}
            {/*    />*/}
            {/*</Clouds>*/}

            {/* ── Ground ───────────────────────────────────────────────────── */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[GROUND_RADIUS, 64]} />
                <meshStandardMaterial color={GROUND_COLOR} roughness={0.95} metalness={0.05} />
            </mesh>

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

            {/* ── Video (CCTV) markers ─────────────────────────────────────── */}
            {VIDEO_MARKERS.map((marker) => (
                <VideoMarkerMesh
                    key={marker.id}
                    marker={marker}
                    isOpen={!!openVideos[marker.id]}
                    onToggle={onToggleVideo}
                    onExpand={onExpandVideo}
                />
            ))}

            {/* ── Warning markers ──────────────────────────────────────────── */}
            {WARNING_MARKERS.map((marker) => (
                <WarningMarkerMesh
                    key={marker.id}
                    marker={marker}
                    isOpen={!!openWarnings[marker.id]}
                    onToggle={onToggleWarning}
                    onExpand={onExpandWarning}
                />
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
            <Environment
                files="/models/sunsun.hdr"
                background={true} // fon sifatida ham ishlatadi
                backgroundBlurriness={0.25}
                environmentIntensity={0.8}
            />
            <FpsControls controlsRef={controlsRef} modelRef={modelRef} />
        </>
    );
};

export default FactoryScene;
