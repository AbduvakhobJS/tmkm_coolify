import React, { useEffect, useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import {
    TbHome,
    TbBuildingFactory2,
    TbBuildingWarehouse,
    TbBolt,
    TbTruck,
    TbBuilding,
    TbListDetails,
    TbChartBar,
    TbBriefcase,
    TbUsers,
    TbChevronDown,
} from 'react-icons/tb';
import './NewNavbar.css';
import {useClock} from "../hooks/useClock";
import {useNavigate} from "react-router-dom";

interface NavChild {
    id: string;
    label: string;
    /** `/main/iframe/<frameKey>` ga o'tadi — tashqi dashboard shu kalitni URL hash'i sifatida oladi. */
    frameKey: string;
}

interface NavItem {
    id: string;
    icon: IconType;
    /** har bir element — alohida qator */
    label: string[];
    /** Ichki route (masalan Bosh sahifa) — berilsa `frameKey`dan ustun turadi */
    url?: string;
    /** Berilsa, tugma `/main/iframe/<frameKey>` ga o'tadi (umumiy iframe sahifasi) */
    frameKey?: string;
    /** Berilsa, tugma navigatsiya qilmaydi — submenuni ochadi/yopadi */
    children?: NavChild[];
}

/** Umumiy iframe sahifasining yo'li — tashqi dashboard manzilining `#<frameKey>` qismini boshqaradi. */
export const FRAME_ROUTE = (frameKey: string): string => `/main/iframe/${frameKey}`;

const leftItems: NavItem[] = [
    { id: 'main', icon: TbHome, label: ['BOSH SAHIFA'], url: "/main/full" },
    {
        id: 'production', icon: TbBuildingFactory2, label: ['ISHLAB CHIQARISH'],
        children: [
            { id: 'production-prod', label: 'Ishlab chiqarish', frameKey: "prod" },
            { id: 'production-obzor', label: "Umumiy ko'rsatkichlar", frameKey: "obzor" },
        ],
    },
    { id: 'sgp', icon: TbBuildingWarehouse, label: ['SOTISH VA', 'QOLDIQLAR (SGP)'], frameKey: "sgp" },
    {
        id: 'resource', icon: TbBolt, label: ['RESURS SARFI'],
        children: [
            { id: 'resource-energy', label: 'Elektr energiya', frameKey: "energy" },
            { id: 'resource-h2', label: 'Vodorod va gaz', frameKey: "h2" },
        ],
    },
    { id: 'cist', icon: TbTruck, label: ['SISTERNA VA', 'YUKLAR'], frameKey: "cist" },
];

const rightItems: NavItem[] = [
    { id: 'ogarok', icon: TbBuilding, label: ['OGAROK'], frameKey: "ogarok" },
    { id: 'ing', icon: TbListDetails, label: ['INGICHKA IOF'], frameKey: "ing" },
    { id: 'fin', icon: TbChartBar, label: ['MOLIYAVIY', "KO'RSATKICHLAR"], frameKey: "fin" },
    {
        id: 'invest', icon: TbBriefcase, label: ['INVESTITSION', 'LOYIHALAR'],
        children: [
            { id: 'invest-projects', label: 'Investitsiya loyihalari', frameKey: "invest" },
            { id: 'invest-passport', label: 'Loyihalar pasporti', frameKey: "projects" },
        ],
    },
    { id: 'mobplan', icon: TbUsers, label: ['KADRLAR REJASI'], frameKey: "mobplan" },
];

/** `/main/iframe/:key` sahifasi shu orqali qaysi menyu/submenu faol ekanini bilib oladi. */
export const getNavIdForFrameKey = (frameKey: string | undefined): string => {
    if (!frameKey) return 'main';
    for (const item of [...leftItems, ...rightItems]) {
        if (item.children) {
            const child = item.children.find((c) => c.frameKey === frameKey);
            if (child) return child.id;
        } else if (item.frameKey === frameKey) {
            return item.id;
        }
    }
    return 'main';
};

/** To'g'ridan-to'g'ri havoladan kirilganda `:key` haqiqiy menyuga tegishli ekanini tekshirish uchun. */
export const ALL_FRAME_KEYS: string[] = [...leftItems, ...rightItems].flatMap((item) =>
    item.children ? item.children.map((c) => c.frameKey) : item.frameKey ? [item.frameKey] : []
);

interface NewNavbarProps {
    defaultActive?: string;
    onSelect?: (id: string) => void;
    /** fon ramka rasmi (public papkadan) */
    backgroundImage?: string;
}

const NewNavbar: React.FC<NewNavbarProps> = ({
    defaultActive = 'main',
    onSelect,
    backgroundImage = '/imgs/navbar-frame.png',
}) => {
    const [active, setActive] = useState(defaultActive);
    const [openId, setOpenId] = useState<string | null>(null);
    const navRef = useRef<HTMLElement>(null);

    const navigate = useNavigate();
    const handleClick = (id: string, url: string) => {
        setActive(id);
        setOpenId(null);
        onSelect?.(id);
        navigate(url)
    };
    const { time, date } = useClock();

    /* `defaultActive` prop o'zgarsa (masalan iframe sahifasida route parametri
       almashsa-yu komponent qayta render bo'lsa) — ichki holat ham moslashadi. */
    useEffect(() => {
        setActive(defaultActive);
    }, [defaultActive]);

    /* Submenu tashqarisiga bosilsa yopiladi */
    useEffect(() => {
        if (!openId) return;
        const onDocClick = (e: MouseEvent) => {
            if (navRef.current && !navRef.current.contains(e.target as Node)) {
                setOpenId(null);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [openId]);

    const renderBtn = (item: NavItem) => {
        const Icon = item.icon;
        const hasChildren = !!item.children?.length;
        const isChildActive = item.children?.some((c) => c.id === active) ?? false;
        const isOpen = openId === item.id;
        const targetUrl = item.url ?? (item.frameKey ? FRAME_ROUTE(item.frameKey) : undefined);

        return (
            <div key={item.id} className="nnav-item" onMouseEnter={() => hasChildren && setOpenId(item.id)} onMouseLeave={() => hasChildren && setOpenId(null)}>
                <button
                    type="button"
                    className={`nnav-btn${active === item.id || isChildActive ? ' active' : ''}${hasChildren ? ' has-children' : ''}`}
                    onClick={() => hasChildren ? setOpenId(isOpen ? null : item.id) : handleClick(item.id, targetUrl!)}
                >
                    <Icon className="nnav-ico" />
                    <span className="nnav-label">
                        {item.label.map((line, i) => (
                            <span key={i}>{line}</span>
                        ))}
                    </span>
                    {hasChildren && <TbChevronDown className={`nnav-chevron${isOpen ? ' open' : ''}`} />}
                </button>

                {hasChildren && (
                    /* Tashqi qatlam tugma bilan panel orasidagi bo'shliqni ham
                       o'zining hoverlanadigan qutisiga kiritadi — aks holda
                       sichqoncha o'sha bo'shliqdan o'tayotganda hech qanday
                       elementning ustida bo'lmay qolib, dropdown erta yopiladi. */
                    <div className={`nnav-dropdown${isOpen ? ' open' : ''}`}>
                        <div className="nnav-dropdown-inner">
                            {item.children!.map((child) => (
                                <button
                                    key={child.id}
                                    type="button"
                                    className={`nnav-dropdown-item${active === child.id ? ' active' : ''}`}
                                    onClick={() => handleClick(child.id, FRAME_ROUTE(child.frameKey))}
                                >
                                    {child.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <nav
            className="nnav"
            ref={navRef}
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="nnav-main">
                <div className="nnav-group left">
                    {leftItems.map(renderBtn)}
                </div>

                {/* markaz — bo'sh hex qismi (fon rasmda), dinamik cho'ziladi */}
                <div className="nnav-center" >
                    <h1>TMK SITUATSION MARKAZI</h1>
                    <div className="top-right">
                        <div className="clock-block">
                            <div className="live-time">{time}</div>
                            <div className="live-date">{date}</div>
                        </div>
                        <br/>
                        {/*<div className="status-pill pulse-green">● SYSTEM LIVE</div>*/}
                    </div>
                </div>

                <div className="nnav-group right">
                    {rightItems.map(renderBtn)}
                </div>
            </div>
        </nav>
    );
};

export default NewNavbar;
