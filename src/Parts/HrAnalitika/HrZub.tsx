import React, { useEffect, useMemo, useState } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { C, chartBase, noLegend, fmt } from '../../components/dashboardUI';
import {
    useZupAbsences, useZupDemography, useZupMetrics, useZupMovements,
    useZupOrgStructure, useZupStats, useZupSync,
} from '../../hooks/zupHr';
import type { AgeGroups, OrgUnit } from '../../services/zupHr';
import { GC, alpha, gradient, SERIES_COLORS } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   ZUP HR dashboardi — barcha ko'rsatkichlar `GET /api/hr/*` dan olinadi.

   Namunaviy (mock) ma'lumot ishlatilmaydi: API bo'sh javob bersa yoki barcha
   qiymatlar nol bo'lsa, blok o'z holatini ochiq ko'rsatadi. Bo'sh `data` —
   xato emas, o'sha sana uchun import bo'lmagan holat (cron har kuni 02:00).

   API'da mavjud bo'lmagan bloklar (tug'ilgan kunlar, shtat rejasi,
   vakansiyalar) bu ekranda umuman yo'q — o'ylab topilgan maydon ko'rsatilmaydi.
   ══════════════════════════════════════════════════════════════════════════ */

const ACCENT = GC.blue;

/* ── Sana yordamchilari ── */
const isoDay = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const daysAgo = (n: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return isoDay(d);
};

/** `2026-08-25` → `25.08.2026`. */
const fmtDay = (iso?: string | null): string => {
    if (!iso) return '—';
    const [y, m, d] = iso.slice(0, 10).split('-');
    return y && m && d ? `${d}.${m}.${y}` : '—';
};

/** To'liq ISO timestamp → `25.08.2026 02:00`. */
const fmtStamp = (iso?: string | null): string => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

/* ── Yo'qlik turlari — importda erkin string yoziladi, enum emas ── */
const ABSENCE_LABELS: Record<string, string> = {
    leave: "Ta'til",
    sick_leave: 'Kasallik varaqasi',
    absent_unconfirmed: "Sababsiz yo'qlik",
    unpaid_leave: "O'z hisobidan ta'til",
    maternity_leave: 'Dekret / BiR',
    unknown: "Noma'lum",
};
const absenceLabel = (t: string) => ABSENCE_LABELS[t] ?? t;

const ABSENCE_COLORS: Record<string, string> = {
    leave: GC.blue,
    sick_leave: GC.violet,
    absent_unconfirmed: GC.amber,
    unpaid_leave: GC.cyan,
    maternity_leave: GC.magenta,
    unknown: GC.slate,
};
const absenceColor = (t: string) => ABSENCE_COLORS[t] ?? GC.slate;

const AGE_LABELS: { key: keyof AgeGroups; label: string }[] = [
    { key: 'under_25', label: '25 gacha' },
    { key: '25_30', label: '25–30' },
    { key: '30_35', label: '30–35' },
    { key: '35_40', label: '35–40' },
    { key: '40_45', label: '40–45' },
    { key: '45_50', label: '45–50' },
    { key: '50_plus', label: '50+' },
];
const AGE_COLORS = SERIES_COLORS;

const ABS_LIMIT = 10;

/* ══════════════════════════════════════════════════════════════════════════
   UI bo'laklari
   ══════════════════════════════════════════════════════════════════════════ */

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; id?: string }> = ({ children, style, id }) => (
    <div id={id} style={{
        background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '13px 15px',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        ...style,
    }}>
        {children}
    </div>
);

const SectionHead: React.FC<{ title: string; sub?: string; right?: React.ReactNode }> = ({ title, sub, right }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 11 }}>
        <div style={{ minWidth: 0 }}>
            <div style={{ color: C.text, fontSize: 14.5, fontWeight: 700 }}>{title}</div>
            {sub && <div style={{ color: C.sub, fontSize: 10.5, opacity: 0.65, marginTop: 3 }}>{sub}</div>}
        </div>
        {right}
    </div>
);

const LinkBtn: React.FC<{ children: React.ReactNode; onClick?: () => void; disabled?: boolean }> = ({ children, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            background: `${ACCENT}1f`, border: `1px solid ${ACCENT}55`, color: GC.cyan,
            fontSize: 10.5, fontWeight: 700, padding: '5px 11px', borderRadius: 7,
            cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.45 : 1, flexShrink: 0,
            fontFamily: 'inherit', whiteSpace: 'nowrap',
        }}
    >{children}</button>
);

