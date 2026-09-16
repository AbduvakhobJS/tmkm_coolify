import React, { useEffect, useState } from 'react';
import { GC } from '../../theme/palette';
import { AlarmEvent, AlarmType, SEVERITY, barColor } from './data';

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

/* ── Toifaga mos rasm ──────────────────────────────────────────────────────
   Rasmlar `public/alarm/` ichida. Hodisaning o'z `image` maydoni bo'lsa u
   olinadi, aks holda toifa bo'yicha shu jadvaldan. Yangi rasm yuklanganda
   jadvalga bitta qator qo'shish kifoya (masalan `ESG: 'esg.png'`).
     • pj.png   — yong'in signali
     • gaz.png  — pechda harorat oshishi (SCADA / ishlab chiqarish datchiklari)
     • odam.png — taqiqlangan hududga odam kirishi (videotahlil / SKUD) */
const ALARM_ASSETS = `${process.env.PUBLIC_URL ?? ''}/alarm`;
const TYPE_IMAGE: Partial<Record<AlarmType, string>> = {
    "Yong'in": 'pj.png',
    SCADA: 'gaz.png',
    'Ishlab chiqarish': 'gaz.png',
    Videotahlil: 'odam.png',
    SKUD: 'odam.png',
};
const DEFAULT_IMAGE = 'pj.png';
const imageFor = (event: AlarmEvent) => `${ALARM_ASSETS}/${event.image ?? TYPE_IMAGE[event.type] ?? DEFAULT_IMAGE}`;

/** Alarm signali. Brauzer sahifada hali hech qanday bosish bo'lmagan bo'lsa
 *  ovozni bloklashi mumkin — u holda jim o'tadi. Qaytgan `Audio` orqali
 *  chaqiruvchi ovozni to'xtata oladi. */
const ALARM_SOUND = `${ALARM_ASSETS}/alarm.mp3`;
export const playAlarmSound = (): HTMLAudioElement => {
    const audio = new Audio(ALARM_SOUND);
    audio.play().catch(() => { /* brauzer ruxsat bermasa — jim qoladi */ });
    return audio;
};

