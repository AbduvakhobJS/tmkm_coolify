/**
 * Demo ma'lumotlar. Real SCADA/API ulanmagunicha shuni ishlatish mumkin.
 * `createDemoFeed()` — sekundiga bir marta qiymatlarni o'zgartirib turadigan soxta oqim.
 */
import type { SxemaData } from './sxema.types';

/** Sahnadagi barcha idishlar va kolonnalar. */
export const VESSEL_IDS = [
  'E1', 'E2', 'E2_1', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9',
  'E10_1', 'E10_2', 'E11', 'E12', 'E13', 'E14', 'E15', 'E16', 'E17',
  'K1_4', 'K5_8', 'K9_12', 'K13_16',
] as const;

export const PUMP_IDS = ['H3_1', 'H4_1', 'H5_2', 'H9_2'] as const;

export const VALVE_IDS = [
  'V_Ammonia_In', 'V_Acid_In', 'V_Acid_E14', 'V_Water_Hdr',
  'V_Water_K1_4', 'V_Water_K5_8', 'V_Water_K9_12', 'V_Water_K13_16',
  'V_P1', 'V_P2', 'V_P3', 'V_P4',
  'V_FE8_1', 'V_FE8_2', 'V_FE8_3', 'V_FE8_4',
  'V_E2_1_Out', 'V_E12_Out',
] as const;

export const METER_IDS = [
  'FE2_1', 'FE2_2', 'FE2_3', 'FE2_4', 'FE3_2', 'FE3_3',
  'FE8_1', 'FE8_2', 'FE8_3', 'FE8_4', 'FE12_1', 'FE14_1', 'FE17_1',
] as const;

/** Asosiy quvur liniyalari (hammasi emas — eng muhimlari). */
export const LINE_IDS = [
  'Pipe_Ammonia_In_E1', 'Pipe_E1_E2', 'Pipe_E2_Hdr', 'Pipe_E2_1_E15', 'Pipe_E2_1_E17',
  'Pipe_Acid_In_E13', 'Pipe_Acid_E13_E7', 'Pipe_Acid_E14', 'Pipe_Acid_Main_E16', 'Pipe_Acid_E2',
  'Pipe_Water_Hdr', 'Pipe_Water_E2', 'Pipe_Water_E7', 'Pipe_Water_E14',
  'Pipe_Water_K1_4', 'Pipe_Water_K5_8', 'Pipe_Water_K9_12', 'Pipe_Water_K13_16',
  'Pipe_Feed_K1_4', 'Pipe_Feed_K5_8', 'Pipe_Feed_K9_12', 'Pipe_Feed_K13_16',
  'Pipe_K1_4_E5', 'Pipe_K5_8_E5', 'Pipe_K9_12_E5', 'Pipe_K13_16_E5',
  'Pipe_K1_4_P1', 'Pipe_K5_8_P2', 'Pipe_K9_12_P3', 'Pipe_K13_16_P4',
  'Pipe_P1_Hdr', 'Pipe_P2_Hdr', 'Pipe_P3_Hdr', 'Pipe_P4_Hdr',
  'Pipe_E5_E6', 'Pipe_E6_H9', 'Pipe_E7_H9', 'Pipe_E7_E8', 'Pipe_E8_Hdr',
  'Pipe_E9_E16', 'Pipe_E16_H3', 'Pipe_H3_E15', 'Pipe_H4_E9', 'Pipe_H4_E17',
  'Pipe_H5_E5', 'Pipe_E4_H5', 'Pipe_E17_E9', 'Pipe_E12_E11', 'Pipe_E12_E2_1',
  'Pipe_E11_E10_1', 'Pipe_E11_E10_2', 'Pipe_E10_1_E4',
  'Pipe_Air_E2', 'Pipe_Air_E7', 'Pipe_Air_E14',
] as const;

