import React, { useRef } from "react";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ORBIT_DAMPING, PAVILION_GROUND_RADIUS } from "../constants";
import { useFurnaceTelemetry } from "../hooks/useFurnaceTelemetry";
import FpsControls from "./FpsControls";
import PavilionModelMesh from "./PavilionModelMesh";

/**
 * All in-Canvas content for the pavilion-interior walkthrough: warm interior
 * lighting, the normalised det.glb model (its 6 furnaces tinted + a live
 * instrument readout floating above each one, both driven by ThingsBoard
 * telemetry — see PavilionModelMesh), ground + contact shadow, and orbit
 * look-around + WASD walk (reusing the same FpsControls as the main scene).
 */
const PavilionScene: React.FC = () => {
    const controlsRef = useRef<OrbitControlsImpl | null>(null);
    const modelRef = useRef<THREE.Group | null>(null);

    // Only polls ThingsBoard while this scene is actually mounted (i.e. the
    // pavilion modal is open) — see useFurnaceTelemetry.
    const { furnaces, setHistoryRange } = useFurnaceTelemetry(true);

    return (
        <>
            <color attach="background" args={["#04070d"]} />
            <fog attach="fog" args={["#04070d", 20, 75]} />

            <ambientLight intensity={0.5} color="#cfe6ff" />
            <hemisphereLight args={["#bcd8ff", "#04070d", 0.5]} />
            <directionalLight
                position={[14, 20, 10]}
                intensity={1.7}
                color="#fff3d6"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-near={1}
                shadow-camera-far={80}
                shadow-camera-left={-30}
                shadow-camera-right={30}
                shadow-camera-top={30}
                shadow-camera-bottom={-30}
                shadow-bias={-0.0004}
                shadow-normalBias={0.02}
            />

            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[PAVILION_GROUND_RADIUS, 64]} />
                <meshStandardMaterial color="#0b1420" roughness={0.92} metalness={0.06} />
            </mesh>

            <PavilionModelMesh
                onReady={(g) => (modelRef.current = g)}
                furnaces={furnaces}
                onHistoryRangeChange={setHistoryRange}
            />

            <ContactShadows
                position={[0, 0.01, 0]}
                opacity={0.55}
                scale={70}
                blur={2.4}
                far={26}
                resolution={512}
                color="#01040a"
            />

            <Environment files="/models/sunsun.hdr" background={false} environmentIntensity={0.55} />

            <OrbitControls
                ref={controlsRef}
                enableDamping
                dampingFactor={ORBIT_DAMPING}
                enablePan={false}
                enableZoom
                enableRotate
                minDistance={1.5}
                maxDistance={40}
                maxPolarAngle={Math.PI / 2.1}
                makeDefault
            />
            <FpsControls controlsRef={controlsRef} modelRef={modelRef} />
        </>
    );
};

export default PavilionScene;
