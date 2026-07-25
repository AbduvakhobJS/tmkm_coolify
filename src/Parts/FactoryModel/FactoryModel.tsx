import React, { Suspense, lazy, useCallback, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { TbBuildingFactory2 } from "react-icons/tb";
import {
    CAMERA_FAR,
    CAMERA_FOV,
    CAMERA_INITIAL_POSITION,
    CAMERA_NEAR,
} from "./constants";
import { useCameraStreams } from "./hooks/useCameraStreams";
import type { BuildingMarker } from "./types";
import { useClock } from "../../hooks/useClock";
import CameraModal from "./ui/CameraModal";
import ScadaModal from "./ui/ScadaModal";
import EnergyModal from "./ui/EnergyModal";
import ProductionModal from "./ui/ProductionModal";
import StaffModal from "./ui/StaffModal";
import SidePanel from "./ui/SidePanel";
import SceneLoader from "./scene/SceneLoader";
import "./factoryModel.css";

// Code-split the heavy 3D scene (three.js + drei + postprocessing) out of the
// main bundle; it only loads when this route is visited.
const FactoryScene = lazy(() => import("./scene/FactoryScene"));

/**
 * FactoryModel — a premium Situational Center / Smart-Factory monitoring view.
 *
 * A normalised GLB factory sits at the centre of an HDRI-lit, bloom-enhanced 3D
 * scene. Ten billboard CCTV markers float over the buildings; clicking one opens
 * a live WebRTC stream modal. Glassmorphism widget panels flank the model, and
 * the camera supports both OrbitControls and smooth WASD free-roam.
 */
const FactoryModel: React.FC = () => {
    const { time, date } = useClock();
    const { streams } = useCameraStreams();
    const [selected, setSelected] = useState<BuildingMarker | null>(null);

    const handleSelect = useCallback((marker: BuildingMarker) => setSelected(marker), []);
    const handleClose = useCallback(() => setSelected(null), []);

    // Map the selected marker → its live stream (streams cycle through 4 feeds).
    const selectedStream = useMemo(() => {
        if (!selected || streams.length === 0) return null;
        return streams[selected.streamIndex % streams.length];
    }, [selected, streams]);

    return (
        <div className="fm-root">
            {/* ── Top status bar ───────────────────────────────────────────── */}
            {/*<header className="fm-topbar">*/}
            {/*    <div className="fm-topbar__title">*/}
            {/*        <TbBuildingFactory2 size={20} />*/}
            {/*        Smart Factory · Situational Center*/}
            {/*    </div>*/}
            {/*    <div className="fm-topbar__clock">*/}
            {/*        {date} · {time}*/}
            {/*    </div>*/}
            {/*</header>*/}

            {/* ── Glass side panels ────────────────────────────────────────── */}
            <SidePanel side="left" />
            <SidePanel side="right" />

            {/* ── 3D scene ─────────────────────────────────────────────────── */}
            <Canvas
                className="fm-canvas"
                shadows
                dpr={[1, 2]}
                gl={{ antialias: true, powerPreference: "high-performance" }}
                camera={{
                    position: CAMERA_INITIAL_POSITION,
                    fov: CAMERA_FOV,
                    near: CAMERA_NEAR,
                    far: CAMERA_FAR,
                }}
            >
                <Suspense fallback={null}>
                    <FactoryScene onSelectMarker={handleSelect} />
                </Suspense>
            </Canvas>

            <SceneLoader />

            {/* ── Contextual modals based on marker type ────────────────────── */}
            {selected?.type === "camera" && (
                <CameraModal marker={selected} stream={selectedStream} onClose={handleClose} />
            )}
            {selected?.type === "scada" && (
                <ScadaModal marker={selected} onClose={handleClose} />
            )}
            {selected?.type === "energy" && (
                <EnergyModal marker={selected} onClose={handleClose} />
            )}
            {selected?.type === "production" && (
                <ProductionModal marker={selected} onClose={handleClose} />
            )}
            {selected?.type === "staff" && (
                <StaffModal marker={selected} onClose={handleClose} />
            )}
        </div>
    );
};

export default FactoryModel;