const PRODUCT: Record<string, string> = {
  E1: 'Ammiakli suv', E2: 'Ammiakli suv', E2_1: 'Filtrat', E3: 'Jarayon eritmasi',
  E4: 'Jarayon eritmasi', E5: 'Yig\'gich', E6: 'Yig\'gich', E7: 'Reaktor massasi',
  E8: 'Reaktor massasi', E9: 'Oraliq eritma', E10_1: 'Oraliq eritma', E10_2: 'Oraliq eritma',
  E11: 'Oraliq eritma', E12: 'Oraliq eritma', E13: 'Kislota', E14: 'Kislota',
  E15: 'Mahsulot', E16: 'Reaktor', E17: 'Mahsulot',
  K1_4: 'Filtr yuki', K5_8: 'Filtr yuki', K9_12: 'Filtr yuki', K13_16: 'Filtr yuki',
};

const LABEL: Record<string, string> = {
  E2_1: 'E2-1 gorizontal filtr',
  K1_4: 'Filtr 1-4', K5_8: 'Filtr 5-8', K9_12: 'Filtr 9-12', K13_16: 'Filtr 13-16',
  H3_1: 'Nasos H3/1', H4_1: 'Nasos H4/1', H5_2: 'Nasos H5/2', H9_2: 'Nasos H9/2',
};

/** Takrorlanadigan (deterministik) tasodifiy son — SSR va client bir xil natija bersin. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/** Bitta statik snapshot — birinchi render uchun. */
export function createDemoData(seed = 7): SxemaData {
  const rnd = seeded(seed);
  return {
    updatedAt: new Date(0).toISOString(),
    flow: { speed: 0.6, spacing: 3.5, tail: 1.0, intensity: 1.5 },
    vessels: VESSEL_IDS.map((id) => ({
      id,
      label: LABEL[id] ?? id,
      level: Math.round((0.25 + rnd() * 0.7) * 100) / 100,
      temperature: Math.round(28 + rnd() * 42),
      product: PRODUCT[id] ?? 'Eritma',
      status: rnd() > 0.92 ? 'warning' : 'ok',
    })),
    pumps: PUMP_IDS.map((id) => ({
      id,
      label: LABEL[id] ?? id,
      running: rnd() > 0.2,
      flow: Math.round(12 + rnd() * 30),
      status: 'ok',
    })),
    valves: VALVE_IDS.map((id) => ({ id, label: id.replace(/^V_/, ''), open: rnd() > 0.25 })),
    meters: METER_IDS.map((id) => ({
      id,
      label: id.replace('_', '/'),
      value: Math.round(rnd() * 400) / 10,
      unit: 'm³/s',
    })),
    lines: LINE_IDS.map((id) => ({
      id,
      active: rnd() > 0.12,
      speed: 0.5 + rnd() * 0.3,
      direction: 1 as const,
    })),
    agitators: [
      { id: 'E7_Agitator', running: true, rpm: 3.6 },
      { id: 'E16_Agitator', running: true, rpm: 2.8 },
    ],
  };
}

/**
 * Soxta "jonli" oqim: har `intervalMs` da yangi SxemaData beradi.
 * Real loyihada shu funksiyani WebSocket yoki polling bilan almashtiring.
 *
 *   useEffect(() => createDemoFeed(setData, 2000), []);
 */
export function createDemoFeed(
  onData: (data: SxemaData) => void,
  intervalMs = 2000,
): () => void {
  let base = createDemoData();
  let tick = 0;
  onData(base);
  const id = setInterval(() => {
    tick += 1;
    const rnd = seeded(1000 + tick);
    base = {
      ...base,
      updatedAt: new Date().toISOString(),
      vessels: base.vessels!.map((v) => {
        const next = Math.min(1, Math.max(0, v.level + (rnd() - 0.5) * 0.18));
        return { ...v, level: Math.round(next * 100) / 100, temperature: Math.round(28 + rnd() * 42) };
      }),
      pumps: base.pumps!.map((p) => ({ ...p, running: rnd() > 0.15, flow: Math.round(12 + rnd() * 30) })),
      meters: base.meters!.map((m) => ({ ...m, value: Math.round(rnd() * 400) / 10 })),
      lines: base.lines!.map((l) => ({ ...l, active: rnd() > 0.12 })),
    };
    onData(base);
  }, intervalMs);
  return () => clearInterval(id);
}
