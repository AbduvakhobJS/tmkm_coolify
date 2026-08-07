import {
    FiActivity,
    FiAlertTriangle,
    FiClock,
    FiCpu,
    FiDroplet,
    FiShield,
    FiThermometer,
    FiUsers,
    FiVideo,
    FiZap,
} from "react-icons/fi";
import {
    GiCircuitry,
    GiFurnace,
    GiGears,
    GiPowerButton,
    GiSpeedometer,
    GiSunbeams,
    GiWeightScale,
} from "react-icons/gi";
import { TbBuildingFactory2, TbGauge } from "react-icons/tb";
import type { BuildingMarker, MachineMarker, Vec3, VideoMarker, WarningMarker, WidgetGroup } from "./types";

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

/**
 * Shared with PavilionModelMesh AND the idle-preload trigger in FactoryModel.tsx —
 * all three must reference the exact same URL/path pair so drei's GLTF cache
 * actually hits instead of re-fetching det.glb when the pavilion modal opens.
 */
export const PAVILION_MODEL_URL = "/models/det.glb";
export const DRACO_DECODER_PATH = "/draco/";

/* ─── Camera / controls ────────────────────────────────────────────────────── */

export const CAMERA_FOV = 42;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 500;

/**
 * The default view used to open ~45° off from how the scene actually reads,
 * so it always needed a manual orbit-drag to the left to look right. Rather
 * than rotate the model itself (building markers are positioned in world
 * space, independently of the model's own rotation group, and would drift
 * out of alignment if the model turned), the default camera position is
 * pre-rotated by this offset instead — same fix, no marker side effects.
 * Positive = counter-clockwise (viewed from above). Flip the sign if this
 * ends up turning the wrong way.
 */
const CAMERA_INITIAL_ROTATION_OFFSET = Math.PI / 3;

const rotateAroundY = (
    [x, y, z]: [number, number, number],
    theta: number
): [number, number, number] => {
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    return [x * cos + z * sin, y, -x * sin + z * cos];
};

export const CAMERA_INITIAL_POSITION: [number, number, number] = rotateAroundY(
    [18, 12, 22],
    CAMERA_INITIAL_ROTATION_OFFSET
);

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

/* ─── Marker fly-in (main scene, plays before FactoryIntoModal opens) ────────
 * Clicking a building marker zooms/dips the camera in close to it first;
 * only once that flight lands does the pavilion modal actually open.
 * ---------------------------------------------------------------------------- */

/** Seconds for the camera to glide into a clicked marker. */
export const MARKER_FLY_DURATION = 1.4;
/** How far back from the marker the camera stops (world units), approaching from wherever it currently is. */
export const MARKER_APPROACH_DISTANCE = 4;
/** Camera eye height above the marker's own y once parked in front of it — well below the overview height, for the "descend in" feel. */
export const MARKER_APPROACH_HEIGHT = 2.4;

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

/* ─── Intro camera fly-through (main scene, plays once on mount) ─────────────
 * Dips the camera down to walking height, tours a closed loop of 20 points
 * around the 10-building complex, then eases back to CAMERA_INITIAL_POSITION.
 * ---------------------------------------------------------------------------- */

/** Eye height while circling the model — matches a person walking, not the overview shot. */
export const INTRO_WALK_HEIGHT = 1.8;
/** Radius of the tour loop around the (centred, normalised) model — kept well clear of the buildings. */
export const INTRO_LOOP_RADIUS = 26;
/** Seconds to travel the full 20-point loop (excludes the descend-in / return-out transitions). */
export const INTRO_LOOP_DURATION = 10;
/** Seconds to ease down from the overview into the loop, and back up again at the end. */
export const INTRO_TRANSITION_DURATION = 1.3;

