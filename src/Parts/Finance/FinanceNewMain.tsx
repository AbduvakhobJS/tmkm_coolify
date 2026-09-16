import React, { useMemo } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { C, chartBase, noLegend, DashHeader } from '../../components/dashboardUI';
import {
    BigCard, BigKpiCard, BigDashRoot, axisLarge, legendLarge, bigBarLabel,
    bigCenterText, bigDonutBoxStyle, BigLabelRow, BigLabelStack,
} from '../../components/dashboardUILarge';
import DATA_JSON from './financeNewMainDemoData.json';
import { useFinanceDashboard } from '../../hooks/finance';
import { GC } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   MOLIYA — SOTUV VA BOZOR NARXLARI

   Uslub MetalsDashboardMain bilan bir xil: `BigDashRoot` + `DashHeader` +
   `BigKpiCard` qatori + 3x2 `BigCard` to'ri. Ekran to'liq to'ladi, scroll yo'q.

   MA'LUMOT MANBAI:
     • Oylik tushum/foyda/marja — HAQIQIY, `GET /finance/dashboard`
       (`useFinanceDashboard`, rows: revenue / profit / margin).
     • Sotuv tuzilmasi, jahon narxlari, eksport bozorlari — bunday kesimda API
       yo'q, shu sabab namuna ma'lumot: bunday kartalar SARIQ ramka bilan
       belgilanadi (alohida "namuna" yozuvi yozilmaydi).
   ══════════════════════════════════════════════════════════════════════════ */

type FinanceNewMainData = typeof DATA_JSON;
const DATA = DATA_JSON as FinanceNewMainData;

const MARKET_COLOR: Record<string, string> = {
    blue: GC.blue, purple: GC.violet, teal: GC.cyan,
    amber: GC.amber, coral: GC.amber, gray: GC.slate,
};

/** Namuna (API'da yo'q) kartalar uchun sariq ramka. */
const demoCardStyle: React.CSSProperties = { border: `1px solid ${GC.amber}73` };

const fmtNum = (n: number, d = 0): string => {
    const s = Math.abs(n).toFixed(d);
    const [int, dec] = s.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const sign = n < 0 ? '-' : '';
    return dec !== undefined ? `${sign}${grouped},${dec}` : `${sign}${grouped}`;
};
/** Katta pul qiymatlarini qisqartirib ko'rsatadi (KPI kartalari uchun). */
const fmtMln = (n: number): string => (Math.abs(n) >= 1_000_000 ? `${fmtNum(n / 1_000_000, 1)} mln` : fmtNum(n));

/** API qatoridagi oxirgi bo'sh bo'lmagan qiymat. */
const lastVal = (values: (number | null)[] | null | undefined): number | null => {
    if (!values) return null;
    for (let i = values.length - 1; i >= 0; i--) if (values[i] != null) return values[i] as number;
    return null;
};
/** Oxirgi ikki qiymat orasidagi o'zgarish, %. */
const lastDelta = (values: (number | null)[] | null | undefined): number | null => {
    if (!values) return null;
    const clean = values.filter((v): v is number => v != null);
    if (clean.length < 2) return null;
    const prev = clean[clean.length - 2];
    if (!prev) return null;
    return ((clean[clean.length - 1] - prev) / Math.abs(prev)) * 100;
};

/* Sun'iy intellekt prognozlari — moliyaviy model manbada yo'q, namuna. */
const AI_FORECASTS: { text: string; detail: string; confidence: number; color: string }[] = [
    { text: 'Yillik tushum rejasi bajariladi', detail: '4-chorak sotuvi trendi bo\'yicha', confidence: 81, color: GC.green },
    { text: 'Mis narxi 9 500–10 200 $/t oralig\'ida', detail: 'LME fyucherslari asosida', confidence: 68, color: GC.accent1 },
    { text: 'Eksport ulushi 70% dan oshadi', detail: 'Xitoy va Yevropa shartnomalari', confidence: 74, color: GC.green },
    { text: 'Tannarx bosimi saqlanadi', detail: 'Energiya va reagent narxlari', confidence: 57, color: GC.amber },
];

