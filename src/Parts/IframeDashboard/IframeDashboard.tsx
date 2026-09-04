import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import NavbarOverlay from '../../components/NavbarOverlay';
import { ALL_FRAME_KEYS, getNavIdForFrameKey } from '../../components/NewNavbar';
import './IframeDashboard.css';

/**
 * "BOSH SAHIFA"dan boshqa BARCHA navbar menyulari shu BITTA komponentga
 * tushadi (`/main/iframe/:key`) — sahifaning o'zi almashmaydi, faqat tashqi
 * dashboard manzilining `#<key>` qismi o'zgaradi:
 *
 *   ISHLAB CHIQARISH bosilsa → .../?from=...&to=...#obzor
 *   SGP bosilsa              → .../?from=...&to=...#sgp
 *   ...va h.k. (to'liq ro'yxat — `NewNavbar.tsx` dagi `frameKey`lar)
 *
 * Manzil `NewNavbar.tsx` dagi navigatsiya bilan BIR JOYDA e'lon qilingan
 * (`FRAME_ROUTE`, `getNavIdForFrameKey`, `ALL_FRAME_KEYS`) — shu sabab yangi
 * menyu qo'shilganda faqat o'sha faylni o'zgartirish kifoya, bu yerga
 * tegilmaydi.
 */

/** Ishlab chiqaruvchi/host o'zgarsa — shu yerda yoki `.env` orqali almashtiriladi. */
const MONITOR_BASE = process.env.REACT_APP_MONITOR_BASE ?? 'https://tmk.bgs.uz/excel';

const pad2 = (n: number) => String(n).padStart(2, '0');
const isoDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/** Joriy oyning 1-kunidan bugungi kungacha — misoldagi `from`/`to` bilan bir xil shaklda, lekin qotib qolmaydi. */
const defaultRange = () => {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: isoDate(from), to: isoDate(today) };
};

const IframeDashboard: React.FC = () => {
    const { key = '' } = useParams<{ key: string }>();
    /* Menyular orasida almashish faqat `src`ning hash qismini o'zgartiradi —
       bu sahifani qayta yuklamaydi, shuning uchun `iframe.onLoad` faqat
       BIRINCHI marta ishga tushadi va `loaded` shu yerdan keyin true bo'lib
       qoladi (komponent o'zi qayta mount bo'lmaydi, chunki route bitta). */
    const [loaded, setLoaded] = useState(false);

    const isValidKey = ALL_FRAME_KEYS.includes(key);
    const activeNavId = getNavIdForFrameKey(key);
    const { from, to } = useMemo(defaultRange, []);

    const src = useMemo(
        () => `${MONITOR_BASE}/?from=${from}&to=${to}#${key}`,
        [from, to, key],
    );

    return (
        <NavbarOverlay defaultActive={activeNavId}>
            <div className="ifd-root">
                {!isValidKey ? (
                    <div className="ifd-empty">
                        <div className="ifd-empty-title">Bo'lim topilmadi</div>
                        <div className="ifd-empty-text">
                            "{key}" — navbar menyulariga mos kelmaydigan manzil. Yuqoridagi menyudan birini tanlang.
                        </div>
                    </div>
                ) : (
                    <>
                        {!loaded && (
                            <div className="ifd-loading">
                                <span className="ifd-spinner" />
                                <span className="ifd-loading-text">Yuklanmoqda…</span>
                            </div>
                        )}
                        <iframe
                            title={`monitor-${key}`}
                            src={src}
                            className="ifd-frame"
                            onLoad={() => setLoaded(true)}
                            allow="fullscreen"
                        />
                    </>
                )}
            </div>
        </NavbarOverlay>
    );
};

export default IframeDashboard;
