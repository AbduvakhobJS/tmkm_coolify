import React, { useState, useEffect } from "react";
import WebRTCPlayer from "./WebRTCPlayer";
import PTZControls from "./PTZControls";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StreamCell {
    id: string;          // stream_uuid
    cameraId: number;    // numeric ID from API (used for PTZ)
    label: string;
    streamUrl?: string;
    type?: string;       // 'ptz' | 'oddiy'
    has_ptz?: boolean;
}

export interface StreamGridProps {
    cells?: StreamCell[];
    gap?: number;
}

// ─── API config ───────────────────────────────────────────────────────────────

const API_BASE = "https://tmk.bgs.uz/api";

/** UUID tartibini saqlash uchun — shu ketma-ketlikda 4 ta kamera chiqadi */
const TARGET_UUIDS = [
    "27aec28e-6181-4753-9acd-0456a75f0289",
    // "27aec28e-6181-4753-9acd-0456a75f0289",
    "5705c987-46c6-4144-af4e-9ff878309c83",
    "46c74c01-a0bd-4e42-ade1-0a5dc734ce09",
    "85d5d297-7d73-43c6-a589-d175d78eb771",
];

/** API yuklanguncha fallback (stream URL-lar to'g'ri) */
const defaultCells: StreamCell[] = [
    // {
    //     id: "27aec28e-6181-4753-9acd-0456a75f0289",
    //     cameraId: 6,
    //     label: "Navoi 1",
    //     streamUrl: "https://tmkstream.bgs.uz/stream/27aec28e-6181-4753-9acd-0456a75f0289/channel/1/webrtc?uuid=27aec28e-6181-4753-9acd-0456a75f0289&channel=1",
    //     type: "oddiy",
    //     has_ptz: false,
    // },
    // {
    //     id: "5705c987-46c6-4144-af4e-9ff878309c83",
    //     cameraId: 5,
    //     label: "Angren PTZ",
    //     streamUrl: "https://tmkstream.bgs.uz/stream/5705c987-46c6-4144-af4e-9ff878309c83/channel/1/webrtc?uuid=5705c987-46c6-4144-af4e-9ff878309c83&channel=1",
    //     type: "ptz",
    //     has_ptz: true,
    // },
    // {
    //     id: "46c74c01-a0bd-4e42-ade1-0a5dc734ce09",
    //     cameraId: 4,
    //     label: "Angren PTZ Panorama",
    //     streamUrl: "https://tmkstream.bgs.uz/stream/46c74c01-a0bd-4e42-ade1-0a5dc734ce09/channel/1/webrtc?uuid=46c74c01-a0bd-4e42-ade1-0a5dc734ce09&channel=1",
    //     type: "ptz",
    //     has_ptz: true,
    // },
    // {
    //     id: "85d5d297-7d73-43c6-a589-d175d78eb771",
    //     cameraId: 10,
    //     label: "Navoi 2 PTZ Panorama",
    //     streamUrl: "https://tmkstream.bgs.uz/stream/85d5d297-7d73-43c6-a589-d175d78eb771/channel/1/webrtc?uuid=85d5d297-7d73-43c6-a589-d175d78eb771&channel=1",
    //     type: "ptz",
    //     has_ptz: true,
    // },
];

// ─── API fetch hook ───────────────────────────────────────────────────────────

