import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { chartBase, noLegend, DashHeader } from '../../components/dashboardUI';
import {
    BigCard, BigKpiCard, BigDashRoot, legendLarge, bigBarLabel,
    BigChartBox, BigDonutBody, BigForecastList, bigScales, bigDemoCardStyle,
    BigProgressList, BigStatGrid, BigHeatmap, BigRowList, BigPyramid, BigGauge, BigFunnel,
    type BigForecast,
} from '../../components/dashboardUILarge';
import { GC, alpha } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   HSE NAZORATI VA SLA — TO'LIQ EKRAN (35 ta karta)

   Uslub FinanceNewMain / SingleTreasury bilan bir xil: `BigDashRoot` +
   `DashHeader` + 10 ta `BigKpiCard` + 7 ustun × 4 qatorli `BigCard` to'ri.

   MA'LUMOT: Guard HSE reyestri uchun API yo'q — barcha kartalar namuna
   ma'lumotdan quriladi va SARIQ ramka bilan belgilanadi. Sonlar o'zaro
   mos: jami 148 holat = xavf darajalari yig'indisi = holatlar yig'indisi.
   ══════════════════════════════════════════════════════════════════════════ */

const DAYS = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(2026, 4, 7 + i);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
});
const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn'];

const RISK = [
    { label: 'Kritik', value: 4, color: GC.red },
    { label: 'Yuqori', value: 11, color: '#f97316' },
    { label: "O'rta", value: 58, color: GC.amber },
    { label: 'Past', value: 75, color: GC.green },
];

const RECENT_CASES = [
    { label: "Texnika xavfsizligi yo'riqnomasi buzildi", sub: '06.06, 11:00 · Markaziy boshqaruv apparati', value: 'Kritik', color: GC.red },
    { label: "Yong'in xavfsizligi talablari buzildi", sub: '05.06, 10:00 · Chirchiq', value: 'Yuqori', color: '#f97316' },
    { label: 'Shaxsiy himoya vositasisiz ishlash', sub: '05.06, 08:42 · Angren', value: "O'rta", color: GC.amber },
    { label: "Mehnat muhofazasi yo'riqnomasi buzildi", sub: '04.06, 19:01 · Ohangaron', value: "O'rta", color: GC.amber },
    { label: 'Balandlikda xavfsiz ishlash buzildi', sub: '04.06, 15:20 · Ingichka', value: 'Yuqori', color: '#f97316' },
    { label: "Elektr qurilmasi ruxsatsiz ochildi", sub: '03.06, 13:05 · Navoiy GTR-1', value: 'Past', color: GC.green },
];

const AI_FORECASTS: BigForecast[] = [
    { text: 'Chirchiqda keyingi 7 kunda holatlar 30% ga oshishi mumkin', detail: "Ta'mirlash ishlari va pudratchilar soni oshgan", confidence: 72, color: GC.red },
    { text: 'SLA bajarilishi oy oxirida 93% ga chiqadi', detail: "Muddati o'tgan 9 ta holatdan 6 tasi yopilmoqda", confidence: 78, color: GC.green },
    { text: "Tungi smenada SHHV buzilishlari ko'payadi", detail: "22:00–04:00 oralig'ida 2,1 barobar ko'p", confidence: 66, color: GC.amber },
    { text: "Pudratchilar orasida jarohat xavfi yuqori", detail: 'TRIR 0,45 — xodimlardan 1,6 barobar yuqori', confidence: 61, color: '#f97316' },
    { text: 'Jarohatsiz kunlar 250 dan oshadi', detail: 'Joriy tendensiya saqlansa', confidence: 70, color: GC.accent1 },
];

const lineDs = (label: string, data: number[], color: string, fill = false) => ({
    label, data, borderColor: color, backgroundColor: alpha(color, 0.18),
    borderWidth: 2, tension: 0.35, pointRadius: 0, fill,
});
const barDs = (label: string, data: number[], color: string | string[], extra: object = {}) => ({
    label, data, backgroundColor: color, borderRadius: 4, barPercentage: 0.78, ...extra,
});

const Card: React.FC<{ title: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ title, style, children }) => (
    <BigCard title={title} style={{ ...bigDemoCardStyle, ...style }}>{children}</BigCard>
);

