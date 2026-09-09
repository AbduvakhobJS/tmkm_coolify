import React, { useMemo, useState } from 'react';
import { GC } from '../../theme/palette';
import { ALARM_EVENTS, AlarmEvent, FILTERS, FilterKey, SEVERITY, Severity, barColor } from './data';
import EventModal, { TypeIcon } from './EventModal';

/* ══════════════════════════════════════════════════════════════════════════
   ALARMLAR VA HODISALAR — chapdan ochiluvchi bildirishnoma paneli.

   • Ekranning chap chetiga, tepadan 100px pastda turadi (navbar ostida).
   • Kengligi — ekran kengligining 1/5 qismi (`20vw`).
   • Yopiq holatda faqat alarm ikonkasi ko'rinadi; bosilsa panel sirg'alib
     chiqadi.
   • Qatorga (yoki "Batafsil"ga) bosilsa — toifaga xos tafsilotlar modali.
   ══════════════════════════════════════════════════════════════════════════ */

/** Panel tepadan shuncha px pastdan boshlanadi (navbar balandligi). */
const TOP_OFFSET = 66;
/** Ekran kengligining 1/5 qismi; juda tor ekranlarda o'qilishi uchun minimum. */
const PANEL_WIDTH = 'max(340px, 20vw)';

/* Jadval ustunlari — sarlavha va qatorlarda AYNAN bir xil bo'lishi shart,
   aks holda ustunlar bir-biriga to'g'ri kelmaydi. Qator chap chetida 4px
   rangli chiziq bor, shuning uchun sarlavhaga o'sha 4px `paddingLeft` ga
   qo'shib berilgan (18 = 4 + 14).

   DIQQAT: oxirgi ("Holat") ustun `auto` BO'LMASLIGI kerak. Har bir qator
   alohida grid bo'lgani uchun `auto` kenglikni o'sha qatordagi tabletka
   matniga qarab hisoblaydi — natijada "Kritik" va "Ogohlantirish" qatorlarida
   ustunlar bir-biriga to'g'ri kelmay, jadval "sakrab" ketadi. Shu sabab eng
   uzun tabletka ("Ogohlantirish") bo'yicha qat'iy kenglik berilgan. */
/* Birinchi ustun — toifa ikonkasi (Videotahlil / Yong'in / SCADA / ...).
   Panel tor bo'lgani uchun uning o'rni "Tur" ustunidan olindi (84 → 76):
   ikonka toifani ko'z bilan ajratib beradi, matn esa `title` tooltipida
   to'liq ko'rinadi. */
const GRID_COLUMNS = '22px 44px 76px 1fr 1.5fr 92px';
const GRID_GAP = 6;

type SortKey = 'new' | 'old' | 'severity';

const SORTS: { key: SortKey; label: string }[] = [
    { key: 'new', label: 'Yangi birinchi' },
    { key: 'old', label: 'Eski birinchi' },
    { key: 'severity', label: 'Muhimligi bo\'yicha' },
];

/** Og'ish darajasi bo'yicha tartib (kichik raqam — muhimroq). */
const SEV_RANK: Record<Severity, number> = { kritik: 0, ogohlantirish: 1, axborot: 2, normal: 3 };

/* ── Ikonkalar ── */
const IconBell = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8.5a6 6 0 1 0-12 0c0 5.2-2 6.7-2 6.7h16s-2-1.5-2-6.7z" />
        <path d="M13.7 19a2 2 0 0 1-3.4 0" />
    </svg>
);

const IconArrowLeft = ({ size = 20 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const IconSearch = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={1.9} strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.6-3.6" />
    </svg>
);

const IconChevron = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6" />
    </svg>
);

const IconArrowRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
);

/* ── Filtr yorlig'i (tab) ── */
const FilterTab: React.FC<{
    label: string; count: number; active: boolean; accent: string; onClick: () => void;
}> = ({ label, count, active, accent, onClick }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '9px 12px', borderRadius: 10, cursor: 'pointer', flexShrink: 0,
            background: active ? `${accent}14` : GC.bg700,
            border: `1px solid ${active ? accent : 'transparent'}`,
            color: active ? accent : GC.textSecondary,
            fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
            whiteSpace: 'nowrap', transition: 'background .15s, border-color .15s',
        }}
    >
        {label}
        <span style={{
            background: accent, color: accent === GC.warning ? GC.bg900 : '#FFFFFF',
            fontSize: 11, fontWeight: 700, lineHeight: 1,
            padding: '3px 6px', borderRadius: 6, minWidth: 8, textAlign: 'center',
        }}>{count}</span>
    </button>
);

