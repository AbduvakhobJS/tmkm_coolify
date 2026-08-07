import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
    CAMERA_INITIAL_POSITION,
    INTRO_FLY_POINTS,
    INTRO_LOOP_DURATION,
    INTRO_TRANSITION_DURATION,
} from "../constants";

interface IntroFlyThroughProps {
    controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
    onDone: () => void;
}

// How far ahead on the loop the camera looks, as a fraction of the curve — keeps the
// view pointed the way it's walking instead of straight down at its own feet.
const LOOK_AHEAD = 0.015;

type Phase = "descend" | "loop" | "return" | "done";

/**
 * One-shot cinematic played when the factory scene first mounts: eases the
 * camera down from the default overview to walking height, tours the closed
 * 20-point loop around the model over INTRO_LOOP_DURATION seconds, then eases
 * back up to the overview before handing control to OrbitControls.
 */
const IntroFlyThrough: React.FC<IntroFlyThroughProps> = ({ controlsRef, onDone }) => {
    const { camera } = useThree();

    const curve = useMemo(
        () =>
            new THREE.CatmullRomCurve3(
                INTRO_FLY_POINTS.map((p) => new THREE.Vector3(...p)),
                true,
                "catmullrom",
                0.5
            ),
        []
    );

    const state = useRef({
        phase: "descend" as Phase,
        t: 0,
        startPos: new THREE.Vector3(...CAMERA_INITIAL_POSITION),
        startTarget: new THREE.Vector3(0, 0, 0),
    }).current;

    const scratchPos = useRef(new THREE.Vector3()).current;
    const scratchTarget = useRef(new THREE.Vector3()).current;

    useEffect(() => {
        camera.position.copy(state.startPos);
        controlsRef.current?.target.copy(state.startTarget);
    }, [camera, controlsRef, state]);

    useFrame((_, delta) => {
        const controls = controlsRef.current;
        if (!controls || state.phase === "done") return;

        if (state.phase === "descend") {
            state.t = Math.min(1, state.t + delta / INTRO_TRANSITION_DURATION);
            const ease = 1 - Math.pow(1 - state.t, 3);
            camera.position.lerpVectors(state.startPos, curve.getPointAt(0), ease);
            controls.target.lerpVectors(state.startTarget, curve.getPointAt(LOOK_AHEAD), ease);
            if (state.t >= 1) {
                state.phase = "loop";
                state.t = 0;
            }
            return;
        }

        if (state.phase === "loop") {
            state.t = Math.min(1, state.t + delta / INTRO_LOOP_DURATION);
            curve.getPointAt(state.t, scratchPos);
            camera.position.copy(scratchPos);
            curve.getPointAt((state.t + LOOK_AHEAD) % 1, scratchTarget);
            controls.target.copy(scratchTarget);
            if (state.t >= 1) {
                state.phase = "return";
                state.t = 0;
            }
            return;
        }

        // "return"
        state.t = Math.min(1, state.t + delta / INTRO_TRANSITION_DURATION);
        const ease = 1 - Math.pow(1 - state.t, 3);
        camera.position.lerpVectors(curve.getPointAt(0), state.startPos, ease);
        controls.target.lerpVectors(curve.getPointAt(LOOK_AHEAD), state.startTarget, ease);
        if (state.t >= 1) {
            state.phase = "done";
            onDone();
        }
    });

    return null;
};

export default IntroFlyThrough;
