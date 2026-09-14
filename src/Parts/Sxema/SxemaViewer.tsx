/**
 * SxemaViewer — kimyoviy jarayon sxemasining 3D ko'ruvchisi.
 *
 * Bitta mustaqil komponent: three.js sahnasini o'zi yaratadi va o'zi tozalaydi.
 * Tashqaridan faqat `data` keladi — idish sathlari, nasos/ventil holati, quvurlardagi oqim.
 *
 * Peer dependency: react >= 18, three >= 0.160
 */
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type {
  SxemaData,
  SxemaSelection,
  SxemaView,
  SxemaViewerHandle,
} from './sxema.types';

export interface SxemaViewerProps {
  /** GLB manzili. Draco siqilgan variant tavsiya etiladi. */
  modelUrl?: string;
  /** Draco dekoder papkasi. O'zingizda hostlasangiz shu yerga yo'lni bering. */
  dracoDecoderPath?: string;
  /** Jonli ma'lumot. Berilmasa model statik holatda ko'rinadi. */
  data?: SxemaData;
  /** Quvurlarda yorug'lik oqimi. Default true. */
  flow?: boolean;
  /** Aralashtirgich parraklari aylansin. Default true. */
  agitators?: boolean;
  /** Boshlang'ich kamera ko'rinishi. Default 'reference' (Blender kamerasi). */
  initialView?: SxemaView;
  /** Fon rangi. Default '#1c2129'. */
  background?: string;
  /** Sichqoncha bilan burish/zoom. Default true. */
  controls?: boolean;
  /** Soyalar. Sekin qurilmalarda false qiling. Default true. */
  shadows?: boolean;
  /** Obyekt bosilganda. null — bo'sh joyga bosilgan. */
  onSelect?: (selection: SxemaSelection | null) => void;
  /** Obyekt ustiga sichqoncha kelganda. */
  onHover?: (selection: SxemaSelection | null) => void;
  /** Model yuklangach. */
  onLoad?: () => void;
  /** Yuklash foizi, 0…1. */
  onProgress?: (ratio: number) => void;
  onError?: (error: unknown) => void;
  className?: string;
  style?: React.CSSProperties;
}

/** Blender obyekt nomidan turini aniqlaydi. */
function kindOf(name: string): SxemaSelection['kind'] {
  if (/Agitator|_Liquid$|_Nozzle$/.test(name)) return 'other';
  if (/^Pipe/.test(name)) return 'pipe';
  if (/^V_/.test(name)) return 'valve';
  if (/^FE/.test(name)) return 'meter';
  if (/^H\d/.test(name)) return 'pump';
  if (/^K\d/.test(name)) return 'column';
  if (/^(E\d|P\d)/.test(name)) return 'vessel';
  return 'other';
}

/** `data` ichidan shu obyektga tegishli yozuvni topadi. */
function stateOf(data: SxemaData | undefined, id: string): SxemaSelection['state'] {
  if (!data) return undefined;
  return (
    data.vessels?.find((v) => v.id === id) ??
    data.pumps?.find((p) => p.id === id) ??
    data.valves?.find((v) => v.id === id) ??
    data.meters?.find((m) => m.id === id) ??
    data.lines?.find((l) => l.id === id)
  );
}

/** Sahnadagi obyekt uchun "egasi" nom: E1_Liquid -> E1, Pipe_X_Flanges -> Pipe_X */
function ownerName(name: string): string {
  return name
    .replace(/_Liquid$/, '')
    .replace(/_Nozzle$/, '')
    .replace(/_Flanges$/, '')
    .replace(/_fit(\.\d+)?$/, '')
    .replace(/\.\d+$/, '');
}

interface LiquidEntry {
  object: THREE.Object3D;
  baseScale: number;
  current: number;
  target: number;
}

interface FlowEntry {
  uSpeed: { value: number };
  uActive: { value: number };
  defaultSpeed: number;
}

