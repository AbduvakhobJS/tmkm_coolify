import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
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

/* ── Hodisa turlari uchun aktivlar (rasm • xarita • ovoz) ──────────────────
   Barcha alarm toifalari to'rtta "voqea turi"ga birlashtiriladi; har biriga
   o'z kadri, joylashuv plani (xarita) va ovozli signali biriktirilgan.
   Fayllar `public/alarm/` ichida turadi. */
type AlarmKind = 'yongin' | 'gaz' | 'kirish' | 'pech';

const KIND_BY_TYPE: Record<AlarmType, AlarmKind> = {
    "Yong'in": 'yongin',
    SCADA: 'pech',
    'Ishlab chiqarish': 'gaz',
    ESG: 'gaz',
    Videotahlil: 'kirish',
    SKUD: 'kirish',
};

type KindAsset = {
    /** Hodisa kadri (kamera surati). */
    image: string;
    /** Joylashuv plani — modalning pastki qismida chiqadi. */
    map: string;
    /** Alarm ovozi. */
    sound: string;
    /** "Hodisa haqida" panelidagi turga xos maydonlar. */
    plant: string;
    camera: string;
    detection: string;
    confidence: string;
    weather: string;
    /** Kichik interaktiv xaritadagi marker nuqtasi — [lon, lat]. */
    coords: [number, number];
};

const KIND_ASSETS: Record<AlarmKind, KindAsset> = {
    yongin: {
        image: 'pj.png', map: 'pj_map.png', sound: 'pojar.mp3',
        plant: 'Navoiy 2-son Metallurgiya zavodi',
        camera: 'Kamera 12', detection: 'Olov / tutun (termal kanal)',
        confidence: '98%', weather: 'Ochiq, 26 °C',
        coords: [65.140, 40.095],
    },
    gaz: {
        image: 'gaz.png', map: 'gaz_map.png', sound: 'gaz.mp3',
        plant: 'Navoiy 1-son Gidrometallurgiya zavodi',
        camera: 'Kamera 8', detection: 'Harorat va gaz datchigi',
        confidence: '93%', weather: 'Bulutli, 22 °C',
        coords: [65.175, 40.083],
    },
    kirish: {
        image: 'ruxsatsiz_kirish.png', map: 'ruxsatsiz_kirish_map.png', sound: 'ruhsatsiz_kirish.mp3',
        plant: 'Navoiy 1-son Gidrometallurgiya zavodi',
        camera: 'Kamera 5', detection: 'Inson (ruxsatsiz hudud)',
        confidence: '96%', weather: 'Ochiq, 24 °C',
        coords: [65.162, 40.101],
    },
    pech: {
        image: 'pech.png', map: 'pech_map.png', sound: 'pech.mp3',
        plant: 'Navoiy 2-son Metallurgiya zavodi',
        camera: 'Kamera 3 · Eritish sexi', detection: 'Harorat datchigi (pech termoparasi)',
        confidence: '97%', weather: 'Ochiq, 25 °C',
        coords: [65.148, 40.088],
    },
};

const ALARM_ASSETS = `${process.env.PUBLIC_URL ?? ''}/alarm`;

const kindOf = (type: AlarmType): AlarmKind => KIND_BY_TYPE[type] ?? 'gaz';
const assetsFor = (event: AlarmEvent): KindAsset => KIND_ASSETS[kindOf(event.type)];
/** Hodisaning o'z `image` maydoni ustunroq, aks holda tur bo'yicha rasm. */
const imageFor = (event: AlarmEvent) => `${ALARM_ASSETS}/${event.image ?? assetsFor(event).image}`;
const mapFor = (event: AlarmEvent) => `${ALARM_ASSETS}/${assetsFor(event).map}`;

/* ── Alarm ovozlari navbati ───────────────────────────────────────────────
   Bir vaqtda faqat bitta signal chalinadi; qolganlari navbatda oldingisi
   tugashini kutadi. Brauzer ovozni bloklasa yoki fayl yuklanmasa — navbat
   keyingisiga o'tadi. */
type QueuedSound = { key: string; src: string; audio?: HTMLAudioElement };

const soundQueue: QueuedSound[] = [];
let currentSound: QueuedSound | null = null;

