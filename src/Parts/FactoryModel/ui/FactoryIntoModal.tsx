import React, { Suspense, lazy, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { PAVILION_CAMERA_FOV, PAVILION_CAMERA_INITIAL_POSITION } from "../constants";
import SceneLoader from "../scene/SceneLoader";

// Code-split the heavy 3D scene (three.js + drei + the 30 MB det.glb) out of
// the main bundle; it only loads the first time this modal is opened.
const PavilionScene = lazy(() => import("../scene/PavilionScene"));

interface FactoryIntoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Fullscreen walkthrough of a single pavilion's interior (det.glb): WASD +
 * mouse-orbit navigation, a close button in the top-right corner, and a
 * live instrument readout floating above each of the 6 furnaces.
 */
const FactoryIntoModal: React.FC<FactoryIntoModalProps> = ({ isOpen, onClose }) => {
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fm-pavilion"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                >
                    <Canvas
                        className="fm-canvas"
                        shadows
                        dpr={[1, 2]}
                        gl={{ antialias: true, powerPreference: "high-performance" }}
                        camera={{
                            position: PAVILION_CAMERA_INITIAL_POSITION,
                            fov: PAVILION_CAMERA_FOV,
                            near: 0.1,
                            far: 300,
                        }}
                    >
                        <Suspense fallback={null}>
                            <PavilionScene />
                        </Suspense>
                    </Canvas>

                    <SceneLoader />

                    <button
                        type="button"
                        className="fm-pavilion__close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <FiX size={22} />
                    </button>

                    <div className="fm-hint fm-pavilion__hint">
                        <span>
                            <kbd>W</kbd>
                            <kbd>A</kbd>
                            <kbd>S</kbd>
                            <kbd>D</kbd> yurish
                        </span>
                        <span>Sichqoncha — atrofga qarash</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FactoryIntoModal;
