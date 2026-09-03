import React from "react";
import { C } from "../../../components/dashboardUI";
import { GC, alpha, gradient } from "../../../theme/palette";

/* ══════════════════════════════════════════════════════════════════════════
   dash_HR_API ekranining umumiy UI bo'laklari.

   Uslub loyihadagi boshqa dashboardlarga (`HrZub`, `dashboardUI`) mos:
   `C` va `GC` tokenlaridan tashqari rang bu yerda saqlanmaydi.
   ══════════════════════════════════════════════════════════════════════════ */

export const ACCENT = GC.blue;

export const Panel: React.FC<{
    children: React.ReactNode;
    style?: React.CSSProperties;
    id?: string;
}> = ({ children, style, id }) => (
    <div id={id} style={{
        background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "13px 15px",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        ...style,
    }}>
        {children}
    </div>
);

export const SectionHead: React.FC<{
    title: string;
    sub?: string;
    right?: React.ReactNode;
}> = ({ title, sub, right }) => (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 11 }}>
        <div style={{ minWidth: 0 }}>
            <div style={{ color: C.text, fontSize: 14.5, fontWeight: 700 }}>{title}</div>
            {sub && <div style={{ color: C.sub, fontSize: 10.5, opacity: 0.65, marginTop: 3 }}>{sub}</div>}
        </div>
        {right}
    </div>
);

export const LinkBtn: React.FC<{
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    active?: boolean;
}> = ({ children, onClick, disabled, active }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            background: active ? `${ACCENT}42` : `${ACCENT}1f`,
            border: `1px solid ${active ? ACCENT : `${ACCENT}55`}`,
            color: active ? GC.white : GC.cyan,
            fontSize: 10.5, fontWeight: 700, padding: "5px 11px", borderRadius: 7,
            cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1, flexShrink: 0,
            fontFamily: "inherit", whiteSpace: "nowrap",
        }}
    >{children}</button>
);

/** Bir nechta variantdan bittasini tanlash (period_type, group_by, mode). */
export function Segmented<T extends string>({ value, options, onChange }: {
    value: T;
    options: { value: T; label: string }[];
    onChange: (v: T) => void;
}) {
    return (
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
            {options.map((o) => (
                <LinkBtn key={o.value} active={o.value === value} onClick={() => onChange(o.value)}>
                    {o.label}
                </LinkBtn>
            ))}
        </div>
    );
}

export const DateInput: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
    <label style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
        <span style={{ color: C.sub, fontSize: 10, opacity: 0.7, whiteSpace: "nowrap" }}>{label}</span>
        <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`, color: C.text,
                borderRadius: 7, padding: "5px 9px", fontSize: 10.5, fontFamily: "inherit",
                colorScheme: "dark",
            }}
        />
    </label>
);

export const KpiTile: React.FC<{
    label: string; value: string; note: string; tone: string;
}> = ({ label, value, note, tone }) => (
    <div style={{
        position: "relative", overflow: "hidden", borderRadius: 12, padding: "13px 15px", minWidth: 0,
        background: gradient(tone, 120),
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: `0 6px 18px ${alpha(tone, 0.2)}`,
    }}>
        <div style={{
            position: "absolute", right: -22, top: -30, width: 108, height: 108, borderRadius: "50%",
            background: "rgba(255,255,255,0.13)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", color: "rgba(255,255,255,0.92)", fontSize: 11, fontWeight: 600 }}>{label}</div>
        <div style={{ position: "relative", color: "#fff", fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginTop: 7 }}>{value}</div>
        <div style={{ position: "relative", color: "rgba(255,255,255,0.8)", fontSize: 10, marginTop: 6 }}>{note}</div>
    </div>
);

export const StatChip: React.FC<{
    label: string; value: string; note: string; tone: string; onClick?: () => void;
}> = ({ label, value, note, tone, onClick }) => (
    <div
        onClick={onClick}
        style={{
            position: "relative", overflow: "hidden", borderRadius: 10, padding: "10px 12px", minWidth: 0,
            background: gradient(tone, 125),
            border: "1px solid rgba(255,255,255,0.14)",
            cursor: onClick ? "pointer" : "default",
        }}
    >
        <div style={{
            position: "absolute", right: -18, top: -24, width: 76, height: 76, borderRadius: "50%",
            background: "rgba(255,255,255,0.12)", pointerEvents: "none",
        }} />
        <div style={{ position: "relative", color: "rgba(255,255,255,0.92)", fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
        <div style={{ position: "relative", color: "#fff", fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginTop: 4 }}>{value}</div>
        <div style={{ position: "relative", color: "rgba(255,255,255,0.78)", fontSize: 9, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{note}</div>
    </div>
);

/** Bo'sh javob — xato emas: 1C da o'sha sana/kesim uchun yozuv yo'q. */
export const EmptyState: React.FC<{ text: string; height?: number }> = ({ text, height = 110 }) => (
    <div style={{
        minHeight: height, display: "flex", alignItems: "center", justifyContent: "center",
        color: C.sub, fontSize: 11, opacity: 0.6, textAlign: "center", padding: 12,
        border: `1px dashed ${C.border}`, borderRadius: 9, lineHeight: 1.5,
    }}>{text}</div>
);

export const ErrorState: React.FC<{ text: string; height?: number }> = ({ text, height = 60 }) => (
    <div style={{
        minHeight: height, display: "flex", alignItems: "center", justifyContent: "center",
        color: C.down, fontSize: 10.5, textAlign: "center", padding: 10,
        border: `1px dashed ${C.down}55`, background: `${C.down}0d`, borderRadius: 9, lineHeight: 1.5,
    }}>{text}</div>
);

/**
 * 1C xatolarini odam tushunadigan matnga o'giradi. 401 — Basic Auth,
 * 400 — parametr, timeout/Network — CORS yoki servis o'chirilgan holat.
 */
export const apiErrorText = (error: unknown): string => {
    const e = error as any;
    const status = e?.response?.status;
    const msg = e?.response?.data?.message ?? e?.message;
    if (status === 401) return "401 — Basic Auth login/parol noto'g'ri (REACT_APP_DASH_HR_LOGIN / _PASS)";
    if (status === 400) return `400 — so'rov parametrlari noto'g'ri${msg ? `: ${msg}` : ""}`;
    if (status === 500) return `500 — 1C tomonida xato${msg ? `: ${msg}` : ""}`;
    if (e?.code === "ECONNABORTED") return "Timeout — 1C 60 soniyada javob bermadi";
    if (e?.code === "ERR_NETWORK") return "Tarmoq/CORS xatosi — 1C ga brauzerdan to'g'ridan-to'g'ri kirib bo'lmadi";
    return msg ? String(msg) : "API bilan bog'lanib bo'lmadi";
};

