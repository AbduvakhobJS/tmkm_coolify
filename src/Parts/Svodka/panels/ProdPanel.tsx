import { useDeferredValue, useId, useMemo, useState } from "react";
import type { PanelProps } from "../types";
import { getNarastayka, getProductionTree } from "../api/endpoints";
import { useQuery } from "../lib/useQuery";
import { inkTokenOf, nf, pctTxt, periodLabel, exact, smart, statusOf, stripeOf } from "../lib/format";
import { UNASSIGNED_PLANT_NOTE } from "../lib/dataQuality";
import {
  dailyFromNarastayka,
  deviationRows,
  filterItems,
  fromTree,
  prodStats,
  unitGroups,
  type DeviationRow,
  type ProdItem,
} from "../lib/adapters/production";
import { usePalette } from "../lib/theme";
import { GRID } from "../components/layout";
import { Card, Section } from "../components/Card";
import { StatTile } from "../components/StatTile";
import { Pill } from "../components/Pill";
import { Banner } from "../components/Banner";
import { BarsH } from "../components/BarsH";
import { BulletChart, BulletLegend } from "../components/BulletRow";
import { ChartLegend } from "../components/ChartLegend";
import { TimeLine } from "../components/TimeLine";
import { TableToggle } from "../components/TableToggle";
import { DataTable } from "../components/DataTable";
import { Loader } from "../components/states";

const devRows = (items: DeviationRow[]) =>
  items.map((x) => ({
    label: x.name,
    v: x.pc,
    valueColor: inkTokenOf(x.pc),
    extra: ["Reja / Fakt", `${exact(x.plan)} / ${exact(x.fakt)} ${x.unit ?? ""}`.trim()] as [
      string,
      string,
    ],
  }));

