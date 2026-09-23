import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { C, chartBase, noLegend, DashHeader } from '../../components/dashboardUI';
import {
    BigCard, BigKpiCard, BigDashRoot, BigChartBox, BigProgressList,
    bigBarLabel, bigScales, fmtGrouped,
} from '../../components/dashboardUILarge';
import { BigTable, Clamp, Tag, bigTableSub, bigTableText, type BigColumn } from '../../components/BigTable';
import { useLegalAffairsDashboard } from '../../hooks/procurementLegal';
import type { LegalAffairsDashboard, LegalClaim, LegalContractReview, LegalCourtCase } from '../../services/legalAffairs';
import { GC, ACCENT_SERIES } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   YURIDIK BOSHQARMA — `GET /legal-affairs/dashboard` (LEGAL_AFFAIRS_API.md).
   Namuna ma'lumot YO'Q — faqat API qiymatlari.

   Hujjat qoidalari qanday bajarilgan:
     • `null` — «—» (manbada ko'rsatilmagan), hech qachon 0 emas.
     • Hal qiluv sanasi: `rulingDate` (ISO) bo'lsa formatlanadi, bo'lmasa
       `rulingDateText` manbadagidek (taxmin qilib parse qilinmaydi).
     • `reviewedDate` — OY: «2026-yil yanvar» ko'rinishida, kun yozilmaydi;
       `reviewedDateYearSuspect` bo'lsa sariq belgi bilan (manbadagi 2001).
     • Pretenziya summasi — birlik ishonchsiz (`amountUnitSuspect`): son
       manbadagidek, birlik yozilmaydi, ogohlantirish ko'rsatiladi.
     • Pretenziyalar atigi 2 ta — bu manba holati, «2 ta yozuv» deb yoziladi.
   ══════════════════════════════════════════════════════════════════════════ */

const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
const MONTHS_SHORT = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];

const dmy = (iso?: string | null) => {
    if (!iso) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
};
const monthLabel = (iso?: string | null) => {
    const m = iso ? /^(\d{4})-(\d{2})/.exec(iso) : null;
    return m ? `${m[1]}-yil ${MONTHS[Number(m[2]) - 1]}` : null;
};
const dash = (s?: string | null) => s || '—';

function buildView(d: LegalAffairsDashboard) {
    const dupCaseNumbers = new Set<string>((d.dataQuality.courtCases?.duplicateCaseNumbers ?? []).map((x: any) => x.value));

    /* Sud majlislari oylar bo'yicha — faqat ISO sanasi bor ishlar; oylar
       oralig'i uzluksiz (bo'sh oy 0 emas, balki shunchaki majlis bo'lmagan oy). */
    const hearingIso = d.courtCases.map((c) => c.hearingDate).filter((x): x is string => !!x).sort();
    const months: { key: string; label: string; count: number }[] = [];
    if (hearingIso.length) {
        let [y, m] = hearingIso[0].split('-').map(Number);
        const [ey, em] = hearingIso[hearingIso.length - 1].split('-').map(Number);
        while (y < ey || (y === ey && m <= em)) {
            const key = `${y}-${String(m).padStart(2, '0')}`;
            months.push({ key, label: `${MONTHS_SHORT[m - 1]} ${String(y).slice(2)}`, count: hearingIso.filter((h) => h.startsWith(key)).length });
            m += 1; if (m > 12) { m = 1; y += 1; }
        }
    }

    return {
        dupCaseNumbers,
        months,
        hearingMissing: d.courtCases.length - hearingIso.length,
        appeals: d.courtCases.filter((c) => c.appealSummary || c.appealHearingText).length,
        claimsSum: d.totals.claimsAmountRawSum,
        maxCourt: Math.max(1, ...d.byCourt.map((c) => c.cases)),
    };
}

const CourtCaseTable: React.FC<{ rows: LegalCourtCase[]; dup: Set<string> }> = ({ rows, dup }) => {
    const columns: BigColumn<LegalCourtCase>[] = [
        { key: 'n', title: '№', width: '4%', render: (c) => <span style={{ color: C.sub }}>{c.ordinal ?? '—'}</span> },
        {
            key: 'case', title: 'Ish raqami va sud', width: '21%', render: (c) => (
                <div>
                    <div style={{ fontWeight: 700, color: c.caseNumber && dup.has(c.caseNumber) ? GC.amber : C.text }}
                        title={c.caseNumber && dup.has(c.caseNumber) ? "Bir xil ish raqami ikki yozuvda (boshqa da'vogar) — ikkalasi ham saqlangan" : undefined}>
                        {dash(c.caseNumber)}
                    </div>
                    <div style={{ color: C.sub, fontSize: bigTableSub, lineHeight: 1.3 }}><Clamp text={c.courtName} lines={2} color={C.sub} /></div>
                </div>
            ),
        },
        { key: 'lawyer', title: 'Yurist', width: '9%', render: (c) => dash(c.lawyer) },
        {
            key: 'dates', title: 'Qaror / majlis', width: '10%', render: (c) => (
                <div>
                    <div>{dash(dmy(c.rulingDate) ?? c.rulingDateText)}</div>
                    <div style={{ color: C.sub, fontSize: bigTableSub }}>{dash(dmy(c.hearingDate) ?? c.hearingDateText)}</div>
                </div>
            ),
        },
        { key: 'subject', title: 'Ish mazmuni', width: '29%', render: (c) => <Clamp text={c.subject} lines={2} /> },
        {
            key: 'result', title: 'Natija', width: '27%', render: (c) => (
                <div>
                    <Clamp text={c.result} lines={2} />
                    {(c.appealSummary || c.appealHearingText) && (
                        <div style={{ marginTop: 4 }}><Tag color={GC.accent2} title={c.appealHearingText ?? c.appealSummary ?? undefined}>Apellyatsiya</Tag></div>
                    )}
                </div>
            ),
        },
    ];
    return <BigTable columns={columns} rows={rows} rowKey={(c) => c.key} fill />;
};

