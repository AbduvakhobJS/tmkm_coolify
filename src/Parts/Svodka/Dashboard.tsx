import { useMemo, useRef, type KeyboardEvent } from "react";
import type { PanelProps, TabId } from "./types";
import { getFilters } from "./api/endpoints";
import { useQuery } from "./lib/useQuery";
import { monthsInRange, monthsOf, usePeriodState } from "./lib/period";
import { periodLabel } from "./lib/format";
import { unverifiedAreasText } from "./lib/dataQuality";
import { TABS, useHashTab } from "./lib/useHashTab";
import { PeriodPicker } from "./components/PeriodPicker";
import { ErrorState, Skeleton } from "./components/states";
import { ObzorPanel } from "./panels/ObzorPanel";
import { ProdPanel } from "./panels/ProdPanel";
import { SgpPanel } from "./panels/SgpPanel";
import { EnergyPanel } from "./panels/EnergyPanel";
import { H2Panel } from "./panels/H2Panel";
import { CistPanel } from "./panels/CistPanel";
import { OgarokPanel } from "./panels/OgarokPanel";
import { IngPanel } from "./panels/IngPanel";

/**
 * Даврлар рўйхати `/filters` дан келади. Агар ушбu endpoint серверда
 * бўлмаса (404), илова тўхтамайди — охирги 12 ой билан ишлайверади.
 */
function fallbackRange(): { min: string; max: string } {
  const now = new Date();
  const max = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  const min = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { min: iso(min), max: iso(max) };
}

export function Dashboard() {
  const filtersQ = useQuery("filters", (s) => getFilters(s));

  if (filtersQ.loading) {
    return (
      <main className="sv-wrap py-6">
        <Skeleton height={320} />
      </main>
    );
  }

  if (filtersQ.error && !filtersQ.notAvailable) {
    return (
      <main className="sv-wrap mx-auto max-w-[560px] py-16">
        <ErrorState error={filtersQ.error} onRetry={filtersQ.refetch} />
      </main>
    );
  }

  const range = filtersQ.data?.dateRange ?? fallbackRange();
  // Ойлар рўйхати ўзгарганда давр ҳолати ҳам қайта ҳисобланиши учун
  // ички компонент remount қилинади (қаттиқ ёзилган ой йўқ).
  return <DashboardBody key={`${range.min}_${range.max}`} range={range} />;
}

