import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, Sky } from "@react-three/drei";
import FactoryModelMesh from "./scene/FactoryModelMesh";
import type { BuildingMarker, MarkerType } from "./types";
import "./factoryModel.css";
import { GC } from '../../theme/palette';

/**
 * Minimal, from-scratch factory viewer — same factory_model.glb, same building
 * markers, but deliberately stripped of everything FactoryModel/FactoryScene
 * carried (EffectComposer + Bloom/Vignette, AdaptiveDpr, ContactShadows, side
 * panels). It's a clean baseline to confirm the model + markers render
 * correctly on their own, isolated from that machinery.
 */

const MARKER_HEIGHT = 0.6;

const BUILDING_MARKERS: BuildingMarker[] = [
    { id: "bld-01", building: "Production", cameraName: "CAM-01 · Smelter", position: [-5, MARKER_HEIGHT, -4.9], streamIndex: 0, type: "into" },
    { id: "bld-02", building: "Electrolysis Plant", cameraName: "CAM-02 · Electro", position: [-3, MARKER_HEIGHT, -8.1], streamIndex: 1, type: "into" },
    { id: "bld-03", building: "Production", cameraName: "CAM-03 · Casting", position: [3, MARKER_HEIGHT, -8.1], streamIndex: 2, type: "into" },
    { id: "bld-04", building: "Power Substation", cameraName: "CAM-04 · Power", position: [6.5, MARKER_HEIGHT, -1], streamIndex: 2, type: "into" },
    { id: "bld-05", building: "Warehouse North", cameraName: "CAM-05 · WH-North", position: [7, MARKER_HEIGHT, 5], streamIndex: 0, type: "into" },
    { id: "bld-06", building: "Logistics Terminal", cameraName: "CAM-06 · Logistics", position: [1, MARKER_HEIGHT, -1], streamIndex: 1, type: "into" },
    { id: "bld-07", building: "Chemical Storage", cameraName: "CAM-07 · Chemicals", position: [-5, MARKER_HEIGHT, 3.4], streamIndex: 2, type: "into" },
    { id: "bld-08", building: "Control Center", cameraName: "CAM-08 · Control", position: [-5, MARKER_HEIGHT, -1.2], streamIndex: 3, type: "into" },
    { id: "bld-09", building: "Refinery Unit", cameraName: "CAM-09 · Refinery", position: [-5, MARKER_HEIGHT, -3.1], streamIndex: 0, type: "into" },
    { id: "bld-10", building: "Quality Lab", cameraName: "CAM-10 · QC Lab", position: [3, MARKER_HEIGHT, 1], streamIndex: 1, type: "into" },
];

const MARKER_COLOR: Record<MarkerType, string> = {
    scada: GC.violet,
    energy: GC.amber,
    production: GC.green,
    staff: GC.red,
    camera: GC.cyan,
    into: GC.cyan,
};

const Marker: React.FC<{ marker: BuildingMarker }> = ({ marker }) => (
    <Html position={marker.position} center distanceFactor={9} zIndexRange={[10, 0]}>
        <div
            title={`${marker.building} — ${marker.cameraName}`}
            style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: MARKER_COLOR[marker.type],
                border: "2px solid #eafaff",
                boxShadow: `0 0 12px ${MARKER_COLOR[marker.type]}`,
                cursor: "pointer",
            }}
        />
    </Html>
);

const Ground: React.FC = () => (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[220, 64]} />
        <meshStandardMaterial color="#0b1626" roughness={0.95} metalness={0.05} />
    </mesh>
);

const Scene: React.FC = () => (
    <>
        <color attach="background" args={["#050b1a"]} />
        <Sky distance={400} sunPosition={[10, 8, 10]} turbidity={8} rayleigh={1.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
        <fog attach="fog" args={["#0a1428", 30, 160]} />

        <ambientLight intensity={0.6} color="#cfe6ff" />
        <hemisphereLight args={["#bcd8ff", "#0a1428", 0.6]} />
        <directionalLight
            position={[24, 34, 18]}
            intensity={1.8}
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
            shadow-normalBias={0.02}
        />

        <Ground />
        <FactoryModelMesh />

        {BUILDING_MARKERS.map((marker) => (
            <Marker key={marker.id} marker={marker} />
        ))}

        <OrbitControls
            enableDamping
            dampingFactor={0.1}
            minDistance={6}
            maxDistance={70}
            maxPolarAngle={Math.PI / 2.2}
            makeDefault
        />
    </>
);

const FactoryModel2: React.FC = () => (
    <div className="fm-root">
        <Canvas
            className="fm-canvas"
            shadows
            dpr={[1, 2]}
            gl={{ antialias: true, powerPreference: "high-performance" }}
            camera={{ position: [18, 12, 22], fov: 42, near: 0.1, far: 500 }}
        >
            <Suspense fallback={null}>
                <Scene />
            </Suspense>
        </Canvas>
    </div>
);

export default FactoryModel2;
