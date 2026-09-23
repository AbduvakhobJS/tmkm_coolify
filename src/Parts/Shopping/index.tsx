import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { C, chartBase, noLegend, DashHeader } from '../../components/dashboardUI';
import {
    BigCard, BigKpiCard, BigDashRoot, BigChartBox, BigDonutBody, BigRowList,
    legendLarge, bigBarLabel, bigScales, fmtGrouped,
    type BigPart, type BigRow,
} from '../../components/dashboardUILarge';
import { BigTable, bigTableSub, type BigColumn } from '../../components/BigTable';
import { useProcurementDashboard } from '../../hooks/procurementLegal';
import type { ProcurementDashboard, ProcurementFact, ProcurementPeriod } from '../../services/stateProcurement';
import { GC, alpha } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   DAVLAT XARIDLARI — `GET /state-procurement/dashboard`
   (STATE_PROCUREMENT_API.md). Namuna ma'lumot YO'Q — faqat API qiymatlari.

   Hujjat qoidalari qanday bajarilgan:
     • `null` ≠ 0: jadvalda `null` — «—», `0` — «0». Grafiklarda `null`
       ustun chizilmaydi (0 deb qo'shilmaydi, faqat yig'ishda o'tkaziladi).
     • Yig'indi qatori (`totalRow`) etalon sifatida alohida ko'rsatiladi,
       turlar yig'indisiga QO'SHILMAYDI.
     • Jami ko'rsatkichlar faqat CHORAK slotlaridan (`totals.quarters*`) —
       `total` slotlar qo'shilsa hamma son ikki barobar chiqardi.
     • Summalar manbada mln so'm (2025 umumiy ustun sarlavhasidagi «млрд»
       xato — `unitConflicts`). Ekranda mlrd so'mga o'girib (÷1000) yoziladi.
     • `dataQuality` dagi nomuvofiqliklar yashirilmaydi — alohida kartada.
   ══════════════════════════════════════════════════════════════════════════ */

const toBn = (mln: number) => mln / 1000;
const bn = (mln: number | null | undefined) => (mln == null ? '—' : fmtGrouped(toBn(mln), 1));
const int = (n: number | null | undefined) => (n == null ? '—' : fmtGrouped(n, 0));

/** "I chorak" → "I" */
const roman = (p: ProcurementPeriod) => (p.quarterLabel ?? '').replace(/\s*chorak/i, '').trim();
const periodShort = (p?: ProcurementPeriod) => (!p ? '' : p.kind === 'quarter' ? `${roman(p)} ch. ${p.year}` : p.label);

/* Summa bo'yicha eng katta 5 tur alohida rangda, qolgani «Boshqalar». Ko'k
   oila (situatsion markaz standarti) + neytral slate. */
const TOP_COLORS = [GC.accent1, GC.accent2, GC.accent3, GC.accent4, GC.violet];
const OTHERS_COLOR = GC.slate;
const TOP_N = 5;

