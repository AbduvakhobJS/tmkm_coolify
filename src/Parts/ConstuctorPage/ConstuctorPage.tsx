import React, { useEffect, useState } from 'react';
import { C } from '../../components/dashboardUI';
import { GC } from '../../theme/palette';

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

const IconPlus = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
);
const IconMinus = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
);
const IconX = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);
const IconShield = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9.5 12l1.8 1.8L15 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconBarChart = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 20V10M12 20V4M19 20v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconMegaphone = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 11v2a2 2 0 002 2h1l1 5h2l-1-5h2l8 4V6l-8 4H6a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M20 9v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconUsers = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.8 19c.6-3.4 3.1-5.5 6.2-5.5s5.6 2.1 6.2 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="17" cy="8.5" r="2.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15.6 13.7c2.6.2 4.6 2 5.1 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconBookOpen = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 6.5c-1.6-1.3-3.7-2-6.5-2-1 0-1.5.2-1.5.2v13.3s.5-.2 1.5-.2c2.8 0 4.9.7 6.5 2 1.6-1.3 3.7-2 6.5-2 1 0 1.5.2 1.5.2V4.7s-.5-.2-1.5-.2c-2.8 0-4.9.7-6.5 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 6.5v13.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
);
const IconLeaf = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 19c8 0 14-6 14-14 0 0-11-2-14 7-1.6 4.9 0 7 0 7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M5 19c0-4 2-7 6-10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconLayoutGrid = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
);

/* ── Mavjud vidjetlar katalogi (loyihadagi mavjud "widget" komponentlari) ── */

type Widget = { key: string; title: string; desc: string; route: string; color: string; icon: React.ReactNode };

const WIDGETS: Widget[] = [
    { key: 'hse', title: 'HSE контроль и SLA', desc: 'Производственная безопасность, случаи, SLA и статусы', route: '/main/hse-big', color: GC.cyan, icon: <IconShield /> },
    { key: 'marketing', title: 'Маркетинг', desc: 'Бренд, соцсети, инвесторы и репутация', route: '/main/marketing', color: GC.violet, icon: <IconBarChart /> },
    { key: 'prmedia', title: 'PR / Медиа', desc: 'Публикации, СМИ, тональность и охваты', route: '/main/pr-media', color: GC.magenta, icon: <IconMegaphone /> },
    { key: 'hr', title: 'HR Аналитика', desc: 'Численность, движение персонала, HR-фокус', route: '/main/hr-bi-main', color: '#146775', icon: <IconUsers /> },
    { key: 'hrnew', title: 'HR New', desc: '', route: '/main/new-hr-detail', color: GC.blue, icon: <IconUsers /> },
    { key: 'contacthub', title: 'ContactHub', desc: 'Международные контакты, встречи и заметки', route: '/main/contact-hub', color: GC.cyan, icon: <IconBookOpen /> },
    { key: 'esg', title: 'ESG', desc: 'Экология, соцответственность и governance', route: '/main/esg', color: GC.amber, icon: <IconLeaf /> },
    { key: 'map', title: 'Map', desc: 'Map', route: '/main/4', color: GC.magenta, icon: <IconShield /> },
    { key: 'events', title: 'Events', desc: 'Events', route: '/main/7', color: GC.red, icon: <IconUsers /> },
    { key: 'resurs', title: 'Resurs', desc: 'Resurs', route: '/main/9', color: GC.blue, icon: <IconBarChart /> },
    { key: 'finance', title: 'finance', desc: 'finance', route: '/main/finance', color: GC.green, icon: <IconBarChart /> },
    { key: 'financenew', title: 'financenew', desc: 'financenew', route: '/main/finance-new', color: GC.blue, icon: <IconBarChart /> },
    { key: 'singletreasury', title: 'single-treasury', desc: 'single-treasury', route: '/main/single-treasury', color: '#103b5e', icon: <IconBarChart /> },
];

const WIDGET_MAP: Record<string, Widget> = Object.fromEntries(WIDGETS.map((w) => [w.key, w]));
const SLOTS_COUNT = 6;
const STORAGE_KEY = 'tmk-constructor-layout';

function loadLayout(): (string | null)[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return Array(SLOTS_COUNT).fill(null);
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length === SLOTS_COUNT) return parsed;
        return Array(SLOTS_COUNT).fill(null);
    } catch {
        return Array(SLOTS_COUNT).fill(null);
    }
}

/* ── Vidjet tanlash modali ── */

