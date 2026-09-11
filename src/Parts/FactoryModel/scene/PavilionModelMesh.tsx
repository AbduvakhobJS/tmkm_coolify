import React, { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { DRACO_DECODER_PATH, PAVILION_MODEL_URL, PAVILION_TARGET_SIZE } from "../constants";
import type { FurnaceState, HistoryRangeKey } from "../hooks/useFurnaceTelemetry";
import FurnaceVisuals from "./FurnaceVisuals";
import FurnacePanels from "./FurnacePanels";

const MODEL_URL = PAVILION_MODEL_URL;

interface PavilionModelMeshProps {
    /** Receives the fully-transformed group so other systems (collision) can ray-test it. */
    onReady?: (group: THREE.Group) => void;
    /** Live 6-furnace telemetry — drives the qobiq tint + asosiy_chiroq blink. */
    furnaces: FurnaceState[];
    /** Called when a furnace panel's day/week/month filter changes. */
    onHistoryRangeChange: (furnaceIndex: number, range: HistoryRangeKey) => void;
}

// e.g. "page_panel_3" — a cube placed by hand right above furnace 3, used purely
// as a position anchor for that furnace's HTML readout (see FurnacePanels). The
// cube itself is invisible; only its transform matters.
const PANEL_ANCHOR_RE = /^page_panel_(\d+)$/i;

interface NormalizedPavilion {
    model: THREE.Group;
    scale: number;
    offset: THREE.Vector3;
    /** furnaceIndex → local position (in the model's own, pre-normalise space) of its page_panel_N cube. */
    panelAnchors: Map<number, THREE.Vector3>;
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
    // clone() copies matrix/matrixWorld verbatim from the source, which (never
    // itself inserted into a rendered scene graph) may never have had them
    // computed — refresh them here so both Box3.setFromObject below and the
    // getWorldPosition() anchor lookups further down read correct transforms.
    model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = PAVILION_TARGET_SIZE / maxDim;
    const offset = new THREE.Vector3(-center.x * scale, -box.min.y * scale, -center.z * scale);

    const panelAnchors = new Map<number, THREE.Vector3>();

    model.traverse((obj) => {
        const anchorMatch = PANEL_ANCHOR_RE.exec(obj.name);
        if (anchorMatch) {
            const pos = new THREE.Vector3();
            if ((obj as THREE.Mesh).isMesh) {
                // The panel used to hang off this cube's own origin — fine as
                // long as that origin sits at the cube's centre, but Blender
                // export often leaves it at a corner/vertex instead, so the
                // panel visually sprouted from one edge of the cube rather
                // than its middle. The cube's world-space BOUNDING-BOX centre
                // is correct regardless of where its pivot ended up.
                new THREE.Box3().setFromObject(obj).getCenter(pos);
                obj.visible = false;
            } else {
                obj.getWorldPosition(pos);
            }
            panelAnchors.set(Number(anchorMatch[1]), pos);
            return;
        }
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

    const result: NormalizedPavilion = { model, scale, offset, panelAnchors };
    normalizedCache.set(scene, result);
    return result;
};

/**
 * Loads det.glb (the pavilion interior), then centres it on the origin and
 * uniformly scales it so its largest dimension equals {@link PAVILION_TARGET_SIZE}.
 * Mirrors FactoryModelMesh's normalising transform so machine positions defined
 * in constants.ts land in a predictable local space.
 */
const PavilionModelMesh: React.FC<PavilionModelMeshProps> = ({ onReady, furnaces, onHistoryRangeChange }) => {
    const { scene } = useGLTF(MODEL_URL, DRACO_DECODER_PATH);

    const { model, scale, offset, panelAnchors } = useMemo(() => buildNormalizedPavilion(scene), [scene]);

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
            <FurnacePanels anchors={panelAnchors} furnaces={furnaces} onRangeChange={onHistoryRangeChange} />
        </group>
    );
};

useGLTF.preload(MODEL_URL, DRACO_DECODER_PATH);

export default PavilionModelMesh;
