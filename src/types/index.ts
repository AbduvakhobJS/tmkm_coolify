export type FacilityType = 'mining' | 'smelting' | 'refinery' | 'mfg';
export type AlertType = 'warn' | 'info' | 'ok' | 'crit';
export type StageType = 'upstream' | 'midstream' | 'downstream';

export interface Facility {
  name: string;
  coords: [number, number];
  type: FacilityType;
  output: string;
  workers: number;
  stage: string;
}

export interface Alert {
  type: AlertType;
  text: string;
  time: string;
  id: number;
}

export interface Project {
  name: string;
  pct: number;
  color: string;
}

export interface KpiData {
  production: number;
  factories: number;
  efficiency: number;
  workers: number;
}

export interface GaugeValues {
  uptime: number;
  load: number;
  safety: number;
}

export interface OpCard {
  id: string;
  icon: string;
  title: string;
  base: number;
  range: number;
  capacityPct: number;
  capacityLabel: string;
  stage: StageType;
}