const FinanceNewMain: React.FC = () => {
    const { data: fin } = useFinanceDashboard();

    /* ── HAQIQIY ma'lumot: /finance/dashboard qatorlari ── */
    const real = useMemo(() => {
        const months = fin?.months ?? null;
        const row = (key: string) => fin?.rows?.find((r) => r.key === key) ?? null;
        return {
            months,
            revenue: row('revenue'),
            profit: row('profit'),
            margin: row('margin'),
            netCash: row('netCash'),
        };
    }, [fin]);

    const totalSalesRevenue = useMemo(
        () => DATA.salesByProduct.reduce((s, p) => s + p.revenue, 0),
        [],
    );
    const totalTonnage = useMemo(
        () => DATA.salesByProduct.reduce((s, p) => s + p.tonnage, 0),
        [],
    );

    /* ── Sotuv tuzilmasi donuti ── */
    const salesDonut = {
        labels: DATA.salesByProduct.map((p) => p.label),
        datasets: [{
            data: DATA.salesByProduct.map((p) => p.revenue),
            backgroundColor: DATA.salesByProduct.map((p) => p.color),
            borderWidth: 0,
        }],
    };

    /* ── Narx va rentabellik: realizatsiya narxi va tannarx yonma-yon ── */
    const priceBars = {
        labels: DATA.salesByProduct.map((p) => p.label),
        datasets: [
            { label: 'Realizatsiya', data: DATA.salesByProduct.map((p) => p.realizedPrice), backgroundColor: GC.accent1, borderRadius: 4, barPercentage: 0.7 },
            { label: 'Tannarx', data: DATA.salesByProduct.map((p) => p.cashCost), backgroundColor: GC.slate, borderRadius: 4, barPercentage: 0.7 },
        ],
    };

    /* ── Jahon narxlari indeksi: turli birliklarni solishtirish uchun
          birinchi oyga nisbatan normallashtiriladi (=100). ── */
    const priceIndex = {
        labels: DATA.trendLabels,
        datasets: DATA.marketPrices.map((m) => ({
            label: m.label,
            data: m.trend.map((v) => (v / m.trend[0]) * 100),
            borderColor: m.color,
            backgroundColor: `${m.color}33`,
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 0,
            fill: false,
        })),
    };

    /* ── Eksport bozorlari donuti ── */
    const exportDonut = {
        labels: DATA.exportMarkets.map((m) => m.label),
        datasets: [{
            data: DATA.exportMarkets.map((m) => m.pct),
            backgroundColor: DATA.exportMarkets.map((m) => MARKET_COLOR[m.color] ?? GC.slate),
            borderWidth: 0,
        }],
    };

    /* ── HAQIQIY: oylik tushum va foyda ── */
    const revenueChart = useMemo(() => {
        if (!real.months || !real.revenue?.values) return null;
        return {
            labels: real.months,
            datasets: [
                { label: 'Tushum', data: real.revenue.values, backgroundColor: GC.accent1, borderRadius: 4, barPercentage: 0.65 },
                ...(real.profit?.values ? [{ label: 'Foyda', data: real.profit.values, backgroundColor: GC.green, borderRadius: 4, barPercentage: 0.65 }] : []),
            ],
        };
    }, [real]);

    const revenueLast = lastVal(real.revenue?.values);
    const profitLast = lastVal(real.profit?.values);
    const marginLast = lastVal(real.margin?.values);
    const cashLast = lastVal(real.netCash?.values);

    return (
        <BigDashRoot>
            <DashHeader
                title={DATA.meta.company}
                subtitle={DATA.meta.subtitle}
                dateRange={DATA.meta.period}
            />

            {/* KPI qatori — chapdagi 4 tasi HAQIQIY (finance API), o'ngdagilari
                sotuv kesimidagi namuna ko'rsatkichlar. */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0 }}>
                <BigKpiCard
                    title="Tushum (oxirgi oy)"
                    value={revenueLast != null ? fmtMln(revenueLast) : ''}
                    delta={lastDelta(real.revenue?.values)}
                    iconColor={GC.accent1}
                />
                <BigKpiCard
                    title="Foyda (oxirgi oy)"
                    value={profitLast != null ? fmtMln(profitLast) : ''}
                    delta={lastDelta(real.profit?.values)}
                    iconColor={GC.green}
                />
                <BigKpiCard
                    title="Marja"
                    value={marginLast != null ? `${fmtNum(marginLast, 1)}%` : ''}
                    delta={lastDelta(real.margin?.values)}
                    iconColor={GC.accent2}
                />
                <BigKpiCard
                    title="Sof pul oqimi"
                    value={cashLast != null ? fmtMln(cashLast) : ''}
                    delta={lastDelta(real.netCash?.values)}
                    iconColor={GC.violet}
                />
                <BigKpiCard
                    title="Sotilgan hajm"
                    value={`${fmtNum(totalTonnage)} t`}
                    delta={DATA.vitals[3].delta}
                    iconColor={GC.amber}
                />
                <BigKpiCard
                    title="Eksport ulushi"
                    value={`${fmtNum(DATA.vitals[1].value, 1)}%`}
                    delta={DATA.vitals[1].delta}
                    iconColor={GC.cyan}
                />
            </div>

            <div style={{
                flex: 1, minHeight: 0, display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10,
            }}>
                {/* 1 — Sotuv tuzilmasi (namuna) */}
                <BigCard title="Mahsulot bo'yicha sotuv tuzilmasi" style={demoCardStyle}>
                    <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 10 }}>
                        <div style={{ flex: '0 0 46%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
                            {DATA.salesByProduct.map((p) => (
                                <BigLabelStack
                                    key={p.label}
                                    label={p.label}
                                    color={p.color}
                                    value={`${fmtNum(p.tonnage)} t`}
                                    sub={`${fmtNum((p.revenue / totalSalesRevenue) * 100, 1)}%`}
                                />
                            ))}
                        </div>
                        <div style={bigDonutBoxStyle}>
                            <Doughnut
                                data={salesDonut}
                                options={{ ...chartBase, cutout: '62%', ...noLegend } as any}
                                plugins={[bigCenterText(fmtMln(totalSalesRevenue), DATA.meta.currency)]}
                            />
                        </div>
                    </div>
                </BigCard>

                {/* 2 — Narx va rentabellik (namuna) */}
                <BigCard title="Narx va tannarx, $/birlik" style={demoCardStyle}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar
                            data={priceBars}
                            options={{
                                ...chartBase, indexAxis: 'y',
                                plugins: legendLarge('top'),
                                scales: axisLarge({ x: { beginAtZero: true }, y: { grid: { display: false } } }),
                            } as any}
                        />
                    </div>
                </BigCard>

                {/* 3 — HAQIQIY: oylik tushum va foyda */}
                <BigCard title="Oylik tushum va foyda">
                    {!revenueChart ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sub, fontSize: 'clamp(12px, 2.4cqmin, 16px)' }}>
                            Ma'lumot yuklanmoqda…
                        </div>
                    ) : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar
                                data={revenueChart as any}
                                options={{
                                    ...chartBase,
                                    plugins: legendLarge('top'),
                                    scales: axisLarge({ x: { ticks: { font: { size: 10 } } }, y: { beginAtZero: true } }),
                                } as any}
                            />
                        </div>
                    )}
                </BigCard>

                {/* 4 — Jahon bozori narxlari indeksi (namuna) */}
                <BigCard title="Jahon bozori narxlari indeksi (birinchi oy = 100)" style={demoCardStyle}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line
                            data={priceIndex}
                            options={{
                                ...chartBase,
                                plugins: legendLarge('top'),
                                scales: axisLarge({ y: { beginAtZero: false } }),
                            } as any}
                        />
                    </div>
                </BigCard>

                {/* 5 — Eksport bozorlari (namuna) */}
                <BigCard title="Eksport bozorlari, %" style={demoCardStyle}>
                    <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 12 }}>
                        <div style={{ flex: '0 0 44%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: 9, overflowY: 'auto' }}>
                            {DATA.exportMarkets.map((m) => (
                                <BigLabelRow
                                    key={m.label}
                                    label={m.label}
                                    color={MARKET_COLOR[m.color] ?? GC.slate}
                                    value={`${fmtNum(m.pct, 1)}%`}
                                />
                            ))}
                        </div>
                        <div style={bigDonutBoxStyle}>
                            <Doughnut
                                data={exportDonut}
                                options={{ ...chartBase, cutout: '62%', ...noLegend } as any}
                                plugins={[bigCenterText(`${DATA.exportMarkets.length}`, 'bozor')]}
                            />
                        </div>
                    </div>
                </BigCard>

                {/* 6 — Sun'iy intellekt prognozlari (namuna) */}
                <BigCard title="Sun'iy intellekt prognozlari" style={demoCardStyle}>
                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 8, overflow: 'hidden' }}>
                        {AI_FORECASTS.map((f, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                                        <span style={{ color: C.text, fontSize: 'clamp(11px, 2.3cqmin, 16px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.text}</span>
                                    </span>
                                    <span style={{ color: f.color, fontWeight: 700, fontSize: 'clamp(11px, 2.3cqmin, 16px)', flexShrink: 0 }}>{f.confidence}%</span>
                                </div>
                                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 3 }}>
                                    <div style={{ width: `${f.confidence}%`, height: '100%', borderRadius: 3, background: f.color }} />
                                </div>
                                <div style={{ color: C.sub, fontSize: 'clamp(9px, 1.9cqmin, 13px)', marginLeft: 17 }}>{f.detail}</div>
                            </div>
                        ))}
                    </div>
                </BigCard>
            </div>
        </BigDashRoot>
    );
};

export default FinanceNewMain;