function DashboardBody({ range }: { range: { min: string; max: string } }) {
  const [tab, selectTab] = useHashTab();
  const allMonths = useMemo(() => monthsInRange(range.min, range.max), [range.min, range.max]);
  const [period, setPeriod] = usePeriodState(allMonths);
  const months = useMemo(() => monthsOf(period, allMonths), [period, allMonths]);
  const tablistRef = useRef<HTMLDivElement>(null);

  const props: PanelProps = { period, months };

  function renderPanel() {
    switch (tab) {
      case "prod":
        return <ProdPanel {...props} />;
      case "sgp":
        return <SgpPanel {...props} />;
      case "energy":
        return <EnergyPanel {...props} />;
      case "h2":
        return <H2Panel {...props} />;
      case "cist":
        return <CistPanel {...props} />;
      case "ogarok":
        return <OgarokPanel {...props} />;
      case "ing":
        return <IngPanel {...props} />;
      case "obzor":
      default:
        return <ObzorPanel {...props} />;
    }
  }

  // WAI-ARIA tabs: стрелкалар таблар орасида юради, Home/End четларга.
  const onTabKeyDown = (ev: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(ev.key)) return;
    ev.preventDefault();
    const i = TABS.findIndex((t) => t.id === tab);
    const next =
      ev.key === "ArrowRight"
        ? (i + 1) % TABS.length
        : ev.key === "ArrowLeft"
          ? (i - 1 + TABS.length) % TABS.length
          : ev.key === "Home"
            ? 0
            : TABS.length - 1;
    const id: TabId = TABS[next].id;
    selectTab(id);
    tablistRef.current?.querySelector<HTMLButtonElement>(`#tab-${id}`)?.focus();
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2 focus:shadow-card"
      >
        Asosiy mazmunga o'tish
      </a>

      {/* Сарлавҳа скролл билан кетади, таблар эса хостнинг `NavbarOverlay`
          (тепада 100px, `fixed`) остига ёпишиб қолади. Сарлавҳа ҳам sticky
          бўлганда экраннинг 250px и доим банд бўларди — ситуацион марказ
          экранида бу жуда кўп. Иккиси ҳам ёпишганда таблар сарлавҳанинг
          баландлигини билиши керак эди, у эса ўзгарувчан (давр танлагич тор
          экранда пастга тушади) — қаттиқ ёзилган офсет ҳар доим хато бўларди. */}
      <header className="sv-pane border-b border-rule">
        <div className="sv-wrap flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              aria-hidden="true"
              className="grid h-[34px] w-[34px] flex-none place-items-center rounded-lg bg-s1 font-mono text-[11.5px] font-bold tracking-[0.04em] text-white"
            >
              KTM
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[18px] leading-[1.15] font-bold tracking-[0.01em] text-ink uppercase">
                Svodka — ishlab chiqarish ko'rsatkichlari
              </h1>
              <p className="mt-px truncate text-[11px] font-medium tracking-[0.06em] text-ink-3 uppercase">
                O'zbekiston qiyin eruvchan va issiqqa chidamli metallar kombinati ·{" "}
                {periodLabel(months)}
              </p>
            </div>
          </div>
          <div className="flex-1" />
          {/* «Чиқиш» тугмаси йўқ: сеансни хост илова бошқаради, дашборд
              токенни фақат ўқийди. */}
          <PeriodPicker months={allMonths} period={period} onChange={setPeriod} />
        </div>
      </header>

      <nav
        className="sv-pane sticky top-[var(--sv-nav-h)] z-[35] border-b border-rule"
        aria-label="Bo'limlar"
      >
        <div
          ref={tablistRef}
          className="tabs-scroll sv-wrap flex gap-1.5 py-2"
          role="tablist"
          aria-label="Bo'limlar"
          onKeyDown={onTabKeyDown}
        >
          {TABS.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`panel-${t.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => selectTab(t.id)}
                className={
                  "flex flex-none cursor-pointer items-center gap-[7px] rounded-lg border px-3 py-[6px] text-[12.5px] whitespace-nowrap transition-colors " +
                  (on
                    ? "border-s1 bg-[color-mix(in_srgb,var(--s1)_18%,transparent)] font-semibold text-ink"
                    : "border-rule font-medium text-ink-2 hover:border-[rgba(22,211,255,.4)] hover:text-ink")
                }
              >
                <span
                  aria-hidden="true"
                  className={
                    "h-[6px] w-[6px] flex-none rounded-full " + (on ? "bg-s1" : "bg-ink-3")
                  }
                />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main id="main" className="sv-wrap pt-4 pb-12">
        {/*
          Давр ўзгарганда панел remount қилинмайди: сўровлар ўзи янгиланади,
          эски натижа эса янгиси келгунича экранда қолади (скелет миллтилламайди).
        */}
        <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0}>
          {renderPanel()}
        </div>
      </main>

      <footer className="sv-wrap pb-8 text-[11.5px] leading-[1.6] text-ink-3">
        <p>
          {/* Fayl, varaq va manba satri nomlari — haqiqiy nomlar, shuning uchun
              o'sha ko'rinishida qoldirilgan. */}
          <b className="font-semibold text-ink-2">Manba:</b> «Production Report» API — oylik
          «Сводки MM-YYYY.xlsx» fayllaridan import qilingan ma'lumotlar (Narastayka,
          Elektroenergiya, Vodorod, sisternalar, Ogarok, Ingichka, SGP). Klassifikatsiya
          «Справочники.xlsx» ma'lumotnomalari asosida (sex/ob'ekt, jarayon, metall).
        </p>
        <p>
          Elektr energiya yig'indisidan «ЭНЦ общ.» takroriy satri chiqarilgan.
          {unverifiedAreasText() && (
            <>
              {" "}
              {unverifiedAreasText()} bo'limlarida manba qiymatlari tekshirilmagani uchun son
              qiymatlar vaqtincha yashirilgan.
            </>
          )}{" "}
          Zavodga bog'lanmagan pozitsiyalar alohida guruhda ko'rsatiladi va birlik kesimidagi
          yig'indilarga qo'shilmaydi.
        </p>
      </footer>
    </>
  );
}
