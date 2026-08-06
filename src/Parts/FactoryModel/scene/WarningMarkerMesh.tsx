import React, { useCallback, useEffect, useState } from "react";
import { Html } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { MARKER_DISTANCE_FACTOR } from "../constants";
import type { WarningMarker } from "../types";

interface WarningMarkerMeshProps {
    marker: WarningMarker;
    isOpen: boolean;
    onToggle: (marker: WarningMarker) => void;
    onExpand: (marker: WarningMarker) => void;
}

/** Reveals `text` one character at a time while `active` is true — restarts each time it opens. */
const useTypewriter = (text: string, active: boolean, speed = 16) => {
    const [shown, setShown] = useState("");

    useEffect(() => {
        if (!active) {
            setShown("");
            return;
        }
        let i = 0;
        setShown("");
        const id = window.setInterval(() => {
            i += 1;
            setShown(text.slice(0, i));
            if (i >= text.length) window.clearInterval(id);
        }, speed);
        return () => window.clearInterval(id);
    }, [text, active, speed]);

    return shown;
};

/**
 * A hazard/notice point: a pulsing red dot that toggles a small animated
 * panel above it — image in the corner with text wrapping beside and below it
 * (plain CSS float, book-style), or text-only when no image is set. The
 * text types itself in; clicking the panel opens the full modal.
 */
const WarningMarkerMesh: React.FC<WarningMarkerMeshProps> = ({ marker, isOpen, onToggle, onExpand }) => {
    const typed = useTypewriter(marker.text, isOpen);
    const handleDotClick = useCallback(() => onToggle(marker), [marker, onToggle]);
    const handlePanelClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onExpand(marker);
        },
        [marker, onExpand]
    );

    return (
        <group position={marker.position}>
            <Html center sprite distanceFactor={MARKER_DISTANCE_FACTOR} zIndexRange={[14, 0]}>
                <div className="fm-warning-marker">
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                className="fm-warning-panel"
                                onClick={handlePanelClick}
                                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.85, y: 10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                            >
                                {marker.image && (
                                    <img className="fm-warning-panel__image" src={marker.image} alt="" />
                                )}
                                <p
                                    className={
                                        marker.image
                                            ? "fm-warning-panel__text"
                                            : "fm-warning-panel__text fm-warning-panel__text--no-image"
                                    }
                                >
                                    {typed}
                                    <span className="fm-warning-panel__caret" />
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div
                        className="fm-warning-marker__dot"
                        role="button"
                        tabIndex={0}
                        aria-label="Warning"
                        onClick={handleDotClick}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleDotClick()}
                    >
                        <img src="/icons/warning.png" alt=".."/>
                    </div>
                </div>
            </Html>
        </group>
    );
};

export default React.memo(WarningMarkerMesh);
