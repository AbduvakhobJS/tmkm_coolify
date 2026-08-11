// import React from 'react';
// import {
//     Chart as ChartJS,
//     CategoryScale, LinearScale, PointElement, LineElement,
//     BarElement, ArcElement, Title, Tooltip, Legend, Filler,
//     type Plugin,
// } from 'chart.js';
//
// ChartJS.register(
//     CategoryScale, LinearScale, PointElement, LineElement,
//     BarElement, ArcElement, Title, Tooltip, Legend, Filler
// );
//
// /* ── Umumiy ranglar / uslub ── */
// export const C = {
//     bg: '#0a0f1d',
//     card: '#131c30',
//     cardAlt: '#0f1626',
//     border: 'rgba(255,255,255,0.07)',
//     text: '#e2e8f0',
//     sub: '#94a3b8',
//     grid: 'rgba(255,255,255,0.05)',
//     up: '#22c55e',
//     down: '#ef4444',
// };
//
// export const MONTHS = ['Yan 2025', 'Fev 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Iyn 2025'];
// export const MONTH_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#eab308'];
//
// /* ── Raqam formatlash: 2 650,4 (probel — minglik, vergul — kasr) ── */
// export function fmt(n: number, d = 1): string {
//     const s = Math.abs(n).toFixed(d);
//     const [int, dec] = s.split('.');
//     const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
//     const sign = n < 0 ? '-' : '';
//     return dec !== undefined ? `${sign}${grouped},${dec}` : `${sign}${grouped}`;
// }
// export const signPct = (n: number, d = 1) => `${n >= 0 ? '+' : ''}${fmt(n, d)}%`;
//
// /* ── Umumiy chart sozlamalari ── */
// export const chartBase = {
//     responsive: true,
//     maintainAspectRatio: false,
//     animation: { duration: 600 } as const,
// };
//
// export const noLegend = { plugins: { legend: { display: false } } };
//
// export const axis = (opts: any = {}) => ({
//     x: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 11 } }, ...(opts.x || {}) },
//     y: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 11 } }, ...(opts.y || {}) },
// });
//
// /* ── Chart.js plaginlari ── */
// export const barLabel = (d = 1): Plugin<'bar'> => ({
//     id: 'barLabel',
//     afterDatasetsDraw(chart) {
//         const { ctx } = chart;
//         const meta = chart.getDatasetMeta(0);
//         meta.data.forEach((el: any, idx: number) => {
//             const v = chart.data.datasets[0].data[idx] as number;
//             ctx.save();
//             ctx.fillStyle = C.text;
//             ctx.font = '600 13px "Segoe UI", sans-serif';
//             ctx.textAlign = 'center';
//             ctx.fillText(fmt(v, d), el.x, el.y - 8);
//             ctx.restore();
//         });
//     },
// });
//
// export const lineLabel = (d = 0): Plugin<'line'> => ({
//     id: 'lineLabel',
//     afterDatasetsDraw(chart) {
//         const { ctx } = chart;
//         const meta = chart.getDatasetMeta(0);
//         meta.data.forEach((el: any, idx: number) => {
//             const v = chart.data.datasets[0].data[idx] as number;
//             ctx.save();
//             ctx.fillStyle = C.text;
//             ctx.font = '600 12px "Segoe UI", sans-serif';
//             ctx.textAlign = 'center';
//             ctx.fillText(fmt(v, d), el.x, el.y - 10);
//             ctx.restore();
//         });
//     },
// });
//
// export const centerText = (main: string, sub: string): Plugin<'doughnut'> => ({
//     id: 'centerText',
//     afterDraw(chart) {
//         const { ctx, chartArea } = chart;
//         const cx = (chartArea.left + chartArea.right) / 2;
//         const cy = (chartArea.top + chartArea.bottom) / 2;
//         ctx.save();
//         ctx.textAlign = 'center';
//         ctx.fillStyle = C.text;
//         ctx.font = '700 18px "Segoe UI", sans-serif';
//         ctx.fillText(main, cx, cy - 2);
//         ctx.fillStyle = C.sub;
//         ctx.font = '400 12px "Segoe UI", sans-serif';
//         ctx.fillText(sub, cx, cy + 16);
//         ctx.restore();
//     },
// });
//
// /* ── UI komponentlar ── */
// export const Card: React.FC<{ title?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, children, style }) => (
//     <div style={{
//         background: C.card,
//         border: `1px solid ${C.border}`,
//         borderRadius: 12,
//         padding: 11,
//         display: 'flex',
//         flexDirection: 'column',
//         minWidth: 0,
//         minHeight: 0,
//         overflow: 'hidden',
//         ...style,
//     }}>
//         {title && <div style={{ color: C.text, fontSize: 15.5, fontWeight: 600, marginBottom: 8, flexShrink: 0 }}>{title}</div>}
//         {children}
//     </div>
// );
//
// export const Delta: React.FC<{ v: number }> = ({ v }) => (
//     <span style={{ color: v >= 0 ? C.up : C.down, fontSize: 13, fontWeight: 600 }}>
//         {v >= 0 ? '↑' : '↓'} {signPct(v).replace('+', '').replace('-', '')}
//     </span>
// );
//
// export const KpiCard: React.FC<{
//     title: string; value: string; delta: number; compare: string;
//     badge?: React.ReactNode;
// }> = ({ title, value, delta, compare, badge }) => (
//     <div style={{
//         flex: 1, minWidth: 0, background: C.card, border: `1px solid ${C.border}`,
//         borderRadius: 12, padding: '8px 13px',
//     }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//             <div style={{ color: C.sub, fontSize: 12, marginBottom: 6 }}>{title}</div>
//             {badge}
//         </div>
//         <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
//             <span style={{ color: C.text, fontSize: 12, fontWeight: 700 }}>{value}</span>
//             <Delta v={delta} />
//         </div>
//         {/*<div style={{ color: C.sub, fontSize: 11.5, marginTop: 6 }}>{compare}</div>*/}
//     </div>
// );
//
// export const Badge: React.FC<{ symbol: string; color: string }> = ({ symbol, color }) => (
//     <div style={{
//         width: 34, height: 34, borderRadius: '50%',
//         background: `${color}22`, color,
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         fontSize: symbol.length > 2 ? 13 : 15, fontWeight: 700, flexShrink: 0,
//     }}>
//         {symbol}
//     </div>
// );
//
// export const Gauge: React.FC<{ label: string; value: number; color?: string; suffix?: string }> = ({ label, value, color = C.up, suffix = '%' }) => (
//     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
//         <div style={{ color: C.sub, fontSize: 12 }}>{label}</div>
//         <div style={{
//             width: 74, height: 74, borderRadius: '50%',
//             background: `conic-gradient(${color} ${value}%, rgba(255,255,255,0.08) 0)`,
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//         }}>
//             <div style={{
//                 width: 56, height: 56, borderRadius: '50%', background: C.card,
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 color: C.text, fontSize: 14, fontWeight: 700,
//             }}>
//                 {fmt(value, 1)}{suffix}
//             </div>
//         </div>
//     </div>
// );
//
// /* ── Dashboard sarlavhasi (header) ── */
// export const DashHeader: React.FC<{ title: string; subtitle: string; dateRange: string }> = ({ title, subtitle, dateRange }) => (
//     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexShrink: 0 }}>
//         <div>
//             <div style={{ color: C.text, fontSize: 24, fontWeight: 700 }}>{title}</div>
//             <div style={{ color: C.sub, fontSize: 14, marginTop: 2 }}>{subtitle}</div>
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 13px', color: C.text, fontSize: 13 }}>
//                 {dateRange} <span style={{ color: C.sub }}>▦</span>
//             </div>
//             <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 11px', color: C.sub }}>⛃</div>
//             <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 15px', color: C.text, fontSize: 13, display: 'flex', gap: 6 }}>⤓ Eksport</div>
//         </div>
//     </div>
// );
//
// /* ── Footer ── */
// export const DashFooter: React.FC<{ left: string; right: string }> = ({ left, right }) => (
//     <div style={{ display: 'flex', justifyContent: 'space-between', color: C.sub, fontSize: 12.5, paddingTop: 6, flexShrink: 0 }}>
//         <span>{left}</span>
//         <span>{right}</span>
//     </div>
// );
//
// /* ── Dashboard root o'rami ── */
// export const DashRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => (
//     <div style={{ background: C.bg, padding: 14, width: '100%', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
//         {children}
//     </div>
// );

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler,
    type Plugin,
} from 'chart.js';
import {useNavigate} from "react-router-dom";

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

