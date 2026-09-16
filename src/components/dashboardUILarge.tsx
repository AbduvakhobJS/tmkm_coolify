import React from 'react';
import type { Plugin } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { C, Delta, fmt, chartBase, noLegend } from './dashboardUI';
import { GC, alpha } from '../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   "LARGE STYLE" — dashboardUI.tsx dagi bazaviy komponentlarning kattaroq
   shriftli varianti. Katta ekranlarda (4096x2060 kabi) o'qilishi oson bo'lsin
   uchun ishlatiladi.

   Ataylab ALOHIDA fayl: `dashboardUI.tsx` o'nlab boshqa dashboardlarda
   (Finance, ESG, GRR, ...) ham ishlatiladi — shu yerdagi o'zgarish faqat
   buni import qilgan componentlarga tegadi, qolganlariga tegmaydi.
   ══════════════════════════════════════════════════════════════════════════ */

/** `BigCard` sarlavhasining aniq uslubi — yagona manba. Boshqa fayllar
 *  (FinanceNew, ESG, EnterExitMain, GRR) o'z mahalliy "karta sarlavhasi"
 *  komponentlarida ham AYNAN shu obyektni ishlatadi, shunda font o'lchami,
 *  rangi va og'irligi hamma joyda bir xil bo'lib qoladi — ikkinchi joyda
 *  qayta yozilmaydi. */
export const bigCardTitleStyle: React.CSSProperties = {
    color: C.text,
    fontSize: 'clamp(18px, 3.6cqmin, 18px)',
    fontWeight: 700,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
};

export const BigCard: React.FC<{ title?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, children, style }) => (
    <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 'clamp(6px, 1.6cqmin, 12px)',
        padding: 'clamp(8px, 1.8cqmin, 14px)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        containerType: 'size',
        containerName: 'card',
        ...style,
    }}>
        {title && (
            <div style={{ ...bigCardTitleStyle, marginBottom: 'clamp(4px, 1.4cqmin, 10px)' }}>{title}</div>
        )}
        {children}
    </div>
);

export const BigKpiCard: React.FC<{
    title: string; value: string; delta?: number | null; iconColor?: string;
    /** Namuna ma'lumot — sariq ramka (`bigDemoCardStyle` bilan bir xil rang). */
    demo?: boolean;
}> = ({ title, value, delta, iconColor = GC.accent1, demo }) => (
    <div style={{
        flex: 1, minWidth: 0, background: C.card, border: `1px solid ${demo ? `${GC.amber}73` : C.border}`,
        borderLeft: `3px solid ${iconColor}`,
        borderRadius: 12, padding: 'clamp(8px, 1.6cqmin, 14px) clamp(10px, 2.2cqmin, 18px)',
    }}>
        <div style={{
            color: C.sub, fontSize: 'clamp(13px, 3cqmin, 19px)', marginBottom: 'clamp(4px, 1cqmin, 8px)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'space-between' }}>
            <span style={{ color: C.text, fontSize: 'clamp(20px, 4.6cqmin, 32px)', fontWeight: 700 }}>{value}</span>
            <Delta v={delta} />
        </div>
    </div>
);

/** Chart.js `scales` — kattaroq tick shrifti bilan. */
export const axisLarge = (opts: any = {}) => ({
    x: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 13 } }, ...(opts.x || {}) },
    y: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 13 } }, ...(opts.y || {}) },
});

/** Chart.js `plugins.legend` — kattaroq legend shrifti bilan. */
export const legendLarge = (position: 'top' | 'bottom' = 'top') => ({
    legend: {
        display: true, position,
        labels: { color: C.sub, boxWidth: 10, boxHeight: 10, usePointStyle: true, font: { size: 12 } },
    },
});

/** `DashRoot`ning kattaroq varianti — `dashboardUI.tsx` dagi bazaviyni
 *  o'zgartirmaslik uchun bu yerda alohida komponent sifatida beriladi. */