export const INTRO_FLY_POINTS: Vec3[] = [
    [INTRO_LOOP_RADIUS * 1.0000, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * 0.0000],   // 0°
    [INTRO_LOOP_RADIUS * 0.9457, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * 0.3247],   // 18.95°
    [INTRO_LOOP_RADIUS * 0.7891, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * 0.6142],   // 37.89°
    [INTRO_LOOP_RADIUS * 0.5469, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * 0.8371],   // 56.84°
    [INTRO_LOOP_RADIUS * 0.2455, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * 0.9694],   // 75.79°
    [INTRO_LOOP_RADIUS * -0.0824, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * 0.9966],  // 94.74°
    [INTRO_LOOP_RADIUS * -0.4017, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * 0.9158],  // 113.68°
    [INTRO_LOOP_RADIUS * -0.6773, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * 0.7357],  // 132.63°
    [INTRO_LOOP_RADIUS * -0.8794, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * 0.4759],  // 151.58°
    [INTRO_LOOP_RADIUS * -0.9863, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * 0.1650],  // 170.53°
    [INTRO_LOOP_RADIUS * -0.9863, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * -0.1650], // 189.47°
    [INTRO_LOOP_RADIUS * -0.8794, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * -0.4759], // 208.42°
    [INTRO_LOOP_RADIUS * -0.6773, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * -0.7357], // 227.37°
    [INTRO_LOOP_RADIUS * -0.4017, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * -0.9158], // 246.32°
    [INTRO_LOOP_RADIUS * -0.0824, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * -0.9966], // 265.26°
    [INTRO_LOOP_RADIUS * 0.2455, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * -0.9694],  // 284.21°
    [INTRO_LOOP_RADIUS * 0.5469, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * -0.8371],  // 303.16°
    [INTRO_LOOP_RADIUS * 0.7891, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * -0.6142],  // 322.11°
    [INTRO_LOOP_RADIUS * 0.9457, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * -0.3247],  // 341.05°
    [INTRO_LOOP_RADIUS * 1.0000, INTRO_WALK_HEIGHT, INTRO_LOOP_RADIUS * 0.0000],   // 360° = 0° (loop yopiladi)
];

/** 20 waypoints circling the model at walking height; point 20 (index 19) lands back on point 1, closing the loop. */
// export const INTRO_FLY_POINTS: Vec3[] = Array.from({ length: 20 }, (_, i) => {
//     const angle = (i / 19) * Math.PI * 2;
//     return [
//         Math.cos(angle) * INTRO_LOOP_RADIUS,
//         INTRO_WALK_HEIGHT,
//         Math.sin(angle) * INTRO_LOOP_RADIUS,
//     ] as Vec3;
// });

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
export const GROUND_RADIUS = 240;
export const GROUND_COLOR = "#345116";

export const BLOOM_INTENSITY = 0.55;
export const BLOOM_LUMINANCE_THRESHOLD = 0.35;
export const BLOOM_LUMINANCE_SMOOTHING = 0.9;

/* ─── Building markers ─────────────────────────────────────────────────────────
 * 10 buildings distributed across the normalised factory footprint. Positions are
 * expressed in the model's local (centred) space; streamIndex cycles the 4 feeds.
 * ---------------------------------------------------------------------------- */

const MARKER_HEIGHT = 0.6;

