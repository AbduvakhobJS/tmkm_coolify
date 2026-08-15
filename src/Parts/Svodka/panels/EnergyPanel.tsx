import { useMemo } from "react";
import type { PanelProps } from "../types";
import { getElectricityByObject } from "../api/endpoints";
import { useQuery } from "../lib/useQuery";
import { nf, periodLabel } from "../lib/format";
import { ENERGY_SUBTOTAL_NOTE } from "../lib/dataQuality";
import {
  EXTERNAL_TYPE,
  energyObjects,
  energyTrendFromObjects,
  indexOfMax,
  indexOfMin,
} from "../lib/adapters/energy";
import { GRID } from "../components/layout";
import { Card, Section } from "../components/Card";
import { StatTile } from "../components/StatTile";
import { Pill } from "../components/Pill";
import { Banner } from "../components/Banner";
import { ElectricityTrendCard } from "../components/ElectricityTrendCard";
import { BarsH } from "../components/BarsH";
import { ShareBar } from "../components/ShareBar";
import { TableToggle } from "../components/TableToggle";
import { Loader, Skeleton } from "../components/states";

const kwh = (v: number) => nf(v, 0) + " kVt·s";

export function EnergyPanel({ period, months }: PanelProps) {
  const key = `${period.from}_${period.to}`;
  const multiMonth = months.length > 1;
  // 3 ойгача — кунлик эгри чизиқ; ундан узун даврда кунлар ўқда сиқилиб
  // кетади, шунинг учун ойлик устунлар.
  const granularity: "daily" | "monthly" = months.length <= 3 ? "daily" : "monthly";

  // Динамика ҳам, бўлинмалар кесими ҳам `groupBy=object` дан ҳисобланади:
  // серверда `ЭНЦ общ.` йиғинди сатри `groupBy=type` да «Чирчик завод» ичига
  // қўшиб юборилган ва у ерда ажратиб бўлмайди (қаранг: adapters/energy.ts).
  const allQ = useQuery(`elec-obj-all_${key}_${granularity}`, (s) =>
    getElectricityByObject(period, { period: granularity }, s),
  );
  const extQ = useQuery(`elec-obj-ext_${key}_${granularity}`, (s) =>
    getElectricityByObject(period, { type: EXTERNAL_TYPE, period: granularity }, s),
  );
  const trendQ = allQ;

  const trend = useMemo(
    () =>
      allQ.data && extQ.data
        ? energyTrendFromObjects(allQ.data, extQ.data, granularity, multiMonth)
        : null,
    [allQ.data, extQ.data, granularity, multiMonth],
  );

  // Ички бўлинмалар = барча объектлар минус ташқи абонентлар. Шу йўл
  // «Ингичка» ва «Навои ГТР» турларини ҳам ички деб тўғри ушлайди.
  const { internal, external } = useMemo(() => {
    const all = allQ.data ? energyObjects(allQ.data) : [];
    const ext = extQ.data ? energyObjects(extQ.data) : [];
    const extNames = new Set(ext.map((x) => x.name));
    return { internal: all.filter((x) => !extNames.has(x.name)), external: ext };
  }, [allQ.data, extQ.data]);

  const values = trend?.points.map((x) => x.total) ?? [];
  const maxI = indexOfMax(values);
  const minI = indexOfMin(values);
  const unitName = granularity === "daily" ? "kun" : "oy";

  return (
    <>
      {trend && trend.excluded > 0 && (
        <Banner tone="info">
          <b>Takroriy hisob tuzatildi.</b> {ENERGY_SUBTOTAL_NOTE} Ushbu davr uchun yig'indidan{" "}
          {kwh(trend.excluded)} chiqarildi — xom javobdagi {kwh(trend.total + trend.excluded)} o'rniga{" "}
          <b>{kwh(trend.total)}</b>.
        </Banner>
      )}

      <Loader q={trendQ} height={120} notAvailableWhat="/electricity">
        {() =>
          trend && (
            <>
              <div className={GRID.g6}>
                <StatTile
                  label="Kombinat bo'yicha jami"
                  value={nf(trend.total, 0)}
                  unit="kVt·s"
                  stripe="var(--s1)"
                  foot={<Pill>{periodLabel(months)}</Pill>}
                />
                <StatTile
                  label="Ichki sexlar"
                  value={nf(trend.internalTotal, 0)}
                  unit="kVt·s"
                  foot={
                    <Pill>
                      {trend.total ? nf((trend.internalTotal / trend.total) * 100, 1) : "—"}%
                    </Pill>
                  }
                />
                <StatTile
                  label="Tashqi iste'molchilar"
                  value={nf(trend.externalTotal, 0)}
                  unit="kVt·s"
                  stripe="var(--s2)"
                  foot={
                    <Pill>
                      {trend.total ? nf((trend.externalTotal / trend.total) * 100, 1) : "—"}%
                    </Pill>
                  }
                />
                <StatTile
                  label={`O'rtacha (1 ${unitName})`}
                  value={nf(trend.points.length ? trend.total / trend.points.length : 0, 0)}
                  unit="kVt·s"
                />
                <StatTile
                  label={`Eng yuqori ${unitName}`}
                  value={maxI >= 0 ? nf(values[maxI], 0) : "—"}
                  unit="kVt·s"
                  stripe="var(--warn)"
                  foot={maxI >= 0 ? <Pill>{trend.points[maxI].full}</Pill> : undefined}
                />
                <StatTile
                  label={`Eng past ${unitName}`}
                  value={minI >= 0 ? nf(values[minI], 0) : "—"}
                  unit="kVt·s"
                  foot={minI >= 0 ? <Pill>{trend.points[minI].full}</Pill> : undefined}
                />
              </div>

              <Section
                className="mt-5"
                title={granularity === "daily" ? "Kunlik iste'mol dinamikasi" : "Oylik iste'mol dinamikasi"}
                note="kVt·soat"
              >
                <ElectricityTrendCard trend={trend} height={280} />
              </Section>

              <Section title="Iste'mol tuzilishi">
                <Card>
                  <ShareBar
                    parts={[
                      { name: "Ichki sexlar", value: trend.internalTotal, color: "var(--s1)" },
                      { name: "Tashqi iste'molchilar", value: trend.externalTotal, color: "var(--s2)" },
                    ]}
                  />
                  <p className="mt-3 text-[11.5px] leading-[1.45] text-ink-3">
                    {ENERGY_SUBTOTAL_NOTE}
                  </p>
                </Card>
              </Section>
            </>
          )
        }
      </Loader>

      <Section title="Bo'linmalar kesimida" note="davr bo'yicha jami, kVt·soat">
        {allQ.loading || extQ.loading ? (
          <Skeleton height={220} />
        ) : (
          <div className={GRID.g2}>
            <Loader
              q={allQ}
              height={220}
              notAvailableWhat="/electricity?groupBy=object"
              isEmpty={() => internal.length === 0}
              emptyTitle="Ichki bo'linmalar bo'yicha ma'lumot yo'q"
            >
              {() => (
                <Card
                  title="Kombinat sex va xizmatlari"
                  sub={`${internal.filter((x) => x.total > 0).length} ta bo'linma`}
                >
                  <div className="mt-2">
                    <BarsH
                      ariaLabel="Kombinat sex va xizmatlari bo'yicha elektr iste'moli"
                      rows={internal
                        .filter((x) => x.total > 0)
                        .map((x) => ({
                          label: x.name,
                          v: x.total,
                          extra: [
                            "Ulush",
                            nf((x.total / (trend?.internalTotal || 1)) * 100, 2) + "%",
                          ],
                        }))}
                      rowH={24}
                      padR={82}
                      vName="Iste'mol"
                      vFmt={(v) => nf(v / 1000, 0) + " ming"}
                    />
                  </div>
                  <TableToggle
                    caption="Kombinat sex va xizmatlari bo'yicha elektr iste'moli"
                    cols={[{ t: "Bo'linma" }, { t: "kVt·s", num: true }, { t: "Ulush, %", num: true }]}
                    rows={internal.map((x) => ({
                      key: x.name,
                      cells: [
                        x.name,
                        nf(x.total),
                        nf((x.total / (trend?.internalTotal || 1)) * 100, 2),
                      ],
                    }))}
                  />
                </Card>
              )}
            </Loader>

            <Loader
              q={extQ}
              height={220}
              notAvailableWhat="/electricity?groupBy=object"
              isEmpty={() => external.length === 0}
              emptyTitle="Tashqi abonentlar bo'yicha ma'lumot yo'q"
            >
              {() => (
                <Card
                  title="Tashqi iste'molchilar"
                  sub={`${external.filter((x) => x.total > 0).length} ta faol abonent`}
                >
                  <div className="mt-2">
                    <BarsH
                      ariaLabel="Tashqi iste'molchilar bo'yicha elektr iste'moli"
                      rows={external
                        .filter((x) => x.total > 0)
                        .map((x) => ({
                          label: x.name,
                          v: x.total,
                          extra: [
                            "Ulush",
                            nf((x.total / (trend?.externalTotal || 1)) * 100, 2) + "%",
                          ],
                        }))}
                      rowH={24}
                      padR={82}
                      vName="Iste'mol"
                      vFmt={(v) => nf(v / 1000, 1) + " ming"}
                    />
                  </div>
                  <TableToggle
                    caption="Tashqi iste'molchilar bo'yicha elektr iste'moli"
                    cols={[{ t: "Abonent" }, { t: "kVt·s", num: true }, { t: "Ulush, %", num: true }]}
                    rows={external.map((x) => ({
                      key: x.name,
                      cells: [
                        x.name,
                        nf(x.total),
                        nf((x.total / (trend?.externalTotal || 1)) * 100, 2),
                      ],
                    }))}
                  />
                </Card>
              )}
            </Loader>
          </div>
        )}
      </Section>
    </>
  );
}
