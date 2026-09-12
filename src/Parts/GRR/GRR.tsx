import React, { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { C, chartBase, noLegend, axis, centerText, fmt } from '../../components/dashboardUI';
import { GC } from '../../theme/palette';
import { useGeologyDashboard } from '../../hooks/geology';
import type { GeologyProject } from '../../services/geology';
import {useNavigate} from "react-router-dom";

/* ── Neon ikonka (dizayn tizimiga mos, gradient + glow) ── */
const NeonIcon: React.FC<{ color?: string; size?: number; children: React.ReactNode }> = ({ size = 34, children }) => (
    <div style={{
        width: size, height: size, borderRadius: size >= 40 ? 12 : 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${GC.icon}33, ${GC.icon}0a)`,
        border: `1px solid ${GC.icon}55`,
        boxShadow: `0 0 10px ${GC.icon}55, inset 0 0 6px ${GC.icon}22`,
        color: GC.icon,
    }}>
        {children}
    </div>
);

/* ── Ikonkalar to'plami ── */
const IconLayers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l9 5-9 5-9-5 9-5z" fill="currentColor" opacity="0.85" />
        <path d="M3 13l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 17l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" opacity="0.6" />
    </svg>
);
const IconFolder = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6.5A1.5 1.5 0 014.5 5h4.6l2 2.4H19.5A1.5 1.5 0 0121 8.9v9.6A1.5 1.5 0 0119.5 20h-15A1.5 1.5 0 013 18.5v-12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
);
const IconPulse = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12h4l2-7 4 14 2-7h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconCheck = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconSearch = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
        <path d="M20 20l-4.3-4.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
);
const IconCoins = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="9" cy="7" rx="6" ry="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 7v10c0 1.7 2.7 3 6 3s6-1.3 6-3V7" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15 9.5c2.9.3 6 1.4 6 3.5s-3.1 3.2-6 3.5M15 17c2.9.3 6 1.4 6 3.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
);
const IconGauge = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 15a8 8 0 1116 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 15l4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="15" r="1.3" fill="currentColor" />
    </svg>
);
const IconBars = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconTrend = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 17l6-6 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconStar = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.2L12 16.9l-5.6 3.1 1.4-6.2-4.8-4.3 6.4-.6L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconClock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconWarning = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4l9 16H3L12 4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const IconPie = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3v9l7.8 4.5A9 9 0 1112 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconMapPin = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21s7-6.4 7-11.5A7 7 0 105 9.5C5 14.6 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
);
const IconCube = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l8 4.6v8.8L12 21l-8-4.6V7.6L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M4 7.6L12 12l8-4.4M12 12v9" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
);
const IconGrid = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);
const IconExpand = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconRotate = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M18 4v4h-4M6 20v-4h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ICON_MAP: Record<string, React.ReactNode> = {
    folder: <IconFolder />, pulse: <IconPulse />, check: <IconCheck />, search: <IconSearch />,
    coins: <IconCoins />, gauge: <IconGauge />, bars: <IconBars />, trend: <IconTrend />,
    star: <IconStar />, clock: <IconClock />, warning: <IconWarning />, pie: <IconPie />,
};

/* ── Bo'lim kartochkasi (umumiy dizayn tizimidagi konvensiya) ── */
const SectionCard: React.FC<{
    title: string; icon?: React.ReactNode; iconColor?: string; hint?: string;
    children: React.ReactNode; style?: React.CSSProperties; bodyStyle?: React.CSSProperties;
}> = ({ title, icon, iconColor = GC.cyan, hint, children, style, bodyStyle }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexShrink: 0 }}>
            <div style={{ color: GC.cyan, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon && <NeonIcon color={iconColor} size={22}>{icon}</NeonIcon>}{title}
            </div>
            {hint && <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>{hint}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, ...bodyStyle }}>
            {children}
        </div>
    </div>
);

/* Ish rejasi bajarilish foizi bo'yicha rang — ko'k oiladan, yuqori foiz to'qroq ko'k. */
const readinessColor = (v: number) => (v >= 60 ? GC.accent1 : v >= 40 ? GC.accent3 : GC.accent4);

/* Ish rejasi mavjud loyihalarda "Бажарилди" bandlarining ulushi.
   Ish rejasi umuman bo'lmagan loyihalarda `null` — bu 0% bilan bir xil emas
   (ish rejasi API §5 bo'yicha 46 tadan faqat 36 tasida bor). */
const workReadiness = (p: GeologyProject): number | null => {
    if (!p.works.length) return null;
    const done = p.works.filter((w) => w.status === 'Бажарилди').length;
    return Math.round((done / p.works.length) * 100);
};

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
const formatAsOf = (iso: string): string => {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    return `${d}-${UZ_MONTHS[m - 1]}, ${y}-yil`;
};

/* Bo'sh/mavjud bo'lmagan ma'lumot uchun umumiy holat ko'rsatkichi (kartani
   butunlay yashirmasdan, nega bo'sh ekanini tushuntiradi). */
const EmptyNote: React.FC<{ text: string }> = ({ text }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, textAlign: 'center', padding: '0 12px' }}>
        <span style={{ color: C.sub, opacity: 0.6 }}><IconWarning /></span>
        <div style={{ color: C.sub, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase' }}>Ma'lumot yo'q</div>
        <div style={{ color: C.sub, fontSize: 9.5, lineHeight: 1.45, opacity: 0.85 }}>{text}</div>
    </div>
);

const GRR: React.FC = () => {
    const { data, isLoading, isError } = useGeologyDashboard();

    let navigate = useNavigate();
    const view = useMemo(() => {
        if (!data) return null;
        const { projects, summary, meta } = data;

        const doneWorks = summary.works.byStatus.find((s) => s.key === 'Бажарилди')?.count ?? 0;
        const totalWorks = summary.works.total;

        /* Metallar taqsimoti — 6-bo'lim: `metals` maydoni vergul bilan ajratilgan
           erkin matn, bitta loyihada bir nechta metall bo'lishi mumkin — shuning
           uchun foiz emas, loyiha soni ko'rsatiladi (100% ga yig'ilmaydi). */
        const metalsCount = new Map<string, number>();
        let metalsUnspecified = 0;
        projects.forEach((p) => {
            const raw = p.metals?.trim();
            if (!raw || raw === '—') { metalsUnspecified += 1; return; }
            raw.split(',').map((s) => s.trim()).filter(Boolean).forEach((m) => {
                metalsCount.set(m, (metalsCount.get(m) ?? 0) + 1);
            });
        });
        const metalsSorted = Array.from(metalsCount.entries()).sort((a, b) => b[1] - a[1]);
        const topMetals = metalsSorted.slice(0, 7);
        const restCount = metalsSorted.slice(7).reduce((s, [, c]) => s + c, 0);
        const metalsDistribution = [
            ...topMetals.map(([label, count]) => ({ label, count })),
            ...(restCount > 0 ? [{ label: 'Boshqa', count: restCount }] : []),
            ...(metalsUnspecified > 0 ? [{ label: "Ko'rsatilmagan", count: metalsUnspecified }] : []),
        ];

        const projectsWithBudget2026 = projects
            .filter((p) => typeof p.volume?.budgetMlnUsd2026 === 'number' && (p.volume?.budgetMlnUsd2026 ?? 0) > 0)
            .sort((a, b) => (b.volume!.budgetMlnUsd2026 as number) - (a.volume!.budgetMlnUsd2026 as number))
            .slice(0, 10);

        const missing = (sel: (p: GeologyProject) => unknown) => projects.filter((p) => sel(p) == null).length;

        return {
            projects, summary, meta, doneWorks, totalWorks,
            metalsDistribution, projectsWithBudget2026,
            dataQuality: {
                cost: missing((p) => p.costMlnUsd),
                funding: missing((p) => p.funding),
                partner: missing((p) => p.partner),
            },
        };
    }, [data]);

    if (isLoading || !view) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub, fontSize: 13, fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
                {isError ? "Geologiya loyihalari ma'lumotini yuklab bo'lmadi" : 'Geologiya loyihalari yuklanmoqda…'}
            </div>
        );
    }

    const { projects, summary, meta, doneWorks, totalWorks, metalsDistribution, projectsWithBudget2026, dataQuality } = view;

    const kpis: { label: string; value: string; unit: string; icon: string; color: string; muted?: boolean }[] = [
        { label: 'PORTFELDAGI LOYIHALAR', value: String(summary.totalProjects), unit: 'loyiha', icon: 'folder', color: GC.accent1 },
        ...summary.byGroup.map((g, i) => ({
            label: g.key.toUpperCase(), value: String(g.count), unit: 'loyiha',
            icon: i === 0 ? 'pulse' : 'search', color: i === 0 ? GC.accent2 : GC.accent3,
        })),
        { label: 'ISH REJASI BAJARILDI', value: `${doneWorks}/${totalWorks}`, unit: totalWorks ? `${fmt((doneWorks / totalWorks) * 100, 0)}% bandlar` : "ma'lumot yo'q", icon: 'check', color: GC.accent1 },
        { label: 'PORTFEL BYUDJETI', value: fmt(summary.cost.totalMlnUsd, 2), unit: `mln $ · ${summary.cost.projectsWithCost}/${summary.totalProjects} loyihada`, icon: 'coins', color: GC.blue },
        { label: '2026 YIL BYUDJETI', value: fmt(summary.volumes2026.budgetMlnUsd, 2), unit: `mln $ · ${summary.volumes2026.projectsWithVolumes}/${summary.totalProjects} loyihada`, icon: 'bars', color: GC.accent2 },
        { label: "O'ZLASHTIRILDI", value: '—', unit: "ma'lumot manbada yo'q", icon: 'gauge', color: C.sub, muted: true },
        { label: 'PORTFEL IRR', value: '—', unit: "moliyaviy model manbada yo'q", icon: 'trend', color: C.sub, muted: true },
    ];

    const vol = summary.volumes2026;
    const doneIfReported = (val: number, reported: number) => (reported > 0 ? val : null);
    const volumesData = {
        labels: ["Burg'ilash, p.m", 'Namunalash, dona', 'Kanava, m³'],
        datasets: [
            { label: 'Reja', data: [vol.drillPlan, vol.samplePlan, vol.trenchPlan], backgroundColor: GC.accent3, borderRadius: 3, barPercentage: 0.6, categoryPercentage: 0.6 },
            {
                label: 'Bajarildi (hisobot bergan loyihalar)',
                data: [doneIfReported(vol.drillDone, vol.drillDoneReported), doneIfReported(vol.sampleDone, vol.sampleDoneReported), doneIfReported(vol.trenchDone, vol.trenchDoneReported)],
                backgroundColor: GC.accent1, borderRadius: 3, barPercentage: 0.6, categoryPercentage: 0.6,
            },
        ],
    };

    const budget2026Data = {
        labels: projectsWithBudget2026.map((p) => p.shortName),
        datasets: [{ label: '2026 yil byudjeti, mln $', data: projectsWithBudget2026.map((p) => p.volume!.budgetMlnUsd2026), backgroundColor: GC.accent1, borderRadius: 2, barPercentage: 0.7 }],
    };

    const stagesDonut = {
        labels: summary.byGroup.map((g) => g.key),
        datasets: [{ data: summary.byGroup.map((g) => g.count), backgroundColor: [GC.accent1, GC.accent3, GC.accent4], borderColor: C.card, borderWidth: 2 }],
    };

    const maxMetal = Math.max(...metalsDistribution.map((m) => m.count), 1);

    const findings = [
        { icon: 'star', title: 'Manba', text: meta.source, color: GC.cyan },
        { icon: 'clock', title: 'Holat sanasi', text: `Ko'rsatkichlar ${formatAsOf(meta.asOf)} holatiga`, color: GC.slate },
        { icon: 'check', title: 'Ish rejasi bajarilishi', text: `${totalWorks} banddan ${doneWorks} tasi bajarilgan (${summary.works.projectsWithWorks}/${summary.totalProjects} loyihada ish rejasi bor)`, color: GC.green },
        { icon: 'warning', title: "To'ldirilmagan maydonlar", text: `Byudjet — ${dataQuality.cost}/${summary.totalProjects}, moliyalash manbai — ${dataQuality.funding}/${summary.totalProjects}, hamkor — ${dataQuality.partner}/${summary.totalProjects} loyihada ko'rsatilmagan`, color: GC.amber },
    ];

    return (
        <div style={{
            width: '100%', height: '100%', minHeight: 0,
            overflowY: 'auto', padding: "0 14px", boxSizing: 'border-box',
            fontFamily: '"Segoe UI", system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div>
                        <div style={{ color: 'rgb(241, 242, 246)', fontSize: 14, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Geologiya-qidiruv ishlari boshqaruvi</div>
                    </div>
                </div>
                {/*<span style={{ color: C.sub, fontSize: 11 }}>{formatAsOf(meta.asOf)} holatiga</span>*/}
                <div style={{
                    background: C.card, border: `1px solid ${C.border}`, borderRadius: 'clamp(4px, 1.1cqmin, 8px)',
                    padding: '4px 15px', color: C.text,
                    fontSize: '9px', display: 'flex', gap: 6, whiteSpace: 'nowrap',
                    cursor: 'pointer',
                }}
                     onClick={() => navigate("/main/iframe/geology")}
                >Batafsil
                </div>
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8, flexShrink: 0 }}>
                {kpis.map((k) => (
                    <div key={k.label} style={{ minWidth: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <NeonIcon color={k.color} size={26}>{ICON_MAP[k.icon]}</NeonIcon>
                            <span style={{ color: C.sub, fontSize: 8.7, fontWeight: 600, letterSpacing: 0.3, textTransform: 'uppercase', lineHeight: 1.25 }}>{k.label}</span>
                        </div>
                        <div>
                            <div style={{ color: k.muted ? C.sub : C.text, fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{k.value}</div>
                            <div style={{ color: C.sub, fontSize: 10, marginTop: 3 }}>{k.unit}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Asosiy 3 ustunli qism */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.6fr 1fr', gap: 8, minHeight: 280 }}>

                {/* Portfel loyihalari */}
                <SectionCard title="Loyihalar portfeli" icon={<IconFolder />} hint={`${projects.length} ta`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, paddingBottom: 6, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                        <span>Loyiha</span>
                        <span>Ish rejasi bajarilishi</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, overflowY: 'auto', flex: 1, paddingTop: 8, minHeight: 0 }}>
                        {projects.map((p) => {
                            const readiness = workReadiness(p);
                            return (
                                <div key={p.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ color: C.sub, fontSize: 10.5, flexShrink: 0 }}>#{p.projectNo}</span>
                                                <span style={{ color: C.text, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.shortName}</span>
                                            </div>
                                            <div style={{ color: GC.cyan, fontSize: 10.5, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {p.direction}{p.region ? ` · ${p.region}` : ''}{p.endYear ? ` · ${p.endYear}` : ''}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                            {readiness !== null
                                                ? <span style={{ color: C.text, fontSize: 11.5, fontWeight: 700 }}>{readiness}%</span>
                                                : <span style={{ color: C.sub, fontSize: 9.5 }}>reja yo'q</span>}
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginTop: 5 }}>
                                        <div style={{ width: `${readiness ?? 0}%`, height: '100%', background: readiness !== null ? readinessColor(readiness) : 'transparent', borderRadius: 3 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionCard>

                {/* 3D geologik model — manbada bunday ma'lumot yo'q, rasm o'zgarishsiz qoladi */}
                <SectionCard title="3D geologik model" icon={<IconCube />} bodyStyle={{ gap: 8 }}>
                    <div style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                        <img src="/imgs/r6.jpg" alt="3D geologik model" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'saturate(1.05) brightness(0.85)' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,15,29,0.15) 0%, rgba(10,15,29,0.05) 45%, rgba(10,15,29,0.75) 100%)' }} />

                        {/* Zonalar mineralizatsiyasi legendasi */}
                        <div style={{
                            position: 'absolute', top: 10, right: 10, width: 178,
                            background: 'rgba(10,15,29,0.78)', backdropFilter: 'blur(6px)',
                            border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px',
                        }}>
                            <div style={{ color: GC.cyan, fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, paddingBottom: 5, marginBottom: 6 }}>
                                Mineralizatsiya zonalari
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {[
                                    { label: 'Cu-Sb-W-Bi-Co-Zn-Pb', color: '#1D4ED8' },
                                    { label: 'Li (litiyli)', color: '#3B82F6' },
                                    { label: 'W (volframli)', color: '#60A5FA' },
                                    { label: 'REE (noyob yer elementlari)', color: '#93C5FD' },
                                    { label: 'Au (oltin konlari)', color: '#DBEAFE' },
                                    { label: 'U (uranli)', color: '#BFDBFE' },
                                    { label: 'Fosforitli', color: '#1D4ED8' },
                                    { label: 'Grafitli', color: '#94a3b8' },
                                    { label: 'Istiqbolli tuzilmalar', color: '#e2e8f0' },
                                ].map((m) => (
                                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ width: 7, height: 7, borderRadius: 2, background: m.color, flexShrink: 0, boxShadow: `0 0 4px ${m.color}` }} />
                                        <span style={{ color: C.text, fontSize: 9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hudud yorlig'i */}
                        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(10,15,29,0.78)', backdropFilter: 'blur(6px)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px' }}>
                            <span style={{ color: GC.cyan }}><IconMapPin /></span>
                            <span style={{ color: C.text, fontSize: 10.5, fontWeight: 600 }}>Minerallar hududi</span>
                        </div>

                        {/* Pastki dekorativ asboblar paneli */}
                        <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'rgba(10,15,29,0.78)', backdropFilter: 'blur(6px)', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.sub }}>
                                <IconCube /><IconLayers /><IconGrid /><IconExpand /><IconRotate />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sub, fontSize: 9.5 }}>
                                Kesimlar:
                                {['X', 'Y', 'Z'].map((ax) => (
                                    <span key={ax} style={{ width: 18, height: 18, borderRadius: 4, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, fontSize: 9.5, fontWeight: 700 }}>{ax}</span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sub, fontSize: 9.5 }}>
                                Shaffoflik:
                                <div style={{ width: 70, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '60%', borderRadius: 2, background: GC.cyan }} />
                                </div>
                                <span style={{ color: C.text, fontWeight: 700 }}>60%</span>
                            </div>
                        </div>
                    </div>
                </SectionCard>

                {/* Loyihalar bo'yicha xulosa */}
                <SectionCard title="Loyihalar bo'yicha xulosa" icon={<IconBars />} bodyStyle={{ overflowY: 'auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, flexShrink: 0, marginBottom: 10 }}>
                        {[
                            { label: 'Jami loyihalar', value: summary.totalProjects },
                            ...summary.byGroup.map((g) => ({ label: g.key, value: g.count })),
                            { label: 'Ish rejasi bajarildi', value: `${doneWorks}/${totalWorks}` },
                        ].map((s) => (
                            <div key={s.label} style={{ textAlign: 'center', background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 4px' }}>
                                <div style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>{s.value}</div>
                                <div style={{ color: C.sub, fontSize: 8, marginTop: 2, lineHeight: 1.2 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 11.5, marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: C.sub }}>Portfel byudjeti:</span>
                            <span style={{ color: C.text, fontWeight: 700 }}>{fmt(summary.cost.totalMlnUsd, 2)} mln $</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: C.sub }}>2026 yil byudjeti:</span>
                            <span style={{ color: C.text, fontWeight: 700 }}>{fmt(summary.volumes2026.budgetMlnUsd, 2)} mln $</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: C.sub }}>Kutilayotgan tushum:</span>
                            <span style={{ color: C.sub, fontWeight: 600 }}>Ma'lumot yo'q</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: C.sub }}>Diskontlangan tushum:</span>
                            <span style={{ color: C.sub, fontWeight: 600 }}>Ma'lumot yo'q</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: C.sub }}>Kutilayotgan NPV (8%):</span>
                            <span style={{ color: C.sub, fontWeight: 600 }}>Ma'lumot yo'q</span>
                        </div>
                    </div>

                    <div style={{ color: GC.cyan, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
                        Portfelning o'rtacha vaznli tarkibi
                    </div>
                    <div style={{ color: C.sub, fontSize: 10, lineHeight: 1.45, marginBottom: 12 }}>
                        Ma'lumot yo'q — element tarkibi (greyd, %) faqat 10/{summary.totalProjects} loyihada, u ham erkin matn ichida (masalan «Vanadiy 81,5 ming t, tarkibi 0,89%») — tuzilgan raqamli maydon sifatida mavjud emas.
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <div style={{ flex: 1, textAlign: 'center', background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 4px' }}>
                            <div style={{ color: C.sub, fontSize: 9 }}>Loyihalar bahosi (NPV10%, mln dollar)</div>
                            <div style={{ color: C.sub, fontSize: 15, fontWeight: 700, marginTop: 3 }}>Ma'lumot yo'q</div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 4px' }}>
                            <div style={{ color: C.sub, fontSize: 9 }}>Portfel IRR</div>
                            <div style={{ color: C.sub, fontSize: 15, fontWeight: 700, marginTop: 3 }}>Ma'lumot yo'q</div>
                        </div>
                    </div>

                    <div style={{ color: GC.cyan, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>
                        Loyiha guruhlari
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 84, height: 84, flexShrink: 0 }}>
                            <Doughnut data={stagesDonut} options={{ ...chartBase, cutout: '65%', ...noLegend } as any} plugins={[centerText(`${summary.totalProjects}`, 'loyiha')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                            {summary.byGroup.map((g, i) => (
                                <div key={g.key} style={{ display: 'flex', alignItems: 'center', fontSize: 10.5 }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: [GC.accent1, GC.accent3, GC.accent4][i % 3], marginRight: 5, flexShrink: 0 }} />
                                    <span style={{ color: C.text, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.key}</span>
                                    <span style={{ color: C.text, fontWeight: 600 }}>{g.count}</span>
                                    <span style={{ color: C.sub, marginLeft: 4 }}>({fmt((g.count / summary.totalProjects) * 100, 0)}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Pastki grafiklar qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, height: 250 }}>
                <SectionCard title="2026 yil ish hajmlari — reja va bajarilishi" icon={<IconLayers />} iconColor={GC.accent1}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar data={volumesData} options={{ ...chartBase, plugins: { legend: { display: true, position: 'top', labels: { color: C.sub, boxWidth: 7, boxHeight: 7, usePointStyle: true, font: { size: 8.5 } } } }, scales: axis({ x: { ticks: { font: { size: 8.5 } } }, y: { beginAtZero: true } }) } as any} />
                    </div>
                    {summary.volumes2026.trenchDoneReported === 0 && (
                        <div style={{ color: C.sub, fontSize: 8.5, marginTop: 6, lineHeight: 1.35, flexShrink: 0 }}>
                            * Kanava bo'yicha bajarilgan hajm birorta loyihada hisobot qilinmagan (hisobot yo'q, 0 bajarilgan emas).
                        </div>
                    )}
                </SectionCard>

                {/*<SectionCard title="Element guruhlari bo'yicha o'rtacha tarkib" icon={<IconGauge />} iconColor={GC.violet}>*/}
                {/*    <EmptyNote text="Tarkib (greyd, %) manbada faqat 10/46 loyihada, erkin matn ichida — tuzilgan raqamli maydon sifatida yo'q, diagramma qurib bo'lmaydi." />*/}
                {/*</SectionCard>*/}

                <SectionCard title="2026 yil byudjeti — loyihalar kesimida, mln $" icon={<IconCoins />} iconColor={GC.cyan} hint={`${projectsWithBudget2026.length}/${summary.totalProjects} loyihada`}>
                    {projectsWithBudget2026.length ? (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar data={budget2026Data} options={{
                                ...chartBase, indexAxis: 'y' as const, ...noLegend,
                                scales: { x: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 9 } } }, y: { grid: { display: false }, ticks: { color: C.sub, font: { size: 8.5 } } } },
                            } as any} />
                        </div>
                    ) : (
                        <EmptyNote text="2026 yil byudjeti bo'yicha loyiha kesimidagi ma'lumot yo'q." />
                    )}
                </SectionCard>

                <SectionCard title="Metallar bo'yicha taqsimot" icon={<IconPie />} iconColor={GC.amber} hint="loyiha soni">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1, overflowY: 'auto', minHeight: 0 }}>
                        {metalsDistribution.map((m, i) => (
                            <div key={m.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
                                    <span style={{ color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.label}</span>
                                    <span style={{ color: C.sub, flexShrink: 0, marginLeft: 6 }}>{m.count} loyiha</span>
                                </div>
                                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{ width: `${(m.count / maxMetal) * 100}%`, height: '100%', background: [GC.accent1, GC.accent2, GC.accent3, GC.accent4, GC.accent5][i % 5], borderRadius: 3 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ color: C.sub, fontSize: 8.5, marginTop: 8, lineHeight: 1.35, flexShrink: 0 }}>
                        Bitta loyihada bir nechta metall bo'lishi mumkin — shuning uchun ulush emas, loyiha soni ko'rsatilgan.
                    </div>
                </SectionCard>
            </div>

            {/* Asosiy xulosalar */}
            <SectionCard title="" style={{ padding: '12px 14px', flexShrink: 0 }} bodyStyle={{ flexDirection: 'row', gap: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, width: '100%' }}>
                    {findings.map((f) => (
                        <div key={f.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
                            <NeonIcon color={f.color} size={30}>{ICON_MAP[f.icon]}</NeonIcon>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ color: C.text, fontSize: 11.5, fontWeight: 700 }}>{f.title}</div>
                                <div style={{ color: C.sub, fontSize: 10.5, marginTop: 3, lineHeight: 1.4 }}>{f.text}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
};

export default GRR;