const PickerModal: React.FC<{ onPick: (key: string) => void; onClose: () => void }> = ({ onPick, onClose }) => (
    <div
        onClick={onClose}
        style={{
            position: 'fixed', inset: 0, background: 'rgba(4,8,16,0.72)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
        }}
    >
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                width: '100%', maxWidth: 760, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
                padding: 18, boxShadow: '0 30px 80px rgba(0,0,0,0.5)', animation: 'ctor-modal-in 0.2s ease',
            }}
        >
            <style>{'@keyframes ctor-modal-in { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }'}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <NeonIcon color={GC.cyan} size={30}><IconLayoutGrid /></NeonIcon>
                    <div>
                        <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>Выберите виджет</div>
                        <div style={{ color: C.sub, fontSize: 11.5, marginTop: 1 }}>Компонент отобразится в выбранной ячейке конструктора</div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{ width: 30, height: 30, borderRadius: 8, background: C.cardAlt, border: `1px solid ${C.border}`, color: C.sub, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <IconX />
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {WIDGETS.map((w) => (
                    <button
                        key={w.key}
                        onClick={() => onPick(w.key)}
                        style={{
                            textAlign: 'left', cursor: 'pointer', background: C.cardAlt, border: `1px solid ${C.border}`,
                            borderRadius: 12, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10,
                            transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.borderColor = `${w.color}88`;
                            e.currentTarget.style.boxShadow = `0 10px 24px ${w.color}22`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.borderColor = C.border;
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            height: 64, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `linear-gradient(135deg, ${w.color}22, ${w.color}05)`, border: `1px solid ${w.color}33`,
                        }}>
                            <NeonIcon color={w.color} size={40}>{w.icon}</NeonIcon>
                        </div>
                        <div>
                            <div style={{ color: C.text, fontSize: 12.5, fontWeight: 700 }}>{w.title}</div>
                            <div style={{ color: C.sub, fontSize: 10.5, marginTop: 3, lineHeight: 1.4 }}>{w.desc}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

/* ── Konstruktor sahifasi ── */

const ConstuctorPage: React.FC = () => {
    const [layout, setLayout] = useState<(string | null)[]>(() => loadLayout());
    const [modalSlot, setModalSlot] = useState<number | null>(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
    }, [layout]);

    const handlePick = (key: string) => {
        if (modalSlot === null) return;
        setLayout((prev) => prev.map((v, i) => (i === modalSlot ? key : v)));
        setModalSlot(null);
    };

    const handleRemove = (index: number) => {
        setLayout((prev) => prev.map((v, i) => (i === index ? null : v)));
    };

    return (
        <div style={{ background: C.bg,
            minHeight: '100vh',
            // padding: 14,
            boxSizing: 'border-box',
            fontFamily: '"Segoe UI", system-ui, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            gap: 12 }}>

            {/* Sarlavha */}
            {/*<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>*/}
            {/*    <NeonIcon color={GC.cyan} size={34}><IconLayoutGrid /></NeonIcon>*/}
            {/*    <div>*/}
            {/*        <div style={{ color: GC.cyan, fontSize: 17, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Конструктор дашборда</div>*/}
            {/*        <div style={{ color: C.sub, fontSize: 11.5, marginTop: 1 }}>Соберите свою сводку из 6 доступных виджетов — выбор сохраняется автоматически</div>*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/* 6 ta katak */}
            <div style={{ display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(2, 1fr)',
                gap: 12, flex: 1, minHeight: 0 }}>
                {layout.map((slotKey, index) => {
                    const widget = slotKey ? WIDGET_MAP[slotKey] : null;
                    return (
                        <div
                            key={index}
                            style={{
                                position: 'relative',
                                background: C.card,
                                border: `1px solid ${widget ? C.border : 'rgba(79,179,217,0.25)'}`,
                                borderStyle: widget ? 'solid' : 'dashed',
                                borderRadius: 14,
                                overflow: 'hidden',
                                minHeight: 340, display: 'flex', flexDirection: 'column',
                            }}
                        >
                            {widget ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8,
                                        // padding: '8px 10px',
                                        borderBottom: `1px solid ${C.border}`,
                                        flexShrink: 0 }}>
                                        {/*<NeonIcon color={widget.color} size={22}>{widget.icon}</NeonIcon>*/}
                                        {/*<span style={{ color: C.text, fontSize: 11.5, fontWeight: 700, flex: 1 }}>{widget.title}</span>*/}
                                    </div>
                                    <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                                        <iframe
                                            src={widget.route}
                                            title={widget.title}
                                            loading="lazy"
                                            style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: C.bg }}
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleRemove(index)}
                                        title="Убрать виджет"
                                        style={{
                                            position: 'absolute',
                                            top: 8, right: 8, width: 24, height: 24, borderRadius: '50%',
                                            background: "rgb(223 7 7 / 0.45)",
                                            border: `1px solid ${C.down}66`, color: C.down, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.35)', transition: 'transform 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                                    >
                                        <IconMinus />
                                    </button>
                                    <button
                                        onClick={() => setModalSlot(index)}
                                        title="Убрать виджет"
                                        style={{
                                            position: 'absolute',
                                            top: 8, right: 38, width: 24, height: 24, borderRadius: '50%',
                                            background: "rgb(7 216 223 / 0.45)",
                                            border: `1px solid ${C.down}66`,
                                            color: "cyan",
                                            cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.35)', transition: 'transform 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                                    >
                                        <IconPlus />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setModalSlot(index)}
                                    style={{
                                        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                                        background: 'none', border: 'none', cursor: 'pointer', color: C.sub,
                                    }}
                                >
                                    <div style={{
                                        width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `linear-gradient(135deg, #1e4d7b, ${GC.cyan})`, color: '#fff',
                                        boxShadow: '0 8px 22px rgba(14,168,199,0.3)',
                                    }}>
                                        <IconPlus />
                                    </div>
                                    <span style={{ fontSize: 11.5, fontWeight: 600 }}>Добавить виджет</span>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {modalSlot !== null && (
                <PickerModal onPick={handlePick} onClose={() => setModalSlot(null)} />
            )}
        </div>
    );
};

export default ConstuctorPage;
