import type { EnergyTrendVM } from "../lib/adapters/energy";
import { nf } from "../lib/format";
import { usePalette } from "../lib/theme";
import { Card } from "./Card";
import { ChartLegend } from "./ChartLegend";
import { Columns } from "./Columns";
import { TableToggle } from "./TableToggle";
import { TimeLine } from "./TimeLine";

/**
 * Электр энергия динамикаси: «Умумий кўрсаткичлар» ва «Электр энергия»
 * панелларида бир хил кўринади, шунинг учун битта компонентда.
 *
 * Кунлик ва ойлик кўриниш алмашади: 3 ойдан узун даврда кунлар ўқда сиқилиб
 * ўқилмай қолади. Иккала ҳолатда ҳам иккита қатор (ички/ташқи) битта шкалада —
 * ўлчов бирлиги бир хил (кВт·соат), шунинг учун бу тўғри.
 */
export function ElectricityTrendCard({
  trend,
  height = 250,
}: {
  trend: EnergyTrendVM;
  height?: number;
}) {
  const p = usePalette();
  const daily = trend.granularity === "daily";
  const labels = trend.points.map((x) => x.label);
  const fullLabels = trend.points.map((x) => x.full);
  const series = [
    { name: "Kombinat", color: p.s1, values: trend.points.map((x) => x.internal) },
    { name: "Tashqi", color: p.s2, values: trend.points.map((x) => x.external) },
  ];
  const common = {
    labels,
    fullLabels,
    height,
    yTickFmt: (t: number) => nf(t / 1000, 0) + "k",
    vFmt: (v: number) => nf(v, 0) + " kVt·s",
    series,
    ariaLabel: `${daily ? "Kunlik" : "Oylik"} elektr energiya iste'moli, kVt·soat`,
  };

  return (
    <Card>
      <ChartLegend
        items={[
          { name: "Kombinat (ichki sexlar)", color: "var(--s1)" },
          { name: "Tashqi iste'molchilar", color: "var(--s2)" },
        ]}
      />
      {daily ? <TimeLine {...common} /> : <Columns {...common} />}
      <TableToggle
        caption="Elektr energiya iste'moli"
        cols={[
          { t: daily ? "Kun" : "Oy" },
          { t: "Kombinat, kVt·s", num: true },
          { t: "Tashqi, kVt·s", num: true },
          { t: "Jami, kVt·s", num: true },
        ]}
        rows={trend.points.map((x) => ({
          key: x.key,
          cells: [x.full, nf(x.internal), nf(x.external), nf(x.total)],
        }))}
      />
    </Card>
  );
}