/* ── Umumiy ranglar / uslub ── */
export const C = {
    bg: '#0a0f1d',
    // card: '#131c30',
    card: 'linear-gradient(180deg, rgba(8, 38, 66, .78), rgba(3, 19, 35, .78))',
    cardAlt: '#0f1626',
    border: 'rgba(22, 211, 255, .18)',
    text: '#f1f2f6',
    sub: '#f1f2f6',
    grid: 'rgba(255,255,255,0.05)',
    up: '#22c55e',
    down: '#ef4444',
};

export const MONTHS = ['Yan 2025', 'Fev 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Iyn 2025'];
export const MONTH_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#eab308'];

/* ── Raqam formatlash: 2 650,4 (probel — minglik, vergul — kasr) ── */
export function fmt(n: number, d = 1): string {
    const s = Math.abs(n).toFixed(d);
    const [int, dec] = s.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const sign = n < 0 ? '-' : '';
    return dec !== undefined ? `${sign}${grouped},${dec}` : `${sign}${grouped}`;
}
export const signPct = (n: number, d = 1) => `${n >= 0 ? '+' : ''}${fmt(n, d)}%`;

/* ── Umumiy chart sozlamalari ── */
export const chartBase = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 } as const,
};

export const noLegend = { plugins: { legend: { display: false } } };

