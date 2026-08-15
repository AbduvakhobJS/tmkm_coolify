import type { ReactNode } from "react";

export interface StatTileProps {
  label: string;
  /**
   * Тайёр форматланган қиймат — форматлаш қарори чақирувчида қолади.
   * `ReactNode`, чунки текширилмаган бўлимларда бу ерга `<MaskedValue>` тушади.
   */
  value: ReactNode;
  unit?: string;
  foot?: ReactNode;
  /** CSS colour for the accent, e.g. `var(--s1)`. */
  stripe?: string;
}

/**
 * KPI карточкаси — хостнинг `dashboardUI.tsx` даги `KpiCard` кўринишида:
 * юқорида кичик, сўник сарлавҳа; ўнг юқорида ранг-акцент нишони; пастда
 * йирик қиймат ва изоҳ.
 */
export function StatTile({ label, value, unit, foot, stripe }: StatTileProps) {
  const accent = stripe ?? "var(--s1)";
  return (
    <div className="sv-card sv-card--hover relative min-w-0 overflow-hidden px-[13px] py-[10px]">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 text-[12px] font-medium text-ink-3">{label}</span>
        <span
          aria-hidden="true"
          className="mt-[3px] h-2 w-2 flex-none rounded-full"
          style={{ background: accent, boxShadow: `0 0 0 3px color-mix(in srgb, ${accent} 18%, transparent)` }}
        />
      </div>
      {/* No tabular-nums here: proportional digits read better at display size. */}
      <div className="mt-1.5 text-[24px] leading-[1.1] font-bold tracking-[-0.02em] text-ink">
        {value}
        {unit && (
          <span className="ml-[5px] text-[12.5px] font-medium tracking-normal text-ink-3">
            {unit}
          </span>
        )}
      </div>
      {foot && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-ink-2">
          {foot}
        </div>
      )}
    </div>
  );
}
