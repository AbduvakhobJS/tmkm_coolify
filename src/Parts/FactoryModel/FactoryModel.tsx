import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useProgress } from "@react-three/drei";
import { FiMaximize2, FiMinimize2 } from "react-icons/fi";
import {
    CAMERA_FAR,
    CAMERA_FOV,
    CAMERA_INITIAL_POSITION,
    CAMERA_NEAR,
    DRACO_DECODER_PATH,
    PAVILION_MODEL_URL,
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

interface FactoryModelProps {
    /**
     * Render as a block that fills its parent instead of a fixed, full-screen
     * layer. Used when the scene is embedded inside another panel/modal.
     */
    embedded?: boolean;
}

const FactoryModel: React.FC<FactoryModelProps> = ({ embedded = false }) => {
    const { time, date } = useClock();
    const { streams } = useCameraStreams();
    const [selected, setSelected] = useState<BuildingMarker | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);

    // Orbit-dragging the 3D view routinely starts (or crosses) an HTML overlay
    // label/panel sitting on top of the canvas, which the browser reads as a
    // text-selection drag unless stopped. `user-select: none` in CSS also
    // stops it, but in some browsers that same property quietly breaks the
    // pointer-drag gesture OrbitControls relies on for orbiting — so instead
    // this cancels only the browser's native "begin selecting text" event
    // itself, right as it fires, which never touches pointer/mouse events at
    // all and leaves orbit dragging (and everything else) completely alone.
    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;
        const onSelectStart = (e: Event) => e.preventDefault();
        el.addEventListener("selectstart", onSelectStart);
        return () => el.removeEventListener("selectstart", onSelectStart);
    }, []);

    // ── Video markers: per-id open state + the master "Camera" toggle ───────
    const [openVideos, setOpenVideos] = useState<Record<string, boolean>>({});
    const [camerasOn, setCamerasOn] = useState(false);
    const [expandedVideo, setExpandedVideo] = useState<VideoMarker | null>(null);

    // ── Warning markers: per-id open state ───────────────────────────────────
    const [openWarnings, setOpenWarnings] = useState<Record<string, boolean>>({});
    const [expandedWarning, setExpandedWarning] = useState<WarningMarker | null>(null);

    // ── Left/right dashboard panels: hidden by default ───────────────────────
    const [panelsOn, setPanelsOn] = useState(false);

    // Embedded tiles (e.g. inside the map's factory-detail panel) can expand
    // to fill the viewport — but sit below the app's own top navbar (see
    // .fm-root--fullscreen), never over it, so wayfinding stays available.
    const [isFullscreen, setIsFullscreen] = useState(false);
    // Full render quality only makes sense once it's actually filling the
    // screen — a fullscreen-but-still-tile-quality render would look worse
    // than the small tile did, for no GPU savings (it's the same pixel count).
    const renderAsTile = embedded && !isFullscreen;

    // Once the main factory scene has finished loading (drei's global loading
    // manager goes idle again after having been active), warm up the pavilion
    // walkthrough in the background — both its 30 MB det.glb and its
    // code-split JS chunk — so FactoryIntoModal's 3D view is instant on open
    // instead of only starting that fetch once the modal is clicked.
    const { active: sceneLoading } = useProgress();
    const hasLoadedOnce = useRef(false);
    const pavilionPreloaded = useRef(false);
    useEffect(() => {
        if (sceneLoading) hasLoadedOnce.current = true;
        if (!sceneLoading && hasLoadedOnce.current && !pavilionPreloaded.current) {
            pavilionPreloaded.current = true;
            useGLTF.preload(PAVILION_MODEL_URL, DRACO_DECODER_PATH);
            import("./scene/PavilionScene");
        }
    }, [sceneLoading]);

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
        <div
            ref={rootRef}
            className={`fm-root${embedded ? " fm-root--embedded" : ""}${isFullscreen ? " fm-root--fullscreen" : ""}`}
        >
            {embedded && (
                <button
                    type="button"
                    className="fm-fullscreen-toggle"
                    onClick={() => setIsFullscreen((v) => !v)}
                    aria-label={isFullscreen ? "Kichraytirish" : "To'liq ekran"}
                    title={isFullscreen ? "Kichraytirish" : "To'liq ekran"}
                >
                    {isFullscreen ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
                </button>
            )}

            {panelsOn && <SidePanel side="left" />}
            {panelsOn && <SidePanel side="right" />}

            <SceneToggles
                camerasOn={camerasOn}
                onToggleCameras={handleToggleCameras}
                panelsOn={panelsOn}
                onTogglePanels={setPanelsOn}
            />

            {/* ── 3D scene ─────────────────────────────────────────────────── */}
            {/* Tile-quality (small dashboard tile, rendering alongside the map and
               other widgets) caps the device-pixel-ratio at 1 instead of up to 2 —
               on a HiDPI screen that's a 4x fragment-shader cost difference for a
               tile a fraction of the screen, invisible at that size but very much
               felt as extra jank competing with everything else on the page. */}
            <Canvas
                className="fm-canvas"
                shadows
                dpr={renderAsTile ? 1 : [1, 2]}
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
                        lowQuality={renderAsTile}
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
