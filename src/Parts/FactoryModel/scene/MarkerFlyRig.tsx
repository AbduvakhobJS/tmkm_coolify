import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { MARKER_APPROACH_DISTANCE, MARKER_APPROACH_HEIGHT, MARKER_FLY_DURATION } from "../constants";
import type { BuildingMarker } from "../types";
import { easeOutCubic } from "./easing";

interface MarkerFlyRigProps {
    controlsRef: React.MutableRefObject<OrbitControlsImpl | null>;
    /** The marker the camera should zoom into; null leaves the camera alone. */
    target: BuildingMarker | null;
    /** Called once the fly-in lands, so the caller can open the marker's modal. */
    onArrive: (marker: BuildingMarker) => void;
}

/**
 * Zooms the main-scene camera in close to a clicked building marker, easing
 * straight into the approach point (descending from the overview height,
 * never overshooting past the marker and pulling back) before handing off
 * to onArrive, which opens FactoryIntoModal.
 *
 * IMPORTANT: OrbitControls is disabled (see FactoryScene's `controlsLocked`)
 * for the duration of this flight, so — just like IntroFlyThrough — its
 * internal update() loop won't reorient the camera on its own even though we
 * mutate controls.target. We drive orientation ourselves via camera.lookAt()
 * each frame instead.
 */
const MarkerFlyRig: React.FC<MarkerFlyRigProps> = ({ controlsRef, target, onArrive }) => {
    const { camera } = useThree();

    const anim = useRef({
        active: false,
        t: 0,
        fromPos: new THREE.Vector3(),
        fromTarget: new THREE.Vector3(),
        toPos: new THREE.Vector3(),
        toTarget: new THREE.Vector3(),
        marker: null as BuildingMarker | null,
    }).current;

    useEffect(() => {
        const controls = controlsRef.current;
        if (!target || !controls) return;

        const markerPos = new THREE.Vector3(...target.position);

        // Approach from whichever direction the camera is already looking in,
        // so the shot always lands "in front of" the marker.
        const pullback = new THREE.Vector3().subVectors(camera.position, markerPos);
        pullback.y = 0;
        if (pullback.lengthSq() < 1e-6) pullback.set(0, 0, 1);
        pullback.normalize();

        anim.fromPos.copy(camera.position);
        anim.fromTarget.copy(controls.target);
        anim.toPos.copy(markerPos).addScaledVector(pullback, MARKER_APPROACH_DISTANCE);
        anim.toPos.y = markerPos.y + MARKER_APPROACH_HEIGHT;
        anim.toTarget.copy(markerPos);
        anim.marker = target;
        anim.t = 0;
        anim.active = true;
    }, [target, camera, controlsRef, anim]);

    useFrame((_, delta) => {
        const controls = controlsRef.current;
        if (!anim.active || !controls) return;

        anim.t = Math.min(1, anim.t + delta / MARKER_FLY_DURATION);
        const ease = easeOutCubic(anim.t);

        camera.position.lerpVectors(anim.fromPos, anim.toPos, ease);
        controls.target.lerpVectors(anim.fromTarget, anim.toTarget, ease);
        camera.lookAt(controls.target);

        if (anim.t >= 1) {
            anim.active = false;
            const arrived = anim.marker;
            anim.marker = null;
            if (arrived) onArrive(arrived);
        }
    });

    return null;
};

export default MarkerFlyRig;