const SxemaViewer = forwardRef<SxemaViewerHandle, SxemaViewerProps>(function SxemaViewer(
  {
    modelUrl = '/models/sxema_draco.glb',
    dracoDecoderPath = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/',
    data,
    flow = true,
    agitators = true,
    initialView = 'reference',
    background = '#1c2129',
    controls = true,
    shadows = true,
    onSelect,
    onHover,
    onLoad,
    onProgress,
    onError,
    className,
    style,
  },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  // ---- sahnaning barqaror (render'lar orasida saqlanadigan) qismi ----------
  const three = useRef({
    renderer: null as THREE.WebGLRenderer | null,
    scene: null as THREE.Scene | null,
    camera: null as THREE.PerspectiveCamera | null,
    controls: null as OrbitControls | null,
    root: null as THREE.Object3D | null,
    refPose: null as { pos: THREE.Vector3; quat: THREE.Quaternion; hfov: number } | null,
    center: new THREE.Vector3(),
    size: 30,
    refMode: true,
    liquids: new Map<string, LiquidEntry>(),
    flows: new Map<string, FlowEntry>(),
    spins: [] as { object: THREE.Object3D; speed: number; running: boolean }[],
    uTime: { value: 0 },
    uFlowOn: { value: 1 },
    hovered: null as THREE.Mesh | null,
    hoveredEmissive: 0,
    raf: 0,
  });

  // props'ni animatsiya sikliga yetkazish uchun
  const propsRef = useRef({ data, flow, agitators, onSelect, onHover });
  propsRef.current = { data, flow, agitators, onSelect, onHover };

  /** Kamerani gorizontal ko'rish burchagi bo'yicha sozlaydi (oyna nisbati o'zgarsa ham kadr saqlanadi). */
  const applyRefFov = useCallback(() => {
    const t = three.current;
    if (!t.camera || !t.refPose) return;
    t.camera.fov = THREE.MathUtils.radToDeg(
      2 * Math.atan(Math.tan(t.refPose.hfov / 2) / t.camera.aspect),
    );
    t.camera.updateProjectionMatrix();
  }, []);

  const setView = useCallback(
    (view: SxemaView) => {
      const t = three.current;
      if (!t.camera || !t.controls) return;
      if (view === 'reference' && t.refPose) {
        t.refMode = true;
        t.camera.position.copy(t.refPose.pos);
        t.camera.quaternion.copy(t.refPose.quat);
        applyRefFov();
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(t.refPose.quat);
        const k = t.refPose.pos.y / -dir.y;
        t.controls.target.copy(t.refPose.pos.clone().addScaledVector(dir, k * 0.96));
      } else if (view === 'top') {
        t.refMode = false;
        t.camera.position.set(t.center.x + 0.001, t.size * 1.05, t.center.z);
        t.controls.target.copy(t.center);
        t.camera.fov = 32;
        t.camera.updateProjectionMatrix();
      } else {
        t.refMode = false;
        t.camera.position.set(t.center.x - 9, 7, t.center.z + 11);
        t.controls.target.set(t.center.x, 1.2, t.center.z);
        t.camera.fov = 40;
        t.camera.updateProjectionMatrix();
      }
      t.controls.update();
    },
    [applyRefFov],
  );

  useImperativeHandle(
    ref,
    (): SxemaViewerHandle => ({
      setView,
      focus(id, distance) {
        const t = three.current;
        if (!t.root || !t.camera || !t.controls) return;
        const target = t.root.getObjectByName(id);
        if (!target) return;
        const box = new THREE.Box3().setFromObject(target);
        const c = box.getCenter(new THREE.Vector3());
        const d = distance ?? Math.max(2.5, box.getSize(new THREE.Vector3()).length() * 2.2);
        t.refMode = false;
        t.controls.target.copy(c);
        t.camera.position.set(c.x - d * 0.6, c.y + d * 0.55, c.z + d * 0.6);
        t.camera.fov = 40;
        t.camera.updateProjectionMatrix();
        t.controls.update();
      },
      clearSelection() {
        propsRef.current.onSelect?.(null);
      },
      snapshot() {
        const t = three.current;
        if (!t.renderer || !t.scene || !t.camera) return null;
        t.renderer.render(t.scene, t.camera);
        return t.renderer.domElement.toDataURL('image/png');
      },
      getScene() {
        return three.current.root;
      },
    }),
    [setView],
  );

  // ---- sahnani bir marta qurish -------------------------------------------
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const t = three.current;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;width:100%;height:100%;outline:none';
    canvas.tabIndex = 0;
    host.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.82;
    renderer.shadowMap.enabled = shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    t.renderer = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    t.scene = scene;

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 400);
    camera.position.set(-12, 20, 24);
    t.camera = camera;

    const orbit = new OrbitControls(camera, canvas);
    orbit.enableDamping = true;
    orbit.dampingFactor = 0.08;
    orbit.maxPolarAngle = Math.PI / 2 - 0.02;
    orbit.minDistance = 1.5;
    orbit.maxDistance = 120;
    orbit.enabled = controls;
    orbit.addEventListener('start', () => {
      t.refMode = false;
    });
    t.controls = orbit;

    const sun = new THREE.DirectionalLight(0xfff5e6, 2.6);
    sun.position.set(-18, 34, 22);
    sun.castShadow = shadows;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 120 });
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);
    const fillLight = new THREE.DirectionalLight(0xd9e6ff, 0.7);
    fillLight.position.set(26, 18, -20);
    scene.add(fillLight);
    scene.add(new THREE.HemisphereLight(0x8fa3bd, 0x0e1218, 0.55));

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshStandardMaterial({ color: 0x12161d, roughness: 0.95, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.32;
    ground.receiveShadow = shadows;
    ground.name = '__ground';
    scene.add(ground);

    // ---- model yuklash ----------------------------------------------------
    const draco = new DRACOLoader();
    draco.setDecoderPath(dracoDecoderPath);
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    let disposed = false;
    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;
        t.root = root;

        root.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) {
            const mesh = o as THREE.Mesh;
            mesh.castShadow = shadows;
            mesh.receiveShadow = shadows;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat && !Array.isArray(mesh.material)) {
              mat.envMapIntensity = mat.metalness > 0.5 ? 0.9 : 0.45;
              if (mat.transparent || mat.opacity < 1) {
                mat.transparent = true;
                mat.depthWrite = false;
                mat.side = THREE.DoubleSide;
                mesh.renderOrder = 2;
              }
              if (/^Liq/.test(mat.name)) {
                mat.roughness = 0.15;
                mat.envMapIntensity = 0.5;
              }
              if (/^Pipe/.test(mat.name)) {
                mat.roughness = 0.42;
                mat.envMapIntensity = 0.35;
                attachFlow(mesh, mat);
              }
              if (/^(Slab|Floor)/.test(mat.name)) {
                mat.envMapIntensity = 0.15;
                mat.roughness = 0.9;
              }
            }
            if (/_Liquid$/.test(mesh.name)) {
              t.liquids.set(ownerName(mesh.name), {
                object: mesh,
                baseScale: mesh.scale.y,
                current: 1,
                target: 1,
              });
            }
          }
          if (/Agitator/.test(o.name)) {
            t.spins.push({ object: o, speed: 3.6, running: true });
          }
          if ((o as THREE.Camera).isCamera && /^Camera/.test(o.name)) {
            const cam = o as THREE.PerspectiveCamera;
            cam.updateWorldMatrix(true, false);
            // glTF vertikal fov'ni 2:1 kadr uchun saqlaydi — gorizontalini hisoblab olamiz
            const hfov =
              2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * (cam.aspect || 2));
            t.refPose = {
              pos: new THREE.Vector3().setFromMatrixPosition(cam.matrixWorld),
              quat: new THREE.Quaternion().setFromRotationMatrix(cam.matrixWorld),
              hfov: hfov * 1.06,
            };
          }
        });

        scene.add(root);

        // orbit markazi: pol plitasi juda katta, faqat uskunalar bo'yicha o'lchaymiz
        const eq = new THREE.Box3();
        root.traverse((o) => {
          if ((o as THREE.Mesh).isMesh && !/Ground|Platform/.test(o.name)) eq.expandByObject(o);
        });
        t.center = eq.getCenter(new THREE.Vector3());
        t.size = eq.getSize(new THREE.Vector3()).length();
        orbit.target.copy(t.center);

        setView(initialView);
        setReady(true);
        onLoad?.();
      },
      (ev) => {
        if (ev.lengthComputable) onProgress?.(ev.loaded / ev.total);
      },
      (err) => onError?.(err),
    );

    /** Quvurga "boshidan oxiriga yuguruvchi yorug'lik" shaderini qo'shadi. */
    function attachFlow(mesh: THREE.Mesh, source: THREE.MeshStandardMaterial) {
      const cfg = propsRef.current.data?.flow ?? {};
      const spacing = cfg.spacing ?? 3.5;
      const tail = cfg.tail ?? 1.0;
      const intensity = cfg.intensity ?? 1.5;
      // Blender eksportida quvur uzunligi custom property sifatida keladi
      const len = Math.max(0.6, Number(mesh.userData?.flow_len) || 6);
      const dir = (Number(mesh.userData?.flow_dir) || 1) >= 0 ? 1 : -1;

      const uSpeed = { value: cfg.speed ?? 0.6 };
      const uActive = { value: 1 };
      const material = source.clone();
      // bir xil shader — barcha quvurlar bitta GPU dasturini baham ko'radi
      material.customProgramCacheKey = () => `sxema-flow-${spacing}-${tail}-${intensity}`;
      material.onBeforeCompile = (shader: {
        uniforms: Record<string, { value: unknown }>;
        vertexShader: string;
        fragmentShader: string;
      }) => {
        shader.uniforms.uTime = t.uTime;
        shader.uniforms.uFlowOn = t.uFlowOn;
        shader.uniforms.uSpeed = uSpeed;
        shader.uniforms.uActive = uActive;
        shader.uniforms.uLen = { value: len };
        shader.uniforms.uDir = { value: dir };
        shader.vertexShader =
          'varying vec2 vFlowUv;\n' +
          shader.vertexShader.replace('void main() {', 'void main() {\n  vFlowUv = uv;');
        shader.fragmentShader =
          'uniform float uTime,uFlowOn,uSpeed,uActive,uLen,uDir;\nvarying vec2 vFlowUv;\n' +
          shader.fragmentShader;
        // U o'qi quvur uzunligi bo'ylab yuradi (Blender UV shunday qilingan)
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>
           float s = uDir > 0.0 ? vFlowUv.x : 1.0 - vFlowUv.x;
           float x = s * uLen;
           float d = fract((uTime * uSpeed - x) / ${spacing.toFixed(2)}) * ${spacing.toFixed(2)};
           float g = exp(-d / ${tail.toFixed(2)}) * uFlowOn * uActive;
           diffuseColor.rgb *= (1.0 + g * 0.85);
           totalEmissiveRadiance += diffuseColor.rgb * g * ${intensity.toFixed(2)};`,
        );
      };
      material.needsUpdate = true;
      mesh.material = material;
      t.flows.set(ownerName(mesh.name), { uSpeed, uActive, defaultSpeed: uSpeed.value });
    }

    // ---- o'lcham ----------------------------------------------------------
    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      if (t.refMode) applyRefFov();
      else camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    // ---- sichqoncha -------------------------------------------------------
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    function pick(ev: PointerEvent): SxemaSelection | null {
      if (!t.root) return null;
      const rect = canvas.getBoundingClientRect();
      ndc.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObject(t.root, true);
      const hit = hits.find((h) => h.object.name !== '__ground');
      if (!hit) return null;
      const id = ownerName(hit.object.name);
      return {
        id,
        kind: kindOf(id),
        state: stateOf(propsRef.current.data, id),
        point: { x: hit.point.x, y: hit.point.y, z: hit.point.z },
        screen: { x: ev.clientX - rect.left, y: ev.clientY - rect.top },
      };
    }

    function setHover(mesh: THREE.Mesh | null) {
      if (t.hovered === mesh) return;
      if (t.hovered) {
        const m = t.hovered.material as THREE.MeshStandardMaterial;
        if (m && 'emissiveIntensity' in m) m.emissiveIntensity = t.hoveredEmissive;
      }
      t.hovered = mesh;
      if (mesh) {
        const m = mesh.material as THREE.MeshStandardMaterial;
        if (m && 'emissiveIntensity' in m) {
          t.hoveredEmissive = m.emissiveIntensity;
          m.emissiveIntensity = t.hoveredEmissive + 0.35;
        }
      }
      canvas.style.cursor = mesh ? 'pointer' : 'default';
    }

    const onPointerMove = (ev: PointerEvent) => {
      const sel = pick(ev);
      if (!t.root) return;
      const mesh = sel ? (t.root.getObjectByName(sel.id) as THREE.Mesh | undefined) : undefined;
      setHover(mesh && (mesh as THREE.Mesh).isMesh ? mesh : null);
      propsRef.current.onHover?.(sel);
    };
    const onCanvasClick = (ev: PointerEvent) => {
      propsRef.current.onSelect?.(pick(ev));
    };
    const onPointerLeave = () => {
      setHover(null);
      propsRef.current.onHover?.(null);
    };
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('click', onCanvasClick as unknown as EventListener);
    canvas.addEventListener('pointerleave', onPointerLeave);

    // ---- animatsiya -------------------------------------------------------
    const clock = new THREE.Clock();
    const tick = () => {
      t.raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      t.uTime.value += dt;
      t.uFlowOn.value = propsRef.current.flow ? 1 : 0;

      if (propsRef.current.agitators) {
        for (const s of t.spins) if (s.running) s.object.rotation.y += dt * s.speed;
      }
      // sathlar joriy qiymatdan maqsadga yumshoq suriladi
      for (const L of t.liquids.values()) {
        if (Math.abs(L.target - L.current) > 0.001) {
          L.current += (L.target - L.current) * Math.min(1, dt * 1.6);
          L.object.scale.y = Math.max(0.0005, L.baseScale * L.current);
        }
      }
      orbit.update();
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(t.raf);
      ro.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('click', onCanvasClick as unknown as EventListener);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      orbit.dispose();
      draco.dispose();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const m = mesh.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
      scene.environment?.dispose();
      renderer.dispose();
      canvas.remove();
      t.liquids.clear();
      t.flows.clear();
      t.spins = [];
      t.root = null;
    };
    // sahna bir marta quriladi; o'zgaruvchan qiymatlar propsRef orqali uzatiladi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl, dracoDecoderPath, shadows]);

  // ---- data -> sahna ------------------------------------------------------
  useEffect(() => {
    const t = three.current;
    if (!ready || !data) return;

    for (const v of data.vessels ?? []) {
      const L = t.liquids.get(v.id);
      if (L) L.target = Math.min(1, Math.max(0, v.level));
    }
    for (const line of data.lines ?? []) {
      const F = t.flows.get(line.id);
      if (F) {
        F.uActive.value = line.active ? 1 : 0;
        F.uSpeed.value = line.speed ?? data.flow?.speed ?? F.defaultSpeed;
      }
    }
    for (const a of data.agitators ?? []) {
      const s = t.spins.find((x) => x.object.name === a.id);
      if (s) {
        s.running = a.running;
        s.speed = a.rpm ?? 3.6;
      }
    }
    // nasos ishlamasa — undan chiqadigan quvurlarda oqim to'xtaydi
    for (const p of data.pumps ?? []) {
      if (p.running) continue;
      for (const [id, F] of t.flows) if (id.includes(p.id)) F.uActive.value = 0;
    }
    // yopiq ventil ham oqimni to'xtatadi
    for (const v of data.valves ?? []) {
      if (v.open) continue;
      const key = v.id.replace(/^V_/, '');
      for (const [id, F] of t.flows) if (id.includes(key)) F.uActive.value = 0;
    }
  }, [data, ready]);

  useEffect(() => {
    const t = three.current;
    if (t.scene) (t.scene.background as THREE.Color)?.set(background);
  }, [background]);

  useEffect(() => {
    const t = three.current;
    if (t.controls) t.controls.enabled = controls;
  }, [controls]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%', ...style }}
    />
  );
});

export default SxemaViewer;
