import { useSyncExternalStore } from "react";

/**
 * Дашборд ўз логин экранига эга эмас: у хост илова (`LoginPage` → `PrivateRoute`)
 * сеансидан фойдаланади ва токенни `localStorage` дан ўқийди.
 *
 * Калит — `tmk-token-bgs`: `LoginPage` логиндан кейин айнан шуни ёзади ва
 * `production-report` API шу токен билан ишлайди (қаранг:
 * `src/services/production.ts`).
 *
 * Бошқа калит (`tmk-token`) атайин ўқилмайди: у бошқа хизматники
 * (`situation.uzkmt.uz`, қаранг: `src/services/hr.ts`). Уни биринчи бўлиб
 * синаб кўриш саҳифа очилиши билан 401 берарди, интерфейс «сеанс тугади»
 * ҳолатига тушарди ва фойдаланувчи «Қайта уриниш» ни босишга мажбур бўларди.
 *
 * Хост қийматни `Bearer eyJ…` кўринишида сақлайди — префикс олиб ташланади,
 * чунки `Authorization` сарлавҳасини `api/client.ts` ўзи ясайди.
 */
const KEYS = ["tmk-token-bgs"] as const;

const listeners = new Set<() => void>();

/**
 * Ўқилган токен кэшланади: `useSyncExternalStore` `getSnapshot` ни тез-тез
 * чақиради, у эса ҳар сафар бир хил стринг қайтариши шарт — акс ҳолда React
 * чексиз қайта рендер қилади.
 */
let cached: string | null | undefined;

/**
 * `401` олган токен. Хостнинг калитини ўчириб бўлмайди (у бизники эмас ва
 * уни ўчириш бутун иловани тизимдан чиқариб юборарди), шунинг учун ярамас
 * қиймат шу ерда эсланади: хост янги токен ёзгунича дашборд «сеанс тугади»
 * ҳолатида туради ва сўровларни бекорга такрорламайди.
 */
let rejected: string | null = null;

function emit(): void {
  cached = undefined;
  listeners.forEach((l) => l());
}

/** Бегона калитлар (хостнинг бошқа ҳолати) бекорга қайта рендер қилмасин. */
function onStorage(e: StorageEvent): void {
  if (e.key === null || (KEYS as readonly string[]).includes(e.key)) emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Бошқа табда қайта логин қилинса, `storage` ҳодисаси шу ойнага келади —
  // кэшни бекор қилиб қайта ўқиймиз.
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

/** `Bearer …` префикси ва ортиқча бўшлиқлар олиб ташланади. */
function normalize(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim().replace(/^Bearer\s+/i, "").trim();
  return t.length > 0 ? t : null;
}

/**
 * `localStorage` нинг **ўзига мурожаат** cookie ўчирилган браузерда
 * `SecurityError` беради, шунинг учун ўқиш ҳам, олиш ҳам битта `try` ичида.
 */
function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readToken(): string | null {
  for (const key of KEYS) {
    const t = normalize(read(key));
    if (t && t !== rejected) return t;
  }
  return null;
}

/** Жорий токен (топилмаса `null`). */
export function getToken(): string | null {
  if (cached === undefined) cached = readToken();
  return cached;
}

/**
 * `401` дан кейин чақирилади: жорий қиймат ярамас деб белгиланади, шунда
 * интерфейс «сеансга қайта киринг» ҳолатига ўтади. Хостнинг `localStorage`
 * калитига тегилмайди.
 */
export function invalidateToken(): void {
  rejected = cached ?? readToken();
  emit();
}

/** Токен ўзгарса интерфейс ўзи янгиланади — алоҳида редирект керак эмас. */
export function useAuthToken(): string | null {
  return useSyncExternalStore(subscribe, getToken, () => null);
}
