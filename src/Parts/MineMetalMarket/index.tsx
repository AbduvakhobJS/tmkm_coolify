import React, { useState } from 'react';
import { GC } from '../../theme/palette';
import {
    ASSETS, SEGMENTS, TOP_KPIS, Segment, ActiveUnit, PlannedUnit, TopKpi, fmtNum,
} from './data';

/* ══════════════════════════════════════════════════════════════════════════
   MINE → METAL → MARKET — to'liq infografika.

   Tuzilishi (namunaviy rasmga mos):
     1) Yuqorida  — 7 ta KPI kartochkasi, markazda TMK belgisi;
     2) O'rtada   — TMK dan tarqaladigan ulanish chiziqlari va uchta doira
                    (MINE / METAL / MARKET);
     3) Pastda    — uchta ramkali kartochka. Har birida: sarlavha (chapda nom,
                    O'NGDA ikkita yig'ma ko'rsatkich), "faoliyatda bo'lgan"
                    obyektlarning KICHIK KARTOCHKALARI va "qurilayotgan /
                    loyiha bosqichidagi" obyektlar kartochkalari.

   Komponent dashboard katakchasida ham (`TopCenter`, ~435×288px), to'liq
   ekranda ham (`/main/mine-metal-market`) ishlaydi: barcha o'lchamlar `cqmin`
   birligida bo'lib, o'zi turgan konteynerga qarab masshtablanadi.
   ══════════════════════════════════════════════════════════════════════════ */

/** `clamp(min, Ncqmin, max)` — konteynerga nisbatan masshtablanuvchi o'lcham. */
const cq = (min: number, pref: number, max: number) => `clamp(${min}px, ${pref}cqmin, ${max}px)`;

