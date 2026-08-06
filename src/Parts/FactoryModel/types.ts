import type { IconType } from "react-icons";

/** A single CCTV camera stream sourced from the backend WebRTC API. */
export interface CameraStream {
    /** stream_uuid — used to build the WebRTC URL */
    id: string;
    /** numeric camera id from the API */
    cameraId: number;
    /** human readable label ("Navoi 1", "Angren PTZ"...) */
    label: string;
    /** fully-qualified WebRTC negotiation URL */
    streamUrl: string;
    hasPtz: boolean;
}

/** 3D world position expressed as a tuple, ready to spread into three.js props. */
export type Vec3 = [x: number, y: number, z: number];

export type MarkerType = "scada" | "camera" | "energy" | "production" | "staff";

/** Static description of a building marker floating above the factory model. */
export interface BuildingMarker {
    /** stable id, e.g. "bld-01" */
    id: string;
    /** display name of the building */
    building: string;
    /** display name of the mounted camera */
    cameraName: string;
    /** world-space anchor for the billboard marker */
    position: Vec3;
    /** index (0-based) into the resolved camera-stream array this marker maps to */
    streamIndex: number;
    /** type of the marker determining which modal to open */
    type: MarkerType;
}

/** A single readout rendered inside a glass dashboard widget. */
export interface WidgetMetric {
    id: string;
    icon: IconType;
    label: string;
    value: string;
    /** optional trailing unit ("°C", "%", "kW") */
    unit?: string;
    /** semantic tone driving the accent colour */
    tone?: "normal" | "good" | "warning" | "danger";
}

/** A grouped card of metrics shown in a side panel. */
export interface WidgetGroup {
    id: string;
    title: string;
    icon: IconType;
    metrics: WidgetMetric[];
}

/** A CCTV point that plays a local demo clip in a popup above its marker. */
export interface VideoMarker {
    id: string;
    position: Vec3;
    /** Path to the video file (public/videos/*.mp4). */
    url: string;
    label: string;
}

/** A hazard/notice point that opens a small animated notice panel. */
export interface WarningMarker {
    id: string;
    position: Vec3;
    text: string;
    /** Optional illustration; when absent the panel falls back to text-only. */
    image?: string;
}