export const BigDashRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{
        background: 'var(--gc-panel-bg)',
        padding: 'clamp(8px, 2cqmin, 16px)',
        border: '1px solid rgba(14,168,199,0.2)',
        borderRadius: '12px',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        fontFamily: '"Segoe UI", system-ui, sans-serif',
        containerType: 'size',
        containerName: 'dash-root',
    }}>
        {children}
    </div>
);

/** `barLabel`ning kattaroq shriftli varianti (bazaviysini o'zgartirmaslik
 *  uchun alohida) — bar ustidagi qiymat yorlig'i.
 *
 *  Ustunlar ko'p bo'lganda (masalan bir necha oy) label matni qo'shni ustun
 *  ustiga chiqib, bir-birining ustiga yozilib qolishi mumkin edi — endi har
 *  bir label o'z ustuni kengligiga sig'maydigan bo'lsa chizilmaydi, sonlar
 *  soni o'zgarganda ham (kelajakda ham) bu qayta buzilmaydi. */
export const bigBarLabel = (d = 1): Plugin<'bar'> => ({
    id: 'bigBarLabel',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        ctx.save();
        ctx.fillStyle = C.text;
        ctx.font = '700 12px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        meta.data.forEach((el: any, idx: number) => {
            const v = chart.data.datasets[0].data[idx] as number | null;
            if (v === null || v === undefined) return;
            const text = fmt(v, d);
            const textWidth = ctx.measureText(text).width;
            if (textWidth > (el.width ?? Infinity) * 1.7) return;
            /* Bar cho'qqisi grafikning tepasiga juda yaqin bo'lsa (baland
               ustun), label bar ICHIGA tushiriladi — aks holda karta
               chegarasidan tashqariga chiqib, tick label bilan qoplanib
               ketardi. */
            const topLimit = chart.chartArea?.top ?? 0;
            const y = el.y - 8 < topLimit + 10 ? el.y + 14 : el.y - 8;
            ctx.fillText(text, el.x, y);
        });
        ctx.restore();
    },
});

export const bigHeaderTitle: React.CSSProperties = {
    color: C.text, textTransform: 'uppercase', fontSize: 'clamp(20px, 4.8cqmin, 36px)', fontWeight: 700,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
};

export const bigHeaderPill: React.CSSProperties = {
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 'clamp(4px, 1.1cqmin, 8px)',
    padding: 'clamp(5px, 1.4cqmin, 11px) clamp(8px, 2.2cqmin, 16px)',
    color: C.text, fontSize: 'clamp(12px, 2.6cqmin, 18px)', whiteSpace: 'nowrap', flexShrink: 0,
};

export const bigChip: React.CSSProperties = {
    fontSize: 'clamp(12px, 2.4cqmin, 16px)', color: C.text, background: C.cardAlt,
    border: `1px solid ${C.border}`, borderRadius: 4, padding: '3px 8px', whiteSpace: 'nowrap',
};

export const bigFooter: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', color: C.sub,
    fontSize: 'clamp(11px, 2.2cqmin, 15px)', paddingTop: 'clamp(3px, 1cqmin, 7px)', flexShrink: 0, gap: 8,
};

/* ── "Aylana chartni scale qil" — donut/pie kartalar uchun ──
   Standart namuna: chart o'ralgan div `flex:1, minHeight:0` bo'lib kartaning
   BOR bo'shlig'ini to'ldiradi (fixed px o'lcham YO'Q), markaziy matn va pastki
   ro'yxat kattaroq shriftda. Boshqa donut/pie kartalarni ham shu naqshga
   moslashtirilganda ishlatiladi. */

/** `centerText`ning kattaroq shriftli varianti (dashboardUI.tsx dagi bazaviy
 *  `centerText`ni o'zgartirmaslik uchun ataylab alohida). */
