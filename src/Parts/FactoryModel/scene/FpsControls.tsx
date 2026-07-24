import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
    FPS_COLLISION_BUFFER,
    FPS_MAX_RADIUS,
    FPS_MIN_HEIGHT,
    FPS_MOVE_SPEED,
    FPS_SMOOTHING,
} from "../constants";

interface FpsControlsProps {
    /** The OrbitControls instance — its target is moved together with the camera. */
    controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
    /** The factory model group, ray-tested to stop the camera walking through walls. */
    modelRef: React.MutableRefObject<THREE.Group | null>;
}

type MoveKey = "forward" | "backward" | "left" | "right";

const KEY_MAP: Record<string, MoveKey> = {
    KeyW: "forward",
    ArrowUp: "forward",
    KeyS: "backward",
    ArrowDown: "backward",
    KeyA: "left",
    ArrowLeft: "left",
    KeyD: "right",
    ArrowRight: "right",
};

/**
 * Free-roam WASD navigation layered on top of OrbitControls. Movement is applied
 * on the horizontal plane relative to the current view direction, smoothed for a
 * cinematic feel, ground-clamped and blocked by raycast collision against the
 * factory so the camera never clips inside a building.
 */
const FpsControls: React.FC<FpsControlsProps> = ({ controlsRef, modelRef }) => {
    const { camera } = useThree();

    const keys = useRef<Record<MoveKey, boolean>>({
        forward: false,
        backward: false,
        left: false,
        right: false,
    });
    // Smoothed velocity, reused each frame to avoid per-frame allocation.
    const velocity = useRef(new THREE.Vector3());
    const raycaster = useRef(new THREE.Raycaster());

    // Scratch vectors (module-free, allocation-free hot path).
    const scratch = useRef({
        forwardDir: new THREE.Vector3(),
        rightDir: new THREE.Vector3(),
        desired: new THREE.Vector3(),
        step: new THREE.Vector3(),
    }).current;

    useEffect(() => {
        const isTypingTarget = (el: EventTarget | null) =>
            el instanceof HTMLElement &&
            (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

        const down = (e: KeyboardEvent) => {
            const move = KEY_MAP[e.code];
            if (move && !isTypingTarget(e.target)) keys.current[move] = true;
        };
        const up = (e: KeyboardEvent) => {
            const move = KEY_MAP[e.code];
            if (move) keys.current[move] = false;
        };
        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);

    useFrame((_, delta) => {
        const controls = controlsRef.current;
        if (!controls) return;

        const k = keys.current;

        // Camera-relative horizontal basis vectors.
        scratch.forwardDir.set(0, 0, 0);
        camera.getWorldDirection(scratch.forwardDir);
        scratch.forwardDir.y = 0;
        scratch.forwardDir.normalize();
        scratch.rightDir.crossVectors(scratch.forwardDir, camera.up).normalize();

        // Build the desired direction from pressed keys.
        scratch.desired.set(0, 0, 0);
        if (k.forward) scratch.desired.add(scratch.forwardDir);
        if (k.backward) scratch.desired.sub(scratch.forwardDir);
        if (k.right) scratch.desired.add(scratch.rightDir);
        if (k.left) scratch.desired.sub(scratch.rightDir);

        const moving = scratch.desired.lengthSq() > 0;
        if (moving) scratch.desired.normalize().multiplyScalar(FPS_MOVE_SPEED);

        // Exponential smoothing toward the desired velocity.
        const smoothing = 1 - Math.exp(-FPS_SMOOTHING * delta);
        velocity.current.lerp(scratch.desired, smoothing);

        if (velocity.current.lengthSq() < 1e-5) return;

        scratch.step.copy(velocity.current).multiplyScalar(delta);
        const stepLen = scratch.step.length();

        // Collision: ray-test the model along the movement direction.
        if (modelRef.current && stepLen > 1e-4) {
            raycaster.current.set(
                camera.position,
                scratch.step.clone().normalize()
            );
            raycaster.current.far = stepLen + FPS_COLLISION_BUFFER;
            const hits = raycaster.current.intersectObject(modelRef.current, true);
            if (hits.length > 0 && hits[0].distance < stepLen + FPS_COLLISION_BUFFER) {
                velocity.current.multiplyScalar(0.15);
                return;
            }
        }

        // Apply movement to both the camera and the orbit pivot.
        camera.position.add(scratch.step);
        controls.target.add(scratch.step);

        // Ground clamp.
        if (camera.position.y < FPS_MIN_HEIGHT) camera.position.y = FPS_MIN_HEIGHT;

        // Radius clamp — keep roaming within a sane area around the factory.
        const radius = Math.hypot(controls.target.x, controls.target.z);
        if (radius > FPS_MAX_RADIUS) {
            const scale = FPS_MAX_RADIUS / radius;
            controls.target.x *= scale;
            controls.target.z *= scale;
        }
    });

    return null;
};

export default FpsControls;
