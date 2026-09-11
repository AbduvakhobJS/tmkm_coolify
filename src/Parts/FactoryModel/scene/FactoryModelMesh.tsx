import React, { useMemo } from "react";
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

interface NormalizedFactory {
    model: THREE.Object3D;
    scale: number;
    offset: THREE.Vector3;
}

/**
 * This component only ever mounts once per session (it's the always-on main
 * scene), so caching mainly guards against dev-time HMR remounts — but the
 * pattern mirrors PavilionModelMesh's, where the same clone + Box3.setFromObject
 * + shadow-traversal sequence WAS the cause of a multi-second freeze on every
 * remount, since useGLTF's cached `scene` reference is stable and this work
 * doesn't need to repeat against it.
 */
const normalizedCache = new WeakMap<THREE.Object3D, NormalizedFactory>();

const buildNormalizedFactory = (scene: THREE.Object3D): NormalizedFactory => {
    const cached = normalizedCache.get(scene);
    if (cached) return cached;

    const model = scene.clone(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = MODEL_TARGET_SIZE / maxDim;
    // Centre horizontally, and drop the model so its base rests on y = 0.
    const offset = new THREE.Vector3(
        -center.x * scale,
        -box.min.y * scale + MODEL_GROUND_OFFSET,
        -center.z * scale
    );

    enableShadows(model);

    const result: NormalizedFactory = { model, scale, offset };
    normalizedCache.set(scene, result);
    return result;
};

/**
 * Daraxtlar.glb scatters ~900 tree nodes across only ~15 distinct
 * geometry/material pairs (the same handful of tree meshes repeated
 * hundreds of times) — but GLTFLoader gives every node its own THREE.Mesh,
 * so that was ~900 separate draw calls + ~900 Object3D's for the CPU to
 * walk every frame. Flattening each repeated geometry+material pair into a
 * single THREE.InstancedMesh (one draw call per tree TYPE instead of per
 * tree) keeps the exact same visuals while cutting that to ~15 draw calls.
 */
const treesCache = new WeakMap<THREE.Object3D, THREE.Group>();

const buildInstancedTrees = (scene: THREE.Object3D): THREE.Group => {
    const cached = treesCache.get(scene);
    if (cached) return cached;

    const source = scene.clone(true);
    source.updateMatrixWorld(true);

    const groups = new Map<
        string,
        { geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[]; matrices: THREE.Matrix4[] }
    >();

    source.traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh) return;
        const mesh = obj as THREE.Mesh;
        const matKey = Array.isArray(mesh.material)
            ? mesh.material.map((m) => m.uuid).join(",")
            : mesh.material.uuid;
        const key = `${mesh.geometry.uuid}|${matKey}`;
        if (!groups.has(key)) {
            groups.set(key, { geometry: mesh.geometry, material: mesh.material, matrices: [] });
        }
        groups.get(key)!.matrices.push(mesh.matrixWorld.clone());
    });

    const root = new THREE.Group();
    groups.forEach(({ geometry, material, matrices }) => {
        (Array.isArray(material) ? material : [material]).forEach((mat) => {
            if (mat && "envMapIntensity" in mat) (mat as THREE.MeshStandardMaterial).envMapIntensity = 1.1;
        });

        if (matrices.length === 1) {
            // Not worth instancing a one-off — a plain mesh is cheaper/simpler.
            const mesh = new THREE.Mesh(geometry, material);
            mesh.applyMatrix4(matrices[0]);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            root.add(mesh);
            return;
        }
        const instanced = new THREE.InstancedMesh(geometry, material, matrices.length);
        matrices.forEach((matrix, i) => instanced.setMatrixAt(i, matrix));
        instanced.instanceMatrix.needsUpdate = true;
        instanced.castShadow = true;
        instanced.receiveShadow = true;
        root.add(instanced);
    });

    treesCache.set(scene, root);
    return root;
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

    const { model, scale, offset } = useMemo(() => buildNormalizedFactory(scene), [scene]);
    const treesModel = useMemo(() => buildInstancedTrees(treesScene), [treesScene]);

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
