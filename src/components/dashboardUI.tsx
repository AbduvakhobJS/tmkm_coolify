import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler,
    type Plugin,
} from 'chart.js';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

/* ── Umumiy ranglar / uslub ── */
export const C = {
    bg: '#0a0f1d',
    card: '#131c30',
    cardAlt: '#0f1626',
    border: 'rgba(255,255,255,0.07)',
    text: '#e2e8f0',
    sub: '#94a3b8',
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

/* ── UI komponentlar ── */
export const Card: React.FC<{ title?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, children, style }) => (
    <div style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 11,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
        ...style,
    }}>
        {title && <div style={{ color: C.text, fontSize: 15.5, fontWeight: 600, marginBottom: 8, flexShrink: 0 }}>{title}</div>}
        {children}
    </div>
);

export const Delta: React.FC<{ v: number }> = ({ v }) => (
    <span style={{ color: v >= 0 ? C.up : C.down, fontSize: 13, fontWeight: 600 }}>
        {v >= 0 ? '↑' : '↓'} {signPct(v).replace('+', '').replace('-', '')}
    </span>
);

export const KpiCard: React.FC<{
    title: string; value: string; delta: number; compare: string;
    badge?: React.ReactNode;
}> = ({ title, value, delta, compare, badge }) => (
    <div style={{
        flex: 1, minWidth: 0, background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: '8px 13px',
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ color: C.sub, fontSize: 13, marginBottom: 6 }}>{title}</div>
            {badge}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ color: C.text, fontSize: 22, fontWeight: 700 }}>{value}</span>
            <Delta v={delta} />
        </div>
        <div style={{ color: C.sub, fontSize: 11.5, marginTop: 6 }}>{compare}</div>
    </div>
);

export const Badge: React.FC<{ symbol: string; color: string }> = ({ symbol, color }) => (
    <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: `${color}22`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: symbol.length > 2 ? 13 : 15, fontWeight: 700, flexShrink: 0,
    }}>
        {symbol}
    </div>
);

export const Gauge: React.FC<{ label: string; value: number; color?: string; suffix?: string }> = ({ label, value, color = C.up, suffix = '%' }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ color: C.sub, fontSize: 12 }}>{label}</div>
        <div style={{
            width: 74, height: 74, borderRadius: '50%',
            background: `conic-gradient(${color} ${value}%, rgba(255,255,255,0.08) 0)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                width: 56, height: 56, borderRadius: '50%', background: C.card,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.text, fontSize: 14, fontWeight: 700,
            }}>
                {fmt(value, 1)}{suffix}
            </div>
        </div>
    </div>
);

/* ── Dashboard sarlavhasi (header) ── */
export const DashHeader: React.FC<{ title: string; subtitle: string; dateRange: string }> = ({ title, subtitle, dateRange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexShrink: 0 }}>
        <div>
            <div style={{ color: C.text, fontSize: 24, fontWeight: 700 }}>{title}</div>
            <div style={{ color: C.sub, fontSize: 14, marginTop: 2 }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 13px', color: C.text, fontSize: 13 }}>
                {dateRange} <span style={{ color: C.sub }}>▦</span>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 11px', color: C.sub }}>⛃</div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 15px', color: C.text, fontSize: 13, display: 'flex', gap: 6 }}>⤓ Eksport</div>
        </div>
    </div>
);

/* ── Footer ── */
export const DashFooter: React.FC<{ left: string; right: string }> = ({ left, right }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', color: C.sub, fontSize: 12.5, paddingTop: 6, flexShrink: 0 }}>
        <span>{left}</span>
        <span>{right}</span>
    </div>
);

/* ── Dashboard root o'rami ── */
export const DashRoot: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ background: C.bg, padding: 14, width: '100%', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
        {children}
    </div>
);
