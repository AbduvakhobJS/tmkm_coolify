import React, { useMemo, useState } from 'react';
import { C, fmt } from '../../components/dashboardUI';
import { useProductionFilters, useProductionNarastayka } from '../../hooks/production';
import type { NarastaykaRow } from '../../services/production';
import { GC, alpha } from '../../theme/palette';

/* ── Sana yordamchilari ── */

const addDays = (iso: string, days: number): string => {
    const d = new Date(`${iso}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
};

const fmtDateDots = (iso: string): string => {
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
};

const naturalCompare = (a: string, b: string): number =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

/* ── Guruhlash mantiqi ──
   API "process" (Изготовление/Передача/...) va "zavod" (Ингичка/Чирчик завод)
   maydonlarini alohida bermaydi — ular `factory` va `product` matnidan
   ajratib olinadi. */

const KNOWN_CATEGORIES = ['Изготовление', 'Передача', 'Выпуск', 'Получение', 'Ввод', 'Сдача'];

function extractCategory(product: string, hasFactory: boolean): string {
    const fallback = hasFactory ? 'Не определено' : "Noma'lum process";
    if (!product) return fallback;
    const afterDot = product.includes('.') ? product.slice(product.indexOf('.') + 1).trim() : product.trim();
    const firstWord = (afterDot.split(/\s+/)[0] || '').replace(/[.,:;]+$/, '');
    const match = KNOWN_CATEGORIES.find((c) => c.toLowerCase() === firstWord.toLowerCase());
    return match ?? fallback;
}

function extractZavod(factory: string): { zavod: string; cex: string } {
    if (!factory) return { zavod: "Noma'lum zavod", cex: "Noma'lum seh" };
    if (/цех|гтц|рму/i.test(factory)) return { zavod: 'Чирчик завод', cex: factory };
    if (factory.trim().toLowerCase() === 'ингичка') return { zavod: 'Ингичка', cex: factory };
    return { zavod: factory, cex: factory };
}

type Tile = {
    key: string;
    factory: string;
    product: string;
    shortName: string;
    unit: string;
    current: number;
    previous: number;
};

type CategoryGroup = { category: string; tiles: Tile[] };
type CexGroup = { cex: string; count: number; categories: CategoryGroup[] };
type ZavodGroup = { zavod: string; cexList: CexGroup[] };

function sumByKey(rows: NarastaykaRow[]) {
    const map = new Map<string, { factory: string; product: string; shortName: string; unit: string; sum: number }>();
    for (const r of rows) {
        const factory = r.factory || '';
        const product = r.product || '';
        const key = `${factory}||${product || r.short_name || ''}`;
        const existing = map.get(key);
        if (existing) {
            existing.sum += r.fakt || 0;
        } else {
            map.set(key, { factory, product, shortName: r.short_name || '', unit: r.unit || '', sum: r.fakt || 0 });
        }
    }
    return map;
}

function buildTiles(current: NarastaykaRow[], previous: NarastaykaRow[]): Tile[] {
    const curMap = sumByKey(current);
    const prevMap = sumByKey(previous);
    const keys = new Set<string>([...curMap.keys(), ...prevMap.keys()]);
    return Array.from(keys).map((key) => {
        const c = curMap.get(key);
        const p = prevMap.get(key);
        const src = (c ?? p)!;
        return {
            key,
            factory: src.factory,
            product: src.product,
            shortName: src.shortName,
            unit: src.unit,
            current: c?.sum ?? 0,
            previous: p?.sum ?? 0,
        };
    });
}

const ZAVOD_ORDER = ['Чирчик завод', 'Ингичка'];

const ZAVOD_ACCENTS: Record<string, string> = {
    'Чирчик завод': GC.cyan,
    'Ингичка': GC.violet,
    "Noma'lum zavod": GC.amber,
};
const FALLBACK_ACCENTS = [GC.green, GC.magenta, GC.blue, GC.amber];
const zavodAccent = (zavod: string, idx: number): string => ZAVOD_ACCENTS[zavod] ?? FALLBACK_ACCENTS[idx % FALLBACK_ACCENTS.length];

function buildStructure(tiles: Tile[]): ZavodGroup[] {
    const zavodMap = new Map<string, Map<string, Map<string, Tile[]>>>();

    for (const t of tiles) {
        const { zavod, cex } = extractZavod(t.factory);
        const category = extractCategory(t.product || t.shortName, !!t.factory);

        if (!zavodMap.has(zavod)) zavodMap.set(zavod, new Map());
        const cexMap = zavodMap.get(zavod)!;
        if (!cexMap.has(cex)) cexMap.set(cex, new Map());
        const catMap = cexMap.get(cex)!;
        if (!catMap.has(category)) catMap.set(category, []);
        catMap.get(category)!.push(t);
    }

    const zavods: ZavodGroup[] = Array.from(zavodMap.entries()).map(([zavod, cexMap]) => {
        const cexList: CexGroup[] = Array.from(cexMap.entries())
            .map(([cex, catMap]) => {
                const categories: CategoryGroup[] = Array.from(catMap.entries())
                    .map(([category, catTiles]) => ({
                        category,
                        tiles: catTiles.sort((a, b) => b.current - a.current),
                    }))
                    .sort((a, b) => b.tiles.length - a.tiles.length);
                const count = categories.reduce((s, c) => s + c.tiles.length, 0);
                return { cex, count, categories };
            })
            .sort((a, b) => naturalCompare(a.cex, b.cex));
        return { zavod, cexList };
    });

    return zavods.sort((a, b) => {
        if (a.zavod === "Noma'lum zavod") return 1;
        if (b.zavod === "Noma'lum zavod") return -1;
        const ia = ZAVOD_ORDER.indexOf(a.zavod);
        const ib = ZAVOD_ORDER.indexOf(b.zavod);
        if (ia === -1 && ib === -1) return a.zavod.localeCompare(b.zavod);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
    });
}

/* ── UI qismlari ── */

const NeonIcon: React.FC<{ color?: string; size?: number; children: React.ReactNode }> = ({ size = 28, children }) => (
    <div style={{
        width: size, height: size, borderRadius: size >= 28 ? 10 : 8, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${GC.icon}33, ${GC.icon}0a)`,
        border: `1px solid ${GC.icon}66`,
        boxShadow: `0 0 12px ${GC.icon}55, inset 0 0 8px ${GC.icon}22`,
        color: GC.icon,
    }}>
        {children}
    </div>
);

