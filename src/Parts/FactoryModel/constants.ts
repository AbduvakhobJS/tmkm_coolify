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
    { id: "bld-01", building: "Production",   cameraName: "Situatsion markaz",    position: [6.1, MARKER_HEIGHT, 0.5], streamIndex: 0, type: "into" },
    { id: "bld-02", building: "Electrolysis Plant",  cameraName: "Ma'muriy bino",    position: [6, MARKER_HEIGHT, 1.5], streamIndex: 1, type: "into" },
    { id: "bld-03", building: "Production",    cameraName: "Kutubxona",    position: [7,  MARKER_HEIGHT, -1.5], streamIndex: 2, type: "into" },
    { id: "bld-04", building: "Power Substation",    cameraName: "O‘tkazish nazorat punkti",      position: [7,  MARKER_HEIGHT, 4], streamIndex: 2, type: "into" },
    { id: "bld-05", building: "Warehouse North",     cameraName: "O‘tkazish nazorat punkti (avtotransport)",   position: [7,  MARKER_HEIGHT, 5.5],  streamIndex: 0, type: "into" },
    { id: "bld-06", building: "Logistics Terminal",  cameraName: '"R&D PARK" MChJ',  position: [2,  MARKER_HEIGHT, -4],  streamIndex: 1, type: "into" },
    { id: "bld-07", building: "Chemical Storage",    cameraName: 'Asosiy saqlash (Elektromexanika ustaxonasi)',  position: [-3, MARKER_HEIGHT, -1],  streamIndex: 2, type: "into" },
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
 * 18 real CCTV feeds, laid out across the same 5×4 footprint grid the earlier
 * demo-clip version used (20 slots, first 18 filled). Each plays over WebRTC
 * from WEBRTC_SERVER using its own stream_uuid — see components/WebRTCPlayer.tsx
 * for the SDP-negotiation client and components/VideoStream.tsx for the same
 * URL pattern used elsewhere in the app.
 * ---------------------------------------------------------------------------- */

const VIDEO_MARKER_HEIGHT = 0.3;
const WEBRTC_SERVER = "https://tmkstream.bgs.uz";
const VIDEO_GRID_X = [-7.5, -4, -1.5, 5, 7.5];
const VIDEO_GRID_Z = [-4.7, -1.1, 3.1, 5.5];

const VIDEO_GRID_POSITIONS: Vec3[] = VIDEO_GRID_Z.flatMap((z) =>
    VIDEO_GRID_X.map((x) => [x, VIDEO_MARKER_HEIGHT, z] as Vec3)
);

interface RawCamera {
    id: string;
    ip: string;
    name: string;
}


const CAMERAS: RawCamera[] = [
    { id: "c8673b0d-56d6-4f1a-98cb-373508568503", ip: "10.50.10.155", name: "KPP-2 ploshadka" },
    { id: "11f5bcb2-2d3d-42c8-8876-aa2a8b802a6c", ip: "10.50.10.154", name: "Camera 0112" },
    { id: "97ae3643-255b-482d-b23c-9ad1d7ca5760", ip: "10.50.10.105", name: "1-sex pech" },
    { id: "9c908439-8e83-4c22-b156-e10e049c4593", ip: "10.50.10.102", name: "2-uchastka pech" },
    { id: "cbb32e29-4fa2-481f-927b-8179d5fd59f2", ip: "10.50.10.101", name: "2-uchastka" },
    { id: "97ae3643-255b-482d-b23c-9ad1d7ca5760", ip: "10.50.10.105", name: "1-sex pech" },
    { id: "11f5bcb2-2d3d-42c8-8876-aa2a8b802a6c", ip: "10.50.10.154", name: "Camera 0112" },
    { id: "11f5bcb2-2d3d-42c8-8876-aa2a8b802a6c", ip: "10.50.10.154", name: "Camera 0112" },
    { id: "cbb32e29-4fa2-481f-927b-8179d5fd59f2", ip: "10.50.10.101", name: "2-uchastka" },
    { id: "97ae3643-255b-482d-b23c-9ad1d7ca5760", ip: "10.50.10.105", name: "1-sex pech" },
    { id: "9c908439-8e83-4c22-b156-e10e049c4593", ip: "10.50.10.102", name: "2-uchastka pech" },
    { id: "cbb32e29-4fa2-481f-927b-8179d5fd59f2", ip: "10.50.10.101", name: "2-uchastka" },
    { id: "97ae3643-255b-482d-b23c-9ad1d7ca5760", ip: "10.50.10.105", name: "1-sex pech" },
    { id: "97ae3643-255b-482d-b23c-9ad1d7ca5760", ip: "10.50.10.105", name: "1-sex pech" },
    { id: "11f5bcb2-2d3d-42c8-8876-aa2a8b802a6c", ip: "10.50.10.154", name: "Camera 0112" },
    { id: "9c908439-8e83-4c22-b156-e10e049c4593", ip: "10.50.10.102", name: "2-uchastka pech" },
    { id: "97ae3643-255b-482d-b23c-9ad1d7ca5760", ip: "10.50.10.105", name: "1-sex pech" },
    { id: "9c908439-8e83-4c22-b156-e10e049c4593", ip: "10.50.10.102", name: "2-uchastka pech" },
    { id: "cbb32e29-4fa2-481f-927b-8179d5fd59f2", ip: "10.50.10.101", name: "2-uchastka" },
    { id: "97ae3643-255b-482d-b23c-9ad1d7ca5760", ip: "10.50.10.105", name: "1-sex pech" },



    { id: "9d494f37-3516-46eb-9aa8-1ed6ac632144", ip: "10.50.10.122", name: "прекурсор" },
];