export const axis = (opts: any = {}) => ({
    x: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 11 } }, ...(opts.x || {}) },
    y: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 11 } }, ...(opts.y || {}) },
});

/* ── Chart.js plaginlari ── */
export const barLabel = (d = 1): Plugin<'bar'> => ({
    id: 'barLabel',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        meta.data.forEach((el: any, idx: number) => {
            const v = chart.data.datasets[0].data[idx] as number;
            ctx.save();
            ctx.fillStyle = C.text;
            ctx.font = '600 13px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(fmt(v, d), el.x, el.y - 8);
            ctx.restore();
        });
    },
});

export const lineLabel = (d = 0): Plugin<'line'> => ({
    id: 'lineLabel',
    afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        meta.data.forEach((el: any, idx: number) => {
            const v = chart.data.datasets[0].data[idx] as number;
            ctx.save();
            ctx.fillStyle = C.text;
            ctx.font = '600 12px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(fmt(v, d), el.x, el.y - 10);
            ctx.restore();
        });
    },
});

export const centerText = (main: string, sub: string): Plugin<'doughnut'> => ({
    id: 'centerText',
    afterDraw(chart) {
        const { ctx, chartArea } = chart;
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = (chartArea.top + chartArea.bottom) / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = C.text;
        ctx.font = '700 18px "Segoe UI", sans-serif';
        ctx.fillText(main, cx, cy - 2);
        ctx.fillStyle = C.sub;
        ctx.font = '400 12px "Segoe UI", sans-serif';
        ctx.fillText(sub, cx, cy + 16);
        ctx.restore();
    },
});

/* ── UI komponentlar ──
   Barcha o'lchamlar endi `cqmin` (container query min: konteynerning kengligi
   va balandligidan qaysi biri kichik bo'lsa, o'shanga nisbatan %) birligida.
   Bu componentni SAHIFANING QAYSI QISMIGA qo'ysang ham (1/6, 1/2, to'liq ekran)
   proporsional masshtablanishini ta'minlaydi — brauzer oynasiga emas, balki
   componentning o'zi turgan konteynerga qarab. clamp() esa juda kichik yoki
   juda katta konteynerlarda o'qib bo'lmas darajaga tushib ketmasligi / haddan
   tashqari kattalashib ketmasligi uchun min/max chegara qo'yadi. */