function buildView(d: ProcurementDashboard) {
    const quarters = d.periods.filter((p) => p.kind === 'quarter');
    const periodByKey = new Map(d.periods.map((p) => [p.key, p]));
    const factMap = new Map(d.facts.map((f) => [`${f.purchaseTypeKey}:${f.periodKey}`, f]));
    const totalByPeriod = new Map(d.totalRow.map((f) => [f.periodKey, f]));

    const typesByAmount = [...d.byType].sort((a, b) => (b.quartersAmount ?? 0) - (a.quartersAmount ?? 0));
    const top = typesByAmount.slice(0, TOP_N);
    const rest = typesByAmount.slice(TOP_N);

    const sumAmount = (keys: string[], periodKey: string) => {
        const vals = keys.map((k) => factMap.get(`${k}:${periodKey}`)?.contractAmount).filter((v): v is number => v != null);
        return vals.length ? vals.reduce((s, v) => s + v, 0) : null;
    };

    const stacked = [
        ...top.map((t, i) => ({ label: t.purchaseTypeName, color: TOP_COLORS[i], keys: [t.purchaseTypeKey] })),
        ...(rest.length ? [{ label: 'Boshqalar', color: OTHERS_COLOR, keys: rest.map((t) => t.purchaseTypeKey) }] : []),
    ].map((g) => ({ ...g, data: quarters.map((q) => { const v = sumAmount(g.keys, q.key); return v == null ? null : toBn(v); }) }));

    const shareParts: BigPart[] = [
        ...top.map((t, i) => ({ label: t.purchaseTypeName, value: toBn(t.quartersAmount ?? 0), color: TOP_COLORS[i] })),
        ...(rest.length ? [{ label: 'Boshqalar', value: toBn(rest.reduce((s, t) => s + (t.quartersAmount ?? 0), 0)), color: OTHERS_COLOR }] : []),
    ];

    /* 2026 I yarim yilni 2025 yilning aynan shu choraklari bilan solishtirish. */
    const h1 = (year: number, measure: 'count' | 'contractAmount') => {
        const vals = [1, 2].map((q) => totalByPeriod.get(`${year}-Q${q}`)?.[measure]).filter((v): v is number => v != null);
        return vals.length === 2 ? vals[0] + vals[1] : null;
    };
    const pct = (cur: number | null, base: number | null) => (cur != null && base ? ((cur - base) / base) * 100 : null);
    const t2025 = totalByPeriod.get('2025-TOTAL');
    const t2026 = totalByPeriod.get('2026-TOTAL');

    const mismatchPeriods = new Set(d.dataQuality.totalMismatches.map((m) => `${m.periodKey}:${m.measure}`));
    const outlierKeys = new Set(d.dataQuality.amountOutliers.map((o) => `${o.purchaseTypeKey}:${o.periodKey}`));

    /* Jadval kataklari fonining jadalligi — logarifmik shkala: bitta anomal
       katak (634 990 mln) qolganlarini oqartirib yubormasligi uchun. */
    const maxAmount = Math.max(1, ...d.facts.filter((f) => f.periodKind === 'quarter' && !outlierKeys.has(`${f.purchaseTypeKey}:${f.periodKey}`)).map((f) => f.contractAmount ?? 0));

    return {
        quarters, periodByKey, factMap, totalByPeriod, stacked, shareParts, mismatchPeriods, outlierKeys, maxAmount,
        topType: typesByAmount[0],
        topShare: d.totals.quartersAmount ? ((typesByAmount[0]?.quartersAmount ?? 0) / d.totals.quartersAmount) * 100 : null,
        t2025, t2026,
        delta2026Amount: pct(t2026?.contractAmount ?? null, h1(2025, 'contractAmount')),
        delta2026Count: pct(t2026?.count ?? null, h1(2025, 'count')),
        typesByCount: [...d.byType].sort((a, b) => (b.quartersCount ?? 0) - (a.quartersCount ?? 0)),
    };
}

type View = ReturnType<typeof buildView>;
type MatrixRow = { key: string; name: string; isTotal: boolean };

/** Jadval katagi: yuqorida soni, pastda summa (mlrd so'm), fon — summaga mutanosib. */
const MatrixCell: React.FC<{ fact?: ProcurementFact; v: View; isTotal: boolean; mismatch?: string; outlier?: string }> = ({ fact, v, isTotal, mismatch, outlier }) => {
    const amount = fact?.contractAmount ?? null;
    const k = amount && !isTotal && fact?.periodKind === 'quarter' ? Math.min(1, Math.log10(1 + amount) / Math.log10(1 + v.maxAmount)) : 0;
    const flag = outlier ?? mismatch;
    return (
        <div title={flag} style={{
            margin: '-2px -4px', padding: '2px 4px', borderRadius: 6, textAlign: 'right',
            background: k ? alpha(GC.accent1, 0.05 + k * 0.38) : 'transparent',
            outline: flag ? `1px solid ${GC.amber}` : undefined,
        }}>
            <div style={{ fontWeight: 700, color: mismatch ? GC.amber : C.text }}>{int(fact?.count)}</div>
            <div style={{ color: outlier ? GC.amber : C.sub, fontSize: bigTableSub }}>{bn(amount)}</div>
        </div>
    );
};

