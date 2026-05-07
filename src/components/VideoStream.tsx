import React, { useState } from "react";
import WebRTCPlayer from "./WebRTCPlayer";
import PTZControls from "./PTZControls";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StreamCell {
    id: string;
    label: string;
    streamUrl?: string;
    type?: string;
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

    {
        id: "t2",
        label: "Angren PTZ",
        streamUrl: "https://tmkstream.bgs.uz/stream/27aec28e-6181-4753-9acd-0456a75f0289/channel/1/webrtc?uuid=27aec28e-6181-4753-9acd-0456a75f0289&channel=1",
        type: "ptz",
    },
    {
        id: "t1",
        label: "Navoi 1",
        streamUrl: "https://tmkstream.bgs.uz/stream/5705c987-46c6-4144-af4e-9ff878309c83/channel/1/webrtc?uuid=5705c987-46c6-4144-af4e-9ff878309c83=1",
        type: "oddiy",

    },
    {
        id: "t3",
        label: "Angren PTZ Panorama ",
        streamUrl: "https://tmkstream.bgs.uz/stream/46c74c01-a0bd-4e42-ade1-0a5dc734ce09/channel/1/webrtc?uuid=46c74c01-a0bd-4e42-ade1-0a5dc734ce09&channel=1",
        type: "ptz",

    },
    {
        id: "t4",
        label: "Navoi 2 PTZ Panoraman ",
        streamUrl: "https://tmkstream.bgs.uz/stream/85d5d297-7d73-43c6-a589-d175d78eb771/channel/1/webrtc?uuid=85d5d297-7d73-43c6-a589-d175d78eb771&channel=1",
        type: "ptz",

    },


    // // Tepa — 4 ta
    // { id: "t1", label: "T-1", streamUrl: rand() },
    // { id: "t2", label: "T-2", streamUrl: rand() },
    // { id: "t3", label: "T-3", streamUrl: rand() },
    // { id: "t4", label: "T-4", streamUrl: rand() },
    // // Chap — 2 ta (vertikal)
    // { id: "l1", label: "L-1", streamUrl: rand() },
    // { id: "l2", label: "L-2", streamUrl: rand() },
    // // Markaz — katta ekran
    // { id: "main", label: "Asosiy", streamUrl: rand() },
    // // O'ng — 2 ta (vertikal)
    // { id: "r1", label: "R-1", streamUrl: rand() },
    // { id: "r2", label: "R-2", streamUrl: rand() },
    // // Past — 4 ta
    // { id: "b1", label: "B-1", streamUrl: rand() },
    // { id: "b2", label: "B-2", streamUrl: rand() },
    // { id: "b3", label: "B-3", streamUrl: rand() },
    // { id: "b4", label: "B-4", streamUrl: rand() },
];

// ─── Player ───────────────────────────────────────────────────────────────────

// const Player: React.FC<{ cell: StreamCell; videoKey?: string }> = ({ cell, videoKey }) => {
//     if (!cell.streamUrl) return null;
//     if (isVideoFile(cell.streamUrl)) {
//         return (
//             <video
//                 key={videoKey ?? cell.id}
//                 src="https://gostream.bgs.uz/stream/27aec28e-6181-4753-9acd-0456a75f0289/channel/1/webrtc?uuid=27aec28e-6181-4753-9acd-0456a75f0289&channel=1"
//                 autoPlay muted loop playsInline
//                 style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
//             />
//         );
//     }
//     return (
//         <iframe
//             key={videoKey ?? cell.id}
//             src="https://gostream.bgs.uz/stream/27aec28e-6181-4753-9acd-0456a75f0289/channel/1/webrtc?uuid=27aec28e-6181-4753-9acd-0456a75f0289&channel=1"
//             allow="autoplay; fullscreen"
//             allowFullScreen
//             title={cell.label}
//             style={{ width: "100%", height: "100%", border: "none", display: "block" }}
//         />
//     );
// };

const STREAM =
    "https://gostream.bgs.uz/stream/27aec28e-6181-4753-9acd-0456a75f0289/channel/1/webrtc?uuid=27aec28e-6181-4753-9acd-0456a75f0289&channel=1";




