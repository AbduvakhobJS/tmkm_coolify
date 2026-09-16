import React, { useEffect, useMemo, useRef } from 'react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { C, chartBase, noLegend, DashHeader } from '../../components/dashboardUI';
import {
    BigCard, BigKpiCard, BigDashRoot, axisLarge, legendLarge,
    bigCenterText, bigDonutBoxStyle, BigLabelRow,
} from '../../components/dashboardUILarge';
import esgDetail from './esgDetailDemoData.json';
import { GC, alpha } from '../../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   ESG — BATAFSIL

   Uslub MetalsDashboardMain bilan bir xil: `BigDashRoot` + `DashHeader` +
   `BigKpiCard` qatori + `BigCard` to'ri, `axisLarge` / `bigCenterText`
   grafiklari. Ekran to'liq to'ladi, scroll yo'q.

   MA'LUMOT: ESG bo'yicha API yo'q — barcha ko'rsatkichlar namuna ma'lumotdan
   quriladi, shu sabab kartalar SARIQ ramka bilan belgilanadi.
   ══════════════════════════════════════════════════════════════════════════ */

const DATA = esgDetail;

type Site = { name: string; lon: number; lat: number; status: 'ok' | 'attention' | 'risk' | string };

const STATUS_COLOR: Record<string, string> = {
    ok: GC.green,
    attention: GC.amber,
    risk: GC.red,
};
const STATUS_LABEL: Record<string, string> = {
    ok: 'Ishlamoqda',
    attention: 'Diqqat talab',
    risk: 'Xavf zonasida',
};

const demoCardStyle: React.CSSProperties = { border: `1px solid ${GC.amber}73` };

/* ── Xarita markerlari uchun uslub: pulsatsiyalanuvchi halqa + hover
      kattalashuvi. Avval oddiy 13px doiracha edi — interaktiv emas edi. ── */
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
    font-size: 11px; font-weight: 600; color: #e7f1ff;
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
            center: [66.9, 40.2],
            zoom: 4.3,
            pitch: 0,
            attributionControl: false,
            interactive: true,
        });
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();

        /* Markerlar `load` hodisasini KUTMAYDI: ular oddiy DOM overlaylari,
           uslub (tiles) yuklanmasa ham ko'rinishi kerak — aks holda tarmoq
           bloklangan muhitda xarita butunlay bo'sh qolardi. */
        {
            sites.forEach((s) => {
                const color = STATUS_COLOR[s.status] ?? GC.slate;

                const el = document.createElement('div');
                el.className = 'esg-marker';
                el.innerHTML = `
                    <span class="esg-marker__ring" style="background:${alpha(color, 0.45)}"></span>
                    <span class="esg-marker__dot" style="background:${color}; box-shadow:0 0 10px 2px ${alpha(color, 0.8)}"></span>
                    <span class="esg-marker__label">${s.name} · ${STATUS_LABEL[s.status] ?? s.status}</span>
                `;

                /* Bosilganda — holat va joylashuv ko'rsatilgan popup. */
                const popup = new maplibregl.Popup({ offset: 18, closeButton: false, className: 'esg-popup' })
                    .setHTML(`
                        <div style="font-family:'Segoe UI',system-ui,sans-serif;min-width:150px">
                            <div style="font-size:14px;font-weight:700;color:#e7f1ff;margin-bottom:5px">${s.name}</div>
                            <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:${color}">
                                <span style="width:8px;height:8px;border-radius:50%;background:${color};display:inline-block"></span>
                                ${STATUS_LABEL[s.status] ?? s.status}
                            </div>
                            <div style="font-size:11px;color:#8aa0b8;margin-top:5px">${s.lat.toFixed(2)}, ${s.lon.toFixed(2)}</div>
                        </div>
                    `);

                new maplibregl.Marker({ element: el, anchor: 'center' })
                    .setLngLat([s.lon, s.lat])
                    .setPopup(popup)
                    .addTo(map);
            });
        }

        mapRef.current = map;
        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [sites]);

    return <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden' }} />;
};

/* ── Teskari xavfsizlik piramidasi (Heinrich piramidasi) ──
   Yuqorida eng ko'p uchraydigan ("Near Miss"), pastda eng og'ir hodisa.
   Har bir qavat kengligi hodisalar soniga mutanosib. */
const SAFETY_PYRAMID: { label: string; value: number; color: string }[] = [
    { label: 'Near Miss (xavfli holat)', value: 245, color: GC.accent3 },
    { label: 'Xavfsizlik buzilishlari', value: 128, color: GC.accent1 },
    { label: "Birinchi yordam holatlari", value: 46, color: GC.violet },
    { label: 'Yengil jarohatlar', value: 18, color: GC.amber },
    { label: "Og'ir jarohatlar", value: 3, color: GC.red },
];

