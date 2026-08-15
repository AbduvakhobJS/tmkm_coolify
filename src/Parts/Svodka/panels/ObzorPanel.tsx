import { useMemo, type ReactNode } from "react";
import type { PanelProps } from "../types";
import type { UnitTotal } from "../api/types";
import {
  getElectricityByObject,
  getProductionMonthly,
  getProductionTree,
  getSummary,
} from "../api/endpoints";
import { useQuery, type QueryResult } from "../lib/useQuery";
import { nf, pctTxt, periodLabel, exact, statusOf, stripeOf, unitUz } from "../lib/format";
import { UNASSIGNED_PLANT_NOTE, isUnknownUnit, isUnverified } from "../lib/dataQuality";
import { EXTERNAL_TYPE, energyTrendFromObjects } from "../lib/adapters/energy";
import { fromTree, monthlyTrend } from "../lib/adapters/production";
import { GRID } from "../components/layout";
import { Card, Section } from "../components/Card";
import { StatTile } from "../components/StatTile";
import { Pill } from "../components/Pill";
import { KeyValueList } from "../components/KeyValueList";
import { ElectricityTrendCard } from "../components/ElectricityTrendCard";
import { BulletChart, BulletLegend } from "../components/BulletRow";
import { MonthlyTrendSection } from "./MonthlyTrendSection";
import { MaskedValue } from "../components/Masked";
import { Loader } from "../components/states";

/** Endpoint мавжуд бўлмаса ёки хато бўлса — плитка ичидаги қисқа изоҳ. */
function tileNote<T>(q: QueryResult<T>): ReactNode {
  if (q.notAvailable) return <Pill>bo'lim serverda yo'q</Pill>;
  if (q.error) return <Pill status="crit">yuklab bo'lmadi</Pill>;
  if (q.loading) return <Pill>yuklanmoqda…</Pill>;
  return null;
}

const unitName = (u: string | null): string =>
  isUnknownUnit(u) ? "birligi aniqlanmagan" : unitUz(u);

