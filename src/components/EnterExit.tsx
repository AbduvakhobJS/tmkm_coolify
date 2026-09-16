import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement,
    CategoryScale, LinearScale, LineElement, PointElement, Filler,
} from 'chart.js';
import StreamGrid from './VideoStream';
import { GC, alpha } from '../theme/palette';
import { C, chartBase, noLegend } from './dashboardUI';
import {
    BigCard, BigKpiCard, BigDashRoot, legendLarge, bigBarLabel, bigHeaderTitle, bigHeaderPill,
    BigChartBox, BigDonutBody, BigForecastList, bigScales, bigDemoCardStyle, fmtGrouped,
    BigProgressList, BigStatGrid, BigRowList, BigGauge,
    type BigForecast, type BigRow,
} from './dashboardUILarge';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Filler);

/* ══════════════════════════════════════════════════════════════════════════
   KIRISH-CHIQISH NAZORATI VA VIDEOKUZATUV — TO'LIQ EKRAN (33 ta karta)

   Uslub FinanceNewMain / SingleTreasury bilan bir xil: `BigDashRoot` +
   sarlavha + 10 ta `BigKpiCard` + 7 ustun × 4 qatorli `BigCard` to'ri.

   MA'LUMOT — AVVAL HAQIQIY API (EnterExitMain bilan bir xil, TMK_API_Docs):
     • `/api/reports/tmk`        — holat kartalari, xodimlar, aniqlanmagan shaxslar;
     • `/api/reports/today-tmk`  — bugun kelgan / ketganlar (obyekt bilan);
     • WebSocket                 — yangi hodisada qayta yuklash;
     • Videokuzatuv              — jonli oqim (`StreamGrid`).
   Haqiqiy kartalar 1–3-qatorda. API javob bermasa, ular xuddi shu shakldagi
   namuna ma'lumot bilan to'ladi va SARIQ ramka oladi.

   DEMO (SARIQ ramka) — 4-qator: API'da tarix (hafta/oy), kamera va turniket
   holati yo'q; sun'iy intellekt prognozlari.
   ══════════════════════════════════════════════════════════════════════════ */

/* ── API ── */
const BASE = 'https://citynet.synterra.uz';
const PHONE = '998901234568';
const REFRESH = 20_000;

interface CardStat { count: number; change_percent: number; percent_of_total: number; }
interface Cards { arrived: CardStat; not_arrived: CardStat; late: CardStat; early_left: CardStat; currently_in: CardStat; left: CardStat; not_found: CardStat; }
interface NotFoundP { id: number; photo: string; formatted_date: string; turniket_name: string; door: string; door_label: string; full_name?: string; tab_number?: string; department?: string; position?: string; }
interface Employee { id: number; full_name: string; department: string; position: string; image: string; status: string; is_late: boolean; is_early_left: boolean; entry_time: string | null; exit_time: string | null; last_log?: { door_label: string; time: string }; }
interface Dash { date: string; total_users: number; cards: Cards; not_found_persons: NotFoundP[]; employees: Employee[]; }
interface TodayEmp { id: number; full_name: string; department: string; entry_time: string | null; exit_time: string | null; image: string; status: string; is_late: boolean; object_id: number; object_name: string; }

const CS0: CardStat = { count: 0, change_percent: 0, percent_of_total: 0 };
const D0: Dash = {
    date: '', total_users: 0,
    cards: { arrived: CS0, not_arrived: CS0, late: CS0, early_left: CS0, currently_in: CS0, left: CS0, not_found: CS0 },
    not_found_persons: [], employees: [],
};

