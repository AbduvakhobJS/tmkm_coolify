import { useId, useState } from "react";
import { DataTable, type Col, type Row } from "./DataTable";

export interface TableToggleProps {
  cols: Col[];
  rows: Row[];
  /** Accessible name; also used as the table caption. */
  caption: string;
}

/**
 * Every chart ships a table equivalent. Screen-reader users, keyboard users and
 * anyone who needs the exact number get the same data without the SVG.
 */
export function TableToggle({ cols, rows, caption }: TableToggleProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const panelId = `tv-${id}`;

  return (
    <div className="mt-2.5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={
          "cursor-pointer rounded-lg border px-[11px] py-[6px] text-[11.5px] font-semibold transition-colors " +
          (open
            ? "border-s1 bg-[color-mix(in_srgb,var(--s1)_22%,transparent)] text-ink"
            : "border-rule text-ink-2 hover:border-[rgba(22,211,255,.4)] hover:text-ink")
        }
      >
        {open ? "Jadvalni yashirish" : "Jadval ko'rinishi"}
      </button>
      <div id={panelId} hidden={!open} className="mt-2.5">
        {open && <DataTable cols={cols} rows={rows} caption={caption} />}
      </div>
    </div>
  );
}