export function ObzorPanel({ period, months }: PanelProps) {
  const key = `${period.from}_${period.to}`;
  const multiMonth = months.length > 1;
  const granularity: "daily" | "monthly" = months.length <= 3 ? "daily" : "monthly";

  // `groupBy=object` — `ЭНЦ общ.` йиғинди сатрини ажратиш учун ягона ишончли
  // кесим (adapters/energy.ts даги изоҳга қаранг).
  const elecQ = useQuery(`obzor-elec_${key}_${granularity}`, (s) =>
    getElectricityByObject(period, { period: granularity }, s),
  );
  const elecExtQ = useQuery(`obzor-elec-ext_${key}_${granularity}`, (s) =>
    getElectricityByObject(period, { type: EXTERNAL_TYPE, period: granularity }, s),
  );
  const sumQ = useQuery(`obzor-summary_${key}`, (s) => getSummary(period, s));
  const treeQ = useQuery(`obzor-tree_${key}`, (s) =>
    getProductionTree(period, { depth: "plant" }, s),
  );
  const trendQ = useQuery(
    `obzor-monthly_${key}`,
    (s) => getProductionMonthly(period, { level: "plant" }, s),
    { enabled: multiMonth },
  );

  const elec = useMemo(
    () =>
      elecQ.data && elecExtQ.data
        ? energyTrendFromObjects(elecQ.data, elecExtQ.data, granularity, multiMonth)
        : null,
    [elecQ.data, elecExtQ.data, granularity, multiMonth],
  );
  const plants = useMemo(() => (treeQ.data ? fromTree(treeQ.data).plants : []), [treeQ.data]);
  const trend = useMemo(
    () => (trendQ.data ? monthlyTrend(trendQ.data, months) : null),
    [trendQ.data, months],
  );

  /** Ойлар кесимида электр — тренд блоки ва таққослаш учун. */
  const elecByMonth = useMemo(() => {
    if (!elec) return new Map<string, { internal: number; external: number }>();
    const m = new Map<string, { internal: number; external: number }>();
    for (const pt of elec.points) {
      const mk = pt.key.slice(0, 7);
      const slot = m.get(mk) ?? { internal: 0, external: 0 };
      slot.internal += pt.internal;
      slot.external += pt.external;
      m.set(mk, slot);
    }
    return m;
  }, [elec]);

  const weight = sumQ.data?.production.weight ?? null;
  const byUnit: UnitTotal[] = sumQ.data?.production.byUnit ?? [];

  return (
    <>
      <Section title="Korxona miqyosidagi yakuniy ko'rsatkichlar" note={periodLabel(months)}>
        <div className={GRID.g6}>
          <StatTile
            label="Elektr energiya, jami"
            value={elec ? nf(elec.total, 0) : "—"}
            unit={elec ? "kVt·s" : undefined}
            stripe="var(--s1)"
            foot={
              tileNote(elecQ) ??
              (elec ? (
                <Pill>
                  o'rtacha {nf(elec.total / (elec.points.length || 1), 0)} / {granularity === "daily" ? "kun" : "oy"}
                </Pill>
              ) : undefined)
            }
          />
          <StatTile
            label="Kombinat ichki iste'moli"
            value={elec ? nf(elec.internalTotal, 0) : "—"}
            unit={elec ? "kVt·s" : undefined}
            foot={
              tileNote(elecQ) ??
              (elec && elec.total ? (
                <Pill>{nf((elec.internalTotal / elec.total) * 100, 1)}% umumiydan</Pill>
              ) : undefined)
            }
          />
          <StatTile
            label="Tashqi iste'molchilar"
            value={elec ? nf(elec.externalTotal, 0) : "—"}
            unit={elec ? "kVt·s" : undefined}
            stripe="var(--s2)"
            foot={
              tileNote(elecQ) ??
              (elec && elec.total ? (
                <Pill>{nf((elec.externalTotal / elec.total) * 100, 1)}% umumiydan</Pill>
              ) : undefined)
            }
          />
          <StatTile
            label="Ishlab chiqarish (og'irlik)"
            value={weight ? exact(weight.fakt) : "—"}
            unit={weight ? "tn" : undefined}
            stripe={stripeOf(weight?.percent)}
            foot={
              tileNote(sumQ) ??
              (weight ? (
                <>
                  <Pill status={statusOf(weight.percent)}>{pctTxt(weight.percent)}</Pill>
                  <span className="text-ink-3">reja {exact(weight.plan)} tn</span>
                </>
              ) : undefined)
            }
          />
          <StatTile
            label="Ogarok qabuli"
            value={<MaskedValue area="ogarok">{exact(sumQ.data?.ogarok.physical)}</MaskedValue>}
            unit={isUnverified("ogarok") ? undefined : "t"}
            stripe="var(--s2)"
            foot={
              tileNote(sumQ) ??
              (isUnverified("ogarok") ? (
                <Pill>qiymat tekshirilmoqda</Pill>
              ) : (
                <Pill>{nf(sumQ.data?.ogarok.metal ?? 0, 2)} t metall</Pill>
              ))
            }
          />
          <StatTile
            label="Ingichka uskuna to'xtashi"
            value={
              <MaskedValue area="ingichka">{exact(sumQ.data?.ingichka.downtimeHours)}</MaskedValue>
            }
            unit={isUnverified("ingichka") ? undefined : "soat"}
            foot={
              tileNote(sumQ) ??
              (isUnverified("ingichka") ? (
                <Pill>qiymat tekshirilmoqda</Pill>
              ) : (
                <Pill>{nf(sumQ.data?.ingichka.stops ?? 0)} hodisa</Pill>
              ))
            }
          />
        </div>
      </Section>

      <Section
        title="Ishlab chiqarish — o'lchov birligi kesimida"
        note="turli birlikdagi qiymatlar qo'shilmaydi, har biri o'z qatorida"
      >
        <Loader q={sumQ} height={160} notAvailableWhat="/summary">
          {() => (
            <Card>
              <BulletLegend />
              <BulletChart
                rows={byUnit
                  .filter((u) => (u.plan ?? 0) > 0 || (u.fakt ?? 0) > 0)
                  // Бирлиги аниқланмаган қатор охирида турсин: у аралаш
                  // бирликлар йиғиндиси ва бошқа қаторлар билан тенг эмас.
                  .slice()
                  .sort((a, b) => Number(isUnknownUnit(a.baseUnit)) - Number(isUnknownUnit(b.baseUnit)))
                  .map((u) => ({
                    key: unitName(u.baseUnit),
                    label: unitName(u.baseUnit),
                    plan: u.plan ?? 0,
                    fact: u.fakt ?? 0,
                    unit: isUnknownUnit(u.baseUnit) ? "" : unitUz(u.baseUnit),
                  }))}
              />
              <p className="mt-2 text-[11.5px] leading-[1.45] text-ink-3">
                «Birligi aniqlanmagan» qatori — {UNASSIGNED_PLANT_NOTE}
              </p>
            </Card>
          )}
        </Loader>
      </Section>

      <Section title="Ishlab chiqarish maydonchalari kesimida">
        <Loader
          q={treeQ}
          height={200}
          notAvailableWhat="/production/tree"
          isEmpty={() => plants.length === 0}
          emptyTitle="Ushbu davr uchun ishlab chiqarish ma'lumoti yo'q"
        >
          {() => (
            <div className={GRID.g3}>
              {plants.map((pl) => (
                <Card
                  key={pl.name}
                  title={pl.label}
                  sub={`${pl.workshopCount} sex · ${pl.productCount} pozitsiya`}
                  note={pl.unassigned ? UNASSIGNED_PLANT_NOTE : undefined}
                >
                  <KeyValueList
                    rows={
                      pl.byUnit.length
                        ? pl.byUnit.map((u) => ({
                            k: unitName(u.baseUnit),
                            v: (
                              <>
                                {exact(u.fakt)}{" "}
                                <span className="text-ink-3">/ reja {exact(u.plan)}</span>{" "}
                                <span style={{ color: stripeOf(u.percent) }}>{pctTxt(u.percent)}</span>
                              </>
                            ),
                          }))
                        : [{ k: "Ma'lumot", v: "yo'q" }]
                    }
                  />
                </Card>
              ))}
            </div>
          )}
        </Loader>
      </Section>

      <Section
        title={granularity === "daily" ? "Kunlik elektr energiya iste'moli" : "Oylik elektr energiya iste'moli"}
        note="kVt·soat"
      >
        <Loader
          q={elecQ}
          height={250}
          notAvailableWhat="/electricity"
          isEmpty={() => !elec || elec.points.length === 0}
          emptyTitle="Ushbu davr uchun elektr energiya ma'lumoti yo'q"
        >
          {() => elec && <ElectricityTrendCard trend={elec} />}
        </Loader>
      </Section>

      {multiMonth && (
        <MonthlyTrendSection
          months={months}
          trendQ={trendQ}
          trend={trend}
          elecByMonth={elecByMonth}
        />
      )}
    </>
  );
}
