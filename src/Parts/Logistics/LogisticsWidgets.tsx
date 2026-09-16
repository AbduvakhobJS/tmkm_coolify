import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { C, chartBase, noLegend } from '../../components/dashboardUI';
import {
    BigCard, BigKpiCard, axisLarge, legendLarge,
    bigCenterText, bigDonutBoxStyle, BigLabelRow,
} from '../../components/dashboardUILarge';
import { GC } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   LOGISTIKA WIDGETLARI — xaritaning chap va o'ng yon panellari

   Uslub MetalsDashboardMain bilan bir xil (`BigCard`, `BigKpiCard`,
   `axisLarge`, `bigCenterText` ...). Yuk aylanmasi, transport parki, omborlar
   va yetkazib berish bo'yicha alohida API yo'q — shu sabab ko'rsatkichlar
   namuna ma'lumotdan quriladi va kartalar SARIQ ramka bilan belgilanadi.
   Xaritadagi obyektlar soni esa HAQIQIY (`/factory/markers`).
   ══════════════════════════════════════════════════════════════════════════ */

const demoCard: React.CSSProperties = { border: `1px solid ${GC.amber}73` };

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen'];

/* Yuk aylanmasi, ming tonna */
const FREIGHT_RAIL = [128, 134, 141, 139, 148, 152, 159, 163, 157];
const FREIGHT_ROAD = [64, 68, 71, 69, 74, 78, 81, 84, 80];

/* Transport turlari bo'yicha ulush */
const TRANSPORT_MIX = [
    { label: "Temir yo'l", pct: 58, color: GC.accent1 },
    { label: 'Avtomobil', pct: 27, color: GC.accent3 },
    { label: 'Quvur', pct: 9, color: GC.violet },
    { label: 'Aralash', pct: 6, color: GC.slate },
];

/* Marshrutlar holati */
const ROUTE_STATUS: { name: string; loadPct: number; status: 'ok' | 'busy' | 'late' }[] = [
    { name: 'Nukus — Farg\'ona', loadPct: 86, status: 'busy' },
    { name: 'Nukus — Termiz', loadPct: 64, status: 'ok' },
    { name: 'Jizzax — Navoiy', loadPct: 72, status: 'ok' },
    { name: 'Toshkent — Chirchiq', loadPct: 93, status: 'busy' },
    { name: 'Toshkent — Qarshi', loadPct: 58, status: 'ok' },
    { name: 'Qarshi — Termiz', loadPct: 41, status: 'late' },
    { name: "Toshkent — Farg'ona", loadPct: 77, status: 'ok' },
];
const ROUTE_META: Record<string, { label: string; color: string }> = {
    ok: { label: 'Normal', color: GC.green },
    busy: { label: 'Band', color: GC.amber },
    late: { label: 'Kechikish', color: GC.red },
};

/* Omborlar to'ldirilishi */
const WAREHOUSES = [
    { name: 'Olmaliq MK ombori', pct: 82, color: GC.accent1 },
    { name: 'Chirchiq TMK ombori', pct: 64, color: GC.accent2 },
    { name: 'Navoiy tranzit ombori', pct: 91, color: GC.amber },
    { name: 'Zarafshon ombori', pct: 47, color: GC.accent3 },
    { name: 'Termiz chegara ombori', pct: 38, color: GC.slate },
];

/* O'z vaqtida yetkazib berish, % */
const ON_TIME = [88, 90, 87, 92, 94, 91, 95, 93, 96];

/* Sun'iy intellekt prognozlari */
const AI_FORECASTS = [
    { text: "Chirchiq yo'nalishida yuklama oshadi", detail: 'Keyingi 2 haftada +12%', confidence: 76, color: GC.amber },
    { text: "Navoiy ombori to'lish arafasida", detail: "Joriy to'ldirilish 91%", confidence: 84, color: GC.red },
    { text: "O'z vaqtida yetkazish 95% dan yuqori", detail: 'Oxirgi 3 oy trendi', confidence: 71, color: GC.green },
    { text: 'Termiz yo\'nalishida kechikish xavfi', detail: 'Chegara rasmiylashtiruvi', confidence: 58, color: GC.amber },
];

/** Yon panel qobig'i — ikkala tomon uchun bir xil. */
const SidePanel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{
        width: '19%', minWidth: 0, flexShrink: 0,
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: 10, boxSizing: 'border-box',
        containerType: 'size', containerName: 'dash-root',
        overflow: 'hidden',
    }}>
        {children}
    </div>
);

