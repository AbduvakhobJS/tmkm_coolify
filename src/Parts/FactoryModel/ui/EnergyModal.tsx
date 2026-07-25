import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiZap, FiX } from "react-icons/fi";
import { useClock } from "../../../hooks/useClock";
import type { BuildingMarker } from "../types";
import {
    ElectricResourceCard,
    GasResourceCard,
    SolarResourceCard,
    WaterResourceCard
} from "../../../components/ResourceDashboard";

interface EnergyModalProps {
    marker: BuildingMarker | null;
    onClose: () => void;
}

const EnergyModal: React.FC<EnergyModalProps> = ({ marker, onClose }) => {
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


                        <div style={{
                            flex: 1,
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr 1fr',
                            gridTemplateRows: '1fr 1fr 1fr 1fr',
                            gap: '10px',
                            minHeight: 0
                        }}>
                            <ElectricResourceCard />
                            <GasResourceCard />

                            <SolarResourceCard />
                            <GasResourceCard />
                            <ElectricResourceCard />

                            <WaterResourceCard />
                            <SolarResourceCard />
                            <WaterResourceCard />
                            <SolarResourceCard />
                            <GasResourceCard />
                            <ElectricResourceCard />

                            <WaterResourceCard />
                            <GasResourceCard />
                            <ElectricResourceCard />

                            <WaterResourceCard />
                            <SolarResourceCard />
                        </div>


                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EnergyModal;
