import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { chartBase, noLegend, DashHeader } from '../../components/dashboardUI';
import {
    BigCard, BigKpiCard, BigDashRoot, legendLarge, bigBarLabel,
    BigChartBox, BigDonutBody, BigForecastList, bigScales, bigDemoCardStyle,
    BigProgressList, BigStatGrid, BigRowList, BigGauge, BigFunnel,
    type BigForecast,
} from '../../components/dashboardUILarge';
import { GC, alpha } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   MARKETING, BREND, PR VA INVESTORLAR — TO'LIQ EKRAN (36 ta karta)

   Uslub FinanceNewMain / SingleTreasury bilan bir xil: `BigDashRoot` +
   `DashHeader` + 10 ta `BigKpiCard` + 7 ustun × 4 qatorli `BigCard` to'ri.

   MA'LUMOT: marketing bo'yicha API yo'q — barcha kartalar namuna
   ma'lumotdan quriladi va SARIQ ramka bilan belgilanadi.
   ══════════════════════════════════════════════════════════════════════════ */

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn'];
const ORANGE = '#f97316';

const AI_FORECASTS: BigForecast[] = [
    { text: 'TIIF 2026 dan keyin eslatmalar 35% ga oshadi', detail: 'O\'tgan forumlar tajribasi asosida', confidence: 79, color: GC.accent1 },
    { text: 'Investorlar ishonchi indeksi 85 ga yetadi', detail: '3 ta yangi anglashuv memorandumi kutilmoqda', confidence: 71, color: GC.green },
    { text: 'Salbiy tonallik ulushi 7% dan pastga tushadi', detail: 'Ekologik hisobot e\'lon qilinishi hisobiga', confidence: 64, color: GC.violet },
    { text: 'Sayt trafigi iyulda 150 mingdan oshadi', detail: '"Investorlar" bo\'limiga qiziqish o\'smoqda', confidence: 68, color: GC.accent2 },
    { text: 'Soxta xabar tarqalish xavfi — o\'rtacha', detail: 'Narxlar mavzusida 2 ta shubhali manba', confidence: 57, color: GC.amber },
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

const MarketingDetail: React.FC = () => (
    <BigDashRoot>
        <DashHeader
            title="Marketing, brend, PR va investorlar"
            subtitle="Reputatsiya, investorlar bilan aloqa, raqamli brend va inqiroz kommunikatsiyalari"
            dateRange="2026-yil, 1-yanvar — 30-iyun"
        />

        {/* ── KPI qatori: 10 ta karta ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0 }}>
            <BigKpiCard title="Brend reputatsiya indeksi" value="78,4" delta={5.2} iconColor={GC.accent1} />
            <BigKpiCard title="Ijobiy tonallik" value="68%" delta={4.1} iconColor={GC.green} />
            <BigKpiCard title="Media qamrovi" value="256 mln" delta={6.3} iconColor={GC.accent2} />
            <BigKpiCard title="Investorlar ishonchi" value="82,1" delta={6.3} iconColor={GC.violet} />
            <BigKpiCard title="Sayt tashriflari" value="128 ming" delta={12.4} iconColor={GC.accent3} />
            <BigKpiCard title="Faol hamkorliklar" value="31" delta={24} iconColor={GC.amber} />
            <BigKpiCard title="Tadbirlar va forumlar" value="18" delta={28.6} iconColor={GC.magenta} />
            <BigKpiCard title="Ovoz ulushi" value="12,6%" delta={2.1} iconColor={GC.accent1} />
            <BigKpiCard title="Dunyo bo'ylab eslatmalar" value="18,7 ming" delta={8.1} iconColor={GC.accent2} />
            <BigKpiCard title="Brend qiymati" value="84/100" delta={3.7} iconColor={GC.green} />
        </div>

        <div style={{
            flex: 1, minHeight: 0, display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(4, minmax(0, 1fr))', gap: 10,
        }}>
            {/* ═══ 1-qator: reputatsiya va media ═══ */}
            <Card title="Eslatmalar va tonallik — oylar bo'yicha, ming" style={{ gridColumn: 'span 2' }}>
                <BigChartBox>
                    <Bar data={{
                        labels: MONTHS,
                        datasets: [
                            barDs('Ijobiy', [1.62, 1.84, 1.96, 2.18, 2.31, 2.62], GC.green),
                            barDs('Neytral', [0.62, 0.66, 0.71, 0.74, 0.8, 0.86], GC.slate),
                            barDs('Salbiy', [0.24, 0.22, 0.21, 0.2, 0.19, 0.18], GC.red),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ stacked: true, decimals: 1 }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Tonallik taqsimoti">
                <BigDonutBody
                    parts={[
                        { label: 'Ijobiy', value: 68, color: GC.green },
                        { label: 'Neytral', value: 24, color: GC.slate },
                        { label: 'Salbiy', value: 8, color: GC.red },
                    ]}
                    center="18,7" centerSub="ming eslatma" formatValue={false}
                />
            </Card>

            <Card title="Media kanallar ulushi">
                <BigDonutBody
                    parts={[
                        { label: 'Onlayn OAV', value: 42, color: GC.accent1 },
                        { label: 'Ijtimoiy tarmoqlar', value: 31, color: GC.accent2 },
                        { label: 'TV va radio', value: 18, color: GC.violet },
                        { label: 'Bosma nashrlar', value: 9, color: GC.amber },
                    ]}
                    center="256" centerSub="mln qamrov" formatValue={false}
                />
            </Card>

            <Card title="Reputatsiya indeksi va soha o'rtachasi">
                <BigChartBox>
                    <Line data={{
                        labels: MONTHS,
                        datasets: [
                            lineDs("O'zTMK", [72.1, 73.4, 74.8, 75.9, 77.2, 78.4], GC.accent1, true),
                            lineDs("Soha o'rtachasi", [70.2, 70.5, 70.9, 71.2, 71.4, 71.8], GC.slate),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ beginAtZero: false }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Ovoz ulushi — sohada, %">
                <BigChartBox>
                    <Bar data={{
                        labels: ["O'zTMK", 'Raqobatchi A', 'Raqobatchi B', 'Raqobatchi C', 'Boshqalar'],
                        datasets: [barDs('Ulush', [12.6, 21.3, 18.4, 9.7, 38], [GC.accent1, GC.slate, GC.slate, GC.slate, alpha(GC.slate, 0.6)])],
                    }} options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Brend salomatligi">
                <BigProgressList items={[
                    { label: 'Taniqlilik', value: 74, display: '74%', color: GC.accent1, target: 80 },
                    { label: 'Ishonch', value: 81, display: '81%', color: GC.green, target: 80 },
                    { label: 'Tavsiya etish (NPS)', value: 62, display: '62', color: GC.violet, target: 70 },
                    { label: "Afzal ko'rish", value: 58, display: '58%', color: GC.amber, target: 65 },
                    { label: 'Ish beruvchi brendi', value: 77, display: '77%', color: GC.accent2, target: 75 },
                ]} />
            </Card>

            {/* ═══ 2-qator: investorlar va raqamli brend ═══ */}
            <Card title="Investorlar voronkasi">
                <BigFunnel steps={[
                    { label: 'Investor lidlari', value: 156, color: GC.accent2 },
                    { label: 'Chuqur tekshiruv', value: 78, color: GC.accent1 },
                    { label: 'Maxfiylik kelishuvi', value: 42, color: GC.violet },
                    { label: 'Memorandum', value: 24, color: GC.amber },
                    { label: 'Investloyihalar', value: 9, color: GC.green },
                ]} />
            </Card>

            <Card title="Investorlar — mamlakatlar bo'yicha">
                <BigDonutBody
                    parts={[
                        { label: 'Xitoy', value: 38, color: GC.red },
                        { label: 'BAA', value: 27, color: GC.amber },
                        { label: 'Germaniya', value: 21, color: GC.accent1 },
                        { label: 'Koreya', value: 18, color: GC.violet },
                        { label: 'Turkiya', value: 15, color: GC.accent2 },
                        { label: 'Boshqalar', value: 37, color: GC.slate },
                    ]}
                    center="156" centerSub="lid" formatValue={false}
                />
            </Card>

            <Card title="Investorlar kayfiyati">
                <BigGauge
                    value={82.1} display="82,1" caption="ishonch indeksi" color={GC.violet}
                    rows={[
                        { label: 'Ijobiy', value: '71%', color: GC.green },
                        { label: 'Neytral', value: '23%' },
                        { label: 'Salbiy', value: '6%', color: GC.red },
                    ]}
                />
            </Card>

            <Card title="Sayt trafigi, ming" style={{ gridColumn: 'span 2' }}>
                <BigChartBox>
                    <Line data={{
                        labels: MONTHS,
                        datasets: [
                            lineDs('Tashriflar', [84, 92, 101, 108, 117, 128], GC.accent1, true),
                            lineDs("Sahifa ko'rishlar", [214, 231, 252, 270, 291, 312], GC.accent2),
                            lineDs('Yangi foydalanuvchilar', [51, 56, 60, 66, 71, 78], GC.green),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any} />
                </BigChartBox>
            </Card>

            <Card title="Trafik manbalari">
                <BigDonutBody
                    parts={[
                        { label: 'Qidiruv tizimlari', value: 41, color: GC.accent1 },
                        { label: "To'g'ridan-to'g'ri", value: 24, color: GC.green },
                        { label: 'Ijtimoiy tarmoqlar', value: 19, color: GC.accent2 },
                        { label: 'Havolalar', value: 10, color: GC.violet },
                        { label: 'Reklama', value: 6, color: GC.amber },
                    ]}
                    center="128" centerSub="ming" formatValue={false}
                />
            </Card>

            <Card title="Tashriflar — mamlakatlar, %">
                <BigChartBox>
                    <Bar data={{
                        labels: ["O'zbekiston", "Qozog'iston", 'AQSh', 'Rossiya', 'Germaniya', 'Xitoy'],
                        datasets: [barDs('Ulush', [28, 14, 11, 9, 7, 6], GC.accent2)],
                    }} options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any} />
                </BigChartBox>
            </Card>

            {/* ═══ 3-qator: ijtimoiy tarmoqlar, kontent, byudjet ═══ */}
            <Card title="Obunachilar, ming">
                <BigChartBox>
                    <Bar data={{
                        labels: ['Telegram', 'Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'X'],
                        datasets: [barDs('Obunachilar', [86, 64, 41, 23, 18, 9], [GC.accent2, GC.magenta, GC.accent1, GC.accent3, GC.red, GC.slate])],
                    }} options={{ ...chartBase, ...noLegend, scales: bigScales() } as any} plugins={[bigBarLabel(0)]} />
                </BigChartBox>
            </Card>

            <Card title="Jalb qilish darajasi, %">
                <BigChartBox>
                    <Bar data={{
                        labels: ['Instagram', 'Telegram', 'LinkedIn', 'YouTube', 'Facebook', 'X'],
                        datasets: [barDs('Jalb qilish', [5.8, 4.9, 3.6, 3.1, 2.2, 1.4], GC.violet)],
                    }} options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Eng ko'p ko'rilgan bo'limlar, ming">
                <BigChartBox>
                    <Bar data={{
                        labels: ['Investorlar', 'Loyihalar', 'Barqaror rivojlanish', 'Media markaz', 'Karyera', 'Aloqa'],
                        datasets: [barDs("Ko'rishlar", [18.7, 15.2, 12.9, 10.1, 8.4, 5.2], GC.accent1)],
                    }} options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Kontent turlari samaradorligi">
                <BigChartBox>
                    <Bar data={{
                        labels: ['Video', 'Infografika', 'Maqola', 'Press-reliz', 'Podkast'],
                        datasets: [
                            barDs('Qamrov, ming', [412, 286, 198, 164, 72], GC.accent2),
                            barDs('Reaksiyalar, ming', [38, 29, 14, 9, 6], GC.amber),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any} />
                </BigChartBox>
            </Card>

            <Card title="Marketing byudjeti ijrosi">
                <BigDonutBody
                    parts={[
                        { label: 'Raqamli marketing', value: 34, color: GC.accent1 },
                        { label: 'Tadbirlar', value: 27, color: GC.amber },
                        { label: 'PR va media', value: 19, color: GC.violet },
                        { label: 'Brending', value: 12, color: GC.accent2 },
                        { label: 'Tadqiqotlar', value: 8, color: GC.slate },
                    ]}
                    center="72%" centerSub="ijro" formatValue={false}
                />
            </Card>

            <Card title="Kampaniyalar samaradorligi (ROI), %">
                <BigChartBox>
                    <Bar data={{
                        labels: ['Investor roadshow', 'Yashil metall', 'Karyera markazi', 'Mahalliy mahsulot', 'Brend yangilanishi'],
                        datasets: [barDs('ROI', [248, 186, 142, 118, 74], [GC.green, GC.green, GC.accent1, GC.accent1, GC.amber])],
                    }} options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Press-relizlar va nashrlar">
                <BigChartBox>
                    <Bar data={{
                        labels: MONTHS,
                        datasets: [
                            barDs('Press-relizlar', [6, 8, 7, 9, 11, 12], GC.accent1),
                            barDs('Nashrlar', [42, 51, 48, 63, 71, 84], GC.accent2),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any} />
                </BigChartBox>
            </Card>

            {/* ═══ 4-qator: tadbirlar, inqiroz, AI ═══ */}
            <Card title="Tadbirlar va forumlar">
                <BigRowList rows={[
                    { label: 'TIIF 2026', sub: 'Toshkent · 15–17 iyun', value: 'Ishtirok', color: GC.green },
                    { label: 'Mining World Asia', sub: 'Toshkent · 9–11 sentabr', value: 'Stend', color: GC.accent1 },
                    { label: 'PDAC 2026', sub: 'Toronto · 1–4 mart', value: "O'tdi", color: GC.slate },
                    { label: 'LME Asia Metals Seminar', sub: 'Gonkong · 12 noyabr', value: 'Reja', color: GC.amber },
                    { label: 'Innoprom Markaziy Osiyo', sub: 'Toshkent · 28–30 aprel', value: "O'tdi", color: GC.slate },
                ]} />
            </Card>

            <Card title="Inqiroz kommunikatsiyalari">
                <BigStatGrid items={[
                    { label: 'Monitoring', value: '24/7', sub: 'faol', color: GC.green },
                    { label: 'Reputatsion hodisalar', value: '3', sub: 'shu oyda', color: GC.amber },
                    { label: 'Media insidentlar', value: '2', sub: 'hal etildi', color: GC.accent1 },
                    { label: 'Soxta xabarlar', value: '1', sub: 'nazoratda', color: GC.red },
                ]} />
            </Card>

            <Card title="Reputatsion xavf">
                <BigGauge
                    value={18} display="18" caption="past xavf (0–100)" color={GC.green}
                    rows={[
                        { label: 'Past', value: '0–30', color: GC.green },
                        { label: "O'rta", value: '31–60', color: GC.amber },
                        { label: 'Yuqori', value: '61+', color: GC.red },
                    ]}
                />
            </Card>

            <Card title="Media so'rovlariga javob vaqti, daqiqa">
                <BigChartBox>
                    <Line data={{
                        labels: MONTHS,
                        datasets: [
                            lineDs('Javob vaqti', [34, 31, 27, 24, 21, 18], ORANGE, true),
                            lineDs('Maqsad', [20, 20, 20, 20, 20, 20], GC.green),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any} />
                </BigChartBox>
            </Card>

            <Card title="ESG idroki — jamoatchilik fikri">
                <BigProgressList items={[
                    { label: 'Ekologik mas\'uliyat', value: 78, display: '78%', color: GC.green },
                    { label: 'Ijtimoiy hissa', value: 84, display: '84%', color: GC.accent1 },
                    { label: 'Korporativ boshqaruv', value: 76, display: '76%', color: GC.violet },
                    { label: 'Shaffoflik', value: 71, display: '71%', color: GC.amber },
                ]} />
            </Card>

            <Card title="Hamkorliklar yo'nalishlari">
                <BigDonutBody
                    parts={[
                        { label: 'Investitsiya', value: 11, color: GC.accent1 },
                        { label: 'Texnologiya', value: 8, color: GC.violet },
                        { label: "Ta'lim", value: 6, color: GC.green },
                        { label: 'Savdo', value: 4, color: GC.amber },
                        { label: 'Media', value: 2, color: GC.accent2 },
                    ]}
                    center="31" centerSub="hamkorlik" formatValue={(v) => String(v)}
                />
            </Card>

            <Card title="Sun'iy intellekt prognozlari">
                <BigForecastList items={AI_FORECASTS} />
            </Card>
        </div>
    </BigDashRoot>
);

export default MarketingDetail;