/** Chap panel — yuk aylanmasi, transport turlari, marshrutlar. */
export const LogisticsLeftPanel: React.FC<{ objectCount?: number }> = ({ objectCount }) => {
    const freightBars = {
        labels: MONTHS,
        datasets: [
            { label: "Temir yo'l", data: FREIGHT_RAIL, backgroundColor: GC.accent1, borderRadius: 3, barPercentage: 0.7 },
            { label: 'Avtomobil', data: FREIGHT_ROAD, backgroundColor: GC.accent3, borderRadius: 3, barPercentage: 0.7 },
        ],
    };
    const mixDonut = {
        labels: TRANSPORT_MIX.map((t) => t.label),
        datasets: [{ data: TRANSPORT_MIX.map((t) => t.pct), backgroundColor: TRANSPORT_MIX.map((t) => t.color), borderWidth: 0 }],
    };
    const totalFreight = FREIGHT_RAIL[FREIGHT_RAIL.length - 1] + FREIGHT_ROAD[FREIGHT_ROAD.length - 1];

    return (
        <SidePanel>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <BigKpiCard title="Yuk aylanmasi, ming t" value={String(totalFreight)} delta={4.2} iconColor={GC.accent1} />
                <BigKpiCard title="Xaritadagi obyektlar" value={objectCount != null ? String(objectCount) : '—'} iconColor={GC.accent2} />
            </div>

            <BigCard title="Yuk aylanmasi, ming tonna" style={{ ...demoCard, flex: 1, minHeight: 0 }}>
                <div style={{ flex: 1, minHeight: 0 }}>
                    <Bar
                        data={freightBars}
                        options={{
                            ...chartBase,
                            plugins: legendLarge('top'),
                            scales: axisLarge({ x: { ticks: { font: { size: 10 } } }, y: { beginAtZero: true } }),
                        } as any}
                    />
                </div>
            </BigCard>

            <BigCard title="Transport turlari, %" style={{ ...demoCard, flex: 1, minHeight: 0 }}>
                <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 10 }}>
                    <div style={{ flex: '0 0 48%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', overflow: 'hidden' }}>
                        {TRANSPORT_MIX.map((t) => (
                            <BigLabelRow key={t.label} label={t.label} color={t.color} value={`${t.pct}%`} />
                        ))}
                    </div>
                    <div style={bigDonutBoxStyle}>
                        <Doughnut
                            data={mixDonut}
                            options={{ ...chartBase, cutout: '62%', ...noLegend } as any}
                            plugins={[bigCenterText('100', '%')]}
                        />
                    </div>
                </div>
            </BigCard>

            <BigCard title="Marshrutlar holati" style={{ ...demoCard, flex: 1, minHeight: 0 }}>
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 5, overflow: 'hidden' }}>
                    {ROUTE_STATUS.map((r) => {
                        const meta = ROUTE_META[r.status];
                        return (
                            <div key={r.name}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                                    <span style={{ color: C.text, fontSize: 'clamp(10px, 2.1cqmin, 15px)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                                    <span style={{ color: meta.color, fontSize: 'clamp(9px, 1.8cqmin, 13px)', fontWeight: 600, flexShrink: 0, background: `${meta.color}1f`, border: `1px solid ${meta.color}59`, borderRadius: 6, padding: '1px 7px' }}>{meta.label}</span>
                                </div>
                                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                    <div style={{ width: `${r.loadPct}%`, height: '100%', borderRadius: 3, background: meta.color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </BigCard>
        </SidePanel>
    );
};

/** O'ng panel — yetkazib berish, omborlar, AI prognozlari. */
export const LogisticsRightPanel: React.FC = () => {
    const onTimeLine = {
        labels: MONTHS,
        datasets: [{
            label: "O'z vaqtida, %",
            data: ON_TIME,
            borderColor: GC.green,
            backgroundColor: `${GC.green}33`,
            borderWidth: 2, tension: 0.35, pointRadius: 3, fill: true,
        }],
    };

    return (
        <SidePanel>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <BigKpiCard title="O'z vaqtida yetkazish" value={`${ON_TIME[ON_TIME.length - 1]}%`} delta={3.2} iconColor={GC.green} />
                <BigKpiCard title="Yo'ldagi jo'natmalar" value="42" iconColor={GC.accent1} />
            </div>

            <BigCard title="O'z vaqtida yetkazib berish, %" style={{ ...demoCard, flex: 1, minHeight: 0 }}>
                <div style={{ flex: 1, minHeight: 0 }}>
                    <Line
                        data={onTimeLine}
                        options={{
                            ...chartBase, ...noLegend,
                            scales: axisLarge({ x: { ticks: { font: { size: 10 } } }, y: { beginAtZero: false } }),
                        } as any}
                    />
                </div>
            </BigCard>

            <BigCard title="Omborlar to'ldirilishi, %" style={{ ...demoCard, flex: 1, minHeight: 0 }}>
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 6, overflow: 'hidden' }}>
                    {WAREHOUSES.map((w) => {
                        const color = w.pct >= 90 ? GC.red : w.pct >= 70 ? GC.amber : GC.green;
                        return (
                            <div key={w.name}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                                    <span style={{ color: C.text, fontSize: 'clamp(10px, 2.1cqmin, 15px)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</span>
                                    <span style={{ color, fontWeight: 700, fontSize: 'clamp(10px, 2.1cqmin, 15px)', flexShrink: 0 }}>{w.pct}%</span>
                                </div>
                                <div style={{ height: 7, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                    <div style={{ width: `${w.pct}%`, height: '100%', borderRadius: 4, background: color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </BigCard>

            <BigCard title="Sun'iy intellekt prognozlari" style={{ ...demoCard, flex: 1, minHeight: 0 }}>
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 7, overflow: 'hidden' }}>
                    {AI_FORECASTS.map((f, i) => (
                        <div key={i}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                                    <span style={{ color: C.text, fontSize: 'clamp(10px, 2.1cqmin, 15px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.text}</span>
                                </span>
                                <span style={{ color: f.color, fontWeight: 700, fontSize: 'clamp(10px, 2.1cqmin, 15px)', flexShrink: 0 }}>{f.confidence}%</span>
                            </div>
                            <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 2 }}>
                                <div style={{ width: `${f.confidence}%`, height: '100%', borderRadius: 3, background: f.color }} />
                            </div>
                            <div style={{ color: C.sub, fontSize: 'clamp(9px, 1.7cqmin, 12px)', marginLeft: 15 }}>{f.detail}</div>
                        </div>
                    ))}
                </div>
            </BigCard>
        </SidePanel>
    );
};