export const bigCenterText = (main: string, sub: string): Plugin<'doughnut'> => ({
    id: 'bigCenterText',
    afterDraw(chart) {
        const { ctx, chartArea } = chart;
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = (chartArea.top + chartArea.bottom) / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = C.text;
        ctx.font = '700 17px "Segoe UI", sans-serif';
        ctx.fillText(main, cx, cy - 4);
        ctx.fillStyle = C.sub;
        ctx.font = '400 18px "Segoe UI", sans-serif';
        ctx.fillText(sub, cx, cy + 15);
        ctx.restore();
    },
});

/** Nom + rang nuqtasi + qiymat qatori, YIRIK shriftda — donut yonidagi
 *  ro'yxat uchun ishlab chiqilgan, lekin istalgan "nom/rang + qiymat" ro'yxati
 *  uchun umumiy ishlatiladi (masalan stansiyalar, obyektlar ro'yxati). */
export const BigLabelRow: React.FC<{ label: string; value: string; sub?: string; color?: string }> = ({ label, value, sub, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', fontSize: 'clamp(16px, 3.8cqmin, 24px)', lineHeight: 1.25 }}>
        {color && <span style={{ width: 13, height: 13, borderRadius: '50%', background: color, marginRight: 9, flexShrink: 0 }} />}
        <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        <span style={{ color: C.text, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>{value}</span>
        {sub && <span style={{ color: C.sub, flexShrink: 0, marginLeft: 6, fontSize: '0.72em' }}>{sub}</span>}
    </div>
);

/** `BigLabelRow`ning ikki qatorli varianti — nom, rang, qiymat va foiz BITTA
 *  qatorga sig'may qolgan joylarda (masalan nomi uzun + qiymat + foiz birga):
 *  nom yuqorida, qiymat (va foiz) pastki qatorda. */
export const BigLabelStack: React.FC<{ label: string; value: string; sub?: string; color?: string }> = ({ label, value, sub, color }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 'clamp(12px, 2.8cqmin, 17px)', lineHeight: 1.3 }}>
        {color && <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, marginTop: '0.3em', flexShrink: 0 }} />}
        <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ color: C.text, fontWeight: 700 }}>{value}</span>
                {sub && <span style={{ color: C.sub, fontSize: '0.8em' }}>{sub}</span>}
            </div>
        </div>
    </div>
);

/** Donut chart o'raladigan konteyner — fixed o'lcham yo'q, ajratilgan qatorning
 *  bor bo'shlig'ini egallaydi ("aylana kattaroq" talabi shu yerda hal bo'ladi). */
export const bigDonutBoxStyle: React.CSSProperties = { flex: 1, minHeight: 0, minWidth: 0, height: '100%', position: 'relative' };

/* ══════════════════════════════════════════════════════════════════════════
   KO'P KARTALI EKRANLAR UCHUN YORDAMCHILAR (FinanceNewMain, SingleTreasury)

   6 ustun × 4 qatorli to'rdagi kichik kataklarga moslangan: donut + yorliqlar,
   grafik qobig'i, o'q sozlamalari va AI prognozlari ro'yxati. Ikki va undan
   ortiq ekranda aynan bir xil ishlatilgani uchun shu yerda bir marta yozilgan.
   ══════════════════════════════════════════════════════════════════════════ */

/** API'da yo'q, namuna ma'lumotli kartalar uchun sariq ramka. */
export const bigDemoCardStyle: React.CSSProperties = { border: `1px solid ${GC.amber}73` };

const groupNum = (n: number, d = 0): string => {
    const s = Math.abs(n).toFixed(d);
    const [int, dec] = s.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const sign = n < 0 ? '-' : '';
    return dec !== undefined ? `${sign}${grouped},${dec}` : `${sign}${grouped}`;
};

/** Katta qiymatni qisqartiradi: 97 600 000 → "97,6 mln". */
export const fmtCompact = (n: number): string => {
    const a = Math.abs(n);
    if (a >= 1e9) return `${groupNum(n / 1e9, 1)} mlrd`;
    if (a >= 1e6) return `${groupNum(n / 1e6, 1)} mln`;
    if (a >= 1e3) return `${groupNum(n / 1e3, 0)} ming`;
    return groupNum(n, 0);
};