const KpiTile: React.FC<{ label: string; value: string; note: string; tone: string }> = ({ label, value, note, tone }) => (
    <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: 12, padding: '13px 15px', minWidth: 0,
        background: gradient(tone, 120),
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: `0 6px 18px ${alpha(tone, 0.2)}`,
    }}>
        <div style={{
            position: 'absolute', right: -22, top: -30, width: 108, height: 108, borderRadius: '50%',
            background: 'rgba(255,255,255,0.13)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', color: 'rgba(255,255,255,0.92)', fontSize: 11, fontWeight: 600 }}>{label}</div>
        <div style={{ position: 'relative', color: '#fff', fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginTop: 7 }}>{value}</div>
        <div style={{ position: 'relative', color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 6 }}>{note}</div>
    </div>
);

const StatChip: React.FC<{ label: string; value: string; note: string; tone: string }> = ({ label, value, note, tone }) => (
    <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: 10, padding: '10px 12px', minWidth: 0,
        background: gradient(tone, 125),
        border: '1px solid rgba(255,255,255,0.14)',
    }}>
        <div style={{
            position: 'absolute', right: -18, top: -24, width: 76, height: 76, borderRadius: '50%',
            background: 'rgba(255,255,255,0.12)', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', color: 'rgba(255,255,255,0.92)', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        <div style={{ position: 'relative', color: '#fff', fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginTop: 4 }}>{value}</div>
        <div style={{ position: 'relative', color: 'rgba(255,255,255,0.78)', fontSize: 9, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{note}</div>
    </div>
);

/** Bo'sh javob — xato emas, shunchaki o'sha sana uchun import yo'q. */
const EmptyState: React.FC<{ text: string; height?: number }> = ({ text, height = 110 }) => (
    <div style={{
        minHeight: height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: C.sub, fontSize: 11, opacity: 0.6, textAlign: 'center', padding: 12,
        border: `1px dashed ${C.border}`, borderRadius: 9, lineHeight: 1.5,
    }}>{text}</div>
);

const ErrorState: React.FC<{ text: string; height?: number }> = ({ text, height = 60 }) => (
    <div style={{
        minHeight: height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: C.down, fontSize: 10.5, textAlign: 'center', padding: 10,
        border: `1px dashed ${C.down}55`, background: `${C.down}0d`, borderRadius: 9, lineHeight: 1.5,
    }}>{text}</div>
);

/**
 * Blok holati: yuklanmoqda → xato → bo'sh → ma'lumot.
 * Bo'sh holat `throw` qilinmaydi, oddiy xabar ko'rsatiladi.
 */
const Block: React.FC<{
    loading: boolean; error: unknown; empty: boolean;
    emptyText: string; height?: number; children: React.ReactNode;
}> = ({ loading, error, empty, emptyText, height, children }) => {
    if (loading) return <EmptyState text="Yuklanmoqda…" height={height} />;
    if (error) return <ErrorState text={`API xatosi: ${error instanceof Error ? error.message : "bog'lanib bo'lmadi"}`} height={height} />;
    if (empty) return <EmptyState text={emptyText} height={height} />;
    return <>{children}</>;
};

const centerText = (main: string, sub: string) => ({
    id: 'zupCenter',
    afterDraw(chart: any) {
        const { ctx, chartArea } = chart;
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = (chartArea.top + chartArea.bottom) / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = C.text;
        ctx.font = '700 19px "Segoe UI", sans-serif';
        ctx.fillText(main, cx, cy + 1);
        ctx.fillStyle = C.sub;
        ctx.font = '400 9px "Segoe UI", sans-serif';
        ctx.fillText(sub, cx, cy + 16);
        ctx.restore();
    },
});

const LegendRow: React.FC<{ color: string; label: string; value: string; pct?: string }> = ({ color, label, value, pct }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 10.5 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
        <span style={{ color: C.sub, flex: 1, opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        <span style={{ color: C.text, fontWeight: 700, flexShrink: 0 }}>{value}</span>
        {pct !== undefined && <span style={{ color: C.sub, opacity: 0.65, flexShrink: 0, width: 42, textAlign: 'right' }}>{pct}</span>}
    </div>
);

const th: React.CSSProperties = {
    color: C.sub, fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
    textAlign: 'left', padding: '7px 9px', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap', opacity: 0.75,
};
const td: React.CSSProperties = {
    color: C.text, fontSize: 11, padding: '8px 9px', borderBottom: `1px solid ${C.border}`,
};

const NAV: { id: string; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'movement', label: 'Xodimlar harakati' },
    { id: 'absences', label: "Yo'qliklar" },
    { id: 'demography', label: 'Demografiya' },
    { id: 'employees', label: "Bo'linmalar kesimi" },
    { id: 'org', label: 'Orgstruktura' },
    { id: 'quality', label: "Ma'lumot sifati" },
];

/* ══════════════════════════════════════════════════════════════════════════
   Asosiy komponent
   ══════════════════════════════════════════════════════════════════════════ */

const HrZub: React.FC = () => {
    const today = useMemo(() => isoDay(new Date()), []);
    const from30 = useMemo(() => daysAgo(29), []);

    const [absPage, setAbsPage] = useState(1);

    /* DTO'da e'lon qilingan parametrlargina yuboriladi — `forbidNonWhitelisted`
       tufayli ortiqcha parametr (cache-buster, sort, search) 400 beradi. */
    const metricsQ = useZupMetrics({ date_from: from30, date_to: today, period_type: 'day' });
    const orgQ = useZupOrgStructure();
    const movQ = useZupMovements({ date_from: from30, date_to: today, period_type: 'day', unit_id: 'ALL' });
    const absQ = useZupAbsences({ date_from: from30, date_to: today, page: absPage, limit: ABS_LIMIT });
    const statsQ = useZupStats();
    const sync = useZupSync();

    /* `unit_id: 'ALL'` — allaqachon jami, agregatsiyaga qo'shilmaydi. */
    const allRows = useMemo(
        () => (metricsQ.data?.data ?? []).filter((r) => r.unit_id === 'ALL'),
        [metricsQ.data],
    );
    /* Javob `snapshotDate DESC` — birinchi qator eng so'nggisi. */
    const latest = allRows[0];
    const latestDate = latest?.period;

    /* Demografiya aniq sana bo'yicha ishlaydi (oraliq emas). Bugungi import
       bo'lmagan bo'lishi mumkin, shuning uchun metrics'dagi eng so'nggi
       mavjud snapshot sanasi beriladi. */
    const demoQ = useZupDemography(latestDate);

    const demoAll = useMemo(() => (demoQ.data?.data ?? []).find((d) => d.unit_id === 'ALL'), [demoQ.data]);

    /* Bo'linmalar kesimi — 'ALL' qatorisiz */
    const unitRows = useMemo(
        () => (demoQ.data?.data ?? [])
            .filter((d) => d.unit_id !== 'ALL')
            .map((d) => ({ name: d.unit_name ?? "Noma'lum", male: d.male, female: d.female, total: d.male + d.female }))
            .filter((u) => u.total > 0)
            .sort((a, b) => b.total - a.total),
        [demoQ.data],
    );

    /* ── Ko'rsatkichlar ── */
    const male = demoAll?.male ?? latest?.metrics.male ?? 0;
    const female = demoAll?.female ?? latest?.metrics.female ?? 0;
    /* API'da `headcount` maydoni yo'q — mavjudlaridan hisoblanadi. */
    const headcount = male + female;

    const ageGroups = demoAll?.age_groups ?? latest?.metrics.age_groups;
    const ageTotal = ageGroups ? AGE_LABELS.reduce((s, a) => s + (ageGroups[a.key] ?? 0), 0) : 0;

    const periodTotals = useMemo(() => {
        let hired = 0, terminated = 0;
        for (const r of allRows) { hired += r.metrics.hired ?? 0; terminated += r.metrics.terminated ?? 0; }
        return { hired, terminated };
    }, [allRows]);

    const m = latest?.metrics;
    const absentNow = m
        ? m.on_leave + m.on_sick_leave + m.absent_unconfirmed + m.unpaid_leave + m.maternity_leave
        : 0;

    /* Joriy yo'qlik tarkibi — snapshot metrikalaridan */
    const mix = useMemo(() => {
        if (!m) return [];
        return [
            { type: 'leave', value: m.on_leave },
            { type: 'sick_leave', value: m.on_sick_leave },
            { type: 'absent_unconfirmed', value: m.absent_unconfirmed },
            { type: 'unpaid_leave', value: m.unpaid_leave },
            { type: 'maternity_leave', value: m.maternity_leave },
        ].filter((x) => x.value > 0);
    }, [m]);

    /* Harakat grafigi — javob `snapshotDate ASC`, qayta saralash shart emas */
    const movements = useMemo(
        () => (movQ.data?.data ?? []).filter((x) => x.unit_id === 'ALL' || x.unit_id === null),
        [movQ.data],
    );
    const movementsHaveData = movements.some((x) => (x.hired ?? 0) + (x.terminated ?? 0) > 0);

    /* Yo'qliklar */
    const absences = absQ.data?.data ?? [];
    const absTotal = absQ.data?.pagination.total ?? 0;
    const absPages = Math.max(Math.ceil(absTotal / ABS_LIMIT), 1);

    /* Orgstruktura: tekis ro'yxatdan daraxt. `parent_id === null` yoki
       topilmagan bo'lsa — ildiz. */
    const orgUnits = orgQ.data?.data ?? [];
    const orgTree = useMemo(() => {
        const byId = new Map(orgUnits.map((i) => [i.id, { ...i, children: [] as (OrgUnit & { children: any[] })[] }]));
        const roots: (OrgUnit & { children: any[] })[] = [];
        for (const node of Array.from(byId.values())) {
            const parent = node.parent_id ? byId.get(node.parent_id) : undefined;
            if (parent) parent.children.push(node);
            else roots.push(node);
        }
        return roots;
    }, [orgUnits]);
    const activeUnits = orgUnits.filter((u) => u.is_active).length;

    /* ── Sidebar: scroll-spy ── */
    const [active, setActive] = useState('dashboard');

    useEffect(() => {
        const nodes = NAV
            .map((n) => document.getElementById(`zup-${n.id}`))
            .filter((el): el is HTMLElement => !!el);
        if (!nodes.length) return;
        const obs = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (visible) setActive(visible.target.id.replace('zup-', ''));
            },
            { rootMargin: '-12% 0px -70% 0px', threshold: [0, 0.2, 0.6] },
        );
        nodes.forEach((n) => obs.observe(n));
        return () => obs.disconnect();
    }, []);

    const goTo = (id: string) => {
        document.getElementById(`zup-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActive(id);
    };

    /* Import 1C ga ikkita 30s so'rov yuboradi — tasodifiy bosishdan himoya. */
    const runSync = () => {
        if (sync.isPending) return;
        if (!window.confirm("1C:ZUP dan to'liq import ishga tushirilsinmi? Bu bir necha daqiqa davom etishi mumkin.")) return;
        sync.mutate();
    };

    /* ── Grafiklar ── */
    const donutOpts = { ...chartBase, cutout: '68%', ...noLegend } as any;

    const genderDonut = {
        labels: ['Erkaklar', 'Ayollar'],
        datasets: [{ data: [male, female], backgroundColor: [GC.blue, GC.violet], borderColor: C.cardAlt, borderWidth: 2 }],
    };
    const mixDonut = {
        labels: mix.map((a) => absenceLabel(a.type)),
        datasets: [{ data: mix.map((a) => a.value), backgroundColor: mix.map((a) => absenceColor(a.type)), borderColor: C.cardAlt, borderWidth: 2 }],
    };
    const ageDonut = {
        labels: AGE_LABELS.map((a) => a.label),
        datasets: [{ data: AGE_LABELS.map((a) => ageGroups?.[a.key] ?? 0), backgroundColor: AGE_COLORS, borderColor: C.cardAlt, borderWidth: 2 }],
    };
    const ageBar = {
        labels: AGE_LABELS.map((a) => a.label),
        datasets: [{ data: AGE_LABELS.map((a) => ageGroups?.[a.key] ?? 0), backgroundColor: ACCENT, borderRadius: 4, maxBarThickness: 34 }],
    };
    const unitBar = {
        labels: unitRows.slice(0, 10).map((u) => u.name),
        datasets: [
            { label: 'Erkaklar', data: unitRows.slice(0, 10).map((u) => u.male), backgroundColor: GC.blue, stack: 's', borderRadius: 3, maxBarThickness: 13 },
            { label: 'Ayollar', data: unitRows.slice(0, 10).map((u) => u.female), backgroundColor: GC.violet, stack: 's', borderRadius: 3, maxBarThickness: 13 },
        ],
    };
    const movementLine = {
        labels: movements.map((x) => fmtDay(x.period)),
        datasets: [
            { label: 'Qabul qilingan', data: movements.map((x) => x.hired), borderColor: GC.green, backgroundColor: GC.green, borderWidth: 2, tension: 0.35, pointRadius: 2 },
            { label: "Bo'shatilgan", data: movements.map((x) => x.terminated), borderColor: GC.red, backgroundColor: GC.red, borderWidth: 2, tension: 0.35, pointRadius: 2 },
        ],
    };

    const gridAxis = {
        x: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 9 }, maxRotation: 0, autoSkipPadding: 14 } },
        y: { beginAtZero: true, grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 9 } } },
    };
    const legendTop = {
        legend: { display: true, position: 'top', labels: { color: C.sub, boxWidth: 7, boxHeight: 7, usePointStyle: true, font: { size: 10 } } },
    };
    const lineOpts = { ...chartBase, plugins: legendTop, scales: gridAxis } as any;
    const barOpts = { ...chartBase, ...noLegend, scales: gridAxis } as any;
    const stackedBarOpts = {
        ...chartBase,
        indexAxis: 'y',
        plugins: legendTop,
        scales: {
            x: { stacked: true, beginAtZero: true, grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 9 } } },
            y: { stacked: true, grid: { display: false }, ticks: { color: C.sub, font: { size: 9 }, autoSkip: false } },
        },
    } as any;

    /* Import bor, lekin barcha qiymat nol — bu ham normal holat, shuni aytamiz. */
    const zeroNote = (what: string) =>
        latestDate
            ? `${fmtDay(latestDate)} sanasidagi import mavjud, lekin ${what} bo'yicha barcha qiymatlar 0`
            : `${what} bo'yicha import qilingan ma'lumot yo'q`;

    return (
        <div style={{
            display: 'flex', gap: 12, width: '100%', minHeight: '100%', boxSizing: 'border-box',
            padding: 12, fontFamily: '"Segoe UI", system-ui, sans-serif',
            background: 'var(--gc-panel-bg)', border: '1px solid rgba(14,168,199,0.2)', borderRadius: 12,
        }}>
           {/* ══ Asosiy ustun ══ */}
            <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* ── Sarlavha ── */}
                <Panel style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ color: C.text, fontSize: 19, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>HR-dashbord</div>
                            <div style={{ color: C.sub, fontSize: 11, opacity: 0.65, marginTop: 3 }}>
                                1C:ZUP importidan olingan kadrlar ko'rsatkichlari
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                background: statsQ.data?.lastImport ? `${C.up}12` : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${statsQ.data?.lastImport ? `${C.up}44` : C.border}`,
                                borderRadius: 8, padding: '7px 11px', color: C.text, fontSize: 10.5, whiteSpace: 'nowrap',
                            }}>
                                <span style={{
                                    width: 6, height: 6, borderRadius: '50%',
                                    background: statsQ.data?.lastImport ? C.up : C.sub,
                                    boxShadow: statsQ.data?.lastImport ? `0 0 6px ${C.up}` : 'none',
                                }} />
                                Oxirgi sinxronizatsiya: {fmtStamp(statsQ.data?.lastImport)}
                            </div>
                            <LinkBtn onClick={runSync} disabled={sync.isPending}>
                                {sync.isPending ? 'Sinxronizatsiya…' : 'Sinxronlash'}
                            </LinkBtn>
                        </div>
                    </div>
                    {/* HTTP 200 ≠ muvaffaqiyat: 1C xatosi yutiladi va nollar qaytadi. */}
                    {sync.data && (
                        <div style={{
                            color: sync.data.orgUnits === 0 ? C.down : C.up,
                            fontSize: 10, marginTop: 9, opacity: 0.9,
                        }}>
                            Import natijasi: bo'limlar {sync.data.orgUnits}, snapshotlar {sync.data.snapshots}, yo'qliklar {sync.data.absences}
                            {sync.data.orgUnits === 0 && " — 1C javob bermagan bo'lishi mumkin, quyidagi «1C manba vaqti» o'zgarganini tekshiring"}
                        </div>
                    )}
                    {sync.isError && (
                        <div style={{ color: C.down, fontSize: 10, marginTop: 9 }}>
                            Sinxronizatsiya bajarilmadi: {sync.error instanceof Error ? sync.error.message : 'xato'}
                        </div>
                    )}
                </Panel>

                {/* ── 1. KPI ── */}
                <div id="zup-dashboard" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, scrollMarginTop: 16 }}>
                    <KpiTile
                        label="Faol xodimlar" value={metricsQ.isLoading ? '…' : fmt(headcount, 0)}
                        note={latestDate ? `Holat sanasi: ${fmtDay(latestDate)}` : "Import ma'lumoti yo'q"}
                        tone={GC.blue}
                    />
                    <KpiTile
                        label="Bo'linmalar" value={orgQ.isLoading ? '…' : fmt(activeUnits, 0)}
                        note={`Faol orgstruktura — jami ${fmt(orgUnits.length, 0)}`}
                        tone={GC.green}
                    />
                    <KpiTile
                        label="Erkaklar / Ayollar"
                        value={headcount ? `${fmt(male, 0)} / ${fmt(female, 0)}` : '—'}
                        note={headcount ? `${Math.round(male / headcount * 100)}% / ${Math.round(female / headcount * 100)}%` : "Demografiya ma'lumoti yo'q"}
                        tone={GC.violet}
                    />
                    <KpiTile
                        label="Joriy yo'qliklar" value={metricsQ.isLoading ? '…' : fmt(absentNow, 0)}
                        note="Ta'til, kasallik, dekret va boshqalar"
                        tone={GC.amber}
                    />
                </div>

                {/* ── Operativ HR-svodka ── */}
                <Panel>
                    <SectionHead
                        title="Operativ HR-svodka"
                        sub={`Qabul/bo'shatish — ${fmtDay(from30)} – ${fmtDay(today)}; yo'qliklar — ${fmtDay(latestDate)} holatiga`}
                        right={<LinkBtn onClick={() => goTo('absences')}>Batafsil</LinkBtn>}
                    />
                    <Block
                        loading={metricsQ.isLoading} error={metricsQ.error} empty={!latest}
                        emptyText="Tanlangan davr uchun import qilingan snapshot topilmadi" height={90}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 9 }}>
                            <StatChip label="Qabul qilindi" value={fmt(periodTotals.hired, 0)} note="30 kunlik davr" tone={GC.green} />
                            <StatChip label="Bo'shatildi" value={fmt(periodTotals.terminated, 0)} note={`Balans: ${periodTotals.hired - periodTotals.terminated >= 0 ? '+' : ''}${periodTotals.hired - periodTotals.terminated}`} tone={GC.red} />
                            <StatChip label="Ta'tilda" value={fmt(m?.on_leave ?? 0, 0)} note="To'lanadigan ta'til" tone={GC.blue} />
                            <StatChip label="Kasallik varaqasida" value={fmt(m?.on_sick_leave ?? 0, 0)} note="Kasallik varaqalari" tone={GC.violet} />
                            <StatChip label="Sababsiz yo'qlik" value={fmt(m?.absent_unconfirmed ?? 0, 0)} note="Sabab tasdiqlanmagan" tone={GC.amber} />
                            <StatChip label="O'z hisobidan" value={fmt(m?.unpaid_leave ?? 0, 0)} note="Ish haqi saqlanmasdan" tone={GC.cyan} />
                            <StatChip label="Dekret" value={fmt(m?.maternity_leave ?? 0, 0)} note="Bola parvarishi / BiR" tone={GC.magenta} />
                        </div>
                    </Block>
                </Panel>

                {/* ── 2. Xodimlar harakati ── */}
                <Panel id="zup-movement" style={{ scrollMarginTop: 16 }}>
                    <SectionHead
                        title="Xodimlar harakati"
                        sub="Kunlar kesimida qabul va bo'shatish (unit_id = ALL)"
                        right={<span style={{ color: C.sub, fontSize: 10, opacity: 0.7 }}>{movements.length} kun</span>}
                    />
                    <Block
                        loading={movQ.isLoading} error={movQ.error} empty={!movementsHaveData}
                        emptyText={movements.length ? zeroNote('xodimlar harakati') : "Tanlangan davr uchun harakat yozuvlari yo'q"}
                        height={180}
                    >
                        <div style={{ height: 210 }}><Line data={movementLine} options={lineOpts} /></div>
                    </Block>
                </Panel>

                {/* ── 3. Yo'qliklar ── */}
                <div id="zup-absences" style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 12, scrollMarginTop: 16 }}>
                    <Panel>
                        <SectionHead
                            title="Yo'qliklar" sub="Xodimlar kesimida — oxirgi 30 kun"
                            right={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                                    <span style={{ color: C.sub, fontSize: 10, opacity: 0.7 }}>
                                        {absTotal ? `${absPage} / ${absPages} — jami ${fmt(absTotal, 0)}` : ''}
                                    </span>
                                    <LinkBtn onClick={() => setAbsPage((p) => Math.max(p - 1, 1))} disabled={absPage <= 1 || absQ.isFetching}>‹</LinkBtn>
                                    <LinkBtn onClick={() => setAbsPage((p) => Math.min(p + 1, absPages))} disabled={absPage >= absPages || absQ.isFetching}>›</LinkBtn>
                                </div>
                            }
                        />
                        <Block
                            loading={absQ.isLoading} error={absQ.error} empty={!absences.length}
                            emptyText="Oxirgi 30 kun uchun yo'qlik yozuvlari import qilinmagan" height={150}
                        >
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                                    <thead>
                                        <tr>
                                            <th style={th}>Xodim</th>
                                            <th style={th}>Bo'linma</th>
                                            <th style={th}>Turi</th>
                                            <th style={th}>Boshlanishi</th>
                                            <th style={th}>Tugashi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* `id` null va unikal emas — kompozit key */}
                                        {absences.map((a, i) => (
                                            <tr key={`${a.employee_id}-${a.start_date}-${i}`}>
                                                <td style={{ ...td, fontWeight: 600 }}>{a.employee_name ?? "Noma'lum"}</td>
                                                <td style={{ ...td, color: C.sub, opacity: 0.85 }}>{a.unit_name ?? '—'}</td>
                                                <td style={td}>
                                                    <span style={{
                                                        color: absenceColor(a.absence_type), background: `${absenceColor(a.absence_type)}1c`,
                                                        border: `1px solid ${absenceColor(a.absence_type)}44`,
                                                        fontSize: 9.5, fontWeight: 700, padding: '2px 7px', borderRadius: 5, whiteSpace: 'nowrap',
                                                    }}>{absenceLabel(a.absence_type)}</span>
                                                </td>
                                                <td style={{ ...td, whiteSpace: 'nowrap' }}>{fmtDay(a.start_date)}</td>
                                                <td style={{ ...td, whiteSpace: 'nowrap', color: C.sub }}>{fmtDay(a.end_date)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Block>
                    </Panel>

                    <Panel>
                        <SectionHead title="Yo'qlik tarkibi" sub={latestDate ? `Holat sanasi: ${fmtDay(latestDate)}` : 'Joriy holat'} />
                        <Block
                            loading={metricsQ.isLoading} error={metricsQ.error} empty={!mix.length}
                            emptyText={latest ? zeroNote("yo'qliklar") : "Snapshot topilmadi"} height={150}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                <div style={{ width: 116, height: 116, flexShrink: 0 }}>
                                    <Doughnut data={mixDonut} options={donutOpts} plugins={[centerText(fmt(absentNow, 0), 'kishi')]} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1, minWidth: 0 }}>
                                    {mix.map((a) => (
                                        <LegendRow
                                            key={a.type} color={absenceColor(a.type)} label={absenceLabel(a.type)}
                                            value={fmt(a.value, 0)} pct={`${Math.round(a.value / (absentNow || 1) * 100)}%`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </Block>
                    </Panel>
                </div>

                {/* ── 4. Demografiya ── */}
                <div id="zup-demography" style={{ display: 'grid', gridTemplateColumns: '1fr 330px', gap: 12, scrollMarginTop: 16 }}>
                    <Panel>
                        <SectionHead
                            title="Yosh tarkibi"
                            sub={`Yosh guruhlari bo'yicha — ${fmtDay(demoQ.data?.date ?? latestDate)}`}
                        />
                        <Block
                            loading={demoQ.isLoading || metricsQ.isLoading} error={demoQ.error} empty={ageTotal === 0}
                            emptyText={zeroNote('yosh tarkibi')} height={180}
                        >
                            <div style={{ height: 200 }}><Bar data={ageBar} options={barOpts} /></div>
                            <div style={{ color: C.sub, fontSize: 9.5, opacity: 0.6, marginTop: 7, textAlign: 'center' }}>
                                Jami: {fmt(ageTotal, 0)} xodim
                            </div>
                        </Block>
                    </Panel>
                    <Panel>
                        <SectionHead title="Jinsi bo'yicha" sub="Faol xodimlar" />
                        <Block
                            loading={demoQ.isLoading || metricsQ.isLoading} error={demoQ.error} empty={headcount === 0}
                            emptyText={zeroNote('jinsi')} height={180}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                                <div style={{ width: 116, height: 116, flexShrink: 0 }}>
                                    <Doughnut data={genderDonut} options={donutOpts} plugins={[centerText(fmt(headcount, 0), 'xodim')]} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, minWidth: 0 }}>
                                    <LegendRow color={GC.blue} label="Erkaklar" value={fmt(male, 0)} pct={`${Math.round(male / (headcount || 1) * 100)}%`} />
                                    <LegendRow color={GC.violet} label="Ayollar" value={fmt(female, 0)} pct={`${Math.round(female / (headcount || 1) * 100)}%`} />
                                </div>
                            </div>
                        </Block>
                    </Panel>
                </div>

                {/* ── Yosh guruhlari donut ko'rinishida ── */}
                <Panel>
                    <SectionHead title="Yosh guruhlari ulushi" sub={`Foizlarda — ${fmtDay(demoQ.data?.date ?? latestDate)}`} />
                    <Block
                        loading={demoQ.isLoading || metricsQ.isLoading} error={demoQ.error} empty={ageTotal === 0}
                        emptyText={zeroNote('yosh tarkibi')} height={130}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 130, height: 130, flexShrink: 0 }}>
                                <Doughnut data={ageDonut} options={donutOpts} plugins={[centerText(fmt(ageTotal, 0), 'xodim')]} />
                            </div>
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                gap: '7px 22px', flex: 1, minWidth: 0,
                            }}>
                                {AGE_LABELS.map((a, i) => {
                                    const val = ageGroups?.[a.key] ?? 0;
                                    return (
                                        <LegendRow
                                            key={a.key} color={AGE_COLORS[i]} label={a.label}
                                            value={fmt(val, 0)} pct={`${(val / (ageTotal || 1) * 100).toFixed(1)}%`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </Block>
                </Panel>

                {/* ── 5. Bo'linmalar kesimi ── */}
                <Panel id="zup-employees" style={{ scrollMarginTop: 16 }}>
                    <SectionHead
                        title="Bo'linmalar bo'yicha xodimlar"
                        sub={`Eng yirik 10 ta bo'linma — ${fmtDay(demoQ.data?.date ?? latestDate)}`}
                        right={<span style={{ color: C.sub, fontSize: 10, opacity: 0.7 }}>{unitRows.length} bo'linma</span>}
                    />
                    <Block
                        loading={demoQ.isLoading} error={demoQ.error} empty={!unitRows.length}
                        emptyText="Demografiya javobida bo'linma kesimidagi qatorlar yo'q" height={200}
                    >
                        <div style={{ height: 250 }}><Bar data={unitBar} options={stackedBarOpts} /></div>
                    </Block>
                </Panel>

                {/* ── 6. Orgstruktura ── */}
                <Panel id="zup-org" style={{ scrollMarginTop: 16 }}>
                    <SectionHead
                        title="Orgstruktura"
                        sub="Tekis ro'yxatdan parent_id bo'yicha qurilgan daraxt"
                        right={<span style={{ color: C.sub, fontSize: 10, opacity: 0.7 }}>{fmt(orgUnits.length, 0)} birlik</span>}
                    />
                    <Block
                        loading={orgQ.isLoading} error={orgQ.error} empty={!orgTree.length}
                        emptyText="Orgstruktura importi bo'sh — 1C dan bo'limlar kelmagan" height={140}
                    >
                        <div style={{ maxHeight: 290, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {orgTree.map((root) => (
                                <div key={root.id}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px',
                                        background: 'rgba(255,255,255,0.03)', borderRadius: 7, border: `1px solid ${C.border}`,
                                    }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: root.is_active ? C.up : C.sub, flexShrink: 0 }} />
                                        <span style={{ color: C.text, fontSize: 11.5, fontWeight: 700, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{root.name}</span>
                                        {/* `level` va `parent_id` 1C bermasa null bo'ladi */}
                                        {root.level && <span style={{ color: C.sub, fontSize: 9, opacity: 0.6, flexShrink: 0 }}>{root.level}</span>}
                                        {root.children.length > 0 && (
                                            <span style={{ color: GC.cyan, fontSize: 9.5, fontWeight: 700, flexShrink: 0 }}>{root.children.length} ta</span>
                                        )}
                                    </div>
                                    {root.children.slice(0, 6).map((ch: OrgUnit) => (
                                        <div key={ch.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '5px 9px 5px 26px', color: C.sub, fontSize: 10.5, opacity: 0.8,
                                        }}>
                                            <span style={{ width: 4, height: 4, borderRadius: '50%', background: C.sub, flexShrink: 0 }} />
                                            <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ch.name}</span>
                                            {ch.code && <span style={{ fontSize: 9, opacity: 0.6, flexShrink: 0 }}>{ch.code}</span>}
                                        </div>
                                    ))}
                                    {root.children.length > 6 && (
                                        <div style={{ padding: '3px 9px 5px 26px', color: C.sub, fontSize: 9.5, opacity: 0.55 }}>
                                            va yana {root.children.length - 6} ta…
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Block>
                </Panel>

                {/* ── 7. Ma'lumot sifati ── */}
                <Panel id="zup-quality" style={{ scrollMarginTop: 16 }}>
                    <SectionHead title="Ma'lumot sifati" sub="Import holati — GET /api/hr/stats. Cron har kuni 02:00 da ishlaydi" />
                    <Block
                        loading={statsQ.isLoading} error={statsQ.error} empty={!statsQ.data}
                        emptyText="Import statistikasi olinmadi" height={80}
                    >
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 9 }}>
                            {[
                                { label: 'Snapshotlar', value: fmt(statsQ.data?.totalSnapshots ?? 0, 0), color: GC.blue },
                                { label: "Yo'qlik yozuvlari", value: fmt(statsQ.data?.totalAbsences ?? 0, 0), color: GC.violet },
                                { label: 'Orgstruktura birliklari', value: fmt(statsQ.data?.totalOrgUnits ?? 0, 0), color: GC.green },
                                { label: 'Oxirgi import (DB)', value: fmtStamp(statsQ.data?.lastImport), color: GC.cyan },
                                { label: '1C manba vaqti', value: fmtStamp(statsQ.data?.sourceUpdatedAt), color: GC.amber },
                            ].map((s) => (
                                <div key={s.label} style={{
                                    background: `${s.color}0f`, border: `1px solid ${s.color}33`, borderRadius: 9, padding: '10px 12px', minWidth: 0,
                                }}>
                                    <div style={{ color: s.color, fontSize: 9.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                                    <div style={{ color: C.text, fontSize: 14, fontWeight: 700, marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.value}</div>
                                </div>
                            ))}
                        </div>
                    </Block>
                </Panel>
            </main>
        </div>
    );
};

export default HrZub;
