import { useMemo } from "react";
import type { PanelProps } from "../types";
import { getHydrogen } from "../api/endpoints";
import { useQuery } from "../lib/useQuery";
import { nf, periodLabel } from "../lib/format";
import { hydrogenObjects, hydrogenVM } from "../lib/adapters/resources";
import { usePalette } from "../lib/theme";
import { GRID } from "../components/layout";
import { Card, Section } from "../components/Card";
import { StatTile } from "../components/StatTile";
import { Pill } from "../components/Pill";
import { Banner } from "../components/Banner";
import { TimeLine } from "../components/TimeLine";
import { BarsH } from "../components/BarsH";
import { ShareBar } from "../components/ShareBar";
import { TableToggle } from "../components/TableToggle";
import { Loader } from "../components/states";

export function H2Panel({ period, months }: PanelProps) {
  const p = usePalette();
  const key = `${period.from}_${period.to}`;
  const multiMonth = months.length > 1;

  const dailyQ = useQuery(`h2-daily_${key}`, (s) =>
    getHydrogen(period, { kind: "hydrogen", period: "daily" }, s),
  );
  const objQ = useQuery(`h2-obj_${key}`, (s) =>
    getHydrogen(period, { kind: "hydrogen", groupBy: "object" }, s),
  );
  const gasQ = useQuery(`h2-gas_${key}`, (s) =>
    getHydrogen(period, { kind: "gas", period: "monthly" }, s),
  );

  const vm = useMemo(
    () => (dailyQ.data ? hydrogenVM(dailyQ.data, multiMonth) : null),
    [dailyQ.data, multiMonth],
  );
  const objects = useMemo(
    () => (objQ.data ? hydrogenObjects(objQ.data).filter((x) => x.total > 0) : []),
    [objQ.data],
  );
  const gasTotal = useMemo(
    () => (gasQ.data ? gasQ.data.reduce((a, r) => a + (r.value ?? 0), 0) : null),
    [gasQ.data],
  );

  const empty = vm !== null && vm.total === 0;

  // Юқори учта истеъмолчи категориал рангларни олади, қолгани нейтрал
  // «Бошқалар» сегментига йиғилади — палитра айлантирилмайди.
  const shareParts = [
    ...objects.slice(0, 3).map((x, i) => ({
      name: x.name,
      value: x.total,
      color: ["var(--s1)", "var(--s2)", "var(--s3)"][i] as string,
    })),
    ...(objects.length > 3
      ? [
          {
            name: "Boshqalar",
            value: objects.slice(3).reduce((a, b) => a + b.total, 0),
            color: "var(--rule)",
          },
        ]
      : []),
  ];

  return (
    <Loader q={dailyQ} height={260} notAvailableWhat="/hydrogen">
      {() => (
        <>
          {empty && (
            <Banner tone="info">
              <b>Ma'lumot kiritilmagan.</b> {periodLabel(months)} davri uchun «Vodorod» varag'ida
              sarf ko'rsatkichlari nol qiymatda qoldirilgan — sexlar bo'yicha hisob yuritilmagan yoki
              ma'lumot faylga kiritilmagan. Bu serverda bo'limning yo'qligi emas: so'rov muvaffaqiyatli,
              javob bo'sh.
            </Banner>
          )}

          <div className={GRID.g4}>
            <StatTile
              label="Vodorod sarfi, jami"
              value={nf(vm?.total ?? 0, 0)}
              unit="m³"
              stripe="var(--s3)"
              foot={<Pill>{periodLabel(months)}</Pill>}
            />
            <StatTile
              label="Kunlik o'rtacha"
              value={nf(vm && vm.points.length ? vm.total / vm.points.length : 0, 0)}
              unit="m³"
            />
            <StatTile
              label="Eng yuqori kun"
              value={nf(vm?.max ?? 0, 0)}
              unit="m³"
              foot={vm?.maxKey ? <Pill>{vm.maxKey}</Pill> : undefined}
            />
            <StatTile
              label="Tabiiy gaz sarfi"
              value={gasQ.notAvailable ? "—" : nf(gasTotal ?? 0, 0)}
              unit="m³"
              foot={
                gasQ.notAvailable ? (
                  <Pill>bo'lim serverda yo'q</Pill>
                ) : (
                  <Pill>1 va 2-prom. maydoncha</Pill>
                )
              }
            />
          </div>

          {vm && vm.total > 0 ? (
            <>
              <Section className="mt-5" title="Kunlik vodorod sarfi" note="m³">
                <Card>
                  <TimeLine
                    labels={vm.points.map((x) => x.label)}
                    fullLabels={vm.points.map((x) => x.full)}
                    height={250}
                    ariaLabel="Kunlik vodorod sarfi, m³"
                    yTickFmt={(t) => nf(t / 1000, 0) + "k"}
                    vFmt={(v) => nf(v, 0) + " m³"}
                    series={[
                      { name: "Vodorod sarfi", color: p.s3, values: vm.points.map((x) => x.value) },
                    ]}
                  />
                  <TableToggle
                    caption="Kunlik vodorod sarfi"
                    cols={[{ t: "Kun" }, { t: "Kunlik sarf, m³", num: true }]}
                    rows={vm.points.map((x) => ({ key: x.key, cells: [x.full, nf(x.value)] }))}
                  />
                </Card>
              </Section>

              <Section title="Sexlar kesimida">
                <div className={GRID.g32}>
                  <Loader q={objQ} height={200} notAvailableWhat="/hydrogen?groupBy=object">
                    {() => (
                      <Card title="Davr bo'yicha sarf, m³" sub={`${objects.length} ta iste'molchi`}>
                        <div className="mt-2">
                          <BarsH
                            ariaLabel="Sexlar kesimida vodorod sarfi"
                            rows={objects.map((x) => ({
                              label: x.name,
                              v: x.total,
                              extra: ["Ulush", nf((x.total / (vm.total || 1)) * 100, 2) + "%"],
                            }))}
                            rowH={28}
                            padR={78}
                            vName="Sarf, m³"
                            vFmt={(v) => nf(v)}
                          />
                        </div>
                      </Card>
                    )}
                  </Loader>
                  <Card title="Iste'mol tuzilishi">
                    <div className="mt-3.5">
                      <ShareBar parts={shareParts} />
                    </div>
                  </Card>
                </div>
              </Section>
            </>
          ) : (
            <Card className="mt-5">
              <div className="px-2.5 py-6 text-center text-[13px] text-ink-3">
                Ushbu davr uchun vodorod sarfi bo'yicha ko'rsatkichlar mavjud emas.
              </div>
            </Card>
          )}
        </>
      )}
    </Loader>
  );
}
