import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiVideo, FiX } from "react-icons/fi";
import type { VideoMarker } from "../types";

interface VideoFullscreenModalProps {
    marker: VideoMarker | null;
    onClose: () => void;
}

/** Fullscreen playback for a video marker's clip, closable via button, backdrop or Escape. */
const VideoFullscreenModal: React.FC<VideoFullscreenModalProps> = ({ marker, onClose }) => {
    useEffect(() => {
        if (!marker) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [marker, onClose]);

    return (
        <AnimatePresence>
            {marker && (
                <motion.div
                    className="fm-modal__overlay"
                    onClick={onClose}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <motion.div
                        className="fm-modal fm-modal--full"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.92, y: 24 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 16 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    >
                        <div className="fm-modal__head">
                            <div className="fm-modal__titles">
                                <span className="fm-modal__camera">
                                    <FiVideo size={18} />
                                    {marker.label}
                                </span>
                            </div>
                            <div className="fm-modal__meta">
                                <button className="fm-modal__close" onClick={onClose} aria-label="Close">
                                    <FiX size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="fm-modal__content" style={{ padding: 0 }}>
                            <video
                                key={marker.id}
                                src={marker.url}
                                controls
                                autoPlay
                                muted
                                loop
                                style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000" }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VideoFullscreenModal;
