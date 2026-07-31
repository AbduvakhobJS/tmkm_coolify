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

interface NavItem {
    id: string;
    icon: IconType;
    /** har bir element — alohida qator */
    label: string[];
}

const leftItems: NavItem[] = [
    { id: 'main', icon: TbHome, label: ['ГЛАВНЫЙ ЭКРАН'] },
    { id: 'production', icon: TbBuildingFactory2, label: ['ПРОИЗВОДСТВА'] },
    { id: 'finance', icon: TbChartBar, label: ['ФИНАНСЫ'] },
    { id: 'transport', icon: TbTruck, label: ['ТРАНСПОРТ'] },
    { id: 'asodu', icon: TbSitemap, label: ['АСОДУ'] },
];

const rightItems: NavItem[] = [
    { id: 'ecology', icon: TbLeaf, label: ['ЭКОЛОГИЯ'] },
    { id: 'safety', icon: TbShieldCheck, label: ['ТЕХНИКА', 'БЕЗОПАСНОСТИ'] },
    { id: 'marketing', icon: TbSpeakerphone, label: ['МАРКЕТИНГ'] },
    { id: 'video', icon: TbCamera, label: ['ВИДЕОАНАЛИТИКА'] },
    { id: 'geology', icon: TbMountain, label: ['ГЕОЛОГИЯ', 'И РАЗВЕДКА'] },
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

    const handleClick = (id: string) => {
        setActive(id);
        onSelect?.(id);
    };
    const { time, date } = useClock();

    const renderBtn = (item: NavItem) => {
        const Icon = item.icon;
        return (
            <button
                key={item.id}
                type="button"
                className={`nnav-btn${active === item.id ? ' active' : ''}`}
                onClick={() => handleClick(item.id)}
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
                    <h1>СИТУАЦИОННЫЙ ЦЕНТР ТМК</h1>
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