const Shopping: React.FC = () => {
    const { data, isLoading, isError } = useProcurementDashboard();
    const v = useMemo(() => (data ? buildView(data) : null), [data]);

    const importedAt = data?.meta.importedAt ? new Date(data.meta.importedAt).toLocaleDateString('ru-RU') : null;

    if (!data || !v) {
        return (
            <BigDashRoot>
                <DashHeader title="Davlat xaridlari" subtitle="" dateRange={isLoading ? 'Yuklanmoqda…' : ''} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isError ? GC.danger : C.sub, fontSize: 20 }}>
                    {isError ? "Xaridlar ma'lumotini olib bo'lmadi. Tizimga qayta kiring yoki keyinroq urinib ko'ring." : "Ma'lumot yuklanmoqda…"}
                </div>
            </BigDashRoot>
        );
    }

    const qLabels = v.quarters.map(periodShort);
    const dq = data.dataQuality;

    const qualityRows: BigRow[] = [
        ...dq.totalMismatches.map((m) => ({
            label: `${periodShort(v.periodByKey.get(m.periodKey))}: fayldagi jami ${m.measure === 'count' ? 'soni' : 'summa'}`,
            sub: `Turlar yig'indisi ${int(m.computed)}, «Jami» qatorida ${int(m.declared)}`,
            value: `${(m.diff ?? 0) > 0 ? '+' : ''}${int(m.diff)}`, color: GC.amber,
        })),
        ...dq.amountOutliers.map((o) => ({
            label: `Anomal summa: ${o.purchaseTypeName}`,
            sub: `${periodShort(v.periodByKey.get(o.periodKey))}: medianadan ${fmtGrouped(o.ratio, 1)}× katta, davrning ${fmtGrouped(o.shareOfPeriod * 100, 0)}%`,
            value: `${bn(o.value)} mlrd`, color: GC.amber,
        })),
        ...(dq.totalSlotMismatches ?? []).map((m: any) => ({
            label: `Yillik ustun: ${m.purchaseTypeName}`,
            sub: `${periodShort(v.periodByKey.get(m.periodKey))}, ${m.measure === 'count' ? 'soni' : 'summa'}: choraklar ${m.computed == null ? "ko'rsatilmagan" : int(m.computed)}, ustunda ${int(m.declared)}`,
            value: 'Ziddiyat', color: GC.amber,
        })),
        ...(dq.unitConflicts ?? []).map((u: any) => ({
            label: `Birlik sarlavhasi (${periodShort(v.periodByKey.get(u.periodKey))})`,
            sub: `Sarlavhada «${u.declaredUnit}», qiymat aslida ${u.observedUnit}da`,
            value: 'mln deb olindi', color: GC.accent2,
        })),
        ...(dq.emptyColumns?.length ? [{
            label: 'Tasdiqlangan TMB ustunlari',
            sub: `${dq.emptyColumns.length} ta ustun manbada butunlay bo'sh`,
            value: "Ma'lumot yo'q", color: GC.slate,
        }] : []),
        ...(dq.textCountCells?.length ? [{
            label: "Matn ko'rinishidagi sonlar",
            sub: `${dq.textCountCells.length} ta katak (${Array.from(new Set(dq.textCountCells.map((c: any) => c.purchaseTypeName))).join(', ')})`,
            value: `${dq.textCountCells.length} ta`, color: GC.slate,
        }] : []),
    ];

    const matrixRows: MatrixRow[] = [
        ...data.purchaseTypes.map((t) => ({ key: t.key, name: t.name, isTotal: false })),
        { key: '__total__', name: 'Jami xaridlar', isTotal: true },
    ];
    const slots = [...v.quarters, ...data.periods.filter((p) => p.kind === 'total')];
    const cellFact = (r: MatrixRow, periodKey: string) => (r.isTotal ? v.totalByPeriod.get(periodKey) : v.factMap.get(`${r.key}:${periodKey}`));
    const matrixColumns: BigColumn<MatrixRow>[] = [
        { key: 'name', title: 'Xarid turi', width: '19%', render: (r) => <span style={{ fontWeight: r.isTotal ? 700 : 500 }}>{r.name}</span> },
        ...slots.map((p) => ({
            key: p.key,
            align: 'right' as const,
            title: (
                <span style={{ display: 'block', lineHeight: 1.25 }}>
                    <span style={{ color: p.kind === 'total' ? GC.accent2 : C.text }}>{p.kind === 'quarter' ? `${roman(p)} chorak` : 'Jami'}</span><br />
                    {p.kind === 'quarter' ? p.year : p.year === 2026 ? '2026, I yarim yil' : p.year}
                </span>
            ),
            render: (r: MatrixRow) => {
                const outlier = !r.isTotal && v.outlierKeys.has(`${r.key}:${p.key}`)
                    ? dq.amountOutliers.find((o) => o.purchaseTypeKey === r.key && o.periodKey === p.key)?.reason : undefined;
                const mismatch = r.isTotal && v.mismatchPeriods.has(`${p.key}:count`)
                    ? dq.totalMismatches.find((m) => m.periodKey === p.key)?.reason ?? undefined : undefined;
                return <MatrixCell fact={cellFact(r, p.key)} v={v} isTotal={r.isTotal} outlier={outlier} mismatch={mismatch} />;
            },
        })),
    ];

    return (
        <BigDashRoot>
            <DashHeader
                title="Davlat xaridlari"
                subtitle={data.meta.source}
                dateRange={`2025 yil va 2026 yil I yarim yil${importedAt ? `, yangilangan ${importedAt}` : ''}`}
            />

            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0 }}>
                <BigKpiCard title="Xaridlar soni, 6 chorak" value={int(data.totals.quartersCount)} iconColor={GC.accent1} />
                <BigKpiCard title="Shartnomalar summasi, mlrd so'm" value={bn(data.totals.quartersAmount)} iconColor={GC.accent1} />
                <BigKpiCard title="2025 yil summasi, mlrd so'm" value={bn(v.t2025?.contractAmount)} iconColor={GC.accent2} />
                <BigKpiCard title="2026 I yarim yil summasi, mlrd so'm" value={bn(v.t2026?.contractAmount)} delta={v.delta2026Amount} iconColor={GC.accent2} />
                <BigKpiCard title="2026 I yarim yil xaridlar soni" value={int(v.t2026?.count)} delta={v.delta2026Count} iconColor={GC.accent3} />
                <BigKpiCard title={`Eng katta ulush: ${v.topType?.purchaseTypeName ?? ''}`} value={v.topShare == null ? '—' : `${fmtGrouped(v.topShare, 1)}%`} iconColor={GC.accent4} />
            </div>

            <div style={{
                flex: 1, minHeight: 0, display: 'grid', gap: 10,
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1.25fr)',
            }}>
                <BigCard title="Choraklar bo'yicha shartnomalar summasi, mlrd so'm" style={{ gridColumn: 'span 2' }}>
                    <BigChartBox>
                        <Bar
                            data={{ labels: qLabels, datasets: v.stacked.map((g) => ({ label: g.label, data: g.data as any, backgroundColor: g.color, borderRadius: 3, barPercentage: 0.62 })) }}
                            options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ stacked: true, decimals: 0 }) } as any}
                        />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Choraklar bo'yicha xaridlar soni">
                    <BigChartBox>
                        <Bar
                            data={{
                                labels: qLabels,
                                datasets: [{
                                    data: v.quarters.map((q) => v.totalByPeriod.get(q.key)?.count ?? null) as any,
                                    backgroundColor: v.quarters.map((q) => (v.mismatchPeriods.has(`${q.key}:count`) ? GC.amber : GC.accent1)),
                                    borderRadius: 4, barPercentage: 0.6,
                                }],
                            }}
                            options={{ ...chartBase, ...noLegend, scales: bigScales({ decimals: 0 }) } as any}
                            plugins={[bigBarLabel(0)]}
                        />
                    </BigChartBox>
                    {dq.totalMismatches.length > 0 && (
                        <div style={{ color: C.sub, fontSize: bigTableSub, marginTop: 6, flexShrink: 0 }}>
                            <span style={{ color: GC.amber }}>Sariq ustunlar:</span> fayldagi «Jami» qatori turlar yig'indisidan {dq.totalMismatches.map((m) => int(m.diff)).join(' va ')} taga kam, manbadagidek ko'rsatilgan.
                        </div>
                    )}
                </BigCard>

                <BigCard title="Xarid turlari bo'yicha summa ulushi">
                    <BigDonutBody parts={v.shareParts} center={bn(data.totals.quartersAmount)} centerSub="mlrd so'm" formatValue={(x) => `${fmtGrouped(x, 1)} mlrd`} />
                </BigCard>

                <BigCard title="Xarid turlari va choraklar: soni va summa (mlrd so'm)" style={{ gridColumn: 'span 2' }}>
                    <BigTable
                        columns={matrixColumns}
                        rows={matrixRows}
                        rowKey={(r) => r.key}
                        fill
                        rowStyle={(r) => (r.isTotal ? { background: C.cardAlt, position: 'sticky', bottom: 0 } : undefined)}
                    />
                </BigCard>

                <BigCard title="Xarid turlari bo'yicha soni, 6 chorak">
                    <BigChartBox>
                        <Bar
                            data={{
                                labels: v.typesByCount.map((t) => t.purchaseTypeName),
                                datasets: [{
                                    data: v.typesByCount.map((t) => t.quartersCount) as any,
                                    backgroundColor: v.typesByCount.map((_, i) => (i < 3 ? GC.accent1 : GC.accent2)),
                                    borderRadius: 4, barPercentage: 0.7,
                                }],
                            }}
                            options={{ ...chartBase, ...noLegend, indexAxis: 'y', scales: bigScales({ horizontal: true, decimals: 0 }) } as any}
                        />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Manbadagi nomuvofiqliklar">
                    {qualityRows.length === 0
                        ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', color: C.sub }}>Nomuvofiqlik topilmadi.</div>
                        : <BigRowList rows={qualityRows} />}
                </BigCard>
            </div>
        </BigDashRoot>
    );
};

export default Shopping;
