import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, BarElement,
} from 'chart.js';
import {badge, C} from "./ResourceDashboard";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

/* ═══════════════════════════════════════════════════════
   API
═══════════════════════════════════════════════════════ */
const BASE    = 'https://citynet.synterra.uz';
const PHONE   = '998901234568';
const REFRESH = 20_000;

interface CardStat  { count: number; change_percent: number; percent_of_total: number; }
interface Cards     { arrived: CardStat; not_arrived: CardStat; late: CardStat; early_left: CardStat; currently_in: CardStat; left: CardStat; not_found: CardStat; }
interface NotFoundP { id: number; photo: string; formatted_date: string; turniket_name: string; door: string; door_label: string; full_name?: string; tab_number?: string; department?: string; position?: string; reason?: string; supervisor?: string; comment?: string; }
interface Employee  { id: number; full_name: string; department: string; position: string; image: string; status: string; is_late: boolean; is_early_left: boolean; entry_time: string|null; exit_time: string|null; last_log?: { door_label: string; time: string }; }
interface Dash      { date: string; total_users: number; cards: Cards; not_found_persons: NotFoundP[]; employees: Employee[]; }

const CS0: CardStat = { count: 0, change_percent: 0, percent_of_total: 0 };
const D0: Dash = {
    date: '', total_users: 0,
    cards: { arrived: CS0, not_arrived: CS0, late: CS0, early_left: CS0, currently_in: CS0, left: CS0, not_found: CS0 },
    not_found_persons: [], employees: [],
};

async function login(): Promise<string> {
    const res = await fetch(`${BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: PHONE }),
    });
    if (!res.ok) throw new Error(`Login ${res.status}`);
    const json = await res.json();
    const token = json?.data?.token;
    if (!token) throw new Error('Token yo\'q: ' + JSON.stringify(json));
    return token;
}

async function fetchDash(token: string): Promise<Dash> {
    const res = await fetch(`${BASE}/api/reports/tmk`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Dash ${res.status}`);
    const json = await res.json();
    // API wraps in .data
    const d = json?.data ?? json ?? {};
    const c = d.cards ?? {};
    return {
        date:             d.date        ?? '',
        total_users:      d.total_users ?? 0,
        cards: {
            arrived:      { ...CS0, ...(c.arrived      ?? {}) },
            not_arrived:  { ...CS0, ...(c.not_arrived  ?? {}) },
            late:         { ...CS0, ...(c.late         ?? {}) },
            early_left:   { ...CS0, ...(c.early_left   ?? {}) },
            currently_in: { ...CS0, ...(c.currently_in ?? {}) },
            left:         { ...CS0, ...(c.left         ?? {}) },
            not_found:    { ...CS0, ...(c.not_found    ?? {}) },
        },
        not_found_persons: Array.isArray(d.not_found_persons) ? d.not_found_persons : [],
        employees:         Array.isArray(d.employees)         ? d.employees         : [],
    };
}

/* ═══════════════════════════════════════════════════════
   THEME  (loyihadagi ranglar bilan mos)
═══════════════════════════════════════════════════════ */
const T = {
    bg0:'#010912', bg1:'#020e1c', bg2:'#041525',
    glass:'rgba(0, 245, 255, 0.03)',
    b0:'#0a2d54', b1:'#0e3d72', b2:'#1a7fd4',
    cyan:'#0EA8C7', cyan2:'#00d4ff', teal:'#00ffd4',
    green:'#00ff9d', red:'#ff2952', amber:'#ff9f0a',
    gold:'#ffd60a', blue:'#4c9fff', purple:'#bf5fff',
    text:'#cce8ff', muted:'#5a88b8', dim:'#2a4a6a',
};

const ST: Record<string,{label:string;color:string}> = {
    arrived:      { label:'Keldi',      color:T.green  },
    currently_in: { label:'Ofisda',     color:T.cyan2  },
    left:         { label:'Ketdi',      color:T.muted  },
    not_arrived:  { label:'Kelmadi',    color:T.red    },
    late:         { label:'Kech keldi', color:T.amber  },
};

/* ═══════════════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════════════ */
function Counter({ to, dur=1100 }: { to:number; dur?:number }) {
    const [v, setV] = useState(0);
    useEffect(() => {
        const s = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - s) / dur, 1);
            setV(Math.round((1 - Math.pow(1 - p, 3)) * to));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [to, dur]);
    return <>{v.toLocaleString()}</>;
}

/* ═══════════════════════════════════════════════════════
   STAT CARD  — SOC situatsion markaz uslubida
═══════════════════════════════════════════════════════ */
const CARD_ICONS: Record<string, React.ReactNode> = {
    arrived: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    not_arrived: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
        </svg>
    ),
    late: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ),
    currently_in: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="10" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M7 10V7a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="12" cy="15.5" r="1.5" fill="currentColor"/>
        </svg>
    ),
    left: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 12H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
    ),
    not_found: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M12 9v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="17" r="1" fill="currentColor"/>
        </svg>
    ),
};

