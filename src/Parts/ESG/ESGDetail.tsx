import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut, Line } from 'react-chartjs-2';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { C, chartBase, noLegend, axis, centerText } from '../../components/dashboardUI';
import esgDetail from './esgDetailDemoData.json';
import { GC, alpha } from '../../theme/palette';

/* ── Neon ikonkalar (dizayn tizimiga mos, gradient + glow) ── */

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

const IconLeaf = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 19c8 0 14-6 14-14 0 0-11-2-14 7-1.6 4.9 0 7 0 7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M5 19c0-4 2-7 6-10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconShield = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9.5 12l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconHeartPulse = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 8.5c0-2.5-2-4.3-4.3-4.3-1.5 0-2.8.8-3.7 2-.9-1.2-2.2-2-3.7-2C6 4.2 4 6 4 8.5c0 4.5 8 10.5 8 10.5s8-6 8-10.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6.5 10h2l1.5-2.5 2 5 1.5-2.5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconGauge = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 15.5a8 8 0 1116 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 15.5l3.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="12" cy="15.5" r="1.3" fill="currentColor" />
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
const IconTrash = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 7h16M9 7V4.5a1 1 0 011-1h4a1 1 0 011 1V7M6 7l1 13a1.5 1.5 0 001.5 1.4h7a1.5 1.5 0 001.5-1.4L18 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconRecycle = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 4.5L7 9h4M14.5 4.5L17 9h-4M6 15l-2.2 3.8L6 20h4M18 15l2.2 3.8L18 20h-4M10.5 20h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconSun = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
const IconUserMinus = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.5 19.5c.6-3.7 3.2-6 6.5-6s5.9 2.3 6.5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M15.75 10.75h5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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
    </svg>
);
const IconMessageSquare = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4.5h16a1 1 0 011 1V15a1 1 0 01-1 1H9l-4.5 4V16H4a1 1 0 01-1-1V5.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
);
const IconShieldCheck = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconHardHat = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 16a8 8 0 0116 0z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M2.5 16h19M11 10V6M9 6h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconCalendarCheck = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M8.5 14.5l2.2 2.2L15.5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconEye = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
);
const IconClipboardCheck = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <rect x="9" y="2" width="6" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 13.5l1.8 1.8L14.5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconAlertOctagon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 8v5M12 16.2h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);
const IconUsersConflict = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 19c.5-3 2.5-5 5-5s4.5 2 5 5M11 19c.5-3 2.5-5 5-5s4.5 2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconGraduationCap = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 8l10-4 10 4-10 4-10-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6 10.5v4.5c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M20 9v5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconFlag = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 21V4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M5 4h13l-3 4 3 4H5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
);
const IconTarget = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
);
const IconArrowLeft = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconTrendUp = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 16l6-6 4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconMapPin = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21s7-6.4 7-11.5A7 7 0 105 9.5C5 14.6 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
);

const ICONS: Record<string, React.ReactNode> = {
    leaf: <IconLeaf />, shield: <IconShield />, 'heart-pulse': <IconHeartPulse />, gauge: <IconGauge />,
    cloud: <IconCloud />, droplet: <IconDroplet />, 'alert-triangle': <IconAlertTriangle />, zap: <IconZap />,
    trash: <IconTrash />, recycle: <IconRecycle />, sun: <IconSun />, users: <IconUsers />,
    'user-minus': <IconUserMinus />, 'book-open': <IconBookOpen />, 'hand-heart': <IconHandHeart />,
    'message-square': <IconMessageSquare />, 'shield-check': <IconShieldCheck />, 'hard-hat': <IconHardHat />,
    'calendar-check': <IconCalendarCheck />, eye: <IconEye />, 'clipboard-check': <IconClipboardCheck />,
    'alert-octagon': <IconAlertOctagon />, 'users-conflict': <IconUsersConflict />, 'graduation-cap': <IconGraduationCap />,
    flag: <IconFlag />, target: <IconTarget />,
};

const STATUS_COLOR: Record<string, string> = { ok: GC.green, attention: GC.amber, risk: GC.red };

