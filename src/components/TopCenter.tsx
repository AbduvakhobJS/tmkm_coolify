import React, { useState } from 'react';
import TopCenterNew, {TopCenterItem} from "./TopCenterNew";
import Map3D from "../Parts/Map/Map3d";
import { GC } from '../theme/palette';

/* ── TMK Schema data ── */
const stages = [
    { num:1, title:'GEOLOGIK QIDIRUVLAR',       statLabel:'Maydoni',    statVal:'18', statusLabel:'Статус работ',   statusVal:'O`tkazilmoqda', progress:null, img: "/imgs/r6.jpg" },
    { num:2, title:'JOYLASHUVI',          statLabel:'Faol', statVal:'5',  statusLabel:'Статус добычи',  statusVal:'O`tkazilmoqda', progress:null, img: "/imgs/re3.jpg" },
    { num:3, title:'BOYITISH ZAVODI', statLabel:'Zavod',      statVal:'6',  statusLabel:null, statusVal:null, progress:{label:'Yuklanmoqda',         val:88}, img: "/imgs/re0.jpg" },
    { num:4, title:'ZAVODLAR',                 statLabel:'Zavod',     statVal:'3',  statusLabel:null, statusVal:null, progress:{label:'Zavodlarni yuklash',     val:92}, img: "/imgs/r5.jpg" },
    { num:5, title:'TEXNO PARKLARI / KLASTERLARI',  statLabel:'Joylarda',    statVal:'4',  statusLabel:null, statusVal:null, progress:{label:'Yuklanmoqda',    val:92}, img: "/imgs/re1.jpg" },
    { num:6, title:'TAYYOR MAHSULOTLAR',      statLabel:'Korxonalar', statVal:'12', statusLabel:null, statusVal:null, progress:{label:'Yuk tashish',             val:96}, img: "/imgs/re2.jpg" },
];

const flows = [
    {label:'Ruda qazib olingan',      value:'28,6', unit:'ming. t'},
    {label:'Qayta ishlash zavodidagi ruda',       value:'26,4', unit:'ming. t'},
    {label:'W-konsentrat',     value:'145',  unit:'t'},
    {label:'Mo konsentrati',    value:'38',   unit:'t'},
    {label:'Tayyor mahsulotlar',value:'1 245',unit:'t'},
];

const kpis = [
    {label:'WO₃ ni ajratib olish',            value:'82,1', unit:'%'},
    {label:'Mo ni ajratib olish',             value:'85,3', unit:'%'},
    {label:'Konsentrat hosildorligi',         value:'69,0', unit:'%'},
    {label:'Elektr energiyasi iste\'moli',    value:'671',  unit:'kVt·s/t'},
    {label:'1 tonna konsentratning tannarxi', value:'8 420', unit:'$'},
];

const c = { teal:'var(--gc-title)' /* gc-title */, muted:GC.slate, text:GC.blue, bright:'#b4dcff', ok:GC.green, gold:GC.amber, bg:'rgba(0,245,255,0.04)', border:'rgba(14,168,199,0.2)' };


interface WidgetData {
    name: string;
    position: { x: number; y: number };
    image: string;
    side?: 'left' | 'right';
    angle?: number;
    opacity: number;
}


export interface TopCenterNewProps {
    items?: TopCenterItem[];
    /** To'liq ekran fon rasmi. Masalan: bigItem.png */
    backgroundImage?: string;
    /** Har bir item ortidagi shisha pyedestal rasmi (item2.png) */
    pedestalImage?: string;
}