/** Guruhlangan son, vergulli o'nlik: 1234.5 → "1 234,5". */
export const fmtGrouped = groupNum;

/** Chart.js `scales` — `axisLarge` bilan bir xil rang, kichik kataklar uchun
 *  12px. `money` — katta qiymatlarni qisqartiradi, `decimals` — o'nlik xonalar. */
export const bigScales = (o: { horizontal?: boolean; stacked?: boolean; money?: boolean; decimals?: number; beginAtZero?: boolean } = {}) => {
    const valueTicks = {
        color: C.sub, font: { size: 12 },
        ...(o.money ? { callback: (v: any) => fmtCompact(Number(v)) } : {}),
        ...(o.decimals !== undefined ? { callback: (v: any) => groupNum(Number(v), o.decimals) } : {}),
    };
    const valueAxis = { grid: { color: C.grid }, ticks: valueTicks, beginAtZero: o.beginAtZero ?? true, stacked: !!o.stacked };
    const catAxis = { grid: { display: false }, ticks: { color: C.sub, font: { size: 11 } }, stacked: !!o.stacked };
    return o.horizontal ? { x: valueAxis, y: catAxis } : { x: catAxis, y: valueAxis };
};

/** Grafik qobig'i — kartaning qolgan balandligini egallaydi. */
export const BigChartBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
);

export type BigPart = { label: string; value: number; color: string };

/** Chapda yorliqlar (ulush % va ixtiyoriy qiymat), o'ngda donut. */
export const BigDonutBody: React.FC<{
    parts: BigPart[]; center: string; centerSub: string;
    /** Yorliq ostida qiymatni qanday yozish: `false` — yozmaslik. */
    formatValue?: ((v: number) => string) | false;
}> = ({ parts, center, centerSub, formatValue = fmtCompact }) => {
    const total = parts.reduce((s, p) => s + Math.abs(p.value), 0) || 1;
    return (
        <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 10 }}>
            <div style={{ flex: '0 0 48%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center', overflow: 'hidden' }}>
                {parts.map((p) => (
                    <BigLabelRow
                        key={p.label}
                        label={p.label}
                        color={p.color}
                        value={`${groupNum((Math.abs(p.value) / total) * 100, 0)}%`}
                        sub={formatValue ? formatValue(p.value) : undefined}
                    />
                ))}
            </div>
            <div style={bigDonutBoxStyle}>
                <Doughnut
                    data={{
                        labels: parts.map((p) => p.label),
                        datasets: [{ data: parts.map((p) => Math.abs(p.value)), backgroundColor: parts.map((p) => p.color), borderWidth: 0 }],
                    }}
                    options={{ ...chartBase, cutout: '62%', ...noLegend } as any}
                    plugins={[bigCenterText(center, centerSub)]}
                />
            </div>
        </div>
    );
};

export type BigForecast = { text: string; detail?: string; confidence: number; color: string };

/** Sun'iy intellekt prognozlari — matn, ishonch darajasi bari va izoh. */
export const BigForecastList: React.FC<{ items: BigForecast[] }> = ({ items }) => (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 6, overflow: 'hidden' }}>
        {items.map((f, i) => (
            <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                        <span style={{ color: C.text, fontSize: 'clamp(10px, 2.6cqmin, 15px)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.text}</span>
                    </span>
                    <span style={{ color: f.color, fontWeight: 700, fontSize: 'clamp(10px, 2.6cqmin, 15px)', flexShrink: 0 }}>{f.confidence}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ width: `${f.confidence}%`, height: '100%', borderRadius: 3, background: f.color }} />
                </div>
                {f.detail && <div style={{ color: C.sub, fontSize: 'clamp(9px, 2.1cqmin, 12px)', marginTop: 2, marginLeft: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.detail}</div>}
            </div>
        ))}
    </div>
);

