import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { C, chartBase, noLegend, centerText } from '../../components/dashboardUI';
import esgData from './esgDemoData.json';

/* ▼▼▼ ADDED-SCALE: shu blokni (useAutoScale + BASE_W/BASE_H) olib tashlasangiz
   va pastdagi ikkita "ADDED-SCALE" belgili joyni asl holatiga qaytarsangiz,
   komponent avvalgi (scale'siz) holatiga qaytadi. ── */
const ESG_BASE_W = 1920;
const ESG_BASE_H = 1080;

function useAutoScale(baseW: number, baseH: number) {
    const hostRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState({ x: 1, y: 1 });

    useEffect(() => {
        const el = hostRef.current;
        if (!el) return;
        const update = () => {
            const { width, height } = el.getBoundingClientRect();
            if (width === 0 || height === 0) return;
            setScale({ x: width / baseW, y: height / baseH });
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        window.addEventListener('resize', update);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', update);
        };
    }, [baseW, baseH]);

    return { hostRef, scale };
}
/* ▲▲▲ ADDED-SCALE: tugadi ▲▲▲ */

/* ── Neon ikonkalar (dizayn tizimiga mos, gradient + glow) ── */

const NeonIcon: React.FC<{ color: string; size?: number; children: React.ReactNode }> = ({ color, size = 34, children }) => (
    <div style={{
        width: size, height: size, borderRadius: size >= 40 ? 12 : 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${color}33, ${color}0a)`,
        border: `1px solid ${color}55`,
        boxShadow: `0 0 10px ${color}55, inset 0 0 6px ${color}22`,
        color,
    }}>
        {children}
    </div>
);

const IconShield = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9.5 12l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconLeaf = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 19c8 0 14-6 14-14 0 0-11-2-14 7-1.6 4.9 0 7 0 7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M5 19c0-4 2-7 6-10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconHeartPulse = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 8.5c0-2.5-2-4.3-4.3-4.3-1.5 0-2.8.8-3.7 2-.9-1.2-2.2-2-3.7-2C6 4.2 4 6 4 8.5c0 4.5 8 10.5 8 10.5s8-6 8-10.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6.5 10h2l1.5-2.5 2 5 1.5-2.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconCloud = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 18h10a4 4 0 000-8 5.5 5.5 0 00-10.5-1.8A4.5 4.5 0 007 18z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
);
const IconDroplet = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3s6.5 7 6.5 11.5a6.5 6.5 0 01-13 0C5.5 10 12 3 12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
);
const IconAlertTriangle = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3.5L21.5 20h-19L12 3.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M12 9.5v4.2M12 16.7h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
);
const IconZap = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
);
const IconRecycle = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 4.5L7 9h4M14.5 4.5L17 9h-4M6 15l-2.2 3.8L6 20h4M18 15l2.2 3.8L18 20h-4M10.5 20h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconTarget = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
);
const IconUsers = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.8 19c.6-3.4 3.1-5.5 6.2-5.5s5.6 2.1 6.2 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="17" cy="8.5" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15.6 13.7c2.6.2 4.6 2 5.1 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconBookOpen = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 6.5c-1.6-1.3-3.7-2-6.5-2-1 0-1.5.2-1.5.2v13.3s.5-.2 1.5-.2c2.8 0 4.9.7 6.5 2 1.6-1.3 3.7-2 6.5-2 1 0 1.5.2 1.5.2V4.7s-.5-.2-1.5-.2c-2.8 0-4.9.7-6.5 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 6.5v13.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
);
const IconHandHeart = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 13l3-1 4 1.3 4.5-1a2 2 0 012 2v.2a2 2 0 01-1.6 2L9 17.5 3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 13l4-3.5a1.8 1.8 0 012.5 2.5L14 19l-8-2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.5 6.2c-.7-.9-2-1-2.7-.1-.7-.9-2-.8-2.7.1-.7.9-.4 1.9.4 2.6l2.3 2 2.3-2c.8-.7 1.1-1.7.4-2.6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
);
const IconGauge = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 15.5a8 8 0 1116 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 15.5l3.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="15.5" r="1.3" fill="currentColor" />
    </svg>
);
const IconCalendarCheck = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M8.5 14.5l2.2 2.2L15.5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconClipboardList = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <rect x="9" y="2" width="6" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 11.5h7M8.5 15h7M8.5 8.5h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconGraduationCap = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 8l10-4 10 4-10 4-10-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6 10.5v4.5c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M20 9v5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconSun = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconPieChart = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.5A9.5 9.5 0 1121.5 12H12V2.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 12L4.5 6.5A9.5 9.5 0 0012 21.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
);
const IconFlag = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 21V4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M5 4h13l-3 4 3 4H5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
);
const IconArrowRight = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ICONS: Record<string, React.ReactNode> = {
    shield: <IconShield />, leaf: <IconLeaf />, 'heart-pulse': <IconHeartPulse />, cloud: <IconCloud />,
    droplet: <IconDroplet />, 'alert-triangle': <IconAlertTriangle />, zap: <IconZap />, recycle: <IconRecycle />,
    target: <IconTarget />, users: <IconUsers />, 'book-open': <IconBookOpen />, 'hand-heart': <IconHandHeart />,
    gauge: <IconGauge />, 'calendar-check': <IconCalendarCheck />, 'clipboard-list': <IconClipboardList />,
    'graduation-cap': <IconGraduationCap />, sun: <IconSun />,
};

/* ── ESG demo ma'lumotlar turi (esgDemoData.json) ── */

type EsgItem = { label: string; value: string; unit: string; delta: number; icon: string };
type EsgKpi = { key: string; label: string; value: string; unit: string; delta: number; icon: string };
type EsgExec = { label: string; value: number; color: string; icon: string };
type EsgSentiment = { label: string; value: number; color: string };

type EsgData = {
    generatedAt: string;
    status: string;
    goal: string;
    kpi: EsgKpi[];
    ecology: EsgItem[];
    social: EsgItem[];
    governance: EsgItem[];
    kpiExecution: EsgExec[];
    sentiment: EsgSentiment[];
};

const DATA = esgData as unknown as EsgData;

const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; iconColor?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, iconColor = '#4fb3d9', children, style }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        <div style={{ color: '#4fb3d9', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon && <NeonIcon color={iconColor} size={22}>{icon}</NeonIcon>}{title}
        </div>
        {children}
    </div>
);

const MiniStatRow: React.FC<{ item: EsgItem; color: string }> = ({ item, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 10px', marginBottom: 7 }}>
        <NeonIcon color={color} size={26}>{ICONS[item.icon]}</NeonIcon>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
            <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>{item.value}{item.unit && <span style={{ color: C.sub, fontSize: 11, fontWeight: 400, marginLeft: 4 }}>{item.unit}</span>}</div>
        </div>
        <div style={{ color: item.delta >= 0 ? '#22c55e' : C.down, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
            {item.delta >= 0 ? '▲' : '▼'} {Math.abs(item.delta)}%
        </div>
    </div>
);

const ProgressTile: React.FC<{ item: EsgExec }> = ({ item }) => (
    <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 11px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
            <NeonIcon color={item.color} size={22}>{ICONS[item.icon]}</NeonIcon>
            <span style={{ color: C.text, fontSize: 11.5, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
            <span style={{ color: C.text, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{item.value}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${item.value}%`, background: item.color, borderRadius: 3, boxShadow: `0 0 5px ${item.color}88` }} />
        </div>
    </div>
);

