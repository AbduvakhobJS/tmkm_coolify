import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import {
  Users,
  UserCheck,
  BriefcaseBusiness,
  Timer,
  Layers,
  Gauge,
  ChevronRight,
  CircleCheck,
  CircleDashed,
  Radio,
  Send,
  Globe,
  Building2,
  Wrench,
  FlaskConical,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DIZAYN TOKENLARI                                                   */
/* ------------------------------------------------------------------ */

const C = {
  bg: "#070b14",
  panel: "#0d1424",
  panelSoft: "#111a2e",
  line: "#1b2841",
  text: "#e7eefb",
  dim: "#8395b3",
  faint: "#55668a",
  cyan: "#3ec9e0",
  blue: "#4f8cff",
  violet: "#9b7cf6",
  green: "#3ddc97",
  amber: "#f5b544",
  rose: "#f2637e",
  teal: "#2dd4bf",
};

const FONT_BODY =
  "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif";
const FONT_NUM =
  "'JetBrains Mono', 'SF Mono', ui-monospace, Menlo, monospace";

/* ------------------------------------------------------------------ */
/*  MA'LUMOTLAR — 3 ta manba fayldan                                   */
/*  1) Tashkiliy tuzilma (.pptx)                                       */
/*  2) Xizmat safari yakuniy hisoboti (.pptx)                          */
/*  3) Mobilizatsiya rejasi 07.08.2026 (.xlsx)                         */
/* ------------------------------------------------------------------ */

const TOTAL_STAFF = 241;
const FILLED = 25;
const VACANT = 216;
const ANNOUNCED = 77;

const categories = [
  { name: "Ishchilar", value: 179, color: C.blue },
  { name: "Mutaxassislar", value: 29, color: C.cyan },
  { name: "Rahbarlar", value: 21, color: C.violet },
  { name: "Texnik ijrochilar", value: 12, color: C.amber },
];

const blocks = [
  {
    name: "Bosh muhandis bloki",
    short: "Operatsion blok",
    value: 178,
    color: C.blue,
    items: [
      ["Asosiy ishlab chiqarish", 130],
      ["Bosh mexanik xizmati", 23],
      ["NO'AvaA va TJABT xizmati", 13],
      ["Bosh energetik xizmati", 11],
      ["Bosh muhandis", 1],
    ],
  },
  {
    name: "CFO bloki",
    short: "Moliya va tijorat",
    value: 32,
    color: C.cyan,
    items: [
      ["Tijorat bloki", 25],
      ["Moliya", 6],
      ["Direktor o'rinbosari (CFO)", 1],
    ],
  },
  {
    name: "Direktorga bevosita",
    short: "Shtab bo'linmalari",
    value: 30,
    color: C.violet,
    items: [
      ["Ma'muriy-xo'jalik bo'limi", 12],
      ["Sifat nazorati bo'limi", 6],
      ["Tibbiyot punkti", 4],
      ["MMQ, sanoat xavfsizligi, ekologiya", 3],
      ["Kadrlar bilan ishlash", 2],
      ["Yuridik xizmat", 1],
      ["Raqamlashtirish va SI", 1],
      ["Ijro intizomi", 1],
    ],
  },
  {
    name: "Bosh direktor",
    short: "Rahbariyat",
    value: 1,
    color: C.amber,
    items: [["Bosh direktor", 1]],
  },
];

const departments = [
  { name: "Texnologik uchastkalar", value: 102 },
  { name: "Tijorat bloki", value: 25 },
  { name: "Bosh mexanik xizmati", value: 23 },
  { name: "Markaziy boshqaruv pulti", value: 14 },
  { name: "NO'AvaA / TJABT xizmati", value: 13 },
  { name: "Ma'muriy-xo'jalik bo'limi", value: 12 },
  { name: "Bosh energetik xizmati", value: 11 },
  { name: "Kimyoviy tahlil laboratoriyasi", value: 10 },
  { name: "Moliya", value: 6 },
  { name: "Sifat nazorati bo'limi", value: 6 },
  { name: "Rahbariyat va shtab", value: 5 },
  { name: "Ishlab chiqarish ITX", value: 4 },
  { name: "Tibbiyot punkti", value: 4 },
  { name: "MMQ va ekologiya", value: 3 },
  { name: "Kadrlar bilan ishlash", value: 2 },
  { name: "Yuridik xizmat", value: 1 },
];

const techSections = [
  { name: "Bo'lakli oltingugurt ombori", value: 27 },
  { name: "Suv tayyorlash stansiyasi", value: 9 },
  { name: "Deminerallash", value: 9 },
  { name: "Kislota rezervuarlari, quyish", value: 8 },
  { name: "Deaerasiya stansiyasi", value: 5 },
  { name: "Eritish va filtrlash", value: 5 },
  { name: "Oltingugurt pechi (kuydirish)", value: 5 },
  { name: "Turbogenerator stansiyasi", value: 5 },
  { name: "Kontakt qurilmasi", value: 5 },
  { name: "Aylanma suv ta'minoti", value: 5 },
  { name: "Kompressor stansiyasi", value: 5 },
  { name: "Ishga tushirish qozonxonasi", value: 5 },
  { name: "Quritish va absorbsiyalash", value: 5 },
  { name: "Yong'inga qarshi suv ta'minoti", value: 4 },
];

const qualification = [
  { name: "1-dr.", value: 2 },
  { name: "2-dr.", value: 21 },
  { name: "3-dr.", value: 98 },
  { name: "4-dr.", value: 25 },
  { name: "5-dr.", value: 18 },
  { name: "6-dr.", value: 18 },
  { name: "7-dr.", value: 13 },
  { name: "Belgilanmagan", value: 46 },
];

const MONTHS_UZ = [
  "Yan", "Fev", "Mar", "Apr", "May", "Iyn",
  "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek",
];

const plan2025 = [0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 2];
const plan2026 = [6, 1, 1, 0, 1, 2, 2, 21, 46, 62, 76, 17];

const hiringPlan = (() => {
  const out = [];
  let acc = 0;
  plan2025.forEach((v, i) => {
    acc += v;
    out.push({ label: `${MONTHS_UZ[i]}·25`, year: 2025, qabul: v, jami: acc });
  });
  plan2026.forEach((v, i) => {
    acc += v;
    out.push({ label: `${MONTHS_UZ[i]}·26`, year: 2026, qabul: v, jami: acc });
  });
  return out;
})();

const stages = [
  {
    id: "I",
    label: "I bosqich",
    range: "01.08 — 10.08",
    count: 53,
    color: C.green,
  },
  {
    id: "II",
    label: "II bosqich",
    range: "11.08 — 20.08",
    count: 33,
    color: C.cyan,
  },
  {
    id: "III",
    label: "III bosqich",
    range: "21.08 — 31.08",
    count: 142,
    color: C.blue,
  },
];
const STAGE_TOTAL = 228;

const stageOneStatus = [
  { name: "Yopilgan", value: 10, color: C.green },
  { name: "Yakuniy jarayonda", value: 14, color: C.amber },
  { name: "Ish jarayonida", value: 29, color: C.blue },
];

const projectTasks = [
  {
    n: "01",
    title: "Tashkiliy tuzilma",
    desc: "Tuzilma o'rganildi, tasdiqlangan holat bo'yicha ishlar kelishildi",
    status: "Tasdiqlandi",
    tone: C.green,
    icon: Layers,
  },
  {
    n: "02",
    title: "HR siyosati",
    desc: "Loyiha bo'yicha siyosat va ishga qabul yondashuvi kelishildi",
    status: "Kelishildi",
    tone: C.cyan,
    icon: ShieldCheck,
  },
  {
    n: "03",
    title: "Tizimli grafik",
    desc: "Qabul grafigi qayta shakllantirildi va 3 bosqichga ajratildi",
    status: "Yangilandi",
    tone: C.violet,
    icon: TrendingUp,
  },
  {
    n: "04",
    title: "ATS tizimi",
    desc: "Nomzod, vakansiya va bosqichlarni kuzatish tizimi ishlab chiqilmoqda",
    status: "Jarayonda",
    tone: C.amber,
    icon: CircleDashed,
  },
];

const channels = [
  { name: "Telegram — Navoiy kanallari", meta: "2 ta kanal", icon: Send, color: C.cyan },
  { name: "HeadHunter.uz", meta: "tashkent.hh.uz", icon: Globe, color: C.blue },
  { name: "UzTMK rasmiy sayti", meta: "uztmk.uz/uz/vacancy", icon: Building2, color: C.violet },
  { name: "UzTMK telegram kanali", meta: "@uztmk_official", icon: Radio, color: C.green },
];

const topVacancies = [
  { pos: "Xom ashyoni tayyorlash apparatchisi", n: 17, grp: "Ishchi" },
  { pos: "Boshqaruv pulti operatori", n: 9, grp: "Xizmatchi" },
  { pos: "Kimyoviy suv tozalash apparatchisi", n: 9, grp: "Ishchi" },
  { pos: "Suv tayyorlash apparatchisi", n: 9, grp: "Ishchi" },
  { pos: "Tayyorlash va jo'natish apparatchisi", n: 8, grp: "Ishchi" },
  { pos: "Chilangar-ta'mirlovchi (smenali)", n: 8, grp: "Ishchi" },
  { pos: "Chilangar-ta'mirlovchi", n: 8, grp: "Ishchi" },
  { pos: "Navbatchi elektromontyor (>1000 V)", n: 8, grp: "Ishchi" },
  { pos: "Kimyoviy tahlil laboranti", n: 8, grp: "Ishchi" },
  { pos: "Muhandis-elektronik", n: 5, grp: "ITX" },
  { pos: "Sifat nazorati inspektori", n: 5, grp: "ITX" },
  { pos: "Smena boshlig'i", n: 5, grp: "ITX" },
];

const filledStaff = [
  ["Farrux Rahimov", "Bosh direktor", "Rahbariyat"],
  ["Qayumov Abdumansur", "Bosh muhandis", "Rahbariyat"],
  ["Normurodov Muzaffar", "Bosh mexanik", "Rahbariyat"],
  ["Kolpakov Pyotr", "Bosh energetik", "Rahbariyat"],
  ["Ushakov Ilya", "Bosh asbobsoz", "Rahbariyat"],
  ["Shermatov Alisher", "Ishlab chiqarish boshlig'i", "Rahbariyat"],
  ["Jalilov Salohiddin", "Ta'minot va TIF bo'limi boshlig'i", "Rahbariyat"],
  ["Islomov Umid", "Logistika bo'limi boshlig'i", "Rahbariyat"],
  ["Yuldashev Qambarali", "Bosh buxgalter", "Moliya"],
  ["Ramazonov Husniddin", "Moliyachi", "Moliya"],
  ["Abdullayev Abu-Bakir", "Mehnat va ish haqi iqtisodchisi", "Moliya"],
  ["Ro'ziyeva Yulduz", "Kadrlar bo'yicha bosh mutaxassis", "HR"],
  ["Nazarova Muhayyo", "Ofis-menejer", "HR"],
  ["Saidov Akmal", "Muhandis-ekolog", "MMQ va ekologiya"],
  ["Erdonov Xushnud", "Mehnat muhofazasi muhandisi", "MMQ va ekologiya"],
  ["Alimov Azamat", "TIF bo'yicha menejer", "Tijorat"],
  ["Normirzayev Jamol", "TIF bo'yicha mutaxassis", "Tijorat"],
  ["Mirkamolov Mehroj", "Mahalliy xaridlar mutaxassisi", "Tijorat"],
  ["Shadiyev Faxriddin", "SMM-menejer / mobilograf", "Tijorat"],
  ["Fayziyev Aziz", "Raqamlashtirish va SI mutaxassisi", "Shtab"],
  ["Isroilov Dilshod", "Kalendar-tarmoq rejalashtirish", "Shtab"],
  ["Xaydarov Nodir", "Yengil avtomobil haydovchisi", "Xo'jalik"],
  ["Asadov Jasur", "Yengil avtomobil haydovchisi", "Xo'jalik"],
  ["Pardayeva Gulrux", "Xizmat xonalari farroshi", "Xo'jalik"],
];

/* ------------------------------------------------------------------ */
/*  UI PRIMITIVLARI                                                    */
/* ------------------------------------------------------------------ */

function Panel({ title, hint, right, children, style, pad = true }) {
  return (
    <section
      style={{
        background: `linear-gradient(180deg, ${C.panelSoft} 0%, ${C.panel} 55%)`,
        border: `1px solid ${C.line}`,
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...style,
      }}
    >
      {(title || right) && (
        <header
          className="flex items-center justify-between gap-3"
          style={{ padding: "14px 18px 10px" }}
        >
          <div className="min-w-0">
            <h3
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: C.dim,
                fontWeight: 600,
                margin: 0,
              }}
            >
              {title}
            </h3>
            {hint && (
              <p style={{ fontSize: 11.5, color: C.faint, margin: "4px 0 0" }}>
                {hint}
              </p>
            )}
          </div>
          {right}
        </header>
      )}
      <div
        className="flex-1"
        style={{ padding: pad ? "4px 18px 18px" : 0, minHeight: 0 }}
      >
        {children}
      </div>
    </section>
  );
}