const IconFactory = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 21V11l5 3.5V11l5 3.5V9l6 4v8H3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
);

const IconChart = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const StatChip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px', whiteSpace: 'nowrap' }}>
        <span style={{ color: C.sub, fontSize: 10.5 }}>{label}:</span>
        <span style={{ color: C.text, fontSize: 11.5, fontWeight: 700 }}>{value}</span>
    </div>
);

const DeltaBadge: React.FC<{ current: number; previous: number }> = ({ current, previous }) => {
    const pct = previous === 0 ? (current === 0 ? 0 : 100) : ((current - previous) / previous) * 100;
    const isZero = Math.abs(pct) < 0.05;
    const isUp = pct > 0;
    const color = isZero ? C.sub : isUp ? C.up : C.down;
    const arrow = isZero ? '●' : isUp ? '▲' : '▼';
    const magnitude = fmt(Math.abs(pct), 1);
    const label = isZero ? `${magnitude}%` : `${isUp ? '+' : ''}${magnitude}%`;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 8 }}>{arrow}</span>{label}
        </span>
    );
};

const ProductTile: React.FC<{ tile: Tile }> = ({ tile }) => {
    const title = tile.shortName || tile.product || '—, —';
    return (
        <div
            style={{ background: `${C.cardAlt}4d`, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', minWidth: 0, transition: 'border-color 0.15s ease, transform 0.15s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'none'; }}
        >
            <div style={{ color: C.sub, fontSize: 10.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={title}>
                {title}
            </div>
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, marginTop: 4 }}>{fmt(tile.current, 2)}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: 10.5, gap: 6 }}>
                <span style={{ color: C.sub, whiteSpace: 'nowrap' }}>Songi 30 kun</span>
                <DeltaBadge current={tile.current} previous={tile.previous} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2, fontSize: 10.5, gap: 6 }}>
                <span style={{ color: C.sub, whiteSpace: 'nowrap' }}>Avvalgi 30 kun</span>
                <span style={{ color: C.text, fontWeight: 600 }}>{fmt(tile.previous, 2)}</span>
            </div>
        </div>
    );
};

