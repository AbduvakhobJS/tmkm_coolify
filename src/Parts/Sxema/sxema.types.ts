/**
 * Sxema 3D — ma'lumot tiplari.
 * Sahna obyektlarining nomlari Blender fayldagi nomlar bilan bir xil (E1, K1_4, V_P1, ...).
 */

/** Idish (tank) yoki filtr kolonnasining joriy holati. */
export interface VesselState {
  /** Blender obyekt nomi: "E1" … "E17", "E10_1", "K1_4" … "K13_16". */
  id: string;
  /** Ekranda ko'rsatiladigan nom. */
  label?: string;
  /** Suyuqlik sathi, 0…1 (1 = 100 % to'la). Model ichidagi *_Liquid obyekti shu qiymatga scale qilinadi. */
  level: number;
  /** Harorat, °C — faqat tooltip uchun, geometriyaga ta'sir qilmaydi. */
  temperature?: number;
  /** Qanday suyuqlik: tooltip va rang uchun. */
  product?: string;
  status?: 'ok' | 'warning' | 'alarm';
}

/** Nasos holati. */
export interface PumpState {
  /** "H3_1", "H4_1", "H5_2", "H9_2". */
  id: string;
  label?: string;
  running: boolean;
  /** m3/soat. */
  flow?: number;
  status?: 'ok' | 'warning' | 'alarm';
}

/** Ventil holati (ochiq / yopiq). */
export interface ValveState {
  /** "V_P1", "V_Water_Hdr", "V_FE8_1", ... */
  id: string;
  label?: string;
  open: boolean;
}

/** Oqim o'lchagich ko'rsatkichi. */
export interface MeterState {
  /** "FE8_1", "FE2_1", ... */
  id: string;
  label?: string;
  value: number;
  unit?: string;
}

/** Quvurdagi oqim. Berilmasa quvur `defaultFlow` bo'yicha oqadi. */
export interface LineState {
  /** "Pipe_E1_E2", "Pipe_Water_Hdr", ... */
  id: string;
  label?: string;
  /** Oqim bor-yo'qligi. false bo'lsa quvurda yorug'lik yurmaydi. */
  active: boolean;
  /** Yorug'lik tezligi, m/s. Berilmasa `flow.speed` ishlatiladi. */
  speed?: number;
  /** Oqim yo'nalishi: 1 — quvur boshidan oxiriga, -1 — teskari. */
  direction?: 1 | -1;
}

/** Aralashtirgich (parrak) holati. */
export interface AgitatorState {
  /** "E7_Agitator", "E16_Agitator". */
  id: string;
  running: boolean;
  /** Aylanish tezligi, rad/s. Berilmasa 3.6. */
  rpm?: number;
}

/** Quvurlardagi yorug'lik oqimining umumiy sozlamalari. */
export interface FlowConfig {
  /** Yorug'lik tezligi, metr/sekund. Default 0.6. */
  speed: number;
  /** Ikki yorug'lik orasidagi masofa, metr. Default 3.5. */
  spacing: number;
  /** Yorug'lik dumining uzunligi, metr. Default 1.0. */
  tail: number;
  /** Yorqinlik kuchi. Default 1.5. */
  intensity: number;
}

/** Komponentga uzatiladigan butun ma'lumot to'plami. */
export interface SxemaData {
  vessels?: VesselState[];
  pumps?: PumpState[];
  valves?: ValveState[];
  meters?: MeterState[];
  lines?: LineState[];
  agitators?: AgitatorState[];
  flow?: Partial<FlowConfig>;
  /** Ma'lumot olingan vaqt (ISO). */
  updatedAt?: string;
}

/** Sahnadagi bosilgan obyekt haqidagi ma'lumot. */
export interface SxemaSelection {
  /** Blender obyekt nomi. */
  id: string;
  /** Obyekt turi. */
  kind: 'vessel' | 'column' | 'pump' | 'valve' | 'meter' | 'pipe' | 'other';
  /** Shu obyektga tegishli ma'lumot (agar `data` ichida bo'lsa). */
  state?: VesselState | PumpState | ValveState | MeterState | LineState;
  /** Bosilgan nuqta, dunyo koordinatalari (metr). */
  point: { x: number; y: number; z: number };
  /** Ekran koordinatalari — tooltip chiqarish uchun. */
  screen: { x: number; y: number };
}

/** Kamera ko'rinishlari. */
export type SxemaView = 'reference' | 'top' | 'iso';

/** ref orqali tashqaridan boshqarish. */
export interface SxemaViewerHandle {
  /** Kamerani berilgan ko'rinishga olib boradi. */
  setView(view: SxemaView): void;
  /** Berilgan obyektga yaqinlashadi. */
  focus(id: string, distance?: number): void;
  /** Tanlovni bekor qiladi. */
  clearSelection(): void;
  /** Joriy kadrni PNG data-URL sifatida qaytaradi. */
  snapshot(): string | null;
  /** Yuklangan modelning ildiz obyekti (three.js Object3D) — maxsus holatlar uchun. */
  getScene(): unknown;
}
