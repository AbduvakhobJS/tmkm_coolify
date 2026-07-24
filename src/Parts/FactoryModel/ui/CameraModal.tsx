import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiVideo, FiX } from "react-icons/fi";
import WebRTCPlayer from "../../../components/WebRTCPlayer";
import { useClock } from "../../../hooks/useClock";
import type { BuildingMarker, CameraStream } from "../types";

interface CameraModalProps {
    /** The selected marker, or null when the modal is closed. */
    marker: BuildingMarker | null;
    /** The stream resolved for the selected marker (may be null while loading). */
    stream: CameraStream | null;
    onClose: () => void;
}

/**
 * Professional CCTV modal: building + camera identity, live indicator, running
 * clock and a WebRTC stream window. Animated in/out with Framer Motion and
 * closable via the button, backdrop click or the Escape key.
 */
const CameraModal: React.FC<CameraModalProps> = ({ marker, stream, onClose }) => {
    const { time } = useClock();

    // Escape-to-close, only while open.
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
                        className="fm-modal"
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
                                    {marker.cameraName}
                                </span>
                                <span className="fm-modal__building">{marker.building}</span>
                            </div>

                            <div className="fm-modal__meta">
                                <span className="fm-live">
                                    <span className="fm-live__dot" />
                                    LIVE
                                </span>
                                <span className="fm-modal__clock">{time}</span>
                                <button
                                    className="fm-modal__close"
                                    onClick={onClose}
                                    aria-label="Close"
                                >
                                    <FiX size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="fm-modal__stream">
                            {stream ? (
                                <WebRTCPlayer url={stream.streamUrl} />
                            ) : (
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "#5f8496",
                                        fontSize: 13,
                                    }}
                                >
                                    Connecting to stream…
                                </div>
                            )}
                        </div>

                        <div className="fm-modal__footer">
                            <span>
                                {stream ? `Feed ID: ${stream.id.slice(0, 8)}…` : "Feed: —"}
                            </span>
                            {stream?.hasPtz && <span className="fm-modal__ptz-tag">PTZ</span>}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CameraModal;
