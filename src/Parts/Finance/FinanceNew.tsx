import React, { useMemo, useState } from 'react';
import { C } from '../../components/dashboardUI';
import { GC } from '../../theme/palette';
import { useFinanceDashboard } from '../../hooks/finance';
import type { FinanceDashboardData, FinanceRow } from '../../services/finance';
import {useNavigate} from "react-router-dom";

/* ══════════════════════════════════════════════════════════════════════════
   MOLIYAVIY VAZIYAT MARKAZI

   Butun ekran BITTA endpointdan quriladi:
     GET /finance-report/dashboard
   (hujjat: FINANCIAL_DASHBOARD_API.md)

   Hujjatdan kelib chiqadigan muhim qoidalar:
     • endpoint PARAMETR QABUL QILMAYDI va har doim bir xil oylik to'plamni
       qaytaradi — bu bo'lim davr tanlagichiga bog'lanmaydi (2-, 4-bo'lim);
     • `months[]` da YIL YO'Q — ekranda ham yil ko'rsatilmaydi (4-bo'lim);
     • oylararo o'zgarish (%) TAYYOR KELMAYDI — oxirgi ikki qiymatdan
       hisoblanadi (6-bo'lim);
     • tarkib bloklaridagi ulush foizi ham TAYYOR KELMAYDI — `qism/jami×100`
       frontendda hisoblanadi (5-bo'lim);
     • barcha pul qatorlari MING SO'MDA, `margin` esa nisbat (×100 kerak),
       `currentRatio`/`debtToEquity` — birliksiz nisbat (3.3-bo'lim);
     • oylar soni qattiq 7 deb faraz qilinmaydi — massiv uzunligi ishlatiladi
       (9.7-bo'lim).

   Namunaviy (mock) ma'lumot YO'Q: API bermagan blok bo'sh qoladi.
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Ikonkalar ── */
const NeonIcon: React.FC<{ color?: string; size?: number; children: React.ReactNode }> = ({ size = 34, children }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(145deg, ${GC.icon}40, ${GC.icon}12)`,
        border: `1.3px solid ${GC.icon}70`,
        color: GC.icon,
    }}>
        {children}
    </div>
);

const IconDollar = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        <path d="M12 5.5v13M15.5 8.3c0-1.3-1.4-2.3-3.5-2.3-2.3 0-3.7 1.1-3.7 2.6 0 3.4 7.2 1.7 7.2 5.1 0 1.6-1.6 2.8-4 2.8-2.1 0-3.7-1-4-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconWalletFilled = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6.5" width="18" height="13" rx="2.4" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16.6" cy="14" r="1.5" fill="currentColor" />
        <path d="M6.5 6.5l3-3.5h6l2.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconPercentBadge = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="6" stroke="currentColor" strokeWidth="1.4" opacity="0.35" />
        <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8.3" cy="8.3" r="2.1" fill="currentColor" />
        <circle cx="15.7" cy="15.7" r="2.1" fill="currentColor" />
    </svg>
);
const IconArrowUpDown = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M7 3v18M7 3L3.5 6.5M7 3l3.5 3.5M17 21V3M17 21l3.5-3.5M17 21l-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconLayers = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M12 3l9 5-9 5-9-5 9-5z" fill="currentColor" opacity="0.85" />
        <path d="M3 13l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 17l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" opacity="0.6" />
    </svg>
);
const IconScale = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v18M8 21h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 7h6M14 7h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 7l-2.5 5a2.5 2.5 0 005 0L4 7zM20 7l-2.5 5a2.5 2.5 0 005 0L20 7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="12" cy="3" r="1.3" fill="currentColor" />
    </svg>
);

/* ── Raqam formatlash ── */
const fmtNum = (n: number, d = 0): string => {
    const s = Math.abs(n).toFixed(d);
    const [int, dec] = s.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const sign = n < 0 ? '-' : '';
    return dec !== undefined ? `${sign}${grouped},${dec}` : `${sign}${grouped}`;
};
const fmtPct = (n: number) => `${fmtNum(n, 1)}%`;

const deltaColor = (n: number) => (n < 0 ? GC.red : GC.green);
const deltaArrow = (n: number) => (n < 0 ? '▼' : '▲');

/* KPI trend chizig'i — barcha kartalarda bir xil ko'k (og'ishni faqat delta
   badge'i qizil/yashil bilan ko'rsatadi). */
const TREND_COLOR = GC.accent1;

/* Tarkib segmentlari bitta ko'k oiladan, "Boshqa" toifalar neytral rangda. */
const SEG_RAMP = ['#1D4ED8', GC.accent1, GC.accent2, GC.accent3];
const OTHER_KEYS = new Set(['otherNonCurrent', 'otherCurrent', 'otherReserves']);

/* ── Kalit → ekranda ko'rsatiladigan nom ──
   Backend `label` ni kirill o'zbekchada beradi ("Тушум"). Ilovaning qolgan
   qismi lotin yozuvida, shuning uchun ko'rsatish nomi shu yerda belgilanadi;
   kalit lug'atda bo'lmasa backend bergan `label` ishlatiladi. */
const LABELS: Record<string, string> = {
    revenue: 'Tushum',
    profit: 'Hisobot davri foydasi',
    margin: 'Sof foyda marjasi',
    netCash: 'Sof pul oqimi',
    assetsTotal: 'Jami aktivlar',
    assetsCurrent: 'Joriy aktivlar',
    assetsNonCurrent: 'Uzoq muddatli aktivlar',
    liabTotal: 'Jami majburiyatlar',
    liabCurrent: 'Joriy majburiyatlar',
    liabNonCurrent: 'Uzoq muddatli majburiyatlar',
    equityAndLiab: 'Kapital va majburiyatlar',
    equityTotal: 'Jami kapital',
    buildInProgress: 'Tugallanmagan qurilish',
    subsidiaryInvest: "Sho'ba korx. invest.",
    fixedAssets: 'Asosiy vositalar',
    otherNonCurrent: 'Boshqa',
    receivables: "Debitorlik va to'lovlar",
    inventories: 'Tovar-moddiy zaxiralar',
    cash: "Pul mablag'lari",
    otherCurrent: 'Boshqa',
    charterCapital: 'Ustav kapitali',
    retainedEarnings: 'Taqsimlanmagan foyda',
    otherReserves: 'Boshqa zaxiralar',
    currentRatio: 'Joriy likvidlik koeffitsienti',
    debtToEquity: 'Qarz / kapital koeffitsienti',
    cfOperating: 'Operatsion faoliyatdan pul oqimi',
    cfInvesting: 'Investitsion faoliyatdan pul oqimi',
    cfFinancing: 'Moliyaviy faoliyatdan pul oqimi',
    cashEquivalents: "Davr oxiridagi pul mablag'lari",
};

/* Oy nomlari kirillda keladi — sparkline yorlig'i uchun lotincha qisqartma. */
const MONTH_SHORT: Record<string, string> = {
    'Январь': 'Yanv', 'Февраль': 'Fev', 'Март': 'Mar', 'Апрель': 'Apr',
    'Май': 'May', 'Июнь': 'Iyn', 'Июль': 'Iyl', 'Август': 'Avg',
    'Сентябрь': 'Sen', 'Октябрь': 'Okt', 'Ноябрь': 'Noy', 'Декабрь': 'Dek',
};

/* ── Qiymat yordamchilari ── */
const num = (v: unknown): number | null =>
    typeof v === 'number' && Number.isFinite(v) ? v : null;

/** `values[]` dan faqat haqiqiy sonlar (`null` va `"..."` tashlanadi). */
const cleanValues = (row?: FinanceRow): number[] | null => {
    if (!row || !Array.isArray(row.values)) return null;
    const list = row.values.map(num).filter((x): x is number => x !== null);
    return list.length > 0 ? list : null;
};

const lastOf = (a: number[] | null): number | null => (a && a.length ? a[a.length - 1] : null);
const prevOf = (a: number[] | null): number | null => (a && a.length > 1 ? a[a.length - 2] : null);

/**
 * Oylararo o'zgarish, % (hujjat 6-bo'limi).
 * Oldingi qiymat musbat bo'lmasa `null` — chunki nol yoki manfiy bazadan
 * hisoblangan foiz ma'nosiz bo'ladi (masalan `netCash` ishorasi almashganda
 * o'sish "−132%" bo'lib chiqadi).
 */
const deltaPct = (a: number[] | null): number | null => {
    const l = lastOf(a), p = prevOf(a);
    if (l === null || p === null || p <= 0) return null;
    return ((l - p) / p) * 100;
};

/** `margin` uchun — foiz punktidagi farq (hujjat 6-bo'limi). */
const deltaPp = (a: number[] | null): number | null => {
    const l = lastOf(a), p = prevOf(a);
    return l === null || p === null ? null : (l - p) * 100;
};

/** Koeffitsientlar uchun — oddiy ayirma (birliksiz nisbat). */
const deltaAbs = (a: number[] | null): number | null => {
    const l = lastOf(a), p = prevOf(a);
    return l === null || p === null ? null : l - p;
};

/* ── Ekran modeli ── */
type Seg = { label: string; pct: number; color: string };
type CompositionItem = { label: string; value: string; segs: Seg[] };

function buildView(data?: FinanceDashboardData) {
    const rows = Array.isArray(data?.rows) ? data!.rows! : [];
    /* Hujjat tartibga tayanmaslikni tavsiya qiladi — kalit bo'yicha qidiramiz. */
    const byKey = new Map<string, FinanceRow>(rows.map((r) => [r.key, r]));
    const series = (key: string) => cleanValues(byKey.get(key));

    const months = (Array.isArray(data?.months) ? data!.months! : [])
        .map((m) => MONTH_SHORT[m] ?? m);

    /** Tarkib bloki: jami + qismlar (ulush foizi shu yerda hisoblanadi). */
    const composition = (totalKey: string, partKeys: string[]): CompositionItem | null => {
        const total = lastOf(series(totalKey));
        if (total === null || total === 0) return null;

        const segs: Seg[] = [];
        partKeys.forEach((k, i) => {
            const v = lastOf(series(k));
            if (v === null) return;
            segs.push({
                label: LABELS[k] ?? byKey.get(k)?.label ?? k,
                pct: +((v / total) * 100).toFixed(0),
                color: OTHER_KEYS.has(k) ? GC.slate : SEG_RAMP[i % SEG_RAMP.length],
            });
        });
        if (segs.length === 0) return null;

        return {
            label: LABELS[totalKey] ?? byKey.get(totalKey)?.label ?? totalKey,
            value: fmtNum(total),
            segs,
        };
    };

    const marginSeries = series('margin');

    return {
        months,
        /* Yuqoridagi 4 ta plitka (hujjat, 5-bo'lim). */
        vitals: {
            revenue: { series: series('revenue'), delta: deltaPct(series('revenue')) },
            profit: { series: series('profit'), delta: deltaPct(series('profit')) },
            /* `margin` nisbat sifatida keladi — ko'rsatishdan oldin ×100. */
            margin: {
                series: marginSeries ? marginSeries.map((x) => x * 100) : null,
                delta: deltaPp(marginSeries),
            },
            netCash: { series: series('netCash'), delta: deltaPct(series('netCash')) },
        },
        /* "Pul oqimi tarkibi" — `netCash` uch faoliyat bo'yicha yig'indisi
           (hujjatning 3.1-bo'limidagi 29 ta kalitdan to'rttasi shu yerda
           birinchi marta ishlatiladi: avval faqat `netCash` ko'rsatilar edi). */
        cashFlow: {
            cfOperating: { series: series('cfOperating'), delta: deltaPct(series('cfOperating')) },
            cfInvesting: { series: series('cfInvesting'), delta: deltaPct(series('cfInvesting')) },
            cfFinancing: { series: series('cfFinancing'), delta: deltaPct(series('cfFinancing')) },
            cashEquivalents: { series: series('cashEquivalents'), delta: deltaPct(series('cashEquivalents')) },
        },
        /* "Moliyaviy holat" tarkib bloklari. */
        composition: [
            composition('assetsTotal', ['assetsCurrent', 'assetsNonCurrent']),
            composition('liabTotal', ['liabCurrent', 'liabNonCurrent']),
            composition('equityAndLiab', ['equityTotal', 'liabTotal']),
            composition('assetsNonCurrent', ['buildInProgress', 'subsidiaryInvest', 'fixedAssets', 'otherNonCurrent']),
            composition('assetsCurrent', ['receivables', 'inventories', 'cash', 'otherCurrent']),
            composition('equityTotal', ['charterCapital', 'retainedEarnings', 'otherReserves']),
        ].filter((x): x is CompositionItem => x !== null),
        /* Koeffitsientlar. Yorliqlar ("Kuchli likvidlik") backenddan kelmaydi —
           bu chegaralar frontend/biznes qaroridir. */
        ratios: [
            (() => {
                const s = series('currentRatio');
                const v = lastOf(s);
                if (v === null) return null;
                return {
                    label: LABELS.currentRatio, value: fmtNum(v, 2), delta: deltaAbs(s),
                    tag: v > 2 ? 'Kuchli likvidlik (>2)' : v >= 1 ? "Me'yorda" : 'Past likvidlik',
                };
            })(),
            (() => {
                const s = series('debtToEquity');
                const v = lastOf(s);
                if (v === null) return null;
                return {
                    label: LABELS.debtToEquity, value: fmtNum(v, 2), delta: deltaAbs(s),
                    tag: v < 1 ? 'Past leveraj' : v <= 2 ? "O'rtacha leveraj" : 'Yuqori leveraj',
                };
            })(),
        ].filter((x): x is { label: string; value: string; delta: number | null; tag: string } => x !== null),
    };
}

/* ── Nuqtalar orqali silliq (Catmull-Rom) egri chiziq ── */
const smoothPath = (pts: [number, number][]): string => {
    if (pts.length < 3) return `M${pts.map((p) => p.join(',')).join(' L')}`;
    const smoothing = 0.2;
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] || pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;
        const cp1x = p1[0] + (p2[0] - p0[0]) * smoothing;
        const cp1y = p1[1] + (p2[1] - p0[1]) * smoothing;
        const cp2x = p2[0] - (p3[0] - p1[0]) * smoothing;
        const cp2y = p2[1] - (p3[1] - p1[1]) * smoothing;
        d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }
    return d;
};

/* ── Bo'lim sarlavhasi ── */
const SectionTitle: React.FC<{ title: string; hint?: string }> = ({ title, hint }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '4px 0 2px' }}>
        <span style={{ color: C.text, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {title}
        </span>
        {hint && <span style={{ marginLeft: 'auto', color: C.sub, fontSize: 10.5 }}>{hint}</span>}
    </div>
);

/* ── Karta ichidagi maydonli (area) trend grafik ── */
const AreaTrend: React.FC<{
    data: number[]; color: string; labels: string[]; height?: number; fmtV?: (n: number) => string;
}> = ({ data, color, labels, height = 46, fmtV = fmtNum }) => {
    const w = 260, h = height, padTop = 4, padBottom = 14;
    const plotH = h - padTop - padBottom;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const x = (i: number) => (data.length === 1 ? w / 2 : (i / (data.length - 1)) * w);
    const y = (v: number) => padTop + plotH - ((v - min) / range) * plotH;
    const points: [number, number][] = data.map((v, i) => [x(i), y(v)]);
    const linePath = smoothPath(points);
    const areaPath = `${linePath} L${w},${padTop + plotH} L0,${padTop + plotH} Z`;
    const gradId = `grad-fin-${color.replace('#', '')}`;
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);

    const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        if (!rect.width) return;
        const relX = ((e.clientX - rect.left) / rect.width) * w;
        let nearest = 0, bestDist = Infinity;
        data.forEach((_, i) => { const dist = Math.abs(x(i) - relX); if (dist < bestDist) { bestDist = dist; nearest = i; } });
        setHoverIdx(nearest);
    };

    const hovered = hoverIdx !== null;
    const hx = hovered ? x(hoverIdx as number) : 0;
    const hy = hovered ? y(data[hoverIdx as number]) : 0;
    const tooltipAbove = hy > h * 0.4;

    return (
        <div style={{ position: 'relative', width: '100%' }} onMouseMove={handleMove} onMouseLeave={() => setHoverIdx(null)}>
            <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
                <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.45" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={areaPath} fill={`url(#${gradId})`} />
                <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {hovered && (
                    <line x1={hx} y1={padTop} x2={hx} y2={padTop + plotH} stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity={0.55} />
                )}
                {labels.map((m, i) => (
                    <text key={`${m}-${i}`} x={x(i)} y={h - 2} fontSize="7.5" fill={hoverIdx === i ? color : C.sub}
                          textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}>{m}</text>
                ))}
            </svg>
            {/* Chiziqdagi nuqtalar — SVG `preserveAspectRatio="none"` ni cho'zib
                yuborgani uchun HTML qatlamida chiziladi (shunda aniq dumaloq). */}
            {data.map((v, i) => (
                <span key={i} style={{
                    position: 'absolute',
                    left: `${(x(i) / w) * 100}%`,
                    top: `${(y(v) / h) * 100}%`,
                    width: hoverIdx === i ? 8 : 6,
                    height: hoverIdx === i ? 8 : 6,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    background: color,
                    pointerEvents: 'none',
                }} />
            ))}
            {hovered && (
                <div style={{
                    position: 'absolute', left: `${(hx / w) * 100}%`, top: `${(hy / h) * 100}%`,
                    transform: `translate(-50%, ${tooltipAbove ? '-130%' : '20%'})`,
                    background: '#0a0f1df2', border: `1px solid ${GC.icon}99`, borderRadius: 6,
                    padding: '3px 8px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 20,
                    textAlign: 'center',
                }}>
                    <div style={{ color: C.sub, fontSize: 8, fontWeight: 600, textTransform: 'uppercase' }}>
                        {labels[hoverIdx as number] ?? ''}
                    </div>
                    <div style={{ color: C.text, fontSize: 11, fontWeight: 700 }}>{fmtV(data[hoverIdx as number])}</div>
                </div>
            )}
        </div>
    );
};