// Namuna array — o'zingiznikini shu strukturada bering: { title, description, icon }
const defaultItems: TopCenterItem[] = [
    { title: "Konlar", description: "Geologiya • Qazib olish • Transport", icon: "/imgs/icon2.png" },
    { title: "Zavodlar", description: "Boyitish • Eritish • Ishlab chiqarish", icon: "/imgs/icon3.png" },
    { title: "Ta'minot", description: "Xomashyo • Ombor • Xarid", icon: "/imgs/icon2.png" },
    { title: "Logistika", description: "Transport • Yetkazish • Monitoring", icon: "/imgs/icon3.png" },
    { title: "Energiya", description: "Elektr • Gaz • Issiqlik", icon: "/imgs/icon2.png" },
    { title: "Ekologiya", description: "Havo • Suv • Chiqindilar", icon: "/imgs/icon3.png" },
    { title: "Biznes", description: "Moliya • HR • Analitika", icon: "/imgs/icon3.png" },
];


const TopCenter = ({
                       highlightIndex,
                       setHighlightIndex,
                   }: {
    highlightIndex: number;
    setHighlightIndex: React.Dispatch<React.SetStateAction<number>>;
}) => {
    const [activeTab, setActiveTab] = useState(4);


    // Har bir qavat uchun widgetlar (piramida ko'rinishida)
    const layers: WidgetData[][] = [
        // Eng yuqori qavat (4-qavat, 3 ta)
        [
            { name: 'Metal', position: { x: 50.5, y: 14 }, image: '', side: 'left', angle: 0, opacity: 1 },
            { name: 'Mining', position: { x: 37, y: 15}, image: '', side: 'left', angle: 24, opacity: 1 },
            { name: 'Marketing', position: { x: 64, y: 15 }, image: '', side: 'right', angle: 24, opacity: 1 },
        ],
        // 3-qavat (5 ta)
        [
            { name: 'Taskazgan grafit', position: { x: 62, y: 40  }, image: '', side: 'right', angle: 5,  opacity: 1 },
            { name: 'TMK Chemicals', position: { x: 38, y: 40 }, image: '', side: 'left', angle: 5, opacity: 1 },
            { name: 'R&D Park', position: { x: 50, y: 46 }, image: '', side: 'right', angle: 0, opacity: 1 }
        ],
        // 2-qavat (7 ta)
        [
            { name: 'Chirchiq', position: { x: 50, y: 64 }, image: '', side: 'right', angle: 0, opacity: 1 },
            { name: 'Ohangaron', position: { x: 39, y: 61 }, image: '', side: 'left', angle: 10, opacity: 1 },
            { name: 'Nurobod', position: { x: 61, y: 61 }, image: '', side: 'right', angle: 10, opacity: 1 },
            // { name: 'Boy Ko\'l', position: { x: 30, y: 57 }, image: '', side: 'left', angle: 20, opacity: 1 },
            // { name: 'Begona Buloq', position: { x: 70, y: 57 }, image: '', side: 'right', angle: 20, opacity: 1 },
        ],
        // 1-qavat (9 ta)
        [
            { name: 'Li klasteri', position: { x: 50, y: 92 }, image: '/imgs/icon1.png', side: 'right', angle: 0, opacity: 1 },
            { name: 'Grafit klasteri', position: { x: 34, y: 88 }, image: '/imgs/icon2.png', side: 'right', angle: 15, opacity: 1 },
            { name: 'Mg klasteri', position: { x: 66, y: 88 }, image: '/imgs/icon4.png', side: 'left', angle: 15, opacity: 1 },
            { name: 'V klasteri', position: { x: 22, y: 80 }, image: '/imgs/icon3.png', side: 'right', angle: 20, opacity: 1 },
            { name: 'Co , Ni, Cr klasteri', position: { x: 78, y: 80 }, image: '/imgs/icon5.png', side: 'left', angle: 20, opacity: 1 },
        ],
        [
            { name: 'Grafit klasteri', position: { x: 50, y: 84 }, image: '', side: 'right', angle: 5, opacity: 0.7 },
            { name: 'Mg klasteri', position: { x: 68, y: 76 }, image: '', side: 'left', angle: 5, opacity: 0.7 },
            { name: 'V klasteri', position: { x: 34, y: 74 }, image: '', side: 'left', angle: 5, opacity: 0.7 },
        ],
    ];

    const items = [
        {x:20,y:270,title:"Konlar"},
        {x:250,y:210,title:"Zavodlar"},
        {x:520,y:170,title:"Logistika"},
        {x:760,y:160,title:"Energiya"},
        {x:1010,y:170,title:"Ekologiya"},
        {x:1270,y:210,title:"Biznes"},
        {x:1490,y:270,title:"Ta'lim"},
    ];
    return (
        <div className="top-center-wrapper">
            <div className="top-center-tabs">
                <button
                    className={`top-center-tab${activeTab === 1 ? ' active' : ''}`}
                    onClick={() => setActiveTab(1)}
                >
                    STRUKTURA 1
                </button>
                <button
                    className={`top-center-tab${activeTab === 2 ? ' active' : ''}`}
                    onClick={() => setActiveTab(2)}
                >
                    STRUKTURA 1
                </button>
                <button
                    className={`top-center-tab${activeTab === 3 ? ' active' : ''}`}
                    onClick={() => setActiveTab(3)}
                >
                    STRUKTURA 3
                </button>
                <button
                    className={`top-center-tab${activeTab === 4 ? ' active' : ''}`}
                    onClick={() => setActiveTab(4)}
                >
                    XARITA
                </button>
                <button
                    className={`top-center-tab${activeTab === 5 ? ' active' : ''}`}
                    onClick={() => setActiveTab(5)}
                >
                    GS 1
                </button>
                <button
                    className={`top-center-tab${activeTab === 6 ? ' active' : ''}`}
                    onClick={() => setActiveTab(6)}
                >
                    GS 2
                </button>
                <button
                    className={`top-center-tab${activeTab === 7 ? ' active' : ''}`}
                    onClick={() => setActiveTab(7)}
                >
                    GS 3
                </button>
                <button
                    className={`top-center-tab${activeTab === 8 ? ' active' : ''}`}
                    onClick={() => setActiveTab(8)}
                >
                    GS 4
                </button>
                <button
                    className={`top-center-tab${activeTab === 9 ? ' active' : ''}`}
                    onClick={() => setActiveTab(9)}
                >
                    GS 5
                </button>
                <button
                    className={`top-center-tab${activeTab === 10 ? ' active' : ''}`}
                    onClick={() => setActiveTab(10)}
                >
                    GS 6
                </button>
                <button
                    className={`top-center-tab${activeTab === 11 ? ' active' : ''}`}
                    onClick={() => setActiveTab(11)}
                >
                    GS 7
                </button>
            </div>

            {activeTab === 1 && (
                <div className="top-center-bg">
                    <div className="logo-title-piro">
                        <img src="/imgs/logo2.png" alt="" />
                    </div>
                    <div className="top-center-content">
                        {layers.flat().map((widget, idx) => {
                            const rotationY = widget.side === 'left' ? -(widget.angle || 0) : (widget.angle || 0);
                            return (
                                <div
                                    key={idx}
                                    className="top-center-widget"
                                    style={{
                                        left: `${widget.position.x}%`,
                                        top: `${widget.position.y}%`,
                                        '--rotY': `${rotationY}deg`,
                                        '--shine-delay': `${(idx % 9) * 0.28}s`,
                                        opacity: widget.opacity
                                    } as React.CSSProperties}
                                >
                                    <div className="widget-inner">
                                        {widget.image ? (
                                            <img className="widget-icon" src={widget.image} alt={widget.name} />
                                        ) : ''}
                                        <span className="widget-text">{widget.name}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 2 && (
                <div className="top-center-second" style={{
                    display:'flex', flexDirection:'column',
                    width:'100%', height:'100%',
                    padding:'7px 8px 7px', boxSizing:'border-box',
                    gap:'5px', overflow:'hidden',
                }}>

                    {/* ══ ЗАГОЛОВОК ══ */}
                    <div style={{
                        flexShrink:0, textAlign:'center',
                        fontSize:'11px', fontWeight:800, letterSpacing:'3px',
                        color:c.bright, textTransform:'uppercase',
                        borderBottom:'1px solid rgba(14,168,199,0.3)',
                        paddingBottom:'5px',
                        textShadow:'0 0 14px rgba(14,168,199,0.6)',
                    }}>
                        TMK ning texnologik sxemasi
                    </div>

                    {/* ══ 6 КАРТОЧЕК ЭТАПОВ ══ */}
                    <div style={{flex:1, minHeight:0, display:'flex', gap:'4px', alignItems:'stretch'}}>
                        {stages.map((st, i) => (
                            <React.Fragment key={st.num}>
                                <div style={{
                                    flex:1, minWidth:0,
                                    display:'flex', flexDirection:'column',
                                    background:'linear-gradient(170deg, rgba(6,22,55,0.95) 0%, rgba(2,12,32,0.98) 100%)',
                                    border:'1px solid rgba(14,168,199,0.45)',
                                    borderRadius:'7px',
                                    overflow:'hidden',
                                    boxShadow:'0 0 12px rgba(14,168,199,0.08), inset 0 1px 0 rgba(14,168,199,0.1)',
                                }}>
                                    {/* Шапка карточки */}
                                    <div style={{
                                        flexShrink:0,
                                        background:'rgba(14,168,199,0.1)',
                                        borderBottom:'1px solid rgba(14,168,199,0.25)',
                                        padding:'5px 6px 4px',
                                        display:'flex', alignItems:'flex-start', gap:'5px',
                                    }}>
                                        <span style={{
                                            flexShrink:0,
                                            background:'rgba(14,168,199,0.25)',
                                            border:'1px solid rgba(14,168,199,0.5)',
                                            borderRadius:'4px',
                                            fontSize:'9px', fontWeight:900,
                                            color:GC.cyan, lineHeight:1,
                                            padding:'2px 5px',
                                        }}>{st.num}</span>
                                        <span style={{
                                            fontSize:'9px', fontWeight:700,
                                            color:'#c8e4ff', letterSpacing:'0.3px',
                                            lineHeight:1.2, textTransform:'uppercase',
                                        }}>{st.title}</span>
                                    </div>

                                    {/* Иконка — растягивается */}
                                    <div style={{
                                        flex:1, minHeight:0,
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                        padding:'6px 8px',
                                    }}>
                                        <img src={st?.img}  style={{width: "100%", height: "100%", objectFit: "contain"}} alt=""/>
                                    </div>

                                    {/* Нижняя часть */}
                                    <div style={{
                                        flexShrink:0,
                                        padding:'5px 6px 6px',
                                        borderTop:'1px solid rgba(14,168,199,0.15)',
                                        background:'rgba(0,0,0,0.2)',
                                    }}>
                                        <div style={{fontSize:'9px', color:GC.blue, lineHeight:1, marginBottom:'1px'}}>
                                            {st.statLabel}
                                        </div>
                                        <div style={{
                                            fontSize:'clamp(16px,2vw,26px)',
                                            fontWeight:900, color:'#d8eeff',
                                            lineHeight:1.05, marginBottom:'4px',
                                            textShadow:'0 0 10px rgba(100,200,255,0.4)',
                                        }}>
                                            {st.statVal}
                                        </div>
                                        {st.statusLabel && (
                                            <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                                                <span style={{
                                                    width:'7px', height:'7px', borderRadius:'50%', flexShrink:0,
                                                    background:GC.green,
                                                    boxShadow:`0 0 8px ${GC.green}, 0 0 3px ${GC.green}`,
                                                    display:'inline-block',
                                                }}/>
                                                <div>
                                                    <div style={{fontSize:'8px', color:GC.slate, lineHeight:1}}>{st.statusLabel}</div>
                                                    <div style={{fontSize:'10px', fontWeight:700, color:GC.green, lineHeight:1.2}}>{st.statusVal}</div>
                                                </div>
                                            </div>
                                        )}
                                        {st.progress && (
                                            <div>
                                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'3px'}}>
                                                    <span style={{fontSize:'8px', color:GC.slate}}>{st.progress.label}</span>
                                                    <span style={{fontSize:'11px', fontWeight:800, color:GC.green}}>{st.progress.val}%</span>
                                                </div>
                                                <div style={{height:'5px', background:'rgba(255,255,255,0.07)', borderRadius:'3px', overflow:'hidden'}}>
                                                    <div style={{
                                                        height:'100%', width:`${st.progress.val}%`,
                                                        background:`linear-gradient(90deg,${GC.green},${GC.green})`,
                                                        borderRadius:'3px',
                                                        boxShadow:'0 0 8px rgba(0,255,136,0.5)',
                                                    }}/>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Стрелка */}
                                {i < stages.length - 1 && (
                                    <div style={{
                                        flexShrink:0, width:'14px',
                                        display:'flex', alignItems:'center', justifyContent:'center',
                                    }}>
                                        <svg viewBox="0 0 14 24" width="12" height="22" fill="none">
                                            <defs>
                                                <linearGradient id={`ag${i}`} x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor="var(--gc-title)" stopOpacity="0.4"/>
                                                    <stop offset="100%" stopColor={GC.cyan}/>
                                                </linearGradient>
                                            </defs>
                                            <polyline points="2,2 11,12 2,22" stroke={`url(#ag${i})`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* ══ ПОТОКИ МАТЕРИАЛОВ ══ */}
                    <div style={{
                        flexShrink:0,
                        background:'rgba(3,12,30,0.8)',
                        border:'1px solid rgba(14,168,199,0.25)',
                        borderRadius:'7px', padding:'6px 8px',
                    }}>
                        <div style={{
                            fontSize:'8px', fontWeight:700, letterSpacing:'2px',
                            color:GC.blue, textTransform:'uppercase',
                            borderLeft:'2px solid var(--gc-title)', paddingLeft:'6px',
                            marginBottom:'6px',
                        }}>
                            Materiallar oqimi (kunlik)
                        </div>
                        <div style={{display:'flex', alignItems:'center', gap:'3px'}}>
                            {flows.map((fl, i) => (
                                <React.Fragment key={fl.label}>
                                    <div style={{
                                        flex:1, minWidth:0,
                                        background:'rgba(14,168,199,0.08)',
                                        border:'1px solid rgba(14,168,199,0.2)',
                                        borderRadius:'5px', padding:'5px 6px',
                                    }}>
                                        <div style={{
                                            fontSize:'8px', color:GC.slate,
                                            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                                            marginBottom:'2px',
                                        }}>{fl.label}</div>
                                        <div style={{display:'flex', alignItems:'baseline', gap:'3px', flexWrap:'nowrap'}}>
                                            <span style={{
                                                fontSize:'clamp(12px,1.4vw,17px)',
                                                fontWeight:800, color:'#cce8ff',
                                                lineHeight:1, whiteSpace:'nowrap',
                                            }}>{fl.value}</span>
                                            <span style={{fontSize:'8px', color:GC.slate, whiteSpace:'nowrap'}}>{fl.unit}</span>
                                        </div>
                                    </div>
                                    {i < flows.length - 1 && (
                                        <svg viewBox="0 0 16 12" width="13" height="10" fill="none" style={{flexShrink:0}}>
                                            <line x1="1" y1="6" x2="11" y2="6" stroke="var(--gc-title)" strokeWidth="1.5" strokeLinecap="round"/>
                                            <polyline points="7,2 12,6 7,10" stroke="var(--gc-title)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* ══ КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ ══ */}
                    <div style={{
                        flexShrink:0,
                        background:'rgba(3,12,30,0.8)',
                        border:'1px solid rgba(14,168,199,0.25)',
                        borderRadius:'7px', padding:'6px 8px',
                    }}>
                        <div style={{
                            fontSize:'8px', fontWeight:700, letterSpacing:'2px',
                            color:GC.blue, textTransform:'uppercase',
                            borderLeft:`2px solid ${GC.amber}`, paddingLeft:'6px',
                            marginBottom:'6px',
                        }}>
                            Kalit zanjir ko'rsatkichlari
                        </div>
                        <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'5px'}}>
                            {kpis.map(k => (
                                <div key={k.label} style={{
                                    background:'linear-gradient(160deg,rgba(14,168,199,0.08),rgba(0,0,0,0.1))',
                                    border:'1px solid rgba(14,168,199,0.18)',
                                    borderRadius:'6px', padding:'6px 4px 5px',
                                    textAlign:'center',
                                    boxShadow:'inset 0 1px 0 rgba(14,168,199,0.08)',
                                }}>
                                    <div style={{
                                        fontSize:'8px', color:GC.slate,
                                        lineHeight:1.3, marginBottom:'3px',
                                        minHeight:'22px',
                                        display:'flex', alignItems:'center', justifyContent:'start',
                                    }}>{k.label}</div>
                                  <div className="d-flex" style={{alignItems: "end"}}>
                                      <div style={{
                                          fontSize:'clamp(15px,1.8vw,24px)',
                                          fontWeight:900, color:GC.amber,
                                          lineHeight:1, marginBottom:'2px',
                                          textShadow:'0 0 12px rgba(255,215,0,0.4)',
                                      }}>{k.value}
                                      </div>
                                      <div style={{fontSize:'9px',marginLeft: '2px', color:GC.slate, fontWeight:600}}>{k.unit}</div>
                                  </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}

            {activeTab === 3 && (
              //   <div style={{ width: "100%", height: "47.5vh" }}>
              //     <TopCenterNew
              //         items={defaultItems}
              //         backgroundImage=""
              //         // pedestalImage="/imgs/item2.png"
              //     />
              // </div>
                <img src="/imgs/tab3.png" style={{width:'100%', height:'100%'}} alt=""/>

            )}
            {activeTab === 4 && (
              //   <div style={{ width: "100%", height: "47.5vh" }}>
              //     <TopCenterNew
              //         items={defaultItems}
              //         backgroundImage=""
              //         // pedestalImage="/imgs/item2.png"
              //     />
              // </div>
                <Map3D highlightIndex={highlightIndex} setHighlightIndex={setHighlightIndex} />


            )}

            {activeTab === 5 && (
                <img src="/imgs/GS1.png" style={{width:'100%',marginTop: "4%", height:'100%'}} alt=""/>
            )}
            {activeTab === 6 && (
                <img src="/imgs/GS2.png" style={{width:'100%',marginTop: "4%", height:'100%'}} alt=""/>
            )}
            {activeTab === 7 && (
                <img src="/imgs/GS3.png" style={{width:'100%',marginTop: "4%", height:'100%'}} alt=""/>
            )}
            {activeTab === 8 && (
                <img src="/imgs/GS4.png" style={{width:'100%',marginTop: "4%", height:'100%'}} alt=""/>
            )}
            {activeTab === 9 && (
                <img src="/imgs/GS5.png" style={{width:'100%',marginTop: "4%", height:'100%'}} alt=""/>
            )}
            {activeTab === 10 && (
                <img src="/imgs/GS6.png" style={{width:'100%',marginTop: "4%", height:'100%'}} alt=""/>
            )}
            {activeTab === 11 && (
                <img src="/imgs/GS7.png" style={{width:'100%',marginTop: "4%", height:'100%'}} alt=""/>
            )}
        </div>
    );
};

export default TopCenter;