export const BUILDING_MARKERS: BuildingMarker[] = [
    { id: "bld-01", building: "Production",   cameraName: "Shourm tashkil etish",    position: [6.5, MARKER_HEIGHT, -0.5], streamIndex: 0, type: "into" },
    { id: "bld-02", building: "Electrolysis Plant",  cameraName: "Ma'muriy bino",    position: [6, MARKER_HEIGHT, 1], streamIndex: 1, type: "into" },
    { id: "bld-03", building: "Production",    cameraName: "Kutubxona",    position: [7,  MARKER_HEIGHT, -1.5], streamIndex: 2, type: "into" },
    { id: "bld-04", building: "Power Substation",    cameraName: "O‘tkazish nazorat punkti",      position: [7,  MARKER_HEIGHT, 4], streamIndex: 2, type: "into" },
    { id: "bld-05", building: "Warehouse North",     cameraName: "O‘tkazish nazorat punkti (avtotransport)",   position: [7,  MARKER_HEIGHT, 5.5],  streamIndex: 0, type: "into" },
    { id: "bld-06", building: "Logistics Terminal",  cameraName: '"R&D PARK" MChJ',  position: [2,  MARKER_HEIGHT, -4],  streamIndex: 1, type: "into" },
    { id: "bld-07", building: "Chemical Storage",    cameraName: '"SMART POWDER" MChJ',  position: [-3, MARKER_HEIGHT, -1],  streamIndex: 2, type: "into" },
    { id: "bld-08", building: "Control Center",      cameraName: "Oshxona",    position: [-1, MARKER_HEIGHT, 0.8],  streamIndex: 3, type: "into" },
    { id: "bld-09", building: "Refinery Unit",       cameraName: "Kompozit materiallar va qotishmalar sexi",   position: [3, MARKER_HEIGHT, -1],  streamIndex: 0, type: "into" },
    { id: "bld-10", building: "Quality Lab",         cameraName: "Molibden p. s. o‘tga chidamli buyumlar  sexi",     position: [3,  MARKER_HEIGHT, 1],  streamIndex: 1, type: "into" },
    { id: "bld-11", building: "Quality Lab",         cameraName: "Molibden ishlab chiqaruvchi pirometallurgiya sexi",     position: [3,  MARKER_HEIGHT, 3.25],  streamIndex: 1, type: "into" },
    { id: "bld-20", building: "Quality Lab",         cameraName: "Ta'mirlash-mexanik uchastka",     position: [3,  MARKER_HEIGHT, 5.2],  streamIndex: 1, type: "into" },
    { id: "bld-12", building: "Quality Lab",         cameraName: "Energiya bilan ta'minlash sexi (kompressorxona)",     position: [2.5,  MARKER_HEIGHT, 6.6],  streamIndex: 1, type: "into" },
    { id: "bld-13", building: "Quality Lab",         cameraName: "Qozonxona",     position: [3.5,  MARKER_HEIGHT, 6.6],  streamIndex: 1, type: "into" },
    { id: "bld-14", building: "Quality Lab",         cameraName: "Nasosxona",     position: [4.2,  MARKER_HEIGHT, 6.6],  streamIndex: 1, type: "into" },
    { id: "bld-15", building: "Quality Lab",         cameraName: "Energiya bilan ta'minlash (nimstansiya)",     position: [0,  MARKER_HEIGHT, 6.6],  streamIndex: 1, type: "into" },
    { id: "bld-16", building: "Quality Lab",         cameraName: "O‘tga chidamli buyumlar ishlab chiqarish sexi",     position: [-2,  MARKER_HEIGHT, 5.2],  streamIndex: 1, type: "into" },
    { id: "bld-17", building: "Quality Lab",         cameraName: "Asbob-uskunalar va texnologik jihozlar ishlab chiqarish sexi",     position: [-4,  MARKER_HEIGHT, 5.4],  streamIndex: 1, type: "into" },
    { id: "bld-18", building: "Quality Lab",         cameraName: "Volfram ishlab chiqaruvchi pirometallurgiya sexi",     position: [-5,  MARKER_HEIGHT, -4.8],  streamIndex: 1, type: "into" },
    { id: "bld-19", building: "Quality Lab",         cameraName: "Nodir metallarni chuqur qayta ishlash sexi",     position: [-3,  MARKER_HEIGHT, -3],  streamIndex: 1, type: "into" },
    // { id: "bld-into-01", building: "Pavilion #1",    cameraName: "Pavilion ichki ko‘rinishi",     position: [-4,  MARKER_HEIGHT, 1.6],  streamIndex: 0, type: "into" },
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

/* ─── Pavilion interior (FactoryIntoModal) ────────────────────────────────────
 * Fullscreen up-close walkthrough of a single pavilion (det.glb) with 10
 * machines laid out in two facing rows either side of a centre aisle.
 * ---------------------------------------------------------------------------- */

/** Largest bounding-box dimension the pavilion model is normalised to. Bigger
 * than {@link MODEL_TARGET_SIZE} since this view is meant to feel walkable/up-close. */
export const PAVILION_TARGET_SIZE = 40;
export const PAVILION_GROUND_RADIUS = 30;
export const PAVILION_CAMERA_FOV = 50;
export const PAVILION_CAMERA_INITIAL_POSITION: [number, number, number] = [0, 6, 22];
/** Seconds for the camera to glide to a selected machine's viewpoint. */
export const PAVILION_FLY_DURATION = 1.1;
/** How far back from the machine the camera stops (world units), approaching from wherever it currently is. */
export const PAVILION_APPROACH_DISTANCE = 5;
/** Camera eye height above the machine's own y when parked in front of it. */
export const PAVILION_APPROACH_HEIGHT = 2.2;

/**
 * 10 machines laid out in two facing rows: #1–3 are identical CNC processing
 * units, #4–6 are the three parallel tungsten-reduction furnaces, #7–8 are
 * the second-stage (sintering) furnace pair, #9 is the drying chamber that
 * follows them, and #10 is the section's electrical switchgear.
 */
export const MACHINE_MARKERS: MachineMarker[] = [
    {
        id: "machine-1",
        number: 1,
        name: "CNC qayta ishlash stanogi №1",
        icon: GiGears,
        status: "running",
        description: "Volfram sterjenlarini aylantirib qayta ishlaydigan CNC stanogi.",
        specs: [
            { icon: FiActivity, label: "Holati", value: "Ishlamoqda" },
            { icon: GiSpeedometer, label: "Aylanish tezligi", value: "1 450 aylanma/daq" },
            { icon: GiWeightScale, label: "Yuklama", value: "78%" },
            { icon: FiThermometer, label: "Shpindel harorati", value: "42 °C" },
        ],
        position: [1, 1, 1],
    },
    {
        id: "machine-2",
        number: 2,
        name: "CNC qayta ishlash stanogi №2",
        icon: GiGears,
        status: "running",
        description: "Volfram sterjenlarini aylantirib qayta ishlaydigan CNC stanogi.",
        specs: [
            { icon: FiActivity, label: "Holati", value: "Ishlamoqda" },
            { icon: GiSpeedometer, label: "Aylanish tezligi", value: "1 390 aylanma/daq" },
            { icon: GiWeightScale, label: "Yuklama", value: "84%" },
            { icon: FiThermometer, label: "Shpindel harorati", value: "45 °C" },
        ],
        position: [1, 1, -7],
    },
    {
        id: "machine-3",
        number: 3,
        name: "CNC qayta ishlash stanogi №3",
        icon: GiGears,
        status: "maintenance",
        description: "Volfram sterjenlarini aylantirib qayta ishlaydigan CNC stanogi.",
        specs: [
            { icon: FiActivity, label: "Holati", value: "Texnik xizmatda" },
            { icon: GiSpeedometer, label: "Aylanish tezligi", value: "0 aylanma/daq" },
            { icon: GiWeightScale, label: "Yuklama", value: "0%" },
            { icon: FiClock, label: "To‘xtab turgan vaqt", value: "2 soat 15 daq" },
        ],
        position: [1, 1, -15],
    },

    {
        id: "machine-4",
        number: 4,
        name: "Volfram qaytarish pechi №1",
        icon: GiFurnace,
        status: "running",
        description: "Vodorod muhitida volfram oksidini metall kukunigacha qaytaruvchi pech.",
        specs: [
            { icon: FiActivity, label: "Holati", value: "Ishlamoqda" },
            { icon: FiThermometer, label: "Pech harorati", value: "1 150 °C" },
            { icon: GiWeightScale, label: "Volfram kukuni chiqishi", value: "38 kg/soat" },
            { icon: FiZap, label: "Energiya sarfi", value: "62 kWh" },
        ],
        position: [-2.5, 1, -4.8],
    },
    {
        id: "machine-5",
        number: 5,
        name: "Volfram qaytarish pechi №2",
        icon: GiFurnace,
        status: "running",
        description: "Vodorod muhitida volfram oksidini metall kukunigacha qaytaruvchi pech.",
        specs: [
            { icon: FiActivity, label: "Holati", value: "Ishlamoqda" },
            { icon: FiThermometer, label: "Pech harorati", value: "1 180 °C" },
            { icon: GiWeightScale, label: "Volfram kukuni chiqishi", value: "41 kg/soat" },
            { icon: FiZap, label: "Energiya sarfi", value: "65 kWh" },
        ],
        position: [-4, 1, -4.8],
    },
    {
        id: "machine-6",
        number: 6,
        name: "Volfram qaytarish pechi №3",
        icon: GiFurnace,
        status: "warning",
        description: "Vodorod muhitida volfram oksidini metall kukunigacha qaytaruvchi pech.",
        specs: [
            { icon: FiActivity, label: "Holati", value: "Haroratdan ogish" },
            { icon: FiThermometer, label: "Pech harorati", value: "1 240 °C" },
            { icon: GiWeightScale, label: "Volfram kukuni chiqishi", value: "33 kg/soat" },
            { icon: FiZap, label: "Energiya sarfi", value: "70 kWh" },
        ],
        position: [-5.8, 1, -4.8],
    },

    {
        id: "machine-7",
        number: 7,
        name: "2-etap pechi №1",
        icon: GiSunbeams,
        status: "running",
        description: "Volfram kukunini yuqori haroratda spekaydigan ikkinchi bosqich pechi.",
        specs: [
            { icon: FiActivity, label: "Holati", value: "Ishlamoqda" },
            { icon: FiThermometer, label: "Pech harorati", value: "2 300 °C" },
            { icon: GiSpeedometer, label: "Sikl davomiyligi", value: "5 soat 40 daq" },
            { icon: FiZap, label: "Energiya sarfi", value: "118 kWh" },
        ],
        position: [-5.5, 1, 6.5],
    },
    {
        id: "machine-8",
        number: 8,
        name: "2-etap pechi №2",
        icon: GiSunbeams,
        status: "running",
        description: "Volfram kukunini yuqori haroratda spekaydigan ikkinchi bosqich pechi.",
        specs: [
            { icon: FiActivity, label: "Holati", value: "Ishlamoqda" },
            { icon: FiThermometer, label: "Pech harorati", value: "2 280 °C" },
            { icon: GiSpeedometer, label: "Sikl davomiyligi", value: "5 soat 55 daq" },
            { icon: FiZap, label: "Energiya sarfi", value: "121 kWh" },
        ],
        position: [-3.5, 1, 6.5],
    },
    {
        id: "machine-9",
        number: 9,
        name: "Quritish kamerasi",
        icon: FiDroplet,
        status: "running",
        description: "Spekangan volfram sterjenlarini keyingi bosqichdan oldin quritadigan kamera.",
        specs: [
            { icon: FiActivity, label: "Holati", value: "Quritilmoqda" },
            { icon: FiThermometer, label: "Kamera harorati", value: "180 °C" },
            { icon: FiDroplet, label: "Namlik darajasi", value: "6%" },
            { icon: FiClock, label: "Quritish vaqti", value: "1 soat 20 daq" },
        ],
        position: [2.4, 1, 7.6],
    },
    {
        id: "machine-10",
        number: 10,
        name: "Elektr shchiti",
        icon: GiCircuitry,
        status: "running",
        description: "Sexning barcha pech va stanoklarini quvvat bilan ta'minlovchi asosiy taqsimot shchiti.",
        specs: [
            { icon: GiPowerButton, label: "Holati", value: "Nazoratda" },
            { icon: FiZap, label: "Kuchlanish", value: "380 V" },
            { icon: FiActivity, label: "Tok yuklamasi", value: "72%" },
            { icon: FiShield, label: "Himoya tizimi", value: "Faol" },
        ],
        position: [5.5, 2, 11.6],
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
