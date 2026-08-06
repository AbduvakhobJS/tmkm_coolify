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
import type { BuildingMarker, Vec3, VideoMarker, WarningMarker, WidgetGroup } from "./types";

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

/**
 * Sky dome half-extent must stay well inside CAMERA_FAR, otherwise its faces sit
 * beyond the camera's far clipping plane and get culled entirely — the exact
 * cause of the black void that used to appear once the orbit zoomed out.
 */
export const SKY_DISTANCE = 400;

export const ORBIT_MIN_DISTANCE = 6;
export const ORBIT_MAX_DISTANCE = 70;
/** Keep the orbit from dipping under the ground plane. */
export const ORBIT_MAX_POLAR_ANGLE = Math.PI / 2.05;
export const ORBIT_DAMPING = 0.12;

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
export const FOG_NEAR = 30;
export const FOG_FAR = 160;
export const SCENE_BACKGROUND = "#050b1a";

/**
 * Real ground disc, lit by the scene lights and faded out by fog. Without this,
 * anywhere the camera looks past the (tiny, ~22-unit) model resolves to empty
 * space — the near-black sky/fog colour — which reads as a solid black slab
 * once the orbit zooms out past the model's footprint.
 */
export const GROUND_RADIUS = 40;
export const GROUND_COLOR = "#0b1626";

export const BLOOM_INTENSITY = 0.55;
export const BLOOM_LUMINANCE_THRESHOLD = 0.35;
export const BLOOM_LUMINANCE_SMOOTHING = 0.9;

/* ─── Building markers ─────────────────────────────────────────────────────────
 * 10 buildings distributed across the normalised factory footprint. Positions are
 * expressed in the model's local (centred) space; streamIndex cycles the 4 feeds.
 * ---------------------------------------------------------------------------- */

const MARKER_HEIGHT = 0.6;

export const BUILDING_MARKERS: BuildingMarker[] = [
    { id: "bld-01", building: "Production",   cameraName: "Shourm tashkil etish",    position: [6.5, MARKER_HEIGHT, -0.5], streamIndex: 0, type: "production" },
    { id: "bld-02", building: "Electrolysis Plant",  cameraName: "Ma'muriy bino",    position: [6, MARKER_HEIGHT, 1], streamIndex: 1, type: "scada" },
    { id: "bld-03", building: "Production",    cameraName: "Kutubxona",    position: [7,  MARKER_HEIGHT, -1.5], streamIndex: 2, type: "production" },
    { id: "bld-04", building: "Power Substation",    cameraName: "O‘tkazish nazorat punkti",      position: [7,  MARKER_HEIGHT, 4], streamIndex: 2, type: "energy" },
    { id: "bld-05", building: "Warehouse North",     cameraName: "O‘tkazish nazorat punkti (avtotransport)",   position: [7,  MARKER_HEIGHT, 5.5],  streamIndex: 0, type: "staff" },
    { id: "bld-06", building: "Logistics Terminal",  cameraName: '"R&D PARK" MChJ',  position: [2,  MARKER_HEIGHT, -4],  streamIndex: 1, type: "staff" },
    { id: "bld-07", building: "Chemical Storage",    cameraName: '"SMART POWDER" MChJ',  position: [-3, MARKER_HEIGHT, -1],  streamIndex: 2, type: "camera" },
    { id: "bld-08", building: "Control Center",      cameraName: "Oshxona",    position: [-1, MARKER_HEIGHT, 0.8],  streamIndex: 3, type: "scada" },
    { id: "bld-09", building: "Refinery Unit",       cameraName: "Kompozit materiallar va qotishmalar sexi",   position: [3, MARKER_HEIGHT, -1],  streamIndex: 0, type: "energy" },
    { id: "bld-10", building: "Quality Lab",         cameraName: "Molibden p. s. o‘tga chidamli buyumlar  sexi",     position: [3,  MARKER_HEIGHT, 1],  streamIndex: 1, type: "camera" },
    { id: "bld-11", building: "Quality Lab",         cameraName: "Molibden ishlab chiqaruvchi pirometallurgiya sexi",     position: [3,  MARKER_HEIGHT, 3.25],  streamIndex: 1, type: "camera" },
    { id: "bld-20", building: "Quality Lab",         cameraName: "Ta'mirlash-mexanik uchastka",     position: [3,  MARKER_HEIGHT, 5.2],  streamIndex: 1, type: "camera" },
    { id: "bld-12", building: "Quality Lab",         cameraName: "Energiya bilan ta'minlash sexi (kompressorxona)",     position: [2.5,  MARKER_HEIGHT, 6.6],  streamIndex: 1, type: "camera" },
    { id: "bld-13", building: "Quality Lab",         cameraName: "Qozonxona",     position: [3.5,  MARKER_HEIGHT, 6.6],  streamIndex: 1, type: "camera" },
    { id: "bld-14", building: "Quality Lab",         cameraName: "Nasosxona",     position: [4.2,  MARKER_HEIGHT, 6.6],  streamIndex: 1, type: "camera" },
    { id: "bld-15", building: "Quality Lab",         cameraName: "Energiya bilan ta'minlash (nimstansiya)",     position: [0,  MARKER_HEIGHT, 6.6],  streamIndex: 1, type: "camera" },
    { id: "bld-16", building: "Quality Lab",         cameraName: "O‘tga chidamli buyumlar ishlab chiqarish sexi",     position: [-2,  MARKER_HEIGHT, 5.2],  streamIndex: 1, type: "camera" },
    { id: "bld-17", building: "Quality Lab",         cameraName: "Asbob-uskunalar va texnologik jihozlar ishlab chiqarish sexi",     position: [-4,  MARKER_HEIGHT, 5.4],  streamIndex: 1, type: "camera" },
    { id: "bld-18", building: "Quality Lab",         cameraName: "Volfram ishlab chiqaruvchi pirometallurgiya sexi",     position: [-5,  MARKER_HEIGHT, -4.8],  streamIndex: 1, type: "camera" },
    { id: "bld-19", building: "Quality Lab",         cameraName: "Nodir metallarni chuqur qayta ishlash sexi",     position: [-3,  MARKER_HEIGHT, -3],  streamIndex: 1, type: "camera" },
];

