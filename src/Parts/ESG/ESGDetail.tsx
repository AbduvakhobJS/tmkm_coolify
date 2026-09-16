import React, { useEffect, useRef } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { C, chartBase, noLegend, DashHeader } from '../../components/dashboardUI';
import {
    BigCard, BigKpiCard, BigDashRoot, legendLarge, bigBarLabel,
    BigChartBox, BigDonutBody, BigForecastList, bigScales, bigDemoCardStyle,
    BigProgressList, BigStatGrid, BigHeatmap, BigRowList, BigPyramid, BigGauge,
    type BigForecast,
} from '../../components/dashboardUILarge';
import { GC, alpha } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   ESG — BATAFSIL (35 ta karta)

   Uslub FinanceNewMain / SingleTreasury bilan bir xil: `BigDashRoot` +
   `DashHeader` + 10 ta `BigKpiCard` + 7 ustun × 4 qatorli `BigCard` to'ri
   (xarita 2×2 katakni egallaydi). Ekran to'liq to'ladi, scroll yo'q.

   MA'LUMOT: ESG bo'yicha API yo'q — barcha kartalar namuna ma'lumotdan
   quriladi va SARIQ ramka bilan belgilanadi. Matnlar o'zbek (lotin) tilida.
   ══════════════════════════════════════════════════════════════════════════ */

const MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
const QUARTERS = ['1-chorak', '2-chorak', '3-chorak', '4-chorak'];

type Site = { name: string; lon: number; lat: number; status: 'ok' | 'attention' | 'risk' };

const STATUS_COLOR: Record<Site['status'], string> = { ok: GC.green, attention: GC.amber, risk: GC.red };
const STATUS_LABEL: Record<Site['status'], string> = { ok: 'Ishlamoqda', attention: 'Diqqat talab', risk: 'Xavf zonasida' };

const SITES: Site[] = [
    { name: 'Toshkent', lon: 69.24, lat: 41.31, status: 'ok' },
    { name: 'Olmaliq', lon: 69.60, lat: 40.84, status: 'ok' },
    { name: 'Angren', lon: 70.14, lat: 41.02, status: 'ok' },
    { name: 'Navoiy', lon: 65.38, lat: 40.10, status: 'ok' },
    { name: 'Zarafshon', lon: 64.20, lat: 41.57, status: 'attention' },
    { name: 'Uchquduq', lon: 63.55, lat: 42.15, status: 'ok' },
    { name: 'Buxoro', lon: 64.42, lat: 39.77, status: 'ok' },
    { name: 'Samarqand', lon: 66.96, lat: 39.65, status: 'ok' },
    { name: 'Ingichka', lon: 66.70, lat: 39.90, status: 'risk' },
    { name: 'Qarshi', lon: 65.79, lat: 38.86, status: 'ok' },
    { name: 'Termiz', lon: 67.28, lat: 37.22, status: 'attention' },
    { name: 'Nukus', lon: 59.61, lat: 42.46, status: 'ok' },
    { name: "Farg'ona", lon: 71.78, lat: 40.38, status: 'ok' },
    { name: 'Namangan', lon: 71.67, lat: 41.00, status: 'ok' },
    { name: 'Andijon', lon: 72.34, lat: 40.78, status: 'ok' },
    { name: 'Jizzax', lon: 67.84, lat: 40.12, status: 'ok' },
    { name: 'Chirchiq', lon: 69.58, lat: 41.47, status: 'risk' },
    { name: 'Nurota', lon: 65.69, lat: 40.56, status: 'attention' },
];

