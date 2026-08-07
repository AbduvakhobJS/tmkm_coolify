import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { PAVILION_CAMERA_FOV, PAVILION_CAMERA_INITIAL_POSITION } from "../constants";
import type { MachineMarker } from "../types";
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
 * mouse-orbit navigation, a close button in the top-right corner, and 10
 * number buttons anchored right at each machine that fly the camera in and
 * pop an info panel above the button itself.
 */
const FactoryIntoModal: React.FC<FactoryIntoModalProps> = ({ isOpen, onClose }) => {
    const [activeMachine, setActiveMachine] = useState<MachineMarker | null>(null);

    // Reset the selection every time the modal is (re)opened.
    useEffect(() => {
        if (!isOpen) setActiveMachine(null);
    }, [isOpen]);

    // Escape closes the info popup first, then the modal itself.
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== "Escape") return;
            setActiveMachine((current) => {
                if (current) return null;
                onClose();
                return current;
            });
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    // Clicking a machine's button opens its popup; clicking the same one again closes it.
    const handleSelectMachine = useCallback((machine: MachineMarker) => {
        setActiveMachine((current) => (current?.id === machine.id ? null : machine));
    }, []);

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
                            <PavilionScene activeMachine={activeMachine} onSelectMachine={handleSelectMachine} />
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
