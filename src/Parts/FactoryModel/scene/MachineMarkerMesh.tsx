import React, { useCallback } from "react";
import { Html } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { MARKER_DISTANCE_FACTOR } from "../constants";
import type { MachineMarker } from "../types";

interface MachineMarkerMeshProps {
    marker: MachineMarker;
    isActive: boolean;
    onSelect: (marker: MachineMarker) => void;
}

/**
 * A machine's number button, anchored in 3D space right at the machine.
 * Clicking it flies the camera in (handled by PavilionCameraRig, driven by
 * the parent's `activeMachine`) and toggles an info popup floating above the
 * button itself. Clicking the same button again — or its popup's close — closes it.
 */
const MachineMarkerMesh: React.FC<MachineMarkerMeshProps> = ({ marker, isActive, onSelect }) => {
    const handleClick = useCallback(() => onSelect(marker), [marker, onSelect]);

    return (
        <group position={marker.position}>
            <Html center sprite distanceFactor={MARKER_DISTANCE_FACTOR} zIndexRange={[14, 0]}>
                <div className="fm-pavilion-marker">
                    <AnimatePresence>
                        {isActive && (
                            <motion.div
                                className="fm-pavilion-marker-panel"
                                onClick={(e) => e.stopPropagation()}
                                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.85, y: 10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                            >
                                <div className="fm-pavilion-marker-panel__head">
                                    <span className="fm-pavilion-marker-panel__title">Stanok {marker.number}</span>
                                    <button
                                        className="fm-modal__close"
                                        onClick={handleClick}
                                        aria-label="Close"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </div>
                                <p className="fm-pavilion-marker-panel__text">{marker.description}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        type="button"
                        className={`fm-pavilion-marker__btn${isActive ? " fm-pavilion-marker__btn--active" : ""}`}
                        onClick={handleClick}
                        aria-label={`Stanok ${marker.number}`}
                        title={`Stanok ${marker.number}`}
                    >
                        {marker.number}
                    </button>
                </div>
            </Html>
        </group>
    );
};

export default React.memo(MachineMarkerMesh);