/* ── Xarita markerlari: pulsatsiyalanuvchi halqa + hover kattalashuvi ── */
const ESG_MARKER_CSS = `
@keyframes esgPulse { 0% { transform: scale(0.75); opacity: 0.85; } 70% { transform: scale(2.4); opacity: 0; } 100% { opacity: 0; } }
.esg-marker { position: relative; width: 22px; height: 22px; cursor: pointer; }
.esg-marker__ring { position: absolute; inset: 0; border-radius: 50%; animation: esgPulse 2.4s ease-out infinite; }
.esg-marker__dot {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    width: 13px; height: 13px; border-radius: 50%;
    border: 2px solid rgba(10,15,29,0.92);
    transition: width .15s ease, height .15s ease, box-shadow .15s ease;
}
.esg-marker:hover .esg-marker__dot { width: 19px; height: 19px; }
.esg-marker__label {
    position: absolute; left: 50%; top: -8px; transform: translate(-50%, -100%);
    background: rgba(2,11,24,0.92); border: 1px solid rgba(255,255,255,0.18);
    border-radius: 6px; padding: 3px 8px; white-space: nowrap;
    font-size: 12px; font-weight: 600; color: #e7f1ff;
    opacity: 0; pointer-events: none; transition: opacity .15s ease;
}
.esg-marker:hover .esg-marker__label { opacity: 1; }
`;

const EsgMap: React.FC<{ sites: Site[] }> = ({ sites }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;
        const map = new maplibregl.Map({
            container: containerRef.current,
            style: 'https://api.maptiler.com/maps/019de83b-bc0c-7558-9ffe-1761aa83c410/style.json?key=YqciQrrpszIp23MCz2am',
            center: [65.8, 40.4],
            zoom: 5.3,
            pitch: 0,
            attributionControl: false,
            interactive: true,
        });
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();

        /* Markerlar `load` hodisasini KUTMAYDI: ular oddiy DOM overlaylari,
           uslub (tiles) yuklanmasa ham ko'rinishi kerak. */
        sites.forEach((s) => {
            const color = STATUS_COLOR[s.status];
            const el = document.createElement('div');
            el.className = 'esg-marker';
            el.innerHTML = `
                <span class="esg-marker__ring" style="background:${alpha(color, 0.45)}"></span>
                <span class="esg-marker__dot" style="background:${color}; box-shadow:0 0 10px 2px ${alpha(color, 0.8)}"></span>
                <span class="esg-marker__label">${s.name} · ${STATUS_LABEL[s.status]}</span>
            `;
            const popup = new maplibregl.Popup({ offset: 18, closeButton: false, className: 'esg-popup' })
                .setHTML(`
                    <div style="font-family:'Segoe UI',system-ui,sans-serif;min-width:150px">
                        <div style="font-size:15px;font-weight:700;color:#e7f1ff;margin-bottom:5px">${s.name}</div>
                        <div style="display:flex;align-items:center;gap:6px;font-size:13px;color:${color}">
                            <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block"></span>
                            ${STATUS_LABEL[s.status]}
                        </div>
                        <div style="font-size:12px;color:#8aa0b8;margin-top:5px">${s.lat.toFixed(2)}, ${s.lon.toFixed(2)}</div>
                    </div>
                `);
            new maplibregl.Marker({ element: el, anchor: 'center' })
                .setLngLat([s.lon, s.lat])
                .setPopup(popup)
                .addTo(map);
        });

        mapRef.current = map;
        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [sites]);

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

/* ── Namuna ma'lumotlar ── */
const SUMMARY = { total: 139, ok: 122, attention: 12, risk: 5 };

const AI_FORECASTS: BigForecast[] = [
    { text: "CO₂ chiqindilari yil oxirigacha 1,38 mln t gacha kamayadi", detail: 'Quyosh stansiyalari ishga tushishi hisobiga', confidence: 81, color: GC.green },
    { text: "Ingichka obyektida suv sifati me'yordan chiqishi mumkin", detail: "So'nggi 3 oyda o'sish tendensiyasi", confidence: 67, color: GC.red },
    { text: 'IRMA muvofiqligi 4-chorakda 82% ga yetadi', detail: 'Audit tavsiyalarining 70% bajarilgan', confidence: 74, color: GC.accent1 },
    { text: "Qayta tiklanuvchi energiya ulushi 40% dan oshadi", detail: '2027-yil 1-chorak prognozi', confidence: 62, color: GC.amber },
    { text: 'LTIFR 0,25 dan pastga tushadi', detail: "O'qitish qamrovi 96% ga yetgani hisobiga", confidence: 69, color: GC.violet },
];

