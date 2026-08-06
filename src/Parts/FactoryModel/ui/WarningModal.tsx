import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import type { WarningMarker } from "../types";

interface WarningModalProps {
    marker: WarningMarker | null;
    onClose: () => void;
}

/** Fullscreen view of a warning marker's notice, closable via button, backdrop or Escape. */
const WarningModal: React.FC<WarningModalProps> = ({ marker, onClose }) => {
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
                >
                    <motion.div
                        className="fm-modal"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    >
                        <div className="fm-modal__head">
                            <div className="fm-modal__titles">
                                <span className="fm-modal__camera">
                                    <FiAlertTriangle size={18} color="#f43f5e" />
                                    Warning
                                </span>
                            </div>
                            <div className="fm-modal__meta">
                                <button className="fm-modal__close" onClick={onClose} aria-label="Close">
                                    <FiX size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="fm-modal__content">
                            {marker.image && (
                                <img
                                    src={marker.image}
                                    alt=""
                                    style={{ width: "100%", borderRadius: 10, marginBottom: 14, display: "block" }}
                                />
                            )}
                            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#ffe3e7", margin: 0 }}>
                                {marker.text}
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WarningModal;