const ReviewTable: React.FC<{ rows: LegalContractReview[] }> = ({ rows }) => {
    const columns: BigColumn<LegalContractReview>[] = [
        { key: 'n', title: '№', width: '5%', render: (r) => <span style={{ color: C.sub }}>{r.ordinal ?? '—'}</span> },
        { key: 'cp', title: 'Kontragent / hujjat', width: '20%', render: (r) => <Clamp text={r.counterparty} lines={2} /> },
        { key: 'from', title: "So'rov yuboruvchi", width: '17%', render: (r) => <Clamp text={r.contractName} lines={2} color={C.sub} /> },
        { key: 'recv', title: 'Kelib tushgan', width: '11%', render: (r) => dash(dmy(r.receivedDate) ?? r.receivedDateText) },
        {
            key: 'rev', title: "Ko'rib chiqilgan oy", width: '13%', render: (r) => {
                const label = (r.reviewedDateIsMonthOnly ? monthLabel(r.reviewedDate) : dmy(r.reviewedDate)) ?? r.reviewedDateText;
                return r.reviewedDateYearSuspect
                    ? <span title="Yil ketma-ketlikdan chiqqan (manbada shunday, tuzatilmagan)" style={{ color: GC.amber, fontWeight: 700 }}>{dash(label)}</span>
                    : dash(label);
            },
        },
        { key: 'conc', title: 'Yuridik xulosa', width: '34%', render: (r) => <Clamp text={r.conclusion} lines={2} /> },
    ];
    return <BigTable columns={columns} rows={rows} rowKey={(r) => r.key} fill />;
};

