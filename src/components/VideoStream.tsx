import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StreamCell {
    id: string;
    label: string;
    streamUrl?: string;
}

export interface StreamGridProps {
    cells?: StreamCell[];
    gap?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEST = ["./videos/test.mp4", "./videos/test2.mp4"];
const rand = () => TEST[Math.floor(Math.random() * TEST.length)];

function isVideoFile(url: string): boolean {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

/*
  SXEMA (5 qator x 4 ustun):
  ┌──────┬──────┬──────┬──────┐
  │  T1  │  T2  │  T3  │  T4  │  row 1 — tepa 4 ta
  ├──────┼──────┴──────┼──────┤
  │  L1  │             │  R1  │  row 2 ┐
  ├──────┤   MARKAZ    ├──────┤         ├─ markaz rowspan 2
  │  L2  │  (2×2)     │  R2  │  row 3 ┘
  ├──────┼──────┬──────┼──────┤
  │  B1  │  B2  │  B3  │  B4  │  row 4 — past 4 ta
  └──────┴──────┴──────┴──────┘

  Chap: L1(row2,col1), L2(row3,col1) — 2 ta
  O'ng: R1(row2,col4), R2(row3,col4) — 2 ta
  Jami kichik: 4+2+2+4 = 12 ta + 1 markaz = 13 ta cell
*/

const defaultCells: StreamCell[] = [
    // Tepa — 4 ta
    { id: "t1", label: "T-1", streamUrl: rand() },
    { id: "t2", label: "T-2", streamUrl: rand() },
    { id: "t3", label: "T-3", streamUrl: rand() },
    { id: "t4", label: "T-4", streamUrl: rand() },
    // Chap — 2 ta (vertikal)
    { id: "l1", label: "L-1", streamUrl: rand() },
    { id: "l2", label: "L-2", streamUrl: rand() },
    // Markaz — katta ekran
    { id: "main", label: "Asosiy", streamUrl: rand() },
    // O'ng — 2 ta (vertikal)
    { id: "r1", label: "R-1", streamUrl: rand() },
    { id: "r2", label: "R-2", streamUrl: rand() },
    // Past — 4 ta
    { id: "b1", label: "B-1", streamUrl: rand() },
    { id: "b2", label: "B-2", streamUrl: rand() },
    { id: "b3", label: "B-3", streamUrl: rand() },
    { id: "b4", label: "B-4", streamUrl: rand() },
];

// ─── Player ───────────────────────────────────────────────────────────────────

const Player: React.FC<{ cell: StreamCell; videoKey?: string }> = ({ cell, videoKey }) => {
    if (!cell.streamUrl) return null;
    if (isVideoFile(cell.streamUrl)) {
        return (
            <video
                key={videoKey ?? cell.id}
                src={cell.streamUrl}
                autoPlay muted loop playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
        );
    }
    return (
        <iframe
            key={videoKey ?? cell.id}
            src={cell.streamUrl}
            allow="autoplay; fullscreen"
            allowFullScreen
            title={cell.label}
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
        />
    );
};

// ─── Small Cell ───────────────────────────────────────────────────────────────

const Cell: React.FC<{
    cell: StreamCell;
    isActive: boolean;
    onClick: () => void;
    gridArea: string; // e.g. "1 / 1 / 2 / 2"
}> = ({ cell, isActive, onClick, gridArea }) => (
    <div
        onClick={onClick}
        style={{
            gridArea,
            position: "relative",
            overflow: "hidden",
            borderRadius: 2,
            background: "#0d0d0d",
            cursor: "pointer",
            outline: isActive
                ? "2px solid rgba(68,170,255,0.85)"
                : "1px solid rgba(255,255,255,0.07)",
            outlineOffset: -1,
            transition: "outline 0.12s",
        }}
    >
        <Player cell={cell} />

        {!cell.streamUrl && (
            <div style={noStream}>
                <TvIcon size={13} />
            </div>
        )}

        <span style={badge}>{cell.label}</span>
        {isActive && <span style={activeMark}>▶</span>}
    </div>
);

// ─── StreamGrid ───────────────────────────────────────────────────────────────

const StreamGrid: React.FC<StreamGridProps> = ({
                                                   cells = defaultCells,
                                                   gap = 3,
                                               }) => {
    const c = cells.length >= 13 ? cells : defaultCells;
    const [t1, t2, t3, t4, l1, l2, mainCell, r1, r2, b1, b2, b3, b4] = c;

    const [focusedId, setFocusedId] = useState<string>(mainCell.id);
    const focused = c.find((x) => x.id === focusedId) ?? mainCell;

    const click = (id: string) => setFocusedId(id);

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gridTemplateRows: "repeat(4, 1fr)",
                gap,
                background: "#0a0a0a",
                padding: gap,
                boxSizing: "border-box",
            }}
        >
            {/* ── TEPA — row 1 ── */}
            <Cell cell={t1} isActive={focusedId === t1.id} onClick={() => click(t1.id)} gridArea="1 / 1 / 2 / 2" />
            <Cell cell={t2} isActive={focusedId === t2.id} onClick={() => click(t2.id)} gridArea="1 / 2 / 2 / 3" />
            <Cell cell={t3} isActive={focusedId === t3.id} onClick={() => click(t3.id)} gridArea="1 / 3 / 2 / 4" />
            <Cell cell={t4} isActive={focusedId === t4.id} onClick={() => click(t4.id)} gridArea="1 / 4 / 2 / 5" />