/* ─── Video markers ────────────────────────────────────────────────────────────
 * 20 demo CCTV points scattered across the footprint in a 5×4 grid. Each cycles
 * through the 4 sample clips in public/videos/ (m1–m4.mp4).
 * ---------------------------------------------------------------------------- */

const VIDEO_MARKER_HEIGHT = 0.3;
const VIDEO_CLIPS = ["/videos/m1.mp4", "/videos/m2.mp4", "/videos/m3.mp4", "/videos/m4.mp4"];
const VIDEO_GRID_X = [-7.5, -4, -1.5, 5, 7.5];
const VIDEO_GRID_Z = [-4.7, -1.1, 3.1, 5.5];

export const VIDEO_MARKERS: VideoMarker[] = VIDEO_GRID_Z.flatMap((z, row) =>
    VIDEO_GRID_X.map((x, col) => {
        const index = row * VIDEO_GRID_X.length + col;
        return {
            id: `vid-${String(index + 1).padStart(2, "0")}`,
            position: [x, VIDEO_MARKER_HEIGHT, z] as Vec3,
            url: VIDEO_CLIPS[index % VIDEO_CLIPS.length],
            label: `CAM-${String(index + 1).padStart(2, "0")}`,
        };
    })
);

/* ─── Warning markers ──────────────────────────────────────────────────────────
 * 3 hazard/notice points. Two carry an illustration, one is text-only to
 * exercise the no-image fallback layout.
 * ---------------------------------------------------------------------------- */

const WARNING_MARKER_HEIGHT = 0.7;

export const WARNING_MARKERS: WarningMarker[] = [
    {
        id: "warn-01",
        position: [-3, WARNING_MARKER_HEIGHT, -8],
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        image: "/imgs/f1.png",
    },
    {
        id: "warn-02",
        position: [3, WARNING_MARKER_HEIGHT, -6.5],
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
    },
    {
        id: "warn-03",
        position: [0, WARNING_MARKER_HEIGHT, 6],
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse.",
        image: "/imgs/re1.jpg",
    },
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