function useCameras(): StreamCell[] {
    const [cells, setCells] = useState<StreamCell[]>(defaultCells);

    useEffect(() => {
        fetch(`${API_BASE}/cameras?lang=uz`)
            .then(r => r.json())
            .then((data: { factories: { cameras: any[] }[] }) => {
                // Barcha kameralarni yig'amiz
                const all: any[] = data.factories.flatMap(f => f.cameras);

                // TARGET_UUIDS tartibida 4 ta cell yasaymiz
                const fetched: StreamCell[] = TARGET_UUIDS.map(uuid => {
                    const cam = all.find(c => c.stream_uuid === uuid);
                    if (!cam) return null;
                    const streamUrl = `${cam.webrtc_server}/stream/${cam.stream_uuid}/channel/1/webrtc?uuid=${cam.stream_uuid}&channel=1`;
                    return {
                        id: cam.stream_uuid as string,
                        cameraId: cam.id as number,
                        label: (cam.modelUz || cam.model || uuid.slice(0, 8)) as string,
                        streamUrl,
                        type: cam.has_ptz ? "ptz" : "oddiy",
                        has_ptz: cam.has_ptz as boolean,
                    } satisfies StreamCell;
                }).filter(Boolean) as StreamCell[];

                if (fetched.length === 4) setCells(fetched);
            })
            .catch(err => console.error("[VideoStream] Camera API xato:", err));
    }, []);

    return cells;
}

// ─── Player ───────────────────────────────────────────────────────────────────

const Player: React.FC<{ cell: StreamCell }> = ({ cell }) => {
    if (!cell.streamUrl) return null;
    return <WebRTCPlayer url={cell.streamUrl} />;
};

// ─── Small Cell ───────────────────────────────────────────────────────────────

const Cell: React.FC<{
    cell: StreamCell;
    isActive: boolean;
    onClick: () => void;
    gridArea: string;
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
        <WebRTCPlayer url={cell.streamUrl!} />
        {!cell.streamUrl && (
            <div style={noStream}>
                <TvIcon size={13} />
            </div>
        )}

        <span style={badgeStyle}>{cell.label}</span>
        {/* PTZ belgisi */}
        {cell.has_ptz && (
            <span style={{
                position: "absolute", top: 4, right: 5,
                background: "rgba(14,168,199,0.25)", color: "var(--gc-title)",
                fontSize: 9, padding: "2px 5px", borderRadius: 3,
                zIndex: 2, fontWeight: 700, letterSpacing: "0.5px",
                border: "1px solid rgba(14,168,199,0.4)"
            }}>PTZ</span>
        )}
        {isActive && <span style={activeMark}>▶</span>}
    </div>
);

// ─── StreamGrid ───────────────────────────────────────────────────────────────

