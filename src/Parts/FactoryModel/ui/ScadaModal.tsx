import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCpu, FiX } from "react-icons/fi";
import { useClock } from "../../../hooks/useClock";
import type { BuildingMarker } from "../types";

interface ScadaModalProps {
    marker: BuildingMarker | null;
    onClose: () => void;
}

const ScadaModal: React.FC<ScadaModalProps> = ({ marker, onClose }) => {
    const { time } = useClock();

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
                        className="fm-modal fm-modal--full"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    >
                        <div className="fm-modal__head">
                            <div className="fm-modal__titles">
                                <span className="fm-modal__camera">
                                    <FiCpu size={18} />
                                    SCADA System
                                </span>
                                <span className="fm-modal__building">{marker.building}</span>
                            </div>

                            <div className="fm-modal__meta">
                                <span className="fm-modal__clock">{time}</span>
                                <button className="fm-modal__close" onClick={onClose}>
                                    <FiX size={18} />
                                </button>
                            </div>
                        </div>

                                <img src="/imgs/scada1.png" alt="" style={{width: "100%", height: "95%"}}/>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ScadaModal;
