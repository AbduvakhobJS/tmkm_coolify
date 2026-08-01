import React, { useState } from 'react';
import type { IconType } from 'react-icons';
import {
    TbHome,
    TbBuildingFactory2,
    TbChartBar,
    TbTruck,
    TbSitemap,
    TbLeaf,
    TbShieldCheck,
    TbSpeakerphone,
    TbCamera,
    TbMountain,
} from 'react-icons/tb';
import './NewNavbar.css';
import {useClock} from "../hooks/useClock";
import {useNavigate} from "react-router-dom";

interface NavItem {
    id: string;
    icon: IconType;
    /** har bir element — alohida qator */
    label: string[];
    url: string ;
}
const leftItems: NavItem[] = [
    { id: 'main', icon: TbHome, label: ['BOSH SAHIFA'], url: "/main/full" },
    { id: 'production', icon: TbBuildingFactory2, label: ['ISHLAB CHIQARISH'], url: "/main/grr" },
    { id: 'finance', icon: TbChartBar, label: ['MOLIYA'], url: "/main/finance-new" },
    { id: 'transport', icon: TbTruck, label: ['TRANSPORT'], url: "/main/grr" },
    { id: 'asodu', icon: TbSitemap, label: ['ASODU'], url: "/main/9" },
];

const rightItems: NavItem[] = [
    { id: 'ecology', icon: TbLeaf, label: ['EKOLOGIYA'], url: "/main/esg" },
    { id: 'safety', icon: TbShieldCheck, label: ['MEHNAT', 'XAVFSIZLIGI'], url: "/main/hse-big" },
    { id: 'marketing', icon: TbSpeakerphone, label: ['MARKETING'], url: "/main/marketing" },
    { id: 'video', icon: TbCamera, label: ['VIDEOANALITIKA'], url: "/main/7" },
    { id: 'geology', icon: TbMountain, label: ['GEOLOGIYA', 'VA QIDIRUV'], url: "/main/grr" },
];
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

    const navigate = useNavigate();
    const handleClick = (id: string, url: string) => {
        setActive(id);
        onSelect?.(id);
        navigate(url)
    };
    const { time, date } = useClock();

    const renderBtn = (item: NavItem) => {
        const Icon = item.icon;
        return (
            <button
                key={item.id}
                type="button"
                className={`nnav-btn${active === item.id ? ' active' : ''}`}
                onClick={() => handleClick(item.id, item.url)}
            >
                <Icon className="nnav-ico" />
                <span className="nnav-label">
                    {item.label.map((line, i) => (
                        <span key={i}>{line}</span>
                    ))}
                </span>
            </button>
        );
    };

    return (
        <nav
            className="nnav"
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