const HseSlaBig: React.FC = () => (
    <BigDashRoot>
        <DashHeader
            title="HSE nazorati va SLA"
            subtitle="Mehnat xavfsizligi, sog'liq va atrof-muhit — Guard reyestri"
            dateRange="2026-yil, 7-may — 5-iyun"
        />

        {/* ── KPI qatori: 10 ta karta ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0 }}>
            <BigKpiCard title="Jami holatlar" value="148" delta={-8.6} iconColor={GC.accent2} />
            <BigKpiCard title="Ochiq holatlar" value="37" delta={-12.4} iconColor={GC.accent1} />
            <BigKpiCard title="SLA muddati o'tgan" value="9" delta={-25} iconColor={GC.amber} />
            <BigKpiCard title="Kritik holatlar" value="4" delta={-33.3} iconColor={GC.red} />
            <BigKpiCard title="SLA bajarilishi" value="91,2%" delta={3.8} iconColor={GC.green} />
            <BigKpiCard title="LTIFR" value="0,28" delta={-12.5} iconColor={GC.violet} />
            <BigKpiCard title="Jarohatsiz kunlar" value="214" iconColor={GC.green} />
            <BigKpiCard title="Nazoratdagi xodimlar" value="9 450" delta={1.9} iconColor={GC.accent3} />
            <BigKpiCard title="Tekshiruvlar" value="326" delta={11.2} iconColor={GC.accent1} />
            <BigKpiCard title="SHHV bilan ta'minlanganlik" value="97,4%" delta={1.2} iconColor={GC.amber} />
        </div>

        <div style={{
            flex: 1, minHeight: 0, display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(4, minmax(0, 1fr))', gap: 10,
        }}>
            {/* ═══ 1-qator: holatlar oqimi ═══ */}
            <Card title="HSE holatlari dinamikasi — 30 kun" style={{ gridColumn: 'span 2' }}>
                <BigChartBox>
                    <Line data={{
                        labels: DAYS,
                        datasets: [
                            lineDs('Jami holatlar', [4, 6, 5, 7, 5, 3, 2, 6, 7, 8, 5, 6, 4, 3, 5, 6, 7, 4, 5, 6, 4, 3, 2, 5, 6, 4, 5, 5, 6, 4], GC.accent2, true),
                            lineDs('Kritik', [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0], GC.red),
                            lineDs("SLA muddati o'tgan", [0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1], GC.amber),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any} />
                </BigChartBox>
            </Card>

            <Card title="Xavf darajasi">
                <BigDonutBody parts={RISK} center="148" centerSub="holat" formatValue={(v) => String(v)} />
            </Card>

            <Card title="Holatlar ko'rib chiqish bosqichlari">
                <BigFunnel steps={[
                    { label: "Ro'yxatga olindi", value: 148, color: GC.accent2 },
                    { label: 'HR ga yuborildi', value: 131, color: GC.accent1 },
                    { label: "Ko'rib chiqilmoqda", value: 124, color: GC.violet },
                    { label: 'Chora belgilandi', value: 118, color: GC.amber },
                    { label: 'Yopildi', value: 111, color: GC.green },
                ]} />
            </Card>

            <Card title="SLA bajarilishi">
                <BigGauge
                    value={91.2} display="91,2%" caption="maqsad — 95%" color={GC.green}
                    rows={[
                        { label: 'Muddatida', value: '135', color: GC.green },
                        { label: 'Xavf ostida', value: '4', color: GC.amber },
                        { label: "O'tgan", value: '9', color: GC.red },
                    ]}
                />
            </Card>

            <Card title="Maydonlar bo'yicha holatlar">
                <BigChartBox>
                    <Bar data={{
                        labels: ['Markaziy apparat', 'Chirchiq', 'Angren', 'Ohangaron', 'Ingichka', 'Miskon', 'Navoiy GTR-1', 'Nurobod'],
                        datasets: [barDs('Holatlar', [34, 28, 21, 19, 16, 12, 11, 7], GC.accent1)],
                    }} options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Xabar manbalari">
                <BigDonutBody
                    parts={[
                        { label: 'Inspektor', value: 52, color: GC.accent1 },
                        { label: 'AI videotahlil', value: 41, color: GC.violet },
                        { label: 'Guard kameralari', value: 33, color: GC.accent2 },
                        { label: 'Xodim xabari', value: 22, color: GC.amber },
                    ]}
                    center="148" centerSub="xabar" formatValue={false}
                />
            </Card>

            {/* ═══ 2-qator: qoidabuzarliklar va SLA ═══ */}
            <Card title="Qoidabuzarlik turlari">
                <BigChartBox>
                    <Bar data={{
                        labels: ['Texnika xavfsizligi', "Yong'in xavfsizligi", 'Mehnat muhofazasi', 'SHHVsiz ishlash', 'Balandlikda ishlash', 'Elektr xavfsizligi'],
                        datasets: [barDs('Holatlar', [42, 31, 27, 24, 14, 10], [GC.red, '#f97316', GC.amber, GC.accent1, GC.violet, GC.accent2])],
                    }} options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Heinrich piramidasi (teskari)">
                <BigPyramid levels={[
                    { label: 'Xavfli vaziyatlar', value: 312, color: GC.accent3 },
                    { label: 'Xavfsizlik buzilishlari', value: 148, color: GC.accent1 },
                    { label: 'Birinchi yordam', value: 37, color: GC.violet },
                    { label: 'Yengil jarohatlar', value: 9, color: GC.amber },
                    { label: "Og'ir jarohatlar", value: 1, color: GC.red },
                ]} />
            </Card>

            <Card title="SLA holati — haftalar bo'yicha">
                <BigChartBox>
                    <Bar data={{
                        labels: ['1-hafta', '2-hafta', '3-hafta', '4-hafta', '5-hafta'],
                        datasets: [
                            barDs('Muddatida', [28, 32, 27, 29, 19], GC.green),
                            barDs('Xavf ostida', [1, 1, 1, 0, 1], GC.amber),
                            barDs("Muddati o'tgan", [3, 2, 2, 1, 1], GC.red),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ stacked: true }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="O'rtacha javob vaqti, soat">
                <BigChartBox>
                    <Bar data={{
                        labels: ['Kritik', 'Yuqori', "O'rta", 'Past'],
                        datasets: [
                            barDs('Haqiqiy', [1.6, 5.2, 21, 46], [GC.red, '#f97316', GC.amber, GC.green]),
                            barDs('SLA me\'yori', [2, 8, 24, 72], alpha(GC.slate, 0.7)),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any} />
                </BigChartBox>
            </Card>

            <Card title="Bo'limlar xavfsizlik indeksi">
                <BigProgressList items={[
                    { label: 'Boyitish fabrikasi', value: 94, display: '94', color: GC.green, target: 90 },
                    { label: 'Eritish sexi', value: 81, display: '81', color: GC.amber, target: 90 },
                    { label: 'Kon ishlari', value: 76, display: '76', color: '#f97316', target: 90 },
                    { label: 'Transport sexi', value: 88, display: '88', color: GC.accent1, target: 90 },
                    { label: 'Energetika bloki', value: 91, display: '91', color: GC.green, target: 90 },
                ]} />
            </Card>

            <Card title="Tekshiruvlar: reja va ijro">
                <BigChartBox>
                    <Bar data={{
                        labels: MONTHS,
                        datasets: [
                            barDs('Reja', [52, 55, 58, 54, 56, 60], alpha(GC.slate, 0.8)),
                            barDs('Ijro', [49, 55, 51, 54, 58, 59], GC.accent1),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any} />
                </BigChartBox>
            </Card>

            <Card title="Shaxsiy himoya vositalari nazorati">
                <BigProgressList items={[
                    { label: 'Himoya kaskasi', value: 99, display: '99%', color: GC.green },
                    { label: 'Signal jileti', value: 98, display: '98%', color: GC.green },
                    { label: "Qo'lqop", value: 95, display: '95%', color: GC.accent1 },
                    { label: "Himoya ko'zoynagi", value: 91, display: '91%', color: GC.amber },
                    { label: 'Respirator', value: 87, display: '87%', color: '#f97316' },
                ]} />
            </Card>

            {/* ═══ 3-qator: jarohatlar va vaqt kesimi ═══ */}
            <Card title="Jarohatlanish: LTIFR va TRIR">
                <BigChartBox>
                    <Line data={{
                        labels: MONTHS,
                        datasets: [
                            lineDs('LTIFR', [0.41, 0.38, 0.36, 0.33, 0.3, 0.28], GC.violet, true),
                            lineDs('TRIR', [0.92, 0.88, 0.83, 0.79, 0.74, 0.7], GC.red),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ decimals: 1 }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Maydon × qoidabuzarlik turi" style={{ gridColumn: 'span 2' }}>
                <BigHeatmap
                    rows={['Markaziy apparat', 'Chirchiq', 'Angren', 'Ohangaron', 'Ingichka', 'Miskon']}
                    cols={['Texnika', "Yong'in", 'Mehnat', 'SHHV', 'Balandlik', 'Elektr']}
                    values={[[11, 8, 7, 4, 2, 2], [8, 6, 5, 5, 3, 1], [6, 4, 4, 3, 3, 1], [5, 4, 3, 4, 2, 1], [4, 3, 3, 3, 2, 1], [3, 2, 2, 2, 1, 1]]}
                    color={GC.red}
                />
            </Card>

            <Card title="Holatlar — kun soatlari bo'yicha">
                <BigChartBox>
                    <Bar data={{
                        labels: ['00–04', '04–08', '08–12', '12–16', '16–20', '20–24'],
                        datasets: [barDs('Holatlar', [21, 17, 38, 33, 24, 15], [GC.violet, GC.accent1, GC.red, '#f97316', GC.amber, GC.violet])],
                    }} options={{ ...chartBase, ...noLegend, scales: bigScales() } as any} plugins={[bigBarLabel(0)]} />
                </BigChartBox>
            </Card>

            <Card title="Hafta kunlari bo'yicha">
                <BigChartBox>
                    <Bar data={{
                        labels: ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'],
                        datasets: [barDs('Holatlar', [26, 24, 22, 23, 27, 17, 9], GC.accent2)],
                    }} options={{ ...chartBase, ...noLegend, scales: bigScales() } as any} plugins={[bigBarLabel(0)]} />
                </BigChartBox>
            </Card>

            <Card title="O'qitish va yo'riqnomalar">
                <BigProgressList items={[
                    { label: 'Kirish yo\'riqnomasi', value: 100, display: '100%', color: GC.green },
                    { label: 'Takroriy yo\'riqnoma', value: 94, display: '94%', color: GC.green },
                    { label: 'Birinchi yordam kursi', value: 82, display: '82%', color: GC.accent1 },
                    { label: "Yong'in-texnik minimum", value: 88, display: '88%', color: GC.amber },
                    { label: 'Balandlikda ishlash', value: 76, display: '76%', color: '#f97316' },
                ]} />
            </Card>

            <Card title="Naryad-ruxsatnomalar">
                <BigDonutBody
                    parts={[
                        { label: 'Faol', value: 184, color: GC.accent1 },
                        { label: 'Yopilgan', value: 1320, color: GC.green },
                        { label: "Muddati o'tgan", value: 7, color: GC.red },
                    ]}
                    center="1 511" centerSub="ruxsatnoma" formatValue={(v) => String(v)}
                />
            </Card>

            {/* ═══ 4-qator: choralar, pudratchilar, AI ═══ */}
            <Card title="So'nggi HSE holatlari" style={{ gridColumn: 'span 2' }}>
                <BigRowList rows={RECENT_CASES} />
            </Card>

            <Card title="Tuzatuvchi choralar">
                <BigDonutBody
                    parts={[
                        { label: 'Bajarilgan', value: 212, color: GC.green },
                        { label: 'Jarayonda', value: 58, color: GC.accent1 },
                        { label: "Muddati o'tgan", value: 14, color: GC.red },
                    ]}
                    center="284" centerSub="chora" formatValue={(v) => String(v)}
                />
            </Card>

            <Card title="Pudratchilar xavfsizligi, TRIR">
                <BigChartBox>
                    <Bar data={{
                        labels: ['Qurilish-montaj', "Ta'mirlash", 'Transport', 'Burg\'ulash', 'Tozalash'],
                        datasets: [barDs('TRIR', [0.62, 0.51, 0.44, 0.39, 0.21], [GC.red, '#f97316', GC.amber, GC.amber, GC.green])],
                    }} options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true, decimals: 1 }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Dalillar va kuzatuv">
                <BigStatGrid items={[
                    { label: 'Foto dalillar', value: '412', color: GC.accent1 },
                    { label: 'Video yozuvlar', value: '57', color: GC.violet },
                    { label: 'Guard kameralari', value: '128', sub: '124 onlayn', color: GC.accent2 },
                    { label: 'AI aniqlashlar', value: '64', sub: 'shu oyda', color: GC.amber },
                ]} />
            </Card>

            <Card title="Tibbiy ko'riklar">
                <BigProgressList items={[
                    { label: 'Davriy tibbiy ko\'rik', value: 96, display: '96%', color: GC.green },
                    { label: 'Smena oldi ko\'rigi', value: 99, display: '99%', color: GC.green },
                    { label: 'Kasb kasalliklari skriningi', value: 84, display: '84%', color: GC.accent1 },
                    { label: 'Emlash qamrovi', value: 78, display: '78%', color: GC.amber },
                ]} />
            </Card>

            <Card title="Sun'iy intellekt prognozlari">
                <BigForecastList items={AI_FORECASTS} />
            </Card>
        </div>
    </BigDashRoot>
);

export default HseSlaBig;
