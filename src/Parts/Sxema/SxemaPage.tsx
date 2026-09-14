import React, { useEffect, useRef, useState } from "react";
import { FiCamera, FiMaximize2, FiMinimize2, FiRotateCw, FiTarget, FiZap } from "react-icons/fi";
import { SxemaViewer } from "./index";
import { createDemoFeed } from "./sxema.demo";
import type { SxemaData, SxemaSelection, SxemaViewerHandle } from "./sxema.types";
import "./sxema.css";

const KIND_LABEL: Record<SxemaSelection["kind"], string> = {
    vessel: "Idish",
    column: "Filtr kolonnasi",
    pump: "Nasos",
    valve: "Ventil",
    meter: "Oqim o'lchagich",
    pipe: "Quvur",
    other: "Obyekt",
};

interface SxemaPageProps {
    /**
     * Render as a block that fills its parent (a card inside SexDetailModal)
     * instead of assuming it already owns the whole viewport — adds a
     * fullscreen toggle so the small card can still expand for a real look,
     * mirroring FactoryModel's own embedded/fullscreen pattern.
     */
    embedded?: boolean;
}

/**
 * Kimyoviy jarayon sxemasining 3D ko'rinishi — mustaqil SxemaViewer
 * komponentini shu ilova ichiga ulaydi.
 * Hozircha real SCADA ulanmagani uchun createDemoFeed bilan 2 soniyada bir
 * yangilanadigan soxta oqim beriladi — kelajakda shu joyga WebSocket/polling
 * qo'yiladi, komponentning o'zi o'zgarmaydi.
 */
const SxemaPage: React.FC<SxemaPageProps> = ({ embedded = false }) => {
    const viewer = useRef<SxemaViewerHandle>(null);
    const [data, setData] = useState<SxemaData>();
    const [selected, setSelected] = useState<SxemaSelection | null>(null);
    const [progress, setProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [flowOn, setFlowOn] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Embedded (a small card inside SexDetailModal) starts collapsed — full
    // topbar/hint chrome doesn't fit that space, so only the fullscreen
    // toggle shows until it's actually expanded.
    const [isFullscreen, setIsFullscreen] = useState(false);
    const showFullChrome = !embedded || isFullscreen;

    useEffect(() => createDemoFeed(setData, 2000), []);

    return (
        <div
            className={`sxm-root${embedded ? " sxm-root--embedded" : ""}${
                isFullscreen ? " sxm-root--fullscreen" : ""
            }`}
        >
            {embedded && (
                <button
                    type="button"
                    className="sxm-fullscreen-toggle"
                    onClick={() => setIsFullscreen((v) => !v)}
                    aria-label={isFullscreen ? "Kichraytirish" : "To'liq ekran"}
                    title={isFullscreen ? "Kichraytirish" : "To'liq ekran"}
                >
                    {isFullscreen ? <FiMinimize2 size={13} /> : <FiMaximize2 size={13} />}
                </button>
            )}

            {showFullChrome && (
                <div className="sxm-topbar">
                    <div className="sxm-topbar__title">Jarayon sxemasi</div>
                    <div className="sxm-topbar__views">
                        <button type="button" onClick={() => viewer.current?.setView("reference")}>
                            <FiCamera size={13} /> Asosiy
                        </button>
                        <button type="button" onClick={() => viewer.current?.setView("top")}>
                            <FiTarget size={13} /> Tepadan
                        </button>
                        <button type="button" onClick={() => viewer.current?.setView("iso")}>
                            <FiRotateCw size={13} /> Yaqindan
                        </button>
                        <button
                            type="button"
                            className={flowOn ? "sxm-topbar__flow--on" : ""}
                            onClick={() => setFlowOn((v) => !v)}
                        >
                            <FiZap size={13} /> Oqim {flowOn ? "yoniq" : "o'chiq"}
                        </button>
                    </div>
                </div>
            )}

            <SxemaViewer
                ref={viewer}
                modelUrl="/models/sxema_draco.glb"
                dracoDecoderPath="/draco/"
                data={data}
                flow={flowOn}
                background="#050b1a"
                onSelect={setSelected}
                onProgress={setProgress}
                onLoad={() => setLoaded(true)}
                onError={(e) => {
                    console.error("[Sxema] model yuklanmadi", e);
                    setError("Model yuklanmadi. Sahifani qayta yuklab ko'ring.");
                }}
            />

            {!loaded && !error && (
                <div className="sxm-loader">
                    <div className="sxm-loader__ring" />
                    <div className="sxm-loader__bar">
                        <div className="sxm-loader__bar-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
                    </div>
                    <div className="sxm-loader__text">Sxema yuklanmoqda · {Math.round(progress * 100)}%</div>
                </div>
            )}

            {error && <div className="sxm-error">{error}</div>}

            {selected && (
                <div
                    className="sxm-tooltip"
                    style={{ left: selected.screen.x + 18, top: selected.screen.y + 18 }}
                >
                    <div className="sxm-tooltip__head">
                        <span className="sxm-tooltip__id">{selected.id}</span>
                        <span className="sxm-tooltip__kind">{KIND_LABEL[selected.kind]}</span>
                    </div>
                    {selected.state && "level" in selected.state && (
                        <div className="sxm-tooltip__row">
                            <span>Sath</span>
                            <b>{Math.round(selected.state.level * 100)}%</b>
                        </div>
                    )}
                    {selected.state && "temperature" in selected.state && selected.state.temperature != null && (
                        <div className="sxm-tooltip__row">
                            <span>Harorat</span>
                            <b>{selected.state.temperature}°C</b>
                        </div>
                    )}
                    {selected.state && "product" in selected.state && selected.state.product && (
                        <div className="sxm-tooltip__row">
                            <span>Mahsulot</span>
                            <b>{selected.state.product}</b>
                        </div>
                    )}
                    {selected.state && "running" in selected.state && (
                        <div className="sxm-tooltip__row">
                            <span>Holati</span>
                            <b className={selected.state.running ? "sxm-good" : "sxm-muted"}>
                                {selected.state.running ? "Ishlayapti" : "To'xtagan"}
                            </b>
                        </div>
                    )}
                    {selected.state && "flow" in selected.state && selected.state.flow != null && (
                        <div className="sxm-tooltip__row">
                            <span>Debit</span>
                            <b>{selected.state.flow} m³/soat</b>
                        </div>
                    )}
                    {selected.state && "open" in selected.state && (
                        <div className="sxm-tooltip__row">
                            <span>Holati</span>
                            <b className={selected.state.open ? "sxm-good" : "sxm-muted"}>
                                {selected.state.open ? "Ochiq" : "Yopiq"}
                            </b>
                        </div>
                    )}
                    {selected.state && "value" in selected.state && (
                        <div className="sxm-tooltip__row">
                            <span>Ko'rsatkich</span>
                            <b>
                                {selected.state.value} {selected.state.unit ?? ""}
                            </b>
                        </div>
                    )}
                    {selected.state && "active" in selected.state && (
                        <div className="sxm-tooltip__row">
                            <span>Oqim</span>
                            <b className={selected.state.active ? "sxm-good" : "sxm-muted"}>
                                {selected.state.active ? "Bor" : "Yo'q"}
                            </b>
                        </div>
                    )}
                </div>
            )}

            {showFullChrome && (
                <div className="sxm-hint">
                    <span>Sichqoncha — burish / zoom</span>
                    <span>Bosish — obyekt haqida ma'lumot</span>
                </div>
            )}
        </div>
    );
};

export default SxemaPage;