const lineDs = (label: string, data: number[], color: string, fill = false) => ({
    label, data, borderColor: color, backgroundColor: alpha(color, 0.18),
    borderWidth: 2, tension: 0.35, pointRadius: 0, fill,
});
const barDs = (label: string, data: number[], color: string, extra: object = {}) => ({
    label, data, backgroundColor: color, borderRadius: 4, barPercentage: 0.78, ...extra,
});

const Card: React.FC<{ title: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ title, style, children }) => (
    <BigCard title={title} style={{ ...bigDemoCardStyle, ...style }}>{children}</BigCard>
);

const ESGDetail: React.FC = () => (
    <BigDashRoot>
        <style>{ESG_MARKER_CSS}</style>

        <DashHeader
            title="ESG — barqaror rivojlanish ko'rsatkichlari"
            subtitle="Ekologiya, ijtimoiy mas'uliyat va korporativ boshqaruv"
            dateRange="2026-yil, 1-yanvar — 18-iyun"
        />

        {/* ── KPI qatori: 10 ta karta ── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0 }}>
            <BigKpiCard title="ESG reytingi" value="A-" delta={6.2} iconColor={GC.accent1} />
            <BigKpiCard title="IRMA muvofiqligi" value="78%" delta={5.9} iconColor={GC.green} />
            <BigKpiCard title="HSE indeksi" value="88/100" delta={6.1} iconColor={GC.violet} />
            <BigKpiCard title="LTIFR" value="0,32" delta={-12.3} iconColor={GC.amber} />
            <BigKpiCard title="CO₂ chiqindilari, mln t" value="1,45" delta={-7.8} iconColor={GC.slate} />
            <BigKpiCard title="Suv iste'moli, mln m³" value="12,8" delta={-9.3} iconColor={GC.accent2} />
            <BigKpiCard title="Qayta tiklanuvchi energiya" value="35%" delta={4.1} iconColor={GC.amber} />
            <BigKpiCard title="Chiqindilarni qayta ishlash" value="76%" delta={7.8} iconColor={GC.green} />
            <BigKpiCard title="Xodimlar soni" value="28 540" delta={2.4} iconColor={GC.accent3} />
            <BigKpiCard title="Qoidabuzarliklar" value="7" delta={-22.2} iconColor={GC.red} />
        </div>

        <div style={{
            flex: 1, minHeight: 0, display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(4, minmax(0, 1fr))', gap: 10,
        }}>
            {/* ═══ 1–2-qator: xarita, ekologiya ═══ */}
            <Card title="Obyektlar monitoringi — xarita" style={{ gridColumn: 'span 2', gridRow: 'span 2' }}>
                <div style={{ display: 'flex', gap: 18, marginBottom: 8, flexShrink: 0 }}>
                    {(Object.keys(STATUS_LABEL) as Site['status'][]).map((k) => (
                        <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 15, color: C.sub }}>
                            <span style={{ width: 11, height: 11, borderRadius: '50%', background: STATUS_COLOR[k], boxShadow: `0 0 6px ${STATUS_COLOR[k]}` }} />
                            {STATUS_LABEL[k]} · {SITES.filter((s) => s.status === k).length}
                        </span>
                    ))}
                </div>
                <div style={{ flex: 1, minHeight: 0, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                    <EsgMap sites={SITES} />
                </div>
            </Card>

            <Card title="Obyektlar holati">
                <BigDonutBody
                    parts={[
                        { label: 'Ishlamoqda', value: SUMMARY.ok, color: GC.green },
                        { label: 'Diqqat talab', value: SUMMARY.attention, color: GC.amber },
                        { label: 'Xavf zonasida', value: SUMMARY.risk, color: GC.red },
                    ]}
                    center={String(SUMMARY.total)} centerSub="obyekt" formatValue={(v) => String(v)}
                />
            </Card>

            <Card title="ESG reytingi va IRMA dinamikasi">
                <BigChartBox>
                    <Line data={{
                        labels: MONTHS.slice(0, 6),
                        datasets: [
                            lineDs('ESG reytingi', [70, 74, 75, 78, 80, 82], GC.green, true),
                            lineDs('IRMA', [68, 69, 71, 73, 76, 78], GC.accent2),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ beginAtZero: false }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="ESG yo'nalishlari bo'yicha ball">
                <BigGauge
                    value={82} display="82" caption="umumiy ESG balli" color={GC.green}
                    rows={[
                        { label: 'Ekologiya', value: '81', color: GC.green },
                        { label: 'Ijtimoiy', value: '86', color: GC.accent1 },
                        { label: 'Boshqaruv', value: '79', color: GC.violet },
                    ]}
                />
            </Card>

            <Card title="2030-yil maqsadlari bajarilishi">
                <BigProgressList items={[
                    { label: 'CO₂ chiqindilarini kamaytirish', value: 68, display: '68%', color: GC.green, target: 75 },
                    { label: 'Energiya samaradorligi', value: 58, display: '58%', color: GC.accent2, target: 70 },
                    { label: "Suv iste'molini kamaytirish", value: 64, display: '64%', color: GC.accent1, target: 65 },
                    { label: 'Chiqindilarni qayta ishlash', value: 76, display: '76%', color: GC.green, target: 80 },
                    { label: 'Qayta tiklanuvchi energiya', value: 35, display: '35%', color: GC.amber, target: 50 },
                ]} />
            </Card>

            <Card title="CO₂ chiqindilari — Scope 1/2/3, ming t">
                <BigChartBox>
                    <Bar data={{
                        labels: QUARTERS,
                        datasets: [
                            barDs('Scope 1', [212, 204, 198, 190], GC.accent1),
                            barDs('Scope 2', [118, 112, 105, 98], GC.accent2),
                            barDs('Scope 3', [44, 43, 41, 39], GC.slate),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ stacked: true }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Issiqxona gazlari manbalari">
                <BigDonutBody
                    parts={[
                        { label: 'Energiya', value: 46, color: GC.accent1 },
                        { label: 'Texnologik jarayon', value: 31, color: GC.amber },
                        { label: 'Transport', value: 14, color: GC.violet },
                        { label: 'Boshqa', value: 9, color: GC.slate },
                    ]}
                    center="1,45" centerSub="mln t" formatValue={false}
                />
            </Card>

            <Card title="Energiya iste'moli tarkibi">
                <BigDonutBody
                    parts={[
                        { label: 'Elektr tarmog\'i', value: 50, color: GC.slate },
                        { label: 'Tabiiy gaz', value: 15, color: GC.accent1 },
                        { label: 'Quyosh', value: 21, color: GC.amber },
                        { label: 'Shamol', value: 8, color: GC.accent2 },
                        { label: 'GES', value: 6, color: GC.green },
                    ]}
                    center="35%" centerSub="yashil" formatValue={false}
                />
            </Card>

            <Card title="Suv: iste'mol va aylanma, mln m³">
                <BigChartBox>
                    <Bar data={{
                        labels: MONTHS.slice(0, 6),
                        datasets: [
                            barDs("Iste'mol", [2.31, 2.24, 2.18, 2.12, 2.02, 1.93], GC.accent1),
                            barDs('Aylanma suv', [1.42, 1.45, 1.51, 1.56, 1.6, 1.66], GC.accent2),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ decimals: 1 }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Chiqindilar, ming t">
                <BigChartBox>
                    <Bar data={{
                        labels: QUARTERS,
                        datasets: [
                            barDs('Hosil bo\'lgan', [33.2, 31.8, 30.4, 29.1], GC.slate),
                            barDs('Qayta ishlangan', [24.1, 23.9, 23.4, 22.8], GC.green),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any} />
                </BigChartBox>
            </Card>

            <Card title="Havoga chiqindilar va me'yor, t">
                <BigChartBox>
                    <Bar data={{
                        labels: ['SO₂', 'NOx', 'Chang', 'CO', 'Og\'ir metallar'],
                        datasets: [
                            barDs('Haqiqiy', [412, 286, 198, 154, 12], GC.accent1),
                            barDs("Ruxsat etilgan me'yor", [480, 300, 260, 220, 15], alpha(GC.amber, 0.55)),
                        ],
                    }} options={{ ...chartBase, indexAxis: 'y', plugins: legendLarge('top'), scales: bigScales({ horizontal: true }) } as any} />
                </BigChartBox>
            </Card>

            {/* ═══ 3-qator: xavf, xavfsizlik, ijtimoiy ═══ */}
            <Card title="Ekologik ko'rsatkichlar — o'zgarish, %">
                <BigChartBox>
                    <Bar data={{
                        labels: ['CO₂ chiqindilari', 'Elektr energiyasi', "Suv iste'moli", 'Chiqindilar hajmi', 'Qayta ishlash ulushi'],
                        datasets: [{ data: [-7.8, 2.1, -3.5, -7.3, 7.8], backgroundColor: [GC.green, GC.red, GC.green, GC.green, GC.green], borderRadius: 4, barPercentage: 0.75 }],
                    }} options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true, beginAtZero: false }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Obyektlar bo'yicha ekologik xavf, ball" style={{ gridColumn: 'span 2' }}>
                <BigHeatmap
                    rows={['Ingichka', 'Chirchiq', 'Zarafshon', 'Termiz', 'Nurota', 'Olmaliq']}
                    cols={['Havo', 'Suv', 'Tuproq', 'Chiqindi', 'Shovqin']}
                    values={[[62, 88, 71, 55, 34], [81, 46, 52, 67, 58], [58, 61, 44, 72, 29], [41, 57, 38, 49, 22], [37, 52, 61, 33, 18], [49, 31, 36, 42, 45]]}
                    color={GC.red}
                />
            </Card>

            <Card title="Xavfsizlik piramidasi (teskari)">
                <BigPyramid levels={[
                    { label: 'Xavfli vaziyatlar', value: 245, color: GC.accent3 },
                    { label: 'Xavfsizlik buzilishlari', value: 128, color: GC.accent1 },
                    { label: 'Birinchi yordam', value: 46, color: GC.violet },
                    { label: 'Yengil jarohatlar', value: 18, color: GC.amber },
                    { label: "Og'ir jarohatlar", value: 3, color: GC.red },
                ]} />
            </Card>

            <Card title="Jarohatlanish: LTIFR va TRIR">
                <BigChartBox>
                    <Line data={{
                        labels: MONTHS.slice(0, 6),
                        datasets: [
                            lineDs('LTIFR', [0.5, 0.46, 0.42, 0.38, 0.35, 0.32], GC.amber, true),
                            lineDs('TRIR', [1.12, 1.05, 0.98, 0.94, 0.9, 0.86], GC.red),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ decimals: 1 }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Gender tarkibi">
                <BigDonutBody
                    parts={[
                        { label: 'Erkaklar', value: 62, color: GC.accent1 },
                        { label: 'Ayollar', value: 38, color: GC.violet },
                    ]}
                    center="28 540" centerSub="xodim" formatValue={false}
                />
            </Card>

            <Card title="Kadrlar qo'nimsizligi, %">
                <BigChartBox>
                    <Bar data={{
                        labels: MONTHS.slice(0, 6),
                        datasets: [barDs('Qo\'nimsizlik', [5.9, 5.6, 5.3, 5.1, 4.9, 4.7], GC.accent3)],
                    }} options={{ ...chartBase, ...noLegend, scales: bigScales({ decimals: 1 }) } as any} plugins={[bigBarLabel(1)]} />
                </BigChartBox>
            </Card>

            {/* ═══ 4-qator: jamiyat, boshqaruv, AI ═══ */}
            <Card title="Ijtimoiy investitsiyalar, mlrd so'm">
                <BigChartBox>
                    <Bar data={{
                        labels: ["Ta'lim", "Sog'liqni saqlash", 'Infratuzilma', 'Sport', 'Madaniyat'],
                        datasets: [{ data: [48.2, 36.5, 29.8, 12.4, 8.1], backgroundColor: [GC.accent1, GC.green, GC.amber, GC.violet, GC.accent2], borderRadius: 4, barPercentage: 0.75 }],
                    }} options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any} />
                </BigChartBox>
            </Card>

            <Card title="Mahalliy hamjamiyat bilan ishlash">
                <BigStatGrid items={[
                    { label: 'Murojaatlar', value: '214', sub: '96% hal etildi', color: GC.accent1 },
                    { label: "Jamoatchilik uchrashuvlari", value: '38', color: GC.green },
                    { label: 'Ijtimoiy loyihalar qamrovi', value: '8,7 ming', sub: 'kishi', color: GC.violet },
                    { label: 'Shikoyatlar', value: '3', sub: "ko'rib chiqilmoqda", color: GC.amber },
                ]} />
            </Card>

            <Card title="Korporativ boshqaruv">
                <BigProgressList items={[
                    { label: 'Mustaqil direktorlar', value: 43, display: '43%', color: GC.accent1 },
                    { label: 'Kuzatuv kengashida ayollar', value: 29, display: '29%', color: GC.violet },
                    { label: "Antikorrupsiya o'qitish", value: 96, display: '96%', color: GC.green },
                    { label: 'Axborotni oshkor qilish', value: 91, display: '91%', color: GC.accent2 },
                    { label: 'Ichki audit tavsiyalari', value: 84, display: '84%', color: GC.amber },
                ]} />
            </Card>

            <Card title="Yetkazib beruvchilar ESG auditi">
                <BigDonutBody
                    parts={[
                        { label: 'Muvofiq', value: 164, color: GC.green },
                        { label: 'Qisman muvofiq', value: 47, color: GC.amber },
                        { label: 'Nomuvofiq', value: 12, color: GC.red },
                    ]}
                    center="223" centerSub="yetkazib beruvchi" formatValue={(v) => String(v)}
                />
            </Card>

            <Card title="Ekologik to'lovlar va jarimalar, mln so'm">
                <BigChartBox>
                    <Bar data={{
                        labels: QUARTERS,
                        datasets: [
                            barDs("Ekologik to'lovlar", [1840, 1760, 1690, 1610], GC.accent1),
                            barDs('Jarimalar', [320, 180, 140, 60], GC.red),
                        ],
                    }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any} />
                </BigChartBox>
            </Card>

            <Card title="Sertifikatlar va standartlar">
                <BigRowList rows={[
                    { label: 'ISO 14001', sub: 'Ekologik boshqaruv', value: 'Amalda', color: GC.green },
                    { label: 'ISO 45001', sub: "Mehnat xavfsizligi", value: 'Amalda', color: GC.green },
                    { label: 'ISO 50001', sub: 'Energiya boshqaruvi', value: 'Auditda', color: GC.amber },
                    { label: 'IRMA', sub: "Mas'uliyatli qazib olish", value: '78%', color: GC.accent1 },
                    { label: 'GRI hisoboti', sub: 'Barqarorlik hisoboti', value: '2025', color: GC.violet },
                ]} />
            </Card>

            <Card title="Sun'iy intellekt prognozlari">
                <BigForecastList items={AI_FORECASTS} />
            </Card>
        </div>
    </BigDashRoot>
);

export default ESGDetail;
