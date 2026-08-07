import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
    PAVILION_APPROACH_DISTANCE,
    PAVILION_APPROACH_HEIGHT,
    PAVILION_FLY_DURATION,
} from "../constants";
import type { MachineMarker } from "../types";
import { easeOutCubic } from "./easing";

interface PavilionCameraRigProps {
    controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
    /** The machine the camera should glide to; null leaves the camera where it is. */
    activeMachine: MachineMarker | null;
    /** Called once the fly-in lands, so the info panel can appear only after arrival. */
    onArrive?: (machine: MachineMarker) => void;
}

/**
 * Smoothly flies the camera (and the OrbitControls look-at target) to the
 * selected machine's pulled-back viewpoint over {@link PAVILION_FLY_DURATION}
 * seconds, eased straight into the shot — no overshoot past the machine and
 * pulling back — so the arrival feels like a clean descend-and-settle.
 */
const PavilionCameraRig: React.FC<PavilionCameraRigProps> = ({ controlsRef, activeMachine, onArrive }) => {
    const { camera } = useThree();

    const anim = useRef({
        active: false,
        t: 0,
        fromPos: new THREE.Vector3(),
        fromTarget: new THREE.Vector3(),
        toPos: new THREE.Vector3(),
        toTarget: new THREE.Vector3(),
    }).current;

    useEffect(() => {
        const controls = controlsRef.current;
        if (!activeMachine || !controls) return;

        const machinePos = new THREE.Vector3(...activeMachine.position);

        // Pull back from the machine along the direction the camera is already
        // approaching from, so the shot always lands "in front of" the button
        // rather than needing a precomputed viewpoint per machine.
        const pullback = new THREE.Vector3().subVectors(camera.position, machinePos);
        pullback.y = 0;
        if (pullback.lengthSq() < 1e-6) pullback.set(0, 0, 1);
        pullback.normalize();

        anim.fromPos.copy(camera.position);
        anim.fromTarget.copy(controls.target);
        anim.toPos.copy(machinePos).addScaledVector(pullback, PAVILION_APPROACH_DISTANCE);
        anim.toPos.y = activeMachine.position[1] + PAVILION_APPROACH_HEIGHT;
        anim.toTarget.set(
            activeMachine.position[0],
            activeMachine.position[1] + 1,
            activeMachine.position[2]
        );
        anim.t = 0;
        anim.active = true;
    }, [activeMachine, camera, controlsRef, anim]);

    useFrame((_, delta) => {
        const controls = controlsRef.current;
        if (!anim.active || !controls) return;

        anim.t = Math.min(1, anim.t + delta / PAVILION_FLY_DURATION);
        const ease = easeOutCubic(anim.t);

        camera.position.lerpVectors(anim.fromPos, anim.toPos, ease);
        controls.target.lerpVectors(anim.fromTarget, anim.toTarget, ease);

        if (anim.t >= 1) {
            anim.active = false;
            if (activeMachine) onArrive?.(activeMachine);
        }
    });

    return null;
};

export default PavilionCameraRig;