            {/* ── CHAP — col 1, row 2-3 ── */}
            <Cell cell={l1} isActive={focusedId === l1.id} onClick={() => click(l1.id)} gridArea="2 / 1 / 3 / 2" />
            <Cell cell={l2} isActive={focusedId === l2.id} onClick={() => click(l2.id)} gridArea="3 / 1 / 4 / 2" />

            {/* ── MARKAZ — col 2-3, row 2-3 (rowspan+colspan 2) ── */}
            <div
                style={{
                    gridArea: "2 / 2 / 4 / 4",
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 2,
                    background: "#0d0d0d",
                    outline: "1px solid rgba(68,170,255,0.2)",
                    outlineOffset: -1,
                }}
            >
                <Player cell={focused} videoKey={focusedId} />

                {!focused.streamUrl && (
                    <div style={noStream}>
                        <TvIcon size={36} />
                        <span style={{ fontSize: 11, color: "#2a2a2a", marginTop: 6 }}>{focused.label}</span>
                    </div>
                )}

                <div style={mainLabel}>{focused.label}</div>
            </div>

            {/* ── O'NG — col 4, row 2-3 ── */}
            <Cell cell={r1} isActive={focusedId === r1.id} onClick={() => click(r1.id)} gridArea="2 / 4 / 3 / 5" />
            <Cell cell={r2} isActive={focusedId === r2.id} onClick={() => click(r2.id)} gridArea="3 / 4 / 4 / 5" />

            {/* ── PAST — row 4 ── */}
            <Cell cell={b1} isActive={focusedId === b1.id} onClick={() => click(b1.id)} gridArea="4 / 1 / 5 / 2" />
            <Cell cell={b2} isActive={focusedId === b2.id} onClick={() => click(b2.id)} gridArea="4 / 2 / 5 / 3" />
            <Cell cell={b3} isActive={focusedId === b3.id} onClick={() => click(b3.id)} gridArea="4 / 3 / 5 / 4" />
            <Cell cell={b4} isActive={focusedId === b4.id} onClick={() => click(b4.id)} gridArea="4 / 4 / 5 / 5" />
        </div>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const badge: React.CSSProperties = {
    position: "absolute", top: 4, left: 5,
    background: "rgba(0,0,0,0.7)", color: "#999",
    fontSize: 9, padding: "1px 5px", borderRadius: 3,
    zIndex: 2, whiteSpace: "nowrap", pointerEvents: "none",
};

const activeMark: React.CSSProperties = {
    position: "absolute", top: 4, right: 5,
    color: "#4af", fontSize: 8, zIndex: 2, pointerEvents: "none",
};

const mainLabel: React.CSSProperties = {
    position: "absolute", bottom: 8, left: 10,
    background: "rgba(0,0,0,0.65)", color: "#bbb",
    fontSize: 11, padding: "3px 10px", borderRadius: 4,
    backdropFilter: "blur(4px)", letterSpacing: "0.3px",
    pointerEvents: "none",
};

const noStream: React.CSSProperties = {
    position: "absolute", inset: 0,
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    color: "#2a2a2a", pointerEvents: "none", userSelect: "none",
};

const TvIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M8 5V3M16 5V3M2 10h20" />
    </svg>
);

export default StreamGrid;