function Kpi({ icon: Icon, label, value, unit, sub, subTone, accent, bar }) {
  return (
    <div
      style={{
        background: `linear-gradient(180deg, ${C.panelSoft} 0%, ${C.panel} 60%)`,
        border: `1px solid ${C.line}`,
        borderRadius: 16,
        padding: "14px 16px 15px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -34,
          right: -34,
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: accent,
          opacity: 0.12,
          filter: "blur(14px)",
        }}
      />
      <div className="flex items-start justify-between gap-2">
        <span
          style={{
            fontSize: 10.5,
            letterSpacing: "0.13em",
            textTransform: "uppercase",
            color: C.dim,
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        <span
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            background: `${accent}1f`,
            border: `1px solid ${accent}3d`,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={13} color={accent} strokeWidth={2} />
        </span>
      </div>

      <div className="flex items-baseline gap-1.5" style={{ marginTop: 10 }}>
        <span
          style={{
            fontFamily: FONT_NUM,
            fontSize: 28,
            lineHeight: 1,
            fontWeight: 600,
            color: C.text,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 12, color: C.dim, fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>

      {bar !== undefined && (
        <div
          style={{
            marginTop: 11,
            height: 4,
            borderRadius: 99,
            background: "#1a2540",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.max(1.5, bar)}%`,
              height: "100%",
              borderRadius: 99,
              background: `linear-gradient(90deg, ${accent}, ${accent}88)`,
            }}
          />
        </div>
      )}

      {sub && (
        <p
          style={{
            margin: "9px 0 0",
            fontSize: 11.5,
            color: subTone || C.faint,
            fontFamily: FONT_NUM,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

function ChartTip({ active, payload, label, suffix = "birlik" }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: "#0a1120",
        border: `1px solid ${C.line}`,
        borderRadius: 10,
        padding: "8px 11px",
        boxShadow: "0 8px 24px rgba(0,0,0,.5)",
      }}
    >
      {label !== undefined && (
        <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}>
          {label}
        </div>
      )}
      {payload.map((p, i) => (
        <div
          key={i}
          className="flex items-center gap-2"
          style={{ fontSize: 12, color: C.text, fontFamily: FONT_NUM }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 2,
              background: p.color || p.payload?.color || C.blue,
            }}
          />
          <span style={{ color: C.dim }}>{p.name}</span>
          <span style={{ fontWeight: 600 }}>
            {p.value} {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

function Legend({ items, total }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, width: "100%" }}>
      {items.map((it) => (
        <li
          key={it.name}
          className="flex items-center gap-2"
          style={{ padding: "5px 0", fontSize: 12.5 }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 99,
              background: it.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: C.dim, flex: 1, minWidth: 0 }}>{it.name}</span>
          <span style={{ fontFamily: FONT_NUM, color: C.text, fontWeight: 600 }}>
            {it.value}
          </span>
          <span
            style={{
              fontFamily: FONT_NUM,
              color: C.faint,
              width: 42,
              textAlign: "right",
            }}
          >
            {Math.round((it.value / total) * 100)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

function Donut({ data, total, centerTop, centerBottom, thickness = 16 }) {
  return (
    <div style={{ position: "relative", width: 132, height: 132, flexShrink: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={66 - thickness}
            outerRadius={66}
            paddingAngle={2}
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTip />} cursor={false} />
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: FONT_NUM,
              fontSize: 22,
              fontWeight: 600,
              color: C.text,
              lineHeight: 1,
            }}
          >
            {centerTop ?? total}
          </div>
          <div style={{ fontSize: 10, color: C.faint, marginTop: 3 }}>
            {centerBottom}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  IMZO ELEMENT — qabul quvuri                                        */
/* ------------------------------------------------------------------ */

function Pipeline() {
  const steps = [
    { label: "Maqsadli shtat", value: TOTAL_STAFF, color: C.blue, note: "tasdiqlangan tuzilma" },
    { label: "E'lon qilingan", value: ANNOUNCED, color: C.violet, note: "vakansiya talablari tayyor" },
    { label: "I bosqich saralash", value: 53, color: C.cyan, note: "01.08 — 10.08" },
    { label: "Yopilgan", value: 10, color: C.green, note: "rasmiylashtirishga tayyor" },
  ];
  return (
    <div className="flex items-stretch gap-2 flex-wrap">
      {steps.map((s, i) => {
        const w = 100 - i * 9;
        return (
          <React.Fragment key={s.label}>
            <div
              style={{
                flex: `1 1 ${w * 1.6}px`,
                minWidth: 130,
                background: `linear-gradient(135deg, ${s.color}22, ${s.color}08)`,
                border: `1px solid ${s.color}44`,
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: s.color,
                  fontWeight: 700,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: FONT_NUM,
                  fontSize: 26,
                  fontWeight: 600,
                  color: C.text,
                  marginTop: 6,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>
                {s.note}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="flex items-center" style={{ color: C.faint }}>
                <ChevronRight size={16} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ASOSIY KOMPONENT                                                   */
/* ------------------------------------------------------------------ */

export default function TmkChemicalsDashboard() {
  const [deptView, setDeptView] = useState("dept");
  const [openBlock, setOpenBlock] = useState("Bosh muhandis bloki");

  const fillPct = useMemo(() => (FILLED / TOTAL_STAFF) * 100, []);
  const deptData = deptView === "dept" ? departments : techSections;
  const activeBlock = blocks.find((b) => b.name === openBlock) || blocks[0];

  return (
    <div
      style={{
        background: `radial-gradient(1200px 600px at 12% -8%, #12203a 0%, ${C.bg} 55%), ${C.bg}`,
        minHeight: "100vh",
        color: C.text,
        fontFamily: FONT_BODY,
        padding: "22px 22px 40px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .tmk-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .tmk-scroll::-webkit-scrollbar-thumb { background: #24344f; border-radius: 99px; }
        .tmk-scroll::-webkit-scrollbar-track { background: transparent; }
        .tmk-row:hover { background: #16223a; }
      `}</style>

      {/* ---------------- HEADER ---------------- */}
      <header
        className="flex items-end justify-between gap-4 flex-wrap"
        style={{ marginBottom: 18 }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: `linear-gradient(140deg, ${C.cyan}, ${C.blue})`,
              display: "grid",
              placeItems: "center",
              fontFamily: FONT_NUM,
              fontWeight: 700,
              fontSize: 13,
              color: "#04101c",
              letterSpacing: "-0.03em",
            }}
          >
            TMK
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.01em",
              }}
            >
              TMK Chemicals — kadrlar mobilizatsiyasi
            </h1>
            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: C.dim }}>
              «O'zbekiston texnologik metallar kombinati» AJ · tashkiliy tuzilma,
              shtat jadvali va ishga qabul grafigi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            ["Ma'lumot sanasi", "07.08.2026"],
            ["Reja gorizonti", "2025 — 2026"],
            ["Manba", "3 hujjat"],
          ].map(([k, v]) => (
            <div
              key={k}
              style={{
                border: `1px solid ${C.line}`,
                background: C.panel,
                borderRadius: 10,
                padding: "7px 12px",
              }}
            >
              <div
                style={{
                  fontSize: 9.5,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  color: C.faint,
                }}
              >
                {k}
              </div>
              <div
                style={{
                  fontFamily: FONT_NUM,
                  fontSize: 12.5,
                  color: C.text,
                  fontWeight: 600,
                  marginTop: 2,
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* ---------------- KPI ---------------- */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(178px, 1fr))",
          marginBottom: 14,
        }}
      >
        <Kpi
          icon={Users}
          label="Maqsadli shtat"
          value={TOTAL_STAFF}
          unit="birlik"
          accent={C.blue}
          sub="4 ta blok · 16 bo'linma"
        />
        <Kpi
          icon={UserCheck}
          label="Band lavozimlar"
          value={FILLED}
          unit="nafar"
          accent={C.green}
          bar={fillPct}
          sub={`To'ldirilganlik ${fillPct.toFixed(1)}%`}
        />
        <Kpi
          icon={BriefcaseBusiness}
          label="Ochiq vakansiyalar"
          value={VACANT}
          unit="ta"
          accent={C.rose}
          sub={`Shtatning ${Math.round((VACANT / TOTAL_STAFF) * 100)} %i`}
          subTone={C.rose}
        />
        <Kpi
          icon={Radio}
          label="E'lon qilingan"
          value={ANNOUNCED}
          unit="vakansiya"
          accent={C.violet}
          bar={(ANNOUNCED / VACANT) * 100}
          sub={`Ochiq o'rinlarning ${Math.round((ANNOUNCED / VACANT) * 100)}%i`}
        />
        <Kpi
          icon={Timer}
          label="Avgust rejasi"
          value={STAGE_TOTAL}
          unit="nafar"
          accent={C.cyan}
          sub="3 bosqichli tizimli grafik"
        />
        <Kpi
          icon={Gauge}
          label="I bosqich yopilgan"
          value={`10 / 53`}
          accent={C.amber}
          bar={(10 / 53) * 100}
          sub="14 ta yakuniy bosqichda"
        />
      </div>

      {/* ---------------- PIPELINE ---------------- */}
      <Panel
        title="Ishga qabul quvuri"
        hint="Tasdiqlangan shtatdan rasmiylashtirilgan xodimgacha"
        style={{ marginBottom: 14 }}
      >
        <div style={{ paddingTop: 6 }}>
          <Pipeline />
        </div>
      </Panel>

      {/* ---------------- 1-QATOR: TAQSIMOTLAR ---------------- */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          marginBottom: 14,
        }}
      >
        <Panel title="Toifalar bo'yicha shtat" hint="Tashkiliy tuzilma bo'yicha">
          <div className="flex items-center gap-4">
            <Donut
              data={categories}
              total={TOTAL_STAFF}
              centerBottom="birlik"
            />
            <div className="flex-1" style={{ minWidth: 0 }}>
              <Legend items={categories} total={TOTAL_STAFF} />
            </div>
          </div>
        </Panel>

        <Panel
          title="Xizmatchi va ishchi nisbati"
          hint="Ishlab chiqarish og'irlik markazi"
        >
          <div className="flex items-center gap-4">
            <Donut
              data={[
                { name: "Ishchilar", value: 179, color: C.blue },
                { name: "Xizmatchilar", value: 62, color: C.teal },
              ]}
              total={TOTAL_STAFF}
              centerTop="74%"
              centerBottom="ishchi"
            />
            <div className="flex-1" style={{ minWidth: 0 }}>
              <Legend
                items={[
                  { name: "Ishchilar", value: 179, color: C.blue },
                  { name: "Xizmatchilar", value: 62, color: C.teal },
                ]}
                total={TOTAL_STAFF}
              />
              <p
                style={{
                  fontSize: 11.5,
                  color: C.faint,
                  marginTop: 10,
                  lineHeight: 1.5,
                }}
              >
                Uzluksiz ishlab chiqarish 4 brigadali smenali grafikda ishlaydi —
                5 birlikli postlar 4 smena va o'rinbosar bilan qoplanadi.
              </p>
            </div>
          </div>
        </Panel>

        <Panel
          title="Malaka darajasi"
          hint="Milliy malakalar doirasi (NMD) bo'yicha"
        >
          <div style={{ height: 168, marginTop: 4 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={qualification}
                margin={{ top: 14, right: 4, bottom: 0, left: -22 }}
              >
                <CartesianGrid stroke={C.line} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: C.faint, fontSize: 10 }}
                  axisLine={{ stroke: C.line }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fill: C.faint, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="value" name="Shtat" radius={[4, 4, 0, 0]}>
                  {qualification.map((q) => (
                    <Cell
                      key={q.name}
                      fill={q.name === "Belgilanmagan" ? "#33445f" : C.cyan}
                    />
                  ))}
                  <LabelList
                    dataKey="value"
                    position="top"
                    style={{ fill: C.dim, fontSize: 10, fontFamily: FONT_NUM }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* ---------------- 2-QATOR: BLOKLAR + GRAFIK ---------------- */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "minmax(300px, 1fr) minmax(420px, 1.75fr)",
          marginBottom: 14,
        }}
      >
        <Panel
          title="Boshqaruv bloklari"
          hint="Blokni tanlang — tarkibi ochiladi"
        >
          <div style={{ marginTop: 4 }}>
            {blocks.map((b) => {
              const active = b.name === activeBlock.name;
              return (
                <div key={b.name} style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => setOpenBlock(b.name)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: active ? "#16223a" : "transparent",
                      border: `1px solid ${active ? b.color + "55" : C.line}`,
                      borderRadius: 10,
                      padding: "9px 12px",
                      cursor: "pointer",
                      color: "inherit",
                      font: "inherit",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span style={{ fontSize: 13, fontWeight: 600 }}>
                        {b.name}
                      </span>
                      <span
                        style={{
                          fontFamily: FONT_NUM,
                          fontSize: 14,
                          fontWeight: 600,
                          color: b.color,
                        }}
                      >
                        {b.value}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 7,
                        height: 4,
                        background: "#1a2540",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(b.value / TOTAL_STAFF) * 100}%`,
                          height: "100%",
                          background: b.color,
                          borderRadius: 99,
                        }}
                      />
                    </div>
                    <div
                      style={{ fontSize: 11, color: C.faint, marginTop: 6 }}
                    >
                      {b.short}
                    </div>
                  </button>

                  {active && (
                    <ul
                      style={{
                        listStyle: "none",
                        margin: "6px 0 0",
                        padding: "0 0 0 12px",
                        borderLeft: `1px dashed ${b.color}55`,
                      }}
                    >
                      {b.items.map(([n, v]) => (
                        <li
                          key={n}
                          className="flex items-center justify-between gap-2"
                          style={{ padding: "4px 0", fontSize: 12 }}
                        >
                          <span style={{ color: C.dim }}>{n}</span>
                          <span
                            style={{
                              fontFamily: FONT_NUM,
                              color: C.text,
                              fontWeight: 600,
                            }}
                          >
                            {v}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel
          title="Ishga qabul rejasi — oylar kesimida"
          hint="Ustunlar: oylik qabul · chiziq: jamlanma shtat"
          right={
            <div className="flex items-center gap-3" style={{ fontSize: 11 }}>
              <span className="flex items-center gap-1.5" style={{ color: C.dim }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: C.blue,
                  }}
                />
                Oylik qabul
              </span>
              <span className="flex items-center gap-1.5" style={{ color: C.dim }}>
                <span
                  style={{
                    width: 12,
                    height: 2,
                    borderRadius: 2,
                    background: C.amber,
                  }}
                />
                Jamlanma
              </span>
            </div>
          }
        >
          <div style={{ height: 274, marginTop: 6 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={hiringPlan}
                margin={{ top: 12, right: 8, bottom: 4, left: -20 }}
              >
                <defs>
                  <linearGradient id="cumFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.amber} stopOpacity={0.28} />
                    <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={C.line} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: C.faint, fontSize: 9.5 }}
                  axisLine={{ stroke: C.line }}
                  tickLine={false}
                  interval={0}
                  angle={-40}
                  textAnchor="end"
                  height={46}
                />
                <YAxis
                  yAxisId="l"
                  tick={{ fill: C.faint, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="r"
                  orientation="right"
                  tick={{ fill: C.faint, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTip suffix="nafar" />} cursor={{ fill: "#ffffff08" }} />
                <Bar
                  yAxisId="l"
                  dataKey="qabul"
                  name="Oylik qabul"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={22}
                >
                  {hiringPlan.map((d, i) => (
                    <Cell key={i} fill={d.year === 2026 ? C.blue : "#33445f"} />
                  ))}
                </Bar>
                <Area
                  yAxisId="r"
                  type="monotone"
                  dataKey="jami"
                  name="Jamlanma"
                  stroke="none"
                  fill="url(#cumFill)"
                />
                <Line
                  yAxisId="r"
                  type="monotone"
                  dataKey="jami"
                  name="Jamlanma"
                  stroke={C.amber}
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p
            style={{
              fontSize: 11.5,
              color: C.faint,
              margin: "8px 0 0",
              lineHeight: 1.5,
            }}
          >
            Yuklamaning 76%i 2026-yilning sentyabr — noyabr oylariga to'g'ri keladi:
            uch oyda 184 nafar xodim ishga olinishi rejalashtirilgan.
          </p>
        </Panel>
      </div>

      {/* ---------------- 3-QATOR: BOSQICHLAR ---------------- */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          marginBottom: 14,
        }}
      >
        <Panel
          title="Avgust bosqichlari"
          hint={`Jami ${STAGE_TOTAL} nafar · tizimli grafik`}
        >
          <div style={{ marginTop: 6 }}>
            {stages.map((s) => (
              <div key={s.id} style={{ marginBottom: 14 }}>
                <div className="flex items-baseline justify-between gap-2">
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {s.label}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_NUM,
                      fontSize: 13,
                      color: s.color,
                      fontWeight: 600,
                    }}
                  >
                    {s.count} nafar
                    <span style={{ color: C.faint, marginLeft: 6 }}>
                      {Math.round((s.count / STAGE_TOTAL) * 100)}%
                    </span>
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 7,
                    height: 8,
                    background: "#1a2540",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(s.count / STAGE_TOTAL) * 100}%`,
                      height: "100%",
                      borderRadius: 99,
                      background: `linear-gradient(90deg, ${s.color}, ${s.color}77)`,
                    }}
                  />
                </div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 5 }}>
                  {s.range}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="I bosqich vakansiyalari holati"
          hint="53 ta vakant o'rin bo'yicha saralash"
        >
          <div className="flex items-center gap-4">
            <Donut
              data={stageOneStatus}
              total={53}
              centerTop="53"
              centerBottom="vakant"
              thickness={14}
            />
            <div className="flex-1" style={{ minWidth: 0 }}>
              <Legend items={stageOneStatus} total={53} />
              <div
                style={{
                  marginTop: 10,
                  padding: "9px 11px",
                  borderRadius: 10,
                  background: `${C.green}14`,
                  border: `1px solid ${C.green}33`,
                  fontSize: 11.5,
                  color: C.dim,
                  lineHeight: 1.5,
                }}
              >
                <CircleCheck
                  size={12}
                  color={C.green}
                  style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }}
                />
                Barcha 77 ta vakansiya bo'yicha talablar ishlab chiqildi va
                kelishishga topshirildi.
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="E'lon kanallari" hint="Nomzod oqimi manbalari">
          <div style={{ marginTop: 6 }}>
            {channels.map((ch) => {
              const Icon = ch.icon;
              return (
                <div
                  key={ch.name}
                  className="flex items-center gap-3 tmk-row"
                  style={{
                    padding: "10px 10px",
                    borderRadius: 10,
                    border: `1px solid ${C.line}`,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      background: `${ch.color}1c`,
                      border: `1px solid ${ch.color}3a`,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={14} color={ch.color} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>
                      {ch.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.faint,
                        fontFamily: FONT_NUM,
                      }}
                    >
                      {ch.meta}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* ---------------- 4-QATOR: BO'LINMALAR + VAKANSIYALAR ---------------- */}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: "minmax(340px, 1.35fr) minmax(300px, 1fr)",
          marginBottom: 14,
        }}
      >
        <Panel
          title="Shtat taqsimoti"
          hint={
            deptView === "dept"
              ? "Bo'linmalar kesimida, 241 birlik"
              : "Texnologik uchastkalar ichida, 102 birlik"
          }
          right={
            <div
              className="flex"
              style={{
                background: "#101a2e",
                border: `1px solid ${C.line}`,
                borderRadius: 9,
                padding: 3,
                gap: 3,
              }}
            >
              {[
                ["dept", "Bo'linmalar"],
                ["tech", "Uchastkalar"],
              ].map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setDeptView(k)}
                  style={{
                    border: "none",
                    borderRadius: 7,
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: deptView === k ? C.blue : "transparent",
                    color: deptView === k ? "#06101f" : C.dim,
                    fontFamily: FONT_BODY,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          }
        >
          <div style={{ height: 380, marginTop: 6 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptData}
                layout="vertical"
                margin={{ top: 4, right: 34, bottom: 0, left: 12 }}
              >
                <CartesianGrid stroke={C.line} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: C.faint, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={168}
                  tick={{ fill: C.dim, fontSize: 10.5 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTip />} cursor={{ fill: "#ffffff08" }} />
                <Bar
                  dataKey="value"
                  name="Shtat"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={16}
                  fill={deptView === "dept" ? C.blue : C.teal}
                >
                  <LabelList
                    dataKey="value"
                    position="right"
                    style={{ fill: C.dim, fontSize: 10.5, fontFamily: FONT_NUM }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Eng katta vakansiya guruhlari"
          hint="Mobilizatsiya rejasi bo'yicha ochiq o'rinlar"
        >
          <div
            className="tmk-scroll"
            style={{ marginTop: 6, maxHeight: 380, overflowY: "auto", paddingRight: 4 }}
          >
            {topVacancies.map((v) => {
              const tone =
                v.grp === "Ishchi" ? C.blue : v.grp === "ITX" ? C.violet : C.teal;
              return (
                <div
                  key={v.pos}
                  className="tmk-row"
                  style={{
                    padding: "9px 10px",
                    borderRadius: 10,
                    marginBottom: 6,
                    border: `1px solid ${C.line}`,
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span style={{ fontSize: 12.5, lineHeight: 1.35 }}>
                      {v.pos}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_NUM,
                        fontSize: 14,
                        fontWeight: 600,
                        color: tone,
                        flexShrink: 0,
                      }}
                    >
                      {v.n}
                    </span>
                  </div>
                  <div className="flex items-center gap-2" style={{ marginTop: 7 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 4,
                        background: "#1a2540",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(v.n / 17) * 100}%`,
                          height: "100%",
                          background: tone,
                          borderRadius: 99,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        color: C.faint,
                        letterSpacing: ".06em",
                        textTransform: "uppercase",
                      }}
                    >
                      {v.grp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* ---------------- 5-QATOR: LOYIHA HOLATI ---------------- */}
      <Panel
        title="Xizmat safari yakunlari"
        hint="Loyiha bo'yicha bajarilgan asosiy ishlar"
        style={{ marginBottom: 14 }}
      >
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            marginTop: 6,
          }}
        >
          {projectTasks.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.n}
                style={{
                  border: `1px solid ${C.line}`,
                  borderRadius: 12,
                  padding: "13px 14px",
                  background: "#0c1322",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 9,
                      background: `${t.tone}1c`,
                      border: `1px solid ${t.tone}3a`,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Icon size={14} color={t.tone} />
                  </span>
                  <span
                    style={{
                      fontFamily: FONT_NUM,
                      fontSize: 11,
                      color: C.faint,
                    }}
                  >
                    {t.n}
                  </span>
                </div>
                <h4
                  style={{
                    margin: "11px 0 0",
                    fontSize: 13.5,
                    fontWeight: 600,
                  }}
                >
                  {t.title}
                </h4>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 11.5,
                    color: C.faint,
                    lineHeight: 1.5,
                  }}
                >
                  {t.desc}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 11,
                    padding: "4px 10px",
                    borderRadius: 99,
                    fontSize: 10.5,
                    fontWeight: 600,
                    letterSpacing: ".05em",
                    textTransform: "uppercase",
                    background: `${t.tone}1c`,
                    border: `1px solid ${t.tone}3a`,
                    color: t.tone,
                  }}
                >
                  {t.status}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* ---------------- 6-QATOR: BAND XODIMLAR ---------------- */}
      <Panel
        title="Rasmiylashtirilgan xodimlar"
        hint={`${FILLED} nafar · shtatning ${fillPct.toFixed(1)}%i`}
        right={
          <span
            style={{
              fontFamily: FONT_NUM,
              fontSize: 12,
              color: C.green,
              background: `${C.green}14`,
              border: `1px solid ${C.green}33`,
              borderRadius: 99,
              padding: "4px 11px",
            }}
          >
            {FILLED} / {TOTAL_STAFF}
          </span>
        }
      >
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(268px, 1fr))",
            marginTop: 6,
          }}
        >
          {filledStaff.map(([name, role, unit]) => (
            <div
              key={name}
              className="flex items-center gap-3 tmk-row"
              style={{
                border: `1px solid ${C.line}`,
                borderRadius: 10,
                padding: "9px 11px",
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 99,
                  background: "#16223a",
                  border: `1px solid ${C.line}`,
                  display: "grid",
                  placeItems: "center",
                  fontFamily: FONT_NUM,
                  fontSize: 11,
                  color: C.cyan,
                  flexShrink: 0,
                }}
              >
                {name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </span>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.faint,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {role} · {unit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* ---------------- FOOTER ---------------- */}
      <footer
        className="flex items-center justify-between gap-3 flex-wrap"
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: `1px solid ${C.line}`,
          fontSize: 11,
          color: C.faint,
        }}
      >
        <span>
          Manbalar: tashkiliy tuzilma loyihasi · xizmat safari yakuniy hisoboti ·
          mobilizatsiya rejasi (07.08.2026)
        </span>
        <span style={{ fontFamily: FONT_NUM }}>
          Shtat balansi: 1 + 30 + 178 + 32 = 241 birlik
        </span>
      </footer>
    </div>
  );
}
