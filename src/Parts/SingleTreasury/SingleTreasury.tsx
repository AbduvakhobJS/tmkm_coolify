import React, { useMemo } from 'react';
import { C, fmt } from '../../components/dashboardUI';
import treasuryData from './singleTreasuryDemoData.json';

/* ── Professional dumaloq ikonka (gradient fon + glow, "badge" uslubi) ── */

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

/* ── Ikonka to'plami ── */

const IconDocuments = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 2.5h6.5l4 4V17a1 1 0 01-1 1H8a1 1 0 01-1-1V3.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14.5 2.5V7h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M16 18v2.5a1 1 0 01-1 1H5.5a1 1 0 01-1-1V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 10h5.5M10 13.5h5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconCalendarPlus = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 12.5v5M9.5 15h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
);
const IconAlert = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16.3" r="1.05" fill="currentColor" />
    </svg>
);
const IconClock = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 6.8V12l3.4 2.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconCheckCircle = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7.8 12.3l2.8 2.8 5.6-5.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconCalendar = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
);
const IconPieChart = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3a9 9 0 109 9h-9V3z" fill="currentColor" opacity="0.85" />
        <path d="M14 2.2A9.5 9.5 0 0121.8 10H14V2.2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconArrowRight = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 12h15M13.5 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* ── Ma'lumot turlari ── */
type StatusKey = 'new' | 'inWork' | 'approved' | 'overdue';
type Direction = {
    id: number; name: string; role: string; initials: string; color: string;
    amount: number; counts: Record<StatusKey, number>;
};
type Segment = { label: string; value: number; color: string };
const DATA = treasuryData;
const STATUS_ORDER: StatusKey[] = ['new', 'inWork', 'approved', 'overdue'];

/* ── Yordamchi funksiyalar ── */
const pctOf = (v: number, total: number): number => (total ? (v / total) * 100 : 0);
const fmtPct = (v: number, total: number): string => (total ? `${Math.round(pctOf(v, total))}%` : '—');
const fmtAmount = (n: number): string => (n > 0 ? fmt(n, 2) : '—');
/* 5 дней / 4 дня / 1 день — ruscha son-son shakli */
const daysWord = (n: number): string => {
    const t = n % 10, h = n % 100;
    if (t === 1 && h !== 11) return 'день';
    if (t >= 2 && t <= 4 && (h < 12 || h > 14)) return 'дня';
    return 'дней';
};

/* ── Donut chart (segmentli halqa) ── */
const Donut: React.FC<{
    segments: Segment[]; size?: number; thickness?: number;
    centerMain?: string; centerSub?: string;
}> = ({ segments, size = 96, thickness = 13, centerMain, centerSub }) => {
    const total = segments.reduce((s, x) => s + x.value, 0);
    const r = (size - thickness) / 2;
    const circ = 2 * Math.PI * r;
    const gap = total ? Math.min(2.5, circ * 0.01) : 0;

    let acc = 0;
    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
                {total > 0 && segments.map((s) => {
                    if (s.value <= 0) return null;
                    const len = (s.value / total) * circ;
                    const dash = Math.max(len - gap, 0.6);
                    const el = (
                        <circle
                            key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none"
                            stroke={s.color} strokeWidth={thickness} strokeLinecap="butt"
                            strokeDasharray={`${dash} ${circ - dash}`}
                            strokeDashoffset={-acc}
                            style={{ filter: `drop-shadow(0 0 4px ${s.color}80)` }}
                        />
                    );
                    acc += len;
                    return el;
                })}
            </svg>
            {(centerMain || centerSub) && (
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 1,
                }}>
                    <div style={{ color: C.text, fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{centerMain}</div>
                    <div style={{ color: C.sub, fontSize: 9.5 }}>{centerSub}</div>
                </div>
            )}
        </div>
    );
};

/* ── Donut yonidagi izohlar ro'yxati ── */
const Legend: React.FC<{ segments: Segment[]; total: number; compact?: boolean }> = ({ segments, total, compact }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 5 : 9, flex: 1, minWidth: 0 }}>
        {segments.map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, boxShadow: `0 0 6px ${s.color}99`, flexShrink: 0 }} />
                <span style={{
                    color: C.sub, fontSize: compact ? 10 : 11.5, flex: 1, minWidth: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: compact ? 'nowrap' : 'normal',
                }}>{s.label}</span>
                <span style={{ color: C.text, fontSize: compact ? 10.5 : 12.5, fontWeight: 700, flexShrink: 0 }}>{s.value}</span>
                <span style={{ color: C.sub, fontSize: compact ? 9.5 : 11, width: 34, textAlign: 'right', flexShrink: 0 }}>({fmtPct(s.value, total)})</span>
            </div>
        ))}
    </div>
);

