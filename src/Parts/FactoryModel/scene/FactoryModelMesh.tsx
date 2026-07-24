import React, { useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import {
    MODEL_GROUND_OFFSET,
    MODEL_ROTATION_Y,
    MODEL_TARGET_SIZE,
} from "../constants";

const MODEL_URL = "/models/factory_model.glb";

interface FactoryModelMeshProps {
    /** Receives the fully-transformed group so other systems (collision) can ray-test it. */
    onReady?: (group: THREE.Group) => void;
}

/**
 * Loads factory_model.glb, then centres it on the origin and uniformly scales it
 * so its largest dimension equals {@link MODEL_TARGET_SIZE}. Shadows are enabled
 * on every mesh for the contact-shadow / directional-light setup.
 */
const FactoryModelMesh: React.FC<FactoryModelMeshProps> = ({ onReady }) => {
    const { scene } = useGLTF(MODEL_URL);

    // Clone so the cached GLTF is never mutated (safe across remounts / HMR).
    const model = useMemo(() => scene.clone(true), [scene]);

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
    }, [model]);

    return (
        <group
            position={offset.toArray()}
            rotation={[0, MODEL_ROTATION_Y, 0]}
            scale={scale}
            ref={(g) => g && onReady?.(g)}
        >
            <primitive object={model} />
        </group>
    );
};

useGLTF.preload(MODEL_URL);

export default FactoryModelMesh;
