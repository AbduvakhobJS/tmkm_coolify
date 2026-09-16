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
    { id: 'production', icon: TbBuildingFactory2, label: ['MOLIYA'], url: "/main/finance-new-main" },
    { id: 'finance', icon: TbChartBar, label: ['INVESTITSIYALAR'], url: "/main/investing" },
    { id: 'transport', icon: TbTruck, label: ['TRANSPORT'], url: "/main/logistics" },
    { id: 'rasxod', icon: TbSitemap, label: ['XARAJAT'], url: "/main/single-treasury" },
];

const rightItems: NavItem[] = [
    { id: 'ecology', icon: TbLeaf, label: ['EKOLOGIYA'], url: "/main/esg-detail" },
    { id: 'safety', icon: TbShieldCheck, label: ['MEHNAT', 'XAVFSIZLIGI'], url: "/main/hse-big" },
    { id: 'marketing', icon: TbSpeakerphone, label: ['MARKETING'], url: "/main/marketing-detail" },
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
                <div className="nnav-center" style={{display: "flex", flexDirection: "row", alignItems: "center"}}>
                    {/* Ichki qator KONTENT bo'yicha o'lchanadi: `.nnav-center` butun
                        navbar balandligini egallagani uchun logotipga to'g'ridan-to'g'ri
                        `height:100%` berilsa, u haddan tashqari kattalashib ketardi.
                        Endi qator balandligini o'ngdagi matn bloki belgilaydi, logotip
                        esa `align-self: stretch` bilan aynan shunga tenglashadi. */}
                    <div style={{display: "flex", flexDirection: "row", alignItems: "stretch", gap: 16}}>
                        {/* `minHeight: 0` SHART: flex elementining standart
                            `min-height: auto` qiymati rasmning tabiiy balandligini
                            qatorga "surib" kiritib, uni matndan balandroq qilib
                            yuborardi. `padding: 12px 0` — tepa-pastdan 12px siqilish. */}
                        <div style={{
                            alignSelf: "stretch", minHeight: 0, overflow: "hidden",
                            display: "flex", alignItems: "center",
                            padding: "12px 0", boxSizing: "border-box",
                        }}>
                            <img
                                src="/imgs/logouz2.svg"
                                alt=""
                                style={{height: "50px",marginLeft: "-6px", width: "auto", minHeight: 0, objectFit: "contain", display: "block"}}
                            />
                        </div>
                        <div style={{display: "flex", alignItems: "center", marginLeft: "10px"}}>
                           <div>
                               {/*<h1 style={{marginLeft: 10}}>SITUATSION MARKAZI</h1>*/}
                               <div className="top-right">
                                   <div className="clock-block" style={{display: "flex"}}>
                                       <div className="live-time">{date}</div>
                                       <div className="live-time" style={{marginLeft: "30px", width: 110}}>{time}</div>
                                   </div>
                                   {/*<div className="status-pill pulse-green">● SYSTEM LIVE</div>*/}
                               </div>
                           </div>
                        </div>
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