/* ── Hodisa qatori ── */
const EventRow: React.FC<{ event: AlarmEvent; striped: boolean; onOpen: () => void }> = ({ event, striped, onOpen }) => {
    const sev = SEVERITY[event.severity];
    const [hover, setHover] = useState(false);

    return (
        <div
            onClick={onOpen}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            title="Batafsil ko'rish"
            style={{
                display: 'grid',
                gridTemplateColumns: GRID_COLUMNS,
                alignItems: 'center', gap: GRID_GAP,
                borderRadius: "10px",
                overflow: "hidden",
                marginBottom: 8,
                padding: '11px 8px 11px 14px',
                borderLeft: `4px solid ${barColor(event)}`,
                background: hover ? 'rgba(255,255,255,0.045)' : striped ? 'rgba(255,255,255,0.018)' : 'transparent',
                cursor: 'pointer', transition: 'background .12s',
            }}
        >
            {/* Toifa ikonkasi — rangi chap chetidagi chiziq bilan bir xil
                (`barColor`), shuning uchun ikonka rang kodlashini takrorlaydi
                va toifani bir qarashda ajratib beradi. */}
            <span aria-hidden style={{
                color: barColor(event), display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <TypeIcon type={event.type} size={16} />
            </span>
            <span style={{ color: GC.textPrimary, fontSize: 12.5, fontVariantNumeric: 'tabular-nums' }}>{event.time}</span>
            {/* Tor panelda matn qisqarishi mumkin — `title` orqali to'liq
                ko'rinadi (panel kengligi ekranning 1/5 qismi bilan cheklangan). */}
            <span title={event.type} style={{
                color: GC.textPrimary, fontSize: 12, fontWeight: 600,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{event.type}</span>
            <span title={event.location} style={{
                color: GC.textSecondary, fontSize: 12,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{event.location}</span>
            <span title={event.description} style={{
                color: GC.textSecondary, fontSize: 12,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{event.description}</span>
            <span style={{
                background: sev.pillBg, color: sev.pillText, justifySelf: 'end',
                fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 7, whiteSpace: 'nowrap',
            }}>{sev.label}</span>
        </div>
    );
};

/* ── "Barchasini ko'rish" modali — toifalarga ajratilgan to'liq ro'yxat ── */
const AllEventsModal: React.FC<{ events: AlarmEvent[]; onPick: (e: AlarmEvent) => void; onClose: () => void }> = ({ events, onPick, onClose }) => {
    /* Toifa bo'yicha guruhlash — foydalanuvchi so'raganidek, alarmlar
       videotahlil / yong'in / ESG / SCADA / SKUD / ishlab chiqarish
       kesimida ko'rinadi. */
    const groups = useMemo(() => {
        const m = new Map<string, AlarmEvent[]>();
        for (const e of events) m.set(e.type, [...(m.get(e.type) ?? []), e]);
        return Array.from(m.entries());
    }, [events]);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1200,
                background: 'rgba(4, 8, 14, 0.72)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 'min(760px, 100%)', maxHeight: '86vh',padding: 20, display: 'flex', flexDirection: 'column',
                    background: GC.bg800, border: `1px solid ${GC.borderColor}`, borderRadius: 16,
                    fontFamily: '"Segoe UI", system-ui, sans-serif', boxSizing: 'border-box',
                }}
            >
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', borderBottom: `1px solid ${GC.borderColor}`,
                }}>
                    <div style={{ color: GC.textPrimary, fontSize: 16, fontWeight: 700 }}>
                        Barcha hodisalar <span style={{ color: GC.textDisabled, fontWeight: 400 }}>· {events.length} ta</span>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Yopish"
                        style={{
                            width: 30, height: 30, borderRadius: 8, cursor: 'pointer',
                            background: 'transparent', border: `1px solid ${GC.borderColor}`,
                            color: GC.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M5 5l14 14M19 5L5 19" />
                        </svg>
                    </button>
                </div>

                <div style={{ overflowY: 'auto', padding: '4px 0 12px' }}>
                    {groups.map(([type, list]) => (
                        <div key={type}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '14px 20px 8px', color: GC.textDisabled,
                                fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
                            }}>
                                <TypeIcon type={type} size={14} />
                                {type}
                                <span style={{ color: GC.textDisabled, fontWeight: 400 }}>· {list.length}</span>
                            </div>
                            {list.map((e, i) => (
                                <EventRow key={e.id} event={e} striped={i % 2 === 1} onOpen={() => onPick(e)} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════ */
const NotificationSideBar: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<FilterKey>('all');
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState<SortKey>('new');
    const [selected, setSelected] = useState<AlarmEvent | null>(null);
    const [showAll, setShowAll] = useState(false);

    /* Yorliqlardagi sonlar ma'lumotdan hisoblanadi — qo'lda yozilmaydi.
       Daraja bo'yicha sonlar faqat FAOL hodisalarni sanaydi, chunki
       arxivlanganlari o'sha yorliqlarda ko'rsatilmaydi — aks holda son
       ro'yxatdagi qatorlar soniga to'g'ri kelmay qolardi. */
    const counts: Record<FilterKey, number> = useMemo(() => {
        const live = ALARM_EVENTS.filter((e) => !e.archived);
        return {
            all: live.length,
            kritik: live.filter((e) => e.severity === 'kritik').length,
            ogohlantirish: live.filter((e) => e.severity === 'ogohlantirish').length,
            axborot: live.filter((e) => e.severity === 'axborot').length,
            normal: live.filter((e) => e.severity === 'normal').length,
            arxiv: ALARM_EVENTS.filter((e) => e.archived).length,
        };
    }, []);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        const list = ALARM_EVENTS.filter((e) => {
            /* Arxiv — darajadan mustaqil o'q: arxivlangan hodisa FAQAT "Arxiv"
               yorlig'ida, qolgan yorliqlarda faqat faol hodisalar ko'rinadi. */
            if (filter === 'arxiv' ? !e.archived : e.archived) return false;
            if (filter !== 'all' && filter !== 'arxiv' && e.severity !== filter) return false;
            if (!q) return true;
            return [e.type, e.location, e.description, e.time].some((v) => v.toLowerCase().includes(q));
        });
        return [...list].sort((a, b) => {
            if (sort === 'severity') return SEV_RANK[a.severity] - SEV_RANK[b.severity] || b.time.localeCompare(a.time);
            return sort === 'old' ? a.time.localeCompare(b.time) : b.time.localeCompare(a.time);
        });
    }, [filter, query, sort]);

    /* Ikonka ustidagi belgi — ko'rib chiqilmagan kritik/ogohlantirishlar soni. */
    const badge = counts.kritik + counts.ogohlantirish;

    /* "Arxiv" — neytral kulrang: u ogohlantirish emas, shuning uchun boshqa
       yorliqlar kabi diqqatni tortmasligi kerak. */
    const tabAccent = (key: FilterKey) =>
        key === 'all' ? GC.warning
            : key === 'arxiv' ? GC.textDisabled
                : SEVERITY[key].accent;

    return (
        <>
            {/* ── Ochish/yopish tugmasi ── */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? 'Bildirishnomalarni yopish' : 'Bildirishnomalarni ochish'}
                title="Hodisalar"
                style={{
                    position: 'fixed', top: TOP_OFFSET, left: open ? PANEL_WIDTH : 0, zIndex: 1100,
                    width: 42, height: 42, cursor: 'pointer',
                    borderRadius: '0 12px 12px 0',
                    background: GC.bg800, border: `1px solid ${GC.borderColor}`, borderLeft: 'none',
                    color: badge > 0 ? GC.danger : GC.textSecondary,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'left .28s cubic-bezier(.4,0,.2,1)',
                }}
            >
                {
                    open ?
                        <IconArrowLeft />
                        :
                        <IconBell />
                }
                {badge > 0 && !open && (
                    <span style={{
                        position: 'absolute', top: 5, right: 4,
                        background: GC.danger, color: '#FFFFFF',
                        fontSize: 9.5, fontWeight: 700, lineHeight: 1,
                        padding: '2px 4px', borderRadius: 5, minWidth: 7, textAlign: 'center',
                    }}>{badge}</span>
                )}
            </button>

            {/* ── Sidebar ── */}
            <aside
                style={{
                    position: 'fixed', top: TOP_OFFSET, left: 10, zIndex: 1090,
                    width: PANEL_WIDTH, height: `calc(100vh - ${TOP_OFFSET}px - 12px)`,
                    transform: open ? 'translateX(0)' : 'translateX(-102%)',
                    transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
                    display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
                    background: GC.bg900,
                    border: `1px solid ${GC.borderColor}`, borderLeft: 'none',
                    borderRadius: '0 16px 16px 0',
                    fontFamily: '"Segoe UI", system-ui, sans-serif',
                    boxShadow: '8px 0 28px rgba(0,0,0,.45)',
                    overflow: 'hidden',
                }}
            >
                {/* Sarlavha */}
                <div style={{ padding: '18px 18px 0', flexShrink: 0 }}>
                    <div style={{ color: GC.textPrimary, fontSize: 20, fontWeight: 700 }}>Hodisalar</div>
                </div>

                {/* Filtr yorliqlari */}
                <div style={{
                    display: 'flex', gap: 8, padding: '14px 18px 0', flexShrink: 0,
                    overflowX: 'auto', scrollbarWidth: 'none',
                }}>
                    {FILTERS.map((f) => (
                        <FilterTab
                            key={f.key}
                            label={f.label}
                            count={counts[f.key]}
                            active={filter === f.key}
                            accent={tabAccent(f.key)}
                            onClick={() => setFilter(f.key)}
                        />
                    ))}
                </div>

                {/* Qidiruv va saralash */}
                <div style={{ display: 'flex', gap: 8, padding: '14px 18px 0', flexShrink: 0 }}>
                    <div style={{
                        flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 9,
                        background: GC.bg700, border: `1px solid ${GC.borderColor}`,
                        borderRadius: 11, padding: '0 12px', height: 42,
                    }}>
                        <span style={{ color: GC.textDisabled, display: 'flex', flexShrink: 0 }}><IconSearch /></span>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Qidirish..."
                            style={{
                                flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
                                color: GC.textPrimary, fontSize: 13, fontFamily: 'inherit',
                            }}
                        />
                    </div>
                    <div style={{
                        position: 'relative', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
                        background: GC.bg700, border: `1px solid ${GC.borderColor}`,
                        borderRadius: 11, padding: '0 11px', height: 42,
                        color: GC.textPrimary, fontSize: 12.5,
                    }}>
                        <span style={{ whiteSpace: 'nowrap' }}>{SORTS.find((s) => s.key === sort)?.label}</span>
                        <span style={{ color: GC.textSecondary, display: 'flex' }}><IconChevron /></span>
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortKey)}
                            aria-label="Saralash"
                            style={{
                                position: 'absolute', inset: 0, width: '100%', height: '100%',
                                opacity: 0, cursor: 'pointer', fontFamily: 'inherit',
                            }}
                        >
                            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                    </div>
                </div>

                {/* Jadval sarlavhasi */}
                <div style={{
                    display: 'grid', gridTemplateColumns: GRID_COLUMNS,
                    alignItems: 'center', gap: GRID_GAP,
                    /* chap 18px = qatordagi 4px chiziq + 14px padding */
                    padding: '16px 8px 9px 18px', margin: '4px 14px 0 0', flexShrink: 0,
                    borderBottom: `1px solid ${GC.borderColor}`,
                    color: GC.textDisabled, fontSize: 11,
                }}>
                    {/* Ikonka ustuni sarlavhasiz — bo'sh katakcha ustunlarni
                        qatorlar bilan bir xil holatda ushlab turadi. */}
                    <span />
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                            <path d="M8 5v14M8 19l-3.5-3.5M16 19V5M16 5l3.5 3.5" />
                        </svg>
                        Vaqt
                    </span>
                    <span>Tur</span>
                    <span>Joylashuv</span>
                    <span>Tavsif</span>
                    <span style={{ justifySelf: 'end' }}>Holat</span>
                </div>

                {/* Hodisalar ro'yxati */}
                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 14px 4px 0' }}>
                    {visible.length === 0 ? (
                        <div style={{ color: GC.textDisabled, fontSize: 12.5, textAlign: 'center', padding: '32px 18px' }}>
                            Mos hodisa topilmadi
                        </div>
                    ) : (
                        visible.map((e, i) => (
                            <EventRow key={e.id} event={e} striped={i % 2 === 1} onOpen={() => setSelected(e)} />
                        ))
                    )}
                </div>

                {/* Pastki qator */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '13px 18px', flexShrink: 0, borderTop: `1px solid ${GC.borderColor}`,
                }}>
                    <span style={{ color: GC.textDisabled, fontSize: 12.5 }}>{visible.length} ta hodisa</span>
                    <button
                        onClick={() => setShowAll(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
                            background: 'transparent', border: 'none', padding: 0,
                            color: GC.accent2, fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
                        }}
                    >
                        Barchasini ko'rish <IconArrowRight />
                    </button>
                </div>
            </aside>

            {/* ── Modallar ── */}
            {showAll && (
                <AllEventsModal
                    events={visible}
                    onPick={(e) => { setShowAll(false); setSelected(e); }}
                    onClose={() => setShowAll(false)}
                />
            )}
            {selected && <EventModal event={selected} onClose={() => setSelected(null)} />}
        </>
    );
};

export default NotificationSideBar;
