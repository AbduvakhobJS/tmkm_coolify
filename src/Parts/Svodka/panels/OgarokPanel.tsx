import { useMemo } from "react";
import type { PanelProps } from "../types";
import { getOgarokDaily, getOgarokMonthly } from "../api/endpoints";
import { useQuery } from "../lib/useQuery";
import { nf, periodLabel, exact } from "../lib/format";
import { isUnverified } from "../lib/dataQuality";
import { ogarokVM } from "../lib/adapters/resources";
import { usePalette } from "../lib/theme";
import { GRID } from "../components/layout";
import { Card, Section } from "../components/Card";
import { StatTile } from "../components/StatTile";
import { Pill } from "../components/Pill";
import { Columns } from "../components/Columns";
import { TimeLine } from "../components/TimeLine";
import { TableToggle } from "../components/TableToggle";
import { DataTable } from "../components/DataTable";
import { Masked, MaskedChart, MaskedValue, UnverifiedBanner } from "../components/Masked";
import { Loader } from "../components/states";
import { cumulative } from "../lib/adapters/production";

const AREA = "ogarok";

export function OgarokPanel({ period, months }: PanelProps) {
  const p = usePalette();
  const key = `${period.from}_${period.to}`;
  const multiMonth = months.length > 1;
  const masked = isUnverified(AREA);

  const dailyQ = useQuery(`ogarok-daily_${key}`, (s) => getOgarokDaily(period, s));
  const monthlyQ = useQuery(`ogarok-monthly_${key}`, (s) => getOgarokMonthly(period, s));

  const vm = useMemo(
    () => (dailyQ.data ? ogarokVM(dailyQ.data, monthlyQ.data ?? [], multiMonth) : null),
    [dailyQ.data, monthlyQ.data, multiMonth],
  );

  const cum = useMemo(() => (vm ? cumulative(vm.days.map((d) => d.physical), 2) : []), [vm]);

  return (
    <>
      <UnverifiedBanner area={AREA} />

      <Loader
        q={dailyQ}
        height={260}
        notAvailableWhat="/ogarok"
        isEmpty={() => !vm || vm.days.length === 0}
        emptyTitle="Ushbu davr uchun ogarok yozuvlari yo'q"
      >
        {() =>
          vm && (
            <>
              <div className={GRID.g6}>
                <StatTile
                  label="Jami qabul qilingan"
                  value={<MaskedValue area={AREA}>{nf(vm.total, 2)}</MaskedValue>}
                  unit={masked ? undefined : "t"}
                  stripe="var(--s2)"
                  foot={<Pill>{periodLabel(months)}</Pill>}
                />
                <StatTile
                  label="Yetkazib berish kunlari"
                  value={<MaskedValue area={AREA}>{nf(vm.deliveryDays)}</MaskedValue>}
                  unit={masked ? undefined : "kun"}
                />
                <StatTile
                  label="Mashinalar soni"
                  value={<MaskedValue area={AREA}>{nf(vm.machines)}</MaskedValue>}
                  unit={masked ? undefined : "ta"}
                />
                <StatTile
                  label="Stakanlar soni"
                  value={<MaskedValue area={AREA}>{nf(vm.cups)}</MaskedValue>}
                  unit={masked ? undefined : "ta"}
                />
                <StatTile
                  label="Kunlik o'rtacha"
                  value={
                    <MaskedValue area={AREA}>
                      {nf(vm.total / (vm.deliveryDays || 1), 2)}
                    </MaskedValue>
                  }
                  unit={masked ? undefined : "t"}
                />
                <StatTile
                  label="Yozuvlar soni"
                  value={nf(vm.days.length)}
                  unit="yozuv"
                  stripe="var(--warn)"
                  foot={<Pill>sanalar manbadagi ko'rinishida</Pill>}
                />
              </div>

              <Section className="mt-5" title="Kunlik qabul" note="fizik vazn, tonna">
                {masked ? (
                  <MaskedChart area={AREA} what="Kunlik qabul diagrammasi" />
                ) : (
                  <Card>
                    <Columns
                      labels={vm.days.map((d) => d.label)}
                      fullLabels={vm.days.map((d) => d.full)}
                      height={230}
                      thick={18}
                      ariaLabel="Kunlik ogarok qabuli, tonna"
                      yTickFmt={(t) => nf(t, 0)}
                      vFmt={(v) => nf(v, 2) + " t"}
                      series={[
                        { name: "Qabul", color: p.s2, values: vm.days.map((d) => d.physical) },
                      ]}
                    />
                    <TableToggle
                      caption="Kunlik ogarok qabuli"
                      cols={[{ t: "Kun" }, { t: "Kunlik, t", num: true }]}
                      rows={vm.days.map((d) => ({ key: d.day, cells: [d.full, nf(d.physical, 2)] }))}
                    />
                  </Card>
                )}
              </Section>

              <Section title="Davr boshidan o'sib boruvchi yakun" note="tonna">
                {masked ? (
                  <MaskedChart
                    area={AREA}
                    what="O'sib boruvchi yakun diagrammasi (API'dagi kumulyativ ustun ham buzuq)"
                  />
                ) : (
                  <Card>
                    <TimeLine
                      labels={vm.days.map((d) => d.label)}
                      fullLabels={vm.days.map((d) => d.full)}
                      height={230}
                      ariaLabel="Ogarok qabuli — davr boshidan o'sib boruvchi yakun"
                      yTickFmt={(t) => nf(t, 0)}
                      vFmt={(v) => nf(v, 2) + " t"}
                      series={[{ name: "Davr boshidan", color: p.s2, values: cum }]}
                    />
                  </Card>
                )}
              </Section>

              <Section
                title="Yetkazib berish reyestri"
                note={`${vm.days.length} ta yozuv · sanalar va vaqtlar manbadagi ko'rinishida`}
              >
                <Card>
                  <DataTable
                    caption="Ogarok yetkazib berish reyestri"
                    cols={[
                      { t: "Sana" },
                      { t: "Vaqt" },
                      { t: "Mashina", num: true },
                      { t: "Stakan", num: true },
                      { t: "Fizik vazn, t", num: true },
                    ]}
                    rows={vm.days.map((d) => ({
                      key: `${d.day}-${d.time ?? ""}`,
                      cells: [
                        <span className="font-mono">{d.day}</span>,
                        <span className="font-mono">{d.time ?? "—"}</span>,
                        <Masked area={AREA}>{nf(d.machines)}</Masked>,
                        <Masked area={AREA}>{nf(d.cups)}</Masked>,
                        <Masked area={AREA}>{exact(d.physical)}</Masked>,
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