/* ── KPI kartasi ── */
const KpiTile: React.FC<{
    label: string; value: string; unit?: string; delta?: number | null; deltaUnit?: string;
    icon: React.ReactNode; color: string; trend?: number[] | null; labels: string[];
    fmtV?: (n: number) => string;
}> = ({ label, value, unit, delta, deltaUnit = '%', icon, color, trend, labels, fmtV }) => (
    <div style={{ minWidth: 0, minHeight: 0, background: `${C.card}`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '10px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <NeonIcon color={color} size={24}>{icon}</NeonIcon>
                <span style={{ color: C.sub, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
            </div>
            {delta !== undefined && delta !== null && (
                <div style={{ color: deltaColor(delta), fontSize: 10.5, fontWeight: 700, flexShrink: 0, background: `${deltaColor(delta)}1a`, borderRadius: 6, padding: '2px 6px' }}>
                    {deltaArrow(delta)} {fmtNum(Math.abs(delta), 1)}{deltaUnit}
                </div>
            )}
        </div>
        <div style={{ color: C.text, fontSize: 19, fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {value}{unit && <span style={{ color: C.sub, fontSize: 10, fontWeight: 400, marginLeft: 3 }}>{unit}</span>}
        </div>
        {trend && trend.length > 1 && <AreaTrend data={trend} color={color} labels={labels} fmtV={fmtV} />}
    </div>
);

/* ── Nisbat kartasi ── */
const RatioTile: React.FC<{ label: string; value: string; delta?: number | null; icon: React.ReactNode; color: string; tag?: string }> = ({ label, value, delta, icon, color, tag }) => (
    <div style={{ minWidth: 0, background: `${C.card}`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <NeonIcon color={color} size={24}>{icon}</NeonIcon>
                <span style={{ color: C.sub, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
            </div>
            {delta !== undefined && delta !== null && (
                <div style={{ color: deltaColor(delta), fontSize: 10.5, fontWeight: 700, flexShrink: 0, background: `${deltaColor(delta)}1a`, borderRadius: 6, padding: '2px 6px' }}>
                    {deltaArrow(delta)} {fmtNum(Math.abs(delta), 2)}
                </div>
            )}
        </div>
        <span style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>{value}</span>
        {tag && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600, color: C.sub, background: C.cardAlt, padding: '3px 9px', borderRadius: 6, alignSelf: 'flex-start' }}>✓ {tag}</span>}
    </div>
);

/* ── Tarkib kartasi (stacked-bar + izohlar) ── */
const CompositionTile: React.FC<{ item: CompositionItem }> = ({ item }) => (
    <div style={{ minWidth: 0, background: `${C.card}`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
            <NeonIcon size={24}><IconLayers /></NeonIcon>
            <span style={{ color: C.sub, fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
        </div>
        <div style={{ color: C.text, fontSize: 15.5, fontWeight: 700 }}>{item.value}</div>
        <div style={{ display: 'flex', height: 10, borderRadius: 4, overflow: 'hidden', background: C.cardAlt }}>
            {item.segs.filter((s) => s.pct > 0).map((s) => (
                <div key={s.label} style={{ width: `${s.pct}%`, background: s.color }} />
            ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {item.segs.map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 8.5 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ color: C.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{s.label}</span>
                    <span style={{ color: C.text, fontWeight: 600, flexShrink: 0 }}>{s.pct}%</span>
                </div>
            ))}
        </div>
    </div>
);

/** Ma'lumot kelmagan joyda bo'sh kartochka — soxta raqam ko'rsatilmaydi. */
const EmptyTile: React.FC = () => (
    <div style={{
        minWidth: 0, background: `${C.card}`, border: `1px solid ${C.border}`,
        borderRadius: 13, padding: '10px 12px', minHeight: 96,
    }} />
);

/* ══════════════════════════════════════════════════════════════════════════ */
const FinanceNew: React.FC = () => {
    const { data } = useFinanceDashboard();
    const v = useMemo(() => buildView(data), [data]);
    let navigate = useNavigate();
    const { revenue, profit, margin, netCash } = v.vitals;
    const { cfOperating, cfInvesting, cfFinancing, cashEquivalents } = v.cashFlow;
    const money = (s: number[] | null) => {
        const l = lastOf(s);
        return l === null ? '' : fmtNum(l);
    };

    /* Tarkib bloklari + koeffitsientlar — jami 8 ta katak. Ma'lumot yetmasa
       o'rni bo'sh kartochka bilan to'ldiriladi (setka buzilmasin). */
    const gridCells = v.composition.length + v.ratios.length;
    const emptyCells = Math.max(0, 8 - gridCells);

    return (
        <div style={{
            background: C.bg,
            height: '100%',
            overflowY: 'auto',
            padding: 14,
            boxSizing: 'border-box',
            fontFamily: '"Segoe UI", system-ui, sans-serif',
            display: 'flex', flexDirection: 'column', gap: 10,
        }}>
            {/* Sarlavha. Hujjatning 4-bo'limi: manbada yil yo'q, shuning uchun
                bu yerda ham yil ko'rsatilmaydi — faqat oylar oralig'i. */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ width: "100%" }}>
                    <div style={{ color: C.text, fontSize: 'clamp(14px, 3.4cqmin, 14px)', fontWeight: 700, width: "100%", letterSpacing: 0.4, textTransform: 'uppercase' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: "100%", alignItems: 'center', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div>
                                    <div style={{ color: 'rgb(241, 242, 246)', fontSize: 14, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>   Moliyaviy vaziyat markazi</div>
                                </div>
                            </div>

                            <div style={{
                                background: C.card, border: `1px solid ${C.border}`, borderRadius: 'clamp(4px, 1.1cqmin, 8px)',
                                padding: '4px 10px', color: C.text,
                                fontSize: '9px', display: 'flex', gap: 6, whiteSpace: 'nowrap',
                                cursor: 'pointer',
                            }}
                                 onClick={() => navigate("/main/iframe/fin")}
                            >Batafsil
                            </div>
                        </div>
                    </div>
                    <div style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>
                        {v.months.length > 0 ? `${v.months[0]} – ${v.months[v.months.length - 1]}` : ''}
                        {v.months.length > 0 && ' · '}ming so'm
                    </div>
                </div>
            </div>

            {/* Vitals — yuqoridagi 4 ta plitka */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <KpiTile label={LABELS.revenue} value={money(revenue.series)} icon={<IconDollar />} color={TREND_COLOR}
                         delta={revenue.delta} trend={revenue.series} labels={v.months} />
                <KpiTile label={LABELS.profit} value={money(profit.series)} icon={<IconWalletFilled />} color={TREND_COLOR}
                         delta={profit.delta} trend={profit.series} labels={v.months} />
                <KpiTile label={LABELS.margin}
                         value={lastOf(margin.series) === null ? '' : fmtPct(lastOf(margin.series) as number)}
                         icon={<IconPercentBadge />} color={TREND_COLOR}
                         delta={margin.delta} deltaUnit=" p.p." trend={margin.series} labels={v.months} fmtV={fmtPct} />
                <KpiTile label={LABELS.netCash} value={money(netCash.series)} icon={<IconArrowUpDown />} color={TREND_COLOR}
                         delta={netCash.delta} trend={netCash.series} labels={v.months} />
            </div>

            {/* Moliyaviy holat */}
            <SectionTitle title="Moliyaviy holat" hint="tarkib · ulush bo'yicha" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {v.composition.map((item) => <CompositionTile key={item.label} item={item} />)}
                {v.ratios.map((r) => (
                    <RatioTile key={r.label} label={r.label} value={r.value} delta={r.delta}
                               icon={<IconScale />} color={GC.accent1} tag={r.tag} />
                ))}
                {Array.from({ length: emptyCells }, (_, i) => <EmptyTile key={`bo'sh-${i}`} />)}
            </div>

            {/* Pul oqimi tarkibi — hujjatning 29 ta barqaror kalitidan avval
                ekranda ko'rsatilmagan to'rttasi ("cfOperating"/"cfInvesting"/
                "cfFinancing"/"cashEquivalents"): yuqoridagi "Sof pul oqimi"
                shu uchta faoliyat yig'indisi, "cashEquivalents" esa davr
                oxiridagi qoldiq. Panelning qolgan bo'sh joyini to'ldirishi
                uchun bu bo'lim (sarlavha + kartalar) flex:1 bilan pastgacha
                cho'ziladi — kartalar konteynerning tagigacha yetadi. */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0 }}>
                <SectionTitle title="Pul oqimi tarkibi" hint="pul oqimi hisoboti bo'yicha" />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, flex: 1, minHeight: 0 }}>
                    <KpiTile label={LABELS.cfOperating} value={money(cfOperating.series)} icon={<IconArrowUpDown />} color={TREND_COLOR}
                             delta={cfOperating.delta} trend={cfOperating.series} labels={v.months} />
                    <KpiTile label={LABELS.cfInvesting} value={money(cfInvesting.series)} icon={<IconArrowUpDown />} color={TREND_COLOR}
                             delta={cfInvesting.delta} trend={cfInvesting.series} labels={v.months} />
                    <KpiTile label={LABELS.cfFinancing} value={money(cfFinancing.series)} icon={<IconArrowUpDown />} color={TREND_COLOR}
                             delta={cfFinancing.delta} trend={cfFinancing.series} labels={v.months} />
                    <KpiTile label={LABELS.cashEquivalents} value={money(cashEquivalents.series)} icon={<IconWalletFilled />} color={TREND_COLOR}
                             delta={cashEquivalents.delta} trend={cashEquivalents.series} labels={v.months} />
                </div>
            </div>
        </div>
    );
};

export default FinanceNew;
