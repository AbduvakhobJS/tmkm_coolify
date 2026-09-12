import React, { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { FurnaceState } from "../hooks/useFurnaceTelemetry";

type TintKey = "sariq" | "yashil" | "qizil" | "oq";

// Sariq/Yashil/Qizil tints layered over each qobiq segment's own baked
// material (colour + a touch of emissive so the state reads even in shadow);
// "oq" is not a swatch — it just means "leave the model's own default
// material alone".
const TINTS: Record<"sariq" | "yashil" | "qizil", { color: number; emissive: number }> = {
    sariq: { color: 0xf4c430, emissive: 0x3a2600 },
    yashil: { color: 0x2ecc71, emissive: 0x00300f },
    qizil: { color: 0xe74c3c, emissive: 0x330000 },
};

// diff = |temp - setpoint|. Mirrors index2.html's colorStops tiers (10 / 20 / 30+),
// collapsed onto the 3 available tinted materials + the untouched default.
const ZONE_DIFF_YASHIL_MAX = 10;
const ZONE_DIFF_SARIQ_MAX = 20;

const BLINK_PERIOD_S = 1; // 0.5s on, 0.5s off
const BLINK_ON_INTENSITY = 2.6;
const BLINK_OFF_INTENSITY = 0.15;
const IDLE_INTENSITY = 0.05;

interface QobiqEntry {
    mesh: THREE.Mesh;
    original: THREE.Material | THREE.Material[];
}

interface ChiroqEntry {
    mesh: THREE.Mesh;
    material: THREE.MeshStandardMaterial;
}

interface FurnaceNodes {
    /** furnaceIndex → zoneNumber (1-5) → the mesh(es) for that `{n}t_qobiq{zone}` segment. */
    qobiq: Map<number, Map<number, QobiqEntry[]>>;
    /** furnaceIndex → the mesh(es) for that furnace's `asosiy_chiroq{n}`. */
    chiroq: Map<number, ChiroqEntry[]>;
}

const tintVariantCache = new WeakMap<THREE.Material, Partial<Record<"sariq" | "yashil" | "qizil", THREE.Material>>>();

const getTintedVariant = (material: THREE.Material, key: "sariq" | "yashil" | "qizil"): THREE.Material => {
    let variants = tintVariantCache.get(material);
    if (!variants) {
        variants = {};
        tintVariantCache.set(material, variants);
    }
    let variant = variants[key];
    if (!variant) {
        const clone = material.clone();
        const tint = TINTS[key];
        if (clone instanceof THREE.MeshStandardMaterial || clone instanceof THREE.MeshPhysicalMaterial) {
            clone.color = new THREE.Color(tint.color);
            clone.emissive = new THREE.Color(tint.emissive);
            clone.emissiveIntensity = 1;
        }
        variant = clone;
        variants[key] = variant;
    }
    return variant;
};

// e.g. "1t_qobiq3" / "1t_qobiq3.001" → furnace 1, zone 3.
const QOBIQ_RE = /^(\d+)t_qobiq(\d+)/i;
// e.g. "asosiy_chiroq4" / "asosiy_chiroq4.001" → furnace 4.
const CHIROQ_RE = /^asosiy_chiroq(\d+)/i;

const collectFurnaceNodes = (model: THREE.Object3D): FurnaceNodes => {
    const qobiq: FurnaceNodes["qobiq"] = new Map();
    const chiroq: FurnaceNodes["chiroq"] = new Map();

    model.traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh) return;
        const mesh = obj as THREE.Mesh;

        const qMatch = QOBIQ_RE.exec(mesh.name);
        if (qMatch) {
            const furnace = Number(qMatch[1]);
            const zone = Number(qMatch[2]);
            if (!qobiq.has(furnace)) qobiq.set(furnace, new Map());
            const byZone = qobiq.get(furnace)!;
            if (!byZone.has(zone)) byZone.set(zone, []);
            byZone.get(zone)!.push({ mesh, original: mesh.material });
            return;
        }

        const cMatch = CHIROQ_RE.exec(mesh.name);
        if (cMatch) {
            const furnace = Number(cMatch[1]);
            // Clone the light's material once so each furnace's bulb can blink
            // independently — in the GLB every asosiy_chiroq shares one material
            // (chiroqasosiy_M), which ships with no emissiveFactor at all (pure
            // pbrMetallicRoughness baseColor). Toggling emissiveIntensity alone
            // against a black emissive multiplies out to zero — always invisible
            // — so the clone also needs an actual emissive colour to glow with.
            const sourceMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
            const material = (sourceMat?.clone() ?? new THREE.MeshStandardMaterial()) as THREE.MeshStandardMaterial;
            material.emissive = new THREE.Color(0xff6a10);
            mesh.material = Array.isArray(mesh.material) ? mesh.material.map(() => material) : material;
            if (!chiroq.has(furnace)) chiroq.set(furnace, []);
            chiroq.get(furnace)!.push({ mesh, material });
        }
    });

    return { qobiq, chiroq };
};