const SafetyPyramid: React.FC = () => {
    const max = SAFETY_PYRAMID[0].value;
    return (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 6, justifyContent: 'space-evenly', overflow: 'hidden' }}>
            {SAFETY_PYRAMID.map((s) => {
                const w = Math.max((s.value / max) * 100, 14);
                return (
                    <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div
                            title={`${s.label}: ${s.value}`}
                            style={{
                                width: `${w}%`,
                                /* Trapetsiya — pastga qarab torayadigan qavat */
                                clipPath: 'polygon(0% 0%, 100% 0%, 94% 100%, 6% 100%)',
                                background: `linear-gradient(180deg, ${s.color}, ${alpha(s.color, 0.62)})`,
                                border: `1px solid ${alpha(s.color, 0.55)}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                padding: '7px 10px', minHeight: 0,
                            }}
                        >
                            <span style={{ color: '#04101f', fontWeight: 700, fontSize: 'clamp(11px, 2.2cqmin, 16px)' }}>{s.value}</span>
                        </div>
                        <div style={{ color: C.sub, fontSize: 'clamp(9px, 1.8cqmin, 13px)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{s.label}</div>
                    </div>
                );
            })}
        </div>
    );
};

const ESGDetail: React.FC = () => {
    const kpiColor: Record<string, string> = {
        esgRating: GC.accent1, irma: GC.green, hseIndex: GC.violet, ltifr: GC.amber,
        co2: GC.slate, water: GC.accent2, renewables: GC.amber, violations: GC.red,
    };

    /* Ekologiya dinamikasi — bir nechta ko'rsatkich bitta chiziqli grafikda. */
    const ecoTrend = useMemo(() => ({
        labels: DATA.ecology.trend.labels,
        datasets: DATA.ecology.trend.series.map((ds) => ({
            label: ds.name,
            data: ds.data,
            borderColor: ds.color,
            backgroundColor: alpha(ds.color, 0.2),
            borderWidth: 2, tension: 0.35, pointRadius: 0, fill: false,
        })),
    }), []);

    /* Obyektlar holati donuti */
    const sitesDonut = {
        labels: ['Ishlamoqda', 'Diqqat talab', 'Xavf zonasida'],
        datasets: [{
            data: [DATA.esgCore.summary.ok, DATA.esgCore.summary.attention, DATA.esgCore.summary.risk],
            backgroundColor: [GC.green, GC.amber, GC.red],
            borderWidth: 0,
        }],
    };

    /* Gender taqsimoti */
    const genderDonut = {
        labels: ['Ayollar', 'Erkaklar'],
        datasets: [{
            data: [DATA.social.genderSplit.female, DATA.social.genderSplit.male],
            backgroundColor: [GC.violet, GC.accent1],
            borderWidth: 0,
        }],
    };

    /* Ekologiya ko'rsatkichlari — o'zgarish (%) bo'yicha gorizontal bar */
    const ecoBars = {
        labels: DATA.ecology.items.map((i: any) => (i.label.length > 28 ? `${i.label.slice(0, 27)}…` : i.label)),
        datasets: [{
            data: DATA.ecology.items.map((i: any) => i.delta),
            backgroundColor: DATA.ecology.items.map((i: any) => (i.delta >= 0 ? GC.green : GC.red)),
            borderRadius: 4,
            barPercentage: 0.75,
        }],
    };

    /* Boshqaruv ko'rsatkichlari */
    const govBars = {
        labels: DATA.governance.map((g: any) => (g.label.length > 24 ? `${g.label.slice(0, 23)}…` : g.label)),
        datasets: [{
            data: DATA.governance.map((g: any) => Number(String(g.value).replace(/\s/g, '')) || 0),
            backgroundColor: GC.accent2,
            borderRadius: 4,
            barPercentage: 0.7,
        }],
    };

    return (
        <BigDashRoot>
            <style>{ESG_MARKER_CSS}</style>

            <DashHeader
                title="ESG — barqaror rivojlanish ko'rsatkichlari"
                subtitle="Ekologiya, ijtimoiy mas'uliyat va korporativ boshqaruv"
                dateRange={DATA.generatedAt}
            />

            {/* KPI qatori — 8 ta ko'rsatkich */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0 }}>
                {DATA.kpi.map((k: any) => (
                    <BigKpiCard
                        key={k.key}
                        title={k.label}
                        value={`${k.value}${k.unit ? ` ${k.unit}` : ''}`}
                        delta={k.delta}
                        iconColor={kpiColor[k.key] ?? GC.accent1}
                    />
                ))}
            </div>

            <div style={{
                flex: 1, minHeight: 0, display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 10,
            }}>
                {/* 1 — Obyektlar xaritasi (interaktiv markerlar) */}
                <BigCard title="Obyektlar monitoringi — xarita" style={demoCardStyle}>
                    <div style={{ display: 'flex', gap: 14, marginBottom: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                        {DATA.esgCore.legend.map((l: any) => (
                            <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'clamp(10px, 2cqmin, 14px)', color: C.sub }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, boxShadow: `0 0 6px ${l.color}` }} />{l.label}
                            </span>
                        ))}
                    </div>
                    <div style={{ flex: 1, minHeight: 0, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                        <EsgMap sites={DATA.esgCore.sites as Site[]} />
                    </div>
                </BigCard>

                {/* 2 — Obyektlar holati */}
                <BigCard title="Obyektlar holati" style={demoCardStyle}>
                    <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 12 }}>
                        <div style={{ flex: '0 0 46%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', gap: 9, justifyContent: 'center', overflow: 'hidden' }}>
                            <BigLabelRow label="Jami obyektlar" color={GC.accent1} value={String(DATA.esgCore.summary.total)} />
                            <BigLabelRow label="Ishlamoqda" color={GC.green} value={String(DATA.esgCore.summary.ok)} />
                            <BigLabelRow label="Diqqat talab" color={GC.amber} value={String(DATA.esgCore.summary.attention)} />
                            <BigLabelRow label="Xavf zonasida" color={GC.red} value={String(DATA.esgCore.summary.risk)} />
                        </div>
                        <div style={bigDonutBoxStyle}>
                            <Doughnut
                                data={sitesDonut}
                                options={{ ...chartBase, cutout: '62%', ...noLegend } as any}
                                plugins={[bigCenterText(String(DATA.esgCore.summary.total), 'obyekt')]}
                            />
                        </div>
                    </div>
                </BigCard>

                {/* 3 — Ekologiya dinamikasi */}
                <BigCard title="Ekologik ko'rsatkichlar dinamikasi" style={demoCardStyle}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line
                            data={ecoTrend}
                            options={{
                                ...chartBase,
                                plugins: legendLarge('top'),
                                scales: axisLarge({ x: { ticks: { font: { size: 10 } } }, y: { beginAtZero: false } }),
                            } as any}
                        />
                    </div>
                </BigCard>

                {/* 4 — Teskari xavfsizlik piramidasi */}
                <BigCard title="Xavfsizlik piramidasi (teskari)" style={demoCardStyle}>
                    <SafetyPyramid />
                </BigCard>

                {/* 5 — Ekologiya: o'zgarish, % */}
                <BigCard title="Ekologiya — o'tgan davrga nisbatan, %" style={demoCardStyle}>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Bar
                            data={ecoBars}
                            options={{
                                ...chartBase, indexAxis: 'y', ...noLegend,
                                scales: axisLarge({ x: { beginAtZero: true }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } }),
                            } as any}
                        />
                    </div>
                </BigCard>

                {/* 6 — Ijtimoiy va boshqaruv */}
                <BigCard title="Ijtimoiy tarkib va boshqaruv" style={demoCardStyle}>
                    <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: 12 }}>
                        <div style={{ flex: '0 0 42%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center', overflow: 'hidden' }}>
                            <BigLabelRow label="Xodimlar soni" color={GC.accent1} value={DATA.social.headcount} />
                            <BigLabelRow label="Kadrlar oqimi" color={GC.amber} value={`${DATA.social.turnover}%`} />
                            {DATA.social.extra.slice(0, 3).map((e: any) => (
                                <BigLabelRow key={e.label} label={e.label} color={GC.accent3} value={e.value} />
                            ))}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0 }}>
                            <div style={{ ...bigDonutBoxStyle, flex: 1, minHeight: 0 }}>
                                <Doughnut
                                    data={genderDonut}
                                    options={{ ...chartBase, cutout: '62%', ...noLegend } as any}
                                    plugins={[bigCenterText(`${DATA.social.genderSplit.female}%`, 'ayollar')]}
                                />
                            </div>
                            <div style={{ flex: 1, minHeight: 0 }}>
                                <Bar
                                    data={govBars}
                                    options={{
                                        ...chartBase, indexAxis: 'y', ...noLegend,
                                        scales: axisLarge({ x: { beginAtZero: true }, y: { grid: { display: false }, ticks: { font: { size: 10 } } } }),
                                    } as any}
                                />
                            </div>
                        </div>
                    </div>
                </BigCard>
            </div>
        </BigDashRoot>
    );
};

export default ESGDetail;