const playNextSound = () => {
    currentSound = soundQueue.shift() ?? null;
    const item = currentSound;
    if (!item) return;
    const audio = new Audio(item.src);
    item.audio = audio;
    const done = () => { if (currentSound === item) playNextSound(); };
    audio.addEventListener('ended', done);
    audio.addEventListener('error', done);
    audio.play().catch(done);
};

let soundSeq = 0;

/** Alarm signalini navbatga qo'yadi. `key` (hodisa ID) bo'yicha bitta hodisa
 *  signali navbatda ikki marta turmaydi. Qaytgan funksiya signalni bekor
 *  qiladi: navbatda bo'lsa olib tashlaydi, chalinayotgan bo'lsa to'xtatib
 *  keyingisiga o'tadi. */
export const playAlarmSound = (type?: AlarmType, key?: string): (() => void) => {
    if (key && (currentSound?.key === key || soundQueue.some((s) => s.key === key))) {
        return () => {};
    }
    const file = KIND_ASSETS[type ? kindOf(type) : 'kirish'].sound;
    const item: QueuedSound = { key: key ?? `sound-${++soundSeq}`, src: `${ALARM_ASSETS}/${file}` };
    soundQueue.push(item);
    if (!currentSound) playNextSound();

    return () => {
        const i = soundQueue.indexOf(item);
        if (i !== -1) {
            soundQueue.splice(i, 1);
        } else if (currentSound === item) {
            item.audio?.pause();
            playNextSound();
        }
    };
};

/* ── Kichik interaktiv xarita — "Joylashuv" blokining ikkinchi kartasi.
   Asosiy 3D xaritada (`Map3d.tsx`) ishlatilgan bazaviy MapTiler uslubidan
   foydalanadi, faqat hodisa nuqtasida bitta alarm markeri bilan. */
const MINI_MAP_STYLE = 'https://api.maptiler.com/maps/019de83b-bc0c-7558-9ffe-1761aa83c410/style.json?key=YqciQrrpszIp23MCz2am';

const MiniAlarmMap: React.FC<{ coords: [number, number]; color: string }> = ({ coords, color }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const map = new maplibregl.Map({
            container: containerRef.current,
            style: MINI_MAP_STYLE,
            center: coords,
            zoom: 15,
            attributionControl: false,
        });
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

        /* Alarm markeri — "pin" shakli + ichida ogohlantirish uchburchagi,
           rangi hodisa og'ish darajasiga mos (accent). */
        const el = document.createElement('div');
        el.style.cssText = `
            width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
            background: ${color}; border: 2px solid #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.55);
            display: flex; align-items: center; justify-content: center;
        `;
        el.innerHTML = `
            <svg style="transform: rotate(45deg)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3 2 20h20L12 3z" />
                <path d="M12 10v4" />
                <circle cx="12" cy="17" r="0.6" fill="#fff" stroke="none" />
            </svg>
        `;
        new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(coords).addTo(map);

        return () => map.remove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coords, color]);

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

/* ── Sana / vaqt / hodisa ID ──────────────────────────────────────────────
   `AlarmEvent` da faqat `HH:MM` bor; jonli kelgan alarmda `receivedAt` ham
   bo'ladi — sana va soniyalar shundan olinadi, aks holda bugungi sana. */
const pad = (n: number) => String(n).padStart(2, '0');

const stamp = (event: AlarmEvent) => {
    const d = event.receivedAt ? new Date(event.receivedAt) : new Date();
    const seconds = event.receivedAt ? d.getSeconds() : (event.id.length * 7) % 60;
    const digits = event.id.replace(/\D/g, '') || '0';
    return {
        date: `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`,
        time: `${event.time}:${pad(seconds)}`,
        code: `SEC-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${digits.slice(-5).padStart(5, '0')}`,
    };
};