async function login(): Promise<string> {
    const r = await fetch(`${BASE}/api/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: PHONE }),
    });
    if (!r.ok) throw new Error(`Login ${r.status}`);
    const j = await r.json();
    const t = j?.data?.token;
    if (!t) throw new Error("Token yo'q");
    return t;
}

async function fetchDash(token: string): Promise<Dash> {
    const r = await fetch(`${BASE}/api/reports/tmk`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`Dash ${r.status}`);
    const j = await r.json();
    const d = j?.data ?? j ?? {};
    const c = d.cards ?? {};
    return {
        date: d.date ?? '', total_users: d.total_users ?? 0,
        cards: {
            arrived: { ...CS0, ...(c.arrived ?? {}) },
            not_arrived: { ...CS0, ...(c.not_arrived ?? {}) },
            late: { ...CS0, ...(c.late ?? {}) },
            early_left: { ...CS0, ...(c.early_left ?? {}) },
            currently_in: { ...CS0, ...(c.currently_in ?? {}) },
            left: { ...CS0, ...(c.left ?? {}) },
            not_found: { ...CS0, ...(c.not_found ?? {}) },
        },
        not_found_persons: Array.isArray(d.not_found_persons) ? d.not_found_persons : [],
        employees: Array.isArray(d.employees) ? d.employees : [],
    };
}

async function fetchToday(token: string, status: 'arrived' | 'left'): Promise<TodayEmp[]> {
    const r = await fetch(`${BASE}/api/reports/today-tmk?status=${status}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error(`Today ${r.status}`);
    const j = await r.json();
    const d = j?.data ?? [];
    return Array.isArray(d) ? d : [];
}

/* ── Vaqt yordamchilari ──
   API vaqti "08:12", "08:12:30" yoki "2026-06-05 08:12:30" bo'lishi mumkin —
   birinchi "HH:MM" bo'lagi olinadi. */
const minutesOf = (t: string | null | undefined): number | null => {
    const m = /(\d{1,2}):(\d{2})/.exec(t ?? '');
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};
const hhmm = (t: string | null | undefined) => {
    const m = minutesOf(t);
    return m === null ? '—' : `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

/* ── Namuna ma'lumot (API shaklida) — API javob bermaganda ── */
const DEMO = (() => {
    let seed = 20260605;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
    const time = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

    const first = ['Aziz', 'Dilshod', 'Nodira', 'Jasur', 'Malika', 'Otabek', 'Gulnora', 'Sardor', 'Zarina', 'Bekzod', 'Shahlo', 'Rustam', 'Kamola', 'Ulugʻbek', 'Feruza', 'Sherzod'];
    const last = ['Karimov', 'Rahimova', 'Tursunov', 'Yusupova', 'Aliyev', 'Saidova', 'Ergashev', 'Qodirova', 'Nazarov', 'Xolmatova', 'Abdullayev', 'Mirzayeva'];
    const depts = ['Ishlab chiqarish', 'Boshqaruv apparati', 'Moliya bo\'limi', 'IT bo\'limi', 'Xavfsizlik xizmati', 'Logistika', 'Kadrlar bo\'limi', 'Yuridik bo\'lim'];
    const deptW = [30, 14, 10, 9, 12, 11, 7, 7];
    const positions = ['Mutaxassis', 'Bosh mutaxassis', 'Muhandis', 'Operator', "Bo'lim boshlig'i", 'Haydovchi'];
    const doors = ['Asosiy kirish', 'Shimoliy turniket', 'Avtoturargoh', 'Xizmat eshigi'];
    const weighted = () => { let r = rnd() * 100; for (let i = 0; i < depts.length; i++) { r -= deptW[i]; if (r <= 0) return depts[i]; } return depts[0]; };

    const employees: Employee[] = Array.from({ length: 160 }, (_, i) => {
        const came = rnd() > 0.12;
        const entry = came ? Math.round(450 + rnd() * 60 + rnd() * 60 + (rnd() > 0.88 ? 45 + rnd() * 40 : 0)) : null;
        const leftAt = came && rnd() > 0.72 ? Math.round(960 + rnd() * 180) : null;
        return {
            id: i + 1,
            full_name: `${pick(last)} ${pick(first)}`,
            department: weighted(),
            position: pick(positions),
            image: '',
            status: !came ? 'not_arrived' : leftAt ? 'left' : 'in',
            is_late: entry !== null && entry > 540,
            is_early_left: leftAt !== null && leftAt < 1080,
            entry_time: entry === null ? null : time(entry),
            exit_time: leftAt === null ? null : time(leftAt),
            last_log: came ? { door_label: pick(doors), time: time(leftAt ?? entry!) } : undefined,
        };
    });
    const objects = ['Bosh ofis', 'Chirchiq zavodi', 'Olmaliq filiali', 'Angren filiali'];
    const today = (status: 'arrived' | 'left'): TodayEmp[] => employees
        .filter((e) => (status === 'arrived' ? e.entry_time : e.exit_time))
        .map((e) => ({ id: e.id, full_name: e.full_name, department: e.department, entry_time: e.entry_time, exit_time: e.exit_time, image: '', status: e.status, is_late: e.is_late, object_id: 1, object_name: pick(objects) }));

    const dash: Dash = {
        date: '2026-06-05', total_users: 945,
        cards: {
            arrived: { count: 812, change_percent: 2.4, percent_of_total: 85.9 },
            not_arrived: { count: 133, change_percent: -6.1, percent_of_total: 14.1 },
            late: { count: 64, change_percent: -9.8, percent_of_total: 6.8 },
            early_left: { count: 18, change_percent: 12.5, percent_of_total: 1.9 },
            currently_in: { count: 701, change_percent: 1.7, percent_of_total: 74.2 },
            left: { count: 111, change_percent: 4.3, percent_of_total: 11.7 },
            not_found: { count: 5, change_percent: -28.6, percent_of_total: 0.5 },
        },
        not_found_persons: [
            { id: 1, photo: '', formatted_date: '05.06.2026 08:14', turniket_name: 'Asosiy kirish', door: 'in', door_label: 'Kirish' },
            { id: 2, photo: '', formatted_date: '05.06.2026 09:02', turniket_name: 'Avtoturargoh', door: 'in', door_label: 'Kirish' },
            { id: 3, photo: '', formatted_date: '05.06.2026 11:37', turniket_name: 'Xizmat eshigi', door: 'out', door_label: 'Chiqish' },
            { id: 4, photo: '', formatted_date: '05.06.2026 13:20', turniket_name: 'Shimoliy turniket', door: 'in', door_label: 'Kirish' },
            { id: 5, photo: '', formatted_date: '05.06.2026 15:48', turniket_name: 'Asosiy kirish', door: 'out', door_label: 'Chiqish' },
        ],
        employees,
    };
    return { dash, arrived: today('arrived'), left: today('left') };
})();

const AI_FORECASTS: BigForecast[] = [
    { text: 'Ertaga kechikishlar 12% ga kamayadi', detail: "Juma kuni odatda kechikish kam bo'ladi", confidence: 71, color: GC.green },
    { text: '08:40–09:00 da asosiy kirishda navbat yuzaga keladi', detail: "Shu oraliqda o'tishlar 2,3 barobar ko'p", confidence: 78, color: GC.amber },
    { text: "Ishlab chiqarishda davomat 90% dan oshadi", detail: 'Smena jadvali yangilangani hisobiga', confidence: 64, color: GC.accent1 },
    { text: 'Aniqlanmagan shaxslar avtoturargohda ko\'payishi mumkin', detail: 'Kamera yoritilishi past — tekshirish tavsiya etiladi', confidence: 59, color: GC.red },
    { text: "Oy oxirida o'rtacha davomat 88,5% bo'ladi", detail: 'Joriy tendensiya saqlansa', confidence: 67, color: GC.violet },
];

const PALETTE = [GC.accent1, GC.accent2, GC.green, GC.amber, GC.violet, GC.accent3, GC.red, GC.slate];

const card = (demo: boolean, extra?: React.CSSProperties): React.CSSProperties => ({ ...(demo ? bigDemoCardStyle : null), ...extra });

/** Ro'yxatni guruhlab sanaydi va kamayish tartibida qaytaradi. */
const countBy = <T,>(items: T[], key: (t: T) => string | null | undefined, limit = 8) => {
    const m = new Map<string, number>();
    items.forEach((it) => { const k = key(it); if (k) m.set(k, (m.get(k) ?? 0) + 1); });
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit);
};

const barDs = (label: string, data: number[], color: string | string[]) => ({ label, data, backgroundColor: color, borderRadius: 4, barPercentage: 0.78 });

export default function EnterExit() {
    const [data, setData] = useState<Dash>(D0);
    const [wsOk, setWsOk] = useState(false);
    const [arrivedList, setArrivedList] = useState<TodayEmp[]>([]);
    const [leftList, setLeftList] = useState<TodayEmp[]>([]);
    const tokenRef = useRef('');
    const wsRef = useRef<WebSocket | null>(null);

    const load = useCallback(async () => {
        try {
            if (!tokenRef.current) tokenRef.current = await login();
            const [dash, arr, lft] = await Promise.all([
                fetchDash(tokenRef.current),
                fetchToday(tokenRef.current, 'arrived'),
                fetchToday(tokenRef.current, 'left'),
            ]);
            setData(dash);
            setArrivedList(arr);
            setLeftList(lft);
        } catch (e: any) {
            if (String(e?.message).includes('401') || String(e?.message).includes('403')) tokenRef.current = '';
        }
    }, []);

    useEffect(() => {
        let alive = true;
        const connect = async () => {
            if (!alive) return;
            try {
                if (!tokenRef.current) tokenRef.current = await login();
                const ws = new WebSocket(`wss://citynet.synterra.uz/ws?token=${tokenRef.current}`);
                wsRef.current = ws;
                ws.onopen = () => setWsOk(true);
                ws.onclose = () => { setWsOk(false); if (alive) setTimeout(connect, 5000); };
                ws.onerror = () => ws.close();
                ws.onmessage = () => { load(); };
            } catch { if (alive) setTimeout(connect, 8000); }
        };
        connect();
        return () => { alive = false; wsRef.current?.close(); };
    }, [load]);

    useEffect(() => {
        load();
        const id = setInterval(() => { if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) load(); }, REFRESH);
        return () => clearInterval(id);
    }, [load]);

    const v = useMemo(() => {
        /* Haqiqiy ma'lumot bor-yo'qligi har bir manba uchun alohida:
           umumiy hisobot kelib, xodimlar ro'yxati bo'sh bo'lishi mumkin. */
        const realDash = data.total_users > 0;
        const realEmp = realDash && data.employees.length > 0;
        const realToday = realDash && arrivedList.length + leftList.length > 0;

        const dash = realDash ? data : DEMO.dash;
        const emps = realEmp ? data.employees : DEMO.dash.employees;
        const arrived = realToday ? arrivedList : DEMO.arrived;
        const left = realToday ? leftList : DEMO.left;
        const c = dash.cards;
        const total = dash.total_users || 1;

        const hourlyIn = new Array(24).fill(0);
        const hourlyOut = new Array(24).fill(0);
        emps.forEach((e) => {
            const a = minutesOf(e.entry_time); if (a !== null) hourlyIn[Math.floor(a / 60) % 24]++;
            const b = minutesOf(e.exit_time); if (b !== null) hourlyOut[Math.floor(b / 60) % 24]++;
        });

        const durations = [0, 0, 0, 0, 0];
        emps.forEach((e) => {
            const a = minutesOf(e.entry_time), b = minutesOf(e.exit_time);
            if (a === null || b === null || b <= a) return;
            const h = (b - a) / 60;
            durations[h < 4 ? 0 : h < 6 ? 1 : h < 8 ? 2 : h < 10 ? 3 : 4]++;
        });

        const byDept = countBy(emps, (e) => e.department || 'Boshqa', 7);
        const lateByDept = countBy(emps.filter((e) => e.is_late), (e) => e.department || 'Boshqa', 6);

        return {
            realDash, realEmp, realToday, dash, emps, c, total,
            attendancePct: (c.arrived.count / total) * 100,
            latePct: c.arrived.count ? (c.late.count / c.arrived.count) * 100 : 0,
            hourlyIn, hourlyOut, durations, byDept, lateByDept,
            byDoor: countBy(emps, (e) => e.last_log?.door_label, 6),
            byPosition: countBy(emps, (e) => e.position, 5),
            byObject: countBy(arrived, (e) => e.object_name || e.department, 5),
            events: [
                ...arrived.map((e) => ({ type: 'in' as const, t: minutesOf(e.entry_time), e })),
                ...left.map((e) => ({ type: 'out' as const, t: minutesOf(e.exit_time), e })),
            ].sort((a, b) => (b.t ?? 0) - (a.t ?? 0)).slice(0, 8),
            firstIn: emps.filter((e) => minutesOf(e.entry_time) !== null)
                .sort((a, b) => minutesOf(a.entry_time)! - minutesOf(b.entry_time)!).slice(0, 6),
            lateList: emps.filter((e) => e.is_late)
                .sort((a, b) => minutesOf(b.entry_time)! - minutesOf(a.entry_time)!).slice(0, 6),
            earlyList: emps.filter((e) => e.is_early_left)
                .sort((a, b) => (minutesOf(a.exit_time) ?? 0) - (minutesOf(b.exit_time) ?? 0)).slice(0, 6),
        };
    }, [data, arrivedList, leftList]);

    const { c } = v;
    const kpiDemo = !v.realDash;
    const empDemo = !v.realEmp;

    const emptyRow = (text: string): BigRow[] => [{ label: text, value: '0', color: GC.green }];

    return (
        <BigDashRoot>
            <style>{'@keyframes eeBlink{0%,100%{opacity:1}50%{opacity:.2}}'}</style>

            {/* ── Sarlavha ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 'clamp(5px, 1.2cqmin, 10px)', flexShrink: 0 }}>
                <div style={bigHeaderTitle}>Kirish-chiqish nazorati va videokuzatuv</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ ...bigHeaderPill, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                            width: 9, height: 9, borderRadius: '50%',
                            background: wsOk ? GC.green : v.realDash ? GC.accent1 : GC.amber,
                            animation: 'eeBlink 1.2s infinite',
                        }} />
                        {wsOk ? 'Jonli' : v.realDash ? 'Yangilanmoqda' : 'Ulanmoqda'}
                    </span>
                    {c.not_found.count > 0 && (
                        <span style={{ ...bigHeaderPill, color: GC.red, borderColor: alpha(GC.red, 0.5) }}>
                            ⚠ {c.not_found.count} ta aniqlanmagan shaxs
                        </span>
                    )}
                    <span style={bigHeaderPill}>{v.dash.date || new Date().toLocaleDateString('ru-RU')}</span>
                </div>
            </div>

            {/* ── KPI qatori: 10 ta karta (API holat kartalari) ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexShrink: 0 }}>
                <BigKpiCard demo={kpiDemo} title="Jami xodimlar" value={fmtGrouped(v.dash.total_users, 0)} iconColor={GC.accent2} />
                <BigKpiCard demo={kpiDemo} title="Hozir ichkarida" value={fmtGrouped(c.currently_in.count, 0)} delta={c.currently_in.change_percent} iconColor={GC.accent1} />
                <BigKpiCard demo={kpiDemo} title="Bugun kelganlar" value={fmtGrouped(c.arrived.count, 0)} delta={c.arrived.change_percent} iconColor={GC.green} />
                <BigKpiCard demo={kpiDemo} title="Kelmaganlar" value={fmtGrouped(c.not_arrived.count, 0)} delta={c.not_arrived.change_percent} iconColor={GC.slate} />
                <BigKpiCard demo={kpiDemo} title="Kech qolganlar" value={fmtGrouped(c.late.count, 0)} delta={c.late.change_percent} iconColor={GC.amber} />
                <BigKpiCard demo={kpiDemo} title="Erta ketganlar" value={fmtGrouped(c.early_left.count, 0)} delta={c.early_left.change_percent} iconColor={GC.violet} />
                <BigKpiCard demo={kpiDemo} title="Ketganlar" value={fmtGrouped(c.left.count, 0)} delta={c.left.change_percent} iconColor={GC.accent3} />
                <BigKpiCard demo={kpiDemo} title="Aniqlanmagan shaxslar" value={fmtGrouped(c.not_found.count, 0)} delta={c.not_found.change_percent} iconColor={GC.red} />
                <BigKpiCard demo={kpiDemo} title="Davomat" value={`${fmtGrouped(v.attendancePct, 1)}%`} iconColor={GC.green} />
                <BigKpiCard demo={kpiDemo} title="Kechikish ulushi" value={`${fmtGrouped(v.latePct, 1)}%`} iconColor={GC.amber} />
            </div>

            <div style={{
                flex: 1, minHeight: 0, display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(4, minmax(0, 1fr))', gap: 10,
            }}>
                {/* ═══ 1-qator ═══ */}
                <BigCard title="Davomat holati" style={card(kpiDemo)}>
                    <BigDonutBody
                        parts={[
                            { label: "O'z vaqtida", value: Math.max(0, c.arrived.count - c.late.count), color: GC.green },
                            { label: 'Kech keldi', value: c.late.count, color: GC.amber },
                            { label: 'Kelmadi', value: c.not_arrived.count, color: GC.slate },
                            { label: 'Aniqlanmagan', value: c.not_found.count, color: GC.red },
                        ]}
                        center={fmtGrouped(v.dash.total_users, 0)} centerSub="xodim" formatValue={(x) => fmtGrouped(x, 0)}
                    />
                </BigCard>

                <BigCard title="Kirish va chiqish — soatlar bo'yicha" style={card(empDemo, { gridColumn: 'span 2' })}>
                    <BigChartBox>
                        <Line data={{
                            labels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`),
                            datasets: [
                                { label: 'Kirish', data: v.hourlyIn, borderColor: GC.accent1, backgroundColor: alpha(GC.accent1, 0.2), borderWidth: 2, tension: 0.35, pointRadius: 0, fill: true },
                                { label: 'Chiqish', data: v.hourlyOut, borderColor: GC.amber, backgroundColor: alpha(GC.amber, 0.12), borderWidth: 2, tension: 0.35, pointRadius: 0, fill: true },
                            ],
                        }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales() } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Kunlik o'zgarish, %" style={card(kpiDemo)}>
                    <BigChartBox>
                        <Bar data={{
                            labels: ['Kelganlar', 'Ichkarida', 'Kech qolgan', 'Kelmagan', 'Erta ketgan', 'Aniqlanmagan'],
                            datasets: [{
                                data: [c.arrived, c.currently_in, c.late, c.not_arrived, c.early_left, c.not_found].map((s) => s.change_percent),
                                /* Kelganlar/ichkaridagilar o'sishi — yaxshi; qolganlari o'sishi — yomon. */
                                backgroundColor: [c.arrived, c.currently_in, c.late, c.not_arrived, c.early_left, c.not_found]
                                    .map((s, i) => ((i < 2 ? s.change_percent >= 0 : s.change_percent <= 0) ? GC.green : GC.red)),
                                borderRadius: 4, barPercentage: 0.75,
                            }],
                        }} options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true, beginAtZero: true }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Bo'limlar bo'yicha xodimlar" style={card(empDemo)}>
                    <BigChartBox>
                        <Bar data={{
                            labels: v.byDept.map(([k]) => k),
                            datasets: [barDs('Xodimlar', v.byDept.map(([, n]) => n), GC.accent1)],
                        }} options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Videokuzatuv — jonli" style={{ gridColumn: 'span 2', gridRow: 'span 2', padding: 'clamp(8px, 1.2cqmin, 12px)' }}>
                    <div style={{ flex: 1, minHeight: 0, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}`, background: 'var(--gc-panel-bg)' }}>
                        <StreamGrid />
                    </div>
                </BigCard>

                {/* ═══ 2-qator ═══ */}
                <BigCard title="Kechikishlar — bo'limlar bo'yicha" style={card(empDemo)}>
                    <BigChartBox>
                        <Bar data={{
                            labels: v.lateByDept.map(([k]) => k),
                            datasets: [barDs('Kech qolgan', v.lateByDept.map(([, n]) => n), GC.amber)],
                        }} options={{ ...chartBase, indexAxis: 'y', ...noLegend, scales: bigScales({ horizontal: true }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="So'nggi kirish-chiqish hodisalari" style={card(!v.realToday, { gridColumn: 'span 2' })}>
                    <BigRowList rows={v.events.length ? v.events.map(({ type, t, e }) => ({
                        label: e.full_name,
                        sub: `${hhmm(type === 'in' ? e.entry_time : e.exit_time)} · ${e.object_name || e.department || '—'}`,
                        value: type === 'in' ? (e.is_late ? 'Kech keldi' : 'Keldi') : 'Ketdi',
                        color: type === 'in' ? (e.is_late ? GC.amber : GC.green) : GC.accent1,
                    })) : emptyRow("Bugun hodisa qayd etilmagan")} />
                </BigCard>

                <BigCard title="Aniqlanmagan shaxslar" style={card(kpiDemo)}>
                    <BigRowList rows={v.dash.not_found_persons.length
                        ? v.dash.not_found_persons.slice(0, 6).map((p) => ({
                            label: p.turniket_name || p.door_label || 'Turniket',
                            sub: p.formatted_date,
                            value: p.door_label || 'Kirish',
                            color: GC.red,
                        }))
                        : emptyRow('Aniqlanmagan shaxs yo\'q')} />
                </BigCard>

                <BigCard title="Obyektlar bo'yicha kelganlar" style={card(!v.realToday)}>
                    <BigDonutBody
                        parts={v.byObject.map(([k, n], i) => ({ label: k, value: n, color: PALETTE[i % PALETTE.length] }))}
                        center={fmtGrouped(v.byObject.reduce((s, [, n]) => s + n, 0), 0)} centerSub="kelgan" formatValue={(x) => fmtGrouped(x, 0)}
                    />
                </BigCard>

                {/* ═══ 3-qator ═══ */}
                <BigCard title="Binoda hozir" style={card(kpiDemo)}>
                    <BigGauge
                        value={c.currently_in.count} max={v.total}
                        display={fmtGrouped(c.currently_in.count, 0)} caption={`${fmtGrouped((c.currently_in.count / v.total) * 100, 1)}% xodim ichkarida`}
                        color={GC.accent1}
                        rows={[
                            { label: 'Kelgan', value: fmtGrouped(c.arrived.count, 0), color: GC.green },
                            { label: 'Ketgan', value: fmtGrouped(c.left.count, 0), color: GC.amber },
                        ]}
                    />
                </BigCard>

                <BigCard title="Turniketlar bo'yicha o'tishlar" style={card(empDemo)}>
                    <BigChartBox>
                        <Bar data={{
                            labels: v.byDoor.map(([k]) => k),
                            datasets: [barDs("O'tishlar", v.byDoor.map(([, n]) => n), PALETTE)],
                        }} options={{ ...chartBase, ...noLegend, scales: bigScales() } as any} plugins={[bigBarLabel(0)]} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Lavozimlar bo'yicha" style={card(empDemo)}>
                    <BigDonutBody
                        parts={v.byPosition.map(([k, n], i) => ({ label: k, value: n, color: PALETTE[i % PALETTE.length] }))}
                        center={fmtGrouped(v.emps.length, 0)} centerSub="xodim" formatValue={false}
                    />
                </BigCard>

                <BigCard title="Birinchi kelganlar" style={card(empDemo)}>
                    <BigRowList rows={v.firstIn.map((e) => ({ label: e.full_name, sub: e.department, value: hhmm(e.entry_time), color: GC.green }))} />
                </BigCard>

                <BigCard title="Kech qolganlar" style={card(empDemo)}>
                    <BigRowList rows={v.lateList.length
                        ? v.lateList.map((e) => ({ label: e.full_name, sub: e.department, value: hhmm(e.entry_time), color: GC.amber }))
                        : emptyRow("Bugun kech qolgan yo'q")} />
                </BigCard>

                <BigCard title="Erta ketganlar" style={card(empDemo)}>
                    <BigRowList rows={v.earlyList.length
                        ? v.earlyList.map((e) => ({ label: e.full_name, sub: e.department, value: hhmm(e.exit_time), color: GC.violet }))
                        : emptyRow("Bugun erta ketgan yo'q")} />
                </BigCard>

                <BigCard title="Ish vaqti davomiyligi" style={card(empDemo)}>
                    <BigChartBox>
                        <Bar data={{
                            labels: ['< 4 soat', '4–6', '6–8', '8–10', '> 10 soat'],
                            datasets: [barDs('Xodimlar', v.durations, [GC.red, GC.amber, GC.accent1, GC.green, GC.violet])],
                        }} options={{ ...chartBase, ...noLegend, scales: bigScales() } as any} plugins={[bigBarLabel(0)]} />
                    </BigChartBox>
                </BigCard>

                {/* ═══ 4-qator: demo (API'da yo'q) ═══ */}
                <BigCard title="Haftalik davomat" style={bigDemoCardStyle}>
                    <BigChartBox>
                        <Bar data={{
                            labels: ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha'],
                            datasets: [
                                barDs("O'z vaqtida", [742, 761, 755, 748, 736, 402], GC.green),
                                barDs('Kech keldi', [81, 66, 70, 64, 58, 31], GC.amber),
                            ],
                        }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ stacked: true }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Oylik davomat, %" style={bigDemoCardStyle}>
                    <BigChartBox>
                        <Line data={{
                            labels: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn'],
                            datasets: [
                                { label: 'Davomat', data: [83.2, 84.6, 85.1, 86.4, 87.2, 85.9], borderColor: GC.green, backgroundColor: alpha(GC.green, 0.18), borderWidth: 2, tension: 0.35, pointRadius: 3, fill: true },
                                { label: 'Maqsad', data: [90, 90, 90, 90, 90, 90], borderColor: GC.slate, borderDash: [6, 4], borderWidth: 2, pointRadius: 0, fill: false },
                            ],
                        }} options={{ ...chartBase, plugins: legendLarge('top'), scales: bigScales({ beginAtZero: false }) } as any} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Kameralar holati" style={bigDemoCardStyle}>
                    <BigStatGrid items={[
                        { label: 'Onlayn kameralar', value: '132 / 156', color: GC.green },
                        { label: 'Yozuv', value: 'Faol', color: GC.accent1 },
                        { label: 'Xavfli hodisalar', value: '3', color: GC.red },
                        { label: 'Xotira band', value: '68%', color: GC.amber },
                    ]} />
                </BigCard>

                <BigCard title="Xavfsizlik hodisalari turlari" style={bigDemoCardStyle}>
                    <BigDonutBody
                        parts={[
                            { label: 'Ruxsatsiz kirish', value: 9, color: GC.red },
                            { label: 'Turniketdan sakrash', value: 6, color: '#f97316' },
                            { label: 'Begona shaxs', value: 5, color: GC.amber },
                            { label: 'Eshik ochiq qoldi', value: 4, color: GC.accent1 },
                        ]}
                        center="24" centerSub="hodisa" formatValue={(x) => String(x)}
                    />
                </BigCard>

                <BigCard title="Turniketlar ishlashi" style={bigDemoCardStyle}>
                    <BigProgressList items={[
                        { label: 'Asosiy kirish', value: 99.8, display: '99,8%', color: GC.green },
                        { label: 'Shimoliy turniket', value: 98.9, display: '98,9%', color: GC.green },
                        { label: 'Avtoturargoh', value: 94.2, display: '94,2%', color: GC.amber },
                        { label: 'Xizmat eshigi', value: 97.1, display: '97,1%', color: GC.accent1 },
                    ]} />
                </BigCard>

                <BigCard title="Kechikishlar — hafta kunlari" style={bigDemoCardStyle}>
                    <BigChartBox>
                        <Bar data={{
                            labels: ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha'],
                            datasets: [barDs('Kechikish, %', [9.8, 8.0, 8.5, 7.9, 7.3, 7.2], [GC.red, GC.amber, GC.amber, GC.amber, GC.green, GC.green])],
                        }} options={{ ...chartBase, ...noLegend, scales: bigScales({ decimals: 0 }) } as any} plugins={[bigBarLabel(1)]} />
                    </BigChartBox>
                </BigCard>

                <BigCard title="Sun'iy intellekt prognozlari" style={bigDemoCardStyle}>
                    <BigForecastList items={AI_FORECASTS} />
                </BigCard>
            </div>
        </BigDashRoot>
    );
}
