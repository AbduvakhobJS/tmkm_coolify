import React, { useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { C, chartBase, axis, noLegend, fmt } from '../../components/dashboardUI';

/* ── Ma'lumoti hali yig'ilmagan ko'rsatkichlar uchun umumiy matn ── */
const TBD = 'Aniqlanmoqda';

const ACCENT = '#3b82f6';

/* ── Demo ma'lumotlar (API ulanganda shu blok almashtiriladi) ── */
const DEMO = {
    kpi: {
        headcount: 237,
        staffTable: 219,
        hiringPlan: 204,
        fot: 857738821,
    },
    categories: [
        { label: 'Rahbarlar', count: 22, pct: 9.3, color: '#3b82f6' },
        { label: 'Mutaxassislar', count: 24, pct: 10.1, color: '#f59e0b' },
        { label: 'Texnik ijrochilar', count: 12, pct: 5.1, color: '#22c55e' },
        { label: 'Ishchilar', count: 179, pct: 75.5, color: '#94a3b8' },
    ],
    hiringStages: [
        { label: 'I bosqich', count: 5 },
        { label: 'II bosqich', count: 18 },
        { label: 'III bosqich', count: 94 },
        { label: 'IV bosqich', count: 87 },
    ],
    departments: [
        { label: 'Asosiy ishlab chiqarish', count: 130 },
        { label: 'Bosh mexanik xizmati', count: 23 },
        { label: 'Bosh energetik xizmati', count: 11 },
        { label: 'NBQ va ATBB xizmati', count: 13 },
        { label: "Ta'minot va TIF bo'limi", count: 4 },
        { label: "Transport-logistika bo'limi", count: 18 },
        { label: "Direktorga bevosita bo'ysunuvchi", count: 29 },
        { label: 'Moliya-iqtisod bloki', count: 6 },
    ],
    orgStructure: [
        { label: 'Bosh direktor', value: '1' },
        { label: "Direktor o'rinbosarlari", value: '3' },
        { label: 'Asosiy ishlab chiqarish', value: '130' },
        { label: 'Bosh mexanik xizmati', value: '23' },
        { label: 'Bosh energetik xizmati', value: '11' },
        { label: 'NBQ va ATBB', value: '13' },
    ],
    kdp: [
        { label: 'Qabullar', value: TBD },
        { label: "O'tkazishlar", value: TBD },
        { label: "Bo'shatishlar", value: TBD },
        { label: "Ta'tillar", value: TBD },
        { label: "Dekret ta'tillari", value: TBD },
    ],
    expiringDocs: [
        { label: 'Pasportlar', value: TBD },
        { label: 'Mehnat shartnomalari', value: TBD },
        { label: "Tibbiy ko'riklar", value: TBD },
        { label: 'Sertifikatlar', value: TBD },
        { label: 'Vizalar / ruxsatnomalar', value: TBD },
    ],
    gph: [
        { label: 'Faol shartnomalar', value: TBD },
        { label: 'Pudratchilar', value: TBD },
        { label: "To'lovlar", value: TBD },
    ],
    expats: [
        { label: 'Jami', value: TBD },
        { label: "Davlatlar bo'yicha", value: TBD },
    ],
    training: [
        { label: "O'qitish rejasi", value: 'Bor', accent: true },
        { label: 'Bajarilishi', value: TBD },
        { label: 'Tayinlangan kurslar', value: TBD },
        { label: "O'tilgan kurslar", value: TBD },
        { label: "O'qitish soatlari", value: TBD },
    ],
    schedules: [
        { title: 'Uzluksiz ishlab chiqarish', sub: '4 brigadali smenali grafik', icon: 'clock' },
        { title: "Ma'muriy xodimlar", sub: TBD, icon: 'users' },
    ],
};

/* ── Ikonkalar ── */
const IconUsers = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.8 19c.6-3.4 3.1-5.5 6.2-5.5s5.6 2.1 6.2 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="17" cy="8.5" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15.6 13.7c2.6.2 4.6 2 5.1 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconClipboard = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <rect x="4.5" y="4" width="15" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 4V2.8h6V4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8.5 9.5h7M8.5 13h7M8.5 16.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconUserPlus = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.5 19.5c.6-3.7 3.2-6 6.5-6s5.9 2.3 6.5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18.5 8v6M15.5 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const IconPie = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M12 3a9 9 0 109 9h-9V3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14.5 2.5A8 8 0 0121.5 9.5h-7v-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconWallet = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M3 7.5a2 2 0 012-2h13a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2v-10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M16 12.5h3.5a1 1 0 011 1v1a1 1 0 01-1 1H16a1.5 1.5 0 010-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconTrend = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
        <path d="M3 16l6-6 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconCap = () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M2.5 8.5L12 4.5l9.5 4-9.5 4-9.5-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6.5 10.5v4.2c0 1.4 2.5 2.6 5.5 2.6s5.5-1.2 5.5-2.6v-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M21 9v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconGender = () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <circle cx="8" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 10.5v7M5.5 14h5M5.5 20.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="16.5" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M16.5 10.5v10M14 20.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconAge = () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <circle cx="7.5" cy="8" r="2.8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2.5 19c.5-3.2 2.6-5 5-5s4.5 1.8 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="16.5" cy="8" r="2.8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M13.5 19c.5-3.2 2.6-5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconBars = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M5 20V11M12 20V4M19 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);
const IconDoc = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M6 3h8l4 4v14H6V3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 3v4h4M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconHandshake = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M3 13l3-1 4 1.3 4.5-1a2 2 0 012 2v.2a2 2 0 01-1.6 2L9 17.5 3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 13l4-3.5a1.8 1.8 0 012.5 2.5L14 19l-8-2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconGlobe = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
);
const IconCapSmall = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M2.5 8.5L12 4.5l9.5 4-9.5 4-9.5-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6.5 10.5v4.2c0 1.4 2.5 2.6 5.5 2.6s5.5-1.2 5.5-2.6v-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconBuilding = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="10" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M14 9h6v12h-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7 7h4M7 11h4M7 15h4M16.5 13h1.5M16.5 17h1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
);
const IconClock = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconUsersBig = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.8 19c.6-3.4 3.1-5.5 6.2-5.5s5.6 2.1 6.2 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="17" cy="8.5" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15.6 13.7c2.6.2 4.6 2 5.1 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

