import type { ReactNode } from "react";

export interface CardProps {
  title?: ReactNode;
  /** Small muted text on the right of the title row. */
  sub?: ReactNode;
  /** Explanatory paragraph under the title. */
  note?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * Карточка — хостнинг `src/components/dashboardUI.tsx` даги `Card` билан бир
 * хил кўринишда: градиент фон, цианга мойил ҳошия, 12px радиус, 11px ички
 * бўшлиқ, сарлавҳа 15.5px/600. Градиент `.sv-card` синфида (`svodka.css`),
 * чунки Tailwind'нинг `bg-*` утилитаси градиент бера олмайди.
 */
export function Card({ title, sub, note, className, children }: CardProps) {
  return (
    <div
      className={
        "sv-card relative min-w-0 overflow-hidden p-[11px]" +
        (className ? " " + className : "")
      }
    >
      {(title || sub) && (
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2.5">
          {title && (
            <h3 className="text-[15.5px] leading-tight font-semibold text-ink">{title}</h3>
          )}
          {sub && <span className="text-[11.5px] text-ink-3">{sub}</span>}
        </div>
      )}
      {note && <p className="mt-0.5 mb-2.5 text-[11.5px] leading-[1.45] text-ink-3">{note}</p>}
      {children}
    </div>
  );
}

export interface SectionProps {
  title: string;
  note?: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Бўлим сарлавҳаси. Хостда `DashHeader` сарлавҳаси катта ҳарфларда ва
 * қалин — ички бўлимлар ҳам шу услубда, лекин кичикроқ ўлчамда, олдида
 * циан акцент чизиғи билан.
 */
export function Section({ title, note, className, children }: SectionProps) {
  return (
    <section className={"mb-4" + (className ? " " + className : "")}>
      <div className="mb-2.5 flex flex-wrap items-center gap-2.5">
        <h2 className="flex items-center gap-2 text-[13px] font-bold tracking-[0.08em] text-ink uppercase">
          <span aria-hidden="true" className="h-3.5 w-[3px] rounded-full bg-s1" />
          {title}
        </h2>
        {note && <span className="text-[11.5px] text-ink-3">{note}</span>}
      </div>
      {children}
    </section>
  );
}
