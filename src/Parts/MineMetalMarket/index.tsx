import React, {useState} from 'react';
import {GC} from '../../theme/palette';
import {
    ASSETS, Segment, ActiveUnit, InvestProjectListItem, TopKpi, fmtNum,
} from './data';
import { useCompanyData } from './useCompanyData';

/* ══════════════════════════════════════════════════════════════════════════
   MINE → METAL → MARKET — to'liq infografika.

   Tuzilishi (namunaviy rasmga mos):
     1) Yuqorida  — 7 ta KPI kartochkasi, markazda TMK belgisi;
     2) O'rtada   — TMK dan tarqaladigan ulanish chiziqlari va uchta doira
                    (MINE / METAL / MARKET);
     3) Pastda    — uchta ramkali kartochka. Har birida: sarlavha (chapda nom,
                    O'NGDA ikkita yig'ma ko'rsatkich), "faoliyatda bo'lgan"
                    obyektlarning KICHIK KARTOCHKALARI va "qurilayotgan /
                    loyiha bosqichidagi" obyektlar kartochkalari.

   Komponent dashboard katakchasida ham (`TopCenter`, ~435×288px), to'liq
   ekranda ham (`/main/mine-metal-market`) ishlaydi: barcha o'lchamlar `cqmin`
   birligida bo'lib, o'zi turgan konteynerga qarab masshtablanadi.
   ══════════════════════════════════════════════════════════════════════════ */

/** `clamp(min, Ncqmin, max)` — konteynerga nisbatan masshtablanuvchi o'lcham. */
const cq = (min: number, pref: number, max: number) => `clamp(${min}px, ${pref}cqmin, ${max}px)`;

