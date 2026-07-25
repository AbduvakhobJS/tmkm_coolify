import {
    FiActivity,
    FiAlertTriangle,
    FiCpu,
    FiDroplet,
    FiShield,
    FiThermometer,
    FiUsers,
    FiVideo,
    FiZap,
} from "react-icons/fi";
import { TbBuildingFactory2, TbGauge } from "react-icons/tb";
import type { BuildingMarker, WidgetGroup } from "./types";

/* ─── Backend / stream config ──────────────────────────────────────────────── */

export const CAMERA_API_URL = "https://tmk.bgs.uz/api/cameras?lang=uz";

/**
 * Fixed camera order — mirrors the 4 streams already used elsewhere in the app
 * (see components/VideoStream.tsx). Kept here so this module is self-contained.
 */
export const TARGET_CAMERA_UUIDS = [
    "27aec28e-6181-4753-9acd-0456a75f0289",
    "5705c987-46c6-4144-af4e-9ff878309c83",
    "46c74c01-a0bd-4e42-ade1-0a5dc734ce09",
    "85d5d297-7d73-43c6-a589-d175d78eb771",
] as const;

/** How many distinct hardware streams exist — markers cycle through these. */
export const STREAM_COUNT = TARGET_CAMERA_UUIDS.length;

/* ─── Model transform ──────────────────────────────────────────────────────── */

/** Largest bounding-box dimension the model is normalised to (world units). */
export const MODEL_TARGET_SIZE = 22;
/** Extra lift so the model sits cleanly on the contact-shadow plane. */
export const MODEL_GROUND_OFFSET = 0;
export const MODEL_ROTATION_Y = 0;

/* ─── Camera / controls ────────────────────────────────────────────────────── */

export const CAMERA_FOV = 42;
export const CAMERA_INITIAL_POSITION: [number, number, number] = [18, 12, 22];
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 500;

export const ORBIT_MIN_DISTANCE = 6;
export const ORBIT_MAX_DISTANCE = 70;
/** Keep the orbit from dipping under the ground plane. */
export const ORBIT_MAX_POLAR_ANGLE = Math.PI / 2.05;
export const ORBIT_DAMPING = 0.08;

/* ─── FPS walk (WASD) ──────────────────────────────────────────────────────── */

/** Units per second at full speed. */
export const FPS_MOVE_SPEED = 12;
/** Higher = snappier acceleration/deceleration toward target velocity. */
export const FPS_SMOOTHING = 6;
/** Minimum height above ground the camera may descend to while walking. */
export const FPS_MIN_HEIGHT = 1.2;
/** Ray buffer (world units) kept between the camera and any building mesh. */
export const FPS_COLLISION_BUFFER = 1.6;
/** Clamp horizontal roaming to this radius from the model centre. */
export const FPS_MAX_RADIUS = 60;

/* ─── Marker visuals ───────────────────────────────────────────────────────── */

export const MARKER_BASE_SCALE = 1;
export const MARKER_HOVER_SCALE = 1.35;
export const MARKER_PULSE_SPEED = 2.4;
export const MARKER_PULSE_MIN_OPACITY = 0.15;
export const MARKER_PULSE_MAX_OPACITY = 0.55;
export const MARKER_DISTANCE_FACTOR = 9;

/* ─── Environment ──────────────────────────────────────────────────────────── */

export const FOG_COLOR = "#0a1428";
export const FOG_NEAR = 45;
export const FOG_FAR = 130;
export const SCENE_BACKGROUND = "#050b1a";

export const BLOOM_INTENSITY = 0.55;
export const BLOOM_LUMINANCE_THRESHOLD = 0.35;
export const BLOOM_LUMINANCE_SMOOTHING = 0.9;

/* ─── Building markers ─────────────────────────────────────────────────────────
 * 10 buildings distributed across the normalised factory footprint. Positions are
 * expressed in the model's local (centred) space; streamIndex cycles the 4 feeds.
 * ---------------------------------------------------------------------------- */

const MARKER_HEIGHT = 0.6;

