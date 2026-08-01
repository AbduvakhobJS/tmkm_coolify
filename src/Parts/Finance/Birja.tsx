import React, { useMemo, useState } from 'react';
import { C } from '../../components/dashboardUI';
import BIRJA_DATA from './birjaData.json';

/* ── Professional dumaloq ikonka (qolgan Parts komponentlari bilan bir xil "badge" uslubi) ── */
const NeonIcon: React.FC<{ color: string; size?: number; children: React.ReactNode }> = ({ color, size = 34, children }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(145deg, ${color}40, ${color}12)`,
        border: `1.3px solid ${color}70`,
        boxShadow: `0 0 12px ${color}66, inset 0 0 8px ${color}30`,
        color,
    }}>
        {children}
    </div>
);

/* ── Ikonkalar ── */
const IconExchange = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 3v18M7 3L3.5 6.5M7 3l3.5 3.5M17 21V3M17 21l3.5-3.5M17 21l-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconLayers = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l9 5-9 5-9-5 9-5z" fill="currentColor" opacity="0.85" />
        <path d="M3 13l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 17l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" opacity="0.6" />
    </svg>
);
const IconStar = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.5l2.9 6.4 6.9.7-5.2 4.7 1.5 6.9-6.1-3.6-6.1 3.6 1.5-6.9L2.2 9.6l6.9-.7L12 2.5z" />
    </svg>
);
const IconTrendUp = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 16.5l6-6 4 4 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 7.5h6v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconTrendDown = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 7.5l6 6 4-4 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.5 16.5h6v-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconShield = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M9.5 12l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconGrid = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
);
const IconTable = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 9.5h18M9.5 9.5V20" stroke="currentColor" strokeWidth="1.6" />
    </svg>
);

/* ── Ma'lumot turi ── */
type Mineral = { symbol: string; name: string; price: number; form: 'METALL' | 'KUKUN'; changePct: number | null; critical: boolean };
type BirjaData = { meta: typeof BIRJA_DATA.meta; minerals: Mineral[] };
const DATA = BIRJA_DATA as BirjaData;

const FORM_COLOR: Record<string, string> = { METALL: '#0ea8c7', KUKUN: '#a855f7' };

const fmtNum = (n: number, d = 0): string => {
    const s = Math.abs(n).toFixed(d);
    const [int, dec] = s.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const sign = n < 0 ? '-' : '';
    return dec !== undefined ? `${sign}${grouped},${dec}` : `${sign}${grouped}`;
};

type FilterKey = 'all' | 'critical' | 'METALL' | 'KUKUN';
type SortKey = 'name' | 'price' | 'change';
type ViewMode = 'cards' | 'table';

/* ── Bitta mineral kartasi ── */
const MineralCard: React.FC<{ m: Mineral; index: number }> = ({ m, index }) => {
    const color = FORM_COLOR[m.form];
    const up = m.changePct !== null && m.changePct >= 0;
    const flat = m.changePct === null;
    const moveColor = flat ? C.sub : up ? '#22c55e' : '#ef4444';

    return (
        <div
            style={{
                position: 'relative',
                background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`,
                border: `1px solid ${m.critical ? 'rgba(234,179,8,0.35)' : C.border}`,
                borderRadius: 13,
                padding: '11px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minWidth: 0,
                opacity: 0,
                animation: `birjaCardIn 0.45s ease ${Math.min(index * 0.025, 0.6)}s forwards`,
            }}
        >
            {m.critical && (
                <div style={{
                    position: 'absolute', top: 8, right: 9, color: '#eab308',
                    animation: 'birjaStarPulse 2.4s ease-in-out infinite',
                }} title="Kritik mineral">
                    <IconStar />
                </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                <NeonIcon color={color} size={38}>
                    <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace' }}>{m.symbol}</span>
                </NeonIcon>
                <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: C.text, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</div>
                    <span style={{
                        display: 'inline-block', marginTop: 2, fontSize: 8.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
                        color, background: `${color}1c`, borderRadius: 5, padding: '1.5px 6px',
                    }}>{m.form === 'METALL' ? 'Metall' : 'Kukun'}</span>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 }}>
                <div style={{ color: C.text, fontSize: 17, fontWeight: 800, letterSpacing: -0.2 }}>
                    {fmtNum(m.price)}<span style={{ color: C.sub, fontSize: 10.5, fontWeight: 500, marginLeft: 2 }}>$</span>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 700, color: moveColor,
                    background: flat ? 'rgba(148,163,184,0.1)' : `${moveColor}18`, borderRadius: 6, padding: '2.5px 6px',
                    animation: flat ? 'none' : 'birjaTickFlash 2.6s ease-in-out infinite',
                }}>
                    {flat ? <span style={{ opacity: 0.6 }}>—</span> : (up ? <IconTrendUp /> : <IconTrendDown />)}
                    {!flat && <span>{fmtNum(Math.abs(m.changePct as number), 2)}%</span>}
                </div>
            </div>
        </div>
    );
};