export function ProdPanel({ period, months }: PanelProps) {
  const p = usePalette();
  const uid = useId();
  const [workshop, setWorkshop] = useState("ALL");
  const [query, setQuery] = useState("");
  const [pickedKey, setPickedKey] = useState<string | null>(null);

  // 300+ позицияли рўйхат ёзиш тезлигини секинлаштирмаслиги учун.
  const deferredQuery = useDeferredValue(query);
  const key = `${period.from}_${period.to}`;
  const multiMonth = months.length > 1;

  const treeQ = useQuery(`prod-tree_${key}`, (s) =>
    getProductionTree(period, { depth: "product" }, s),
  );

  const flat = useMemo(() => (treeQ.data ? fromTree(treeQ.data) : null), [treeQ.data]);
  const items: ProdItem[] = flat?.items ?? [];
  const rows = useMemo(
    () => filterItems(items, workshop, deferredQuery),
    [items, workshop, deferredQuery],
  );
  const stats = useMemo(() => prodStats(rows), [rows]);
  const { low, high, all, showAll, noPlan, totals } = useMemo(() => deviationRows(rows), [rows]);
  const groups = useMemo(() => unitGroups(rows), [rows]);

  const candidates = useMemo(() => {
    const withValue = rows.filter((x) => x.plan > 0 || x.fakt > 0);
    return withValue.length > 0 ? withValue : rows;
  }, [rows]);

  // Танлов индекс билан эмас, ўзлик билан сақланади — фильтр ўзгарганда
  // эффектсиз тикланади.
  const picked = candidates.find((x) => x.key === pickedKey) ?? candidates[0] ?? null;

  const dailyQ = useQuery(
    `prod-daily_${key}_${picked?.name ?? ""}`,
    (s) => getNarastayka(period, { product: picked?.name, limit: 400 }, s),
    { enabled: Boolean(picked) },
  );

  const daily = useMemo(
    () => (dailyQ.data ? dailyFromNarastayka(dailyQ.data.rows, multiMonth) : null),
    [dailyQ.data, multiMonth],
  );

  const metShare = stats.met / (stats.withPlan || 1);
  const hasUnassigned = (flat?.plants ?? []).some((x) => x.unassigned);

  return (
    <Loader
      q={treeQ}
      height={320}
      notAvailableWhat="/production/tree"
      isEmpty={() => items.length === 0}
      emptyTitle="Ushbu davr uchun ishlab chiqarish ma'lumoti yo'q"
    >
      {() => (
        <>
          {hasUnassigned && (
            <Banner tone="warn">
              <b>Zavodga bog'lanmagan pozitsiyalar.</b>{" "}
              {flat?.plants.find((x) => x.unassigned)?.productCount ?? 0} ta pozitsiya zavodga
              biriktirilmagan — {UNASSIGNED_PLANT_NOTE} Ular ro'yxatda «Zavodga bog'lanmagan» guruhi
              sifatida ko'rinadi.
            </Banner>
          )}

          <div className="sv-card mb-3.5 flex flex-wrap items-center gap-2.5 px-3.5 py-2.5">
            <label
              htmlFor={`${uid}-ws`}
              className="text-[11.5px] font-semibold tracking-[0.06em] text-ink-3 uppercase"
            >
              Sex / ob'ekt
            </label>
            <select
              id={`${uid}-ws`}
              value={workshop}
              onChange={(ev) => {
                setWorkshop(ev.target.value);
                setPickedKey(null);
              }}
            >
              <option value="ALL">Barchasi ({items.length} pozitsiya)</option>
              {(flat?.workshops ?? []).map((w) => (
                <option key={`${w.plant}#${w.code}`} value={`${w.plant}#${w.code}`}>
                  {w.plant === w.code ? w.label : `${w.label} — ${w.count} poz.`}
                </option>
              ))}
            </select>
            <label
              htmlFor={`${uid}-q`}
              className="text-[11.5px] font-semibold tracking-[0.06em] text-ink-3 uppercase"
            >
              Qidiruv
            </label>
            <input
              id={`${uid}-q`}
              type="search"
              placeholder="mahsulot nomi…"
              value={query}
              onChange={(ev) => setQuery(ev.target.value)}
            />
            <span className="flex-1" />
            <Pill>{periodLabel(months)}</Pill>
            <Pill>{stats.total} pozitsiya</Pill>
          </div>

          <div className={GRID.g4}>
            <StatTile
              label="Kuzatilayotgan pozitsiyalar"
              value={nf(stats.total)}
              unit="ta"
              stripe="var(--s1)"
              foot={<Pill>rejali: {stats.withPlan}</Pill>}
            />
            <StatTile
              label="O'rtacha bajarilish darajasi"
              value={nf(stats.score, 1)}
              unit="%"
              stripe={stripeOf(stats.score)}
              foot={<Pill status={statusOf(stats.score)}>{nf(stats.score, 1)}%</Pill>}
            />
            <StatTile
              label="Reja to'liq bajarilgan"
              value={nf(stats.met)}
              unit="pozitsiya"
              stripe={metShare >= 0.5 ? "var(--good)" : "var(--warn)"}
              foot={
                <Pill status={metShare >= 0.5 ? "good" : "warn"}>
                  {nf(metShare * 100, 0)}% rejali pozitsiyadan
                </Pill>
              }
            />
            <StatTile
              label="Ishlab chiqarilmagan"
              value={nf(stats.zero)}
              unit="pozitsiya"
              stripe={stats.zero ? "var(--crit)" : "var(--good)"}
              foot={<Pill status={stats.zero ? "crit" : "good"}>reja bor, fakt nol</Pill>}
            />
          </div>

          <Section
            className="mt-5"
            title={showAll ? "Reja bajarilishi" : "Eng katta chetlanishlar"}
            note={showAll ? "rejaga nisbatan bajarilish · to'liq ro'yxat" : "rejaga nisbatan bajarilish, faqat rejali pozitsiyalar"}
          >
            {showAll ? (
              /* Позиция кам бўлса (одатда битта цех танланганда) чекка рўйхат
                 эмас, ҳаммаси кўрсатилади — ўртадаги қаторлар ҳам кўринсин. */
              <Card
                title="Barcha rejali pozitsiyalar"
                sub={`${all.length} ta · bajarilish bo'yicha`}
                note="Pozitsiya ko'p bo'lmagani uchun to'liq ro'yxat ko'rsatilmoqda. Barchasi tanlanganda faqat eng chekka pozitsiyalar chiqadi."
              >
                <div className="mt-2">
                  <BarsH
                    ariaLabel="Barcha rejali pozitsiyalar — bajarilish"
                    rows={devRows(all)}
                    track
                    rowH={25}
                    thick={15}
                    padR={62}
                    vName="Bajarilish"
                    vFmt={(v) => nf(v, 1) + "%"}
                  />
                </div>
              </Card>
            ) : (
              <div className={GRID.g2}>
                <Card title="Rejadan ortda qolgan pozitsiyalar" sub={`pastki ${low.length} ta`}>
                  <div className="mt-2">
                    <BarsH
                      ariaLabel="Rejadan ortda qolgan pozitsiyalar"
                      rows={devRows(low)}
                      max={100}
                      track
                      rowH={25}
                      thick={15}
                      padR={62}
                      vName="Bajarilish"
                      vFmt={(v) => nf(v, 1) + "%"}
                    />
                  </div>
                </Card>
                <Card title="Reja oshiqcha bajarilgan pozitsiyalar" sub={`yuqori ${high.length} ta`}>
                  <div className="mt-2">
                    <BarsH
                      ariaLabel="Reja oshiqcha bajarilgan pozitsiyalar"
                      rows={devRows(high)}
                      track
                      rowH={25}
                      thick={15}
                      padR={62}
                      vName="Bajarilish"
                      vFmt={(v) => nf(v, 1) + "%"}
                    />
                  </div>
                </Card>
              </div>
            )}

            {/* Манбадаги «всего» сатрлари — пастдаги қаторларнинг йиғиндиси
                (`Ввод W концентрата, всего = ИОФ + покупной`). Улар юқоридаги
                рўйхатларга ва ҳажм рейтингига кирмайди, акс ҳолда битта миқдор
                икки марта саналарди. Лекин раҳбар учун айнан шу умумлаштирувчи
                сон муҳим, шунинг учун алоҳида карточкада. */}
            {totals.length > 0 && (
              <Card
                className="mt-3"
                title="Yig'indi satrlar"
                sub={`${totals.length} ta · manbadagi «vsego»`}
                note="Bu qatorlar pastdagi pozitsiyalarning yig'indisi, shuning uchun ular umumiy hisob-kitoblarga, chetlanish ro'yxatlariga va hajm reytingiga qo'shilmaydi — aks holda bitta miqdor ikki marta sanalardi."
              >
                <div className="mt-2">
                  <BarsH
                    ariaLabel="Manbadagi yig'indi satrlar — bajarilish"
                    rows={totals.map((x) => ({
                      label: x.name,
                      v: x.pc ?? 0,
                      valueColor: x.pc === null ? "var(--ink-3)" : inkTokenOf(x.pc),
                      extra: [
                        "Reja / Fakt",
                        `${exact(x.plan)} / ${exact(x.fakt)} ${x.unit ?? ""}`.trim(),
                      ] as [string, string],
                    }))}
                    track
                    rowH={26}
                    thick={15}
                    padR={62}
                    vName="Bajarilish"
                    vFmt={(v) => nf(v, 1) + "%"}
                  />
                </div>
                <TableToggle
                  caption="Manbadagi yig'indi satrlar"
                  cols={[
                    { t: "Qator", wrap: true },
                    { t: "Sex" },
                    { t: "Birlik" },
                    { t: "Reja", num: true },
                    { t: "Fakt", num: true },
                    { t: "Bajarilish", num: true },
                  ]}
                  rows={totals.map((x) => ({
                    key: x.key,
                    cells: [
                      x.name,
                      x.workshop,
                      x.unit ?? "—",
                      exact(x.plan),
                      exact(x.fakt),
                      x.pc === null ? "—" : pctTxt(x.pc),
                    ],
                  }))}
                />
              </Card>
            )}

            {/* Режаси йўқ позициялар фоиз диаграммасига тушмайди (нолга бўлиб
                бўлмайди), лекин уларда факт бўлиши мумкин — масалан «Получение
                ТМА из 5 цеха по факту». Уларни бутунлай яшириб қўймаслик учун
                алоҳида жадвал. */}
            {noPlan.length > 0 && (
              <Card
                className="mt-3"
                title="Rejasi yo'q pozitsiyalar"
                sub={`${noPlan.length} ta`}
                note="Bu qatorlarga reja qo'yilmagan, shuning uchun bajarilish foizi hisoblanmaydi va ular yuqoridagi diagrammalarga tushmaydi. Ko'pchiligi — boshqa sexdan qabul qilish («po faktu») qatorlari."
              >
                <DataTable
                  caption="Rejasi yo'q pozitsiyalar"
                  cols={[
                    { t: "Pozitsiya", wrap: true },
                    { t: "Sex" },
                    { t: "Birlik" },
                    { t: "Fakt", num: true },
                  ]}
                  rows={noPlan.map((x) => ({
                    key: `${x.workshop}#${x.id}`,
                    cells: [
                      x.name,
                      <span className="text-ink-3">{x.workshop}</span>,
                      <span className="text-ink-3">{x.unit ?? "—"}</span>,
                      exact(x.fakt),
                    ],
                  }))}
                />
              </Card>
            )}
          </Section>

          <Section
            title="Hajm bo'yicha eng yirik pozitsiyalar"
            note="o'lchov birligi guruhlari bo'yicha alohida — qiymati o'zaro qo'shilmaydi"
          >
            <Card>
              <BulletLegend />
              {groups.length === 0 ? (
                <div className="px-2.5 py-6 text-center text-[13px] text-ink-3">
                  Filtr bo'yicha ko'rsatkich topilmadi.
                </div>
              ) : (
                <div className={GRID.g2}>
                  {groups.map((g) => (
                    <div key={g.unit}>
                      <div className="mt-1.5 mb-1 text-[12px] [font-weight:650] text-ink-2">
                        {g.name}{" "}
                        <span className="font-normal text-ink-3">· {g.items.length} pozitsiya</span>
                      </div>
                      <BulletChart
                        rows={g.items.map((x) => ({
                          key: x.key,
                          label: x.name,
                          plan: x.plan,
                          fact: x.fakt,
                          unit: x.unit ?? "",
                        }))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Section>

          <Section
            title="Pozitsiya bo'yicha kunlik dinamika"
            note="davr boshidan o'sib boruvchi yakun (narastayushiy itog)"
          >
            <Card>
              <div className="mb-3 flex flex-wrap items-center gap-2.5">
                <label
                  htmlFor={`${uid}-item`}
                  className="text-[11.5px] font-semibold tracking-[0.06em] text-ink-3 uppercase"
                >
                  Pozitsiya
                </label>
                <select
                  id={`${uid}-item`}
                  className="min-w-0 flex-[1_1_320px]"
                  value={picked ? picked.key : ""}
                  onChange={(ev) => setPickedKey(ev.target.value)}
                >
                  {candidates.map((x) => (
                    <option key={x.key} value={x.key}>
                      {x.workshop} · {x.name} ({x.unit ?? "—"})
                    </option>
                  ))}
                </select>
              </div>
              {picked ? (
                <Loader
                  q={dailyQ}
                  height={250}
                  notAvailableWhat="/narastayka"
                  isEmpty={() => !daily || daily.labels.length === 0}
                  emptyTitle="Ushbu pozitsiya bo'yicha kunlik yozuv yo'q"
                >
                  {() =>
                    daily && (
                      <>
                        <ChartLegend
                          items={[
                            { name: "Reja (o'sib boruvchi)", color: "var(--s1)" },
                            { name: "Fakt (o'sib boruvchi)", color: "var(--s2)" },
                          ]}
                        />
                        <TimeLine
                          labels={daily.labels}
                          fullLabels={daily.fullLabels}
                          height={250}
                          area={false}
                          ariaLabel={`${picked.name} — davr boshidan o'sib boruvchi reja va fakt`}
                          yTickFmt={smart}
                          vFmt={(v) => exact(v) + " " + (picked.unit ?? "")}
                          series={[
                            { name: "Reja", color: p.s1, values: daily.cumPlan },
                            { name: "Fakt", color: p.s2, values: daily.cumFakt },
                          ]}
                        />
                        {daily.matched.length > 1 && (
                          <p className="mt-2 text-[11.5px] leading-[1.45] text-ink-3">
                            Kunlik yozuvlar nomi bo'yicha izlangani uchun {daily.matched.length} ta
                            yaqin nomli pozitsiya birga yig'ildi: {daily.matched.join(" · ")}
                          </p>
                        )}
                        <TableToggle
                          caption={`${picked.name} — kunlik reja va fakt`}
                          cols={[
                            { t: "Kun" },
                            { t: "Reja (kunlik)", num: true },
                            { t: "Fakt (kunlik)", num: true },
                            { t: "Reja (o'sib)", num: true },
                            { t: "Fakt (o'sib)", num: true },
                          ]}
                          rows={daily.labels.map((_, i) => ({
                            key: String(i),
                            cells: [
                              daily.fullLabels[i],
                              exact(daily.plan[i]),
                              exact(daily.fakt[i]),
                              exact(daily.cumPlan[i]),
                              exact(daily.cumFakt[i]),
                            ],
                          }))}
                        />
                      </>
                    )
                  }
                </Loader>
              ) : (
                <div className="px-2.5 py-6 text-center text-[13px] text-ink-3">
                  Filtr bo'yicha pozitsiya topilmadi.
                </div>
              )}
            </Card>
          </Section>

          <Section title="To'liq ro'yxat" note="filtr bo'yicha barcha pozitsiyalar">
            <Card>
              <DataTable
                caption="Barcha kuzatilayotgan pozitsiyalar"
                emptyText="Filtr bo'yicha pozitsiya topilmadi."
                cols={[
                  { t: "Zavod" },
                  { t: "Sex / ob'ekt" },
                  { t: "Pozitsiya", wrap: true },
                  { t: "Birlik" },
                  { t: "Metall" },
                  { t: "Jarayon" },
                  { t: "Reja", num: true },
                  { t: "Fakt", num: true },
                  { t: "Bajarilish", num: true },
                ]}
                rows={rows.map((x) => ({
                  key: x.key,
                  cells: [
                    x.plantLabel,
                    x.workshop,
                    x.name,
                    x.unit ?? "—",
                    x.material ?? "—",
                    x.process ?? "—",
                    exact(x.plan),
                    exact(x.fakt),
                    x.percent == null ? (
                      "—"
                    ) : (
                      <Pill status={statusOf(x.percent)}>{pctTxt(Math.min(x.percent, 9999))}</Pill>
                    ),
                  ],
                }))}
              />
            </Card>
          </Section>
        </>
      )}
    </Loader>
  );
}
