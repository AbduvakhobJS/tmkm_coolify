import type { ReactNode } from "react";
import type { QueryResult } from "../lib/useQuery";

/**
 * Маълумот юкланадиган ҳар бир жойда тўртта ҳолат қаралади:
 * юкланиш · хато · бўш · муваффақият, устига **«серверда мавжуд эмас» (404)**.
 *
 * Охиргиси мажбурий: продакшн серверда 12 endpoint'дан 9 таси йўқ, шунда ҳам
 * қолган бўлимлар ишлашда давом этиши керак.
 */

export function Skeleton({ height = 180 }: { height?: number }) {
  return (
    <div
      className="sv-card animate-pulse px-4 py-4"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Ma'lumot yuklanmoqda…</span>
      <div className="h-3 w-40 rounded bg-sunken" />
      <div className="mt-3 rounded bg-sunken" style={{ height }} />
    </div>
  );
}

export interface StateBoxProps {
  title: string;
  text?: ReactNode;
  /** Ёнида турадиган ҳаракат тугмаси. */
  action?: ReactNode;
  tone?: "mute" | "crit" | "info";
  icon?: string;
}

function StateBox({ title, text, action, tone = "mute", icon }: StateBoxProps) {
  const accent =
    tone === "crit" ? "var(--crit)" : tone === "info" ? "var(--s1)" : "var(--rule)";
  return (
    <div
      className="sv-card flex flex-col items-center gap-2 px-5 py-8 text-center"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      {icon && (
        <span aria-hidden="true" className="font-mono text-[15px] font-bold" style={{ color: accent }}>
          {icon}
        </span>
      )}
      <p className="text-[13.5px] [font-weight:650] text-ink">{title}</p>
      {text && <p className="max-w-[62ch] text-[12.5px] leading-[1.5] text-ink-2">{text}</p>}
      {action}
    </div>
  );
}

export function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 cursor-pointer rounded-lg border border-rule px-[13px] py-[6px] text-[12px] font-semibold text-ink-2 transition-colors hover:border-[rgba(22,211,255,.4)] hover:text-ink"
    >
      Qayta urinish
    </button>
  );
}

export function NotAvailableState({ what }: { what?: string }) {
  return (
    <StateBox
      icon="—"
      title="Bu bo'lim serverda hali mavjud emas"
      text={
        <>
          Server ushbu so'rovga <b className="font-semibold">404</b> qaytardi
          {what ? ` (${what})` : ""}. Ma'lumot kiritilgach bo'lim o'zi paydo bo'ladi;
          boshqa bo'limlar ishlashda davom etadi.
        </>
      }
    />
  );
}

export function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div role="alert">
      <StateBox
        icon="!"
        tone="crit"
        title="Ma'lumotni yuklab bo'lmadi"
        text={error.message}
        action={<RetryButton onClick={onRetry} />}
      />
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text?: ReactNode }) {
  return <StateBox icon="i" tone="info" title={title} text={text} />;
}

export interface LoaderProps<T> {
  q: QueryResult<T>;
  children: (data: T) => ReactNode;
  /** Скелет баландлиги — саҳифа «сакрамаслиги» учун контентга яқин олинади. */
  height?: number;
  isEmpty?: (data: T) => boolean;
  emptyTitle?: string;
  emptyText?: ReactNode;
  notAvailableWhat?: string;
}

export function Loader<T>({
  q,
  children,
  height = 180,
  isEmpty,
  emptyTitle = "Ushbu davr uchun ma'lumot yo'q",
  emptyText,
  notAvailableWhat,
}: LoaderProps<T>) {
  if (q.notAvailable) return <NotAvailableState what={notAvailableWhat} />;
  if (q.error && q.data === null) return <ErrorState error={q.error} onRetry={q.refetch} />;
  if (q.data === null) return q.loading ? <Skeleton height={height} /> : <Skeleton height={height} />;
  if (isEmpty?.(q.data)) return <EmptyState title={emptyTitle} text={emptyText} />;

  return (
    // Қайта юклашда скелет миллтилламайди: эски натижа жойида қолади,
    // фақат шаффофлик пасаяди.
    <div
      aria-busy={q.refreshing || undefined}
      className={q.refreshing ? "opacity-55 transition-opacity duration-150" : undefined}
    >
      {children(q.data)}
    </div>
  );
}
