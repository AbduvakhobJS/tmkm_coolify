import React, { useEffect, useRef, useState } from "react";
import "./TopCenterNew.css";

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

export interface TopCenterItem {
    title: string;
    /** "A • B • C" ko'rinishida yoki to'g'ridan-to'g'ri massiv: ["A","B","C"] */
    description?: string | string[];
    icon: string;
}

export interface TopCenterNewProps {
    items?: TopCenterItem[];
    /** To'liq ekran fon rasmi. Masalan: bigItem.png */
    backgroundImage?: string;
    /** Har bir kartochkaning orqa foni (title+description shu rasm ustida turadi) */
    pedestalImage?: string;
}

const defaultItems: TopCenterItem[] = [
    { title: "Konlar", description: "Geologiya • Qazib olish • Transport", icon: "/imgs/icon.png" },
    { title: "Zavodlar", description: "Boyitish • Eritish • Ishlab chiqarish", icon: "/imgs/icon.png" },
    { title: "Ta'minot", description: "Xomashyo • Ombor • Xarid", icon: "/imgs/icon.png" },
    { title: "Logistika", description: "Temir yo'l logistikasi • Avtotransport • Omborlar • Yetkazib berish", icon: "/imgs/icon.png" },
    { title: "Energiya", description: "Elektr • Gaz • Issiqlik", icon: "/imgs/icon.png" },
    { title: "Ekologiya", description: "Havo • Suv • Chiqindilar", icon: "/imgs/icon.png" },
    { title: "Biznes", description: "Moliya • HR • Analitika", icon: "/imgs/icon.png" },
];

export default function TopCenterNew({
                                         items = defaultItems,
                                         backgroundImage = "/imgs/bigItem.png",
                                         pedestalImage = "/imgs/item2.png",
                                     }: TopCenterNewProps) {
    // Endi window emas, o'zining ota-elementi (bu div qo'yilgan joy)
    // o'lchamini kuzatamiz — shuning uchun component butun oynani emas,
    // faqat o'zi joylashgan konteynerni to'ldiradi.
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [scaleX, setScaleX] = useState<number>(1);
    const [scaleY, setScaleY] = useState<number>(1);

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;

        const calcScale = () => {
            const { width, height } = el.getBoundingClientRect();
            if (width > 0 && height > 0) {
                setScaleX(width / DESIGN_WIDTH);
                setScaleY(height / DESIGN_HEIGHT);
            }
        };

        calcScale();

        const observer = new ResizeObserver(calcScale);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="tcn-viewport" ref={wrapperRef}>
            <div
                className="tcn-canvas"
                style={{
                    transform: `translate(-50%, -50%) scale(${scaleX}, ${scaleY})`,
                }}
            >
                <img className="tcn-bg" src={backgroundImage} alt="" />

                <div className="tcn-row">
                    {items.map((item, i) => {
                        const bullets = Array.isArray(item.description)
                            ? item.description
                            : (item.description ?? "")
                                .split("•")
                                .map((s) => s.trim())
                                .filter(Boolean);

                        return (
                            <div className="tcn-item" key={item.title ?? i}>
                                {/* Ikonka — kartochkaning tepasida, undan tashqarida */}
                                <img
                                    className="tcn-icon"
                                    src={item.icon}
                                    alt={item.title}
                                    draggable={false}
                                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                        e.currentTarget.style.visibility = "hidden";
                                    }}
                                />

                                {/* Kartochka: fon rasmi item2.png, ustida title + description.
                                    Barcha kartochkalar BIR XIL o'lchamda (.tcn-card CSS'da
                                    fixed width/height) — item2.png shu qutiga "contain" bilan
                                    joylashadi, hech qachon cho'zilmaydi/kesilmaydi. */}
                                <div className="tcn-card">
                                    <img
                                        className="tcn-card-bg"
                                        src={pedestalImage}
                                        alt=""
                                        draggable={false}
                                    />
                                    <div className="tcn-card-content">
                                        <div className="tcn-title">{item.title}</div>
                                        {bullets.length > 0 && (
                                            <ul className="tcn-desc">
                                                {bullets.map((line, idx) => (
                                                    <li key={idx}>{line}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>



                <div className="tcn-row-2">
                    {items.map((item, i) => {
                        const bullets = Array.isArray(item.description)
                            ? item.description
                            : (item.description ?? "")
                                .split("•")
                                .map((s) => s.trim())
                                .filter(Boolean);

                        return (
                            <div className="tcn-item" key={item.title ?? i}>
                                {/* Ikonka — kartochkaning tepasida, undan tashqarida */}
                                <img
                                    className="tcn-icon"
                                    src={item.icon}
                                    alt={item.title}
                                    draggable={false}
                                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                        e.currentTarget.style.visibility = "hidden";
                                    }}
                                />

                                {/* Kartochka: fon rasmi item2.png, ustida title + description.
                                    Barcha kartochkalar BIR XIL o'lchamda (.tcn-card CSS'da
                                    fixed width/height) — item2.png shu qutiga "contain" bilan
                                    joylashadi, hech qachon cho'zilmaydi/kesilmaydi. */}
                                <div className="tcn-card">
                                    <img
                                        className="tcn-card-bg"
                                        src={pedestalImage}
                                        alt=""
                                        draggable={false}
                                    />
                                    <div className="tcn-card-content">
                                        <div className="tcn-title">{item.title}</div>
                                        {bullets.length > 0 && (
                                            <ul className="tcn-desc">
                                                {bullets.map((line, idx) => (
                                                    <li key={idx}>{line}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>



            </div>
        </div>
    );
}