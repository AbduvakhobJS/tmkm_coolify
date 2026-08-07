import React, { useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { PAVILION_TARGET_SIZE } from "../constants";

const MODEL_URL = "/models/det.glb";
const DRACO_DECODER_PATH = "/draco/";

interface PavilionModelMeshProps {
    /** Receives the fully-transformed group so other systems (collision) can ray-test it. */
    onReady?: (group: THREE.Group) => void;
}

/**
 * Loads det.glb (the pavilion interior), then centres it on the origin and
 * uniformly scales it so its largest dimension equals {@link PAVILION_TARGET_SIZE}.
 * Mirrors FactoryModelMesh's normalising transform so machine positions defined
 * in constants.ts land in a predictable local space.
 */
const PavilionModelMesh: React.FC<PavilionModelMeshProps> = ({ onReady }) => {
    const { scene } = useGLTF(MODEL_URL, DRACO_DECODER_PATH);

    const model = useMemo(() => scene.clone(true), [scene]);

    const { scale, offset } = useMemo(() => {
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const s = PAVILION_TARGET_SIZE / maxDim;

        return {
            scale: s,
            offset: new THREE.Vector3(-center.x * s, -box.min.y * s, -center.z * s),
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
        <group position={offset.toArray()} scale={scale} ref={(g) => g && onReady?.(g)}>
            <primitive object={model} />
        </group>
    );
};

useGLTF.preload(MODEL_URL, DRACO_DECODER_PATH);

export default PavilionModelMesh;
