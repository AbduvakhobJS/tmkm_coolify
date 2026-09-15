import React from 'react';
import type { Plugin } from 'chart.js';
import { C, Delta, fmt } from './dashboardUI';
import { GC } from '../theme/palette';

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
    fontSize: 'clamp(18px, 3.6cqmin, 26px)',
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
}> = ({ title, value, delta, iconColor = GC.accent1 }) => (
    <div style={{
        flex: 1, minWidth: 0, background: C.card, border: `1px solid ${C.border}`,
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
