import React, { useMemo } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { C, chartBase, axis, noLegend, fmt } from '../../components/dashboardUI';
import HR from './newHrDetailDemoData.json';

/* ── Kichraytirilgan (0.6x) markaziy matn plagini — kichik donutlarga son sig'ishi uchun ── */
const smallCenterText = (main: string, sub: string) => ({
    id: 'centerText',
    afterDraw(chart: any) {
        const { ctx, chartArea } = chart;
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = (chartArea.top + chartArea.bottom) / 2;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = C.text;
        ctx.font = '700 11px "Segoe UI", sans-serif';
        ctx.fillText(main, cx, cy - 1);
        ctx.fillStyle = C.sub;
        ctx.font = '400 7px "Segoe UI", sans-serif';
        ctx.fillText(sub, cx, cy + 10);
        ctx.restore();
    },
});

/* ── Professional dumaloq ikonka (gradient fon + glow, "badge" uslubi) ── */

const NeonIcon: React.FC<{ color: string; size?: number; children: React.ReactNode }> = ({ color, size = 30, children }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(145deg, ${color}40, ${color}12)`,
        border: `1.3px solid ${color}70`,
        boxShadow: `0 0 10px ${color}55, inset 0 0 6px ${color}25`,
        color,
    }}>
        {children}
    </div>
);

/* ── Ikonka to'plami ── */
const IconUsers = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.8 19c.6-3.4 3.1-5.5 6.2-5.5s5.6 2.1 6.2 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="17" cy="8.5" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15.6 13.7c2.6.2 4.6 2 5.1 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconUserCheck = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.5 19.5c.6-3.7 3.2-6 6.5-6s5.9 2.3 6.5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M15.5 11l1.8 1.8L21 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconBriefcase = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="7.5" width="18" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 7.5V5.5a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 12.5h18M10.5 12.5v2h3v-2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);
const IconUserPlus = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.5 19.5c.6-3.7 3.2-6 6.5-6s5.9 2.3 6.5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M18.5 8v6M15.5 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const IconClock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconWallet = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 7.5a2 2 0 012-2h13a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2v-10z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M16 12.5h3.5a1 1 0 011 1v1a1 1 0 01-1 1H16a1.5 1.5 0 010-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M3 8.5l11-4 3 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconCake = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 21v-7a2 2 0 012-2h12a2 2 0 012 2v7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 17.5c1.2.8 2 .8 3 0s1.8-.8 3 0 1.8.8 3 0 1.8-.8 3 0 1.8.8 3 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 12V8M9.5 8.5c0-1.5 2.5-2 2.5-4 0 2 2.5 2.5 2.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconHourglass = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 3h12M6 21h12M7 3c0 5 5 6.5 5 9s-5 4-5 9M17 3c0 5-5 6.5-5 9s5 4 5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconHeartPulse = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 8.5c0-2.5-2-4.3-4.3-4.3-1.5 0-2.8.8-3.7 2-.9-1.2-2.2-2-3.7-2C6 4.2 4 6 4 8.5c0 4.5 8 10.5 8 10.5s8-6 8-10.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6.5 10h2l1.5-2.5 2 5 1.5-2.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconGraduationCap = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 8l10-4 10 4-10 4-10-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6 10.5v4.5c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M20 9v5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconLogout = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 4H6a2 2 0 00-2 2v12a2 2 0 002 2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 8l4 4-4 4M19 12H9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconFileWarning = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 3.5h9l4 4V20a1 1 0 01-1 1H6a1 1 0 01-1-1V4.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M15 3.5V8h4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 11v4M12 17.3h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
);
const IconHandshake = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 13l3-1 4 1.3 4.5-1a2 2 0 012 2v.2a2 2 0 01-1.6 2L9 17.5 3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 13l4-3.5a1.8 1.8 0 012.5 2.5L14 19l-8-2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconGlobe2 = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
);
const IconCalendarBell = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconTrendingDown = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8l6 6 4-4 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 18h6v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconTarget = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
);
const IconBookOpen = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 6.5c-1.6-1.3-3.7-2-6.5-2-1 0-1.5.2-1.5.2v13.3s.5-.2 1.5-.2c2.8 0 4.9.7 6.5 2 1.6-1.3 3.7-2 6.5-2 1 0 1.5.2 1.5.2V4.7s-.5-.2-1.5-.2c-2.8 0-4.9.7-6.5 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 6.5v13.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
);
const IconGear = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M17.7 6.3l-1.5 1.5M7.8 16.2l-1.5 1.5M17.7 17.7l-1.5-1.5M7.8 7.8L6.3 6.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);

const EVENT_ICONS: Record<string, React.ReactNode> = {
    cake: <IconCake />, hourglass: <IconHourglass />, heartPulse: <IconHeartPulse />,
    graduationCap: <IconGraduationCap />, logout: <IconLogout />,
};
const KPI_ICONS: Record<string, React.ReactNode> = {
    users: <IconUsers />, userCheck: <IconUserCheck />, briefcase: <IconBriefcase />,
    userPlus: <IconUserPlus />, clock: <IconClock />, wallet: <IconWallet />,
};

/* ── Ma'lumot turi ── */
type HrData = typeof HR;
const DATA = HR as HrData;

/* ── Yordamchi UI komponentlar ── */
const CardShell: React.FC<{ title: string; icon?: React.ReactNode; color?: string; link?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, color = '#4fb3d9', link, children, style }) => (
    <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 13px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9 }}>
            {icon && <NeonIcon color={color} size={22}>{icon}</NeonIcon>}
            <span style={{ color: '#4fb3d9', fontSize: 11, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>{children}</div>
        {link && (
            <div style={{ marginTop: 8, color: '#4fb3d9', fontSize: 10.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                {link}
            </div>
        )}
    </div>
);

const KpiCard: React.FC<{ item: (typeof DATA.kpi)[number] }> = ({ item }) => (
    <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 13px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: C.sub, fontSize: 10.5, fontWeight: 600 }}>{item.label}</span>
            <NeonIcon color="#4fb3d9" size={26}>{KPI_ICONS[item.icon]}</NeonIcon>
        </div>
        <div style={{ color: C.text, fontSize: 21, fontWeight: 700, lineHeight: 1 }}>
            {item.value}<span style={{ color: C.sub, fontSize: 11, fontWeight: 500, marginLeft: 4 }}>{item.unit}</span>
        </div>
        {item.progress !== undefined ? (
            <>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginTop: 8 }}>
                    <div style={{ height: '100%', width: `${item.progress}%`, background: '#3b82f6', borderRadius: 3, boxShadow: '0 0 6px #3b82f688' }} />
                </div>
                <div style={{ color: C.sub, fontSize: 9.5, marginTop: 4 }}>{item.targetLabel}</div>
            </>
        ) : (
            <div style={{ marginTop: 6, fontSize: 10.5 }}>
                <span style={{ color: item.up ? C.up : C.down, fontWeight: 700 }}>{item.delta}</span>
                <span style={{ color: C.sub, marginLeft: 5 }}>{item.deltaLabel}</span>
            </div>
        )}
    </div>
);

const donutOpts = { ...chartBase, cutout: '68%', ...noLegend } as any;

const DonutCard: React.FC<{ title: string; total: number; totalLabel?: string; items: { label: string; count: number; pct: number; color: string }[] }> = ({ title, total, totalLabel, items }) => {
    const data = useMemo(() => ({
        labels: items.map((i) => i.label),
        datasets: [{ data: items.map((i) => i.count), backgroundColor: items.map((i) => i.color), borderColor: C.card, borderWidth: 2 }],
    }), [items]);
    return (
        <CardShell title={title}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <div style={{ width: 78, height: 78, flexShrink: 0 }}>
                    <Doughnut data={data} options={donutOpts} plugins={[smallCenterText(fmt(total, 0), totalLabel ?? '')]} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
                    {items.map((it) => (
                        <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: it.color, boxShadow: `0 0 4px ${it.color}`, flexShrink: 0 }} />
                            <span style={{ color: C.sub, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.label}</span>
                            <span style={{ color: C.text, fontWeight: 600, flexShrink: 0 }}>{it.count} <span style={{ color: C.sub }}>({it.pct}%)</span></span>
                        </div>
                    ))}
                </div>
            </div>
        </CardShell>
    );
};

const barOpts = (unitSuffix = '') => ({
    ...chartBase, ...noLegend,
    scales: axis({
        y: { ticks: { color: C.sub, font: { size: 9 } } },
        x: { ticks: { color: C.sub, font: { size: 9 } } },
    }),
    plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx: any) => `${fmt(ctx.parsed.y ?? ctx.parsed.x, 0)}${unitSuffix}` } },
    },
} as any);

const AgeBarCard: React.FC = () => {
    const d = DATA.ageComposition;
    const data = useMemo(() => ({
        labels: d.items.map((i) => i.label),
        datasets: [{ data: d.items.map((i) => i.count), backgroundColor: '#3b82f6', borderRadius: 5, maxBarThickness: 34 }],
    }), [d.items]);
    return (
        <CardShell title="Возрастной состав">
            <div style={{ flex: 1, minHeight: 150 }}>
                <Bar data={data} options={barOpts(' чел.')} />
            </div>
            <div style={{ textAlign: 'center', color: C.sub, fontSize: 10, marginTop: 6 }}>Средний возраст: {d.avgAge} лет</div>
        </CardShell>
    );
};

const TenureBarCard: React.FC = () => {
    const d = DATA.tenureDistribution;
    const data = useMemo(() => ({
        labels: d.items.map((i) => i.label),
        datasets: [{ data: d.items.map((i) => i.count), backgroundColor: '#22c55e', borderRadius: 5, maxBarThickness: 34 }],
    }), [d.items]);
    return (
        <CardShell title="Распределение по стажу работы">
            <div style={{ flex: 1, minHeight: 150 }}>
                <Bar data={data} options={barOpts(' чел.')} />
            </div>
            <div style={{ textAlign: 'center', color: C.sub, fontSize: 10, marginTop: 6 }}>Средний стаж: {d.avgTenure} года</div>
        </CardShell>
    );
};

const ScheduleBarCard: React.FC = () => {
    const d = DATA.scheduleDistribution;
    const data = useMemo(() => ({
        labels: d.items.map((i) => i.label),
        datasets: [{ data: d.items.map((i) => i.count), backgroundColor: '#0ea8c7', borderRadius: 5, maxBarThickness: 18 }],
    }), [d.items]);
    return (
        <CardShell title="Распределение по рабочим графикам">
            <div style={{ flex: 1, minHeight: 150 }}>
                <Bar data={data} options={{ ...barOpts(' чел.'), indexAxis: 'y' } as any} />
            </div>
        </CardShell>
    );
};

const InfoRow: React.FC<{ label: string; value: React.ReactNode; delta?: string }> = ({ label, value, delta }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>
        <span style={{ color: C.sub, fontSize: 10.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ color: C.text, fontSize: 11.5, fontWeight: 700 }}>{value}</span>
            {delta && <span style={{ color: delta.startsWith('-') ? C.down : C.up, fontSize: 9.5, fontWeight: 700 }}>{delta}</span>}
        </span>
    </div>
);

const ProgressBarRow: React.FC<{ label: string; pct: number; color?: string }> = ({ label, pct, color = '#3b82f6' }) => (
    <div style={{ marginBottom: 7 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
            <span style={{ color: C.text }}>{label}</span>
            <span style={{ color: C.sub, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, boxShadow: `0 0 5px ${color}88` }} />
        </div>
    </div>
);

/* ── Asosiy komponent ── */
const NewHrDetail: React.FC = () => {
    const kdp = DATA.kdp, docs = DATA.expiringDocs, gph = DATA.gph, expats = DATA.expats, events = DATA.events;
    const turnover = DATA.turnover, reasons = DATA.turnoverReasons, staffing = DATA.staffingByDept, assessment = DATA.assessment, training = DATA.training;

    const assessmentDonut = useMemo(() => ({
        labels: assessment.items.map((i) => i.label),
        datasets: [{ data: assessment.items.map((i) => i.count), backgroundColor: assessment.items.map((i) => i.color), borderColor: C.card, borderWidth: 2 }],
    }), [assessment.items]);

    return (
        <div style={{ background: C.bg, height: '100vh', overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha va tablar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ color: '#4fb3d9', fontSize: 20, fontWeight: 700 }}>{DATA.meta.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/*<div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 13px', color: C.text, fontSize: 12 }}>*/}
                    {/*    <IconCalendarBell />Период: {DATA.meta.period}*/}
                    {/*</div>*/}
                    {/*<button style={{*/}
                    {/*    display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',*/}
                    {/*    background: 'linear-gradient(135deg, #1e4d7b, #0ea8c7)', border: 'none', borderRadius: 8,*/}
                    {/*    color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 14px',*/}
                    {/*    boxShadow: '0 6px 16px rgba(14,168,199,0.3)',*/}
                    {/*}}>*/}
                    {/*    <IconGear />Настроить*/}
                    {/*</button>*/}
                </div>
            </div>
            {/*<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: `1px solid ${C.border}`, paddingBottom: 8 }}>*/}
            {/*    {DATA.meta.tabs.map((t, i) => (*/}
            {/*        <div key={t} style={{*/}
            {/*            padding: '6px 14px', borderRadius: 8, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',*/}
            {/*            color: i === 0 ? '#fff' : C.sub,*/}
            {/*            background: i === 0 ? 'linear-gradient(135deg, #1e4d7b, #0ea8c7)' : 'transparent',*/}
            {/*        }}>*/}
            {/*            {t}*/}
            {/*        </div>*/}
            {/*    ))}*/}
            {/*</div>*/}

            {/* 1-qator: KPI */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {DATA.kpi.map((item) => <KpiCard key={item.label} item={item} />)}
            </div>

            {/* 2-qator: Donut breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <DonutCard title="Разбивка по категориям персонала" total={DATA.categoryBreakdown.total} totalLabel="чел." items={DATA.categoryBreakdown.items} />
                <DonutCard title="Разбивка по уровню образования" total={DATA.educationBreakdown.total} items={DATA.educationBreakdown.items} />
                <DonutCard title="Разбивка по полу" total={DATA.genderBreakdown.total} totalLabel="чел." items={DATA.genderBreakdown.items} />
                <DonutCard title="Разбивка по социальному значению" total={DATA.socialBreakdown.total} totalLabel="чел." items={DATA.socialBreakdown.items} />
            </div>

            {/* 3-qator: bar chartlar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: 8 }}>
                <AgeBarCard />
                <TenureBarCard />
                <ScheduleBarCard />
            </div>

            {/* 4-qator: ma'lumot ro'yxatlari */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                <CardShell title="КДП статистика" icon={<IconFileWarning />} color="#3b82f6" link={kdp.link}>
                    {kdp.items.map((it) => <InfoRow key={it.label} label={it.label} value={it.value} delta={it.delta} />)}
                </CardShell>
                <CardShell title="Истекающие документы (30 дней)" icon={<IconFileWarning />} color="#eab308" link={docs.link}>
                    {docs.items.map((it) => <InfoRow key={it.label} label={it.label} value={it.value} />)}
                </CardShell>
                <CardShell title="ГПХ и подрядчики" icon={<IconHandshake />} color="#a855f7" link={gph.link}>
                    {gph.items.map((it) => <InfoRow key={it.label} label={it.label} value={it.value} />)}
                </CardShell>
                <CardShell title="Экспаты" icon={<IconGlobe2 />} color="#0ea8c7" link={expats.link}>
                    <div style={{ color: C.text, fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Всего экспатов {expats.total}</div>
                    <div style={{ color: C.sub, fontSize: 9.5, marginBottom: 4 }}>По странам:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {expats.byCountry.map((c) => (
                            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                                <span style={{ color: C.sub, flex: 1 }}>{c.label}</span>
                                <span style={{ color: C.text, fontWeight: 600 }}>{c.count}</span>
                            </div>
                        ))}
                    </div>
                </CardShell>
                <CardShell title="События и напоминания" icon={<IconCalendarBell />} color="#ec4899" link={events.link}>
                    {events.items.map((it) => (
                        <div key={it.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0', borderBottom: `1px solid ${C.border}` }}>
                            <NeonIcon color="#ec4899" size={20}>{EVENT_ICONS[it.icon]}</NeonIcon>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ color: C.text, fontSize: 10.5, fontWeight: 600 }}>{it.label}</div>
                                <div style={{ color: C.sub, fontSize: 9.5 }}>{it.value}</div>
                            </div>
                        </div>
                    ))}
                </CardShell>
            </div>

            {/* 5-qator */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                <CardShell title="Текучесть кадров" icon={<IconTrendingDown />} color="#ef4444">
                    <div style={{ color: C.sub, fontSize: 10 }}>{turnover.period}</div>
                    <div style={{ color: C.text, fontSize: 26, fontWeight: 700, marginTop: 4 }}>{turnover.rate}%</div>
                    <div style={{ marginTop: 6, fontSize: 10.5 }}>
                        <span style={{ color: turnover.up ? C.up : C.down, fontWeight: 700 }}>{turnover.delta}</span>
                        <span style={{ color: C.sub, marginLeft: 5 }}>{turnover.deltaLabel}</span>
                    </div>
                </CardShell>
                <CardShell title="Причины увольнений (топ 5)" icon={<IconTrendingDown />} color="#eab308">
                    {reasons.items.map((it) => <ProgressBarRow key={it.label} label={it.label} pct={it.pct} color="#3b82f6" />)}
                </CardShell>
                <CardShell title="Укомплектованность по подразделениям (топ 5)" icon={<IconTarget />} color="#22c55e" link={staffing.link}>
                    {staffing.items.map((it) => <ProgressBarRow key={it.label} label={it.label} pct={it.pct} color="#22c55e" />)}
                </CardShell>
                <CardShell title="Оценка персонала" icon={<IconTarget />} color="#3b82f6" link={assessment.link}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        <div style={{ width: 64, height: 64, flexShrink: 0 }}>
                            <Doughnut data={assessmentDonut} options={donutOpts} plugins={[smallCenterText(`${assessment.coveragePct}%`, 'Охват оценкой')]} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                            {assessment.items.map((it) => (
                                <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9.5 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: it.color, flexShrink: 0 }} />
                                    <span style={{ color: C.sub, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.label}</span>
                                    <span style={{ color: C.text, fontWeight: 600 }}>{it.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardShell>
                <CardShell title="Обучение и развитие" icon={<IconBookOpen />} color="#a855f7" link={training.link}>
                    <div style={{ color: C.sub, fontSize: 10 }}>План обучения выполнен на</div>
                    <div style={{ color: C.text, fontSize: 24, fontWeight: 700, margin: '4px 0' }}>{training.planPct}%</div>
                    <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: 8 }}>
                        <div style={{ height: '100%', width: `${training.planPct}%`, background: '#a855f7', borderRadius: 3, boxShadow: '0 0 5px #a855f788' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{training.assigned}</div>
                            <div style={{ color: C.sub, fontSize: 8.5 }}>Назначено</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{training.completed}</div>
                            <div style={{ color: C.sub, fontSize: 8.5 }}>Пройдено</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{training.hours}</div>
                            <div style={{ color: C.sub, fontSize: 8.5 }}>Часов</div>
                        </div>
                    </div>
                </CardShell>
            </div>
        </div>
    );
};

export default NewHrDetail;
