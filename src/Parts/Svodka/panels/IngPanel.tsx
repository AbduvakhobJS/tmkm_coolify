import { useMemo } from "react";
import type { PanelProps } from "../types";
import { getIngichkaDaily, getIngichkaMonthly } from "../api/endpoints";
import { useQuery } from "../lib/useQuery";
import { nf, periodLabel } from "../lib/format";
import { isUnverified } from "../lib/dataQuality";
import { ingichkaVM } from "../lib/adapters/resources";
import { ingBreakdown } from "../lib/adapters/ingichkaReasons";
import { usePalette } from "../lib/theme";
import { GRID } from "../components/layout";
import { Card, Section } from "../components/Card";
import { StatTile } from "../components/StatTile";
import { Pill } from "../components/Pill";
import { BarsH } from "../components/BarsH";
import { Columns } from "../components/Columns";
import { TableToggle } from "../components/TableToggle";
import { DataTable } from "../components/DataTable";
import { Masked, MaskedChart, MaskedValue, UnverifiedBanner } from "../components/Masked";
import { Loader } from "../components/states";
import { dateLabel, dateTick } from "../lib/format";

const AREA = "ingichka";

/** Даврдаги кунлар сони — тайёрлик коэффициенти базаси учун. */
function daysBetween(from: string, to: string): number {
  const a = Date.parse(from);
  const b = Date.parse(to);
  if (!isFinite(a) || !isFinite(b) || b < a) return 0;
  return Math.round((b - a) / 86_400_000) + 1;
}