function ArcRing({ pct, color, size=48 }: { pct:number; color:string; size?:number }) {
    const r = (size - 6) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (Math.min(pct, 100) / 100) * circ;
    return (
        <svg width={size} height={size} style={{transform:'rotate(-90deg)',flexShrink:0}}>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}18`} strokeWidth="2.5"/>
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="2.5"
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                style={{transition:'stroke-dasharray 1.2s ease',filter:`drop-shadow(0 0 4px ${color}88)`}}/>
        </svg>
    );
}

function StatCard({ cardKey, label, count, change, pct, color, active, onClick }: {
    cardKey:string; label:string; count:number; change:number; pct:number; color:string;
    active?:boolean; onClick?:()=>void;
}) {
    const [hov, setHov] = useState(false);
    const up = change >= 0;
    const isAlert = cardKey === 'not_found';
    const highlighted = active || hov;

    return (
        <div
            onClick={onClick}
            onMouseEnter={()=>setHov(true)}
            onMouseLeave={()=>setHov(false)}
            style={{
                position:'relative', overflow:'hidden',
                background: active
                    ? `linear-gradient(160deg, ${color}18 0%, ${color}08 100%)`
                    : `linear-gradient(160deg, rgba(4,14,34,0.97) 0%, rgba(2,8,22,1) 100%)`,
                backgroundColor: "rgba(0, 245, 255, 0.03)",
                border:`1px solid ${color}${highlighted ? (active?'99':'55') : (isAlert?'55':'22')}`,
                borderRadius:10,
                padding:'10px 12px 9px',
                display:'flex', flexDirection:'column', gap:0,
                boxShadow: active
                    ? `0 0 28px ${color}30, inset 0 0 40px ${color}10`
                    : isAlert
                        ? `0 0 20px ${color}18, inset 0 0 30px ${color}06`
                        : hov ? `0 0 16px ${color}14` : `inset 0 0 30px ${color}04`,
                transition:'all .2s ease',
                cursor: onClick ? 'pointer' : 'default',
                transform: hov && !active ? 'translateY(-1px)' : 'none',
            }}
        >
            {/* active top bar */}
            {active && (
                <div style={{position:'absolute',top:0,left:0,right:0,height:2,
                    background:`linear-gradient(90deg,transparent,${color},transparent)`,
                    boxShadow:`0 0 8px ${color}`}}/>
            )}

            {/* corner brackets */}
            <div style={{position:'absolute',left:0,top:0,width:10,height:10,
                borderTop:`1.5px solid ${color}${highlighted?'cc':'88'}`,borderLeft:`1.5px solid ${color}${highlighted?'cc':'88'}`,pointerEvents:'none',transition:'border-color .2s'}}/>
            <div style={{position:'absolute',right:0,top:0,width:10,height:10,
                borderTop:`1.5px solid ${color}${highlighted?'cc':'88'}`,borderRight:`1.5px solid ${color}${highlighted?'cc':'88'}`,pointerEvents:'none',transition:'border-color .2s'}}/>
            <div style={{position:'absolute',left:0,bottom:0,width:10,height:10,
                borderBottom:`1.5px solid ${color}${highlighted?'88':'44'}`,borderLeft:`1.5px solid ${color}${highlighted?'88':'44'}`,pointerEvents:'none'}}/>
            <div style={{position:'absolute',right:0,bottom:0,width:10,height:10,
                borderBottom:`1.5px solid ${color}${highlighted?'88':'44'}`,borderRight:`1.5px solid ${color}${highlighted?'88':'44'}`,pointerEvents:'none'}}/>

            {/* scan line for alert or active */}
            {(isAlert || active) && (
                <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',opacity: active?'.5':'.35'}}>
                    <div style={{position:'absolute',top:0,left:0,right:0,height:'2px',
                        background:`linear-gradient(90deg,transparent,${color},transparent)`,
                        animation:'scanH 2s linear infinite'}}/>
                </div>
            )}

            {/* top row: label + icon */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
                <div style={{display:'flex',alignItems:'center',gap:5}}>
                    <div style={{
                        width:5,height:5,borderRadius:'50%',
                        background:color,boxShadow:`0 0 ${highlighted?10:6}px ${color}`,
                        animation: (isAlert||active) ? 'blink .8s infinite' : 'none',
                        transition:'box-shadow .2s',
                    }}/>
                    <span style={{fontSize:'clamp(7px,.6vw,9px)',
                        color: highlighted ? color : T.muted,
                        textTransform:'uppercase',letterSpacing:1.5,
                        fontFamily:'Orbitron,monospace',transition:'color .2s'}}>
                        {label}
                    </span>
                </div>
                <div style={{
                    color, opacity: highlighted ? 1 : .6,
                    filter: highlighted ? `drop-shadow(0 0 4px ${color}88)` : 'none',
                    transition:'all .2s',
                }}>
                    {/*{CARD_ICONS[cardKey]}*/}

                </div>
            </div>

            {/* main row: big number + arc ring */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:4}}>
                <div style={{
                    fontFamily:'Orbitron,monospace',fontWeight:900,
                    fontSize:'clamp(15.4px, 1.33vw, 23.8px)',color,lineHeight:1,
                    textShadow:`0 0 ${highlighted?36:24}px ${color}${highlighted?'99':'66'}`,
                    transition:'text-shadow .2s',
                }}>
                    <Counter to={count}/>
                </div>
                <div style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <ArcRing pct={pct} color={color} size={32}/>
                    <div style={{position:'absolute', top: "40%", textAlign:'center'}}>
                        <div style={{fontSize:'clamp(7px,.35vw, 7px)',fontFamily:'Orbitron,monospace',
                            fontWeight:700,color:`${color}cc`,lineHeight:1}}>
                            {pct.toFixed(0)}
                        </div>
                        <div style={{fontSize:6,color:T.dim,lineHeight:1}}>%</div>
                    </div>
                </div>
            </div>

            {/* thin separator bar */}
            <div style={{height:2,borderRadius:2,background:`${color}12`,margin:'6px 0 5px'}}>
                <div style={{height:'100%',width:`${Math.min(pct,100)}%`,
                    background:`linear-gradient(90deg,${color}44,${color}cc)`,
                    borderRadius:2,transition:'width 1.2s ease',
                    boxShadow:`0 0 ${highlighted?10:6}px ${color}66`}}/>
            </div>

            {/* bottom: trend */}
            <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{
                    fontSize:'clamp(7px,.58vw,9px)',fontWeight:700,
                    color: up ? T.green : T.red,
                    background: up ? `${T.green}12` : `${T.red}12`,
                    border:`1px solid ${up?T.green:T.red}33`,
                    borderRadius:3,padding:'1px 6px',letterSpacing:.3,
                    fontFamily:'Orbitron,monospace',
                }}>
                    {up?'▲':'▼'} {Math.abs(change).toFixed(1)}%
                </span>
                {/*<span style={{fontSize:'clamp(6px,.5vw,8px)',color:T.dim}}>kechaga</span>*/}
                {/*{active && (*/}
                {/*    <span style={{marginLeft:'auto',fontSize:'clamp(6px,.5vw,8px)',*/}
                {/*        color,background:`${color}18`,border:`1px solid ${color}44`,*/}
                {/*        borderRadius:3,padding:'1px 6px',fontFamily:'Orbitron,monospace',fontWeight:700,letterSpacing:.5}}>*/}
                {/*        FAOL*/}
                {/*    </span>*/}
                {/*)}*/}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   HEX BACKGROUND
═══════════════════════════════════════════════════════ */
function HexBg() {
    return (
        <svg style={{position:'fixed',inset:0,width:'100%',height:'100%',opacity:.025,pointerEvents:'none',zIndex:0}}>
            <defs>
                <pattern id="ehex" x="0" y="0" width="56" height="96" patternUnits="userSpaceOnUse">
                    <polygon points="28,4 52,18 52,46 28,60 4,46 4,18" fill="none" stroke={T.cyan2} strokeWidth="0.8"/>
                    <polygon points="28,52 52,66 52,94 28,108 4,94 4,66" fill="none" stroke={T.cyan2} strokeWidth="0.8"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ehex)"/>
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════
   FLOOR PLAN (SVG animatsiya)
═══════════════════════════════════════════════════════ */
function FloorPlan({ incident }: { incident: NotFoundP|null }) {
    const [t, setT] = useState(0);
    useEffect(() => { const id = setInterval(()=>setT(n=>n+1),700); return()=>clearInterval(id); }, []);
    const p = (Math.sin(t*0.9)+1)/2;
    const r = (Math.sin(t*1.2)+1)/2;

    const buildings = [
        { x:50,  y:50,  w:190, h:115, label:'KORPUS 1', color:T.cyan,  alarm:false, ex:145, ey:165 },
        { x:460, y:50,  w:190, h:115, label:'KORPUS 2', color:T.red,   alarm:true,  ex:555, ey:165 },
        { x:50,  y:255, w:190, h:115, label:'KORPUS 3', color:T.cyan,  alarm:false, ex:145, ey:255 },
        { x:460, y:255, w:190, h:115, label:'KORPUS 4', color:T.cyan,  alarm:false, ex:555, ey:255 },
    ];

    return (
        <svg width="100%" height="100%" viewBox="0 0 700 420" preserveAspectRatio="xMidYMid meet" style={{position:'absolute',inset:0}}>
            <defs>
                <radialGradient id="mbg" cx="50%" cy="50%" r="65%">
                    <stop offset="0%" stopColor="#051830"/>
                    <stop offset="100%" stopColor="#010912"/>
                </radialGradient>
                <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="rglow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <rect width="700" height="420" fill="url(#mbg)"/>
            {Array.from({length:18},(_,i)=><line key={`v${i}`} x1={i*40} y1="0" x2={i*40} y2="420" stroke={T.b0} strokeWidth="0.4" opacity="0.5"/>)}
            {Array.from({length:11},(_,i)=><line key={`h${i}`} x1="0" y1={i*40} x2="700" y2={i*40} stroke={T.b0} strokeWidth="0.4" opacity="0.5"/>)}

            {/* paths */}
            <path d="M240 107 L350 107 L350 200 L350 315 L350 380" fill="none" stroke={T.cyan} strokeWidth="1.2" strokeDasharray="7 5" opacity="0.35"/>
            <path d="M145 165 L350 200" fill="none" stroke={T.cyan} strokeWidth="1" strokeDasharray="5 4" opacity="0.3"/>
            <path d="M555 165 L350 200" fill="none" stroke={T.red} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.55" filter="url(#rglow)"/>
            <path d="M145 255 L350 270" fill="none" stroke={T.cyan} strokeWidth="1" strokeDasharray="5 4" opacity="0.3"/>
            <path d="M555 255 L350 270" fill="none" stroke={T.cyan} strokeWidth="1" strokeDasharray="5 4" opacity="0.3"/>

            {/* center node */}
            <circle cx="350" cy="203" r={7+p*4} fill={`${T.cyan2}18`} stroke={T.cyan2} strokeWidth="0.8"/>
            <circle cx="350" cy="203" r={3+p*2} fill={T.cyan2} opacity={0.7+p*0.3} filter="url(#glow)"/>

            {buildings.map((b,i)=>(
                <g key={i}>
                    {b.alarm && <rect x={b.x-5} y={b.y-5} width={b.w+10} height={b.h+10} rx="7"
                        fill="none" stroke={T.red} strokeWidth={1.5+r*1.5} opacity={0.35+r*0.5} filter="url(#rglow)"/>}
                    <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="5"
                        fill={b.alarm?'rgba(28,4,8,0.93)':'rgba(4,18,40,0.93)'}
                        stroke={b.color} strokeWidth="1.2" filter="url(#glow)"/>
                    <rect x={b.x} y={b.y} width={b.w} height={14} rx="5"
                        fill={b.alarm?`${T.red}28`:`${T.cyan}18`}/>
                    {[[b.x,b.y],[b.x+b.w,b.y],[b.x,b.y+b.h],[b.x+b.w,b.y+b.h]].map(([cx,cy],j)=>(
                        <path key={j} d={`M${cx+(j%2===0?5:-5)} ${cy} L${cx} ${cy} L${cx} ${cy+(j<2?5:-5)}`}
                            stroke={b.color} strokeWidth="1.2" fill="none" opacity="0.7"/>
                    ))}
                    <text x={b.x+b.w/2} y={b.y+10} textAnchor="middle"
                        fill={b.color} fontSize="8" fontFamily="Orbitron,monospace" fontWeight="800">{b.label}</text>
                    <circle cx={b.ex} cy={b.ey} r={b.alarm?8+r*5:6+p*3} fill={`${b.color}18`} opacity="0.6"/>
                    <circle cx={b.ex} cy={b.ey} r={b.alarm?5:4} fill={b.color} filter="url(#glow)"/>
                    {b.alarm && <text x={b.ex} y={b.ey+4} textAnchor="middle" fill="#fff" fontSize="6" fontWeight="900">!</text>}
                </g>
            ))}

            {/* KPP */}
            <rect x="298" y="348" width="104" height="50" rx="4"
                fill="rgba(4,18,40,0.95)" stroke={T.amber} strokeWidth="1.2" filter="url(#glow)"/>
            <text x="350" y="368" textAnchor="middle" fill={T.amber} fontSize="8" fontFamily="Orbitron,monospace" fontWeight="700">KPP</text>
            <text x="350" y="382" textAnchor="middle" fill={T.muted} fontSize="7">Kirish / Chiqish</text>
            <circle cx="350" cy="348" r={3+p*3} fill={`${T.amber}28`}/>
            <circle cx="350" cy="348" r="3" fill={T.amber} filter="url(#glow)"/>

            {/* incident popup */}
            {incident && (
                <g>
                    <line x1="555" y1="158" x2="500" y2="95" stroke={T.red} strokeWidth="1" strokeDasharray="4 3" opacity="0.7"/>
                    <rect x="330" y="55" width="250" height="100" rx="6"
                        fill="rgba(18,2,6,0.97)" stroke={T.red} strokeWidth="1.2" filter="url(#rglow)"/>
                    <rect x="330" y="55" width="250" height="20" rx="6" fill={`${T.red}22`}/>
                    <circle cx="344" cy="65" r="5" fill={T.red} opacity="0.85"/>
                    <text x="354" y="69" fill={T.red} fontSize="7.5" fontFamily="Orbitron,monospace" fontWeight="800">JORIY HODISA</text>
                    <circle cx="356" cy="112" r="18" fill={`${T.red}15`} stroke={T.red} strokeWidth="0.8"/>
                    <text x="356" y="118" textAnchor="middle" fill={T.red} fontSize="18" fontWeight="900">?</text>
                    <text x="382" y="90" fill={T.text} fontSize="8.5" fontFamily="Exo 2,sans-serif" fontWeight="700">{incident.full_name??'Noma\'lum shaxs'}</text>
                    <text x="382" y="103" fill={T.muted} fontSize="7.5">Turniket: {incident.turniket_name}</text>
                    <text x="382" y="116" fill={T.muted} fontSize="7.5">Eshik: {incident.door_label}</text>
                    <text x="382" y="129" fill={T.amber} fontSize="7.5">{incident.formatted_date}</text>
                    <text x="382" y="143" fill={T.red} fontSize="7.5" fontWeight="700">● RUXSATSIZ KIRISH</text>
                </g>
            )}

            <rect x="4" y="4" width="50" height="14" rx="3" fill={`${T.green}12`} stroke={`${T.green}44`} strokeWidth="0.8"/>
            <circle cx="12" cy="11" r="2.5" fill={T.green} opacity={0.6+p*0.4}/>
            <text x="18" y="15" fill={T.green} fontSize="6.5" fontFamily="Orbitron,monospace">JONLI</text>
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════
   EMPLOYEE ROW
═══════════════════════════════════════════════════════ */
function EmpRow({ emp, sel, onClick }: { emp:Employee; sel:boolean; onClick:()=>void }) {
    const st = ST[emp.status] ?? { label: emp.status, color: T.muted };
    return (
        <div onClick={onClick} style={{
            display:'grid', gridTemplateColumns:'30px 1fr auto 40px',
            alignItems:'center', gap:7, padding:'6px 10px',
            borderBottom:`1px solid ${T.b0}44`,
            background: sel ? `${T.cyan}0c` : 'transparent',
            borderLeft: sel ? `2px solid ${T.cyan2}` : '2px solid transparent',
            cursor:'pointer', transition:'background .12s',
        }}
        onMouseEnter={e=>(e.currentTarget.style.background=`${T.cyan}07`)}
        onMouseLeave={e=>(e.currentTarget.style.background=sel?`${T.cyan}0c`:'transparent')}>
            <div style={{
                width:28,height:28,borderRadius:'50%',flexShrink:0,
                border:`1.5px solid ${st.color}50`,
                background:`${st.color}15`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:10,fontWeight:700,color:st.color,overflow:'hidden',
            }}>
                {emp.image
                    ? <img src={emp.image} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} alt=""/>
                    : emp.full_name.split(' ').map(w=>w[0]).slice(0,2).join('')
                }
            </div>
            <div style={{minWidth:0}}>
                <div style={{fontSize:10,fontWeight:600,color:T.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{emp.full_name}</div>
                <div style={{fontSize:8,color:T.muted,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{emp.department}</div>
            </div>
            <div style={{
                fontSize:8,fontWeight:700,color:st.color,
                background:`${st.color}14`,border:`1px solid ${st.color}38`,
                borderRadius:4,padding:'2px 7px',whiteSpace:'nowrap',
            }}>{st.label}</div>
            <div style={{fontSize:9,color:T.dim,textAlign:'right',fontFamily:'monospace'}}>{emp.entry_time??'—'}</div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   DETAIL PANEL
═══════════════════════════════════════════════════════ */
function Detail({ nf, emp }: { nf?:NotFoundP; emp?:Employee }) {
    const alarm  = !!nf;
    const color  = alarm ? T.red : T.cyan2;
    const name   = nf?.full_name ?? emp?.full_name ?? '—';
    const dept   = nf?.department ?? emp?.department ?? '—';
    const pos    = nf?.position   ?? emp?.position   ?? '—';
    const status = alarm ? 'Ruxsatsiz kirish' : (ST[emp?.status??'']?.label ?? '—');
    const sColor = alarm ? T.red : (ST[emp?.status??'']?.color ?? T.muted);

    const rows = [
        { k:'F.I.O.',     v: name },
        { k:'Tab. №',     v: nf?.tab_number ?? `#${emp?.id??'—'}` },
        { k:'Bo\'lim',    v: dept },
        { k:'Lavozim',    v: pos  },
        { k:'Kirish',     v: nf?.formatted_date ?? emp?.entry_time ?? '—' },
        ...(alarm ? [
            { k:'Turniket', v: `${nf!.turniket_name} — ${nf!.door_label}` },
            { k:'Sabab',    v: nf!.reason ?? '—' },
            { k:'Rahbar',   v: nf!.supervisor ?? '—' },
        ] : [
            { k:'Chiqish',  v: emp?.exit_time ?? '—' },
            { k:'Oxirgi',   v: emp?.last_log ? `${emp.last_log.door_label} ${emp.last_log.time}` : '—' },
        ]),
    ];

    return (
        <div style={{flex:1,overflowY:'auto',padding:'10px 12px',display:'flex',flexDirection:'column',gap:10}}>
            {/* Avatar */}
            <div style={{display:'flex',justifyContent:'center',paddingTop:6}}>
                <div style={{
                    width:76,height:76,borderRadius:'50%',
                    border:`2px solid ${color}`,
                    boxShadow:`0 0 28px ${color}44,0 0 60px ${color}18`,
                    background:`${color}10`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    overflow:'hidden',position:'relative',
                }}>
                    {(nf?.photo||emp?.image)
                        ? <img src={`${nf?.photo??emp?.image}`} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                        : <span style={{fontSize:26,fontWeight:900,color,fontFamily:'Orbitron,monospace'}}>{name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span>
                    }
                    {alarm && <div style={{position:'absolute',inset:0,border:`2px solid ${T.red}`,borderRadius:'50%',animation:'blink 1s infinite'}}/>}
                </div>
            </div>

            {/* Status */}
            <div style={{
                textAlign:'center',padding:'5px',borderRadius:6,
                background:`${sColor}14`,border:`1px solid ${sColor}40`,
                fontSize:9,fontWeight:700,color:sColor,
                fontFamily:'Orbitron,monospace',letterSpacing:.5,
                animation:alarm?'alertPulse 2s ease-in-out infinite':'none',
            }}>{status}</div>

            {/* Fields */}
            <div style={{display:'flex',flexDirection:'column',gap:0}}>
                {rows.map(r=>(
                    <div key={r.k} style={{
                        display:'flex',justifyContent:'space-between',alignItems:'flex-start',
                        padding:'5px 0',borderBottom:`1px solid ${T.b0}40`,
                    }}>
                        <span style={{fontSize:8,color:T.dim,minWidth:68,flexShrink:0}}>{r.k}</span>
                        <span style={{fontSize:9,color:T.text,fontWeight:500,textAlign:'right',maxWidth:'60%',lineHeight:1.4}}>{r.v}</span>
                    </div>
                ))}
            </div>

            {alarm && nf!.comment && (
                <div style={{
                    padding:'8px 10px',background:`${T.red}0c`,
                    border:`1px solid ${T.red}28`,borderLeft:`3px solid ${T.red}`,
                    borderRadius:'0 6px 6px 0',
                }}>
                    <div style={{fontSize:7,color:T.muted,marginBottom:3,letterSpacing:.5}}>IZOH</div>
                    <div style={{fontSize:9,color:T.text,lineHeight:1.5}}>{nf!.comment}</div>
                </div>
            )}

            <button style={{
                width:'100%',padding:'8px',marginTop:'auto',
                background:alarm?`${T.red}14`:`${T.cyan2}0e`,
                border:`1px solid ${color}44`,borderRadius:6,
                color,fontSize:9,fontWeight:700,fontFamily:'Orbitron,monospace',
                cursor:'pointer',letterSpacing:.5,
                boxShadow:alarm?`0 0 14px ${T.red}18`:'none',
                transition:'all .2s',
            }}>
                {alarm ? 'KIRISHNI BLOKLASH' : 'KARTOCHKANI OCHISH'}
            </button>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   SECTION HEADER (ResourceDashboard uslubida)
═══════════════════════════════════════════════════════ */
function SecHead({ title, color, right }: { title:string; color:string; right?:React.ReactNode }) {
    return (
        <div style={{
            display:'flex',justifyContent:'space-between',alignItems:'center',
            padding:'5px 10px 5px 12px',
            borderLeft:`3px solid ${color}`,
            borderBottom:`1px solid ${T.b1}`,
            flexShrink:0,
        }}>
            <span style={{fontSize:9,fontFamily:'Orbitron,monospace',fontWeight:700,
                color,letterSpacing:1.5,textTransform:'uppercase'}}>{title}</span>
            {right}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════ */
export default function EnterExit() {
    const [data,         setData]         = useState<Dash>(D0);
    const [loading,      setLoading]      = useState(true);
    const [err,          setErr]          = useState('');
    const [wsOk,         setWsOk]         = useState(false);
    const [now,          setNow]          = useState(new Date());
    const [sel,          setSel]          = useState<{nf?:NotFoundP;emp?:Employee}|null>(null);
    const [search,       setSearch]       = useState('');
    const [activeFilter, setActiveFilter] = useState<string|null>(null);
    const tokenRef = useRef('');
    const wsRef    = useRef<WebSocket|null>(null);

    const applyDash = useCallback((d: Dash) => {
        setData(d);
        setErr('');
        if (d.not_found_persons.length) setSel({ nf: d.not_found_persons[0] });
    }, []);

    const load = useCallback(async () => {
        try {
            if (!tokenRef.current) tokenRef.current = await login();
            applyDash(await fetchDash(tokenRef.current));
        } catch (e: any) {
            setErr(String(e?.message ?? e));
            // token muddati tugagan bo'lsa qayta login
            if (String(e?.message).includes('401') || String(e?.message).includes('403')) {
                tokenRef.current = '';
            }
        } finally {
            setLoading(false);
        }
    }, [applyDash]);

    /* WebSocket — message kelganda load() chaqiradi */
    useEffect(() => {
        let alive = true;
        const connect = async () => {
            if (!alive) return;
            try {
                if (!tokenRef.current) tokenRef.current = await login();
                const ws = new WebSocket(`wss://citynet.synterra.uz/ws?token=${tokenRef.current}`);
                wsRef.current = ws;
                ws.onopen    = () => setWsOk(true);
                ws.onclose   = () => { setWsOk(false); if (alive) setTimeout(connect, 5000); };
                ws.onerror   = () => ws.close();
                ws.onmessage = () => { load(); }; // har qanday message → yangi fetch
            } catch {
                if (alive) setTimeout(connect, 8000);
            }
        };
        connect();
        return () => { alive = false; wsRef.current?.close(); };
    }, [load]);

    /* Polling fallback — WS ochiq bo'lmasa polling */
    useEffect(() => {
        load();
        const id = setInterval(() => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) load();
        }, REFRESH);
        return () => clearInterval(id);
    }, [load]);

    useEffect(() => { const id = setInterval(()=>setNow(new Date()),1000); return()=>clearInterval(id); }, []);

    const cards    = data.cards;
    const incident = data.not_found_persons[0] ?? null;
    const filtered = data.employees.filter(e => {
        const matchSearch = !search
            || e.full_name.toLowerCase().includes(search.toLowerCase())
            || e.department.toLowerCase().includes(search.toLowerCase());
        let matchFilter = true;
        if (activeFilter === 'arrived')      matchFilter = e.status === 'arrived' && !e.is_late;
        else if (activeFilter === 'not_arrived')  matchFilter = e.status === 'not_arrived';
        else if (activeFilter === 'late')         matchFilter = e.is_late;
        else if (activeFilter === 'currently_in') matchFilter = e.status === 'currently_in';
        else if (activeFilter === 'left')         matchFilter = e.status === 'left';
        else if (activeFilter === 'not_found')    matchFilter = false; // not_found => incidents list
        return matchSearch && matchFilter;
    });
    const pad = (n:number) => String(n).padStart(2,'0');

    const CARDS_DEF = [
        { key:'arrived',      label:'Kelganlar',       color:T.green  },
        { key:'not_arrived',  label:'Kelmadi',         color:T.red    },
        { key:'late',         label:'Kech keldi',      color:T.amber  },
        { key:'currently_in', label:'Hozir ofisda',    color:T.cyan2  },
        { key:'left',         label:'Ketdi',           color:T.blue   },
        { key:'not_found',    label:'Aniqlanmagan',    color:'#ff2952' },
    ] as const;

    const pieData = {
        labels: ['Keldi','Kech','Kelmadi','Ketdi','Aniqlanmagan'],
        datasets: [{
            data: [
                cards.arrived.count,
                cards.late.count,
                cards.not_arrived.count,
                cards.left.count,
                cards.not_found.count,
            ],
            backgroundColor: [T.green, T.amber, T.red, T.blue, '#ff2952'],
            borderColor: T.bg0,
            borderWidth: 2,
        }],
    };

    const LOG = [
        ...data.not_found_persons.map(p=>({ type:'crit', time:p.formatted_date?.split(' ')[1]??'—', line1:'Ruxsatsiz kirish', line2:`${p.full_name??'Noma\'lum'} — ${p.turniket_name}` })),
        ...data.employees.filter(e=>e.is_late).slice(0,4).map(e=>({ type:'warn', time:e.entry_time??'—', line1:'Kech keldi', line2:`${e.full_name} — ${e.last_log?.door_label??''}` })),
        ...data.employees.filter(e=>e.status==='arrived').slice(0,4).map(e=>({ type:'ok', time:e.entry_time??'—', line1:'Kirish ruxsati berildi', line2:`${e.full_name} — ${e.last_log?.door_label??''}` })),
        ...data.employees.filter(e=>e.is_early_left).slice(0,2).map(e=>({ type:'warn', time:e.exit_time??'—', line1:'Erta ketdi', line2:`${e.full_name}` })),
    ].slice(0, 12);

    return (
        <div style={{
            width:'100%',
            height:'50vh',
            // background:T.bg0,color:T.text,
            fontFamily:"'Exo 2','Segoe UI',sans-serif",
            display:'flex',flexDirection:'column',gap:5,
            padding:'6px 8px',overflow:'hidden',
            position:'relative',
        }}>
            <HexBg/>
            <style>{`
                @keyframes alertPulse { 0%,100%{box-shadow:0 0 8px ${T.red}30} 50%{box-shadow:0 0 22px ${T.red}70} }
                @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
                @keyframes scanH { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
                @keyframes fadeUp { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
                ::-webkit-scrollbar{width:3px}
                ::-webkit-scrollbar-track{background:transparent}
                ::-webkit-scrollbar-thumb{background:${T.b1};border-radius:2px}
                input::placeholder{color:${T.dim}}
            `}</style>

            {/* ══════════ HEADER ══════════ */}


            <div style={{display:'flex', marginBottom:"10px", justifyContent:'space-between', alignItems:'center'}}>
                <div style={{fontSize:'13px', fontWeight:700, letterSpacing:'2px', color:C.electric}}>
                    XAVFSIZLIK NAZORAT MARKA
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginTop:3}}>
                    <div style={{
                        display:'flex',flexDirection:'row',alignItems:'center',
                        background:`${T.cyan}0c`,border:`1px solid ${T.cyan}2a`,
                        borderRadius:8,padding:'5px 14px',
                        boxShadow:`inset 0 0 12px ${T.cyan}06`,
                    }}>
                        <span style={{fontSize:'clamp(6px,.5vw,8px)',color: "rgb(14, 168, 199)",
                            letterSpacing:1.2,fontFamily:'Orbitron,monospace', marginRight: "10px"}}>JAMI XODIM: </span>
                        <span style={{fontFamily:'Orbitron,monospace',fontSize:'clamp(14px,1.2vw,18px)',
                            fontWeight:900,color:T.cyan,textShadow:`0 0 16px ${T.cyan}66`}}>
                            <Counter to={data.total_users}/>
                        </span>
                    </div>
                    {cards.not_found.count > 0 && (
                        <div style={{
                            background:`linear-gradient(135deg,${T.red}18,${T.red}0a)`,
                            border:`1px solid ${T.red}55`,
                            borderRadius:8,padding:'5px 14px',
                            display:'flex',flexDirection:'row',alignItems:'center',
                            animation:'alertPulse 2s ease-in-out infinite',
                            boxShadow:`0 0 18px ${T.red}22`,
                        }}>
                            <span style={{fontSize:'clamp(6px,.5vw,8px)',color:T.red,
                                letterSpacing:1.2,fontFamily:'Orbitron,monospace', marginRight: "10px"}}>⚠ HODISA : </span>
                            <span style={{fontFamily:'Orbitron,monospace',fontSize:'clamp(14px,1.2vw,18px)',
                                fontWeight:900,color:T.red,textShadow:`0 0 14px ${T.red}88`}}>
                                {cards.not_found.count}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {/* API xato banner */}
            {err && (
                <div style={{
                    background:`${T.red}14`,border:`1px solid ${T.red}55`,
                    borderRadius:7,padding:'5px 14px',
                    fontSize:9,color:T.red,flexShrink:0,zIndex:2,
                    display:'flex',alignItems:'center',gap:8,
                }}>
                    <span style={{fontFamily:'Orbitron,monospace',fontWeight:700}}>API XATO:</span>
                    <span>{err}</span>
                </div>
            )}

            {/* Ruxsatsiz kirish banner */}
            {/*{cards.not_found.count > 0 && incident && (*/}
            {/*    <div style={{*/}
            {/*        position:'relative',overflow:'hidden',flexShrink:0,zIndex:2,*/}
            {/*        background:`linear-gradient(90deg,${T.red}22 0%,${T.red}0e 50%,${T.red}22 100%)`,*/}
            {/*        border:`1px solid ${T.red}77`,borderRadius:8,*/}
            {/*        padding:'6px 16px',*/}
            {/*        display:'flex',alignItems:'center',gap:14,*/}
            {/*        animation:'alertPulse 2s ease-in-out infinite',*/}
            {/*        boxShadow:`0 0 24px ${T.red}18`,*/}
            {/*    }}>*/}
            {/*        <div style={{position:'absolute',inset:0,*/}
            {/*            background:`linear-gradient(90deg,transparent,${T.red}09,transparent)`,*/}
            {/*            animation:'scanH 2.5s linear infinite'}}/>*/}
            {/*        /!* left urgent stripe *!/*/}
            {/*        <div style={{position:'absolute',left:0,top:0,bottom:0,width:4,*/}
            {/*            background:`linear-gradient(180deg,transparent,${T.red},transparent)`,*/}
            {/*            boxShadow:`0 0 8px ${T.red}`}}/>*/}
            {/*        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>*/}
            {/*            <div style={{width:9,height:9,borderRadius:'50%',background:T.red,*/}
            {/*                boxShadow:`0 0 12px ${T.red}`,animation:'blink .7s infinite'}}/>*/}
            {/*            <span style={{fontFamily:'Orbitron,monospace',fontSize:'clamp(8px,.7vw,10px)',*/}
            {/*                fontWeight:900,color:T.red,letterSpacing:1.5}}>*/}
            {/*                XAVF DARAJASI: YUQORI*/}
            {/*            </span>*/}
            {/*        </div>*/}
            {/*        <div style={{width:1,height:20,background:`${T.red}44`,flexShrink:0}}/>*/}
            {/*        <span style={{fontFamily:'Orbitron,monospace',fontSize:'clamp(7px,.62vw,9px)',*/}
            {/*            fontWeight:700,color:`${T.red}cc`,letterSpacing:.8}}>*/}
            {/*            {cards.not_found.count} RUXSATSIZ KIRISH ANIQLANDI*/}
            {/*        </span>*/}
            {/*        <div style={{width:1,height:20,background:`${T.red}33`,flexShrink:0}}/>*/}
            {/*        <span style={{fontSize:'clamp(8px,.68vw,10px)',color:T.text,opacity:.9,flex:1}}>*/}
            {/*            <span style={{color:T.amber,fontWeight:600}}>{incident.full_name??'Noma\'lum shaxs'}</span>*/}
            {/*            {' · '}{incident.turniket_name}*/}
            {/*            {' · '}<span style={{color:`${T.red}cc`}}>{incident.door_label}</span>*/}
            {/*            {' · '}{incident.formatted_date}*/}
            {/*        </span>*/}
            {/*    </div>*/}
            {/*)}*/}

            {/* ══════════ STAT CARDS ══════════ */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:6,flexShrink:0,zIndex:1}}>
                {CARDS_DEF.map(({key,label,color})=>{
                    const s = cards[key as keyof Cards];
                    return <StatCard key={key} cardKey={key} label={label} count={s.count}
                        change={s.change_percent} pct={s.percent_of_total} color={color}
                        active={activeFilter === key}
                        onClick={()=>{
                            setActiveFilter(prev => prev===key ? null : key);
                            if (key==='not_found' && data.not_found_persons.length>0) setSel({nf:data.not_found_persons[0]});
                        }}/>;
                })}
            </div>

            {/* ══════════ MAIN 3-COL ══════════ */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1.7fr 1fr', gap:6,flex:1,minHeight:0,zIndex:1}}>

                {/* ─── LEFT: xodimlar ro'yxati ─── */}
                <div style={{
                    background:T.glass,backdropFilter:'blur(10px)',
                    border:`1px solid ${T.b1}`,borderRadius:10,
                    display:'flex',flexDirection:'column',overflow:'hidden',
                }}>
                    <SecHead title="XODIMLAR RO'YXATI" color={activeFilter ? CARDS_DEF.find(c=>c.key===activeFilter)?.color??T.cyan : T.cyan} right={
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                            {activeFilter && activeFilter!=='not_found' && (
                                <span style={{
                                    fontSize:7,fontFamily:'Orbitron,monospace',fontWeight:700,
                                    color: CARDS_DEF.find(c=>c.key===activeFilter)?.color??T.cyan,
                                    background:`${CARDS_DEF.find(c=>c.key===activeFilter)?.color??T.cyan}18`,
                                    border:`1px solid ${CARDS_DEF.find(c=>c.key===activeFilter)?.color??T.cyan}44`,
                                    borderRadius:4,padding:'1px 7px',letterSpacing:.5,cursor:'pointer',
                                }} onClick={()=>setActiveFilter(null)}>
                                    {CARDS_DEF.find(c=>c.key===activeFilter)?.label} ✕
                                </span>
                            )}
                            <span style={{fontSize:8,color:T.muted}}>
                                {filtered.length} / {data.total_users.toLocaleString()}
                            </span>
                        </div>
                    }/>
                    {/* search */}
                    <div style={{padding:'6px 10px',borderBottom:`1px solid ${T.b0}55`,flexShrink:0}}>
                        <div style={{display:'flex',alignItems:'center',gap:6,
                            background:`${T.bg0}cc`,border:`1px solid ${T.b0}`,
                            borderRadius:6,padding:'4px 10px',
                        }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="7" stroke={T.dim} strokeWidth="2"/>
                                <line x1="16" y1="16" x2="21" y2="21" stroke={T.dim} strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            <input value={search} onChange={e=>setSearch(e.target.value)}
                                placeholder="Qidirish..."
                                style={{background:'none',border:'none',outline:'none',
                                    color:T.text,fontSize:9,flex:1,fontFamily:'inherit'}}/>
                        </div>
                    </div>
                    {/* col headers */}
                    <div style={{display:'grid',gridTemplateColumns:'30px 1fr auto 40px',
                        padding:'3px 10px',gap:7,borderBottom:`1px solid ${T.b0}44`,flexShrink:0}}>
                        {['#','Xodim','Status','Vaqt'].map(h=>(
                            <div key={h} style={{fontSize:7,color:T.dim,textTransform:'uppercase',letterSpacing:.5}}>{h}</div>
                        ))}
                    </div>
                    <div style={{flex:1,overflowY:'auto'}}>
                        {loading && data.employees.length===0 ? (
                            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',opacity:.3}}>
                                <span style={{fontSize:9,color:T.muted,fontFamily:'Orbitron,monospace'}}>YUKLANMOQDA…</span>
                            </div>
                        ) : filtered.length===0 ? (
                            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',opacity:.3}}>
                                <span style={{fontSize:9,color:T.muted}}>Ma'lumot yo'q</span>
                            </div>
                        ) : filtered?.slice(0, 50)?.map(emp=>(
                            <EmpRow key={emp.id} emp={emp} sel={sel?.emp?.id===emp.id} onClick={()=>setSel({emp})}/>
                        ))}
                    </div>
                </div>

                {/* ─── CENTER: xarita ─── */}
                <div style={{
                    background:T.glass,backdropFilter:'blur(6px)',
                    border:`1px solid ${T.b1}`,borderRadius:10,
                    display:'flex',flexDirection:'column',overflow:'hidden',
                }}>
                    <SecHead title="TURNIKETLAR XARITASI" color={T.cyan} right={
                        <div style={{display:'flex',alignItems:'center',gap:10,fontSize:8}}>
                            {[{c:T.green,l:'Normal'},{c:T.amber,l:'Kech'},{c:T.red,l:'Hodisa'}].map(({c,l})=>(
                                <span key={l} style={{display:'flex',alignItems:'center',gap:4,color:T.muted}}>
                                    <span style={{width:7,height:7,borderRadius:'50%',background:c,display:'inline-block'}}/>
                                    {l}
                                </span>
                            ))}
                        </div>
                    }/>
                    <div style={{flex:1,position:'relative',overflow:'hidden'}}>
                        <FloorPlan incident={incident}/>
                    </div>

                    {/* not_found persons strip */}
                    {data.not_found_persons.length > 0 && (
                        <div style={{
                            borderTop:`1px solid ${T.red}44`,
                            background:`${T.red}0a`,
                            padding:'5px 10px',
                            display:'flex',gap:8,overflowX:'auto',flexShrink:0,
                        }}>
                            <span style={{fontSize:7,color:T.red,fontFamily:'Orbitron,monospace',fontWeight:700,
                                whiteSpace:'nowrap',alignSelf:'center',marginRight:2}}>HODISALAR:</span>
                            {data.not_found_persons.map(p=>(
                                <div key={p.id} onClick={()=>setSel({nf:p})} style={{
                                    flexShrink:0,display:'flex',alignItems:'center',gap:5,
                                    background:`${T.red}12`,border:`1px solid ${T.red}33`,
                                    borderRadius:6,padding:'3px 8px',cursor:'pointer',
                                    transition:'border-color .15s',
                                }}
                                onMouseEnter={e=>e.currentTarget.style.borderColor=T.red}
                                onMouseLeave={e=>e.currentTarget.style.borderColor=`${T.red}33`}>
                                    <div style={{width:22,height:22,borderRadius:'50%',overflow:'hidden',
                                        background:`${T.red}20`,border:`1px solid ${T.red}44`,
                                        display:'flex',alignItems:'center',justifyContent:'center',
                                        flexShrink:0}}>
                                        {p.photo
                                            ? <img src={p.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                                            : <span style={{fontSize:8,color:T.red,fontWeight:700}}>?</span>
                                        }
                                    </div>
                                    <div>
                                        <div style={{fontSize:8,color:T.text,fontWeight:600,whiteSpace:'nowrap'}}>
                                            {(p.full_name??'Noma\'lum').split(' ').slice(0,2).join(' ')}
                                        </div>
                                        <div style={{fontSize:7,color:T.muted,whiteSpace:'nowrap'}}>
                                            {p.turniket_name} · {p.formatted_date?.split(' ')[1]??''}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ─── RIGHT: detail panel ─── */}
                <div style={{
                    background:T.glass,backdropFilter:'blur(10px)',
                    border:`1px solid ${sel?.nf ? T.red+'88' : T.b1}`,
                    borderRadius:10,
                    display:'flex',flexDirection:'column',overflow:'hidden',
                    boxShadow:sel?.nf?`0 0 28px ${T.red}18`:'none',
                    transition:'border-color .3s,box-shadow .3s',
                }}>
                    <SecHead
                        title={sel?.nf ? 'HODISA / BUZILISH' : 'XODIM MA\'LUMOTI'}
                        color={sel?.nf ? T.red : T.cyan}
                        right={sel?.nf && (
                            <div style={{width:8,height:8,borderRadius:'50%',
                                background:T.red,boxShadow:`0 0 10px ${T.red}`,
                                animation:'blink 1s infinite'}}/>
                        )}
                    />
                    {(sel?.nf||sel?.emp)
                        ? <Detail nf={sel.nf} emp={sel.emp}/>
                        : (
                            <div style={{flex:1,display:'flex',flexDirection:'column',
                                alignItems:'center',justifyContent:'center',gap:10,opacity:.3}}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="8" r="4" stroke={T.muted} strokeWidth="1.5"/>
                                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                                <span style={{fontSize:9,color:T.muted}}>Xodimni tanlang</span>
                            </div>
                        )
                    }
                </div>
            </div>

            {/* ══════════ BOTTOM ══════════ */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1.7fr 1fr',gap:6,height:'14vh',flexShrink:0,zIndex:1}}>

                {/* ─── DONUT: Bugungi statistika ─── */}
                <div style={{
                    background:T.glass,backdropFilter:'blur(8px)',
                    border:`1px solid ${T.b1}`,borderRadius:10,
                    display:'flex',flexDirection:'column',overflow:'hidden',
                }}>
                    <SecHead title="BUGUNGI TAQSIMOT" color={T.cyan}
                        right={<span style={{fontSize:8,color:T.muted,fontFamily:'Orbitron,monospace'}}>
                            JAMI: <span style={{color:T.cyan2,fontWeight:700}}><Counter to={data.total_users}/></span>
                        </span>}
                    />
                    <div style={{flex:1,position:'relative',padding:'2px 6px 4px',minHeight:0}}>
                        <Doughnut data={pieData} options={{
                            responsive:true, maintainAspectRatio:false, cutout:'62%',
                            animation:{ duration:900 },
                            plugins:{
                                legend:{
                                    display:true, position:'right',
                                    labels:{
                                        color:T.muted, font:{size:9}, boxWidth:9, padding:6,
                                        generateLabels:(ch:any)=>{
                                            const ds = ch.data.datasets[0];
                                            return (ch.data.labels as string[]).map((l:string,i:number)=>({
                                                text:`${l}  ${(ds.data[i] as number).toLocaleString()}`,
                                                fillStyle:(ds.backgroundColor as string[])[i],
                                                index:i, datasetIndex:0, hidden:false,
                                                lineWidth:0, strokeStyle:'transparent',
                                            }));
                                        },
                                    },
                                },
                                tooltip:{
                                    enabled:true,
                                    backgroundColor:'rgba(2,10,26,0.95)',
                                    borderColor:T.b1, borderWidth:1,
                                    titleColor:T.text, bodyColor:T.muted, padding:8,
                                    callbacks:{
                                        label:(c:any)=>` ${c.label}: ${(c.parsed as number).toLocaleString()} nafar`,
                                    },
                                },
                            },
                        } as any}/>
                        {/* center label */}
                        <div style={{position:'absolute',top:'50%',left:'36%',
                            transform:'translate(-50%,-50%)',textAlign:'center',pointerEvents:'none'}}>
                            <div style={{fontSize:7,color:T.muted,letterSpacing:1,fontFamily:'Orbitron,monospace'}}>JAMI</div>
                            <div style={{fontFamily:'Orbitron,monospace',
                                fontSize:'clamp(12px,1.2vw,18px)',fontWeight:900,
                                color:T.cyan2,textShadow:`0 0 16px ${T.cyan2}77`,lineHeight:1.1}}>
                                <Counter to={data.total_users}/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── BAR: Soat bo'yicha qoidabuzarlar ─── */}
                {(()=>{
                    const HOURS = Array.from({length:14},(_,i)=>i+7);
                    const lbl   = HOURS.map(h=>String(h).padStart(2,'0')+':00');
                    const notFoundH = new Array(14).fill(0);
                    const lateH     = new Array(14).fill(0);
                    const earlyH    = new Array(14).fill(0);
                    data.not_found_persons.forEach(p=>{
                        const h = parseInt((p.formatted_date??'').split(' ')[1]?.split(':')[0]??'',10);
                        if(!isNaN(h)&&h>=7&&h<=20) notFoundH[h-7]++;
                    });
                    data.employees.filter(e=>e.is_late&&e.entry_time).forEach(e=>{
                        const h = parseInt((e.entry_time??'').split(':')[0],10);
                        if(!isNaN(h)&&h>=7&&h<=20) lateH[h-7]++;
                    });
                    data.employees.filter(e=>e.is_early_left&&e.exit_time).forEach(e=>{
                        const h = parseInt((e.exit_time??'').split(':')[0],10);
                        if(!isNaN(h)&&h>=7&&h<=20) earlyH[h-7]++;
                    });
                    const maxVal = Math.max(...notFoundH,...lateH,...earlyH,1);
                    const barData = {
                        labels: lbl,
                        datasets:[
                            {label:'Ruxsatsiz kirish', data:notFoundH, backgroundColor:`${T.red}bb`,   borderRadius:3, borderSkipped:false as const},
                            {label:'Kech keldi',        data:lateH,     backgroundColor:`${T.amber}bb`, borderRadius:3, borderSkipped:false as const},
                            {label:'Erta ketdi',        data:earlyH,    backgroundColor:`${T.gold}99`,  borderRadius:3, borderSkipped:false as const},
                        ],
                    };
                    const legendItems = [
                        {c:T.red,  l:'Ruxsatsiz'},
                        {c:T.amber,l:'Kech keldi'},
                        {c:T.gold, l:'Erta ketdi'},
                    ];
                    return (
                        <div style={{
                            background:T.glass,backdropFilter:'blur(8px)',
                            border:`1px solid ${T.b1}`,borderRadius:10,
                            display:'flex',flexDirection:'column',overflow:'hidden',
                        }}>
                            <SecHead title="SOAT BO'YICHA BUZILISHLAR" color={T.red} right={
                                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                                    {legendItems.map(({c,l})=>(
                                        <span key={l} style={{display:'flex',alignItems:'center',gap:3,fontSize:8,color:T.muted}}>
                                            <span style={{width:8,height:8,borderRadius:2,background:c,display:'inline-block',boxShadow:`0 0 4px ${c}66`}}/>
                                            {l}
                                        </span>
                                    ))}
                                </div>
                            }/>
                            <div style={{flex:1,padding:'4px 10px 6px',minHeight:0}}>
                                <Bar data={barData} options={{
                                    responsive:true, maintainAspectRatio:false,
                                    animation:{duration:900},
                                    plugins:{
                                        legend:{display:false},
                                        tooltip:{
                                            enabled:true,
                                            backgroundColor:'rgba(2,10,26,0.96)',
                                            borderColor:T.b1, borderWidth:1,
                                            titleColor:T.text, bodyColor:T.muted,
                                            padding:10, cornerRadius:6,
                                            callbacks:{
                                                title:(items:any[])=>`🕐 ${items[0].label}`,
                                                label:(c:any)=>`  ${c.dataset.label}: ${c.parsed.y} ta`,
                                            },
                                        },
                                    },
                                    scales:{
                                        x:{
                                            stacked:true,
                                            grid:{color:`rgba(255,255,255,0.04)`,lineWidth:0.5},
                                            ticks:{color:T.muted,font:{size:8}},
                                            border:{color:`${T.b0}`},
                                        },
                                        y:{
                                            stacked:true,
                                            grid:{color:`rgba(255,255,255,0.04)`,lineWidth:0.5},
                                            ticks:{color:T.muted,font:{size:8},stepSize:1},
                                            border:{color:`${T.b0}`},
                                            max:maxVal+1, min:0,
                                        },
                                    },
                                } as any}/>
                            </div>
                        </div>
                    );
                })()}

                {/* ─── EVENT LOG: Hodisalar jurnali ─── */}
                <div style={{
                    background:T.glass,backdropFilter:'blur(8px)',
                    border:`1px solid ${LOG.some(e=>e.type==='crit') ? T.red+'44' : T.b1}`,
                    borderRadius:10,
                    display:'flex',flexDirection:'column',overflow:'hidden',
                    boxShadow: LOG.some(e=>e.type==='crit') ? `0 0 18px ${T.red}10` : 'none',
                    transition:'border-color .3s,box-shadow .3s',
                }}>
                    <SecHead title="HODISALAR JURNALI" color={T.cyan} right={
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                            {LOG.filter(e=>e.type==='crit').length > 0 && (
                                <span style={{
                                    fontSize:8,fontFamily:'Orbitron,monospace',fontWeight:700,
                                    color:T.red,background:`${T.red}18`,
                                    border:`1px solid ${T.red}44`,borderRadius:4,
                                    padding:'1px 7px',animation:'blink 1.5s infinite',
                                }}>
                                    ⚠ {LOG.filter(e=>e.type==='crit').length} KRITIK
                                </span>
                            )}
                        </div>
                    }/>
                    <div style={{flex:1,overflowY:'auto'}}>
                        {LOG.length===0 ? (
                            <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',opacity:.3}}>
                                <span style={{fontSize:10,color:T.muted}}>Hodisalar yo'q</span>
                            </div>
                        ) : LOG.map((ev,i)=>{
                            const ec = ev.type==='crit'?T.red:ev.type==='warn'?T.amber:T.green;
                            const isCrit = ev.type==='crit';
                            return (
                                <div key={i}
                                    onClick={()=>{
                                        if(isCrit && data.not_found_persons[0]) setSel({nf:data.not_found_persons[0]});
                                    }}
                                    style={{
                                        display:'flex',alignItems:'flex-start',gap:8,
                                        padding:'6px 10px',
                                        borderBottom:`1px solid ${T.b0}33`,
                                        borderLeft:`2.5px solid ${ec}`,
                                        background: isCrit ? `${T.red}0a` : 'transparent',
                                        cursor: isCrit ? 'pointer' : 'default',
                                        transition:'background .15s',
                                        animation:'fadeUp .25s ease',
                                    }}
                                    onMouseEnter={e=>{ if(isCrit) e.currentTarget.style.background=`${T.red}14`; }}
                                    onMouseLeave={e=>{ if(isCrit) e.currentTarget.style.background=`${T.red}0a`; }}
                                >
                                    <div style={{
                                        width:7,height:7,borderRadius:'50%',background:ec,
                                        marginTop:3,flexShrink:0,
                                        boxShadow:`0 0 ${isCrit?10:5}px ${ec}`,
                                        animation: isCrit ? 'blink .9s infinite' : 'none',
                                    }}/>
                                    <div style={{flex:1,minWidth:0}}>
                                        <div style={{
                                            fontSize: isCrit ? 11 : 10,
                                            fontWeight: isCrit ? 700 : 600,
                                            color: isCrit ? T.red : T.text,
                                            fontFamily: isCrit ? 'Orbitron,monospace' : 'inherit',
                                            letterSpacing: isCrit ? .5 : 0,
                                        }}>{ev.line1}</div>
                                        <div style={{
                                            fontSize: isCrit ? 9.5 : 8.5,
                                            color: isCrit ? T.text : T.muted,
                                            overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                                            marginTop:1,
                                        }}>{ev.line2}</div>
                                    </div>
                                    <div style={{
                                        fontSize: isCrit ? 9 : 8,
                                        color: isCrit ? T.amber : T.dim,
                                        flexShrink:0,fontFamily:'monospace',marginTop:1,
                                        fontWeight: isCrit ? 700 : 400,
                                    }}>{ev.time}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