/* ── Ikonkalar ── */
const Svg: React.FC<{ children: React.ReactNode; size?: number | string }> = ({children, size = 16}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

const ICONS: Record<string, React.ReactNode> = {
    users: <>
        <circle cx="9" cy="8" r="3.2"/>
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0"/>
        <path d="M16 5.3a3.2 3.2 0 0 1 0 5.4M17.5 14.4A6.5 6.5 0 0 1 21.5 20" strokeOpacity={0.55}/>
    </>,
    chart: <>
        <path d="M3 20.5h18"/>
        <rect x="5" y="12" width="3.4" height="8.5" rx="1"/>
        <rect x="10.3" y="7" width="3.4" height="13.5" rx="1"/>
        <rect x="15.6" y="4" width="3.4" height="16.5" rx="1"/>
    </>,
    coins: <>
        <ellipse cx="12" cy="6.5" rx="7.5" ry="3"/>
        <path d="M4.5 6.5v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-5"/>
        <path d="M4.5 11.5v5c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-5" strokeOpacity={0.55}/>
    </>,
    bolt: <>
        <path d="M13 2.5 4.5 13.5H11l-.5 8 8.5-11H12.5z"/>
    </>,
    drop: <>
        <path d="M12 3s6 6.4 6 10.4a6 6 0 1 1-12 0C6 9.4 12 3 12 3z"/>
    </>,
    leaf: <>
        <path d="M12 21c0-6 3.5-10 8-10.5C20 16 17 21 12 21z"/>
        <path d="M12 21v-4" strokeOpacity={0.55}/>
    </>,
    mine: <>
        <path d="M3 20.5 13 10.5"/>
        <path d="M8.5 5.5a7 7 0 0 1 10 10z"/>
        <path d="M14.5 3.5 20.5 9.5" strokeOpacity={0.55}/>
    </>,
    metal: <>
        <path d="M3 20.5V9l6 4V9l6 4V9l6 4v7.5z"/>
        <path d="M3 20.5h18" strokeOpacity={0.55}/>
    </>,
    market: <>
        <path d="M2.5 20.5h19"/>
        <path d="M4.5 20.5V9l7-4.5L18.5 9v11.5"/>
        <rect x="9" y="13" width="5" height="7.5" rx="1" strokeOpacity={0.55}/>
    </>,
    build: <>
        <path d="M3 20.5h18"/>
        <path d="M6 20.5V7l6-3.5V20.5"/>
        <path d="M12 10.5l6 3v7" strokeOpacity={0.55}/>
    </>,
    plan: <>
        <rect x="4" y="3.5" width="16" height="17" rx="2"/>
        <path d="M8 8h8M8 12h8M8 16h5" strokeOpacity={0.65}/>
    </>,
};

const Icon: React.FC<{ name: string; size?: number | string }> = ({name, size = 16}) => (
    <Svg size={size}>{ICONS[name] ?? <circle cx="12" cy="12" r="8"/>}</Svg>
);

const SEGMENT_ICON: Record<string, string> = {mine: 'mine', metal: 'metal', market: 'market'};

const Delta: React.FC<{ v: number | null; size?: number | string }> = ({v, size = 11}) => {
    if (v === null) return <span style={{color: GC.textDisabled, fontSize: size, fontWeight: 700}}>—</span>;
    const up = v >= 0;
    return (
        <span style={{color: up ? GC.success : GC.danger, fontSize: size, fontWeight: 700, whiteSpace: 'nowrap'}}>
            {up ? '▲' : '▼'} {up ? '+' : '−'}{Math.abs(v).toFixed(1)}%
        </span>
    );
};

/* ══════════════ 1) YUQORIDAGI KPI QATORI ══════════════ */

const KpiCard: React.FC<{ kpi: TopKpi }> = ({kpi}) => (
    <div style={{
        flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: cq(5, 1.4, 13),
        background: 'linear-gradient(160deg, rgba(13, 24, 38, .88), rgba(7, 14, 23, .82))',
        border: `1px solid ${GC.borderColor}`,
        borderRadius: cq(7, 1.9, 16), padding: `${cq(5, 1.4, 13)} ${cq(6, 1.7, 16)}`,
        backdropFilter: 'blur(5px)',
        boxShadow: '0 2px 14px rgba(0,0,0,.35)',
    }}>
        {/* Ikonka — o'z fonli kvadrat ichida, rasmga mos ravishda kattaroq */}
        <span style={{
            width: cq(18, 5, 44), height: cq(18, 5, 44), borderRadius: cq(5, 1.4, 12), flexShrink: 0,
            // background: `${GC.accent1}22`
            // , color: GC.accent2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            {/*<Icon name={kpi.icon} size={cq(10, 2.8, 24)} />*/}
            <img src={`/icons/` + kpi?.icon} alt="" style={{width: "100%"}}/>
        </span>

        <div style={{minWidth: 0, display: 'flex', flexDirection: 'column', gap: cq(1, 0.3, 3)}}>
            <div style={{
                color: GC.textSecondary, fontSize: cq(6, 1.6, 13), lineHeight: 1.2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{kpi.label}</div>
            <div style={{
                color: GC.textPrimary, fontSize: cq(11, 3.1, 22), fontWeight: 600,
                lineHeight: 1.1, whiteSpace: 'nowrap', letterSpacing: -0.2,
            }}>{kpi.value}</div>
            <div style={{display: 'flex', alignItems: 'baseline', gap: cq(2, 0.6, 6), minWidth: 0}}>
                <Delta v={kpi.delta} size={cq(6, 1.65, 13.5)}/>
                {kpi.note && (
                    <span style={{
                        color: GC.textDisabled, fontSize: cq(4.5, 1.15, 9.5),
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>({kpi.note})</span>
                )}
            </div>
        </div>
    </div>
);

/**
 * Markazdagi TMK belgisi — matn emas, kompaniyaning haqiqiy logotipi,
 * aylana ichida. Avval `mmm/tmk-logo.png` qidiriladi; u qo'yilmagan bo'lsa
 * loyihadagi mavjud `logow.png` ga tushadi (`onError`).
 */
const TmkBadge: React.FC = () => {
    const [src, setSrc] = useState<string>(ASSETS.logo);
    return (
        <div style={{
            position: 'relative', zIndex: 1,
            width: cq(46, 12.5, 112), height: cq(46, 12.5, 112), borderRadius: '50%', flexShrink: 0,
            background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #e8f4fb 62%, #cfe6f5 100%)',
            border: `${cq(1.5, 0.4, 3)} solid ${GC.accent2}`,
            boxShadow: `0 0 ${cq(7, 2, 26)} ${GC.accent1}88, inset 0 0 ${cq(4, 1.2, 14)} rgba(255,255,255,.9)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', padding: cq(3, 0.9, 9), boxSizing: 'border-box',
        }}>
            <img
                src={src}
                alt="TMK"
                onError={() => setSrc(ASSETS.logoFallback)}
                style={{width: '100%', height: '100%', objectFit: 'contain', display: 'block'}}
            />
        </div>
    );
};

/* ══════════════ 2) ULANISH CHIZIQLARI VA UCH DOIRA ══════════════ */

/**
 * Doiralarning gorizontal markazlari (konteyner kengligining %).
 * Ilgari ular 1/6 – 3/6 – 5/6 da edi (markazdan 33.3% uzoqlikda); MINE va
 * MARKET markazga 30% yaqinlashtirildi → 33.3 × 0.7 = 23.3%.
 * Ulanish chiziqlari ham AYNAN shu nuqtalarga tushadi.
 */
const NODE_X = [26.67, 50, 73.33];

/** Oraliq (KPI qatori ↔ o'rta tasma ↔ kartochkalar). */
const GAP = cq(3, 0.9, 10);
/** Gorizontal shina tasma tepasidan shuncha pastda. */
const BUS_TOP = cq(4, 1.2, 12);
/** MINE / METAL / MARKET doirasi diametri. */
const CIRCLE = cq(52, 14, 220);
/** Doiralar tasmaning pastki chetidan shuncha yuqorida turadi (4096×2160 da ≈180px — markazi tasmaning o'rtasiga yaqin). */
const CIRCLE_LIFT = cq(0, 8.7, 180);

/**
 * Pastdagi kartochkalar va o'rta tasma nisbati. Oldin tasma faqat chiziq +
 * doiralar balandligida (178px) edi, kartochkalar esa qolgan hamma joyni
 * (1709px @ 4096×2160) egallardi. Kartochkalar 25% pasaytirildi (≈1282px),
 * bo'shagan joy tasmaga berildi va ATAYLAB bo'sh qoldirilgan — fon panoramasi
 * ko'rinib turadi, doiralar esa tasmaning pastki chetiga tushgan.
 * 605 : 1282 ≈ 0.472 : 1.
 *
 * Kichik konteynerda (`TopCenter` katakchasi) tasma avvalgidek faqat chiziq
 * va doiralar balandligida, kartochkalardagi qo'shimcha ko'rsatkichlar esa
 * yashiriladi — u yerda ularga joy yo'q.
 */
const LAYOUT_CSS = `
.mmm-band { flex: 0.472 1 0; }
.mmm-cards { flex: 1 1 0; }
@container (max-width: 1600px) {
    .mmm-band { flex: 0 0 auto; }
    .mmm-extra { display: none !important; }
}
`;

/**
 * TMK belgisidan uchta doiraga tarqaladigan ulanish chiziqlari.
 *
 * Shakl — "elbow": belgidan chiqqan gorizontal shina, chetlarida YUMALOQ
 * burilish va doiralarga tik tushish (markazdagi METAL uchun oddiy tik chiziq).
 *
 * DIQQAT — nega SVG emas, CSS chegaralari: konteyner juda keng (~1500px),
 * `viewBox` esa kichkina. SVG `preserveAspectRatio="none"` bilan cho'zilganda
 * burchak radiusi gorizontal bo'yicha ~5 barobar yoyilib, dumaloq emas,
 * cho'zilgan ellips bo'lib qolardi. `border-radius` esa piksellarda
 * hisoblanadi — konteyner kengligidan qat'i nazar burchak doim bir xil
 * dumaloqlikda chiqadi. Neon nur `drop-shadow` orqali beriladi: u element
 * shakliga (ya'ni faqat chiziqlarga) ergashadi, `box-shadow` kabi to'rtburchak
 * hosil qilmaydi.
 */
const Connectors: React.FC = () => {
    /* Gorizontal shina `BUS_TOP` da; oyoqlar doiralarning TEPASIGACHA tushadi
       (doiralar tasmaning pastki chetida turadi). */
    const RADIUS = cq(7, 2.2, 20);
    const LINE = 2;

    /** Chiziq uchidagi nurli nuqta. */
    const Dot: React.FC<{ left: string; bottom?: number; top?: string; color: string }> = ({left, bottom, top, color}) => (
        <span style={{
            position: 'absolute', left, bottom, top,
            width: cq(4, 1.1, 7), height: cq(4, 1.1, 7),
            transform: 'translate(-50%, 50%)',
            borderRadius: '50%', background: color,
            boxShadow: `0 0 ${cq(4, 1.2, 9)} ${color}`,
        }}/>
    );

    return (
        <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: `calc(${CIRCLE} + ${CIRCLE_LIFT})`, pointerEvents: 'none' }}>
            {/* TMK belgisidan shinaga tushadigan tik chiziq — "TMK dan uch
                yo'nalish" shu nuqtadan tarqaladi. KPI qatori va oraliq ustidan
                yuqoriga cho'ziladi; belgi (z-index: 1) uning boshini yopib turadi. */}
            <div style={{
                position: 'absolute', left: `${NODE_X[1]}%`,
                top: `calc(-1 * (${GAP} + ${cq(23, 6.25, 56)} + ${cq(12, 3, 30)}))`, height: `calc(${GAP} + ${cq(23, 6.25, 56)} + ${cq(12, 3, 30)} + ${BUS_TOP})`,
                borderLeft: `${LINE}px solid ${GC.accent2}`,
                filter: `drop-shadow(0 0 ${cq(3, 0.9, 7)} ${GC.accent2}cc)`,
            }}/>

            {/* Chap yelka: gorizontal shina + yumaloq burchak + MINE ga tik tushish */}
            <div style={{
                position: 'absolute', top: BUS_TOP, bottom: 0,
                left: `${NODE_X[0]}%`, right: `${100 - NODE_X[1]}%`,
                borderLeft: `${LINE}px solid ${GC.success}`,
                borderTop: `${LINE}px solid ${GC.success}`,
                borderTopLeftRadius: RADIUS,
                filter: `drop-shadow(0 0 ${cq(3, 0.9, 7)} ${GC.success}cc)`,
            }}/>

            {/* O'ng yelka: MARKET ga */}
            <div style={{
                position: 'absolute', top: BUS_TOP, bottom: 0,
                left: `${NODE_X[1]}%`, right: `${100 - NODE_X[2]}%`,
                borderRight: `${LINE}px solid ${GC.accent1}`,
                borderTop: `${LINE}px solid ${GC.accent1}`,
                borderTopRightRadius: RADIUS,
                filter: `drop-shadow(0 0 ${cq(3, 0.9, 7)} ${GC.accent1}cc)`,
            }}/>

            {/* Markaz: METAL ga tik chiziq */}
            <div style={{
                position: 'absolute', top: BUS_TOP, bottom: 0, left: `${NODE_X[1]}%`,
                borderLeft: `${LINE}px solid #E0912B`,
                filter: `drop-shadow(0 0 ${cq(3, 0.9, 7)} #E0912Bcc)`,
            }}/>

            {/* Belgidan chiqish nuqtasi va doiralarga tutashish nuqtalari */}
            <Dot left={`${NODE_X[1]}%`} top={BUS_TOP} color={GC.accent2}/>
            <Dot left={`${NODE_X[0]}%`} bottom={0} color={GC.success}/>
            <Dot left={`${NODE_X[1]}%`} bottom={0} color="#E0912B"/>
            <Dot left={`${NODE_X[2]}%`} bottom={0} color={GC.accent1}/>
        </div>
    );
};

/* ══════════════ 2b) BOSQICH KARTOCHKALARIDAGI QO'SHIMCHA KO'RSATKICHLAR ══════════════
   API'da yo'q ko'rsatkichlar (zaxiralar, quvvat, sifat, eksport, narxlar
   va h.k.) — namuna ma'lumot, shu sabab SARIQ ramka. Har bir bosqich
   kartochkasida haqiqiy bloklardan (obyektlar, sexlar, investitsiya
   loyihalari) KEYIN turadi va qolgan bo'sh joyni to'liq egallaydi. */

type InfoRow = { label: string; value: string; pct?: number; color?: string };
type Info = { title: string; value: string; sub: string; rows: InfoRow[] };

const SEGMENT_INFO: Record<string, Info[]> = {
    mine: [
        {
            title: 'Geologik zaxiralar', value: '142,6 ming t', sub: 'WO₃ hisobida, tasdiqlangan',
            rows: [
                { label: 'Ingichka', value: '58%', pct: 58 },
                { label: "Qo'ytosh", value: '24%', pct: 24 },
                { label: 'Sarikoʻl', value: '18%', pct: 18 },
            ],
        },
        {
            title: 'Qazib olish rejasi', value: '94,2%', sub: '2026-yil, 8 oy bajarilishi',
            rows: [
                { label: 'Ruda qazib olish', value: '96%', pct: 96 },
                { label: 'Otval qayta ishlash', value: '91%', pct: 91 },
                { label: 'Gravikonsentrat', value: '95%', pct: 95 },
            ],
        },
        {
            title: 'Ruda sifati', value: '0,42% WO₃', sub: "o'rtacha metall miqdori",
            rows: [
                { label: 'Ingichka', value: '0,48%', pct: 80 },
                { label: 'Otvallar', value: '0,21%', pct: 35, color: GC.amber },
                { label: 'Ajratib olish darajasi', value: '72%', pct: 72 },
            ],
        },
        {
            title: 'Kon texnikasi tayyorligi', value: '87%', sub: '64 ta birlikdan 56 tasi ishda',
            rows: [
                { label: 'Ekskavatorlar', value: '9 / 10', pct: 90 },
                { label: 'Samosvallar', value: '31 / 36', pct: 86 },
                { label: "Burg'ulash qurilmalari", value: '16 / 18', pct: 89 },
            ],
        },
        {
            title: 'Kon xavfsizligi', value: '312 kun', sub: 'jarohatsiz ishlangan kunlar',
            rows: [
                { label: 'Xavfli vaziyatlar', value: '14', color: GC.amber },
                { label: "O'tkazilgan tekshiruvlar", value: '48', color: GC.success },
                { label: 'Bartaraf etilgan kamchiliklar', value: '93%', pct: 93 },
            ],
        },
        {
            title: 'Ekologik monitoring', value: "Me'yorda", sub: '6 ta nazorat nuqtasi',
            rows: [
                { label: 'Chang (PM10)', value: "61% me'yordan", pct: 61 },
                { label: 'Suv sifati', value: "48% me'yordan", pct: 48 },
                { label: 'Rekultivatsiya', value: '34 ga', pct: 57 },
            ],
        },
    ],
    metal: [
        {
            title: 'Quvvatdan foydalanish', value: '81,4%', sub: 'Chirchiq zavodi',
            rows: [
                { label: '4-sex — WO₃', value: '88%', pct: 88 },
                { label: '5-sex — TMA', value: '79%', pct: 79 },
                { label: '3-sex — qattiq qotishma', value: '74%', pct: 74 },
            ],
        },
        {
            title: 'Mahsulot sifati', value: '98,7%', sub: '1-nav mahsulot ulushi',
            rows: [
                { label: 'WO₃', value: '99,1%', pct: 99.1 },
                { label: 'Ammoniy paravolframati', value: '98,6%', pct: 98.6 },
                { label: 'MoO₃', value: '97,9%', pct: 97.9 },
            ],
        },
        {
            title: 'Xomashyo yetkazib berish', value: '1 845 t', sub: 'konsentrat, joriy oy',
            rows: [
                { label: 'Ingichka → 4-sex', value: '62%', pct: 62 },
                { label: 'Navoiy → 5-sex', value: '27%', pct: 27 },
                { label: 'Import', value: '11%', pct: 11 },
            ],
        },
        {
            title: 'Xomashyo zaxirasi', value: '38 kun', sub: "ishlab chiqarishni ta'minlash",
            rows: [
                { label: 'W-konsentrat', value: '42 kun', pct: 70 },
                { label: 'Mo-konsentrat', value: '31 kun', pct: 52, color: GC.amber },
                { label: 'Reagentlar', value: '55 kun', pct: 92 },
            ],
        },
        {
            title: 'Energiya sarfi', value: '4 820 kVt·soat/t', sub: 'mahsulot birligiga',
            rows: [
                { label: 'Elektr energiya', value: '71%', pct: 71 },
                { label: 'Tabiiy gaz', value: '22%', pct: 22 },
                { label: 'Bug\' va issiqlik', value: '7%', pct: 7 },
            ],
        },
        {
            title: 'Uskunalar samaradorligi', value: '76% OEE', sub: 'umumiy uskuna samaradorligi',
            rows: [
                { label: 'Tayyorlik', value: '91%', pct: 91 },
                { label: 'Unumdorlik', value: '87%', pct: 87 },
                { label: 'Sifat', value: '96%', pct: 96 },
            ],
        },
    ],
    market: [
        {
            title: 'Eksport ulushi', value: '64%', sub: 'realizatsiya hajmida',
            rows: [
                { label: 'Xitoy', value: '31%', pct: 31 },
                { label: 'Yevropa', value: '18%', pct: 18 },
                { label: 'Janubiy Koreya', value: '9%', pct: 9 },
                { label: 'Ichki bozor', value: '36%', pct: 36, color: GC.slate },
            ],
        },
        {
            title: 'Jahon narxlari', value: '612 $/mtu', sub: "APT, oylik o'zgarish ▲ 4,8%",
            rows: [
                { label: 'APT', value: '612 $/mtu ▲', color: GC.success },
                { label: 'Ferromolibden', value: '48,2 $/kg ▲', color: GC.success },
                { label: 'Volfram konsentrati', value: '455 $/mtu ▼', color: GC.danger },
            ],
        },
        {
            title: 'Shartnomalar portfeli', value: '186,4 mln $', sub: "2026-yil uchun imzolangan",
            rows: [
                { label: 'Uzoq muddatli', value: '68%', pct: 68 },
                { label: 'Spot savdo', value: '21%', pct: 21 },
                { label: 'Birja orqali', value: '11%', pct: 11 },
            ],
        },
        {
            title: 'Yetkazib berish intizomi', value: '93,5%', sub: "o'z vaqtida va to'liq (OTIF)",
            rows: [
                { label: "Temir yo'l", value: '95%', pct: 95 },
                { label: 'Avtotransport', value: '92%', pct: 92 },
                { label: 'Multimodal', value: '88%', pct: 88, color: GC.amber },
            ],
        },
        {
            title: 'Debitorlik qarzi', value: '24,7 mln $', sub: "o'rtacha undirish — 38 kun",
            rows: [
                { label: '30 kungacha', value: '71%', pct: 71 },
                { label: '30–60 kun', value: '22%', pct: 22, color: GC.amber },
                { label: '60 kundan ortiq', value: '7%', pct: 7, color: GC.danger },
            ],
        },
        {
            title: 'Asosiy xaridorlar', value: '42 ta', sub: 'faol mijozlar, 9 mamlakat',
            rows: [
                { label: 'TOP-5 xaridor ulushi', value: '54%', pct: 54 },
                { label: 'Takroriy buyurtmalar', value: '81%', pct: 81 },
                { label: 'Yangi mijozlar', value: '6 ta', color: GC.success },
            ],
        },
    ],
};

const InfoCard: React.FC<{ info: Info; accent: string }> = ({info, accent}) => (
    <div style={{
        minWidth: 0, minHeight: 0, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', gap: cq(3, 0.8, 12),
        background: 'linear-gradient(160deg, rgba(13, 24, 38, .9), rgba(7, 14, 23, .86))',
        border: `1px solid ${GC.amber}73`,
        borderRadius: cq(6, 1.8, 16), padding: `${cq(5, 1.4, 20)} ${cq(6, 1.6, 22)}`,
        backdropFilter: 'blur(5px)', boxShadow: '0 2px 14px rgba(0,0,0,.35)',
    }}>
        <div style={{display: 'flex', alignItems: 'center', gap: cq(3, 0.7, 10), minWidth: 0}}>
            <span style={{width: cq(4, 0.9, 12), height: cq(4, 0.9, 12), borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}`, flexShrink: 0}}/>
            <span style={{
                color: GC.textSecondary, fontSize: cq(6, 1.4, 22), fontWeight: 600,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{info.title}</span>
        </div>
        <div>
            <div style={{color: GC.textPrimary, fontSize: cq(11, 2.6, 44), fontWeight: 700, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{info.value}</div>
            <div style={{color: GC.textDisabled, fontSize: cq(5, 1.1, 17), marginTop: cq(1, 0.3, 4), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{info.sub}</div>
        </div>
        <div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: cq(2, 0.5, 8)}}>
            {info.rows.map((r) => {
                const color = r.color ?? accent;
                return (
                    <div key={r.label} style={{minWidth: 0}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: cq(5.5, 1.2, 19), marginBottom: cq(1, 0.3, 6)}}>
                            <span style={{color: GC.textSecondary, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{r.label}</span>
                            <span style={{color: r.pct === undefined ? color : GC.textPrimary, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap'}}>{r.value}</span>
                        </div>
                        {r.pct !== undefined && (
                            <div style={{height: cq(2, 0.4, 9), borderRadius: 6, background: 'rgba(255,255,255,.08)', overflow: 'hidden'}}>
                                <div style={{width: `${Math.min(100, r.pct)}%`, height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${color}88, ${color})`}}/>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
);

/** MINE / METAL / MARKET doirasi. */
const SegmentNode: React.FC<{ seg: Segment; onClick: () => void }> = ({seg, onClick}) => (
    <button
        // onClick={onClick}
        title={`${seg.title} — batafsil`}
        style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            width: CIRCLE, height: CIRCLE, borderRadius: '50%',
            cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit', padding: 0,
            background: `radial-gradient(circle at 50% 34%, ${seg.accent}45, rgba(7,13,21,.94) 72%)`,
            border: `${cq(1.5, 0.4, 4)} solid ${seg.accent}`,
            boxShadow: `0 0 ${cq(5, 1.5, 30)} ${seg.accent}66`,
            color: GC.textPrimary,
        }}
    >
        {/*<span style={{color: seg.accent, display: 'flex'}}>*/}
        {/*    <Icon name={SEGMENT_ICON[seg.key]}*/}
        {/*                                                         */}
        {/*                                                         size={cq(11, 2.9, 24)}/>*/}
        {/*</span>*/}

        <span
            style={{fontSize: cq(8, 2.2, 34), fontWeight: 800, letterSpacing: 0.5, lineHeight: 1.15}}>{seg.code}</span>
        <span style={{
            color: GC.textSecondary, fontSize: cq(4.5, 1.1, 17), textAlign: 'center',
            lineHeight: 1.2, padding: `0 ${cq(3, 1, 10)}`,
        }}>{seg.nodeCaption}</span>
    </button>
);

/* ══════════════ 3) KARTOCHKA ICHIDAGI KICHIK KARTOCHKALAR ══════════════ */

/** Segment kaliti bo'yicha obyekt fotosi — haqiqiy rasm ulanmagani uchun vakillik. */
const UNIT_PHOTO: Record<string, string> = {
    mine: '/imgs/re3.jpg', metal: '/imgs/re0.jpg', market: '/imgs/re2.jpg',
};

/** Faoliyatdagi obyekt — foto, nom + o'zgarish, ishlab chiqarish (+ xodimlar, bo'lsa). */
const ActiveUnitCard: React.FC<{ unit: ActiveUnit; accent: string; segKey: string }> = ({unit, accent, segKey}) => {
    const hasStaff = unit.staff > 0;
    return (
        <div style={{
            background: 'rgba(6, 12, 20, .62)', border: `1px solid ${GC.borderColor}`,
            borderRadius: cq(4, 1.2, 10), padding: cq(3.5, 1, 8), minWidth: 0,
            display: 'flex', flexDirection: 'column', gap: cq(2.5, 0.7, 7),
        }}>
            <img
                src={UNIT_PHOTO[segKey] ?? UNIT_PHOTO.mine} alt=""
                style={{
                    width: '100%', height: cq(18, 4.8, 42), objectFit: 'cover',
                    borderRadius: cq(3, 0.8, 6), display: 'block', flexShrink: 0,
                }}
            />

            <div style={{
                color: GC.textPrimary, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                gap: cq(2, 0.5, 5), fontSize: cq(5.5, 1.4, 11.5), fontWeight: 700, lineHeight: 1.25,
            }}>
                <span style={{
                    minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }} title={unit.name}>{unit.name}</span>
                <Delta v={unit.delta} size={cq(5, 1.25, 10)}/>
            </div>

            <div style={{
                display: 'flex', alignItems: 'flex-end', justifyContent: hasStaff ? 'space-between' : 'flex-start',
                gap: cq(3, 0.8, 8), minWidth: 0, marginTop: 'auto',
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: cq(1.5, 0.45, 4.5), minWidth: 0}}>
                    <span style={{color: accent, display: 'flex', flexShrink: 0}}>
                        <Icon name="chart" size={cq(6.5, 1.7, 13)}/>
                    </span>
                    <span style={{minWidth: 0}}>
                        <div style={{
                            color: GC.textPrimary, fontSize: cq(5.5, 1.45, 11.5), fontWeight: 700,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{unit.output}</div>
                        <div style={{
                            color: GC.textDisabled, fontSize: cq(4.2, 1, 8.5), lineHeight: 1.25,
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{unit.outputLabel}</div>
                    </span>
                </div>

                {hasStaff && (
                    <div style={{display: 'flex', alignItems: 'center', gap: cq(1.5, 0.45, 4.5), flexShrink: 0}}>
                        <span style={{color: GC.accent2, display: 'flex', flexShrink: 0}}>
                            <Icon name="users" size={cq(6.5, 1.7, 13)}/>
                        </span>
                        <span>
                            <div style={{color: GC.textPrimary, fontSize: cq(5.5, 1.45, 11.5), fontWeight: 700}}>{fmtNum(unit.staff)}</div>
                            <div style={{color: GC.textDisabled, fontSize: cq(4.2, 1, 8.5)}}>Xodimlar</div>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * Zavod darajasidagi "ota" kartochka — ostidagi sexlar guruhidan ajratish
 * uchun kattaroq, gorizontal va aksent bilan ajralib turadi (bitta zavod
 * bo'lsa ham qator to'liq cho'ziladi — bo'sh joy qolmaydi).
 */
const FactoryCard: React.FC<{ unit: ActiveUnit; accent: string; segKey: string }> = ({unit, accent, segKey}) => {
    const hasStaff = unit.staff > 0;
    return (
        <div style={{
            display: 'flex', alignItems: 'stretch', gap: cq(4, 1.1, 10), minWidth: 0,
            background: `linear-gradient(120deg, ${accent}22, rgba(6,12,20,.6))`,
            border: `1px solid ${accent}55`, borderLeft: `${cq(2, 0.6, 4)} solid ${accent}`,
            borderRadius: cq(5, 1.4, 11), padding: cq(4, 1.1, 9),
            boxShadow: `0 2px 10px ${accent}22`,
        }}>
            <img
                src={UNIT_PHOTO[segKey] ?? UNIT_PHOTO.mine} alt=""
                style={{
                    width: cq(34, 9, 74), height: cq(34, 9, 74), objectFit: 'cover',
                    borderRadius: cq(3, 0.9, 7), flexShrink: 0, display: 'block',
                }}
            />
            <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: cq(2.5, 0.7, 6)}}>
                <div style={{display: 'flex', alignItems: 'center', gap: cq(2, 0.6, 6), minWidth: 0}}>
                    <span style={{
                        background: `${accent}26`, color: accent, fontWeight: 800,
                        fontSize: cq(4, 0.95, 8), padding: `${cq(0.8, 0.25, 2)} ${cq(2, 0.6, 6)}`,
                        borderRadius: cq(2.5, 0.7, 5), flexShrink: 0, letterSpacing: 0.3,
                    }}>ZAVOD</span>
                    <span style={{
                        color: GC.textPrimary, fontSize: cq(6.5, 1.7, 13.5), fontWeight: 700, minWidth: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                    }} title={unit.name}>{unit.name}</span>
                    <Delta v={unit.delta} size={cq(5.5, 1.4, 11)}/>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: cq(4, 1.1, 10), minWidth: 0}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: cq(1.5, 0.45, 4.5), minWidth: 0}}>
                        <span style={{color: accent, display: 'flex', flexShrink: 0}}><Icon name="chart" size={cq(7, 1.8, 14)}/></span>
                        <span style={{minWidth: 0}}>
                            <div style={{color: GC.textPrimary, fontSize: cq(6, 1.55, 12.5), fontWeight: 700, whiteSpace: 'nowrap'}}>{unit.output}</div>
                            <div style={{color: GC.textDisabled, fontSize: cq(4.2, 1, 8.5)}}>{unit.outputLabel}</div>
                        </span>
                    </div>
                    {hasStaff && (
                        <div style={{display: 'flex', alignItems: 'center', gap: cq(1.5, 0.45, 4.5), minWidth: 0}}>
                            <span style={{color: GC.accent2, display: 'flex', flexShrink: 0}}><Icon name="users" size={cq(7, 1.8, 14)}/></span>
                            <span>
                                <div style={{color: GC.textPrimary, fontSize: cq(6, 1.55, 12.5), fontWeight: 700}}>{fmtNum(unit.staff)}</div>
                                <div style={{color: GC.textDisabled, fontSize: cq(4.2, 1, 8.5)}}>Xodimlar</div>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/** Qurilayotgan / loyiha bosqichidagi obyekt — ochroq fonli kartochka. */
/** Investitsiya summasi — "41 mln $" / "54,6 mln $". Butun son bo'lsa kasr chiqmaydi. */
const fmtUsd = (n: number | null | undefined): string => {
    if (n === null || n === undefined) return '—';
    const r = Math.round(n * 10) / 10;
    const s = Number.isInteger(r) ? String(r) : String(r).replace('.', ',');
    return `${s} mln $`;
};

/** Ulush — `0.35` → `"35%"`. */
const fmtShare = (v: number | null | undefined): string =>
    v === null || v === undefined ? '—' : `${Math.round(v * 100)}%`;

/**
 * Investitsiya loyihasi kartochkasi — GET /invest-projects?type= dan.
 * Faoliyatdagi obyektlarning to'q shisha kartochkalaridan farqli, ONGROQ
 * fonda: hali qurilmagan/reja bosqichidagi loyiha — "chizma" kabi ochroq.
 */
const InvestProjectCard: React.FC<{ p: InvestProjectListItem; accent: string }> = ({p, accent}) => (
    <div style={{
        background: 'linear-gradient(160deg, #F6F8FA, #E4E9EE)',
        border: '1px solid rgba(13, 23, 33, .09)',
        borderRadius: cq(4, 1.2, 10), padding: cq(4, 1.05, 9), minWidth: 0,
        display: 'flex', flexDirection: 'column', gap: cq(2.5, 0.7, 7),
        boxShadow: '0 1px 4px rgba(13,23,33,.1)',
    }}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: cq(2, 0.6, 6)}}>
            <span style={{
                background: `${accent}1c`, color: accent, fontWeight: 700,
                fontSize: cq(4.2, 1, 8.5), padding: `${cq(1, 0.3, 3)} ${cq(2.2, 0.6, 6)}`,
                borderRadius: cq(3, 0.7, 6), whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis', minWidth: 0,
            }} title={p.kind ?? undefined}>{p.kind ?? 'Loyiha'}</span>
            <span style={{color: accent, fontWeight: 800, fontSize: cq(5, 1.25, 11), flexShrink: 0}}>
                {fmtShare(p.progressShare)}
            </span>
        </div>

        <div style={{
            color: '#16212C', fontSize: cq(5.5, 1.4, 11.5), fontWeight: 700, lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }} title={p.name}>{p.name}</div>

        <div style={{height: cq(1.2, 0.3, 3), borderRadius: 3, background: 'rgba(13,23,33,.12)', overflow: 'hidden', flexShrink: 0}}>
            <div style={{
                width: `${Math.max(0, Math.min(100, Math.round((p.progressShare ?? 0) * 100)))}%`,
                height: '100%', background: accent, borderRadius: 3,
            }}/>
        </div>

        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: cq(2, 0.6, 6), minWidth: 0}}>
            <div style={{display: 'flex', alignItems: 'center', gap: cq(1.3, 0.4, 4), minWidth: 0}}>
                <span style={{color: accent, display: 'flex', flexShrink: 0}}><Icon name="coins" size={cq(6, 1.5, 12)}/></span>
                <span style={{color: '#16212C', fontSize: cq(5, 1.25, 10.5), fontWeight: 700, whiteSpace: 'nowrap'}}>
                    {fmtUsd(p.totalCostMlnUsd)}
                </span>
            </div>
            {!!p.jobs && (
                <div style={{display: 'flex', alignItems: 'center', gap: cq(1.3, 0.4, 4), minWidth: 0, flexShrink: 0}}>
                    <span style={{color: '#5B6B7A', display: 'flex', flexShrink: 0}}><Icon name="users" size={cq(6, 1.5, 12)}/></span>
                    <span style={{color: '#16212C', fontSize: cq(5, 1.25, 10.5), fontWeight: 700, whiteSpace: 'nowrap'}}>
                        {fmtNum(p.jobs)}
                    </span>
                </div>
            )}
        </div>

        <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: cq(2, 0.6, 6),
            borderTop: '1px solid rgba(13,23,33,.09)', paddingTop: cq(2, 0.5, 5), minWidth: 0,
        }}>
            <span style={{
                color: '#5B6B7A', fontSize: cq(4.2, 0.95, 8.5), whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0,
            }} title={p.region ?? undefined}>{p.region ?? '—'}</span>
            <span style={{color: '#5B6B7A', fontSize: cq(4.2, 0.95, 8.5), whiteSpace: 'nowrap', flexShrink: 0}}>
                {p.commissioningText ?? p.endDateText ?? ''}
            </span>
        </div>
    </div>
);

/** Investitsiya loyihalari hali yo'q bo'lganda ko'rsatiladigan bo'sh holat. */
const InvestEmpty: React.FC = () => (
    <div style={{
        gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(230,237,243,.5)',
        fontSize: cq(4.8, 1.2, 10.5), border: `1px dashed ${GC.borderColor}`,
        borderRadius: cq(4, 1.2, 10), padding: cq(6, 1.6, 14),
    }}>Hozircha investitsiya loyihalari yo'q</div>
);

/** Bo'lim sarlavhasi: rangli nuqta + nom + "N ta". */
const BlockTitle: React.FC<{ text: string; count: number; accent: string }> = ({text, count, accent}) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: cq(3, 0.9, 8), flexShrink: 0,
        background: `${accent}1f`, border: `1px solid ${accent}3d`,
        borderRadius: cq(4, 1.1, 9), padding: `${cq(3, 0.8, 7)} ${cq(4, 1.2, 11)}`,
        margin: `${cq(2, 0.6, 6)} 0 ${cq(3, 0.9, 9)}`,
    }}>
        <span style={{
            width: cq(4, 1.1, 9), height: cq(4, 1.1, 9), borderRadius: '50%',
            background: accent, flexShrink: 0,
        }}/>
        <span style={{
            flex: 1, minWidth: 0, color: GC.textPrimary, fontSize: cq(5, 1.35, 11),
            fontWeight: 700, letterSpacing: 0.4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{text}</span>
        <span style={{
            background: `${accent}33`,
            color: accent,
            fontSize: cq(4.5, 1.25, 10.5),
            fontWeight: 700,
            padding: `${cq(1, 0.3, 3)} ${cq(3, 0.9, 8)}`,
            borderRadius: cq(3, 0.8, 6),
            flexShrink: 0,
            whiteSpace: 'nowrap',
        }}>{count} ta</span>
    </div>
);

/* ══════════════ BOSQICH KARTOCHKASI ══════════════ */

const SegmentCard: React.FC<{ seg: Segment; onOpen: () => void }> = ({seg, onOpen}) => (
    <section style={{
        display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden',
        /* Fon — ramka rasmi (cho'zilib kartochkani to'ldiradi). */
        // backgroundImage: `url(${ASSETS.frames[seg.key]})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        // backgroundColor: `#061B2B`,
        background: `${seg?.code === "MINE" ? "linear-gradient(145deg, #063D3B, #06212C)" : seg?.code === "METAL" ? "linear-gradient(145deg, #3D2415, #171D25)" : "linear-gradient(145deg, #073B6B, #061D30)"}`,
        boxShadow: '0 0 12px rgba(0, 217, 255, 0.25), inset 0 0 12px rgba(0, 217, 255, 0.05)',
        border: `1px solid ${seg?.code === "MINE" ? "#00E6A0" : seg?.code === "METAL" ? "#FF9D22" : "#178CFF"}`,
        borderRadius: cq(6, 1.8, 16),
        padding: cq(5, 1.4, 13),
    }}>
        {/* ── Sarlavha: chapda nom, O'NGDA ikkita ko'rsatkich ── */}
        <header style={{display: 'flex', alignItems: 'center', gap: cq(4, 1.1, 10), flexShrink: 0}}>


            {
                seg?.code === "MINE" ?
                    <svg width={cq(24, 6.5, 46)} height={cq(24, 6.5, 46)} viewBox="0 0 64 64" fill="none"
                         xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0, filter: "drop-shadow(0 0 10px rgba(0, 255, 170, 0.5))"}}
                    >
                        <defs>
                            <linearGradient id="mineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#00ffaa"/>
                                <stop offset="100%" stopColor="#008855"/>
                            </linearGradient>
                        </defs>

                        <path d="M8 48L24 20L36 38L44 26L56 48H8Z" fill="url(#mineGrad)" fillOpacity={0.2}
                              stroke="url(#mineGrad)" strokeWidth={2.5} strokeLinejoin="round"/>

                        <path d="M22 28L42 48" stroke="url(#mineGrad)" strokeWidth={3} strokeLinecap="round"/>
                        <path d="M42 28L22 48" stroke="url(#mineGrad)" strokeWidth={3} strokeLinecap="round"/>
                        <path d="M16 22C22 20 28 22 28 22" stroke="url(#mineGrad)" strokeWidth={3}
                              strokeLinecap="round"/>
                        <path d="M36 22C42 20 48 22 48 22" stroke="url(#mineGrad)" strokeWidth={3}
                              strokeLinecap="round"/>

                        <circle cx="32" cy="14" r="3" fill="#00ffaa"/>
                    </svg>

                    : seg?.code === "METAL" ?
                        <svg width={cq(24, 6.5, 46)} height={cq(24, 6.5, 46)} viewBox="0 0 64 64" fill="none"
                             xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0, filter: "drop-shadow(0 0 10px rgba(255, 170, 0, 0.5))"}}>
                            <defs>
                                <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#ffcc00"/>
                                    <stop offset="100%" stopColor="#ff6600"/>
                                </linearGradient>
                            </defs>

                            <circle cx="32" cy="36" r="16" stroke="url(#metalGrad)" strokeWidth={2.5}
                                    strokeDasharray="6 3"/>
                            <circle cx="32" cy="36" r="8" stroke="url(#metalGrad)" strokeWidth={2}/>

                            <path
                                d="M32 8C32 8 38 16 38 22C38 25.3137 35.3137 28 32 28C28.6863 28 26 25.3137 26 22C26 16 32 8 32 8Z"
                                fill="url(#metalGrad)"/>
                            <path
                                d="M32 16C32 16 34.5 20 34.5 22C34.5 23.3807 33.3807 24.5 32 24.5C30.6193 24.5 29.5 23.3807 29.5 22C29.5 20 32 16 32 16Z"
                                fill="#ffffff"/>
                        </svg>

                        :

                        <svg width={cq(24, 6.5, 46)} height={cq(24, 6.5, 46)} viewBox="0 0 64 64" fill="none"
                             xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0, filter: "drop-shadow(0 0 10px rgba(0, 170, 255, 0.5))"}}
                        >
                            <defs>
                                <linearGradient id="marketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#00d4ff"/>
                                    <stop offset="100%" stopColor="#0055ff"/>
                                </linearGradient>
                            </defs>

                            <circle cx="32" cy="32" r="22" stroke="url(#marketGrad)" strokeWidth={2.5}/>
                            <ellipse cx="32" cy="32" rx="22" ry="9" stroke="url(#marketGrad)" strokeWidth={2}/>
                            <path d="M32 10V54" stroke="url(#marketGrad)" strokeWidth={2}/>

                            <path d="M18 42L28 32L36 38L48 22" stroke="#ffffff" strokeWidth={3} strokeLinecap="round"
                                  strokeLinejoin="round"/>
                            <path d="M40 22H48V30" stroke="#ffffff" strokeWidth={3} strokeLinecap="round"
                                  strokeLinejoin="round"/>
                        </svg>
            }

            <div style={{flex: 1, minWidth: 0}}>
                <div style={{
                    color: GC.textPrimary, fontSize: cq(7.5, 2, 17), fontWeight: 700, lineHeight: 1.2,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }} title={seg.title}>{seg.title}</div>
                <div style={{
                    color: GC.textSecondary, fontSize: cq(5, 1.3, 12), lineHeight: 1.25, marginTop: 5,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {seg.tagline}
                </div>
            </div>

            <div style={{display: 'flex', gap: cq(4, 1.2, 14), flexShrink: 0}}>
                {seg.summary.map((s, i) => (

                                <div key={s.label} style={{display: 'flex', alignItems: 'center', gap: cq(2, 0.6, 6)}}>
                                 <span style={{color: i === 0 ? GC.accent2 : seg.accent, display: 'flex', flexShrink: 0}}>

                                     {
                                         i === 0 ?   <img src="/icons/z4.png" style={{width: cq(20, 6.8, 46), height: 'auto'}} alt=""/> :   <img src="/icons/z5.png" style={{width: cq(20, 6.8, 46), height: 'auto'}} alt=""/>
                                     }
                                 </span>
                                    <div>
                                        <div style={{
                                            color: GC.textPrimary, fontSize: cq(6.5, 1.7, 18), fontWeight: 700,
                                            lineHeight: 1.15, whiteSpace: 'nowrap',
                                        }}>{s.value}</div>
                                        <div style={{
                                            color: GC.textDisabled,
                                            fontSize: cq(4.5, 1.05, 12),
                                            whiteSpace: 'nowrap'
                                        }}>{s.label}</div>
                                    </div>
                                </div>
                ))}
            </div>
        </header>

        {/* ── Tarkib: haqiqiy bloklar o'z balandligida, qo'shimcha ko'rsatkichlar
               qolgan joyni egallaydi (joy yetmasa aylantiriladi) ── */}
        <div style={{flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column'}}>
            <BlockTitle text={seg.activeTitle} count={seg.active.length} accent={seg.accent}/>

            <div style={{
                display: 'grid', flexShrink: 0,
                gridTemplateColumns: seg.activeSecondary ? 'repeat(auto-fit, minmax(180px, 1fr))' : 'repeat(3, minmax(0, 1fr))',
                gap: cq(3, 0.9, 9),
            }}>
                {seg.active.map((u) => (
                    seg.activeSecondary
                        ? <FactoryCard key={u.name} unit={u} accent={seg.accent} segKey={seg.key}/>
                        : <ActiveUnitCard key={u.name} unit={u} accent={seg.accent} segKey={seg.key}/>
                ))}
            </div>

            {!!seg.activeSecondary?.length && (
                <>
                    <BlockTitle text={seg.activeSecondaryTitle ?? ''} count={seg.activeSecondary.length} accent={seg.accent}/>
                    <div style={{
                        display: 'grid', flexShrink: 0, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: cq(3, 0.9, 9),
                    }}>
                        {seg.activeSecondary.map((u) => (
                            <ActiveUnitCard key={u.name} unit={u} accent={seg.accent} segKey={seg.key}/>
                        ))}
                    </div>
                </>
            )}

            <BlockTitle text={seg.investTitle} count={seg.investProjects.length} accent={seg.accent}/>
            <div style={{
                display: 'grid', flexShrink: 0, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: cq(3, 0.9, 9),
            }}>
                {seg.investProjects.length
                    ? seg.investProjects.map((p) => <InvestProjectCard key={p.id} p={p} accent={seg.accent}/>)
                    : <InvestEmpty/>}
            </div>

            {/* Qo'shimcha ko'rsatkichlar — 3 × 2, qolgan balandlikni to'liq egallaydi */}
            <div className="mmm-extra" style={{flex: 1, minHeight: cq(160, 40, 560), display: 'flex', flexDirection: 'column'}}>
                <BlockTitle text="QO'SHIMCHA KO'RSATKICHLAR" count={(SEGMENT_INFO[seg.key] ?? []).length} accent={seg.accent}/>
                <div style={{
                    flex: 1, minHeight: 0, display: 'grid', gap: cq(3, 0.9, 9),
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
                }}>
                    {(SEGMENT_INFO[seg.key] ?? []).map((info) => <InfoCard key={info.title} info={info} accent={seg.accent}/>)}
                </div>
            </div>
        </div>

        {/* Katakcha kichik bo'lganda to'liq ko'rish uchun */}
        {/*<button*/}
        {/*    onClick={onOpen}*/}
        {/*    style={{*/}
        {/*        marginTop: cq(3, 0.8, 8), flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit',*/}
        {/*        background: `${seg.accent}1f`, border: `1px solid ${seg.accent}4d`,*/}
        {/*        borderRadius: cq(4, 1.1, 9), padding: `${cq(3, 0.7, 7)} ${cq(4, 1.1, 10)}`,*/}
        {/*        color: seg.accent, fontSize: cq(5, 1.3, 11), fontWeight: 700, whiteSpace: 'nowrap',*/}
        {/*    }}*/}
        {/*>Batafsil ko'rish →*/}
        {/*</button>*/}
    </section>
);

/* ══════════════ MODAL ══════════════ */

const SegmentModal: React.FC<{ seg: Segment; onClose: () => void }> = ({seg, onClose}) => (
    <div
        onClick={onClose}
        style={{
            position: 'fixed', inset: 0, zIndex: 1300,
            background: 'rgba(4, 8, 14, .76)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}
    >
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                width: 'min(900px, 100%)', maxHeight: '88vh', display: 'flex', flexDirection: 'column',
                borderRadius: 16, boxSizing: 'border-box', containerType: 'size',
                border: `1px solid ${seg.accent}55`,
                backgroundImage: `linear-gradient(180deg, rgba(7,13,21,.94), rgba(6,11,18,.97)), url(${ASSETS.background})`,
                backgroundSize: 'cover, cover',
                backgroundPosition: 'center, center',
                fontFamily: '"Segoe UI", system-ui, sans-serif',
            }}
        >
            <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '16px 20px', borderBottom: `1px solid ${GC.borderColor}`, flexShrink: 0,
            }}>
                <span style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: `${seg.accent}26`, color: seg.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Icon name={SEGMENT_ICON[seg.key]} size={22}/></span>
                <div style={{flex: 1, minWidth: 0}}>
                    <div style={{color: GC.textPrimary, fontSize: 17, fontWeight: 800}}>{seg.title}</div>
                    <div style={{color: GC.textSecondary, fontSize: 11.5}}>{seg.tagline}</div>
                </div>
                {seg.summary.map((s) => (
                    <div key={s.label} style={{textAlign: 'right', flexShrink: 0, marginLeft: 14}}>
                        <div style={{
                            color: GC.textPrimary,
                            fontSize: 15,
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                        }}>{s.value}</div>
                        <div style={{color: GC.textDisabled, fontSize: 10, whiteSpace: 'nowrap'}}>{s.label}</div>
                    </div>
                ))}
                <button
                    onClick={onClose}
                    aria-label="Yopish"
                    style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0, cursor: 'pointer', marginLeft: 14,
                        background: 'transparent', border: `1px solid ${GC.borderColor}`,
                        color: GC.textSecondary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round">
                        <path d="M5 5l14 14M19 5L5 19"/>
                    </svg>
                </button>
            </div>

            <div style={{overflowY: 'auto', padding: '10px 20px 20px'}}>
                <BlockTitle text={seg.activeTitle} count={seg.active.length} accent={seg.accent}/>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: seg.activeSecondary ? 'repeat(auto-fit, minmax(220px, 1fr))' : 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 10,
                    marginBottom: 6
                }}>
                    {seg.active.map((u) => (
                        seg.activeSecondary
                            ? <FactoryCard key={u.name} unit={u} accent={seg.accent} segKey={seg.key}/>
                            : <ActiveUnitCard key={u.name} unit={u} accent={seg.accent} segKey={seg.key}/>
                    ))}
                </div>

                {!!seg.activeSecondary?.length && (
                    <>
                        <BlockTitle text={seg.activeSecondaryTitle ?? ''} count={seg.activeSecondary.length} accent={seg.accent}/>
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 6,
                        }}>
                            {seg.activeSecondary.map((u) => (
                                <ActiveUnitCard key={u.name} unit={u} accent={seg.accent} segKey={seg.key}/>
                            ))}
                        </div>
                    </>
                )}

                <BlockTitle text={seg.investTitle} count={seg.investProjects.length} accent={seg.accent}/>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10}}>
                    {seg.investProjects.length
                        ? seg.investProjects.map((p) => <InvestProjectCard key={p.id} p={p} accent={seg.accent}/>)
                        : <InvestEmpty/>}
                </div>
            </div>
        </div>
    </div>
);

