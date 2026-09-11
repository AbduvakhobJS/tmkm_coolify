import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { DRACO_DECODER_PATH, PAVILION_MODEL_URL, PAVILION_TARGET_SIZE } from "../constants";
import type { FurnaceState } from "../hooks/useFurnaceTelemetry";
import FurnaceVisuals from "./FurnaceVisuals";

const MODEL_URL = PAVILION_MODEL_URL;

interface PavilionModelMeshProps {
    /** Receives the fully-transformed group so other systems (collision) can ray-test it. */
    onReady?: (group: THREE.Group) => void;
    /** Live 6-furnace telemetry — drives the qobiq tint + asosiy_chiroq blink. */
    furnaces: FurnaceState[];
}

interface NormalizedPavilion {
    model: THREE.Group;
    scale: number;
    offset: THREE.Vector3;
}

/**
 * FactoryIntoModal fully unmounts/remounts this on every open/close of the
 * pavilion modal, which used to re-clone det.glb's ~1300-node hierarchy and
 * re-run Box3.setFromObject (walks every mesh, computing each geometry's
 * bounding box from scratch) on EVERY open — several seconds of main-thread
 * work each time, felt as the UI freezing/stuttering the moment the modal
 * opened. useGLTF's cached `scene` is a stable reference per URL, so this
 * normalising work only needs to happen once per session; cache it here,
 * keyed by that reference, and reuse the built group on subsequent opens.
 */
const normalizedCache = new WeakMap<THREE.Object3D, NormalizedPavilion>();

const buildNormalizedPavilion = (scene: THREE.Object3D): NormalizedPavilion => {
    const cached = normalizedCache.get(scene);
    if (cached) return cached;

    const model = scene.clone(true) as THREE.Group;

    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = PAVILION_TARGET_SIZE / maxDim;
    const offset = new THREE.Vector3(-center.x * scale, -box.min.y * scale, -center.z * scale);

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

    const result: NormalizedPavilion = { model, scale, offset };
    normalizedCache.set(scene, result);
    return result;
};

/**
 * Loads det.glb (the pavilion interior), then centres it on the origin and
 * uniformly scales it so its largest dimension equals {@link PAVILION_TARGET_SIZE}.
 * Mirrors FactoryModelMesh's normalising transform so machine positions defined
 * in constants.ts land in a predictable local space.
 */
const PavilionModelMesh: React.FC<PavilionModelMeshProps> = ({ onReady, furnaces }) => {
    const { scene } = useGLTF(MODEL_URL, DRACO_DECODER_PATH);

    const { model, scale, offset } = useMemo(() => buildNormalizedPavilion(scene), [scene]);

    // Nudge the whole pavilion slightly left of centre.
    // markaz burish — o'zim to'g'irlayman.
    const position = useMemo<[number, number, number]>(
        () => [offset.x - 0.6, offset.y, offset.z],
        [offset]
    );

    return (
        <group position={position} scale={scale} ref={(g) => g && onReady?.(g)}>
            <primitive object={model} />
            <FurnaceVisuals model={model} furnaces={furnaces} />
        </group>
    );
};

useGLTF.preload(MODEL_URL, DRACO_DECODER_PATH);

export default PavilionModelMesh;
