import { Facility, Project, OpCard } from '../types';

export const MONTHS = ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];
export const DAYS = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
export const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

export const FACILITIES: Facility[] = [
  { name: 'Almalyk Mining & Metallurgical Complex', coords: [69.60, 40.85], type: 'smelting',  output: '420,000 t', workers: 12400, stage: 'Midstream' },
  { name: 'Navoi Mining Combine (NGMK)',            coords: [65.38, 40.09], type: 'mining',    output: '380,000 t', workers: 9800,  stage: 'Upstream' },
  { name: 'Tashkent Metallurgical Plant',           coords: [69.24, 41.30], type: 'refinery',  output: '210,000 t', workers: 6200,  stage: 'Midstream' },
  { name: 'Angren Coal & Metal Works',              coords: [70.14, 40.98], type: 'mining',    output: '180,000 t', workers: 4100,  stage: 'Upstream' },
  { name: 'Fergana Refinery Complex',               coords: [71.78, 40.39], type: 'refinery',  output: '145,000 t', workers: 3900,  stage: 'Downstream' },
  { name: 'Samarkand Industrial Zone',              coords: [66.96, 39.65], type: 'mfg',       output: '120,000 t', workers: 3400,  stage: 'Downstream' },
  { name: 'Bukhara Metal Processing Plant',         coords: [64.42, 39.78], type: 'mfg',       output: '95,000 t',  workers: 2600,  stage: 'Downstream' },
  { name: 'Uchkuduk Uranium Mining',                coords: [62.87, 42.12], type: 'mining',    output: '65,000 t',  workers: 1800,  stage: 'Upstream' },
  { name: 'Jizzakh Steel Fabrication',              coords: [67.84, 40.12], type: 'mfg',       output: '88,000 t',  workers: 2200,  stage: 'Downstream' },
  { name: 'Termez Border Processing Hub',           coords: [67.27, 37.22], type: 'refinery',  output: '72,000 t',  workers: 1500,  stage: 'Midstream' },
];

export const FACILITY_COLORS: Record<string, string> = {
  mining:   '#00f5ff',
  smelting: '#ff6b35',
  refinery: '#7fff00',
  mfg:      '#bf5fff',
};

export const PROJECTS: Project[] = [
  { name: 'New Smelter — Almalyk Phase II', pct: 78, color: '#ff6b35' },
  { name: 'Navoi Deep Mining Extension',   pct: 54, color: '#00f5ff' },
  { name: 'Tashkent EV Components Plant',  pct: 31, color: '#7fff00' },
  { name: 'Bukhara Rail Logistics Hub',    pct: 92, color: '#ffa500' },
];

export const ALERT_POOL = [
  { type: 'warn' as const, text: 'Almalyk: Furnace #3 temp 8% above nominal' },
  { type: 'info' as const, text: 'Navoi: Ore convoy #47 departed on schedule' },
  { type: 'ok'   as const, text: 'Tashkent Plant: All systems nominal' },
  { type: 'crit' as const, text: 'Angren: Conveyor belt sensor anomaly detected' },
  { type: 'info' as const, text: 'Fergana: Shift change completed — 2,400 personnel' },
  { type: 'warn' as const, text: 'Grid load approaching 94% threshold' },
  { type: 'ok'   as const, text: 'Export batch #192 cleared Termez checkpoint' },
  { type: 'info' as const, text: 'Samarkand zone: New production record this week' },
  { type: 'warn' as const, text: 'Bukhara: Scheduled maintenance window in 2h' },
  { type: 'ok'   as const, text: 'System diagnostics passed — all 18 facilities online' },
  { type: 'crit' as const, text: 'Uchkuduk: Ventilation subsystem triggered alarm' },
  { type: 'info' as const, text: 'Jizzakh: Steel order #884 shipped to Tashkent' },
];

export const TICKER_ITEMS = [
  '🔩 Almalyk Complex — Steel output: 42,000 t this month',
  '🥇 NGMK Gold production up 7.2% YoY',
  '⚡ Energy consumption optimized — saving 18 MWh/day',
  '🚂 Rail shipment #2041 en route to Tashkent hub',
  '📈 Copper spot price: $9,124/t | Zinc: $2,871/t | Aluminum: $2,310/t',
  '🔁 Refinery throughput maintained at 94% efficiency',
  '🏗️ Phase II construction at Almalyk 78% complete',
  '👷 Safety record: 127 days without incident at Navoi Complex',
  '🌍 Export volume: 1.2M tonnes YTD | Destinations: 47 countries',
  '⚙️ Predictive maintenance system flagged Conveyor #12 for inspection',
  '📦 Jizzakh fabrication: 3,200 steel sections delivered to Fergana',
  '🔬 R&D Division: New alloy trial approved — production begins Q3',
];

export const OP_CARDS: OpCard[] = [
  { id: 'extraction',    icon: '⛏️', title: 'RAW EXTRACTION',  base: 1240000, range: 15000, capacityPct: 78, capacityLabel: '78% capacity',  stage: 'upstream' },
  { id: 'concentrate',   icon: '🪨', title: 'CONCENTRATES',    base: 842000,  range: 10000, capacityPct: 65, capacityLabel: '65% capacity',  stage: 'upstream' },
  { id: 'metal',         icon: '🔥', title: 'METAL PRODUCTION', base: 620000, range: 8000,  capacityPct: 88, capacityLabel: '88% capacity',  stage: 'midstream' },
  { id: 'refining',      icon: '⚗️', title: 'REFINING',         base: 415000, range: 6000,  capacityPct: 71, capacityLabel: '71% capacity',  stage: 'midstream' },
  { id: 'manufacturing', icon: '🏗️', title: 'MANUFACTURING',    base: 318000, range: 5000,  capacityPct: 82, capacityLabel: '82% capacity',  stage: 'downstream' },
  { id: 'goods',         icon: '📦', title: 'FINAL GOODS',      base: 267000, range: 4000,  capacityPct: 93, capacityLabel: '93% shipped',   stage: 'downstream' },
];

export const PRODUCTION_DATA = [210,225,198,240,255,230,248,262,238,275,289,264];
export const INITIAL_ENERGY_DATA = Array.from({length: 12}, (_,i) => [500,520,490,560,580,545,590,610,570,625,645,610][i]);
