import React, { useCallback } from "react";
import { Html } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { MARKER_DISTANCE_FACTOR } from "../constants";
import type { MachineMarker, MachineStatus } from "../types";

interface MachineMarkerMeshProps {
    marker: MachineMarker;
    /** The camera is currently flying to (or parked at) this machine — drives the button's pressed look. */
    isSelected: boolean;
    /** The fly-in has landed and the info panel should actually be shown. */
    isPanelOpen: boolean;
    onSelect: (marker: MachineMarker) => void;
}

const STATUS_LABEL: Record<MachineStatus, string> = {
    running: "Ishlamoqda",
    idle: "Bo‘sh turibdi",
    maintenance: "Texnik xizmat",
    warning: "Ogohlantirish",
};

/**
 * A machine's number button, anchored in 3D space right at the machine.
 * Clicking it flies the camera in (handled by PavilionCameraRig, driven by
 * the parent's `activeMachine`) and — once that flight lands — pops an info
 * panel above the button itself with the machine's live readouts. Clicking
 * the same button again — or its popup's close — closes it immediately.
 */
const MachineMarkerMesh: React.FC<MachineMarkerMeshProps> = ({
    marker,
    isSelected,
    isPanelOpen,
    onSelect,
}) => {
    const handleClick = useCallback(() => onSelect(marker), [marker, onSelect]);
    const MachineIcon = marker.icon;

    return (
        <group position={marker.position}>
            <Html center sprite distanceFactor={MARKER_DISTANCE_FACTOR} zIndexRange={[14, 0]}>
                <div className="fm-pavilion-marker">
                    <AnimatePresence>
                        {isPanelOpen && (
                            <motion.div
                                className="fm-pavilion-marker-panel"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.85, y: 10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                            >
                                <div className="fm-pavilion-marker-panel__head">
                                    <span className="fm-pavilion-marker-panel__head-icon">
                                        <MachineIcon size={16} />
                                    </span>
                                    <div className="fm-pavilion-marker-panel__heading">
                                        <span className="fm-pavilion-marker-panel__title">{marker.name}</span>
                                        <span
                                            className={`fm-pavilion-marker-panel__status fm-pavilion-marker-panel__status--${marker.status}`}
                                        >
                                            {STATUS_LABEL[marker.status]}
                                        </span>
                                    </div>
                                    <button
                                        className="fm-modal__close"
                                        onClick={handleClick}
                                        aria-label="Close"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </div>
                                <p className="fm-pavilion-marker-panel__text">{marker.description}</p>
                                <div className="fm-pavilion-marker-panel__specs">
                                    {marker.specs.map((spec, i) => {
                                        const SpecIcon = spec.icon;
                                        return (
                                            <div key={i} className="fm-pavilion-marker-panel__spec">
                                                <span className="fm-pavilion-marker-panel__spec-icon">
                                                    <SpecIcon size={13} />
                                                </span>
                                                <span className="fm-pavilion-marker-panel__spec-label">
                                                    {spec.label}
                                                </span>
                                                <span className="fm-pavilion-marker-panel__spec-value">
                                                    {spec.value}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        type="button"
                        className={`fm-pavilion-marker__btn${isSelected ? " fm-pavilion-marker__btn--active" : ""}`}
                        onClick={handleClick}
                        aria-label={`Stanok ${marker.number}`}
                        title={marker.name}
                    >
                        {marker.number}
                    </button>
                </div>
            </Html>
        </group>
    );
};

export default React.memo(MachineMarkerMesh);