export const BUILDING_MARKERS: BuildingMarker[] = [
    { id: "bld-01", building: "Production",   cameraName: "CAM-01 · Smelter",    position: [-5, MARKER_HEIGHT, -4.9], streamIndex: 0, type: "production" },
    { id: "bld-02", building: "Electrolysis Plant",  cameraName: "CAM-02 · Electro",    position: [-3, MARKER_HEIGHT, -8.1], streamIndex: 1, type: "scada" },
    { id: "bld-03", building: "Production",    cameraName: "CAM-03 · Casting",    position: [3,  MARKER_HEIGHT, -8.1], streamIndex: 2, type: "production" },
    { id: "bld-04", building: "Power Substation",    cameraName: "CAM-04 · Power",      position: [6.5,  MARKER_HEIGHT, -1], streamIndex: 2, type: "energy" },
    { id: "bld-05", building: "Warehouse North",     cameraName: "CAM-05 · WH-North",   position: [7,  MARKER_HEIGHT, 5],  streamIndex: 0, type: "staff" },
    { id: "bld-06", building: "Logistics Terminal",  cameraName: "CAM-06 · Logistics",  position: [1,  MARKER_HEIGHT, -1],  streamIndex: 1, type: "staff" },
    { id: "bld-07", building: "Chemical Storage",    cameraName: "CAM-07 · Chemicals",  position: [-5, MARKER_HEIGHT, 3.4],  streamIndex: 2, type: "camera" },
    { id: "bld-08", building: "Control Center",      cameraName: "CAM-08 · Control",    position: [-5, MARKER_HEIGHT, -1.2],  streamIndex: 3, type: "scada" },
    { id: "bld-09", building: "Refinery Unit",       cameraName: "CAM-09 · Refinery",   position: [-5, MARKER_HEIGHT, -3.1],  streamIndex: 0, type: "energy" },
    { id: "bld-10", building: "Quality Lab",         cameraName: "CAM-10 · QC Lab",     position: [3,  MARKER_HEIGHT, 1],  streamIndex: 1, type: "camera" },
];

/* ─── Dashboard widgets ────────────────────────────────────────────────────── */

export const LEFT_WIDGETS: WidgetGroup[] = [
    {
        id: "factory-status",
        title: "Factory Status",
        icon: TbBuildingFactory2,
        metrics: [
            { id: "line-a", icon: FiActivity, label: "Line A", value: "Running", tone: "good" },
            { id: "line-b", icon: FiActivity, label: "Line B", value: "Running", tone: "good" },
            { id: "line-c", icon: FiActivity, label: "Line C", value: "Standby", tone: "warning" },
        ],
    },
    {
        id: "active-cameras",
        title: "Active Cameras",
        icon: FiVideo,
        metrics: [
            { id: "cams-online", icon: FiVideo, label: "Online", value: "10", unit: "/ 10", tone: "good" },
            { id: "cams-rec", icon: FiActivity, label: "Recording", value: "10", tone: "normal" },
        ],
    },
    {
        id: "online-devices",
        title: "Online Devices",
        icon: FiCpu,
        metrics: [
            { id: "dev-sensors", icon: FiCpu, label: "Sensors", value: "248", tone: "normal" },
            { id: "dev-plc", icon: FiCpu, label: "PLC Nodes", value: "36", tone: "normal" },
        ],
    },
    {
        id: "emergency-alerts",
        title: "Emergency Alerts",
        icon: FiAlertTriangle,
        metrics: [
            { id: "alert-crit", icon: FiAlertTriangle, label: "Critical", value: "0", tone: "good" },
            { id: "alert-warn", icon: FiAlertTriangle, label: "Warnings", value: "2", tone: "warning" },
        ],
    },
    {
        id: "energy-usage",
        title: "Energy Usage",
        icon: FiZap,
        metrics: [
            { id: "energy-now", icon: FiZap, label: "Current", value: "8.4", unit: "MW", tone: "normal" },
            { id: "energy-peak", icon: TbGauge, label: "Peak", value: "11.2", unit: "MW", tone: "warning" },
        ],
    },
];

export const RIGHT_WIDGETS: WidgetGroup[] = [
    {
        id: "production",
        title: "Production",
        icon: TbGauge,
        metrics: [
            { id: "prod-output", icon: TbGauge, label: "Output", value: "1 240", unit: "t/d", tone: "good" },
            { id: "prod-eff", icon: FiActivity, label: "Efficiency", value: "94", unit: "%", tone: "good" },
        ],
    },
    {
        id: "temperature",
        title: "Temperature",
        icon: FiThermometer,
        metrics: [
            { id: "temp-furnace", icon: FiThermometer, label: "Furnace", value: "1 180", unit: "°C", tone: "warning" },
            { id: "temp-ambient", icon: FiThermometer, label: "Ambient", value: "27", unit: "°C", tone: "normal" },
        ],
    },
    {
        id: "humidity",
        title: "Humidity",
        icon: FiDroplet,
        metrics: [
            { id: "hum-hall", icon: FiDroplet, label: "Main Hall", value: "41", unit: "%", tone: "normal" },
            { id: "hum-store", icon: FiDroplet, label: "Storage", value: "38", unit: "%", tone: "normal" },
        ],
    },
    {
        id: "workers",
        title: "Workers",
        icon: FiUsers,
        metrics: [
            { id: "work-onsite", icon: FiUsers, label: "On-site", value: "312", tone: "normal" },
            { id: "work-field", icon: FiUsers, label: "In-field", value: "88", tone: "normal" },
        ],
    },
    {
        id: "security",
        title: "Security Status",
        icon: FiShield,
        metrics: [
            { id: "sec-perimeter", icon: FiShield, label: "Perimeter", value: "Secure", tone: "good" },
            { id: "sec-access", icon: FiShield, label: "Access Ctrl", value: "Armed", tone: "good" },
        ],
    },
];
