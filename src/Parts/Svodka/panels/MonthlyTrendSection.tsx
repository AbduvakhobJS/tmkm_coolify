import type { QueryResult } from "../lib/useQuery";
import type { MonthlyTrendVM } from "../lib/adapters/production";
import type { ProductionMonthlyRow } from "../api/types";
import { monthLabel, pctTxt, exact, smart, unitUz } from "../lib/format";
import { usePalette } from "../lib/theme";
import { GRID } from "../components/layout";
import { Card, Section } from "../components/Card";
import { ChartLegend } from "../components/ChartLegend";
import { TimeLine } from "../components/TimeLine";
import { MonthCompare } from "../components/MonthCompare";
import { TableToggle } from "../components/TableToggle";
import { Loader } from "../components/states";

export interface MonthlyElectricity {
  internal: number;
  external: number;
}

export interface MonthlyTrendSectionProps {
  months: string[];
  trendQ: QueryResult<ProductionMonthlyRow[]>;
  trend: MonthlyTrendVM | null;
  /** Ой → электр истеъмоли; таққослаш қаторлари учун. */
  elecByMonth: Map<string, MonthlyElectricity>;
}

/**
 * «Ойлик тренд» — фақат бир нечта ой танланганда кўринади (битта ойда
 * тренд деган нарса йўқ).
 *
 * Ишлаб чиқариш устунлари **битта базавий бирликда** (одатда `тн`) — турли
 * бирликлар қўшилмайди, қолганлари изоҳда эслатилади. Ўнгдаги таққослаш
 * ҳар бир қаторни ўз шкаласида кўрсатади.
 */
export function MonthlyTrendSection({
  months,
  trendQ,
  trend,
  elecByMonth,
}: MonthlyTrendSectionProps) {
  const p = usePalette();
  const first = months[0];
  const last = months[months.length - 1];
  const elecOf = (m: string) => elecByMonth.get(m) ?? { internal: 0, external: 0 };

  return (
    <Section
      title="Oylik trend"
      note={`${months.length} oy tanlangan · har bir ko'rsatkich o'z o'lchov birligida`}
    >
      <div className={GRID.g32}>
        <Loader
          q={trendQ}
          height={230}
          notAvailableWhat="/production/monthly"
          isEmpty={() => !trend || trend.points.length === 0}
          emptyTitle="Oylik trend uchun ma'lumot yo'q"
        >
          {() =>
            trend && (
              <Card
                title={`Ishlab chiqarish — oylar kesimida (${unitUz(trend.unit)})`}
                sub="reja va fakt"
                note={
                  trend.otherUnits.length
                    ? `Faqat «${unitUz(trend.unit)}» bazaviy birligi ko'rsatilgan. Boshqa birliklar (${trend.otherUnits.map(unitUz).join(", ")}) shkalasi boshqa — qo'shilmaydi.`
                    : undefined
                }
              >
                <ChartLegend
                  items={[
                    { name: "Reja", color: "var(--s1)" },
                    { name: "Fakt", color: "var(--s2)" },
                  ]}
                />
                {/* Режа ва факт — иккита алоҳида чизиқ: ойдан-ойга ўзгариш ва
                    улар орасидаги фарқ устунларга қараганда яққолроқ кўринади. */}
                <TimeLine
                  labels={trend.points.map((x) => x.label)}
                  fullLabels={trend.points.map((x) => x.full)}
                  height={250}
                  area={false}
                  ariaLabel={`Oylar kesimida ishlab chiqarish, ${unitUz(trend.unit)}`}
                  yTickFmt={smart}
                  vFmt={(v) => exact(v) + " " + unitUz(trend.unit)}
                  series={[
                    { name: "Reja", color: p.s1, values: trend.points.map((x) => x.plan) },
                    { name: "Fakt", color: p.s2, values: trend.points.map((x) => x.fakt) },
                  ]}
                />
                <TableToggle
                  caption="Oylar kesimida ishlab chiqarish"
                  cols={[
                    { t: "Oy" },
                    { t: `Reja, ${unitUz(trend.unit)}`, num: true },
                    { t: `Fakt, ${unitUz(trend.unit)}`, num: true },
                    { t: "Bajarilish", num: true },
                  ]}
                  rows={trend.points.map((x) => ({
                    key: x.month,
                    cells: [
                      x.full,
                      exact(x.plan),
                      exact(x.fakt),
                      x.plan > 0 ? pctTxt((x.fakt / x.plan) * 100) : "—",
                    ],
                  }))}
                />
              </Card>
            )
          }
        </Loader>

        <Card
          title="Birinchi ↔ oxirgi oy"
          sub={`${monthLabel(first)} ↔ ${monthLabel(last)}`}
          note="Har bir ko'rsatkich o'z o'lchov birligida va o'z shkalasida; o'ngdagi foiz — oxirgi oyning birinchi oyga nisbatan o'zgarishi."
        >
          <MonthCompare
            aName={monthLabel(first)}
            bName={monthLabel(last)}
            rows={[
              {
                label: "Elektr energiya, jami",
                unit: "ming kVt·s",
                a: (elecOf(first).internal + elecOf(first).external) / 1000,
                b: (elecOf(last).internal + elecOf(last).external) / 1000,
              },
              {
                label: "Ichki sexlar iste'moli",
                unit: "ming kVt·s",
                a: elecOf(first).internal / 1000,
                b: elecOf(last).internal / 1000,
              },
              {
                label: "Tashqi iste'molchilar",
                unit: "ming kVt·s",
                a: elecOf(first).external / 1000,
                b: elecOf(last).external / 1000,
              },
              {
                label: "Ishlab chiqarish, fakt",
                unit: unitUz(trend?.unit) || "tn",
                a: trend?.points[0]?.fakt ?? 0,
                b: trend?.points[trend.points.length - 1]?.fakt ?? 0,
              },
            ]}
          />
        </Card>
      </div>
    </Section>
  );
}