export const Card: React.FC<{ title?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, children, style }) => (
    <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 'clamp(6px, 1.6cqmin, 12px)',
        padding: 'clamp(6px, 1.6cqmin, 11px)',
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
            <div style={{
                color: C.text,
                fontSize: 'clamp(10px, 2.2cqmin, 15.5px)',
                fontWeight: 600,
                marginBottom: 'clamp(3px, 1.2cqmin, 8px)',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>{title}</div>
        )}
        {children}
    </div>
);

export const Delta: React.FC<{ v: number }> = ({ v }) => (
    <span style={{ color: v >= 0 ? C.up : C.down, fontSize: 'clamp(9px, 1.9cqmin, 13px)', fontWeight: 600 }}>
        {v >= 0 ? '↑' : '↓'} {signPct(v).replace('+', '').replace('-', '')}
    </span>
);

// export const KpiCard: React.FC<{
//     title: string; value: string; delta: number; compare: string;
//     badge?: React.ReactNode;
// }> = ({ title, value, delta, compare, badge }) => (
//     <div style={{
//         flex: 1, minWidth: 0, background: C.card, border: `1px solid ${C.border}`,
//         borderRadius: 'clamp(6px, 1.6cqmin, 12px)',
//         padding: 'clamp(5px, 1.1cqmin, 8px) clamp(7px, 1.9cqmin, 13px)',
//         containerType: 'size',
//         containerName: 'kpi',
//     }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//             <div style={{
//                 color: C.sub,
//                 fontSize: 'clamp(8px, 1.8cqmin, 12px)',
//                 marginBottom: 'clamp(2px, 0.9cqmin, 6px)',
//                 whiteSpace: 'nowrap',
//                 overflow: 'hidden',
//                 textOverflow: 'ellipsis',
//             }}>{title}</div>
//             {badge}
//         </div>
//         <div style={{ display: 'flex', alignItems: 'baseline', gap: 'clamp(4px, 1.1cqmin, 8px)' }}>
//             <span style={{ color: C.text, fontSize: 'clamp(13px, 3.2cqmin, 22px)', fontWeight: 700 }}>{value}</span>
//             <Delta v={delta} />
//         </div>
//         {/*<div style={{ color: C.sub, fontSize: 11.5, marginTop: 6 }}>{compare}</div>*/}
//     </div>
// );

export const KpiCard: React.FC<{
    title: string; value: string; delta: number; compare: string;
    badge?: React.ReactNode;
}> = ({ title, value, delta, compare, badge }) => (
    <div style={{
        flex: 1, minWidth: 0, background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: '8px 13px',
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ color: C.sub, fontSize: 12, marginBottom: 6 }}>{title}</div>
            {badge}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: "space-between" }}>
            <span style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>{value}</span>
            <Delta v={delta} />
        </div>
        {/*<div style={{ color: C.sub, fontSize: 11.5, marginTop: 6 }}>{compare}</div>*/}
    </div>
);

export const Badge: React.FC<{ symbol: string; color: string }> = ({ symbol, color }) => (
    <div style={{
        width: 'clamp(20px, 4.8cqmin, 34px)',
        height: 'clamp(20px, 4.8cqmin, 34px)',
        borderRadius: '50%',
        background: `${color}22`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: symbol.length > 2 ? 'clamp(8px, 1.9cqmin, 13px)' : 'clamp(9px, 2.1cqmin, 15px)',
        fontWeight: 700, flexShrink: 0,
    }}>
        {symbol}
    </div>
);

