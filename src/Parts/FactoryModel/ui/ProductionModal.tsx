import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiActivity, FiX } from "react-icons/fi";
import { useClock } from "../../../hooks/useClock";
import type { BuildingMarker } from "../types";
import ResourceDashboardPart2 from "../../../components/ResourceDashboardPart2";

interface ProductionModalProps {
    marker: BuildingMarker | null;
    onClose: () => void;
}

const ProductionModal: React.FC<ProductionModalProps> = ({ marker, onClose }) => {
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

                            <div className="fm-modal__meta" style={{display: "flex", justifyContent: "flex-end", width: "100%"}}>

                                <button className="fm-modal__close" onClick={onClose}>
                                    <FiX size={18} />
                                </button>
                            </div>
                        </div>
                        <div style={{padding: 30, flex: 1, minHeight: 0}}>
                            <ResourceDashboardPart2 />

                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProductionModal;