/* Har bir toifa (Получение / Выпуск / Передача / ...) alohida ustun bo'lib,
   ustunlar bir-biriga nisbatan gorizontal joylashadi; har ustun ichida
   kartalar vertikal ravishda pastga qarab tizilib boradi. */
const DEFAULT_VISIBLE_TILES = 1;

const CategoryCard: React.FC<{ group: CategoryGroup; expanded: boolean; accent: string }> = ({ group, expanded, accent }) => {
    const visible = expanded ? group.tiles : group.tiles.slice(0, DEFAULT_VISIBLE_TILES);
    const hiddenCount = group.tiles.length - visible.length;
    return (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 10px', minWidth: 190, flex: '1 1 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: accent, boxShadow: `0 0 6px ${accent}aa`, flexShrink: 0 }} />
                    <span style={{ color: C.text, fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.category}</span>
                </div>
                <span style={{ color: C.sub, fontSize: 10, flexShrink: 0 }}>{group.tiles.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {visible.map((t) => <ProductTile key={t.key} tile={t} />)}
            </div>
            {hiddenCount > 0 && (
                <div style={{ color: C.sub, fontSize: 10, textAlign: 'center', marginTop: 6 }}>
                    + yana {hiddenCount} ta
                </div>
            )}
        </div>
    );
};

const DEFAULT_VISIBLE_CATEGORIES = 3;