/** Blok holati: yuklanmoqda → xato → bo'sh → ma'lumot. */
export const Block: React.FC<{
    loading: boolean; error: unknown; empty: boolean;
    emptyText: string; height?: number; children: React.ReactNode;
}> = ({ loading, error, empty, emptyText, height, children }) => {
    if (loading) return <EmptyState text="Yuklanmoqda…" height={height} />;
    if (error) return <ErrorState text={`API xatosi: ${apiErrorText(error)}`} height={height} />;
    if (empty) return <EmptyState text={emptyText} height={height} />;
    return <>{children}</>;
};

export const LegendRow: React.FC<{
    color: string; label: string; value: string; pct?: string;
}> = ({ color, label, value, pct }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 10.5 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
        <span style={{ color: C.sub, flex: 1, opacity: 0.9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
        <span style={{ color: C.text, fontWeight: 700, flexShrink: 0 }}>{value}</span>
        {pct !== undefined && <span style={{ color: C.sub, opacity: 0.65, flexShrink: 0, width: 42, textAlign: "right" }}>{pct}</span>}
    </div>
);

/** Reja/fakt kabi nisbatlar uchun ingichka progress. */
export const MiniBar: React.FC<{ pct: number; color: string }> = ({ pct, color }) => (
    <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div style={{
            width: `${Math.max(0, Math.min(100, pct))}%`, height: "100%", borderRadius: 3,
            background: color, boxShadow: `0 0 6px ${alpha(color, 0.6)}`,
        }} />
    </div>
);

export const th: React.CSSProperties = {
    color: C.sub, fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase",
    textAlign: "left", padding: "7px 9px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", opacity: 0.75,
};

export const td: React.CSSProperties = {
    color: C.text, fontSize: 11, padding: "8px 9px", borderBottom: `1px solid ${C.border}`,
};

/** Doughnut markazidagi matn (Chart.js plagini). */
export const centerText = (main: string, sub: string) => ({
    id: "dashHrCenter",
    afterDraw(chart: any) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const cx = (chartArea.left + chartArea.right) / 2;
        const cy = (chartArea.top + chartArea.bottom) / 2;
        ctx.save();
        ctx.textAlign = "center";
        ctx.fillStyle = C.text;
        ctx.font = '700 19px "Segoe UI", sans-serif';
        ctx.fillText(main, cx, cy + 1);
        ctx.fillStyle = C.sub;
        ctx.font = '400 9px "Segoe UI", sans-serif';
        ctx.fillText(sub, cx, cy + 16);
        ctx.restore();
    },
});

/* ── Chart.js umumiy sozlamalari ── */
export const gridAxis = {
    x: { grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 9 }, maxRotation: 0, autoSkipPadding: 14 } },
    y: { beginAtZero: true, grid: { color: C.grid }, ticks: { color: C.sub, font: { size: 9 } } },
};

export const legendTop = {
    legend: { display: true, position: "top", labels: { color: C.sub, boxWidth: 7, boxHeight: 7, usePointStyle: true, font: { size: 10 } } },
};
