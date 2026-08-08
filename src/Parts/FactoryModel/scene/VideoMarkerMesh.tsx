import React, { useCallback } from "react";
import { Html } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { MARKER_DISTANCE_FACTOR } from "../constants";
import type { VideoMarker } from "../types";
import WebRTCPlayer from "../../../components/WebRTCPlayer";

interface VideoMarkerMeshProps {
    marker: VideoMarker;
    isOpen: boolean;
    onToggle: (marker: VideoMarker) => void;
    onExpand: (marker: VideoMarker) => void;
}

/**
 * A CCTV point: a small dot that toggles a muted preview clip floating above
 * it. Clicking the preview itself (not the dot) hands off to the fullscreen
 * modal via `onExpand`.
 */
const VideoMarkerMesh: React.FC<VideoMarkerMeshProps> = ({ marker, isOpen, onToggle, onExpand }) => {
    const handleDotClick = useCallback(() => onToggle(marker), [marker, onToggle]);
    const handlePopupClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onExpand(marker);
        },
        [marker, onExpand]
    );

    return (
        <group position={marker.position}>
            <Html center sprite distanceFactor={MARKER_DISTANCE_FACTOR} zIndexRange={[12, 0]}>
                <div className="fm-video-marker">
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                className="fm-video-popup"
                                onClick={handlePopupClick}
                                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.85, y: 8 }}
                                transition={{ duration: 0.18 }}
                            >
                                <span className="fm-video-popup__label">{marker.label}</span>
                                <div style={{ width: "100%", height: 94 }}>
                                    <WebRTCPlayer url={marker.url} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div
                        className={`fm-video-marker__dot${isOpen ? " fm-video-marker__dot--active" : ""}`}
                        role="button"
                        tabIndex={0}
                        aria-label={marker.label}
                        onClick={handleDotClick}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleDotClick()}
                    >
                        <img src="/icons/cctv.png" alt=""/>
                    </div>
                </div>
            </Html>
        </group>
    );
};

export default React.memo(VideoMarkerMesh);