const StreamGrid: React.FC<StreamGridProps> = ({ gap = 3 }) => {
    const cells = useCameras();
    const [t1, t2, t3, t4] = cells;

    const [focusedId, setFocusedId] = useState<string>(cells[0]?.id ?? "");
    const [selectedCell, setSelectedCell] = useState<StreamCell | null>(null);

    // cells yangilanganda focusedId ni birinchi kamera bilan yangilash
    useEffect(() => {
        if (cells.length > 0 && !focusedId) {
            setFocusedId(cells[0].id);
        }
    }, [cells]);

    const click = (cell: StreamCell) => {
        setFocusedId(cell.id);
        setSelectedCell(cell);
    };

    if (!t1 || !t2 || !t3 || !t4) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#555", fontSize: 12 }}>
                Kameralar yuklanmoqda...
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden" }}>
            {/* ── 2×2 Grid ──────────────────────────────────────────────────────── */}
            <div
                style={{
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gridTemplateRows: "repeat(3, 1fr)",
                    gap,
                    background: "#0a0a0a",
                    padding: gap,
                    boxSizing: "border-box",
                    minHeight: 0,
                }}
            >
                <Cell cell={t1} isActive={focusedId === t1.id} onClick={() => click(t1)} gridArea="1 / 1" />
                <Cell cell={t2} isActive={focusedId === t2.id} onClick={() => click(t2)} gridArea="1 / 2" />
                <Cell cell={t3} isActive={focusedId === t3.id} onClick={() => click(t3)} gridArea="2 / 1" />
                <Cell cell={t4} isActive={focusedId === t4.id} onClick={() => click(t4)} gridArea="2 / 2" />
                <Cell cell={t1} isActive={focusedId === t1.id} onClick={() => click(t1)} gridArea="3 / 1" />
                <Cell cell={t2} isActive={focusedId === t2.id} onClick={() => click(t2)} gridArea="3 / 2" />
            </div>

            {/* ── Events Section ────────────────────────────────────────────────── */}
            <div style={{
                height: "120px",
                background: "var(--gc-panel-bg)",
                borderTop: "1px solid rgba(14,168,199,0.2)",
                padding: "8px 12px",
                overflowY: "auto",
                color: "#ccc",
                fontSize: "11px",
                flexShrink: 0,
            }}>
                <div style={{ fontWeight: "bold", marginBottom: "6px", color: "var(--gc-title)", display: "flex", justifyContent: "space-between", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    <span>So'nggi hodisalar (Events)</span>
                    <span style={{ fontSize: "10px", opacity: 0.7 }}>JAMI: 4</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {[
                        { time: "19:45:12", type: "Motion",  camera: "Navoi 1",       desc: "Harakat aniqlandi" },
                        { time: "19:42:05", type: "System",  camera: "Angren PTZ",    desc: "Kamera ulandi" },
                        { time: "19:40:55", type: "PTZ",     camera: "Angren PTZ",    desc: "Pozitsiya o'zgardi" },
                        { time: "19:38:20", type: "Storage", camera: "Navoi 2",       desc: "Arxiv yozilmoqda" },
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
                    background: "rgba(0,0,0,0.9)",
                    display: "flex",
                    zIndex: 100000000000,

                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px",
                }}>
                    <div style={{
                        position: "relative",
                        width: "90%",
                        height: "95%",
                        background: "#000",
                        borderRadius: "8px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid #333",
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: "10px 20px",
                            background: "#1a1a1a",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom: "1px solid #333",
                            flexShrink: 0,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={{ color: "#fff", fontWeight: 500 }}>{selectedCell.label}</span>
                                {selectedCell.has_ptz && (
                                    <span style={{ fontSize: 10, color: "var(--gc-title)", background: "rgba(14,168,199,0.15)", padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(14,168,199,0.4)", fontWeight: 700 }}>
                                        PTZ
                                    </span>
                                )}
                                <span style={{ fontSize: 10, color: "#555" }}>
                                    ID: {selectedCell.cameraId}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedCell(null)}
                                style={{ background: "transparent", border: "none", color: "#fff", fontSize: "24px", cursor: "pointer", lineHeight: "1" }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ flex: 1, position: "relative", display: "flex", overflow: "hidden" }}>
                            {/* Video */}
                            <div style={{ flex: 1, background: "#000" }}>
                                <WebRTCPlayer url={selectedCell.streamUrl!} />
                            </div>

                            {/* PTZ Controls Side Panel — faqat has_ptz=true kameralarda */}
                            {selectedCell.has_ptz && (
                                <div style={{
                                    width: "260px",
                                    background: "#1a1a1a",
                                    borderLeft: "1px solid #333",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    overflowY: "auto",
                                    flexShrink: 0,
                                }}>
                                    <PTZControls
                                        camera={selectedCell}
                                        onSendCommand={(cmd: any) => {
                                            console.log("[PTZ] Buyruq:", cmd);
                                        }}
                                    />
                                    <div style={{ marginTop: "auto", padding: "10px", fontSize: "10px", color: "#555", textAlign: "center" }}>
                                        Camera ID: {selectedCell.cameraId} · UUID: {selectedCell.id.slice(0, 8)}...
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const badgeStyle: React.CSSProperties = {
    position: "absolute", top: 4, left: 5,
    background: "rgba(0,0,0,0.7)", color: "#999",
    fontSize: 12, padding: "3px 5px 4px 5px", borderRadius: 3,
    zIndex: 2, whiteSpace: "nowrap", pointerEvents: "none",
};

const activeMark: React.CSSProperties = {
    position: "absolute", bottom: 4, right: 5,
    color: "#4af", fontSize: 8, zIndex: 2, pointerEvents: "none",
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