const ClaimCard: React.FC<{ c: LegalClaim }> = ({ c }) => (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 6, background: C.cardAlt, border: `1px solid ${C.border}`, borderLeft: `3px solid ${GC.accent1}`, borderRadius: 8, padding: 'clamp(6px, 1.6cqmin, 12px)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
            <span style={{ color: C.text, fontWeight: 700, fontSize: bigTableText, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dash(c.respondent)}</span>
            <span title={c.amountUnitSuspect ? `Sarlavhada «${c.amountUnitLabel}», qiymat esa so'mga o'xshaydi — birlik ishonchsiz` : undefined}
                style={{ color: C.text, fontWeight: 700, fontSize: 'clamp(16px, 3.6cqmin, 26px)', flexShrink: 0 }}>
                {c.amountRaw == null ? '—' : fmtGrouped(c.amountRaw, 0)}
            </span>
        </div>
        <div style={{ fontSize: bigTableSub, color: C.sub, flex: 1, minHeight: 0 }}><Clamp text={c.subject} lines={3} color={C.sub} /></div>
        <div style={{ display: 'flex', gap: 14, fontSize: bigTableSub, color: C.sub, flexShrink: 0 }}>
            <span>Yuborilgan: <span style={{ color: C.text }}>{dash(dmy(c.sentDate) ?? c.sentDateText)}</span></span>
            <span>Muddat: <span style={{ color: C.text }}>{dash(c.deadlineText)}</span></span>
            <span>Javob: <span style={{ color: C.text }}>{dash(c.responseText)}</span></span>
        </div>
    </div>
);

const YurMain: React.FC = () => {
    const { data, isLoading, isError } = useLegalAffairsDashboard();
    const v = useMemo(() => (data ? buildView(data) : null), [data]);
    const importedAt = data?.meta.importedAt ? new Date(data.meta.importedAt).toLocaleDateString('ru-RU') : null;

    if (!data || !v) {
        return (
            <BigDashRoot>
                <DashHeader title="Yuridik boshqarma" subtitle="" dateRange={isLoading ? 'Yuklanmoqda…' : ''} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isError ? GC.danger : C.sub, fontSize: 20 }}>
                    {isError ? "Yuridik boshqarma ma'lumotini olib bo'lmadi. Tizimga qayta kiring yoki keyinroq urinib ko'ring." : "Ma'lumot yuklanmoqda…"}
                </div>
            </BigDashRoot>
        );
    }

    const t = data.totals;

    return (
        <BigDashRoot>
            <DashHeader title="Yuridik boshqarma" subtitle={data.meta.source} dateRange={`Sud ishlari, pretenziyalar, shartnoma ekspertizasi${importedAt ? `, yangilangan ${importedAt}` : ''}`} />

            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0 }}>
                <BigKpiCard title="Sud ishlari" value={String(t.courtCases)} iconColor={GC.accent1} />
                <BigKpiCard title="Apellyatsiya bosqichida" value={String(v.appeals)} iconColor={GC.accent2} />
                <BigKpiCard title="Sudlar soni" value={String(data.byCourt.length)} iconColor={GC.accent3} />
                <BigKpiCard title="Yuristlar soni" value={String(data.byLawyer.length)} iconColor={GC.accent3} />
                <BigKpiCard title="Pretenziyalar" value={`${t.claims} ta`} iconColor={GC.accent2} />
                <BigKpiCard title={t.claimsAmountUnitSuspect ? 'Pretenziyalar summasi (birlik noaniq)' : 'Pretenziyalar summasi'} value={v.claimsSum == null ? '—' : fmtGrouped(v.claimsSum, 0)} iconColor={t.claimsAmountUnitSuspect ? GC.amber : GC.accent1} />
                <BigKpiCard title="Shartnoma ekspertizasi" value={String(t.contractReviews)} iconColor={GC.accent1} />
            </div>

            <div style={{
                flex: 1, minHeight: 0, display: 'grid', gap: 10,
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.15fr)',
            }}>
                <BigCard title={`Sud ishlari, ${t.courtCases} ta`} style={{ gridColumn: '1 / span 2', gridRow: '1 / span 3' }}>
                    <CourtCaseTable rows={data.courtCases} dup={v.dupCaseNumbers} />
                </BigCard>

                <BigCard title="Yuristlar bo'yicha sud ishlari">
                    <BigChartBox>
                        <Bar
                            data={{
                                labels: data.byLawyer.map((l) => l.lawyer),
                                datasets: [{ data: data.byLawyer.map((l) => l.cases), backgroundColor: data.byLawyer.map((_, i) => ACCENT_SERIES[Math.min(i, ACCENT_SERIES.length - 1)]), borderRadius: 4, barPercentage: 0.6 }],
                            }}
                            options={{ ...chartBase, ...noLegend, scales: bigScales({ decimals: 0 }) } as any}
                            plugins={[bigBarLabel(0)]}
                        />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Sudlar bo'yicha sud ishlari">
                    <BigProgressList items={data.byCourt.map((c, i) => ({ label: c.court, value: c.cases, max: v.maxCourt, display: String(c.cases), color: i === 0 ? GC.accent1 : GC.accent2 }))} />
                </BigCard>

                <BigCard title="Sud majlislari oylar bo'yicha">
                    <BigChartBox>
                        <Bar
                            data={{ labels: v.months.map((m) => m.label), datasets: [{ data: v.months.map((m) => m.count), backgroundColor: GC.accent1, borderRadius: 4, barPercentage: 0.6 }] }}
                            options={{ ...chartBase, ...noLegend, scales: bigScales({ decimals: 0 }) } as any}
                            plugins={[bigBarLabel(0)]}
                        />
                    </BigChartBox>
                    {v.hearingMissing > 0 && (
                        <div style={{ color: C.sub, fontSize: bigTableSub, marginTop: 6, flexShrink: 0 }}>
                            {v.hearingMissing} ta ishda majlis sanasi manbada ko'rsatilmagan.
                        </div>
                    )}
                </BigCard>

                <BigCard title={`Pretenziyalar, ${t.claims} ta yozuv`}>
                    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {data.claims.map((c) => <ClaimCard key={c.key} c={c} />)}
                    </div>
                    {t.claimsAmountUnitSuspect && (
                        <div style={{ color: C.sub, fontSize: bigTableSub, marginTop: 6, flexShrink: 0, display: 'flex', gap: 6, alignItems: 'baseline' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: GC.amber, flexShrink: 0, alignSelf: 'center' }} />
                            <span>Summa manbadagidek. Sarlavhada «{t.claimsAmountUnitLabel}», qiymatlar esa so'mga mos keladi, birlik aniqlashtirilishi kerak.</span>
                        </div>
                    )}
                </BigCard>

                <BigCard title={`Shartnoma ekspertizasi, ${t.contractReviews} ta`} style={{ gridColumn: '3 / span 2' }}>
                    <ReviewTable rows={data.contractReviews} />
                    {data.contractReviews.some((r) => r.reviewedDateYearSuspect) && (
                        <div style={{ color: C.sub, fontSize: bigTableSub, marginTop: 6, flexShrink: 0 }}>
                            <span style={{ color: GC.amber }}>Sariq oy:</span> manbada yil 2001 deb yozilgan (qolganlari 2026), tuzatilmagan.
                        </div>
                    )}
                </BigCard>
            </div>
        </BigDashRoot>
    );
};

export default YurMain;
