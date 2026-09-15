import React, { useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { C, fmt, chartBase, noLegend } from '../../components/dashboardUI';
import {
    BigCard, BigKpiCard, axisLarge, legendLarge,
    bigHeaderTitle, bigHeaderPill, bigChip, bigFooter,
    bigCenterText, bigDonutBoxStyle, BigLabelRow,
} from '../../components/dashboardUILarge';
import { useExportTargetsDashboard } from '../../hooks/exportTargets';
import type { ExportTargetPeriod, ExportTargetsDashboardData } from '../../services/exportTargets';
import { GC, ACCENT_SERIES } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   EKSPORTNING MAQSADLI KO'RSATKICHLARI (2024-2030)

   Butun ekran BITTA endpointdan quriladi: GET /export-targets/dashboard
   (hujjat: EXPORT_TARGETS_API.md).

   Muhim qoidalar (hujjatdan):
     • `null` — 0 EMAS. Ma'lumot yo'q davr/mahsulot combo grafikda BO'SH
       qoladi, soxta 0 chizilmaydi.
     • `volume` mahsulotlar bo'ylab qo'shilmaydi (o'lchov birligi har xil) —
       faqat `valueThousandUsd` yig'iladi.
     • 2026 yil ikki marta uchraydi (amalda — qisman yil, va prognoz) —
       `periodKey` bilan ajratiladi, bitta ustunga yig'ilmaydi.
     • `periods[].totalValueThousandUsd` (hisoblangan) va
       `sourceTotals[].valueThousandUsd` (manbadagi "ЖАМИ") ataylab ikkitasi —
       farq bo'lsa ko'rsatiladi, biri bilan almashtirilmaydi.
   ══════════════════════════════════════════════════════════════════════════ */

const EmptyBody: React.FC = () => <div style={{ flex: 1, minHeight: 0 }} />;

type ViewProductRow = { name: string; unit: string | null; value: number };
type ProductSeries = { name: string; color: string; data: (number | null)[] };

function buildView(data?: ExportTargetsDashboardData) {
    const periods = data?.periods ?? [];
    const products = data?.products ?? [];
    const values = data?.values ?? [];
    const geography = data?.geography ?? [];
    const sourceTotals = data?.sourceTotals ?? [];

    const periodsSorted = [...periods].sort((a, b) => a.sortOrder - b.sortOrder);

    const valueMap = new Map<string, number | null>();
    for (const v of values) valueMap.set(`${v.rowNo}:${v.periodKey}`, v.valueThousandUsd);

    /* Eng so'nggi "amalda" davr — mahsulotlar kesimida haqiqiy raqam bor davr
       (manbada ko'pchilik katak bo'sh, shu sabab avtomatik topiladi). */
    const actualPeriodsDesc = periods.filter((p) => p.kind === 'actual').sort((a, b) => b.sortOrder - a.sortOrder);
    let latestActualWithData: ExportTargetPeriod | undefined;
    for (const p of actualPeriodsDesc) {
        const hasData = products.some((prod) => {
            const v = valueMap.get(`${prod.rowNo}:${p.periodKey}`);
            return v !== null && v !== undefined;
        });
        if (hasData) { latestActualWithData = p; break; }
    }

    const productRows: ViewProductRow[] = latestActualWithData
        ? products
            .map((p) => ({ name: p.name, unit: p.unit, value: valueMap.get(`${p.rowNo}:${latestActualWithData!.periodKey}`) ?? null }))
            .filter((r): r is ViewProductRow => r.value !== null)
        : [];
    const productRowsTotal = productRows.reduce((s, r) => s + r.value, 0);

    /* Har bir mahsulot uchun barcha davrlar bo'ylab dinamika — kamida bitta
       davrda haqiqiy raqami bor mahsulotlar olinadi (64 kataqdan 42 tasi to'la). */
    const productSeries: ProductSeries[] = products
        .map((p, i) => ({
            name: p.name,
            color: ACCENT_SERIES[i % ACCENT_SERIES.length],
            data: periodsSorted.map((per) => valueMap.get(`${p.rowNo}:${per.periodKey}`) ?? null),
        }))
        .filter((s) => s.data.some((v) => v !== null && v !== undefined));

    const latestGeography = geography.length > 0 ? geography[geography.length - 1] : null;

    /* KPI qatori uchun 4 ta vakil davr: birinchisi, qisman-yil "amalda" (agar
       bo'lsa), birinchi prognoz va oxirgi davr — periodKey qattiq yozilmaydi,
       hujjatdagi tartibga (sortOrder) tayaniladi. */
    const partialActual = periods.find((p) => p.kind === 'actual' && !!p.note);
    const firstForecast = periodsSorted.find((p) => p.kind === 'forecast');
    const kpiCandidates = [periodsSorted[0], partialActual, firstForecast, periodsSorted[periodsSorted.length - 1]];
    const seen = new Set<string>();
    const kpiPeriods: ExportTargetPeriod[] = [];
    for (const p of kpiCandidates) {
        if (p && !seen.has(p.periodKey)) { seen.add(p.periodKey); kpiPeriods.push(p); }
    }

    /* Hisoblangan (`totalValueThousandUsd`) va manbadagi "ЖАМИ" (`sourceTotals`)
       ataylab ikkitasi — mos kelmasa ko'rsatish kerak (hujjat, 177-190 qator). */
    const sourceMap = new Map(sourceTotals.map((s) => [s.periodKey, s.valueThousandUsd]));
    const mismatches = periodsSorted.filter((p) => {
        const src = sourceMap.get(p.periodKey);
        if (p.totalValueThousandUsd == null || src == null) return false;
        return Math.abs(p.totalValueThousandUsd - src) > 0.01;
    });
    const hasCompare = periodsSorted.some((p) => p.totalValueThousandUsd != null || sourceMap.get(p.periodKey) != null);

    return {
        title: data?.title ?? '',
        source: data?.meta?.source ?? '',
        periods, periodsSorted, products, geography, latestGeography, sourceMap, hasCompare,
        latestActualWithData, productRows, productRowsTotal, productSeries, kpiPeriods, mismatches,
    };
}

const ExportProduct: React.FC = () => {
    const { data } = useExportTargetsDashboard();
    const v = useMemo(() => buildView(data), [data]);

    const hasPeriods = v.periodsSorted.length > 0;
    const hasProducts = v.productRows.length > 0;
    const hasGeography = v.geography.length > 0;
    const hasProductSeries = v.productSeries.length > 0;

    const periodBarData = {
        labels: v.periodsSorted.map((p) => `${p.year}${p.kind === 'actual' ? '·А' : '·П'}`),
        datasets: [{
            data: v.periodsSorted.map((p) => p.totalValueThousandUsd),
            backgroundColor: v.periodsSorted.map((p) => (p.kind === 'actual' ? GC.accent1 : GC.accent3)),
            borderRadius: 4, barPercentage: 0.6,
        }],
    };

    const productBarData = {
        labels: v.productRows.map((r) => r.name),
        datasets: [{
            data: v.productRows.map((r) => r.value),
            backgroundColor: GC.accent2,
            borderRadius: 4, barPercentage: 0.6,
        }],
    };

    const geoBarData = {
        labels: v.geography.map((g) => String(g.year)),
        datasets: [{
            data: v.geography.map((g) => g.count),
            backgroundColor: GC.accent1,
            borderRadius: 4, barPercentage: 0.5,
        }],
    };

    const productDonutData = {
        labels: v.productRows.map((r) => r.name),
        datasets: [{
            data: v.productRows.map((r) => r.value),
            backgroundColor: v.productRows.map((_, i) => ACCENT_SERIES[i % ACCENT_SERIES.length]),
            borderColor: C.cardAlt, borderWidth: 2,
        }],
    };

    const productSeriesData = {
        labels: v.periodsSorted.map((p) => `${p.year}${p.kind === 'actual' ? '·А' : '·П'}`),
        datasets: v.productSeries.map((s) => ({
            label: s.name, data: s.data, borderColor: s.color, backgroundColor: s.color,
            borderWidth: 2, tension: 0.35, pointRadius: 2, pointBackgroundColor: s.color, spanGaps: false,
        })),
    };

    const compareBarData = {
        labels: v.periodsSorted.map((p) => `${p.year}${p.kind === 'actual' ? '·А' : '·П'}`),
        datasets: [
            { label: 'Hisoblangan', data: v.periodsSorted.map((p) => p.totalValueThousandUsd), backgroundColor: GC.accent1, borderRadius: 4, barPercentage: 0.42 },
            { label: "Manba (JAMI)", data: v.periodsSorted.map((p) => v.sourceMap.get(p.periodKey) ?? null), backgroundColor: GC.accent3, borderRadius: 4, barPercentage: 0.42 },
        ],
    };

    return (
        <div style={{
            background: 'var(--gc-panel-bg)', padding: 'clamp(8px, 2cqmin, 16px)',
            border: '1px solid rgba(14,168,199,0.2)', borderRadius: '12px',
            width: '100%', height: '100%', boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', overflow: 'auto',
            fontFamily: '"Segoe UI", system-ui, sans-serif',
            containerType: 'size', containerName: 'dash-root',
        }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                marginBottom: 'clamp(5px, 1.4cqmin, 12px)', flexShrink: 0, flexWrap: 'wrap', gap: 'clamp(4px, 1cqmin, 8px)',
            }}>
                <div style={bigHeaderTitle}>Eksport maqsadli ko'rsatkichlari</div>
                <div style={bigHeaderPill}>2024 – 2030</div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0, flexWrap: 'wrap' }}>
                {v.kpiPeriods.map((p) => (
                    <BigKpiCard
                        key={p.periodKey}
                        title={p.note ? `${p.label} (${p.note})` : p.label}
                        value={p.totalValueThousandUsd != null ? `${fmt(p.totalValueThousandUsd, 0)} ming $` : ''}
                        iconColor={p.kind === 'actual' ? GC.accent1 : GC.accent3}
                    />
                ))}
            </div>

            <div style={{
                flex: 1, minHeight: 0, display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: '1fr 1fr', gap: 10,
            }}>
                <BigCard title="Eksport qiymati davrlar bo'yicha, ming $">
                    {!hasPeriods ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar
                                data={periodBarData}
                                options={{
                                    ...chartBase, ...noLegend,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            callbacks: {
                                                label: (ctx: any) => `${fmt(ctx.parsed.y ?? 0, 0)} ming $`,
                                                afterLabel: (ctx: any) => {
                                                    const note = v.periodsSorted[ctx.dataIndex]?.note;
                                                    return note ? `⚠ ${note}` : '';
                                                },
                                            },
                                        },
                                    },
                                    scales: axisLarge({ y: { beginAtZero: true } }),
                                } as any}
                            />
                        </div>
                    )}
                </BigCard>

                <BigCard title={v.latestActualWithData ? `Mahsulotlar eksporti — ${v.latestActualWithData.label}, ming $` : "Mahsulotlar eksporti, ming $"}>
                    {!hasProducts ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar
                                data={productBarData}
                                options={{
                                    ...chartBase, indexAxis: 'y',
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: { callbacks: { label: (ctx: any) => `${fmt(ctx.parsed.x ?? 0, 0)} ming $` } },
                                    },
                                    scales: axisLarge({ x: { beginAtZero: true }, y: { grid: { display: false } } }),
                                } as any}
                            />
                        </div>
                    )}
                </BigCard>

                <BigCard title="Eksport geografiyasi, davlatlar soni">
                    {!hasGeography ? <EmptyBody /> : (
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 6 }}>
                            <div style={{ height: 'clamp(60px, 40cqh, 120px)', flexShrink: 0 }}>
                                <Bar
                                    data={geoBarData}
                                    options={{
                                        ...chartBase, ...noLegend,
                                        scales: axisLarge({ x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { color: C.sub, font: { size: 12 }, precision: 0 } } }),
                                    } as any}
                                />
                            </div>
                            {v.latestGeography && (
                                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: 5, alignContent: 'flex-start' }}>
                                    {v.latestGeography.countries.map((c) => (
                                        <span key={c} style={bigChip}>{c}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </BigCard>

                <BigCard title="Mahsulotlar dinamikasi, barcha davrlar, ming $">
                    {!hasProductSeries ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Line
                                data={productSeriesData}
                                options={{
                                    ...chartBase,
                                    plugins: legendLarge('top'),
                                    scales: axisLarge({ y: { beginAtZero: true } }),
                                } as any}
                            />
                        </div>
                    )}
                </BigCard>

                <BigCard title={v.latestActualWithData ? `Eksport tuzilmasi` : 'Eksport tuzilmasi, %'}>
                    {!hasProducts ? <EmptyBody /> : (
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minHeight: 0, gap: 12 }}>
                            <div style={{ flex: '0 0 40%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 9, overflowY: 'auto', maxHeight: '100%' }}>
                                {v.productRows.map((r, i) => (
                                    <BigLabelRow
                                        key={r.name}
                                        label={r.name}
                                        color={ACCENT_SERIES[i % ACCENT_SERIES.length]}
                                        value={`${v.productRowsTotal > 0 ? fmt((r.value / v.productRowsTotal) * 100) : '0'}%`}
                                    />
                                ))}
                            </div>
                            <div style={bigDonutBoxStyle}>
                                <Doughnut
                                    data={productDonutData}
                                    options={{ ...chartBase, cutout: '62%', ...noLegend } as any}
                                    plugins={[bigCenterText(`${fmt(v.productRowsTotal, 0)}`, 'Jami, ming $')]}
                                />
                            </div>
                        </div>
                    )}
                </BigCard>

                <BigCard title="Hisoblangan va manba JAMI solishtiruvi, ming $">
                    {!v.hasCompare ? <EmptyBody /> : (
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <Bar
                                data={compareBarData}
                                options={{
                                    ...chartBase,
                                    plugins: legendLarge('top'),
                                    scales: axisLarge({ y: { beginAtZero: true } }),
                                } as any}
                            />
                        </div>
                    )}
                </BigCard>
            </div>

            <div style={bigFooter}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.source ? `Manba: ${v.source}` : ''}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.mismatches.length > 0 ? '⚠ Hisoblangan va manbadagi JAMI mos emas' : ''}</span>
            </div>
        </div>
    );
};

export default ExportProduct;