/* ══════════════════════════════════════════════════════════════════════════ */
type Props = {
    /**
     * Tepadan bo'sh qoldiriladigan joy (px). `TopCenter` ichida tab paneli
     * absolyut joylashib komponent ustiga tushadi — u yerda 42px beriladi.
     */
    topInset?: number;
};

const MineMetalMarket: React.FC<Props> = () => {
    const [openSeg, setOpenSeg] = useState<Segment | null>(null);
    /* Barcha raqamlar API'dan (COMPANY_DASHBOARD_API.md) — statik ma'lumot yo'q. */
    const { topKpis, segments } = useCompanyData();

    return (
        <div style={{
            width: '100%', height: '100%', minHeight: 0, boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', gap: GAP,
            padding: cq(5, 1.5, 16),
            overflow: 'hidden',
            fontFamily: '"Segoe UI", system-ui, sans-serif',
            containerType: 'size',
            /* Fon rasmi faqat YUQORI qismni egallaydi — KPI qatori, doiralar va
               kartochkalarning tepasidan sal o'tib to'xtaydi. Ustidagi gradient
               shu joyga kelib to'liq to'q rangga aylanadi, ya'ni rasm keskin
               kesilmay, soyaga singib yo'qoladi. */
            backgroundImage:
                `linear-gradient(180deg,
                    rgba(6,11,18,.42) 0%,
                    rgba(6,11,18,.52) 26%,
                    rgba(6,10,17,.78) 42%,
                    rgba(5,9,15,.95) 52%,
                    ${GC.bg900} 30%), url(${ASSETS.background})`,
            backgroundSize: 'contain, 100% 60%',
            backgroundPosition: 'top center, top center',
            backgroundRepeat: 'no-repeat, no-repeat',
            backgroundColor: GC.bg900,
            paddingTop: 25
            /* `padding` qisqartmasidan KEYIN turishi shart, aks holda bekor bo'ladi. */
            // ...(topInset ? { paddingTop: `calc(${cq(5, 1.5, 16)} + ${topInset}px)` } : null),
        }}>
            <style>{LAYOUT_CSS}</style>

            {/* ── 1) KPI qatori + markazda TMK ── */}
            <div style={{display: 'flex', alignItems: 'center', gap: GAP, flexShrink: 0}}>
                {topKpis.left.map((k) => <KpiCard key={k.label} kpi={k}/>)}
                <TmkBadge/>
                {topKpis.right.map((k) => <KpiCard key={k.label} kpi={k}/>)}
            </div>

            {/* ── 2) O'rta tasma: ulanish chiziqlari, pastki chetida uchta doira,
                   bo'sh joylarda info kartochkalar ── */}
            <div className="mmm-band" style={{
                position: 'relative', minHeight: `calc(${cq(14, 4.2, 46)} + ${CIRCLE} + ${CIRCLE_LIFT})`,
            }}>
                <Connectors/>
                {/* Doiralar `NODE_X` foizlari bo'yicha aniq joylashtiriladi —
                    shunda ular ulanish chiziqlarining uchlariga tik tushadi. */}
                {segments.map((s, i) => (
                    <div key={s.key} style={{
                        position: 'absolute', bottom: CIRCLE_LIFT,
                        left: `${NODE_X[i]}%`, transform: 'translateX(-50%)',
                    }}>
                        <SegmentNode seg={s} onClick={() => setOpenSeg(s)}/>
                    </div>
                ))}
            </div>

            {/* ── 3) Uchta bosqich kartochkasi (25% pastroq) ── */}
            <div className="mmm-cards" style={{
                minHeight: 0,
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: cq(4, 1.1, 12),
            }}>
                {segments.map((s) => (
                    <SegmentCard key={s.key} seg={s} onOpen={() => setOpenSeg(s)}/>
                ))}
            </div>

            {openSeg && <SegmentModal seg={openSeg} onClose={() => setOpenSeg(null)}/>}
        </div>
    );
};

export default MineMetalMarket;
