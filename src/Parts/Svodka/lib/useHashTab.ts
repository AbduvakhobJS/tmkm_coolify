import { useCallback, useEffect, useState } from "react";
import type { TabId } from "../types";

export const TABS: { id: TabId; label: string }[] = [
  { id: "obzor", label: "Umumiy ko'rsatkichlar" },
  { id: "prod", label: "Ishlab chiqarish" },
  { id: "sgp", label: "Sotish va qoldiqlar (SGP)" },
  { id: "energy", label: "Elektr energiya" },
  { id: "h2", label: "Vodorod va gaz" },
  { id: "cist", label: "Sisterna va yuklar" },
  { id: "ogarok", label: "Ogarok" },
  { id: "ing", label: "Ingichka IOF" },
];

const IDS = new Set<string>(TABS.map((t) => t.id));

const fromHash = (): TabId => {
  const h = typeof window === "undefined" ? "" : window.location.hash.slice(1);
  return IDS.has(h) ? (h as TabId) : "obzor";
};

/**
 * Tab state lives in the URL hash so a panel can be linked to and the browser
 * back button behaves. `hashchange` is an external system, hence the effect.
 */
export function useHashTab(): [TabId, (t: TabId) => void] {
  const [tab, setTab] = useState<TabId>(fromHash);

  useEffect(() => {
    const onHash = () => setTab(fromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const select = useCallback((t: TabId) => {
    setTab(t);
    if (window.location.hash.slice(1) !== t) {
      window.history.replaceState(null, "", "#" + t);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return [tab, select];
}
