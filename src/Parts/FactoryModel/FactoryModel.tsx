import React, { Suspense, lazy, useCallback, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
    CAMERA_FAR,
    CAMERA_FOV,
    CAMERA_INITIAL_POSITION,
    CAMERA_NEAR,
    VIDEO_MARKERS,
} from "./constants";
import { useCameraStreams } from "./hooks/useCameraStreams";
import type { BuildingMarker, VideoMarker, WarningMarker } from "./types";
import { useClock } from "../../hooks/useClock";
import CameraModal from "./ui/CameraModal";
import ScadaModal from "./ui/ScadaModal";
import EnergyModal from "./ui/EnergyModal";
import ProductionModal from "./ui/ProductionModal";
import StaffModal from "./ui/StaffModal";
import SidePanel from "./ui/SidePanel";
import SceneToggles from "./ui/SceneToggles";
import VideoFullscreenModal from "./ui/VideoFullscreenModal";
import WarningModal from "./ui/WarningModal";
import SceneLoader from "./scene/SceneLoader";
import FactoryIntoModal from "./ui/FactoryIntoModal";
import "./factoryModel.css";

// Code-split the heavy 3D scene (three.js + drei + postprocessing) out of the
// main bundle; it only loads when this route is visited.
const FactoryScene = lazy(() => import("./scene/FactoryScene"));

const FactoryModel: React.FC = () => {
    const { time, date } = useClock();
    const { streams } = useCameraStreams();
    const [selected, setSelected] = useState<BuildingMarker | null>(null);

    // ── Video markers: per-id open state + the master "Camera" toggle ───────
    const [openVideos, setOpenVideos] = useState<Record<string, boolean>>({});
    const [camerasOn, setCamerasOn] = useState(false);
    const [expandedVideo, setExpandedVideo] = useState<VideoMarker | null>(null);

    // ── Warning markers: per-id open state ───────────────────────────────────
    const [openWarnings, setOpenWarnings] = useState<Record<string, boolean>>({});
    const [expandedWarning, setExpandedWarning] = useState<WarningMarker | null>(null);

    // ── Left/right dashboard panels: hidden by default ───────────────────────
    const [panelsOn, setPanelsOn] = useState(false);

    const handleSelect = useCallback((marker: BuildingMarker) => setSelected(marker), []);
    const handleClose = useCallback(() => setSelected(null), []);

    const handleToggleCameras = useCallback((next: boolean) => {
        setCamerasOn(next);
        setOpenVideos(() => {
            const all: Record<string, boolean> = {};
            VIDEO_MARKERS.forEach((m) => {
                all[m.id] = next;
            });
            return all;
        });
    }, []);
    const handleToggleVideo = useCallback((marker: VideoMarker) => {
        setOpenVideos((prev) => ({ ...prev, [marker.id]: !prev[marker.id] }));
    }, []);
    const handleExpandVideo = useCallback((marker: VideoMarker) => setExpandedVideo(marker), []);
    const handleCloseVideo = useCallback(() => setExpandedVideo(null), []);

    const handleToggleWarning = useCallback((marker: WarningMarker) => {
        setOpenWarnings((prev) => ({ ...prev, [marker.id]: !prev[marker.id] }));
    }, []);
    const handleExpandWarning = useCallback((marker: WarningMarker) => setExpandedWarning(marker), []);
    const handleCloseWarning = useCallback(() => setExpandedWarning(null), []);

    // Map the selected marker → its live stream (streams cycle through 4 feeds).
    const selectedStream = useMemo(() => {
        if (!selected || streams.length === 0) return null;
        return streams[selected.streamIndex % streams.length];
    }, [selected, streams]);

    return (
        <div className="fm-root">
            {panelsOn && <SidePanel side="left" />}
            {panelsOn && <SidePanel side="right" />}

            <SceneToggles
                camerasOn={camerasOn}
                onToggleCameras={handleToggleCameras}
                panelsOn={panelsOn}
                onTogglePanels={setPanelsOn}
            />

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
                    <FactoryScene
                        onSelectMarker={handleSelect}
                        openVideos={openVideos}
                        onToggleVideo={handleToggleVideo}
                        onExpandVideo={handleExpandVideo}
                        openWarnings={openWarnings}
                        onToggleWarning={handleToggleWarning}
                        onExpandWarning={handleExpandWarning}
                        paused={selected?.type === "into"}
                    />
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
            {selected?.type === "into" && (
                <FactoryIntoModal isOpen={selected?.type === "into"} onClose={handleClose} />

            )}

            <VideoFullscreenModal marker={expandedVideo} onClose={handleCloseVideo} />
            <WarningModal marker={expandedWarning} onClose={handleCloseWarning} />

        </div>
    );
};

export default FactoryModel;