const Player: React.FC<{ cell: StreamCell }> = ({ cell }) => {
    if (!cell.streamUrl) return null;

    return <WebRTCPlayer url={cell.streamUrl} />;
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
        {/*<Player cell={cell} />*/}
        <WebRTCPlayer url={cell.streamUrl!} />
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
    const c = cells.length >= 4 ? cells : defaultCells;
    const [t1, t2, t3, t4] = c;

    const [focusedId, setFocusedId] = useState<any>(t1?.id);
    const [selectedCell, setSelectedCell] = useState<StreamCell | null>(null);

    const click = (cell: StreamCell) => {
        setFocusedId(cell.id);
        setSelectedCell(cell);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden" }}>
            <div
                style={{
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gridTemplateRows: "repeat(2, 1fr)",
                    gap,
                    background: "#0a0a0a",
                    padding: gap,
                    boxSizing: "border-box",
                    minHeight: 0 // Grid containerning qisqarishiga imkon beradi
                }}
            >
                <Cell cell={t1} isActive={focusedId === t1.id} onClick={() => click(t1)} gridArea="1 / 1" />
                <Cell cell={t2} isActive={focusedId === t2.id} onClick={() => click(t2)} gridArea="1 / 2" />
                <Cell cell={t3} isActive={focusedId === t3.id} onClick={() => click(t3)} gridArea="2 / 1" />
                <Cell cell={t4} isActive={focusedId === t4.id} onClick={() => click(t4)} gridArea="2 / 2" />
            </div>

            {/* ── Events Section ────────────────────────────────────────────────── */}
            <div style={{
                height: "120px",
                background: "#030d22",
                borderTop: "1px solid #0EA8C733",
                padding: "8px 12px",
                overflowY: "auto",
                color: "#ccc",
                fontSize: "11px",
                flexShrink: 0
            }}>
                <div style={{ fontWeight: "bold", marginBottom: "6px", color: "#0EA8C7", display: "flex", justifyContent: "space-between", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <span>So'nggi hodisalar (Events)</span>
                    <span style={{ fontSize: "10px", opacity: 0.7 }}>JAMI: 4</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {[
                        { time: "19:45:12", type: "Motion", camera: "Navoi 1", desc: "Harakat aniqlandi" },
                        { time: "19:42:05", type: "System", camera: "Angren PTZ", desc: "Kamera ulandi" },
                        { time: "19:40:55", type: "PTZ", camera: "Angren PTZ", desc: "Pozitsiya o'zgardi" },
                        { time: "19:38:20", type: "Storage", camera: "Navoi 2", desc: "Arxiv yozilmoqda" },
                    ].map((ev, i) => (
                        <div key={i} style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(14,168,199,0.1)", paddingBottom: "3px" }}>
                            <span style={{ color: "#555", whiteSpace: "nowrap" }}>{ev.time}</span>
                            <span style={{ color: "#4af", minWidth: "50px", whiteSpace: "nowrap" }}>[{ev.type}]</span>
                            <span style={{ color: "#888", whiteSpace: "nowrap" }}>{ev.camera}:</span>
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ev.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Modal Overlay ─────────────────────────────────────────────────── */}
            {selectedCell && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 1000,
                    background: "rgba(0,0,0,0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px"
                }}>
                    <div style={{
                        position: "relative",
                        width: "90%",
                        height: "90%",
                        background: "#000",
                        borderRadius: "8px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid #333"
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: "10px 20px",
                            background: "#1a1a1a",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom: "1px solid #333"
                        }}>
                            <span style={{ color: "#fff", fontWeight: 500 }}>{selectedCell.label}</span>
                            <button
                                onClick={() => setSelectedCell(null)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#fff",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    lineHeight: "1"
                                }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ flex: 1, position: "relative", display: "flex", overflow: "hidden" }}>
                            <div style={{ flex: 1, background: "#000" }}>
                                <WebRTCPlayer url={selectedCell.streamUrl!} />
                            </div>

                            {/* PTZ Controls Side Panel */}
                            {selectedCell.type === "ptz" && (
                                <div style={{
                                    width: "240px",
                                    background: "#1a1a1a",
                                    borderLeft: "1px solid #333",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    padding: "10px",
                                    overflowY: "auto"
                                }}>
                                    <PTZControls 
                                        camera={selectedCell} 
                                        onSendCommand={(cmd: any) => {
                                            console.log("PTZ Command Sent:", cmd);
                                        }} 
                                    />
                                    
                                    <div style={{ marginTop: "auto", padding: "10px", fontSize: "10px", color: "#555", textAlign: "center" }}>
                                        Kamera ID: {selectedCell.id}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PTZButton = ({ label, onClick, style }: { label: string, onClick: () => void, style?: React.CSSProperties }) => (
    <button
        onClick={onClick}
        style={{
            background: "#333",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            transition: "background 0.2s",
            padding: "5px",
            ...style
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#444")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "#333")}
    >
        {label}
    </button>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const badge: React.CSSProperties = {
    position: "absolute", top: 4, left: 5,
    background: "rgba(0,0,0,0.7)", color: "#999",
    fontSize: 12, padding: "3px 5px 4px 5px", borderRadius: 3,
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