const CexCard: React.FC<{ group: CexGroup; expanded: boolean; accent: string }> = ({ group, expanded, accent }) => {
    const visibleCategories = expanded ? group.categories : group.categories.slice(0, DEFAULT_VISIBLE_CATEGORIES);
    const hiddenCategories = group.categories.length - visibleCategories.length;
    return (
        <div
            style={{
                background: `linear-gradient(160deg, ${C.cardAlt}, ${C.card})`,
                border: `1px solid ${accent}40`,
                borderRadius: 12,
                padding: '10px 12px',
                minWidth: 0,
                boxShadow: `0 0 16px ${accent}22, inset 0 0 22px ${accent}0a`,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 22px ${accent}33, inset 0 0 24px ${accent}14`; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 0 16px ${accent}22, inset 0 0 22px ${accent}0a`; }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: accent, fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, textShadow: `0 0 10px ${accent}66` }}>{group.cex}</span>
                <span style={{ color: accent, fontSize: 10.5, background: `${accent}18`, border: `1px solid ${accent}44`, borderRadius: 999, padding: '2px 9px', fontWeight: 700 }}>{group.count}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {visibleCategories.map((cg) => <CategoryCard key={cg.category} group={cg} expanded={expanded} accent={accent} />)}
            </div>
            {/*{hiddenCategories > 0 && (*/}
            {/*    <div style={{ color: C.sub, fontSize: 10, textAlign: 'center', marginTop: 6 }}>*/}
            {/*        + yana {hiddenCategories} ta toifa*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
};

const ZavodSection: React.FC<{ group: ZavodGroup; expanded: boolean; accent: string; compact?: boolean }> = ({ group, expanded, accent, compact }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <NeonIcon color={accent} size={compact ? 24 : 28}><IconFactory /></NeonIcon>
            <span style={{ color: accent, fontSize: compact ? 12.5 : 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, textShadow: `0 0 14px ${accent}66` }}>{group.zavod}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: compact ? 'repeat(auto-fit, minmax(220px, 1fr))' : 'repeat(3, 1fr)', gap: 10 }}>
            {group.cexList.map((c) => <CexCard key={c.cex} group={c} expanded={expanded} accent={accent} />)}
        </div>
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <div
        onClick={() => onChange(!checked)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none', background: C.card, border: `1px solid ${C.border}`, borderRadius: 999, padding: '6px 10px' }}
    >
        <span style={{ color: C.text, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
        <div style={{
            width: 34, height: 18, borderRadius: 999, flexShrink: 0, position: 'relative',
            background: checked ? C.up : 'rgba(255,255,255,0.14)',
            border: `1px solid ${checked ? C.up : C.border}`,
            boxShadow: checked ? `0 0 10px ${C.up}77` : 'none',
            transition: 'background 0.15s ease, box-shadow 0.15s ease',
        }}>
            <div style={{
                position: 'absolute', top: 1, left: checked ? 17 : 1, width: 14, height: 14, borderRadius: '50%',
                background: '#fff', transition: 'left 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }} />
        </div>
    </div>
);

const StateBox: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.sub }) => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
        <div style={{ color, fontSize: 13 }}>{children}</div>
    </div>
);

/* ── Asosiy sahifa ── */

const ProductionPage: React.FC = () => {
    const { data: filtersRes, isLoading: filtersLoading, isError: filtersError } = useProductionFilters();
    const dateRangeMax = filtersRes?.data?.dateRange?.max;

    const { curStart, curEnd, prevStart, prevEnd } = useMemo(() => {
        if (!dateRangeMax) return {} as Record<string, string>;
        const curEndV = dateRangeMax;
        const curStartV = addDays(curEndV, -29);
        const prevEndV = addDays(curStartV, -1);
        const prevStartV = addDays(prevEndV, -29);
        return { curStart: curStartV, curEnd: curEndV, prevStart: prevStartV, prevEnd: prevEndV };
    }, [dateRangeMax]);

    const { data, isLoading: dataLoading, isError: dataError } = useProductionNarastayka(curStart, curEnd, prevStart, prevEnd);

    const zavods = useMemo(() => {
        if (!data) return [];
        return buildStructure(buildTiles(data.current, data.previous));
    }, [data]);

    const totalTiles = useMemo(
        () => zavods.reduce((s, z) => s + z.cexList.reduce((s2, c) => s2 + c.count, 0), 0),
        [zavods]
    );

    const loading = filtersLoading || dataLoading;
    const error = filtersError || dataError;

    const [expanded, setExpanded] = useState(false);

    const primaryZavod = zavods.find((z) => z.zavod === 'Чирчик завод');
    const secondaryZavods = zavods.filter((z) => z !== primaryZavod);

    return (
        <div style={{ background: C.bg, minHeight: '100vh', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <NeonIcon color={GC.cyan} size={30}><IconChart /></NeonIcon>
                    <div style={{ color: GC.cyan, fontSize: 17, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', textShadow: `0 0 14px ${alpha(GC.cyan, 0.4)}` }}>Narastayka — Fakt</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {curStart && curEnd && prevStart && prevEnd && (
                        <>
                            <StatChip label="So'nggi 30" value={`${fmtDateDots(curStart)} – ${fmtDateDots(curEnd)}`} />
                            <StatChip label="Avvalgi 30" value={`${fmtDateDots(prevStart)} – ${fmtDateDots(prevEnd)}`} />
                            <StatChip label="Material" value={String(totalTiles)} />
                            <StatChip label="Zavod" value={String(zavods.length)} />
                        </>
                    )}
                    <ToggleSwitch checked={expanded} onChange={setExpanded} label="Barcha kartalar" />
                </div>
            </div>

            {loading && <StateBox>Ma'lumotlar yuklanmoqda…</StateBox>}
            {!loading && error && <StateBox color={C.down}>Ma'lumotlarni yuklashda xatolik yuz berdi.</StateBox>}
            {!loading && !error && zavods.length === 0 && <StateBox>Tanlangan davr uchun ma'lumot topilmadi.</StateBox>}

            {!loading && !error && primaryZavod && (
                <ZavodSection group={primaryZavod} expanded={expanded} accent={zavodAccent(primaryZavod.zavod, 0)} />
            )}

            {!loading && !error && secondaryZavods.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                    {secondaryZavods.map((z, idx) => (
                        <ZavodSection key={z.zavod} group={z} expanded={expanded} accent={zavodAccent(z.zavod, idx + 1)} compact />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductionPage;