export function IngPanel({ period, months }: PanelProps) {
  const p = usePalette();
  const key = `${period.from}_${period.to}`;
  const multiMonth = months.length > 1;
  const masked = isUnverified(AREA);

  const dailyQ = useQuery(`ing-daily_${key}`, (s) => getIngichkaDaily(period, s));
  const monthlyQ = useQuery(`ing-monthly_${key}`, (s) => getIngichkaMonthly(period, s));

  const vm = useMemo(
    () =>
      dailyQ.data
        ? ingichkaVM(dailyQ.data, monthlyQ.data ?? [], daysBetween(period.from, period.to))
        : null,
    [dailyQ.data, monthlyQ.data, period.from, period.to],
  );

  /** Сабаб гуруҳлари ва фабрикалар — изоҳ матнидан клиент томонида. */
  const breakdown = useMemo(
    () => ingBreakdown(vm?.stops ?? []),
    [vm],
  );

  /** Кунлар кесимида йўқотилган соатлар (масканланмаган ҳолда чизилади). */
  const byDay = useMemo(() => {
    if (!vm) return [];
    const m = new Map<string, number>();
    for (const s of vm.stops) m.set(s.day, (m.get(s.day) ?? 0) + s.hours);
    return [...m.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([day, hours]) => ({
        day,
        label: dateTick(day, multiMonth),
        full: dateLabel(day),
        hours,
      }));
  }, [vm, multiMonth]);

  return (
    <>
      <UnverifiedBanner
        area={AREA}
        extra="To'xtash vaqtlari (boshlanishi/tugashi) ham manbadagi tartibga mos kelmagani uchun yashirilgan."
      />

      <Loader
        q={dailyQ}
        height={260}
        notAvailableWhat="/ingichka"
        isEmpty={() => !vm || vm.stops.length === 0}
        emptyTitle="Ushbu davr uchun to'xtash yozuvlari yo'q"
      >
        {() =>
          vm && (
            <>
              <div className={GRID.g4}>
                <StatTile
                  label="Uskuna to'xtashi, jami"
                  value={<MaskedValue area={AREA}>{nf(vm.totalHours, 1)}</MaskedValue>}
                  unit={masked ? undefined : "soat"}
                  stripe="var(--crit)"
                  foot={<Pill>{vm.events} ta hodisa</Pill>}
                />
                <StatTile
                  label="Tayyorlik koeffitsiyenti"
                  value={<MaskedValue area={AREA}>{nf(vm.availability, 2)}</MaskedValue>}
                  unit={masked ? undefined : "%"}
                  foot={<Pill>3 fabrika × 24 soat bazasida</Pill>}
                />
                <StatTile
                  label="O'rtacha to'xtash"
                  value={
                    <MaskedValue area={AREA}>
                      {nf(vm.totalHours / (vm.events || 1), 2)}
                    </MaskedValue>
                  }
                  unit={masked ? undefined : "soat"}
                />
                <StatTile
                  label="To'xtash bo'lgan kunlar"
                  value={nf(vm.daysWithStops)}
                  unit="kun"
                  stripe="var(--warn)"
                  foot={<Pill>{periodLabel(months)}</Pill>}
                />
              </div>

              <Section
                className="mt-5"
                title="To'xtash sabablari"
                note="yo'qotilgan soatlar bo'yicha, ko'pdan kamga"
              >
                {masked ? (
                  <MaskedChart area={AREA} what="Sabablar kesimidagi diagramma" />
                ) : (
                  <div className={GRID.g32}>
                    <Card
                      title="Sabablar kesimida, soat"
                      sub="izoh matni bo'yicha avtomatik tasniflangan"
                    >
                      <BarsH
                        ariaLabel="Ingichka IOF — to'xtash sabablari, soat"
                        rows={breakdown.reasons.map((r) => ({
                          label: r.name,
                          v: r.hours,
                          extra: [
                            "Hodisalar",
                            `${r.count} ta · ${nf((r.hours / (breakdown.totalHours || 1)) * 100, 1)}%`,
                          ],
                        }))}
                        rowH={28}
                        padR={66}
                        vName="Yo'qotilgan soat"
                        vFmt={(v) => nf(v, 1) + " s"}
                      />
                      <TableToggle
                        caption="To'xtash sabablari"
                        cols={[
                          { t: "Sabab guruhi" },
                          { t: "Soat", num: true },
                          { t: "Hodisa", num: true },
                          { t: "Ulush, %", num: true },
                        ]}
                        rows={breakdown.reasons.map((r) => ({
                          key: r.name,
                          cells: [
                            r.name,
                            nf(r.hours, 2),
                            nf(r.count),
                            nf((r.hours / (breakdown.totalHours || 1)) * 100, 1),
                          ],
                        }))}
                      />
                    </Card>
                    <Card
                      title="Fabrikalar kesimida"
                      sub="bir nechta fabrikaga tegishli to'xtashlar teng taqsimlangan"
                    >
                      <BarsH
                        ariaLabel="Ingichka IOF — fabrikalar kesimida to'xtash, soat"
                        rows={breakdown.fabs.map((f) => ({ label: f.name, v: f.hours }))}
                        rowH={30}
                        padR={66}
                        padL={120}
                        vName="Yo'qotilgan soat"
                        vFmt={(v) => nf(v, 1) + " s"}
                      />
                      <p className="mt-2.5 text-[11.5px] leading-normal text-ink-3">
                        Fabrika raqami izoh matnidan aniqlanadi («2f-ka», «fab-1»,
                        «na vsex 3-x fabrikax»). Raqam yozilmagan yozuvlar
                        «Aniqlanmagan» guruhiga tushadi.
                      </p>
                    </Card>
                  </div>
                )}
              </Section>

              <Section title="Kunlar kesimida to'xtash" note="soat">
                {masked ? (
                  <MaskedChart
                    area={AREA}
                    what="Kunlar kesimidagi to'xtash diagrammasi"
                  />
                ) : (
                  <Card>
                    <Columns
                      labels={byDay.map((d) => d.label)}
                      fullLabels={byDay.map((d) => d.full)}
                      height={210}
                      thick={18}
                      ariaLabel="Kunlar kesimida uskuna to'xtashi, soat"
                      yTickFmt={(t) => nf(t, 0)}
                      vFmt={(v) => nf(v, 2) + " soat"}
                      series={[{ name: "To'xtash", color: p.s1, values: byDay.map((d) => d.hours) }]}
                    />
                    <TableToggle
                      caption="Kunlar kesimida uskuna to'xtashi"
                      cols={[{ t: "Kun" }, { t: "To'xtash, soat", num: true }]}
                      rows={byDay.map((d) => ({ key: d.day, cells: [d.full, nf(d.hours, 2)] }))}
                    />
                  </Card>
                )}
              </Section>

              <Section
                title="To'xtashlar jurnali"
                note={`${vm.stops.length} ta yozuv · manbadagi izohlar o'zgartirilmagan`}
              >
                <Card>
                  <DataTable
                    caption="Ingichka IOF to'xtashlar jurnali"
                    cols={[
                      { t: "Sana" },
                      { t: "Boshlanishi" },
                      { t: "Tugashi" },
                      { t: "Soat", num: true },
                      { t: "Izoh (manba)", wrap: true },
                    ]}
                    rows={vm.stops.map((s) => ({
                      key: s.key,
                      cells: [
                        <span className="font-mono">{s.day}</span>,
                        <Masked area={AREA}>
                          <span className="font-mono">{s.start ?? "—"}</span>
                        </Masked>,
                        <Masked area={AREA}>
                          <span className="font-mono">{s.end ?? "—"}</span>
                        </Masked>,
                        <Masked area={AREA}>{nf(s.hours, 2)}</Masked>,
                        <span className="text-ink-3">{s.note}</span>,
                      ],
                    }))}
                  />
                </Card>
              </Section>
            </>
          )
        }
      </Loader>
    </>
  );
}
