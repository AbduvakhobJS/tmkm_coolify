import React from 'react';
import { GC } from '../../theme/palette';
import { AlarmEvent, SEVERITY, barColor } from './data';

/* ── Toifa ikonkalari — bir rangli (currentColor) chiziqli SVG ──
   Har bir kuzatuv tizimi o'z belgisiga ega, rang esa og'ish darajasidan
   olinadi, shuning uchun ikonkalar rangni o'zi belgilamaydi. */
const ICONS: Record<string, React.ReactNode> = {
    Videotahlil: (
        <>
            <rect x="2.5" y="6.5" width="12" height="11" rx="2" />
            <path d="M14.5 10.5 21.5 7v10l-7-3.5z" />
        </>
    ),
    "Yong'in": (
        <>
            <path d="M12 2.5s5.5 4.6 5.5 9.4a5.5 5.5 0 1 1-11 0C6.5 7.1 12 2.5 12 2.5z" />
            <path d="M12 18a2.6 2.6 0 0 0 2.6-2.6c0-1.7-2.6-4-2.6-4s-2.6 2.3-2.6 4A2.6 2.6 0 0 0 12 18z" strokeOpacity={0.55} />
        </>
    ),
    SCADA: (
        <>
            <rect x="2.5" y="4.5" width="19" height="13" rx="2" />
            <path d="M2.5 13.5h5l2-4 3 7 2.5-5 2 2h4.5" />
            <path d="M8.5 21h7M12 17.5V21" strokeOpacity={0.55} />
        </>
    ),
    ESG: (
        <>
            <path d="M12 21c0-6 3.5-10 8-10.5C20 16 17 21 12 21z" />
            <path d="M12 21C12 15 8.5 11 4 10.5 4 16 7 21 12 21z" strokeOpacity={0.55} />
            <path d="M12 21v-4" />
        </>
    ),
    SKUD: (
        <>
            <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
            <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
            <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
        </>
    ),
    'Ishlab chiqarish': (
        <>
            <path d="M3 20.5V9l6 4V9l6 4V9l6 4v7.5z" />
            <path d="M3 20.5h18" strokeOpacity={0.55} />
        </>
    ),
};

const TypeIcon: React.FC<{ type: string; size?: number }> = ({ type, size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        {ICONS[type] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
);

export { TypeIcon };

/* ── Bitta hodisa tafsiloti ── */
export const EventModal: React.FC<{ event: AlarmEvent; onClose: () => void }> = ({ event, onClose }) => {
    const sev = SEVERITY[event.severity];
    const accent = barColor(event);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1200,
                background: 'rgba(4, 8, 14, 0.72)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 20,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 'min(520px, 100%)', maxHeight: '86vh', overflowY: 'auto',
                    background: GC.bg800, border: `1px solid ${GC.borderColor}`,
                    borderRadius: 16, boxSizing: 'border-box',
                    fontFamily: '"Segoe UI", system-ui, sans-serif',
                }}
            >
                {/* Sarlavha */}
                <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '18px 20px 14px', borderBottom: `1px solid ${GC.borderColor}`,
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                        background: `${accent}1f`, color: accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <TypeIcon type={event.type} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: GC.textPrimary, fontSize: 17, fontWeight: 700 }}>{event.description}</div>
                        <div style={{ color: GC.textSecondary, fontSize: 12.5, marginTop: 3 }}>
                            {event.type} · {event.location}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Yopish"
                        style={{
                            width: 30, height: 30, borderRadius: 8, flexShrink: 0, cursor: 'pointer',
                            background: 'transparent', border: `1px solid ${GC.borderColor}`,
                            color: GC.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M5 5l14 14M19 5L5 19" />
                        </svg>
                    </button>
                </div>

                {/* Holat va vaqt */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px 0' }}>
                    <span style={{
                        background: sev.pillBg, color: sev.pillText,
                        fontSize: 11.5, fontWeight: 600, padding: '4px 12px', borderRadius: 7,
                    }}>{sev.label}</span>
                    <span style={{ color: GC.textSecondary, fontSize: 12.5 }}>
                        Ro'yxatga olindi: <span style={{ color: GC.textPrimary, fontVariantNumeric: 'tabular-nums' }}>{event.time}</span>
                    </span>
                </div>

                {/* Toifaga xos maydonlar */}
                <div style={{ padding: '14px 20px 18px' }}>
                    {event.details.map((d) => (
                        <div key={d.label} style={{
                            display: 'flex', gap: 12, alignItems: 'baseline',
                            padding: '9px 0', borderBottom: `1px solid ${GC.borderColor}`,
                        }}>
                            <span style={{ color: GC.textDisabled, fontSize: 12, width: 132, flexShrink: 0 }}>{d.label}</span>
                            <span style={{ color: GC.textPrimary, fontSize: 12.5, flex: 1, minWidth: 0 }}>{d.value}</span>
                        </div>
                    ))}
                </div>

                {/* Amallar */}
                <div style={{ display: 'flex', gap: 8, padding: '0 20px 18px' }}>
                    <button style={{
                        flex: 1, padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                        background: GC.accent1, border: 'none', color: '#FFFFFF',
                        fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
                    }}>Ko'rib chiqildi deb belgilash</button>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                            background: 'transparent', border: `1px solid ${GC.borderColor}`,
                            color: GC.textSecondary, fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
                        }}
                    >Yopish</button>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