const SCHEDULE_ICONS: Record<string, React.ReactNode> = { clock: <IconClock />, users: <IconUsersBig /> };

/* ── Umumiy UI bo'laklari ── */
const NeonIcon: React.FC<{ color?: string; size?: number; children: React.ReactNode }> = ({ color = ACCENT, size = 32, children }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(145deg, ${color}40, ${color}12)`,
        border: `1.3px solid ${color}70`,
        boxShadow: `0 0 10px ${color}45, inset 0 0 6px ${color}22`,
        color,
    }}>
        {children}
    </div>
);

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
    <div style={{
        background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '11px 13px',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        ...style,
    }}>
        {children}
    </div>
);

const PanelTitle: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
        {icon && <NeonIcon size={24}>{icon}</NeonIcon>}
        <span style={{
            color: '#4fb3d9', fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
            textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</span>
    </div>
);

/* KPI kartochka — yuqoridagi qator */
const KpiTile: React.FC<{ label: string; value: string; unit?: string; icon: React.ReactNode; pending?: boolean }> = ({ label, value, unit, icon, pending }) => (
    <Panel style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <NeonIcon size={36}>{icon}</NeonIcon>
            <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ color: C.sub, fontSize: 11, fontWeight: 600, lineHeight: 1.25, opacity: 0.85 }}>{label}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 5 }}>
                    <span style={{
                        color: pending ? C.sub : C.text,
                        fontSize: pending ? 14 : 22,
                        fontWeight: 700, lineHeight: 1,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{value}</span>
                    {unit && <span style={{ color: C.sub, fontSize: 11, fontWeight: 500 }}>{unit}</span>}
                </div>
            </div>
        </div>
    </Panel>
);

/* Ma'lumoti yo'q donut o'rnidagi bo'sh halqa */
const EmptyRing: React.FC<{ icon: React.ReactNode }> = ({ icon }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 0 }}>
        <div style={{
            width: 104, height: 104, borderRadius: '50%',
            border: '11px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(241,242,246,0.35)',
        }}>
            {icon}
        </div>
        <span style={{ color: C.sub, fontSize: 11, opacity: 0.75 }}>{TBD}</span>
    </div>
);

/* Nom — qiymat qatori */
const Row: React.FC<{ label: string; value: string; accent?: boolean; last?: boolean }> = ({ label, value, accent, last }) => (
    <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
        padding: '5px 0', borderBottom: last ? 'none' : `1px solid ${C.border}`,
    }}>
        <span style={{ color: C.sub, fontSize: 10.5, opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        <span style={{
            color: accent ? C.up : (value === TBD ? C.sub : C.text),
            fontSize: value === TBD ? 10 : 11.5,
            fontWeight: value === TBD ? 500 : 700,
            opacity: value === TBD ? 0.7 : 1,
            flexShrink: 0,
        }}>{value}</span>
    </div>
);

const ListPanel: React.FC<{ title: string; icon: React.ReactNode; items: { label: string; value: string; accent?: boolean }[] }> = ({ title, icon, items }) => (
    <Panel>
        <PanelTitle title={title} icon={icon} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {items.map((it, i) => (
                <Row key={it.label} label={it.label} value={it.value} accent={it.accent} last={i === items.length - 1} />
            ))}
        </div>
    </Panel>
);

/* ── Chart plaginlari ── */
const centerCount = (main: string, sub: string) => ({
    id: 'hrdCenterCount',
    afterDraw(chart: any) {
        const { ctx, chartArea } = chart;
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = (chartArea.top + chartArea.bottom) / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = C.text;
        ctx.font = '700 22px "Segoe UI", sans-serif';
        ctx.fillText(main, cx, cy + 2);
        ctx.fillStyle = C.sub;
        ctx.font = '400 10px "Segoe UI", sans-serif';
        ctx.fillText(sub, cx, cy + 18);
        ctx.restore();
    },
});

/* Vertikal ustun tepasidagi son */
const vBarLabel = {
    id: 'hrdVBarLabel',
    afterDatasetsDraw(chart: any) {
        const { ctx } = chart;
        chart.getDatasetMeta(0).data.forEach((el: any, i: number) => {
            ctx.save();
            ctx.fillStyle = C.text;
            ctx.font = '700 13px "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(String(chart.data.datasets[0].data[i]), el.x, el.y - 7);
            ctx.restore();
        });
    },
};

/* Gorizontal ustun oxiridagi son */
const hBarLabel = {
    id: 'hrdHBarLabel',
    afterDatasetsDraw(chart: any) {
        const { ctx } = chart;
        chart.getDatasetMeta(0).data.forEach((el: any, i: number) => {
            ctx.save();
            ctx.fillStyle = C.text;
            ctx.font = '700 11px "Segoe UI", sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(chart.data.datasets[0].data[i]), el.x + 6, el.y);
            ctx.restore();
        });
    },
};

/* ── Asosiy komponent ── */
const NewNewHrd: React.FC = () => {
    const cats = DEMO.categories;
    const total = useMemo(() => cats.reduce((s, c) => s + c.count, 0), [cats]);

    const catDonut = useMemo(() => ({
        labels: cats.map((c) => c.label),
        datasets: [{
            data: cats.map((c) => c.count),
            backgroundColor: cats.map((c) => c.color),
            borderColor: C.cardAlt,
            borderWidth: 2,
        }],
    }), [cats]);

    const stagesBar = useMemo(() => ({
        labels: DEMO.hiringStages.map((s) => s.label),
        datasets: [{ data: DEMO.hiringStages.map((s) => s.count), backgroundColor: ACCENT, borderRadius: 4, maxBarThickness: 42 }],
    }), []);

    const deptBar = useMemo(() => ({
        labels: DEMO.departments.map((d) => d.label),
        datasets: [{ data: DEMO.departments.map((d) => d.count), backgroundColor: ACCENT, borderRadius: 4, maxBarThickness: 11 }],
    }), []);

    const donutOpts = { ...chartBase, cutout: '66%', ...noLegend } as any;

    const stagesOpts = {
        ...chartBase, ...noLegend,
        layout: { padding: { top: 18 } },
        scales: axis({
            x: { grid: { display: false }, ticks: { color: C.sub, font: { size: 10 } } },
            y: { beginAtZero: true, ticks: { color: C.sub, font: { size: 10 } } },
        }),
    } as any;

    const deptOpts = {
        ...chartBase, ...noLegend,
        indexAxis: 'y',
        layout: { padding: { right: 26 } },
        scales: {
            x: { beginAtZero: true, grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 9.5 } } },
            y: { grid: { display: false }, ticks: { color: C.sub, font: { size: 9.5 }, autoSkip: false } },
        },
    } as any;

    return (
        <div style={{
            background: 'var(--gc-panel-bg)',
            border: '1px solid rgba(14,168,199,0.2)',
            borderRadius: 12,
            padding: 14,
            width: '100%',
            minHeight: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            fontFamily: '"Segoe UI", system-ui, sans-serif',
        }}>
            {/* Sarlavha */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0 }}>
                <span style={{ color: C.text, fontSize: 22, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    HRD dashboardi
                </span>
                <span style={{ color: C.sub, fontSize: 12, opacity: 0.7 }}>Kadrlar bo'yicha umumiy ko'rsatkichlar</span>
            </div>

            {/* 1-qator: KPI kartochkalar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 10 }}>
                <KpiTile label="Umumiy shtat soni" value={fmt(DEMO.kpi.headcount, 0)} unit="kishi" icon={<IconUsers />} />
                <KpiTile label="Shtat jadvali" value={fmt(DEMO.kpi.staffTable, 0)} unit="birlik" icon={<IconClipboard />} />
                <KpiTile label="2026-yil ishga qabul rejasi" value={fmt(DEMO.kpi.hiringPlan, 0)} unit="kishi" icon={<IconUserPlus />} />
                <KpiTile label="Butlanganlik" value={TBD} icon={<IconPie />} pending />
                <KpiTile label="MHF (oylik)" value={fmt(DEMO.kpi.fot, 0)} unit="so'm" icon={<IconWallet />} />
                <KpiTile label="Kadrlar qo'nimsizligi" value={TBD} icon={<IconTrend />} pending />
            </div>

            {/* 2-qator: toifalar donuti + ma'lumoti yo'q halqalar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.55fr repeat(3, minmax(0, 1fr))', gap: 10 }}>
                <Panel>
                    <PanelTitle title="Xodimlar toifalari bo'yicha taqsimot" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minHeight: 150 }}>
                        <div style={{ width: 150, height: 150, flexShrink: 0 }}>
                            <Doughnut data={catDonut} options={donutOpts} plugins={[centerCount(String(total), 'kishi')]} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, minWidth: 0 }}>
                            {cats.map((c) => (
                                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, boxShadow: `0 0 5px ${c.color}`, flexShrink: 0 }} />
                                    <span style={{ color: C.sub, flex: 1, opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.label}</span>
                                    <span style={{ color: C.text, fontWeight: 700, flexShrink: 0 }}>{c.count}</span>
                                    <span style={{ color: C.sub, opacity: 0.7, flexShrink: 0, width: 48, textAlign: 'right' }}>({fmt(c.pct, 1)}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>

                <Panel>
                    <PanelTitle title="Ma'lumoti bo'yicha taqsimot" />
                    <EmptyRing icon={<IconCap />} />
                </Panel>
                <Panel>
                    <PanelTitle title="Jinsi bo'yicha taqsimot" />
                    <EmptyRing icon={<IconGender />} />
                </Panel>
                <Panel>
                    <PanelTitle title="Yoshi bo'yicha taqsimot" />
                    <EmptyRing icon={<IconAge />} />
                </Panel>
            </div>

            {/* 3-qator: bosqichlar, bo'linmalar, ish grafiklari */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 0.85fr', gap: 10 }}>
                <Panel>
                    <PanelTitle title="Bosqichlar bo'yicha ishga qabul rejasi" />
                    <div style={{ flex: 1, minHeight: 195 }}>
                        <Bar data={stagesBar} options={stagesOpts} plugins={[vBarLabel]} />
                    </div>
                </Panel>

                <Panel>
                    <PanelTitle title="Bo'linmalar bo'yicha tuzilma" />
                    <div style={{ flex: 1, minHeight: 195 }}>
                        <Bar data={deptBar} options={deptOpts} plugins={[hBarLabel]} />
                    </div>
                </Panel>

                <Panel>
                    <PanelTitle title="Ish grafiklari" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', flex: 1 }}>
                        {DEMO.schedules.map((s, i) => (
                            <div key={s.title} style={{
                                display: 'flex', alignItems: 'center', gap: 11,
                                paddingBottom: i === DEMO.schedules.length - 1 ? 0 : 12,
                                borderBottom: i === DEMO.schedules.length - 1 ? 'none' : `1px solid ${C.border}`,
                            }}>
                                <NeonIcon size={38}>{SCHEDULE_ICONS[s.icon]}</NeonIcon>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ color: C.text, fontSize: 12, fontWeight: 700 }}>{s.title}</div>
                                    <div style={{ color: C.sub, fontSize: 10.5, opacity: 0.75, marginTop: 3 }}>{s.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Panel>
            </div>

            {/* 4-qator: ro'yxatli kartochkalar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 10 }}>
                <ListPanel title="KHY statistikasi" icon={<IconBars />} items={DEMO.kdp} />
                <ListPanel title="Muddati tugayotgan hujjatlar" icon={<IconDoc />} items={DEMO.expiringDocs} />
                <ListPanel title="FHSh (GPH)" icon={<IconHandshake />} items={DEMO.gph} />
                <ListPanel title="Ekspatlar" icon={<IconGlobe />} items={DEMO.expats} />
                <ListPanel title="O'qitish" icon={<IconCapSmall />} items={DEMO.training} />
                <ListPanel title="Tashkiliy tuzilma" icon={<IconBuilding />} items={DEMO.orgStructure} />
            </div>
        </div>
    );
};

export default NewNewHrd;
