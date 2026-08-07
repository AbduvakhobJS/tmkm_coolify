import React, { useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
    MODEL_GROUND_OFFSET,
    MODEL_ROTATION_Y,
    MODEL_TARGET_SIZE,
} from "../constants";

const MODEL_URL = "/models/factory_model.glb";
/**
 * Daraxtlar.glb (the surrounding trees) was authored in the same Blender
 * scene / coordinate space as factory_model.glb, just exported separately.
 * It must share the exact same normalising transform (not one recomputed
 * from its own bounding box) so the two line up in world space instead of
 * drifting apart.
 */
const TREES_MODEL_URL = "/models/Daraxtlar.glb";
/**
 * factory_model.glb is exported Draco-compressed (from Blender). drei's
 * useGLTF defaults to fetching the Draco decoder from Google's CDN
 * (gstatic.com) — fine on the open internet, but this app is self-hosted via
 * Coolify and may run somewhere without a route to Google, silently hanging
 * the model load forever. Self-host the decoder instead.
 */
const DRACO_DECODER_PATH = "/draco/";

interface FactoryModelMeshProps {
    /** Receives the fully-transformed group so other systems (collision) can ray-test it. */
    onReady?: (group: THREE.Group) => void;
}

const enableShadows = (model: THREE.Object3D) => {
    model.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat && "envMapIntensity" in mat) {
                mat.envMapIntensity = 1.1;
            }
        }
    });
};

/**
 * Loads factory_model.glb and Daraxtlar.glb (trees), then centres the
 * factory model on the origin and uniformly scales it so its largest
 * dimension equals {@link MODEL_TARGET_SIZE}. The trees model is rendered
 * inside the same group, sharing that exact transform, so both models
 * stay aligned. Shadows are enabled on every mesh for the contact-shadow /
 * directional-light setup.
 */
const FactoryModelMesh: React.FC<FactoryModelMeshProps> = ({ onReady }) => {
    const { scene } = useGLTF(MODEL_URL, DRACO_DECODER_PATH);
    const { scene: treesScene } = useGLTF(TREES_MODEL_URL, DRACO_DECODER_PATH);

    // Clone so the cached GLTF is never mutated (safe across remounts / HMR).
    const model = useMemo(() => scene.clone(true), [scene]);
    const treesModel = useMemo(() => treesScene.clone(true), [treesScene]);

    // Compute the normalising transform once per model instance.
    const { scale, offset } = useMemo(() => {
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const s = MODEL_TARGET_SIZE / maxDim;

        // Centre horizontally, and drop the model so its base rests on y = 0.
        return {
            scale: s,
            offset: new THREE.Vector3(
                -center.x * s,
                -box.min.y * s + MODEL_GROUND_OFFSET,
                -center.z * s
            ),
        };
    }, [model]);

    useLayoutEffect(() => {
        enableShadows(model);
        enableShadows(treesModel);
    }, [model, treesModel]);

    return (
        <group
            position={offset.toArray()}
            rotation={[0, MODEL_ROTATION_Y, 0]}
            scale={scale}
            ref={(g) => g && onReady?.(g)}
        >
            <primitive object={model} />
            <primitive position={[-290, 0, 309]} object={treesModel} />
        </group>
    );
};

useGLTF.preload(MODEL_URL, DRACO_DECODER_PATH);
useGLTF.preload(TREES_MODEL_URL, DRACO_DECODER_PATH);

export default FactoryModelMesh;
