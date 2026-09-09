import { GC } from '../../theme/palette';

/* ── Alarm toifalari ──────────────────────────────────────────────────────
   Zavod bo'yicha kuzatuv tizimlari: videotahlil, yong'in datchiklari, ESG
   monitoringi, SCADA, SKUD va umumiy ishlab chiqarish uskunalari. */
export type AlarmType =
    | 'Videotahlil'
    | "Yong'in"
    | 'SCADA'
    | 'ESG'
    | 'SKUD'
    | 'Ishlab chiqarish';

/** Og'ish darajasi — situatsion markaz standartiga mos (qizil/sariq/ko'k). */
export type Severity = 'kritik' | 'ogohlantirish' | 'axborot' | 'normal';

/* Filtr yorlig'i kaliti. "Arxiv" og'ish darajasi EMAS — u hodisaning hayot
   sikli holati, shuning uchun `Severity` ga qo'shilmaydi: arxivlangan hodisa
   ham o'z darajasini (kritik/ogohlantirish/...) saqlab qoladi. */
export type FilterKey = 'all' | Severity | 'arxiv';

export type AlarmEvent = {
    id: string;
    /** `HH:MM` — ro'yxatda shu ko'rinishda chiqadi. */
    time: string;
    type: AlarmType;
    location: string;
    description: string;
    severity: Severity;
    /** `true` — ko'rib chiqilgan/yopilgan hodisa; faqat "Arxiv" yorlig'ida
        ko'rinadi va boshqa yorliqlardan chiqarib tashlanadi. */
    archived?: boolean;
    /** Modalda ko'rsatiladigan toifaga xos qo'shimcha maydonlar. */
    details: { label: string; value: string }[];
};

/* ── Holat (severity) uslublari ───────────────────────────────────────────
   Ro'yxatdagi "Holat" ustuni to'ldirilgan tabletka ko'rinishida.
   `pillBg` sariq uchun palitradagi `warning` dan bir oz to'qroq olingan —
   oq matn o'qilishi uchun (#F5C542 ustida oq matn kontrasti yetarli emas). */
export const SEVERITY: Record<Severity, {
    label: string;
    /** Qator boshidagi rangli chiziq va ikonka aksenti. */
    accent: string;
    pillBg: string;
    pillText: string;
}> = {
    kritik: {
        label: 'Kritik',
        accent: GC.danger,
        pillBg: GC.danger,
        pillText: '#FFFFFF',
    },
    ogohlantirish: {
        label: 'Ogohlantirish',
        accent: GC.warning,
        pillBg: '#E0912B',
        pillText: '#FFFFFF',
    },
    axborot: {
        label: 'Axborot',
        accent: GC.accent1,
        pillBg: GC.accent1,
        pillText: '#FFFFFF',
    },
    normal: {
        label: 'Normal',
        accent: '#5A6675',
        pillBg: '#1E2632',
        pillText: GC.textSecondary,
    },
};

/* Ekologiya (ESG) toifasi og'ish darajasidan qat'i nazar o'z yashil aksentida
   ajratiladi — qolgan toifalarda chiziq rangi holatdan olinadi. */
const TYPE_ACCENT: Partial<Record<AlarmType, string>> = {
    ESG: GC.success,
};

/** Qator boshidagi rangli chiziq rangi. */
export const barColor = (e: AlarmEvent): string =>
    TYPE_ACCENT[e.type] ?? SEVERITY[e.severity].accent;

/* ── Filtr yorliqlari ── */
export const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'Barchasi' },
    { key: 'kritik', label: 'Kritik' },
    { key: 'ogohlantirish', label: 'Ogohlantirish' },
    { key: 'axborot', label: 'Axborot' },
    { key: 'arxiv', label: 'Arxiv' },
];

/* ── Namunaviy hodisalar ──
   API ulanmaguncha shu ro'yxat ko'rsatiladi. */