const nodesCache = new WeakMap<THREE.Object3D, FurnaceNodes>();

const zoneTint = (zone: { temp: number | null; setpoint: number } | undefined, status: boolean): TintKey => {
    if (!status || !zone || zone.temp == null || !Number.isFinite(zone.temp)) return "oq";
    const diff = Math.abs(zone.temp - zone.setpoint);
    if (diff <= ZONE_DIFF_YASHIL_MAX) return "yashil";
    if (diff <= ZONE_DIFF_SARIQ_MAX) return "sariq";
    return "qizil";
};

interface FurnaceVisualsProps {
    /** The already-normalised pavilion model group (see PavilionModelMesh). */
    model: THREE.Object3D;
    furnaces: FurnaceState[];
}

/**
 * Tints each furnace's 5 `{n}t_qobiq*` shell segments — Sariq/Yashil/Qizil
 * by |temp − setpoint|, or left at the model's own default ("oq") when the
 * furnace is off / has no data — and blinks each furnace's `asosiy_chiroq{n}`
 * light on/off every 0.5s while that furnace is running.
 *
 * Node names absent from the currently-loaded det.glb (today only furnaces
 * 1–3 exist there) are simply absent from the lookup and skipped — this
 * picks up furnaces 4–6 automatically once their nodes are added to the model.
 */
const FurnaceVisuals: React.FC<FurnaceVisualsProps> = ({ model, furnaces }) => {
    const nodes = useMemo(() => {
        const cached = nodesCache.get(model);
        if (cached) return cached;
        const built = collectFurnaceNodes(model);
        nodesCache.set(model, built);
        return built;
    }, [model]);

    useEffect(() => {
        furnaces.forEach((furnace) => {
            const byZone = nodes.qobiq.get(furnace.index);
            if (!byZone) return;
            byZone.forEach((entries, zoneNum) => {
                const key = zoneTint(furnace.zones[zoneNum - 1], furnace.status);
                entries.forEach((entry) => {
                    if (key === "oq") {
                        entry.mesh.material = entry.original;
                        return;
                    }
                    entry.mesh.material = Array.isArray(entry.original)
                        ? entry.original.map((m) => getTintedVariant(m, key))
                        : getTintedVariant(entry.original, key);
                });
            });
        });
    }, [furnaces, nodes]);

    const runningByFurnace = useMemo(() => {
        const map = new Map<number, boolean>();
        furnaces.forEach((f) => map.set(f.index, f.status));
        return map;
    }, [furnaces]);

    useFrame(({ clock }) => {
        if (nodes.chiroq.size === 0) return;
        const on = clock.elapsedTime % BLINK_PERIOD_S < BLINK_PERIOD_S / 2;
        nodes.chiroq.forEach((entries, furnaceIndex) => {
            const running = runningByFurnace.get(furnaceIndex) ?? false;
            const intensity = running ? (on ? BLINK_ON_INTENSITY : BLINK_OFF_INTENSITY) : IDLE_INTENSITY;
            entries.forEach(({ material }) => {
                material.emissiveIntensity = intensity;
            });
        });
    });

    return null;
};

export default FurnaceVisuals;