const donutOptions = { ...chartBase, cutout: '68%', ...noLegend } as any;

const ESG: React.FC = () => {
    const navigate = useNavigate();
    /* ADDED-SCALE: ota konteynerni width:100%/height:100% to'liq to'ldirish uchun */
    const { hostRef, scale } = useAutoScale(ESG_BASE_W, ESG_BASE_H);
    const sentimentTotal = useMemo(() => DATA.sentiment.reduce((s, x) => s + x.value, 0), []);

    const sentimentDonut = useMemo(() => ({
        labels: DATA.sentiment.map((s) => s.label),
        datasets: [{ data: DATA.sentiment.map((s) => s.value), backgroundColor: DATA.sentiment.map((s) => s.color), borderColor: C.card, borderWidth: 2 }],
    }), []);

    const generated = new Date(DATA.generatedAt);
    const kpiColor: Record<string, string> = { esgRating: '#4fb3d9', irma: '#22c55e', hseIndex: '#a855f7', co2: '#94a3b8', water: '#3b82f6', violations: C.down };

    return (
        /* ▼▼▼ ADDED-SCALE: host (ota o'lchamiga 100%/100% moslashadi) + design
           box (BASE_W x BASE_H, scaleX/scaleY bilan cho'ziladi). Olib tashlash
           uchun shu ikkita <div>ni (va pastdagi ikkita yopilish tegini) o'chiring,
           height:'100%'ni qaytadan height:'100vh'ga qaytaring. ▼▼▼ */
        <div ref={hostRef} style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: ESG_BASE_W, height: ESG_BASE_H, flexShrink: 0, transform: `scale(${scale.x}, ${scale.y})`, transformOrigin: 'center center' }}>
        {/* ▲▲▲ ADDED-SCALE: tugadi — pastdan asl komponent boshlanadi ▲▲▲ */}
        <div style={{ background: C.bg, height: '100%' /* ADDED-SCALE: edi '100vh' */, overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <NeonIcon color="#22c55e" size={32}><IconLeaf /></NeonIcon>
                    <div style={{ color: '#4fb3d9', fontSize: 17, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>ESG</div>
                </div>
                <button
                    onClick={() => navigate('/main/esg-detail')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                        background: 'linear-gradient(135deg, #1e4d7b, #0ea8c7)', border: 'none', borderRadius: 999,
                        color: '#fff', fontSize: 11.5, fontWeight: 700, padding: '7px 14px',
                        boxShadow: '0 6px 16px rgba(14,168,199,0.3)', transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                >
                    Подробнее<IconArrowRight />
                </button>
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {DATA.kpi.map((k) => (
                    <div key={k.key} style={{ minWidth: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <NeonIcon color={kpiColor[k.key] ?? '#4fb3d9'} size={22}>{ICONS[k.icon]}</NeonIcon>
                            <span style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.label}</span>
                        </div>
                        <div style={{ color: C.text, fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{k.value}<span style={{ color: C.sub, fontSize: 11, fontWeight: 400, marginLeft: 3 }}>{k.unit}</span></div>
                        <div style={{ color: k.delta >= 0 ? '#22c55e' : C.down, fontSize: 10 }}>
                            {k.delta >= 0 ? '▲' : '▼'} {Math.abs(k.delta)}% к прошлому периоду
                        </div>
                    </div>
                ))}
            </div>

            {/* 1-qator: Ekologiya / ijtimoiy blok / HSE-Governance */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, alignItems: 'stretch' }}>
                <SectionCard title="Экология" icon={<IconLeaf />} iconColor="#22c55e">
                    {DATA.ecology.map((item) => (
                        <MiniStatRow key={item.label} item={item} color="#22c55e" />
                    ))}
                </SectionCard>

                <SectionCard title="Социальный блок" icon={<IconUsers />} iconColor="#3b82f6">
                    {DATA.social.map((item) => (
                        <MiniStatRow key={item.label} item={item} color="#3b82f6" />
                    ))}
                </SectionCard>

                <SectionCard title="HSE / Governance" icon={<IconShield />} iconColor="#a855f7">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, flex: 1 }}>
                        {DATA.governance.map((item) => (
                            <div key={item.label} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 10px', minWidth: 0 }}>
                                <div style={{ color: C.sub, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                                <div style={{ color: C.text, fontSize: 17, fontWeight: 700, marginTop: 2 }}>{item.value}{item.unit && <span style={{ color: C.sub, fontSize: 11, fontWeight: 400, marginLeft: 3 }}>{item.unit}</span>}</div>
                                <div style={{ color: item.delta >= 0 ? '#22c55e' : C.down, fontSize: 10, marginTop: 2 }}>
                                    {item.delta >= 0 ? '▲' : '▼'} {Math.abs(item.delta)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* 2-qator: KPI bajarilishi / Tonallik */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8, alignItems: 'stretch' }}>
                <SectionCard title="Выполнение KPI" icon={<IconTarget />}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, flex: 1 }}>
                        {DATA.kpiExecution.map((item) => (
                            <ProgressTile key={item.label} item={item} />
                        ))}
                    </div>
                </SectionCard>

                <SectionCard title="Тональность ESG" icon={<IconPieChart />}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                        <div style={{ width: 100, height: 100, flexShrink: 0 }}>
                            <Doughnut data={sentimentDonut} options={donutOptions} plugins={[centerText(String(sentimentTotal), 'всего')]} />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                            {DATA.sentiment.map((s) => (
                                <div key={s.label} style={{ display: 'flex', alignItems: 'center', fontSize: 12 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, marginRight: 6, flexShrink: 0, boxShadow: `0 0 5px ${s.color}` }} />
                                    <span style={{ color: C.text, flex: 1 }}>{s.label}</span>
                                    <span style={{ color: C.sub, fontWeight: 700 }}>{Math.round((s.value / sentimentTotal) * 100)}% ({s.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Pastki qator: status va maqsad */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#22c55e14', border: '1px solid #22c55e44', borderRadius: 12, padding: '9px 14px' }}>
                    <NeonIcon color="#22c55e" size={26}><IconShield /></NeonIcon>
                    <span style={{ color: C.sub, fontSize: 11 }}>Статус:</span>
                    <span style={{ color: '#22c55e', fontSize: 13, fontWeight: 700, textTransform: 'uppercase' }}>{DATA.status}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '9px 14px', minWidth: 0 }}>
                    <NeonIcon color="#4fb3d9" size={26}><IconFlag /></NeonIcon>
                    <span style={{ color: C.sub, fontSize: 11 }}>Цель:</span>
                    <span style={{ color: C.text, fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{DATA.goal}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: C.sub, fontSize: 11, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '9px 14px' }}>
                    {generated.toLocaleDateString('ru-RU')} {generated.toLocaleTimeString('ru-RU').slice(0, 5)}
                </div>
            </div>
        </div>
        {/* ADDED-SCALE: design box yopilishi */}
        </div>
        {/* ADDED-SCALE: host yopilishi */}
        </div>
    );
};

export default ESG;
