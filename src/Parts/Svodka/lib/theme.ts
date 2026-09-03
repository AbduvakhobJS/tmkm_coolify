import { useSyncExternalStore } from "react";
import { GC } from '../../../theme/palette';

/**
 * Chart libraries need concrete colours, not `var(--x)` strings, so the active
 * palette is read from the document once per theme change and shared through
 * `useSyncExternalStore`. Subscribes to both theme triggers: the OS colour
 * scheme and the `data-theme` attribute override.
 */
const TOKENS = [
  "s1",
  "s2",
  "s3",
  "ink",
  "ink-2",
  "ink-3",
  "grid",
  "rule",
  "sunken",
  "surface",
  "surface-2",
  "page",
  "good",
  "warn",
  "crit",
  "good-ink",
  "warn-ink",
  "crit-ink",
] as const;

export type TokenName = (typeof TOKENS)[number];
export type Palette = Record<TokenName, string>;

/** Стандарт (қоронғи) палитра — `svodka.css` даги қийматлар билан бир хил. */
const FALLBACK: Palette = {
  s1: GC.blue,
  s2: GC.amber,
  s3: GC.green,
  ink: "#ffffff",
  "ink-2": "#b9c2cb",
  "ink-3": "#7d8892",
  grid: "#242b32",
  rule: "#333c44",
  sunken: "#11161b",
  surface: "#161b20",
  "surface-2": "#1c2229",
  page: "#0a0d10",
  good: GC.green,
  warn: GC.amber,
  crit: GC.red,
  "good-ink": GC.green,
  "warn-ink": GC.amber,
  "crit-ink": GC.red,
};

/**
 * Токенлар `:root` да эмас, дашборд илдизида (`.svodka-dash`) эълон қилинган —
 * номлари жуда умумий бўлгани учун хостнинг ўзгарувчилари билан аралашмасин
 * (қаранг: `svodka.css`). Шунинг учун ҳисобланган қийматлар ўша элементдан
 * ўқилади.
 */
function read(): Palette {
  if (typeof window === "undefined") return FALLBACK;
  const root = document.querySelector(".svodka-dash");
  if (!root) return FALLBACK;
  const cs = getComputedStyle(root);
  const out = {} as Palette;
  for (const t of TOKENS) {
    const v = cs.getPropertyValue("--" + t).trim();
    out[t] = v || FALLBACK[t];
  }
  return out;
}

let snapshot: Palette = FALLBACK;
let initialised = false;
const listeners = new Set<() => void>();

function refresh(): void {
  const next = read();
  const changed = TOKENS.some((t) => next[t] !== snapshot[t]);
  if (changed) {
    snapshot = next;
    listeners.forEach((l) => l());
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined") {
    mq?.addEventListener("change", refresh);
    observer?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    // Биринчи `getSnapshot` рендер вақтида чақирилади — у пайтда `.svodka-dash`
    // ҳали DOM'да йўқ ва fallback қайтади. `subscribe` эса commit'дан кейин
    // ишлайди, шунинг учун ҳақиқий палитра айнан шу ерда ўқилади.
    refresh();
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      mq?.removeEventListener("change", refresh);
      observer?.disconnect();
    }
  };
}

const mq =
  typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
const observer = typeof window !== "undefined" ? new MutationObserver(refresh) : null;

function getSnapshot(): Palette {
  if (!initialised && typeof window !== "undefined") {
    initialised = true;
    snapshot = read();
  }
  return snapshot;
}

export function usePalette(): Palette {
  return useSyncExternalStore(subscribe, getSnapshot, () => FALLBACK);
}