export const Gauge: React.FC<{ label: string; value: number; color?: string; suffix?: string }> = ({ label, value, color = C.up, suffix = '%' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(2px, 0.8cqmin, 6px)' }}>
        <div style={{ color: C.sub, fontSize: 'clamp(8px, 1.8cqmin, 12px)', whiteSpace: 'nowrap' }}>{label}</div>
        <div style={{
            width: 'clamp(38px, 10cqmin, 74px)',
            height: 'clamp(38px, 10cqmin, 74px)',
            borderRadius: '50%',
            background: `conic-gradient(${color} ${value}%, rgba(255,255,255,0.08) 0)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                width: '76%', height: '76%', borderRadius: '50%', background: C.card,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.text, fontSize: 'clamp(9px, 2cqmin, 14px)', fontWeight: 700,
            }}>
                {fmt(value, 1)}{suffix}
            </div>
        </div>
    </div>
);

/* ── Dashboard sarlavhasi (header) ── */
export const DashHeader: React.FC<{ title: string; subtitle: string; dateRange: string }> = ({ title, subtitle, dateRange }) => {
    const navigate = useNavigate();
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            marginBottom: 'clamp(4px, 1.2cqmin, 10px)', flexShrink: 0, flexWrap: 'wrap', gap: 'clamp(4px, 1cqmin, 8px)',
        }}>
            <div style={{ minWidth: 0 }}>
                <div style={{
                    color: C.text,textTransform: "uppercase", fontSize: 'clamp(14px, 3.4cqmin, 24px)', fontWeight: 700,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{title}</div>
                {/*<div style={{*/}
                {/*    color: C.sub, fontSize: 'clamp(9px, 2cqmin, 14px)', marginTop: 2,*/}
                {/*    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',*/}
                {/*}}>{subtitle}</div>*/}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(4px, 1.1cqmin, 8px)', flexShrink: 0 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 'clamp(3px, 1.1cqmin, 8px)',
                    background: C.card, border: `1px solid ${C.border}`, borderRadius: 'clamp(4px, 1.1cqmin, 8px)',
                    padding: 'clamp(4px, 1.2cqmin, 9px) clamp(6px, 1.8cqmin, 13px)',
                    color: C.text, fontSize: 'clamp(9px, 1.8cqmin, 13px)', whiteSpace: 'nowrap',
                }}>
                    {dateRange} <span style={{ color: C.sub }}>▦</span>
                </div>
                <div style={{
                    background: C.card, border: `1px solid ${C.border}`, borderRadius: 'clamp(4px, 1.1cqmin, 8px)',
                    padding: 'clamp(4px, 1.2cqmin, 9px) clamp(5px, 1.5cqmin, 11px)', color: C.sub,
                }}>⛃</div>
                <div style={{
                    background: C.card, border: `1px solid ${C.border}`, borderRadius: 'clamp(4px, 1.1cqmin, 8px)',
                    padding: 'clamp(4px, 1.2cqmin, 9px) clamp(6px, 2.1cqmin, 15px)', color: C.text,
                    fontSize: 'clamp(9px, 1.8cqmin, 13px)', display: 'flex', gap: 6, whiteSpace: 'nowrap',
                    cursor: 'pointer',
                }}
                     onClick={() => navigate("/main/production")}
                >Batafsil
                </div>
            </div>
        </div>
    );
};

/* ── Footer ── */
export const DashFooter: React.FC<{ left: string; right: string }> = ({ left, right }) => (
    <div style={{
        display: 'flex', justifyContent: 'space-between', color: C.sub,
        fontSize: 'clamp(8px, 1.7cqmin, 12.5px)', paddingTop: 'clamp(2px, 0.8cqmin, 6px)', flexShrink: 0,
        gap: 8,
    }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{left}</span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{right}</span>
    </div>
);

/* ── Dashboard root o'rami ──
   `containerType: 'size'` shu bloknikonteyner-so'rov (container query) manbaiga
   aylantiradi: ichkaridagi barcha `cqmin`/`cqw`/`cqh` shu blokning HAQIQIY
   ekrandagi kengligi/balandligiga nisbatan hisoblanadi — parent qanday
   grid/flex ichida (1/6, 1/2, to'liq) joylashtirilgan bo'lsa ham. */
export const DashRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{
        background: C.bg,
        padding: 'clamp(6px, 1.8cqmin, 14px)',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: '"Segoe UI", system-ui, sans-serif',
        containerType: 'size',
        containerName: 'dash-root',
    }}>
        {children}
    </div>
);