/* ── ESG detail demo ma'lumot turi (esgDetailDemoData.json) ── */

type KpiItem = { key: string; label: string; value: string; unit: string; delta: number; note?: string; icon: string; trend: number[] };
type SimpleItem = { label: string; value: string; unit?: string; delta?: number; icon: string };
type Site = { name: string; lon: number; lat: number; status: 'ok' | 'attention' | 'risk' };
type GoalItem = { label: string; value: number; color: string; icon: string };

type EsgDetailData = {
    generatedAt: string;
    kpi: KpiItem[];
    ecology: {
        items: SimpleItem[];
        goalProgress: { label: string; value: number };
        trend: { labels: string[]; series: { name: string; color: string; data: number[] }[] };
    };
    esgCore: {
        legend: { label: string; color: string }[];
        sites: Site[];
        summary: { total: number; ok: number; attention: number; risk: number };
        goals2030: GoalItem[];
    };
    social: {
        headcount: string;
        turnover: number;
        turnoverDelta: number;
        genderSplit: { female: number; male: number };
        extra: SimpleItem[];
    };
    hse: SimpleItem[];
    ppe: { label: string; value: number; delta: number; unit: string };
    governance: SimpleItem[];
    highlights: { icon: string; color: string; title: string; text: string }[];
    events: { time: string; text: string; icon: string }[];
};

const DATA = esgDetail as unknown as EsgDetailData;

/* ── Yordamchi komponentlar ── */