export const ALARM_EVENTS: AlarmEvent[] = [
    {
        id: 'a01', time: '14:26', type: 'Videotahlil', location: 'Prokat sexi',
        description: 'Ruxsatsiz kirish', severity: 'kritik',
        details: [
            { label: 'Kamera', value: 'CAM-14 · Prokat sexi, shimoliy kirish' },
            { label: 'Aniqlangan obyekt', value: 'Inson (ishonch 94%)' },
            { label: 'Yozuv', value: 'Arxivga saqlandi · 00:42' },
            { label: 'Javobgar', value: 'Xavfsizlik posti №2' },
        ],
    },
    {
        id: 'a02', time: '14:24', type: "Yong'in", location: 'Energetika bloki',
        description: 'Datchik ishga tushdi', severity: 'kritik',
        details: [
            { label: 'Datchik', value: 'FD-07 · tutun datchigi' },
            { label: 'Tutun zichligi', value: '3.8 %/m (me\'yor: < 1.5)' },
            { label: 'Avtomatik chora', value: "Yong'in signali yoqildi" },
            { label: 'Javobgar', value: "Yong'in xavfsizligi bo'limi" },
        ],
    },
    {
        id: 'a03', time: '14:20', type: 'SCADA', location: "Bug' qozoni №2",
        description: "Bosim me'yoridan yuqori", severity: 'ogohlantirish',
        details: [
            { label: 'Teg', value: 'BOILER2.PRESSURE' },
            { label: 'Joriy qiymat', value: '14.6 bar' },
            { label: 'Ruxsat etilgan', value: '10.0 – 13.5 bar' },
            { label: 'Trend', value: "So'nggi 15 daqiqada +1.8 bar" },
        ],
    },
    {
        id: 'a04', time: '14:18', type: 'ESG', location: 'Kimyo hududi',
        description: 'CO darajasi yuqori', severity: 'ogohlantirish',
        details: [
            { label: "O'lchov nuqtasi", value: 'AQ-03 · kimyo hududi' },
            { label: 'CO', value: '28 mg/m³' },
            { label: 'Chegara (REM)', value: '20 mg/m³' },
            { label: 'Shamol', value: "Shimoli-g'arb, 3.2 m/s" },
        ],
    },
    {
        id: 'a05', time: '14:15', type: 'SKUD', location: "Ma'muriy bino",
        description: "Ruxsatsiz o'tish", severity: 'ogohlantirish',
        details: [
            { label: 'Turniket', value: 'ACS-02 · asosiy kirish' },
            { label: 'Karta', value: 'Noma\'lum identifikator' },
            { label: 'Urinishlar', value: '3 marta ketma-ket' },
            { label: 'Holat', value: "O'tish rad etildi" },
        ],
    },
    {
        id: 'a06', time: '14:12', type: 'Ishlab chiqarish', location: 'Prokat stani №3',
        description: 'Uskuna harorati yuqori', severity: 'ogohlantirish',
        details: [
            { label: 'Uskuna', value: 'Prokat stani №3 · podshipnik uzeli' },
            { label: 'Harorat', value: '96 °C' },
            { label: 'Chegara', value: '85 °C' },
            { label: 'Ish rejimi', value: "To'liq yuklama · 6 soat" },
        ],
    },
    {
        id: 'a07', time: '14:08', type: 'Videotahlil', location: 'Xom ashyo ombori',
        description: 'Hududda shubhali harakat', severity: 'axborot',
        details: [
            { label: 'Kamera', value: 'CAM-22 · ombor perimetri' },
            { label: 'Aniqlangan obyekt', value: 'Harakat (ishonch 71%)' },
            { label: 'Davomiylik', value: '12 soniya' },
            { label: 'Holat', value: 'Operator tomonidan ko\'rib chiqilmoqda' },
        ],
    },
    {
        id: 'a08', time: '14:05', type: 'ESG', location: "G'arbiy hududi",
        description: "Chang miqdori me'yor oshdi", severity: 'axborot',
        details: [
            { label: "O'lchov nuqtasi", value: "AQ-07 · g'arbiy perimetr" },
            { label: 'PM10', value: '62 µg/m³' },
            { label: 'Chegara', value: '50 µg/m³' },
            { label: 'Davomiylik', value: '18 daqiqa' },
        ],
    },
    {
        id: 'a09', time: '14:03', type: 'SCADA', location: "Suv ta'minoti",
        description: 'Aloqa uzildi', severity: 'axborot',
        details: [
            { label: 'Kontroller', value: 'PLC-WTR-01' },
            { label: 'Protokol', value: 'Modbus TCP' },
            { label: "So'nggi paket", value: '14:01:47' },
            { label: 'Holat', value: 'Qayta ulanish urinishlari davom etmoqda' },
        ],
    },
    {
        id: 'a10', time: '14:00', type: "Yong'in", location: 'Laboratoriya',
        description: 'Datchik testi bajarildi', severity: 'normal', archived: true,
        details: [
            { label: 'Datchik', value: 'FD-19 · issiqlik datchigi' },
            { label: 'Test turi', value: 'Rejali o\'z-o\'zini tekshirish' },
            { label: 'Natija', value: 'Muvaffaqiyatli' },
            { label: 'Keyingi test', value: '21.09.2026' },
        ],
    },
    {
        id: 'a11', time: '13:55', type: 'SKUD', location: 'Ombor-3',
        description: 'Eshik majburan ochildi', severity: 'ogohlantirish', archived: true,
        details: [
            { label: 'Nuqta', value: 'DR-11 · Ombor-3 yon eshigi' },
            { label: 'Signal', value: 'Majburiy ochilish datchigi' },
            { label: 'Ochiq turgan vaqt', value: '2 daqiqa 40 soniya' },
            { label: 'Holat', value: 'Qorovul yuborildi' },
        ],
    },
    {
        id: 'a12', time: '13:48', type: 'SCADA', location: 'Energetika bloki',
        description: 'Kuchlanish past', severity: 'axborot', archived: true,
        details: [
            { label: 'Teg', value: 'PWR.BUS1.VOLTAGE' },
            { label: 'Joriy qiymat', value: '9.8 kV' },
            { label: 'Nominal', value: '10.5 kV (±5%)' },
            { label: 'Yuklama', value: '72%' },
        ],
    },
];