/* ── Jadval ko'rinishidagi bitta qator ── */
const MineralRow: React.FC<{ m: Mineral; index: number }> = ({ m, index }) => {
    const color = FORM_COLOR[m.form];
    const up = m.changePct !== null && m.changePct >= 0;
    const flat = m.changePct === null;
    const moveColor = flat ? C.sub : up ? '#22c55e' : '#ef4444';

    return (
        <tr
            style={{
                background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                opacity: 0,
                animation: `birjaRowIn 0.35s ease ${Math.min(index * 0.018, 0.5)}s forwards`,
            }}
        >
            <td style={{ padding: '8px 10px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <NeonIcon color={color} size={28}>
                        <span style={{ fontSize: 10.5, fontWeight: 800, fontFamily: 'monospace' }}>{m.symbol}</span>
                    </NeonIcon>
                    <span style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{m.name}</span>
                    {m.critical && (
                        <span style={{ color: '#eab308', animation: 'birjaStarPulse 2.4s ease-in-out infinite', display: 'flex' }} title="Kritik mineral">
                            <IconStar />
                        </span>
                    )}
                </div>
            </td>
            <td style={{ padding: '8px 10px', borderBottom: `1px solid ${C.border}` }}>
                <span style={{
                    fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
                    color, background: `${color}1c`, borderRadius: 5, padding: '2px 8px',
                }}>{m.form === 'METALL' ? 'Metall' : 'Kukun'}</span>
            </td>
            <td style={{ padding: '8px 10px', borderBottom: `1px solid ${C.border}`, textAlign: 'right' }}>
                <span style={{ color: C.text, fontSize: 13, fontWeight: 700 }}>{fmtNum(m.price)}<span style={{ color: C.sub, fontSize: 10, fontWeight: 500 }}> $</span></span>
            </td>
            <td style={{ padding: '8px 10px', borderBottom: `1px solid ${C.border}`, textAlign: 'right' }}>
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 700, color: moveColor,
                    background: flat ? 'rgba(148,163,184,0.1)' : `${moveColor}18`, borderRadius: 6, padding: '2.5px 8px',
                }}>
                    {flat ? <span style={{ opacity: 0.6 }}>—</span> : (up ? <IconTrendUp /> : <IconTrendDown />)}
                    {!flat && <span>{fmtNum(Math.abs(m.changePct as number), 2)}%</span>}
                </span>
            </td>
        </tr>
    );
};