const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; iconColor?: string; hint?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, iconColor = GC.cyan, hint, children, style }) => (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ color: GC.cyan, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                {icon && <NeonIcon color={iconColor} size={22}>{icon}</NeonIcon>}{title}
            </div>
            {hint && <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap' }}>{hint}</div>}
        </div>
        {children}
    </div>
);

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    const w = 56, h = 18;
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
            <polyline points={points} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const MiniStatRow: React.FC<{ item: SimpleItem; color: string }> = ({ item, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 10px', marginBottom: 7 }}>
        <NeonIcon color={color} size={26}>{ICONS[item.icon]}</NeonIcon>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: C.sub, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
            <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>{item.value}{item.unit && <span style={{ color: C.sub, fontSize: 11, fontWeight: 400, marginLeft: 4 }}>{item.unit}</span>}</div>
        </div>
        {item.delta !== undefined && (
            <div style={{ color: item.delta >= 0 ? GC.green : C.down, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                {item.delta >= 0 ? '▲' : '▼'} {Math.abs(item.delta)}%
            </div>
        )}
    </div>
);

const ProgressTile: React.FC<{ item: GoalItem }> = ({ item }) => (
    <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '8px 10px', minWidth: 0, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
            <span style={{ color: item.color }}>{ICONS[item.icon]}</span>
            <span style={{ color: C.text, fontSize: 11, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
            <span style={{ color: C.text, fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>{item.value}%</span>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${item.value}%`, background: item.color, borderRadius: 3, boxShadow: `0 0 5px ${item.color}88` }} />
        </div>
    </div>
);

const donutOptions = { ...chartBase, cutout: '68%', ...noLegend } as any;

/* ── ESG Core xarita (Map3d.tsx uslubidan olingan maplibre-gl asosida, yengil versiya) ── */

const EsgMap: React.FC<{ sites: Site[] }> = ({ sites }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        const map = new maplibregl.Map({
            container: containerRef.current,
            style: 'https://api.maptiler.com/maps/019de83b-bc0c-7558-9ffe-1761aa83c410/style.json?key=YqciQrrpszIp23MCz2am',
            center: [66.9, 40.2],
            zoom: 4.3,
            pitch: 0,
            attributionControl: false,
            interactive: true,
        });
        map.scrollZoom.disable();
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();

        map.on('load', () => {
            sites.forEach((s) => {
                const el = document.createElement('div');
                const color = STATUS_COLOR[s.status];
                el.style.width = '13px';
                el.style.height = '13px';
                el.style.borderRadius = '50%';
                el.style.background = color;
                el.style.boxShadow = `0 0 8px 2px ${GC.icon}99, 0 0 0 2px rgba(10,15,29,0.9)`;
                el.title = s.name;
                new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([s.lon, s.lat]).addTo(map);
            });
        });

        mapRef.current = map;
        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [sites]);

    return <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden' }} />;
};

const ESGDetail: React.FC = () => {
    const navigate = useNavigate();
    const [now] = useState(() => new Date());

    const kpiChartColor: Record<string, string> = { esgRating: GC.cyan, irma: GC.green, hseIndex: GC.violet, ltifr: GC.amber, co2: GC.slate, water: GC.blue, renewables: GC.amber, violations: C.down };

    const ecoTrend = useMemo(() => ({
        labels: DATA.ecology.trend.labels,
        datasets: DATA.ecology.trend.series.map((s) => ({
            label: s.name, data: s.data, borderColor: s.color, backgroundColor: `${s.color}22`,
            borderWidth: 2, tension: 0.4, pointRadius: 2, pointBackgroundColor: s.color, fill: true,
        })),
    }), []);

    const genderDonut = useMemo(() => ({
        labels: ['Женщины', 'Мужчины'],
        datasets: [{ data: [DATA.social.genderSplit.female, DATA.social.genderSplit.male], backgroundColor: [GC.magenta, GC.blue], borderColor: C.card, borderWidth: 2 }],
    }), []);

    const ppeDonut = useMemo(() => ({
        labels: ['Обеспечено', 'Осталось'],
        datasets: [{ data: [DATA.ppe.value, 100 - DATA.ppe.value], backgroundColor: [GC.green, 'rgba(255,255,255,0.06)'], borderColor: C.card, borderWidth: 2 }],
    }), []);

    return (
        <div style={{ background: C.bg, height: '100vh', overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <NeonIcon color={GC.green} size={36}><IconLeaf /></NeonIcon>
                    <div>
                        <div style={{ color: GC.cyan, fontSize: 19, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>ESG / Сводный экран</div>
                        <div style={{ color: C.sub, fontSize: 12, marginTop: 2, maxWidth: 620 }}>
                            Подробные ESG-данные по экологическим, социальным, HSE и governance-показателям
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: C.sub, fontSize: 11 }}>{now.toLocaleDateString('ru-RU')}, {now.toLocaleTimeString('ru-RU').slice(0, 5)}</span>
                    <button
                        onClick={() => navigate('/main/esg')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                            background: `linear-gradient(135deg, #1e4d7b, ${GC.cyan})`, border: 'none', borderRadius: 8,
                            color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 14px',
                            boxShadow: '0 6px 16px rgba(14,168,199,0.3)', transition: 'transform 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                    >
                        <IconArrowLeft />Назад
                    </button>
                </div>
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                {DATA.kpi.map((k) => (
                    <div key={k.key} style={{ minWidth: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '9px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <NeonIcon color={kpiChartColor[k.key] ?? GC.cyan} size={20}>{ICONS[k.icon]}</NeonIcon>
                            <span style={{ color: C.sub, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                            <div style={{ color: C.text, fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{k.value}<span style={{ color: C.sub, fontSize: 10, fontWeight: 400, marginLeft: 2 }}>{k.unit}</span></div>
                            <Sparkline data={k.trend} color={kpiChartColor[k.key] ?? GC.cyan} />
                        </div>
                        <div style={{ color: k.delta >= 0 ? GC.green : C.down, fontSize: 9.5 }}>
                            {k.delta >= 0 ? '▲' : '▼'} {Math.abs(k.delta)}% {k.note ?? ''}
                        </div>
                    </div>
                ))}
            </div>

            {/* Asosiy 3 ustunli qism */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 8, alignItems: 'stretch' }}>

                {/* Environment */}
                <SectionCard title="Environment / Экология" icon={<IconLeaf />} iconColor={GC.green} style={{ height: 590 }}>
                    {DATA.ecology.items.map((item) => (
                        <MiniStatRow key={item.label} item={item} color={GC.green} />
                    ))}
                    <div style={{ marginBottom: 7 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                            <span style={{ color: C.text }}>{DATA.ecology.goalProgress.label}</span>
                            <span style={{ color: C.sub, fontWeight: 700 }}>{DATA.ecology.goalProgress.value}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${DATA.ecology.goalProgress.value}%`, background: GC.green, borderRadius: 3, boxShadow: `0 0 6px ${alpha(GC.green, 0.53)}` }} />
                        </div>
                    </div>

                    <div style={{ color: GC.cyan, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', margin: '4px 0 6px' }}>Динамика ключевых ESG показателей</div>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line data={ecoTrend} options={{ ...chartBase, plugins: { legend: { display: false } }, scales: axis({ y: { display: false } }) } as any} />
                    </div>
                </SectionCard>

                {/* ESG Core / xarita */}
                <SectionCard title="ESG Core / Основные ESG-показатели" icon={<IconMapPin />} style={{ height: 590 }}>
                    <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
                        {DATA.esgCore.legend.map((l) => (
                            <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, color: C.sub }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, boxShadow: `0 0 5px ${l.color}` }} />{l.label}
                            </span>
                        ))}
                    </div>
                    <div style={{ height: 200, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}`, marginBottom: 8 }}>
                        <EsgMap sites={DATA.esgCore.sites} />
                    </div>
                    <div style={{ color: C.sub, fontSize: 9.5, textAlign: 'center', marginBottom: 8 }}>Показаны ключевые площадки мониторинга</div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
                        <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                            <div style={{ color: C.text, fontSize: 16, fontWeight: 700 }}>{DATA.esgCore.summary.total}</div>
                            <div style={{ color: C.sub, fontSize: 8.5, textTransform: 'uppercase' }}>Объектов всего</div>
                        </div>
                        <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                            <div style={{ color: GC.green, fontSize: 16, fontWeight: 700 }}>{DATA.esgCore.summary.ok}</div>
                            <div style={{ color: C.sub, fontSize: 8.5, textTransform: 'uppercase' }}>В работе</div>
                        </div>
                        <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                            <div style={{ color: GC.amber, fontSize: 16, fontWeight: 700 }}>{DATA.esgCore.summary.attention}</div>
                            <div style={{ color: C.sub, fontSize: 8.5, textTransform: 'uppercase' }}>Треб. внимания</div>
                        </div>
                        <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                            <div style={{ color: C.down, fontSize: 16, fontWeight: 700 }}>{DATA.esgCore.summary.risk}</div>
                            <div style={{ color: C.sub, fontSize: 8.5, textTransform: 'uppercase' }}>В зоне риска</div>
                        </div>
                    </div>

                    <div style={{ color: GC.cyan, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>Цели 2030 / Выполнение</div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {DATA.esgCore.goals2030.map((g) => (
                            <ProgressTile key={g.label} item={g} />
                        ))}
                    </div>
                </SectionCard>

                {/* Social + HSE + Governance */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                    <SectionCard title="Social / Социальная ответственность" icon={<IconUsers />} iconColor={GC.blue}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 8 }}>
                            <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 8px', minWidth: 0 }}>
                                <NeonIcon color={GC.blue} size={20}><IconUsers /></NeonIcon>
                                <div style={{ color: C.sub, fontSize: 8.5, textTransform: 'uppercase', marginTop: 4 }}>Персонал</div>
                                <div style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>{DATA.social.headcount} <span style={{ fontSize: 9, color: C.sub, fontWeight: 400 }}>чел.</span></div>
                            </div>
                            <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 8px', minWidth: 0 }}>
                                <NeonIcon color={GC.amber} size={20}><IconUserMinus /></NeonIcon>
                                <div style={{ color: C.sub, fontSize: 8.5, textTransform: 'uppercase', marginTop: 4 }}>Текучесть</div>
                                <div style={{ color: C.text, fontSize: 14, fontWeight: 700 }}>{DATA.social.turnover}%</div>
                                <div style={{ color: DATA.social.turnoverDelta >= 0 ? GC.green : C.down, fontSize: 9 }}>{DATA.social.turnoverDelta >= 0 ? '▲' : '▼'} {Math.abs(DATA.social.turnoverDelta)}%</div>
                            </div>
                            <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: 46, height: 46 }}>
                                    <Doughnut data={genderDonut} options={{ ...chartBase, cutout: '62%', ...noLegend } as any} />
                                </div>
                                <div style={{ color: C.sub, fontSize: 8, textAlign: 'center', marginTop: 2 }}>{DATA.social.genderSplit.female}% / {DATA.social.genderSplit.male}%<br />жен. / муж.</div>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                            {DATA.social.extra.map((item) => (
                                <div key={item.label} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', minWidth: 0 }}>

                                    <div className="d-flex">
                                        <NeonIcon color={GC.blue} size={20}>{ICONS[item.icon]}</NeonIcon>
                                        <div style={{ color: C.sub, fontSize: 8, textTransform: 'uppercase', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                                    </div>
                                    <div style={{ color: C.text, fontSize: 11.5, fontWeight: 700 }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title="Safety / HSE / Охрана труда" icon={<IconShieldCheck />} iconColor={GC.violet}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                            {DATA.hse.map((item) => (
                                <div key={item.label} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 8px', minWidth: 0 }}>
                                    <div className="d-flex">
                                        <NeonIcon color={GC.violet} size={20}>{ICONS[item.icon]}</NeonIcon>
                                        <div style={{ color: C.sub, fontSize: 8, textTransform: 'uppercase', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                                    </div>
                                    <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{item.value}</div>
                                    {item.delta !== undefined && <div style={{ color: item.delta >= 0 ? GC.green : C.down, fontSize: 9 }}>{item.delta >= 0 ? '▲' : '▼'} {Math.abs(item.delta)}%</div>}
                                </div>
                            ))}
                            <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: 40, height: 40 }}>
                                    <Doughnut data={ppeDonut} options={donutOptions} plugins={[centerText(`${DATA.ppe.value}%`, '')]} />
                                </div>
                                <div style={{ color: C.sub, fontSize: 8, textAlign: 'center', marginTop: 2, whiteSpace: 'nowrap' }}>{DATA.ppe.label}</div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Governance / Корпоративное управление" icon={<IconClipboardCheck />} iconColor={GC.cyan} style={{ flex: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                            {DATA.governance.map((item) => (
                                <div key={item.label} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 8px', minWidth: 0 }}>
                                   <div className="d-flex">
                                       <NeonIcon color={GC.cyan} size={20}>{ICONS[item.icon]}</NeonIcon>
                                       <div style={{  marginLeft: "12px", color: C.sub, fontSize: 8, textTransform: 'uppercase', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</div>
                                   </div>
                                    <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{item.value}{item.unit && <span style={{ fontSize: 9, color: C.sub, fontWeight: 400 }}>{item.unit}</span>}</div>
                                    {item.delta !== undefined && <div style={{ color: item.delta >= 0 ? GC.green : C.down, fontSize: 9 }}>{item.delta >= 0 ? '▲' : '▼'} {Math.abs(item.delta)}%</div>}
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </div>

            {/* Highlight kartalar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {DATA.highlights.map((h) => (
                    <div key={h.title} style={{ display: 'flex', alignItems: 'center', gap: 12, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 14px' }}>
                        <NeonIcon color={h.color} size={38}>{ICONS[h.icon]}</NeonIcon>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{h.title}</div>
                            <div style={{ color: C.sub, fontSize: 11, marginTop: 2 }}>{h.text}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Voqealar lentasi */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '10px 16px', flexWrap: 'wrap' }}>
                <span style={{ color: GC.cyan, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <IconTrendUp />Лента событий и инсайтов
                </span>
                {DATA.events.map((e) => (
                    <span key={e.time + e.text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.sub }}>
                        <span style={{ color: GC.cyan }}>{ICONS[e.icon]}</span>
                        <span style={{ color: C.text }}>{e.time}</span> · {e.text}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ESGDetail;