// const CAMERAS: RawCamera[] = [
//     { id: "cbb32e29-4fa2-481f-927b-8179d5fd59f2", ip: "10.50.10.101", name: "2-uchastka" },
//     { id: "9c908439-8e83-4c22-b156-e10e049c4593", ip: "10.50.10.102", name: "2-uchastka pech" },
//     { id: "a14b930e-cca2-4b55-ad52-7bbbfbeeaee2", ip: "10.50.10.103", name: "sklad brakovka" },
//     { id: "6fd6a1ad-32b3-4b6d-b97f-5767e4ea7728", ip: "10.50.10.104", name: "2-uchastka" },
//     { id: "97ae3643-255b-482d-b23c-9ad1d7ca5760", ip: "10.50.10.105", name: "1-sex pech" },
//     { id: "ecc97a7d-1fd9-452c-b1b9-6ec867918cbe", ip: "10.50.10.106", name: "2-uchastka kalpak" },
//     { id: "06c53be7-d5a4-49ff-b62e-092b960af124", ip: "10.50.10.107", name: "2-uchastka presovka" },
//     { id: "61d621ae-0de1-4d56-ac99-ab1c811b968d", ip: "10.50.10.108", name: "1-uchastka brakovka" },
//     { id: "d9706026-aafd-48ca-a1cd-8f3577456fe2", ip: "10.50.10.109", name: "4-sex produksiya" },
//     { id: "a3ebaf38-4a83-4256-9585-1292f79bfff4", ip: "10.50.10.110", name: "4-sex gotoviy p" },
//     { id: "b3724502-0f19-4007-a6aa-2e048aca6700", ip: "10.50.10.111", name: "4-sex presovka" },
//     { id: "15c29ff4-1a9c-435d-a768-5aa630733905", ip: "10.50.10.112", name: "4-sex 1-uhastka" },
//     { id: "d84a4e2b-6245-4b19-8f98-dff7a43dbe2f", ip: "10.50.10.113", name: "4-sex 1-etaj" },
//     { id: "8ccb3f08-f64d-42ac-aa87-ac136d923e5c", ip: "10.50.10.114", name: "4-sex filtratsiya 3-uch" },
//     { id: "6569dd99-c3f6-445b-85c3-5c66390ee40e", ip: "10.50.10.115", name: "4-sex pech" },
//     { id: "decbb96c-b8dc-40ef-b0ca-150f982165f9", ip: "10.50.10.116", name: "4-sex 3-uchastka" },
//     { id: "94f2c0dc-40b8-48d1-bcc3-f8294a157ca2", ip: "10.50.10.117", name: "4-sex uparka 4-etaj" },
//     { id: "d6ede994-f22c-42ae-90cc-fd86c8f7cdef", ip: "10.50.10.118", name: "4-sex prokalka" },
//     { id: "bcb73625-0e49-4ae1-98a0-d81bbe0aef7a", ip: "10.50.10.119", name: "4-sex 3-etaj" },
//     { id: "32904e40-7eed-4f4f-a997-a23f3d46700f", ip: "10.50.10.120", name: "4-sex 2-etaj disopsiya" },
//     { id: "1946449b-afe5-4029-b6ae-74778c0eb60e", ip: "10.50.10.121", name: "кислотка" },
//     { id: "9d494f37-3516-46eb-9aa8-1ed6ac632144", ip: "10.50.10.122", name: "прекурсор" },
//     { id: "cf594ff1-0759-41d7-8452-1ff86655549b", ip: "10.50.10.123", name: "вход склад" },
//     { id: "45de91b0-0107-4f04-93ea-bef87d22b9bb", ip: "10.50.10.124", name: "ворота 2пл" },
//     { id: "8c28e544-e46c-4867-ac03-a2c949af43c5", ip: "10.50.10.125", name: "sklad" },
//     { id: "d9e1e346-d921-4efa-b2e4-93de61ab5f87", ip: "10.50.10.126", name: "kotelnaya" },
//     { id: "b925308a-48c5-4dd3-a2fd-2c7d9a54848f", ip: "10.50.10.127", name: "35-sex metal" },
//     { id: "11a107e6-f05f-4474-975a-dd40954775f4", ip: "10.50.10.128", name: "ворота 1пл" },
//     { id: "5ad155f8-b848-436d-9b1c-2733ba53f26b", ip: "10.50.10.129", name: "angar1" },
//     { id: "643a7d2a-b730-4e11-801c-3a593ede0580", ip: "10.50.10.130", name: "angar" },
//     { id: "c291f9af-6995-46af-94d0-0d4ccc2b6a82", ip: "10.50.10.131", name: "agarka2" },
//     { id: "f4db2874-1a94-4b26-bcca-cca23d2492ef", ip: "10.50.10.132", name: "sklad agarka" },
//     { id: "839e3e56-4976-45ba-9c2d-2bbc3286d563", ip: "10.50.10.133", name: "agarka3" },
//     { id: "e365bb1e-d41e-44f5-9c2c-28a9aa560782", ip: "10.50.10.134", name: "sklad rmu" },
//     { id: "90774e0c-1ab3-4eb3-9709-0076a0d0589e", ip: "10.50.10.135", name: "sklad vxod" },
//     { id: "9ce71b2c-06b6-4214-acae-49ef3a1ef171", ip: "10.50.10.136", name: "angar stroyka" },
//     { id: "4c5e4b4c-d06a-44e4-9b67-43b5399c7ea5", ip: "10.50.10.137", name: "10-цех коридор" },
//     { id: "aeb70e25-adff-47a7-a2ee-eb4b47a76d4c", ip: "10.50.10.138", name: "sklad 1" },
//     { id: "7d0991fa-8079-4528-a4a4-941b203f4ce6", ip: "10.50.10.139", name: "sklad 1" },
//     { id: "ea5aa4d2-b919-4692-acff-0196f83f194f", ip: "10.50.10.140", name: "sklad 1" },
//     { id: "c7cb9775-df2e-4d65-890d-6fc5edf4b5f3", ip: "10.50.10.141", name: "sklad koridor" },
//     { id: "d91401ff-0a3e-423c-8012-03c1a174723b", ip: "10.50.10.142", name: "ВОРОТА 1 пл" },
//     { id: "df8ad35b-c439-4fa9-8d93-7ef503f0a675", ip: "10.50.10.143", name: "sgp" },
//     { id: "89cc0381-5956-4f03-9ed6-ff32bb6895ab", ip: "10.50.10.144", name: "sgp2" },
//     { id: "2efd1e48-aa09-4da8-b04e-63a2335e31ae", ip: "10.50.10.145", name: "sklad 6" },
//     { id: "740acfc6-0b85-4c27-ae4c-c8e460b23518", ip: "10.50.10.146", name: "angar ventil" },
//     { id: "d4ee5727-6d5a-4fc7-91a8-7dee8ee67413", ip: "10.50.10.147", name: "sklad soda vxod" },
//     { id: "48140970-ea30-45da-a902-cb588562f435", ip: "10.50.10.148", name: "sklad instrument" },
//     { id: "aa9ea3be-5dd4-4619-bd6a-e687359b8636", ip: "10.50.10.149", name: "sklad maslo" },
//     { id: "d0a11bc1-7724-4736-b968-6418c77d4394", ip: "10.50.10.150", name: "10-sex zal" },
//     { id: "09b44727-911e-4c39-b942-6f51932ad186", ip: "10.50.10.151", name: "ВОРОТА 1пл" },
//     { id: "7dc84aaa-ae2a-4e61-862b-f8859941d8c0", ip: "10.50.10.152", name: "RMU perimetr" },
//     { id: "8fb4f3c4-4073-457c-8ea7-d23463bfef18", ip: "10.50.10.153", name: "RMU DOROGA" },
//     { id: "11f5bcb2-2d3d-42c8-8876-aa2a8b802a6c", ip: "10.50.10.154", name: "Camera 01" },
//     { id: "c8673b0d-56d6-4f1a-98cb-373508568503", ip: "10.50.10.155", name: "KPP-2 ploshadka" },
//     { id: "d3c2edb8-8785-4332-9b12-88dae0d6c3ad", ip: "10.50.10.156", name: "10-sex" },
//     { id: "85fb257c-0943-4e47-8b86-9414bcdbb03c", ip: "10.50.10.157", name: "ПЕРИМЕТР" },
//     { id: "bb811af3-9016-414f-8b73-cd15b8dc7a37", ip: "10.50.10.158", name: "ПЕРИМЕТР РМУ2" },
//     { id: "20f89af7-a436-483a-bf60-1560a870efb5", ip: "10.50.10.159", name: "ПЕРИМЕТР 2" },
//     { id: "7b7457f9-3f0c-4209-811a-6f9efac307ff", ip: "10.50.10.160", name: "5-ЦЕХ ПЕРИМЕТР" },
//     { id: "981528ee-24b9-4385-87b3-0fd8897c8d3f", ip: "10.50.10.161", name: "5-ЦЕХ УЗМЕТАЛЛ" },
//     { id: "06131365-d32a-4a71-becf-f35965346b2d", ip: "10.50.10.162", name: "4-ЦЕХ" },
//     { id: "54e71372-3464-47f9-9814-2cd459ac4f26", ip: "10.50.10.163", name: "НАСОСНЫЙ ПЕСОК" },
//     { id: "2379eeef-ef64-4397-9991-d70c7e68c397", ip: "10.50.10.164", name: "10-ЦЕХ ТОКАРНАЯ" },
//
//     { id: "14da735a-afe7-4906-8e2a-8f97fbbe52bf", ip: "10.50.11.2", name: "IPdome" },
//     { id: "4afa0d92-9a49-43ca-9dfa-f660b4ba95c5", ip: "10.50.11.3", name: "IPdome" },
//     { id: "87291397-8908-423c-ab2b-89e75f83ce00", ip: "10.50.11.4", name: "IPdome" },
//     { id: "c72d4125-671e-4dac-ad42-dfbb940eb65b", ip: "10.50.11.5", name: "IPdome" },
//     { id: "bcd91c72-9c11-44a7-823b-25db6f636e1f", ip: "10.50.11.6", name: "IPdome" },
//     { id: "710d3e45-0ff4-4318-9969-434088703cca", ip: "10.50.11.7", name: "IPdome" },
//
//     { id: "3ef48283-eb45-4dde-8b88-0afbfa2c0215", ip: "10.50.10.203", name: "Camera 01" },
//     { id: "7e108d31-433b-45a2-a16d-98a8dbd340b0", ip: "10.50.10.204", name: "Camera 01" },
// ];

const buildVideoStreamUrl = (uuid: string): string =>
    `${WEBRTC_SERVER}/stream/${uuid}/channel/1/webrtc?uuid=${uuid}&channel=1`;

export const VIDEO_MARKERS: VideoMarker[] = CAMERAS.map((cam, index) => ({
    id: `vid-${String(index + 1).padStart(2, "0")}`,
    position: VIDEO_GRID_POSITIONS[index],
    url: buildVideoStreamUrl(cam.id),
    label: cam.name,
}));

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