/* ── Bitta hodisa tafsiloti ── */
export const EventModal: React.FC<{ event: AlarmEvent; onClose: () => void }> = ({ event, onClose }) => {
    const sev = SEVERITY[event.severity];
    const accent = barColor(event);
    const [imgFailed, setImgFailed] = useState(false);

    /* Modal ro'yxatdagi qatorni bosish orqali ochiladi — bu foydalanuvchi
       harakati, shuning uchun brauzer ovozni bloklamaydi. Boshqa hodisa
       ochilsa signal qaytadan chalinadi. */
    useEffect(() => {
        setImgFailed(false);
        const audio = playAlarmSound();
        return () => { audio.pause(); audio.currentTime = 0; };
    }, [event.id]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const rows = [
        { label: 'Toifa', value: event.type },
        { label: 'Joylashuv', value: event.location },
        ...event.details,
    ];

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1200,
                background: 'rgba(4, 8, 14, 0.78)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 32,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: 'min(3000px, 92vw)', height: 'min(1760px, 77vh)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    background: GC.bg800, border: `1px solid ${GC.borderColor}`,
                    borderTop: `4px solid ${accent}`,
                    borderRadius: 20, boxSizing: 'border-box',
                    fontFamily: '"Segoe UI", system-ui, sans-serif',
                    boxShadow: `0 0 80px ${accent}33`,
                }}
            >
                {/* Sarlavha */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0,
                    padding: 'clamp(16px, 0.7vw, 32px) clamp(20px, 0.9vw, 40px)', borderBottom: `1px solid ${GC.borderColor}`,
                }}>
                    <div style={{
                        width: 'clamp(48px, 2.2vw, 96px)', height: 'clamp(48px, 2.2vw, 96px)', borderRadius: 16, flexShrink: 0,
                        background: `${accent}1f`, color: accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <TypeIcon type={event.type} size={48} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            color: GC.textPrimary, fontSize: 'clamp(24px, 1.2vw, 52px)', fontWeight: 700,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{event.description}</div>
                        <div style={{ color: GC.textSecondary, fontSize: 'clamp(15px, 0.7vw, 30px)', marginTop: 6 }}>
                            {event.type} · {event.location}
                        </div>
                    </div>
                    <span style={{
                        background: sev.pillBg, color: sev.pillText, flexShrink: 0,
                        fontSize: 'clamp(15px, 0.7vw, 30px)', fontWeight: 700, padding: '0.4em 1.1em', borderRadius: 12,
                    }}>{sev.label}</span>
                    <button
                        onClick={onClose}
                        aria-label="Yopish"
                        style={{
                            width: 'clamp(40px, 1.8vw, 76px)', height: 'clamp(40px, 1.8vw, 76px)', borderRadius: 14, flexShrink: 0, cursor: 'pointer',
                            background: 'transparent', border: `1px solid ${GC.borderColor}`,
                            color: GC.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M5 5l14 14M19 5L5 19" />
                        </svg>
                    </button>
                </div>

                {/* Tana: chapda toifa rasmi, o'ngda tafsilotlar */}
                <div style={{
                    flex: 1, minHeight: 0, display: 'grid',
                    gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
                    gap: 'clamp(16px, 0.8vw, 36px)', padding: 'clamp(16px, 0.8vw, 36px)',
                }}>
                    <div style={{
                        position: 'relative', minHeight: 0, borderRadius: 16, overflow: 'hidden',
                        background: GC.bg900, border: `1px solid ${GC.borderColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {imgFailed ? (
                            <div style={{
                                color: GC.textDisabled, fontSize: 'clamp(15px, 0.7vw, 30px)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                            }}>
                                <TypeIcon type={event.type} size={160} />
                                Rasm mavjud emas
                            </div>
                        ) : (
                            <img
                                src={imageFor(event)}
                                alt={event.type}
                                onError={() => setImgFailed(true)}
                                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                            />
                        )}
                        <div style={{
                            position: 'absolute', left: 20, bottom: 20,
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: 'rgba(4, 8, 14, 0.72)', border: `1px solid ${accent}66`,
                            color: GC.textPrimary, borderRadius: 12, padding: '0.45em 0.9em', fontSize: 'clamp(14px, 0.65vw, 28px)',
                        }}>
                            <span style={{ width: '0.6em', height: '0.6em', borderRadius: '50%', background: accent, boxShadow: `0 0 10px ${accent}` }} />
                            {event.location} · <span style={{ fontVariantNumeric: 'tabular-nums' }}>{event.time}</span>
                        </div>
                    </div>

                    <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ color: GC.textSecondary, fontSize: 'clamp(15px, 0.7vw, 30px)', paddingBottom: '0.7em', borderBottom: `1px solid ${GC.borderColor}` }}>
                            Ro'yxatga olindi: <span style={{ color: GC.textPrimary, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{event.time}</span>
                        </div>

                        {/* Toifaga xos maydonlar */}
                        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                            {rows.map((d) => (
                                <div key={d.label} style={{
                                    display: 'flex', flexDirection: 'column', gap: '0.3em', fontSize: 'clamp(14px, 0.6vw, 26px)',
                                    padding: '0.9em 0', borderBottom: `1px solid ${GC.borderColor}`,
                                }}>
                                    <span style={{ color: GC.textDisabled, fontSize: '1em', textTransform: 'uppercase', letterSpacing: 0.5 }}>{d.label}</span>
                                    <span style={{ color: GC.textPrimary, fontSize: '1.45em', fontWeight: 500 }}>{d.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Amallar */}
                        <div style={{ display: 'flex', gap: 16, paddingTop: 'clamp(14px, 0.7vw, 32px)', flexShrink: 0 }}>
                            <button style={{
                                flex: 1, padding: '0.8em 1em', borderRadius: 14, cursor: 'pointer',
                                background: GC.accent1, border: 'none', color: '#FFFFFF',
                                fontSize: 'clamp(15px, 0.75vw, 32px)', fontWeight: 600, fontFamily: 'inherit',
                            }}>Ko'rib chiqildi deb belgilash</button>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '0.8em 1.6em', borderRadius: 14, cursor: 'pointer',
                                    background: 'transparent', border: `1px solid ${GC.borderColor}`,
                                    color: GC.textSecondary, fontSize: 'clamp(15px, 0.75vw, 32px)', fontWeight: 600, fontFamily: 'inherit',
                                }}
                            >Yopish</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