/* ── Bitta hodisa tafsiloti ── */
export const EventModal: React.FC<{ event: AlarmEvent; onClose: () => void }> = ({ event, onClose }) => {
    const sev = SEVERITY[event.severity];
    const accent = barColor(event);
    const asset = assetsFor(event);
    const { date, time, code } = stamp(event);
    const [imgFailed, setImgFailed] = useState(false);
    const [mapFailed, setMapFailed] = useState(false);

    /* Modal ro'yxatdagi qatorni bosish orqali ochiladi — bu foydalanuvchi
       harakati, shuning uchun brauzer ovozni bloklamaydi. Boshqa hodisa
       ochilsa turiga mos signal qaytadan chalinadi. */
    useEffect(() => {
        setImgFailed(false);
        setMapFailed(false);
        return playAlarmSound(event.type, event.id);
    }, [event.id, event.type]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    /* "Hodisa haqida" paneli — turdan generatsiya qilingan maydonlar va
       `data.ts` dagi toifaga xos qatorlar. */
    const rows: { label: string; value: React.ReactNode }[] = [
        {
            label: 'Holat',
            value: (
                <span style={{
                    background: sev.pillBg, color: sev.pillText, display: 'inline-block',
                    fontWeight: 700, padding: '0.25em 0.9em', borderRadius: 999,
                }}>{sev.label}</span>
            ),
        },
        { label: 'Turi', value: event.type },
        { label: 'Hodisa', value: event.description },
        { label: 'Zavod', value: asset.plant },
        { label: 'Joylashuv', value: event.location },
        { label: 'Vaqt', value: `${date}  ${time}` },
        { label: 'Kamera', value: asset.camera },
        { label: 'Aniqlash turi', value: asset.detection },
        { label: 'Ishonchlilik', value: asset.confidence },
        { label: 'Ob-havo', value: asset.weather },
        ...event.details,
    ];

    const card: React.CSSProperties = {
        background: GC.bg900, border: `1px solid ${GC.borderColor}`,
        borderRadius: 14, overflow: 'hidden', minHeight: 0,
    };
    const labelStyle: React.CSSProperties = { color: GC.textSecondary, fontSize: '0.92em' };

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1200,
                background: 'rgba(4, 8, 14, 0.62)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                /* Chapdagi bildirishnomalar paneli modal ochiqligida ham
                   ko'rinib turishi uchun — modal qolgan maydon o'rtasida. */
                padding: '24px 24px 24px calc(max(340px, 20vw) + 24px)',
                boxSizing: 'border-box',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    /* Avvalgi o'lchamdan ~1.3 barobar kichik */
                    width: 'min(2308px, 71vw)', height: 'min(1354px, 59vh)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    background: GC.bg800, border: `1px solid ${GC.borderColor}`,
                    borderTop: `4px solid ${accent}`,
                    borderRadius: 16, boxSizing: 'border-box',
                    fontFamily: '"Segoe UI", system-ui, sans-serif',
                    fontSize: 'clamp(13px, 0.55vw, 26px)',
                    boxShadow: `0 0 60px ${accent}33`,
                }}
            >
                {/* ── Sarlavha: chapda holat tabletkasi + tur / joylashuv,
                       o'ngda sana, vaqt va yopish tugmasi ── */}
                <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1.2em', flexShrink: 0,
                    padding: '1.1em 1.4em', borderBottom: `1px solid ${GC.borderColor}`,
                }}>
                    <span style={{
                        background: sev.pillBg, color: sev.pillText, flexShrink: 0,
                        fontSize: '1.15em', fontWeight: 700, padding: '0.35em 1.1em',
                        borderRadius: 999, marginTop: '0.2em',
                    }}>{sev.label}</span>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            color: GC.textPrimary, fontSize: '1.7em', fontWeight: 700, lineHeight: 1.2,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{event.type}</div>
                        <div style={{
                            color: GC.textSecondary, fontSize: '1.15em', marginTop: '0.35em',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{event.location}</div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, lineHeight: 1.5 }}>
                        <div style={{
                            color: GC.textPrimary, fontSize: '1.15em', fontVariantNumeric: 'tabular-nums',
                            display: 'flex', gap: '0.9em', justifyContent: 'flex-end',
                        }}>
                            <span>{date}</span><span>{time}</span>
                        </div>
                        <div style={{ ...labelStyle, fontVariantNumeric: 'tabular-nums' }}>Hodisa ID: {code}</div>
                    </div>

                    <button
                        onClick={onClose}
                        aria-label="Yopish"
                        style={{
                            width: '2.6em', height: '2.6em', borderRadius: 10, flexShrink: 0, cursor: 'pointer',
                            background: 'transparent', border: 'none', color: GC.textSecondary,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M5 5l14 14M19 5L5 19" />
                        </svg>
                    </button>
                </div>

                {/* ── Tana: tepada kadr (60%) + hodisa ma'lumoti, pastda xarita ── */}
                <div style={{
                    flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
                    gap: '1em', padding: '1em 1.2em 1.2em',
                }}>
                    <div style={{
                        flex: '1.15 1 0', minHeight: 0, display: 'grid',
                        gridTemplateColumns: '60% minmax(0, 1fr)', gap: '1em',
                    }}>
                        {/* Kamera kadri */}
                        <div style={{ ...card, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {imgFailed ? (
                                <div style={{
                                    color: GC.textDisabled, display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', gap: '0.8em',
                                }}>
                                    <TypeIcon type={event.type} size={120} />
                                    Rasm mavjud emas
                                </div>
                            ) : (
                                <img
                                    src={imageFor(event)}
                                    alt={event.type}
                                    onError={() => setImgFailed(true)}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                />
                            )}
                            {/* Kadr ustidagi kamera nomi va vaqt */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0,
                                display: 'flex', alignItems: 'center', gap: '0.8em',
                                padding: '0.55em 0.8em', fontSize: '1.02em', color: GC.textPrimary,
                                background: 'linear-gradient(rgba(4,8,14,0.85), rgba(4,8,14,0))',
                            }}>
                                <span style={{
                                    background: 'rgba(4,8,14,0.75)', border: `1px solid ${accent}66`,
                                    borderRadius: 6, padding: '0.15em 0.6em', fontWeight: 600, flexShrink: 0,
                                }}>{asset.camera}</span>
                                <span style={{ color: GC.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {event.location}
                                </span>
                                <span style={{ marginLeft: 'auto', flexShrink: 0, fontVariantNumeric: 'tabular-nums', display: 'flex', gap: '0.8em' }}>
                                    <span>{date}</span><span>{time}</span>
                                </span>
                            </div>
                        </div>

                        {/* Hodisa haqida */}
                        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                flexShrink: 0, padding: '0.8em 1em', borderBottom: `1px solid ${GC.borderColor}`,
                                color: GC.textPrimary, fontSize: '1.25em', fontWeight: 600,
                            }}>Hodisa haqida</div>
                            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 1em' }}>
                                {rows.map((d, i) => (
                                    <div key={`${d.label}-${i}`} style={{
                                        display: 'grid', gridTemplateColumns: 'minmax(0, 0.8fr) minmax(0, 1.2fr)',
                                        gap: '1em', alignItems: 'baseline', padding: '0.7em 0',
                                        borderBottom: i === rows.length - 1 ? 'none' : `1px solid ${GC.borderColor}`,
                                    }}>
                                        <span style={labelStyle}>{d.label}</span>
                                        <span style={{ color: GC.textPrimary, fontWeight: 500 }}>{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Joylashuv — yonma-yon 2 karta: chapda reja rasmi (xarita rasmi
                        topilmasa karta chiqarilmaydi), o'ngda haqiqiy xaritadagi nuqta */}
                    <div style={{
                        flex: '1 1 0', minHeight: 0, display: 'grid',
                        gridTemplateColumns: mapFailed ? '1fr' : '1fr 1fr', gap: '1em',
                    }}>
                        {!mapFailed && (
                            <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    flexShrink: 0, padding: '0.7em 1em', borderBottom: `1px solid ${GC.borderColor}`,
                                    color: GC.textPrimary, fontSize: '1.2em', fontWeight: 600,
                                }}>Joylashuv plani</div>
                                <img
                                    src={mapFor(event)}
                                    alt={`${event.location} — joylashuv plani`}
                                    onError={() => setMapFailed(true)}
                                    style={{ flex: 1, minHeight: 0, width: '100%', objectFit: 'cover', display: 'block' }}
                                />
                            </div>
                        )}

                        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                flexShrink: 0, padding: '0.7em 1em', borderBottom: `1px solid ${GC.borderColor}`,
                                color: GC.textPrimary, fontSize: '1.2em', fontWeight: 600,
                            }}>Xaritadagi joylashuv</div>
                            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                                <MiniAlarmMap coords={asset.coords} color={accent} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventModal;