/* ── UI blok komponentlari ── */
const KpiCard: React.FC<{
    label: string; value: number; amount: number; icon: React.ReactNode; color: string;
}> = ({ label, value, amount, icon, color }) => (
    <div style={{
        background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`,
        borderRadius: 13, padding: '13px 15px', minWidth: 0, position: 'relative', overflow: 'hidden',
    }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, boxShadow: `0 0 10px ${color}` }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ minWidth: 0 }}>
                <div style={{ color: C.sub, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 7 }}>{label}</div>
                <div style={{ color: C.text, fontSize: 26, fontWeight: 700, lineHeight: 1 }}>
                    {value}<span style={{ color: C.sub, fontSize: 11.5, fontWeight: 500, marginLeft: 5 }}>шт.</span>
                </div>
            </div>
            <NeonIcon color={color} size={38}>{icon}</NeonIcon>
        </div>
        <div style={{ color: C.sub, fontSize: 10.5, marginTop: 9 }}>
            на сумму <span style={{ color: amount > 0 ? color : C.sub, fontWeight: 700 }}>{fmtAmount(amount)}</span>
            {amount > 0 && <span style={{ marginLeft: 4 }}>{DATA.meta.unit}</span>}
        </div>
    </div>
);

const DirectionCard: React.FC<{ dir: Direction }> = ({ dir }) => {
    const segments: Segment[] = STATUS_ORDER.map((k) => ({
        label: DATA.statuses[k].label,
        value: dir.counts[k],
        color: DATA.statuses[k].color,
    }));
    const total = segments.reduce((s, x) => s + x.value, 0);

    return (
        <div style={{
            background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`,
            borderRadius: 13, padding: '13px 15px', display: 'flex', flexDirection: 'column', gap: 11, minWidth: 0,
        }}>
            {/* Rahbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `linear-gradient(145deg, ${dir.color}55, ${dir.color}18)`,
                    border: `1.3px solid ${dir.color}80`, boxShadow: `0 0 12px ${dir.color}55`,
                    color: dir.color, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.3,
                }}>{dir.initials}</div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ color: C.text, fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dir.name}</div>
                    <div style={{ color: C.sub, fontSize: 9.5 }}>{dir.role}</div>
                </div>
            </div>

            {/* Jami va summa */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
                <div>
                    <div style={{ color: C.text, fontSize: 25, fontWeight: 700, lineHeight: 1 }}>{total}</div>
                    <div style={{ color: C.sub, fontSize: 9.5, marginTop: 3 }}>Всего заявок</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: dir.amount > 0 ? C.text : C.sub, fontSize: 19, fontWeight: 700, lineHeight: 1 }}>{fmtAmount(dir.amount)}</div>
                    <div style={{ color: C.sub, fontSize: 9.5, marginTop: 3 }}>{dir.amount > 0 ? DATA.meta.unit : 'Сумма'}</div>
                </div>
            </div>

            {/* Donut + izohlar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Donut segments={segments} size={84} thickness={12} />
                <Legend segments={segments} total={total} compact />
            </div>
        </div>
    );
};

/* ── Asosiy komponent ── */
const SingleTreasury: React.FC = () => {
    const directions = DATA.directions as Direction[];

    /* KPI ko'rsatkichlari yo'nalishlar bo'yicha yig'indidan hisoblanadi */
    const kpi = useMemo(() => {
        const byStatus = STATUS_ORDER.reduce((acc, k) => {
            acc[k] = directions.reduce((s, d) => s + d.counts[k], 0);
            return acc;
        }, {} as Record<StatusKey, number>);
        const total = STATUS_ORDER.reduce((s, k) => s + byStatus[k], 0);
        const totalAmount = directions.reduce((s, d) => s + d.amount, 0);
        return { byStatus, total, totalAmount };
    }, [directions]);

    const approvalSegments = DATA.approvalStatus as Segment[];
    const approvalTotal = approvalSegments.reduce((s, x) => s + x.value, 0);

    return (
        <div style={{
            background: C.bg, minHeight: '100vh', padding: 14, boxSizing: 'border-box',
            fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 12,
        }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <div style={{ color: '#4fb3d9', fontSize: 18, fontWeight: 700, lineHeight: 1.35 }}>{DATA.meta.title}</div>
                    <div style={{ color: C.sub, fontSize: 12 }}>{DATA.meta.subtitle}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: '8px 13px', flexShrink: 0 }}>
                    <NeonIcon color="#4fb3d9" size={22}><IconCalendar /></NeonIcon>
                    <div>
                        <div style={{ color: C.text, fontSize: 11.5, fontWeight: 600 }}>{DATA.meta.periodLabel}</div>
                        <div style={{ color: C.sub, fontSize: 10 }}>{DATA.meta.periodRange}</div>
                    </div>
                </div>
            </div>

            {/* KPI qatori */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                <KpiCard label="Всего заявок" value={kpi.total} amount={kpi.totalAmount} icon={<IconDocuments />} color="#4fb3d9" />
                <KpiCard label="Новые (сегодня)" value={kpi.byStatus.new} amount={DATA.amounts.new} icon={<IconCalendarPlus />} color={DATA.statuses.new.color} />
                <KpiCard label={`Просрочено (> ${DATA.meta.overdueThresholdDays} дн.)`} value={kpi.byStatus.overdue} amount={DATA.amounts.overdue} icon={<IconAlert />} color={DATA.statuses.overdue.color} />
                <KpiCard label="В работе" value={kpi.byStatus.inWork} amount={DATA.amounts.inWork} icon={<IconClock />} color="#a855f7" />
                <KpiCard label="Согласовано" value={kpi.byStatus.approved} amount={DATA.amounts.approved} icon={<IconCheckCircle />} color={DATA.statuses.approved.color} />
            </div>

            {/* Yo'nalishlar (zam. raislar) */}
            <div>
                <div style={{ color: C.text, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>
                    Заявки по направлениям <span style={{ color: C.sub, fontWeight: 400, textTransform: 'none' }}>(Зам. председателей)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {directions.map((d) => <DirectionCard key={d.id} dir={d} />)}
                </div>
            </div>

            {/* Pastki qator: kelishuv holati + muddati o'tgan zayavkalar (balandlik kontent bo'yicha) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 10, alignItems: 'start'}}>

                {/* Kelishuv holati */}
                <div style={{
                    background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`,
                    borderRadius: 13, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <NeonIcon color="#4fb3d9" size={26}><IconPieChart /></NeonIcon>
                        <div style={{ color: C.text, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Статус согласований</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Donut segments={approvalSegments} size={124} thickness={17} centerMain={String(approvalTotal)} centerSub="Всего" />
                        <Legend segments={approvalSegments} total={approvalTotal} />
                    </div>
                </div>

                {/* Muddati o'tgan zayavkalar */}
                <div style={{
                    background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`,
                    borderRadius: 13, padding: '14px 16px', display: 'flex', flexDirection: 'column', minWidth: 0, height:"100%"
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                            <NeonIcon color={DATA.statuses.overdue.color} size={26}><IconAlert /></NeonIcon>
                            <div style={{ color: C.text, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
                                Просроченные заявки <span style={{ color: C.sub, fontWeight: 400, textTransform: 'none' }}>(&gt; {DATA.meta.overdueThresholdDays} дней)</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#4fb3d9', fontSize: 11, fontWeight: 600 }}>
                            Все просроченные <IconArrowRight />
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', flex: 1 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, minWidth: 460 }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', color: C.sub, fontWeight: 600, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', padding: '6px 8px', borderBottom: `1px solid ${C.border}` }}>№ заявки</th>
                                    <th style={{ textAlign: 'left', color: C.sub, fontWeight: 600, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', padding: '6px 8px', borderBottom: `1px solid ${C.border}` }}>Направление</th>
                                    <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', padding: '6px 8px', borderBottom: `1px solid ${C.border}` }}>Сумма</th>
                                    <th style={{ textAlign: 'right', color: C.sub, fontWeight: 600, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase', padding: '6px 8px', borderBottom: `1px solid ${C.border}` }}>Просрочка</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DATA.overdueRequests.map((r) => (
                                    <tr key={r.code}>
                                        <td style={{ padding: '8px', borderBottom: `1px solid ${C.border}`, color: '#4fb3d9', fontWeight: 600 }}>{r.code}</td>
                                        <td style={{ padding: '8px', borderBottom: `1px solid ${C.border}`, color: C.text }}>{r.direction}</td>
                                        <td style={{ padding: '8px', borderBottom: `1px solid ${C.border}`, color: C.text, fontWeight: 600, textAlign: 'right' }}>
                                            {fmt(r.amount, 2)} <span style={{ color: C.sub, fontSize: 10 }}>{DATA.meta.unit}</span>
                                        </td>
                                        <td style={{ padding: '8px', borderBottom: `1px solid ${C.border}`, textAlign: 'right' }}>
                                            <span style={{
                                                color: DATA.statuses.overdue.color, fontWeight: 700, fontSize: 11,
                                                background: `${DATA.statuses.overdue.color}18`, border: `1px solid ${DATA.statuses.overdue.color}55`,
                                                borderRadius: 20, padding: '3px 9px', whiteSpace: 'nowrap',
                                            }}>{r.days} {daysWord(r.days)}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SingleTreasury;