/* ── Ikonkalar ── */
const Svg: React.FC<{ children: React.ReactNode; size?: number | string }> = ({ children, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

const ICONS: Record<string, React.ReactNode> = {
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 5.3a3.2 3.2 0 0 1 0 5.4M17.5 14.4A6.5 6.5 0 0 1 21.5 20" strokeOpacity={0.55} /></>,
    chart: <><path d="M3 20.5h18" /><rect x="5" y="12" width="3.4" height="8.5" rx="1" /><rect x="10.3" y="7" width="3.4" height="13.5" rx="1" /><rect x="15.6" y="4" width="3.4" height="16.5" rx="1" /></>,
    coins: <><ellipse cx="12" cy="6.5" rx="7.5" ry="3" /><path d="M4.5 6.5v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-5" /><path d="M4.5 11.5v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-5" strokeOpacity={0.55} /></>,
    bolt: <><path d="M13 2.5 4.5 13.5H11l-.5 8 8.5-11H12.5z" /></>,
    drop: <><path d="M12 3s6 6.4 6 10.4a6 6 0 1 1-12 0C6 9.4 12 3 12 3z" /></>,
    leaf: <><path d="M12 21c0-6 3.5-10 8-10.5C20 16 17 21 12 21z" /><path d="M12 21v-4" strokeOpacity={0.55} /></>,
    mine: <><path d="M3 20.5 13 10.5" /><path d="M8.5 5.5a7 7 0 0 1 10 10z" /><path d="M14.5 3.5 20.5 9.5" strokeOpacity={0.55} /></>,
    metal: <><path d="M3 20.5V9l6 4V9l6 4V9l6 4v7.5z" /><path d="M3 20.5h18" strokeOpacity={0.55} /></>,
    market: <><path d="M2.5 20.5h19" /><path d="M4.5 20.5V9l7-4.5L18.5 9v11.5" /><rect x="9" y="13" width="5" height="7.5" rx="1" strokeOpacity={0.55} /></>,
    build: <><path d="M3 20.5h18" /><path d="M6 20.5V7l6-3.5V20.5" /><path d="M12 10.5l6 3v7" strokeOpacity={0.55} /></>,
    plan: <><rect x="4" y="3.5" width="16" height="17" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" strokeOpacity={0.65} /></>,
};

const Icon: React.FC<{ name: string; size?: number | string }> = ({ name, size = 16 }) => (
    <Svg size={size}>{ICONS[name] ?? <circle cx="12" cy="12" r="8" />}</Svg>
);

const SEGMENT_ICON: Record<string, string> = { mine: 'mine', metal: 'metal', market: 'market' };
/** Obyekt kartochkasidagi "foto o'rni" uchun toifa ikonkasi. */
const UNIT_ICON: Record<string, string> = { mine: 'mine', metal: 'metal', market: 'market' };

const Delta: React.FC<{ v: number | null; size?: number | string }> = ({ v, size = 11 }) => {
    if (v === null) return <span style={{ color: GC.textDisabled, fontSize: size, fontWeight: 700 }}>—</span>;
    const up = v >= 0;
    return (
        <span style={{ color: up ? GC.success : GC.danger, fontSize: size, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {up ? '▲' : '▼'} {up ? '+' : '−'}{Math.abs(v).toFixed(1)}%
        </span>
    );
};

/* ══════════════ 1) YUQORIDAGI KPI QATORI ══════════════ */

const KpiCard: React.FC<{ kpi: TopKpi }> = ({ kpi }) => (
    <div style={{
        flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: cq(5, 1.4, 13),
        background: 'linear-gradient(160deg, rgba(13, 24, 38, .88), rgba(7, 14, 23, .82))',
        border: `1px solid ${GC.borderColor}`,
        borderRadius: cq(7, 1.9, 16), padding: `${cq(5, 1.4, 13)} ${cq(6, 1.7, 16)}`,
        backdropFilter: 'blur(5px)',
        boxShadow: '0 2px 14px rgba(0,0,0,.35)',
    }}>
        {/* Ikonka — o'z fonli kvadrat ichida, rasmga mos ravishda kattaroq */}
        <span style={{
            width: cq(18, 5, 44), height: cq(18, 5, 44), borderRadius: cq(5, 1.4, 12), flexShrink: 0,
            // background: `${GC.accent1}22`
            // , color: GC.accent2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            {/*<Icon name={kpi.icon} size={cq(10, 2.8, 24)} />*/}
            <img src={`/icons/` + kpi?.icon} alt="" style={{width: "100%"}}/>
        </span>

        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: cq(1, 0.3, 3) }}>
            <div style={{
                color: GC.textSecondary, fontSize: cq(6, 1.6, 13), lineHeight: 1.2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{kpi.label}</div>
            <div style={{
                color: GC.textPrimary, fontSize: cq(11, 3.1, 27), fontWeight: 800,
                lineHeight: 1.1, whiteSpace: 'nowrap', letterSpacing: -0.2,
            }}>{kpi.value}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: cq(2, 0.6, 6), minWidth: 0 }}>
                <Delta v={kpi.delta} size={cq(6, 1.65, 13.5)} />
                {kpi.note && (
                    <span style={{
                        color: GC.textDisabled, fontSize: cq(4.5, 1.15, 9.5),
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>({kpi.note})</span>
                )}
            </div>
        </div>
    </div>
);

/**
 * Markazdagi TMK belgisi — matn emas, kompaniyaning haqiqiy logotipi,
 * aylana ichida. Avval `mmm/tmk-logo.png` qidiriladi; u qo'yilmagan bo'lsa
 * loyihadagi mavjud `logow.png` ga tushadi (`onError`).
 */
const TmkBadge: React.FC = () => {
    const [src, setSrc] = useState<string>(ASSETS.logo);
    return (
        <div style={{
            width: cq(46, 12.5, 112), height: cq(46, 12.5, 112), borderRadius: '50%', flexShrink: 0,
            background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #e8f4fb 62%, #cfe6f5 100%)',
            border: `${cq(1.5, 0.4, 3)} solid ${GC.accent2}`,
            boxShadow: `0 0 ${cq(7, 2, 26)} ${GC.accent1}88, inset 0 0 ${cq(4, 1.2, 14)} rgba(255,255,255,.9)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', padding: cq(3, 0.9, 9), boxSizing: 'border-box',
        }}>
            <img
                src={src}
                alt="TMK"
                onError={() => setSrc(ASSETS.logoFallback)}
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
        </div>
    );
};

/* ══════════════ 2) ULANISH CHIZIQLARI VA UCH DOIRA ══════════════ */

/**
 * TMK belgisidan uchta doiraga tarqaladigan ulanish chiziqlari.
 * Burchakli emas — silliq oval (kubik Bezye) egri chiziqlar; har biri ikki
 * marta chiziladi: pastda qalin va xiralashgan (neon nur), ustida ingichka
 * yorqin chiziq.
 */
const NeonPath: React.FC<{ d: string; color: string }> = ({ d, color }) => (
    <>
        <path d={d} fill="none" stroke={color} strokeOpacity={0.45} strokeWidth={7}
              strokeLinecap="round" filter="url(#mmm-neon)" />
        <path d={d} fill="none" stroke={color} strokeOpacity={0.95} strokeWidth={2.6}
              strokeLinecap="round" />
    </>
);

const Connectors: React.FC = () => (
    <svg
        viewBox="0 0 300 44" preserveAspectRatio="none" aria-hidden
        style={{ width: '100%', height: cq(12, 3.6, 40), display: 'block', flexShrink: 0, overflow: 'visible' }}
    >
        <defs>
            <filter id="mmm-neon" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.6" />
            </filter>
        </defs>
        {/* chapga — MINE */}
        <NeonPath d="M150 0 C150 24 96 14 50 44" color={GC.success} />
        {/* markazga — METAL */}
        <NeonPath d="M150 0 C150 18 150 26 150 44" color="#E0912B" />
        {/* o'ngga — MARKET */}
        <NeonPath d="M150 0 C150 24 204 14 250 44" color={GC.accent1} />
    </svg>
);

/** MINE / METAL / MARKET doirasi. */
const SegmentNode: React.FC<{ seg: Segment; onClick: () => void }> = ({ seg, onClick }) => (
    <button
        onClick={onClick}
        title={`${seg.title} — batafsil`}
        style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            width: cq(52, 14, 132), height: cq(52, 14, 132), borderRadius: '50%',
            cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit', padding: 0,
            background: `radial-gradient(circle at 50% 34%, ${seg.accent}45, rgba(7,13,21,.94) 72%)`,
            border: `${cq(1.5, 0.4, 3)} solid ${seg.accent}`,
            boxShadow: `0 0 ${cq(5, 1.5, 18)} ${seg.accent}55`,
            color: GC.textPrimary,
        }}
    >
        <span style={{ color: seg.accent, display: 'flex' }}><Icon name={SEGMENT_ICON[seg.key]} size={cq(11, 2.9, 24)} /></span>
        <span style={{ fontSize: cq(8, 2.2, 18), fontWeight: 800, letterSpacing: 0.5, lineHeight: 1.15 }}>{seg.code}</span>
        <span style={{
            color: GC.textSecondary, fontSize: cq(4.5, 1.1, 10), textAlign: 'center',
            lineHeight: 1.2, padding: `0 ${cq(3, 1, 10)}`,
        }}>{seg.nodeCaption}</span>
    </button>
);

/* ══════════════ 3) KARTOCHKA ICHIDAGI KICHIK KARTOCHKALAR ══════════════ */

/** "Foto o'rni" — haqiqiy rasm qo'shilsa shu blok almashtiriladi. */
const UnitPhoto: React.FC<{ accent: string; segKey: string; height: string }> = ({ accent, segKey, height }) => (
    <div style={{
        height, borderRadius: cq(3, 0.9, 7), flexShrink: 0,
        background: `linear-gradient(140deg, ${accent}33, rgba(255,255,255,.04))`,
        border: `1px solid ${accent}26`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: `${accent}cc`,
    }}>
        <Icon name={UNIT_ICON[segKey]} size={cq(10, 2.6, 22)} />
    </div>
);

/** Faoliyatdagi obyekt — nom, foto, xodimlar, ishlab chiqarish + o'zgarish. */
const ActiveUnitCard: React.FC<{ unit: ActiveUnit; accent: string; segKey: string }> = ({ unit, accent, segKey }) => (
    <div style={{
        background: 'rgba(6, 12, 20, .62)', border: `1px solid ${GC.borderColor}`,
        borderRadius: cq(4, 1.2, 10), padding: cq(4, 1.1, 9), minWidth: 0,
        display: 'flex', flexDirection: 'column', gap: cq(2, 0.6, 6),
    }}>
        <div style={{
            color: GC.textPrimary, fontSize: cq(6, 1.55, 12), fontWeight: 700, lineHeight: 1.25,
        }} title={unit.name}>{unit.name}</div>

        <UnitPhoto accent={accent} segKey={segKey} height={cq(18, 5, 46)} />

        <div style={{ display: 'flex', alignItems: 'center', gap: cq(2, 0.6, 5), minWidth: 0 }}>
            <span style={{ color: GC.accent2, display: 'flex', flexShrink: 0 }}><Icon name="users" size={cq(6, 1.6, 13)} /></span>
            <span style={{ color: GC.textPrimary, fontSize: cq(6, 1.5, 12), fontWeight: 700 }}>{fmtNum(unit.staff)}</span>
            <span style={{ color: GC.textDisabled, fontSize: cq(4.5, 1.1, 9) }}>Xodimlar</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: cq(2, 0.6, 6) }}>
            <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: cq(2, 0.6, 5) }}>
                    <span style={{ color: accent, display: 'flex', flexShrink: 0 }}><Icon name="chart" size={cq(6, 1.5, 12)} /></span>
                    <span style={{ color: GC.textPrimary, fontSize: cq(6, 1.55, 12), fontWeight: 700, whiteSpace: 'nowrap' }}>{unit.output}</span>
                </div>
                <div style={{ color: GC.textDisabled, fontSize: cq(4.5, 1.05, 9), lineHeight: 1.25 }}>{unit.outputLabel}</div>
            </div>
            <Delta v={unit.delta} size={cq(5.5, 1.35, 11)} />
        </div>
    </div>
);

/** Qurilayotgan / loyiha bosqichidagi obyekt — ochroq fonli kartochka. */
const PlannedUnitCard: React.FC<{ unit: PlannedUnit; accent: string }> = ({ unit, accent }) => (
    <div style={{
        background: 'rgba(255, 255, 255, .07)', border: `1px solid ${GC.borderColor}`,
        borderRadius: cq(4, 1.2, 10), padding: cq(4, 1.1, 9), minWidth: 0,
        display: 'flex', flexDirection: 'column', gap: cq(2, 0.6, 6),
    }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: cq(3, 0.8, 7) }}>
            <span style={{
                width: cq(12, 3.2, 26), height: cq(12, 3.2, 26), borderRadius: cq(3, 0.9, 8), flexShrink: 0,
                background: `${accent}2b`, color: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name={unit.stage === 'Qurilish' ? 'build' : 'plan'} size={cq(6, 1.7, 14)} /></span>
            <span style={{ color: GC.textPrimary, fontSize: cq(5.5, 1.45, 12), fontWeight: 700, lineHeight: 1.25 }}>{unit.name}</span>
        </div>

        <div style={{
            alignSelf: 'flex-start', background: 'rgba(255,255,255,.07)',
            border: `1px solid ${GC.borderColor}`, borderRadius: cq(3, 0.9, 8),
            padding: `${cq(2, 0.5, 4)} ${cq(3, 0.9, 9)}`,
        }}>
            <div style={{ color: GC.textSecondary, fontSize: cq(4.5, 1.05, 10) }}>{unit.stage}</div>
            <div style={{ color: GC.textPrimary, fontSize: cq(5.5, 1.35, 11.5), fontWeight: 700, whiteSpace: 'nowrap' }}>{unit.years}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: cq(2, 0.6, 5), minWidth: 0 }}>
            <span style={{ color: GC.accent2, display: 'flex', flexShrink: 0 }}><Icon name="users" size={cq(6, 1.6, 13)} /></span>
            <div style={{ minWidth: 0 }}>
                <div style={{ color: GC.textPrimary, fontSize: cq(5.5, 1.45, 12), fontWeight: 700 }}>{fmtNum(unit.plannedStaff)}</div>
                <div style={{ color: GC.textDisabled, fontSize: cq(4.5, 1.05, 9), lineHeight: 1.2 }}>Rejalashtirilgan xodimlar</div>
            </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: cq(2, 0.6, 5), minWidth: 0 }}>
            <span style={{ color: accent, display: 'flex', flexShrink: 0 }}><Icon name="chart" size={cq(6, 1.6, 13)} /></span>
            <div style={{ minWidth: 0 }}>
                <div style={{ color: GC.textPrimary, fontSize: cq(5.5, 1.45, 12), fontWeight: 700 }}>{unit.capacity ?? '—'}</div>
                <div style={{ color: GC.textDisabled, fontSize: cq(4.5, 1.05, 9), lineHeight: 1.2 }}>{unit.capacityLabel}</div>
            </div>
        </div>
    </div>
);

/** Bo'lim sarlavhasi: rangli nuqta + nom + "N ta". */
const BlockTitle: React.FC<{ text: string; count: number; accent: string }> = ({ text, count, accent }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: cq(3, 0.9, 8), flexShrink: 0,
        background: `${accent}1f`, border: `1px solid ${accent}3d`,
        borderRadius: cq(4, 1.1, 9), padding: `${cq(3, 0.8, 7)} ${cq(4, 1.2, 11)}`,
        margin: `${cq(2, 0.6, 6)} 0 ${cq(3, 0.9, 9)}`,
    }}>
        <span style={{
            width: cq(4, 1.1, 9), height: cq(4, 1.1, 9), borderRadius: '50%',
            background: accent, flexShrink: 0,
        }} />
        <span style={{
            flex: 1, minWidth: 0, color: GC.textPrimary, fontSize: cq(5, 1.35, 11),
            fontWeight: 700, letterSpacing: 0.4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{text}</span>
        <span style={{
            background: `${accent}33`, color: accent, fontSize: cq(4.5, 1.25, 10.5), fontWeight: 700,
            padding: `${cq(1, 0.3, 3)} ${cq(3, 0.9, 8)}`, borderRadius: cq(3, 0.8, 6), flexShrink: 0, whiteSpace: 'nowrap',
        }}>{count} ta</span>
    </div>
);

/* ══════════════ BOSQICH KARTOCHKASI ══════════════ */

const SegmentCard: React.FC<{ seg: Segment; onOpen: () => void }> = ({ seg, onOpen }) => (
    <section style={{
        display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden',
        /* Fon — ramka rasmi (cho'zilib kartochkani to'ldiradi). */
        backgroundImage: `url(${ASSETS.frames[seg.key]})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'rgba(7, 13, 21, .6)',
        border: `1px solid ${seg.accent}4d`,
        borderRadius: cq(6, 1.8, 16),
        padding: cq(5, 1.4, 13),
    }}>
        {/* ── Sarlavha: chapda nom, O'NGDA ikkita ko'rsatkich ── */}
        <header style={{ display: 'flex', alignItems: 'center', gap: cq(4, 1.1, 10), flexShrink: 0 }}>
            <span style={{
                width: cq(16, 4.2, 36), height: cq(16, 4.2, 36), borderRadius: cq(4, 1.1, 11), flexShrink: 0,
                background: `${seg.accent}2b`, color: seg.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name={SEGMENT_ICON[seg.key]} size={cq(9, 2.4, 20)} /></span>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    color: GC.textPrimary, fontSize: cq(7.5, 2, 17), fontWeight: 800, lineHeight: 1.2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }} title={seg.title}>{seg.title}</div>
                <div style={{
                    color: GC.textSecondary, fontSize: cq(5, 1.3, 11), lineHeight: 1.25,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{seg.tagline}</div>
            </div>

            <div style={{ display: 'flex', gap: cq(4, 1.2, 14), flexShrink: 0 }}>
                {seg.summary.map((s, i) => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: cq(2, 0.6, 6) }}>
                        <span style={{ color: i === 0 ? GC.accent2 : seg.accent, display: 'flex', flexShrink: 0 }}>
                            <Icon name={i === 0 ? 'users' : 'chart'} size={cq(7, 1.9, 16)} />
                        </span>
                        <div>
                            <div style={{
                                color: GC.textPrimary, fontSize: cq(6.5, 1.7, 14), fontWeight: 700,
                                lineHeight: 1.15, whiteSpace: 'nowrap',
                            }}>{s.value}</div>
                            <div style={{ color: GC.textDisabled, fontSize: cq(4.5, 1.05, 9.5), whiteSpace: 'nowrap' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>
        </header>

        {/* ── Tarkib (joy yetmasa aylantiriladi) ── */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
            <BlockTitle text={seg.activeTitle} count={seg.active.length} accent={seg.accent} />
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: cq(3, 0.9, 9),
            }}>
                {seg.active.map((u) => (
                    <ActiveUnitCard key={u.name} unit={u} accent={seg.accent} segKey={seg.key} />
                ))}
            </div>

            <BlockTitle text={seg.plannedTitle} count={seg.planned.length} accent={seg.accent} />
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: cq(3, 0.9, 9),
            }}>
                {seg.planned.map((u) => <PlannedUnitCard key={u.name} unit={u} accent={seg.accent} />)}
            </div>
        </div>

        {/* Katakcha kichik bo'lganda to'liq ko'rish uchun */}
        <button
            onClick={onOpen}
            style={{
                marginTop: cq(3, 0.8, 8), flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit',
                background: `${seg.accent}1f`, border: `1px solid ${seg.accent}4d`,
                borderRadius: cq(4, 1.1, 9), padding: `${cq(3, 0.7, 7)} ${cq(4, 1.1, 10)}`,
                color: seg.accent, fontSize: cq(5, 1.3, 11), fontWeight: 700, whiteSpace: 'nowrap',
            }}
        >Batafsil ko'rish →</button>
    </section>
);

/* ══════════════ MODAL ══════════════ */

const SegmentModal: React.FC<{ seg: Segment; onClose: () => void }> = ({ seg, onClose }) => (
    <div
        onClick={onClose}
        style={{
            position: 'fixed', inset: 0, zIndex: 1300,
            background: 'rgba(4, 8, 14, .76)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}
    >
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                width: 'min(900px, 100%)', maxHeight: '88vh', display: 'flex', flexDirection: 'column',
                borderRadius: 16, boxSizing: 'border-box', containerType: 'size',
                border: `1px solid ${seg.accent}55`,
                backgroundImage: `linear-gradient(180deg, rgba(7,13,21,.94), rgba(6,11,18,.97)), url(${ASSETS.background})`,
                backgroundSize: 'cover, cover',
                backgroundPosition: 'center, center',
                fontFamily: '"Segoe UI", system-ui, sans-serif',
            }}
        >
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '16px 20px', borderBottom: `1px solid ${GC.borderColor}`, flexShrink: 0,
            }}>
                <span style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: `${seg.accent}26`, color: seg.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Icon name={SEGMENT_ICON[seg.key]} size={22} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: GC.textPrimary, fontSize: 17, fontWeight: 800 }}>{seg.title}</div>
                    <div style={{ color: GC.textSecondary, fontSize: 11.5 }}>{seg.tagline}</div>
                </div>
                {seg.summary.map((s) => (
                    <div key={s.label} style={{ textAlign: 'right', flexShrink: 0, marginLeft: 14 }}>
                        <div style={{ color: GC.textPrimary, fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap' }}>{s.value}</div>
                        <div style={{ color: GC.textDisabled, fontSize: 10, whiteSpace: 'nowrap' }}>{s.label}</div>
                    </div>
                ))}
                <button
                    onClick={onClose}
                    aria-label="Yopish"
                    style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0, cursor: 'pointer', marginLeft: 14,
                        background: 'transparent', border: `1px solid ${GC.borderColor}`,
                        color: GC.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M5 5l14 14M19 5L5 19" />
                    </svg>
                </button>
            </div>

            <div style={{ overflowY: 'auto', padding: '10px 20px 20px' }}>
                <BlockTitle text={seg.activeTitle} count={seg.active.length} accent={seg.accent} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 6 }}>
                    {seg.active.map((u) => <ActiveUnitCard key={u.name} unit={u} accent={seg.accent} segKey={seg.key} />)}
                </div>
                <BlockTitle text={seg.plannedTitle} count={seg.planned.length} accent={seg.accent} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
                    {seg.planned.map((u) => <PlannedUnitCard key={u.name} unit={u} accent={seg.accent} />)}
                </div>
            </div>
        </div>
    </div>
);

/* ══════════════════════════════════════════════════════════════════════════ */
type Props = {
    /**
     * Tepadan bo'sh qoldiriladigan joy (px). `TopCenter` ichida tab paneli
     * absolyut joylashib komponent ustiga tushadi — u yerda 42px beriladi.
     */
    topInset?: number;
};

const MineMetalMarket: React.FC<Props> = () => {
    const [openSeg, setOpenSeg] = useState<Segment | null>(null);

    return (
        <div style={{
            width: '100%', height: '100%', minHeight: 0, boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', gap: cq(3, 0.9, 10),
            padding: cq(5, 1.5, 16),
            overflow: 'hidden',
            fontFamily: '"Segoe UI", system-ui, sans-serif',
            containerType: 'size',
            /* Fon rasmi faqat YUQORI qismni egallaydi — KPI qatori, doiralar va
               kartochkalarning tepasidan sal o'tib to'xtaydi. Ustidagi gradient
               shu joyga kelib to'liq to'q rangga aylanadi, ya'ni rasm keskin
               kesilmay, soyaga singib yo'qoladi. */
            backgroundImage:
                `linear-gradient(180deg,
                    rgba(6,11,18,.42) 0%,
                    rgba(6,11,18,.52) 26%,
                    rgba(6,10,17,.78) 42%,
                    rgba(5,9,15,.95) 52%,
                    ${GC.bg900} 60%), url(${ASSETS.background})`,
            backgroundSize: 'cover, 100% 60%',
            backgroundPosition: 'top center, top center',
            backgroundRepeat: 'no-repeat, no-repeat',
            backgroundColor: GC.bg900,
            paddingTop: 25
            /* `padding` qisqartmasidan KEYIN turishi shart, aks holda bekor bo'ladi. */
            // ...(topInset ? { paddingTop: `calc(${cq(5, 1.5, 16)} + ${topInset}px)` } : null),
        }}>
            {/* ── 1) KPI qatori + markazda TMK ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: cq(3, 0.9, 10), flexShrink: 0 }}>
                {TOP_KPIS.left.map((k) => <KpiCard key={k.label} kpi={k} />)}
                <TmkBadge />
                {TOP_KPIS.right.map((k) => <KpiCard key={k.label} kpi={k} />)}
            </div>

            {/* ── 2) Ulanish chiziqlari va uchta doira ── */}
            <div style={{ flexShrink: 0 }}>
                <Connectors />
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                    justifyItems: 'center', marginTop: `-${cq(2, 0.6, 6)}`,
                }}>
                    {SEGMENTS.map((s) => (
                        <SegmentNode key={s.key} seg={s} onClick={() => setOpenSeg(s)} />
                    ))}
                </div>
            </div>

            {/* ── 3) Uchta bosqich kartochkasi ── */}
            <div style={{
                flex: 1, minHeight: 0,
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: cq(4, 1.1, 12),
            }}>
                {SEGMENTS.map((s) => (
                    <SegmentCard key={s.key} seg={s} onOpen={() => setOpenSeg(s)} />
                ))}
            </div>

            {openSeg && <SegmentModal seg={openSeg} onClose={() => setOpenSeg(null)} />}
        </div>
    );
};

export default MineMetalMarket;