/* ══════════════════════════════════════════════════════════════════════════
   QO'SHIMCHA KATAK KOMPONENTLARI (ESGDetail, HseSlaBig, MarketingDetail)

   Hammasi kartaning qolgan balandligini egallaydi (`flex:1, minHeight:0`) va
   shriftlari karta o'lchamiga (`cqmin`) qarab o'zgaradi — bo'sh joy qolmaydi.
   ══════════════════════════════════════════════════════════════════════════ */

const cellText = 'clamp(12px, 3.6cqmin, 22px)';
const cellSub = 'clamp(11px, 3cqmin, 18px)';
const ellipsis: React.CSSProperties = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

export type BigProgressItem = {
    label: string; value: number; color: string;
    /** Bar to'lishi uchun maksimum (standart 100). */
    max?: number;
    /** Qiymat o'rniga ko'rsatiladigan matn (masalan "91,2%"). */
    display?: string;
    /** Maqsad belgisi — bar ustida vertikal chiziq. */
    target?: number;
};

/** Nom + qiymat + progress bar qatorlari (ixtiyoriy maqsad chizig'i bilan). */
export const BigProgressList: React.FC<{ items: BigProgressItem[] }> = ({ items }) => (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 4, overflow: 'hidden' }}>
        {items.map((it) => {
            const max = it.max ?? 100;
            return (
                <div key={it.label} style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: cellText, marginBottom: 'clamp(2px, 0.8cqmin, 5px)' }}>
                        <span style={{ color: C.sub, minWidth: 0, ...ellipsis }}>{it.label}</span>
                        <span style={{ color: C.text, fontWeight: 700, flexShrink: 0 }}>{it.display ?? groupNum(it.value, 0)}</span>
                    </div>
                    <div style={{ position: 'relative', height: 'clamp(6px, 2cqmin, 12px)', borderRadius: 6, background: 'rgba(255,255,255,0.07)' }}>
                        <div style={{ width: `${Math.min(100, (it.value / max) * 100)}%`, height: '100%', borderRadius: 5, background: `linear-gradient(90deg, ${alpha(it.color, 0.55)}, ${it.color})` }} />
                        {it.target !== undefined && (
                            <span style={{ position: 'absolute', top: -3, bottom: -3, left: `${Math.min(100, (it.target / max) * 100)}%`, width: 2, background: C.text, opacity: 0.8 }} />
                        )}
                    </div>
                </div>
            );
        })}
    </div>
);

export type BigStat = { label: string; value: string; sub?: string; color?: string };