/* ── Asosiy komponent ── */
const Birja: React.FC = () => {
    const [filter, setFilter] = useState<FilterKey>('all');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [view, setView] = useState<ViewMode>('cards');

    const stats = useMemo(() => {
        const up = DATA.minerals.filter((m) => m.changePct !== null && m.changePct > 0);
        const down = DATA.minerals.filter((m) => m.changePct !== null && m.changePct < 0);
        const critical = DATA.minerals.filter((m) => m.critical);
        const topMover = [...DATA.minerals].filter((m) => m.changePct !== null)
            .sort((a, b) => Math.abs(b.changePct as number) - Math.abs(a.changePct as number))[0];
        return { up: up.length, down: down.length, critical: critical.length, topMover };
    }, []);

    const list = useMemo(() => {
        let arr = DATA.minerals.slice();
        if (filter === 'critical') arr = arr.filter((m) => m.critical);
        else if (filter === 'METALL' || filter === 'KUKUN') arr = arr.filter((m) => m.form === filter);
        arr.sort((a, b) => {
            if (sortKey === 'name') return a.name.localeCompare(b.name);
            if (sortKey === 'price') return b.price - a.price;
            const av = a.changePct ?? -Infinity, bv = b.changePct ?? -Infinity;
            return bv - av;
        });
        return arr;
    }, [filter, sortKey]);

    const tickerItems = [...DATA.minerals, ...DATA.minerals]; // ikki marta — uzluksiz aylanish uchun

    const filterBtn = (key: FilterKey, label: string, color: string) => (
        <button
            onClick={() => setFilter(key)}
            style={{
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                border: `1px solid ${filter === key ? color : C.border}`,
                background: filter === key ? `${color}20` : C.card,
                color: filter === key ? color : C.sub,
                borderRadius: 999, padding: '6px 13px', fontSize: 11, fontWeight: 700,
                transition: 'all 0.15s ease',
            }}
        >{label}</button>
    );

    const sortBtn = (key: SortKey, label: string) => (
        <button
            onClick={() => setSortKey(key)}
            style={{
                cursor: 'pointer', border: `1px solid ${sortKey === key ? '#4fb3d9' : C.border}`,
                background: sortKey === key ? 'rgba(79,179,217,0.14)' : 'transparent',
                color: sortKey === key ? '#4fb3d9' : C.sub,
                borderRadius: 7, padding: '5px 10px', fontSize: 10.5, fontWeight: 600,
            }}
        >{label}</button>
    );

    return (
        <div style={{ background: C.bg, height: '100vh', overflowY: 'auto', padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <style>{`
                @keyframes birjaMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                @keyframes birjaCardIn { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes birjaPulseDot { 0%, 100% { opacity: 1; box-shadow: 0 0 6px #22c55e; } 50% { opacity: 0.35; box-shadow: 0 0 2px #22c55e; } }
                @keyframes birjaStarPulse { 0%, 100% { filter: drop-shadow(0 0 2px #eab308aa); opacity: 1; } 50% { filter: drop-shadow(0 0 6px #eab308); opacity: 0.75; } }
                @keyframes birjaTickFlash { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.35); } }
                @keyframes birjaRowIn { from { opacity: 0; transform: translateX(-4px); } to { opacity: 1; transform: translateX(0); } }
                .birja-ticker-track:hover { animation-play-state: paused; }
            `}</style>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <NeonIcon color="#eab308" size={36}><IconExchange /></NeonIcon>
                    <div>
                        <div style={{ color: '#4fb3d9', fontSize: 19, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>{DATA.meta.title}</div>
                        <div style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{DATA.meta.subtitle}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'birjaPulseDot 1.6s ease-in-out infinite' }} />
                        <span style={{ color: C.text, fontSize: 11.5, fontWeight: 600 }}>Jonli narxlar</span>
                    </div>
                    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', color: C.sub, fontSize: 11.5 }}>Yangilandi: <span style={{ color: C.text }}>{DATA.meta.updatedAt}</span></div>
                </div>
            </div>

            {/* Ticker — uzluksiz aylanadigan narx lentasi */}
            <div style={{ position: 'relative', overflow: 'hidden', background: `linear-gradient(90deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 0' }}>
                <div className="birja-ticker-track" style={{ display: 'flex', width: 'max-content', animation: 'birjaMarquee 42s linear infinite' }}>
                    {tickerItems.map((m, i) => {
                        const up = m.changePct !== null && m.changePct >= 0;
                        const flat = m.changePct === null;
                        const mc = flat ? C.sub : up ? '#22c55e' : '#ef4444';
                        return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', borderRight: `1px solid ${C.border}`, flexShrink: 0 }}>
                                <span style={{ color: '#4fb3d9', fontSize: 11, fontWeight: 800, fontFamily: 'monospace' }}>{m.symbol}</span>
                                <span style={{ color: C.text, fontSize: 11, fontWeight: 600 }}>{fmtNum(m.price)}$</span>
                                <span style={{ color: mc, fontSize: 10.5, fontWeight: 700 }}>{flat ? '—' : `${up ? '▲' : '▼'} ${fmtNum(Math.abs(m.changePct as number), 2)}%`}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <NeonIcon color="#4fb3d9" size={40}><IconGrid /></NeonIcon>
                    <div><div style={{ color: C.sub, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase' }}>Kuzatilayotgan minerallar</div><div style={{ color: C.text, fontSize: 21, fontWeight: 800 }}>{DATA.minerals.length}</div></div>
                </div>
                <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <NeonIcon color="#eab308" size={40}><IconShield /></NeonIcon>
                    <div><div style={{ color: C.sub, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase' }}>Kritik minerallar</div><div style={{ color: C.text, fontSize: 21, fontWeight: 800 }}>{stats.critical}</div></div>
                </div>
                <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <NeonIcon color="#22c55e" size={40}><IconTrendUp /></NeonIcon>
                    <div><div style={{ color: C.sub, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase' }}>O'sishda / Tushishda</div><div style={{ fontSize: 19, fontWeight: 800 }}><span style={{ color: '#22c55e' }}>{stats.up}</span><span style={{ color: C.sub }}> / </span><span style={{ color: '#ef4444' }}>{stats.down}</span></div></div>
                </div>
                <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '11px 13px', display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <NeonIcon color={(stats.topMover?.changePct ?? 0) >= 0 ? '#22c55e' : '#ef4444'} size={40}><IconLayers /></NeonIcon>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ color: C.sub, fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase' }}>Eng katta harakat</div>
                        <div style={{ color: C.text, fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {stats.topMover?.name} <span style={{ color: (stats.topMover?.changePct ?? 0) >= 0 ? '#22c55e' : '#ef4444' }}>{(stats.topMover?.changePct ?? 0) >= 0 ? '▲' : '▼'} {fmtNum(Math.abs(stats.topMover?.changePct ?? 0), 2)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtr va saralash paneli */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 12px' }}>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {filterBtn('all', 'Barchasi', '#4fb3d9')}
                    {filterBtn('critical', '★ Kritik', '#eab308')}
                    {filterBtn('METALL', 'Metall', FORM_COLOR.METALL)}
                    {filterBtn('KUKUN', 'Kukun', FORM_COLOR.KUKUN)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: C.sub, fontSize: 10.5, marginRight: 2 }}>Saralash:</span>
                        {sortBtn('name', 'Nomi')}
                        {sortBtn('price', 'Narx')}
                        {sortBtn('change', "O'zgarish")}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: 3 }}>
                        <button
                            onClick={() => setView('cards')}
                            title="Kartalar ko'rinishi"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: 'none',
                                background: view === 'cards' ? 'rgba(79,179,217,0.18)' : 'transparent',
                                color: view === 'cards' ? '#4fb3d9' : C.sub,
                                borderRadius: 6, padding: '5px 10px', fontSize: 10.5, fontWeight: 700,
                                transition: 'all 0.15s ease',
                            }}
                        ><IconGrid />Kartalar</button>
                        <button
                            onClick={() => setView('table')}
                            title="Jadval ko'rinishi"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', border: 'none',
                                background: view === 'table' ? 'rgba(79,179,217,0.18)' : 'transparent',
                                color: view === 'table' ? '#4fb3d9' : C.sub,
                                borderRadius: 6, padding: '5px 10px', fontSize: 10.5, fontWeight: 700,
                                transition: 'all 0.15s ease',
                            }}
                        ><IconTable />Jadval</button>
                    </div>
                </div>
            </div>

            {/* Minerallar — tanlangan ko'rinishga qarab kartalar to'ri yoki jadval */}
            {view === 'cards' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 9 }}>
                    {list.map((m, i) => <MineralCard key={m.symbol} m={m} index={i} />)}
                </div>
            ) : (
                <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 12, padding: '4px 12px 10px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'left', color: C.sub, fontWeight: 600, padding: '10px 10px 7px', borderBottom: `1px solid ${C.border}`, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Mineral</th>
                                <th style={{ textAlign: 'left', color: C.sub, fontWeight: 600, padding: '10px 10px 7px', borderBottom: `1px solid ${C.border}`, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Turi</th>
                                <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '10px 10px 7px', borderBottom: `1px solid ${C.border}`, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Narxi</th>
                                <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, padding: '10px 10px 7px', borderBottom: `1px solid ${C.border}`, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.4 }}>O'zgarish</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((m, i) => <MineralRow key={m.symbol} m={m} index={i} />)}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ textAlign: 'center', color: C.sub, fontSize: 10, padding: '4px 0 10px' }}>{DATA.meta.source}</div>
        </div>
    );
};

export default Birja;