/** Ko'rsatkich plitkalari to'ri — qator soni avtomatik, hammasi teng bo'linadi. */
export const BigStatGrid: React.FC<{ items: BigStat[]; columns?: number }> = ({ items, columns = 2 }) => (
    <div style={{
        flex: 1, minHeight: 0, display: 'grid', gap: 'clamp(4px, 1.4cqmin, 9px)',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${Math.ceil(items.length / columns)}, minmax(0, 1fr))`,
    }}>
        {items.map((s) => (
            <div key={s.label} style={{
                minWidth: 0, minHeight: 0, overflow: 'hidden', background: C.cardAlt,
                border: `1px solid ${C.border}`, borderLeft: `3px solid ${s.color ?? GC.accent1}`, borderRadius: 8,
                padding: 'clamp(4px, 1.2cqmin, 9px) clamp(6px, 1.6cqmin, 11px)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2,
            }}>
                <span style={{ color: C.sub, fontSize: cellSub, ...ellipsis }}>{s.label}</span>
                <span style={{ color: s.color ?? C.text, fontSize: 'clamp(16px, 6.5cqmin, 38px)', fontWeight: 700, lineHeight: 1.3, ...ellipsis }}>{s.value}</span>
                {s.sub && <span style={{ color: C.sub, fontSize: cellSub, ...ellipsis }}>{s.sub}</span>}
            </div>
        ))}
    </div>
);

/** Yarim doira ko'rsatkich (gauge) + ostida izoh plitkalari. SVG — karta
 *  o'lchamiga to'liq moslashadi. */
export const BigGauge: React.FC<{
    value: number; max?: number; display: string; caption: string; color: string;
    rows?: { label: string; value: string; color?: string }[];
}> = ({ value, max = 100, display, caption, color, rows = [] }) => {
    const r = 80;
    const frac = Math.max(0, Math.min(1, value / max));
    const arc = (from: number, to: number) => {
        const a0 = Math.PI * (1 - from), a1 = Math.PI * (1 - to);
        const p = (a: number) => `${100 + r * Math.cos(a)} ${100 - r * Math.sin(a)}`;
        /* Yarim doira hech qachon 180° dan oshmaydi — "large-arc" bayrog'i doim 0.
           (Avval ulush 50% dan oshganda 1 bo'lib, yoy teskari tomonga qiyshayardi.) */
        return `M ${p(a0)} A ${r} ${r} 0 0 1 ${p(a1)}`;
    };
    return (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ flex: 1, minHeight: 0 }}>
                <svg viewBox="0 0 200 118" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                    <path d={arc(0, 1)} stroke="rgba(255,255,255,0.08)" strokeWidth={18} fill="none" strokeLinecap="round" />
                    {frac > 0 && <path d={arc(0, frac)} stroke={color} strokeWidth={18} fill="none" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${alpha(color, 0.6)})` }} />}
                    <text x="100" y="92" textAnchor="middle" fill={C.text} fontSize="30" fontWeight="700" fontFamily='"Segoe UI", sans-serif'>{display}</text>
                    <text x="100" y="112" textAnchor="middle" fill={C.sub} fontSize="12" fontFamily='"Segoe UI", sans-serif'>{caption}</text>
                </svg>
            </div>
            {rows.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`, gap: 6, flexShrink: 0 }}>
                    {rows.map((row) => (
                        <div key={row.label} style={{ textAlign: 'center', minWidth: 0, background: C.cardAlt, borderRadius: 8, padding: 'clamp(3px, 1cqmin, 7px) 4px' }}>
                            <div style={{ color: row.color ?? C.text, fontWeight: 700, fontSize: cellText, ...ellipsis }}>{row.value}</div>
                            <div style={{ color: C.sub, fontSize: cellSub, ...ellipsis }}>{row.label}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/** Voronka: chapda bosqich nomi, o'rtada qiymatga mutanosib bar, o'ngda
 *  oldingi bosqichga nisbatan konversiya foizi. */
export const BigFunnel: React.FC<{ steps: { label: string; value: number; color?: string }[] }> = ({ steps }) => {
    const max = Math.max(...steps.map((s) => s.value), 1);
    return (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 3, overflow: 'hidden' }}>
            {steps.map((s, i) => {
                const color = s.color ?? GC.accent1;
                const conv = i > 0 && steps[i - 1].value ? Math.round((s.value / steps[i - 1].value) * 100) : null;
                return (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                        <span style={{ width: '36%', flexShrink: 0, color: C.sub, fontSize: cellText, ...ellipsis }}>{s.label}</span>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                                width: `${Math.max(18, (s.value / max) * 100)}%`, height: 'clamp(18px, 7cqmin, 42px)',
                                background: `linear-gradient(90deg, ${alpha(color, 0.5)}, ${color}, ${alpha(color, 0.5)})`,
                                borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: 700, fontSize: cellText,
                            }}>{groupNum(s.value, 0)}</div>
                        </div>
                        <span style={{ width: '12%', flexShrink: 0, textAlign: 'right', color: C.sub, fontSize: cellSub }}>{conv === null ? '' : `${conv}%`}</span>
                    </div>
                );
            })}
        </div>
    );
};

/** Issiqlik xaritasi (heatmap): qatorlar × ustunlar, rang jadalligi qiymatga mutanosib. */
export const BigHeatmap: React.FC<{
    rows: string[]; cols: string[]; values: number[][]; color: string; format?: (v: number) => string;
}> = ({ rows, cols, values, color, format = (v) => groupNum(v, 0) }) => {
    const max = Math.max(...values.flat(), 1);
    return (
        <div style={{
            flex: 1, minHeight: 0, display: 'grid', gap: 3,
            gridTemplateColumns: `minmax(0, 1.6fr) repeat(${cols.length}, minmax(0, 1fr))`,
            gridTemplateRows: `auto repeat(${rows.length}, minmax(0, 1fr))`,
        }}>
            <span />
            {cols.map((c) => <span key={c} style={{ color: C.sub, fontSize: cellSub, textAlign: 'center', ...ellipsis }}>{c}</span>)}
            {rows.map((row, ri) => (
                <React.Fragment key={row}>
                    <span style={{ color: C.text, fontSize: cellSub, alignSelf: 'center', ...ellipsis }}>{row}</span>
                    {cols.map((c, ci) => {
                        const v = values[ri]?.[ci] ?? 0;
                        const k = v / max;
                        return (
                            <span key={c} title={`${row} · ${c}: ${format(v)}`} style={{
                                minHeight: 0, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: alpha(color, 0.08 + k * 0.8), color: k > 0.55 ? '#fff' : C.text,
                                fontSize: cellSub, fontWeight: 600,
                            }}>{format(v)}</span>
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
    );
};

export type BigRow = { label: string; sub?: string; value: string; color: string };

/** Ro'yxat: rangli nuqta, nom (+ izoh), o'ngda rangli yorliq. */
export const BigRowList: React.FC<{ rows: BigRow[] }> = ({ rows }) => (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', overflow: 'hidden' }}>
        {rows.map((r, i) => (
            <div key={`${r.label}-${i}`} style={{
                display: 'flex', alignItems: 'center', gap: 8, minWidth: 0,
                padding: 'clamp(2px, 0.8cqmin, 6px) 0',
                borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0, boxShadow: `0 0 6px ${alpha(r.color, 0.7)}` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: C.text, fontSize: cellText, ...ellipsis }}>{r.label}</div>
                    {r.sub && <div style={{ color: C.sub, fontSize: cellSub, ...ellipsis }}>{r.sub}</div>}
                </div>
                <span style={{
                    color: r.color, background: alpha(r.color, 0.13), border: `1px solid ${alpha(r.color, 0.4)}`,
                    borderRadius: 6, padding: '1px 8px', fontSize: cellSub, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
                }}>{r.value}</span>
            </div>
        ))}
    </div>
);

/** Teskari piramida: tepada eng ko'p (keng), pastda eng og'ir (tor) qavat.
 *  Har bir qavat kengligi qiymatiga mutanosib. */
export const BigPyramid: React.FC<{ levels: BigPart[] }> = ({ levels }) => {
    const max = Math.max(...levels.map((l) => l.value), 1);
    return (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'space-evenly', overflow: 'hidden' }}>
            {levels.map((l) => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <div style={{ flex: '0 0 60%', display: 'flex', justifyContent: 'center' }}>
                        <div title={`${l.label}: ${l.value}`} style={{
                            width: `${Math.max((l.value / max) * 100, 18)}%`,
                            clipPath: 'polygon(0% 0%, 100% 0%, 92% 100%, 8% 100%)',
                            background: `linear-gradient(180deg, ${l.color}, ${alpha(l.color, 0.6)})`,
                            height: 'clamp(18px, 9cqmin, 54px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#04101f', fontWeight: 700, fontSize: cellText,
                        }}>{groupNum(l.value, 0)}</div>
                    </div>
                    <span style={{ flex: 1, minWidth: 0, color: C.sub, fontSize: cellSub, ...ellipsis }}>{l.label}</span>
                </div>
            ))}
        </div>
    );
};
