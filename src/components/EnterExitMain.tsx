import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    CategoryScale, LinearScale, LineElement, PointElement, Filler,
} from 'chart.js';
import StreamGrid from "./VideoStream";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement, Filler);

/* ─────────────────────────────────────────────────────────
   API  (TMK_API_Docs.pdf)
───────────────────────────────────────────────────────── */
const BASE    = 'https://citynet.synterra.uz';
const PHONE   = '998901234568';
const REFRESH = 20_000;

interface CardStat  { count: number; change_percent: number; percent_of_total: number; }
interface Cards     { arrived: CardStat; not_arrived: CardStat; late: CardStat; early_left: CardStat; currently_in: CardStat; left: CardStat; not_found: CardStat; }
interface NotFoundP { id: number; photo: string; formatted_date: string; turniket_name: string; door: string; door_label: string; full_name?: string; tab_number?: string; department?: string; position?: string; }
interface Employee  { id: number; full_name: string; department: string; position: string; image: string; status: string; is_late: boolean; is_early_left: boolean; entry_time: string|null; exit_time: string|null; last_log?: { door_label: string; time: string }; }
interface Dash      { date: string; total_users: number; cards: Cards; not_found_persons: NotFoundP[]; employees: Employee[]; }

/* today-tmk response (Section 7 of API docs) */
interface TodayEmp {
    id: number; full_name: string; department: string;
    entry_time: string|null; exit_time: string|null;
    image: string; status: string; is_late: boolean;
    object_id: number; object_name: string;
}

const CS0: CardStat = { count:0, change_percent:0, percent_of_total:0 };
const D0: Dash = {
    date:'', total_users:0,
    cards:{ arrived:CS0,not_arrived:CS0,late:CS0,early_left:CS0,currently_in:CS0,left:CS0,not_found:CS0 },
    not_found_persons:[], employees:[],
};

async function login(): Promise<string> {
    const r = await fetch(`${BASE}/api/login`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({phone:PHONE}),
    });
    if(!r.ok) throw new Error(`Login ${r.status}`);
    const j = await r.json();
    const t = j?.data?.token;
    if(!t) throw new Error('Token yo\'q');
    return t;
}

async function fetchDash(token:string): Promise<Dash> {
    const r = await fetch(`${BASE}/api/reports/tmk`,{headers:{Authorization:`Bearer ${token}`}});
    if(!r.ok) throw new Error(`Dash ${r.status}`);
    const j = await r.json();
    const d = j?.data ?? j ?? {};
    const c = d.cards ?? {};
    return {
        date: d.date??'', total_users: d.total_users??0,
        cards:{
            arrived:     {...CS0,...(c.arrived??{})},
            not_arrived: {...CS0,...(c.not_arrived??{})},
            late:        {...CS0,...(c.late??{})},
            early_left:  {...CS0,...(c.early_left??{})},
            currently_in:{...CS0,...(c.currently_in??{})},
            left:        {...CS0,...(c.left??{})},
            not_found:   {...CS0,...(c.not_found??{})},
        },
        not_found_persons: Array.isArray(d.not_found_persons)?d.not_found_persons:[],
        employees:         Array.isArray(d.employees)?d.employees:[],
    };
}

/* today-tmk — Section 7 */
async function fetchToday(token:string, status:'arrived'|'left'): Promise<TodayEmp[]> {
    const r = await fetch(`${BASE}/api/reports/today-tmk?status=${status}`,{
        headers:{Authorization:`Bearer ${token}`},
    });
    if(!r.ok) throw new Error(`Today ${r.status}`);
    const j = await r.json();
    const d = j?.data ?? [];
    return Array.isArray(d) ? d : [];
}

/* ─────────────────────────────────────────────────────────
   THEME  — rasmga mos ranglar
───────────────────────────────────────────────────────── */
const T = {
    bg:     'var(--gc-panel-bg)',  // gc-panel-bg (faqat to'g'ridan-to'g'ri property)
    card:   'var(--gc-card-bg)',   // gc-card-bg
    border: 'rgba(255,255,255,0.09)',
    cyan:   '#0EA8C7',  // = var(--gc-title) — template literal uchun hex kerak
    cyan2:  '#00d4ff',
    green:  '#4ade80',
    red:    '#ff2d55',  // = var(--gc-red) — template literal uchun hex kerak
    amber:  '#fbbf24',  blue:  '#60a5fa',
    purple: '#a78bfa',  muted: '#6b7a99',
    text:   'var(--gc-white)',
    dim:    '#334155',
    b0:     '#1e293b',
};

/* ─────────────────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────────────────── */
function Counter({to,dur=900}:{to:number;dur?:number}) {
    const [v,setV]=useState(0);
    useEffect(()=>{
        const s=performance.now();
        const tick=(now:number)=>{
            const p=Math.min((now-s)/dur,1);
            setV(Math.round((1-Math.pow(1-p,3))*to));
            if(p<1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    },[to,dur]);
    return <>{v.toLocaleString('ru-RU')}</>;
}

/* ─────────────────────────────────────────────────────────
   CAMERA INFO CARDS  — rasmdagidek
───────────────────────────────────────────────────────── */
const MOCK = { online:132, total:156, recording:true, alerts:3, storage:68 };

const IconCamera = ({color}:{color:string}) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M23 7l-7 5 7 5V7z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
        <rect x="1" y="5" width="15" height="14" rx="2" stroke={color} strokeWidth="1.8"/>
    </svg>
);
const IconRecord = ({color}:{color:string}) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="4" fill={color}/>
    </svg>
);
const IconShield = ({color}:{color:string}) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const IconCloud = ({color}:{color:string}) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
);

function CameraInfoCards() {
    const items = [
        {
            label: 'Kameralar onlayn',
            value: `${MOCK.online} / ${MOCK.total}`,
            color: T.green,
            icon: <IconCamera color={T.green}/>,
            extra: null,
        },
        {
            label: 'Yozuv',
            value: 'Faol',
            color: '#60a5fa',
            icon: <IconRecord color={T.red}/>,
            extra: null,
            // extra: <span style={{width:7,height:7,borderRadius:'50%',background:T.red,display:'inline-block',marginRight:5,boxShadow:`0 0 6px ${T.red}`,animation:'blink .9s infinite',flexShrink:0}} />,
        },
        {
            label: 'Xavfli hodisalar',
            value: String(MOCK.alerts),
            color: MOCK.alerts > 0 ? T.red : T.green,
            icon: <IconShield color={MOCK.alerts>0 ? T.red : T.green}/>,
            extra: null,
        },
        {
            label: 'Xotira',
            value: `${MOCK.storage}%`,
            color: T.blue,
            icon: <IconCloud color={T.blue}/>,
            extra: null,
            bar: null,
        },
    ] as const;

    return (
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,flexShrink:0}}>
            {items.map((item)=>(
                <div key={item.label} style={{
                    background: T.card,
                    border: `1px solid ${T.border}`,
                    borderRadius:10, padding:'10px 12px',
                    display:'flex', alignItems:'center', gap:10,
                }}>
                    {/* icon box */}

                    {/* text */}
                    <div style={{minWidth:0, flex:1}}>
                        <div style={{fontSize:10,color:T.muted,marginBottom:3,letterSpacing:0.2}}>{item.label}</div>
                        <div style={{display:'flex',alignItems:'center', justifyContent:'space-between'}}>
                            {'extra' in item && item.extra}
                            <span style={{fontSize:16,fontWeight:700,color:'#fff',lineHeight:1}}>{item.value}</span>
                            <div style={{
                                width:38, height:38, borderRadius:9, flexShrink:0,
                                // background:`${item.color}18`,
                                // border:`1px solid ${item.color}30`,

                                display:'flex', alignItems:'center', justifyContent:'center',
                            }}>
                                {item.icon}
                            </div>
                        </div>
                        {/*{'bar' in item && item.bar !== undefined && (*/}
                        {/*    <div style={{height:3,borderRadius:2,background:'rgba(255,255,255,0.08)',marginTop:5}}>*/}
                        {/*        <div style={{height:'100%',width:`${item.bar}%`,background:`linear-gradient(90deg,${T.blue}88,${T.blue})`,borderRadius:2,transition:'width 1s ease'}}/>*/}
                        {/*    </div>*/}
                        {/*)}*/}
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   TOP STAT CARD  — 4 ta chap panel yuqorida
───────────────────────────────────────────────────────── */
function TopCard({label,count,change,icon,accent}:{
    label:string; count:number; change:number; icon:React.ReactNode; accent:string;
}) {
    const up = change >= 0;
    const isAlert = accent === T.red;
    return (
        <div style={{
            background: T.card,
            border:`1px solid ${isAlert?T.red+'44':T.border}`,
            borderRadius:10, padding:'11px 14px',
            display:'flex', flexDirection:'column', gap:4,
            boxShadow: isAlert ? `0 0 18px ${T.red}18` : 'none',
            animation: isAlert ? 'alertPulse 2s ease-in-out infinite' : 'none',
        }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <span style={{fontSize:11,color:T.muted,letterSpacing:0.2,lineHeight:1.3}}>{label}</span>
            </div>
            <div style={{fontSize:24,fontWeight:700,color:'#fff',lineHeight:1.1, display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 5}}>
                <Counter to={count}/>
                <div style={{color:accent,opacity:0.7}}>{icon}</div>

            </div>
            <div style={{display:'flex',alignItems:'center',gap:5, justifyContent:'space-between'}}>
                <span style={{
                    fontSize:10,fontWeight:600,
                    color: up ? T.green : T.red,
                    background: up ? `${T.green}14` : `${T.red}14`,
                    border:`1px solid ${up?T.green:T.red}30`,
                    borderRadius:4, padding:'1px 7px',
                }}>
                    {up?'↑':'↓'} {Math.abs(change).toFixed(1)}%
                </span>
                {/*<span style={{fontSize:10,color:T.muted}}>bugun</span>*/}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   EVENT ROW — faqat kelgan/ketgan
───────────────────────────────────────────────────────── */
function EventRow({type,time,person,location,onClick}:{
    type:'arrived'|'left'; time:string; person:string; location:string; onClick?:()=>void;
}) {
    const isArrived = type === 'arrived';
    const dotColor  = isArrived ? T.green : T.muted;
    const ArrowIcon = isArrived
        ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><polyline points="5 12 19 12" stroke={dotColor} strokeWidth="2" strokeLinecap="round"/><polyline points="13 6 19 12 13 18" stroke={dotColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><polyline points="19 12 5 12" stroke={dotColor} strokeWidth="2" strokeLinecap="round"/><polyline points="11 6 5 12 11 18" stroke={dotColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    return (
        <div onClick={onClick} style={{
            display:'grid', gridTemplateColumns:'28px 50px 1fr auto',
            alignItems:'center', gap:8, padding:'7px 12px',
            borderBottom:`1px solid rgba(255,255,255,0.05)`,
            cursor: onClick?'pointer':'default', transition:'background .12s',
        }}
        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{
                width:26, height:26, borderRadius:'50%',
                background:`${dotColor}15`, border:`1.5px solid ${dotColor}44`,
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
                {ArrowIcon}
            </div>
            <span style={{fontSize:10,color:T.muted,fontVariantNumeric:'tabular-nums'}}>{time??'—'}</span>
            <div style={{minWidth:0}}>
                <div style={{fontSize:11,fontWeight:600,color:T.text,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{person}</div>
                <div style={{fontSize:9,color:T.muted,marginTop:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{location||'—'}</div>
            </div>
            <span style={{
                fontSize:9, fontWeight:600,
                color: isArrived ? T.green : T.muted,
                background: isArrived ? `${T.green}14` : `${T.muted}14`,
                border:`1px solid ${isArrived?T.green:T.muted}28`,
                borderRadius:5, padding:'2px 8px', whiteSpace:'nowrap', flexShrink:0,
            }}>
                {isArrived ? 'Keldi' : 'Ketdi'}
            </span>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   PANEL WRAPPERS
───────────────────────────────────────────────────────── */
function Panel({children,style}:{children:React.ReactNode;style?:React.CSSProperties}) {
    return (
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,display:'flex',flexDirection:'column',overflow:'hidden',...style}}>
            {children}
        </div>
    );
}
function PanelHead({title,icon,right}:{title:string;icon?:React.ReactNode;right?:React.ReactNode}) {
    return (
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',borderBottom:`1px solid rgba(255,255,255,0.07)`,flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:7}}>
                {icon&&<span style={{color:T.cyan,opacity:.7,display:'flex'}}>{icon}</span>}
                <span style={{fontSize:10,fontWeight:700, letterSpacing:1.2,textTransform:'uppercase'}} className="kpi-card-my-main-title">{title}</span>
            </div>
            {right&&<div style={{display:'flex',alignItems:'center',gap:6}}>{right}</div>}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   AUTO-SCALE: komponent ota konteynerni HAR DOIM width:100%,
   height:100% to'liq to'ldiradi — X va Y alohida scale qilinadi
   (scaleX = w/BASE_W, scaleY = h/BASE_H), shuning uchun yon
   tomonlarda bo'sh joy qolmaydi.
───────────────────────────────────────────────────────── */
const BASE_W = 1280;
const BASE_H = 720;

function useAutoScale(baseW: number, baseH: number) {
    const hostRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState({ x: 1, y: 1 });

    useEffect(() => {
        const el = hostRef.current;
        if (!el) return;
        const update = () => {
            const { width, height } = el.getBoundingClientRect();
            if (width === 0 || height === 0) return;
            setScale({ x: width / baseW, y: height / baseH });
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        window.addEventListener('resize', update);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', update);
        };
    }, [baseW, baseH]);

    return { hostRef, scale };
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
export default function EnterExitMain() {
    const { hostRef, scale } = useAutoScale(BASE_W, BASE_H);
    const [data,        setData]        = useState<Dash>(D0);
    const [loading,     setLoading]     = useState(true);
    const [wsOk,        setWsOk]        = useState(false);
    const [arrivedList, setArrivedList] = useState<TodayEmp[]>([]);
    const [leftList,    setLeftList]    = useState<TodayEmp[]>([]);
    const tokenRef = useRef('');
    const wsRef    = useRef<WebSocket|null>(null);

    const applyDash = useCallback((d:Dash)=>{ setData(d); },[]);

    const load = useCallback(async()=>{
        try {
            if(!tokenRef.current) tokenRef.current = await login();
            const [dash, arr, lft] = await Promise.all([
                fetchDash(tokenRef.current),
                fetchToday(tokenRef.current,'arrived'),
                fetchToday(tokenRef.current,'left'),
            ]);
            applyDash(dash);
            setArrivedList(arr);
            setLeftList(lft);
        } catch(e:any) {
            if(String(e?.message).includes('401')||String(e?.message).includes('403')) tokenRef.current='';
        } finally { setLoading(false); }
    },[applyDash]);

    useEffect(()=>{
        let alive=true;
        const connect=async()=>{
            if(!alive) return;
            try {
                if(!tokenRef.current) tokenRef.current=await login();
                const ws=new WebSocket(`wss://citynet.synterra.uz/ws?token=${tokenRef.current}`);
                wsRef.current=ws;
                ws.onopen   =()=>setWsOk(true);
                ws.onclose  =()=>{ setWsOk(false); if(alive) setTimeout(connect,5000); };
                ws.onerror  =()=>ws.close();
                ws.onmessage=()=>{ load(); };
            } catch { if(alive) setTimeout(connect,8000); }
        };
        connect();
        return()=>{ alive=false; wsRef.current?.close(); };
    },[load]);

    useEffect(()=>{
        load();
        const id=setInterval(()=>{ if(!wsRef.current||wsRef.current.readyState!==WebSocket.OPEN) load(); },REFRESH);
        return()=>clearInterval(id);
    },[load]);

    const cards = data.cards;

    /* ── Events: faqat kelgan + ketgan (today-tmk dan) ── */
    const EVENTS = [
        ...arrivedList.slice(0,8).map(e=>({ type:'arrived' as const, time:e.entry_time??'—', person:e.full_name, location:e.object_name||e.department })),
        ...leftList.slice(0,6).map(e=>({ type:'left' as const, time:e.exit_time??'—', person:e.full_name, location:e.object_name||e.department })),
    ].sort((a,b)=>{ const ta=a.time.replace(':',''),tb=b.time.replace(':',''); return tb.localeCompare(ta); });

    /* ── Donut ── */
    const donutTotal = (cards.arrived.count + cards.late.count + cards.not_arrived.count + cards.left.count + cards.not_found.count) || 1;
    const donutData = {
        labels:['Keldi','Kech keldi','Kelmadi','Ketdi','Aniqlanmagan'],
        datasets:[{
            data:[cards.arrived.count,cards.late.count,cards.not_arrived.count,cards.left.count,cards.not_found.count],
            backgroundColor:[`${T.green}cc`,`${T.amber}cc`,`${T.blue}cc`,`${T.muted}cc`,`${T.red}cc`],
            borderColor:'#0d1117', borderWidth:2,
        }],
    };

    /* ── Hourly line chart ── */
    const hourly=new Array(24).fill(0);
    data.employees.forEach(e=>{ if(e.entry_time){ const h=parseInt(e.entry_time.split(':')[0],10); if(!isNaN(h)&&h<24) hourly[h]++; } });
    const lineData={
        labels: Array.from({length:24},(_,i)=>i%4===0?String(i).padStart(2,'0')+':00':''),
        datasets:[{ data:hourly, borderColor:T.cyan2, backgroundColor:`${T.cyan2}12`, borderWidth:1.5, pointRadius:0, fill:true, tension:0.4 }],
    };

    /* ── Zone bars ── */
    const deptMap:Record<string,number>={};
    data.employees.forEach(e=>{ const k=e.department||'Boshqa'; deptMap[k]=(deptMap[k]||0)+1; });
    const zones=Object.entries(deptMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const zoneMax=zones[0]?.[1]||1;
    const ZONE_COLS=[T.blue,T.cyan2,'#34d399',T.amber,T.muted];

    /* ── Device type cards ── */
    const devItems=[
        {label:'Keldi',     count:cards.arrived.count,     color:T.green,
         icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>},
        {label:'Kech keldi',count:cards.late.count,        color:T.amber,
         icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>},
        {label:'Ketdi',     count:cards.left.count,        color:T.muted,
         icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M10 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 12H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>},
        {label:'Topilmagan',count:cards.not_found.count,   color:T.red,
         icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.8"/><path d="M12 9v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>},
    ];

    return (
        <div ref={hostRef} style={{ width:'100%', height:'100%', overflow:'hidden', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ width:BASE_W, height:BASE_H, flexShrink:0, transform:`scale(${scale.x}, ${scale.y})`, transformOrigin:'center center' }}>
        <div style={{
            width:'100%',
            height:'100%',
            fontFamily:"'Exo 2','Inter','Segoe UI',system-ui,sans-serif",
            // display:'grid',
            gridTemplateColumns:'1.35fr 1fr',
            gridTemplateRows:'100%',
            gap:6,
            padding:'6px 8px',
            overflow:'hidden',
            position:'relative',
            color:T.text,
            fontSize:13,
            boxSizing:'border-box',
        }}>
            <style>{`
                @keyframes alertPulse{0%,100%{box-shadow:0 0 8px ${T.red}22}50%{box-shadow:0 0 20px ${T.red}55}}
                @keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}
                ::-webkit-scrollbar{width:3px}
                ::-webkit-scrollbar-track{background:transparent}
                ::-webkit-scrollbar-thumb{background:${T.b0};border-radius:2px}
            `}</style>

            {/* ══ CHAP: KIRISH-CHIQISH NAZORAT TIZIMI ══ */}
            <div style={{
                display:'grid',
                gridTemplateRows:'auto auto 1fr auto',
                gap:6,
                minHeight:0,
                overflow:'hidden',
            }}>

                {/* Sarlavha */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:9}}>
                        <div style={{width:30,height:30,background:`${T.cyan}15`,border:`1px solid ${T.cyan}35`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="11" width="18" height="11" rx="2" stroke={T.cyan} strokeWidth="1.8"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={T.cyan} strokeWidth="1.8" strokeLinecap="round"/>
                                <circle cx="12" cy="16.5" r="1.5" fill={T.cyan}/>
                            </svg>
                        </div>
                        <span style={{fontSize:11,fontWeight:700, letterSpacing:1.4,textTransform:'uppercase'}} className="kpi-card-my-main-title">
                            XAVFSIZLIK NAZORAT MARKAZI
                        </span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.05)',border:`1px solid ${T.border}`,borderRadius:7,padding:'4px 10px'}}>
                            <div style={{width:6,height:6,borderRadius:'50%',background:wsOk?T.green:T.amber,boxShadow:`0 0 6px ${wsOk?T.green:T.amber}`,animation:'blink 1.2s infinite'}}/>
                            <span style={{fontSize:10,color:T.muted,letterSpacing:.5}}>{wsOk?'Jonli':'Ulanmoqda'}</span>
                        </div>
                        {cards.not_found.count>0&&(
                            <div style={{display:'flex',alignItems:'center',gap:5,background:`${T.red}14`,border:`1px solid ${T.red}40`,borderRadius:7,padding:'4px 10px',animation:'alertPulse 2s ease-in-out infinite'}}>
                                <div style={{width:6,height:6,borderRadius:'50%',background:T.red,animation:'blink .7s infinite'}}/>
                                <span style={{fontSize:10,color:T.red,fontWeight:600}}>⚠ {cards.not_found.count} hodisa</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4 ta yuqori kartochkalar */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,flexShrink:0}}>
                    <TopCard label="Jami xodimlar"       count={data.total_users}          change={0}                               accent={T.cyan2}
                        icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.7"/><path d="M2 20c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="18" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.6"/><path d="M20 20c0-2.5-1.8-4.5-4-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>}
                    />
                    <TopCard label="Hhozir ofisda" count={cards.currently_in.count}  change={cards.currently_in.change_percent}  accent={T.blue}
                        icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.7"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="12" cy="16.5" r="1.5" fill="currentColor"/></svg>}
                    />
                    <TopCard label="Bugun kelganlar"     count={cards.arrived.count}        change={cards.arrived.change_percent}       accent={T.green}
                        icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>}
                    />
                    <TopCard label="Aniqlanmagan"        count={cards.not_found.count}      change={cards.not_found.change_percent}     accent={cards.not_found.count>0?T.red:T.amber}
                        icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.7"/><path d="M12 9v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>}
                    />
                </div>

                {/* O'rta: 2 ustun */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,minHeight:0,overflow:'hidden'}}>

                    {/* So'nggi kirish hodisalari — faqat kelgan + ketgan */}
                    <Panel style={{minHeight:0,overflow:'hidden'}}>
                        <PanelHead
                            title="So'nggi kirish hodisalari"
                            icon={<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>}
                            right={<span style={{fontSize:9,color:T.muted}}>{EVENTS.length} ta yozuv</span>}
                        />
                        <div style={{display:'grid',gridTemplateColumns:'28px 50px 1fr auto',gap:8,padding:'4px 12px',borderBottom:`1px solid rgba(255,255,255,0.05)`,flexShrink:0}}>
                            {['','Vaqt','Xodim / Ob\'yekt','Holat'].map((h,i)=>(
                                <span key={i} style={{fontSize:9,color:T.dim,textTransform:'uppercase',letterSpacing:.7}}>{h}</span>
                            ))}
                        </div>
                        <div style={{flex:1,overflowY:'auto'}}>
                            {loading&&EVENTS.length===0?(
                                <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',opacity:.3}}>
                                    <span style={{fontSize:10,color:T.muted}}>Yuklanmoqda…</span>
                                </div>
                            ):EVENTS.length===0?(
                                <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',opacity:.3}}>
                                    <span style={{fontSize:10,color:T.muted}}>Ma'lumot yo'q</span>
                                </div>
                            ):EVENTS?.slice(0, 6)?.map((ev,i)=>(
                                <EventRow key={i} type={ev.type} time={ev.time} person={ev.person} location={ev.location}/>
                            ))}
                        </div>
                    </Panel>

                    {/* O'ng: Donut + Qurilmalar */}
                    <div style={{display:'flex',flexDirection:'column',gap:6,minHeight:0,overflow:'auto'}}>

                        {/* Donut — chap: pie chart, o'ng: labellar column */}
                        <Panel style={{flex:1,minHeight:140,display:'flex',flexDirection:'column'}}>
                            <PanelHead
                                title="Kirish nuqtalari holati"
                                right={<span style={{fontSize:10,color:T.muted}}>Jami: <span style={{color:'#fff',fontWeight:600}}><Counter to={data.total_users}/></span></span>}
                            />

                            {/* Body: chap — donut, o'ng — labellar */}
                            <div style={{flex:1,display:'flex',flexDirection:'row',minHeight:0,padding:'6px 8px 8px',gap:8}}>

                                {/* CHAP: Donut canvas — square */}
                                <div style={{position:'relative',flexShrink:0,width:'55%',minHeight:0}}>
                                    <Doughnut data={donutData} options={{
                                        responsive:true, maintainAspectRatio:false, cutout:'62%',
                                        animation:{duration:800},
                                        plugins:{
                                            legend:{ display:false },
                                            tooltip:{
                                                enabled:true,
                                                backgroundColor:'rgba(13,17,23,0.96)',
                                                borderColor:T.b0,borderWidth:1,
                                                titleColor:T.text,bodyColor:T.muted,padding:9,
                                                callbacks:{label:(c:any)=>` ${c.label}: ${(c.parsed as number).toLocaleString('ru-RU')} nafar`},
                                            },
                                        },
                                    } as any}/>
                                    {/* Jami son — donut o'rtasida */}
                                    <div style={{
                                        position:'absolute',top:'50%',left:'50%',
                                        transform:'translate(-50%,-50%)',
                                        textAlign:'center',pointerEvents:'none',
                                    }}>
                                        <div style={{fontSize:8,color:'#64748b',letterSpacing:.5,marginBottom:2}}>JAMI</div>
                                        <div style={{fontSize:16,fontWeight:700,color:'#ffffff',lineHeight:1}}>
                                            <Counter to={data.total_users}/>
                                        </div>
                                    </div>
                                </div>

                                {/* O'NG: labellar — column */}
                                <div style={{
                                    flex:1,display:'flex',flexDirection:'column',
                                    justifyContent:'center',gap:7,minWidth:0,
                                }}>
                                    {donutData.labels.map((lbl,i)=>{
                                        const cnt  = donutData.datasets[0].data[i];
                                        const bg   = (donutData.datasets[0].backgroundColor as string[])[i];
                                        const tot  = (donutData.datasets[0].data as number[]).reduce((a,b)=>a+b,0)||1;
                                        const pct  = Math.round(cnt/tot*100);
                                        return (
                                            <div key={lbl as string} style={{display:'flex',alignItems:'center',gap:7,minWidth:0}}>
                                                {/* rang belgisi */}
                                                <div style={{width:8,height:8,borderRadius:2,background:bg,flexShrink:0}}/>
                                                {/* label + son */}
                                                <div style={{flex:1,minWidth:0}}>
                                                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:4}}>
                                                        <span style={{fontSize:9,color:'#e2e8f0',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                                                            {lbl as string}
                                                        </span>
                                                        <span style={{fontSize:9,color:'#94a3b8',flexShrink:0,fontVariantNumeric:'tabular-nums'}}>
                                                            {cnt.toLocaleString('ru-RU')}
                                                        </span>
                                                    </div>
                                                    {/* mini progress bar */}
                                                    <div style={{height:2,borderRadius:2,background:'rgba(255,255,255,0.07)',marginTop:2}}>
                                                        <div style={{height:'100%',width:`${pct}%`,borderRadius:2,background:bg,transition:'width 1s ease'}}/>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Panel>

                        {/* Qurilma turlari */}
                        <Panel style={{flexShrink:0}}>
                            <PanelHead title="Qurilma turlari"/>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:4,padding:'8px 10px'}}>
                                {devItems.map(({label,count,color,icon})=>(
                                    <div key={label} style={{
                                        display:'flex',flexDirection:'column',alignItems:'center',gap:5,
                                        padding:'8px 4px',background:'rgba(255,255,255,0.03)',
                                        border:`1px solid ${color}20`,borderRadius:9,
                                    }}>
                                        <div style={{color,opacity:.8}}>{icon}</div>
                                        <div style={{fontSize:16,fontWeight:700,color,lineHeight:1}}>
                                            <Counter to={count}/>
                                        </div>
                                        <div style={{fontSize:9,color:T.muted,textAlign:'center'}}>{label}</div>
                                    </div>
                                ))}
                            </div>
                        </Panel>
                    </div>
                </div>

                {/* Pastki: 2 grafik */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,minHeight:120,maxHeight:160,overflow:'hidden'}}>

                    {/* Chiziqli grafik */}
                    <Panel>
                        <PanelHead title="Kirish faolligi (bugun)"
                            right={<span style={{fontSize:9,color:T.muted}}>soat bo'yicha</span>}
                        />
                        <div style={{flex:1,padding:'4px 10px 8px',minHeight:0}}>
                            <Line data={lineData} options={{
                                responsive:true,maintainAspectRatio:false,animation:{duration:700},
                                plugins:{legend:{display:false},tooltip:{
                                    enabled:true,
                                    backgroundColor:'rgba(13,17,23,0.96)',
                                    borderColor:T.b0,borderWidth:1,
                                    titleColor:T.text,bodyColor:T.muted,padding:9,
                                    callbacks:{label:(c:any)=>` Kirish: ${c.parsed.y} ta`},
                                }},
                                scales:{
                                    x:{grid:{color:'rgba(255,255,255,0.04)',lineWidth:.5},ticks:{color:T.muted,font:{size:9,family:"'Exo 2',system-ui,sans-serif"}},border:{color:T.b0}},
                                    y:{grid:{color:'rgba(255,255,255,0.04)',lineWidth:.5},ticks:{color:T.muted,font:{size:9,family:"'Exo 2',system-ui,sans-serif"},stepSize:1},border:{color:T.b0},min:0},
                                },
                            } as any}/>
                        </div>
                    </Panel>

                    {/* Zonalar */}
                    <Panel>
                        <PanelHead title="Zonalar bo'yicha taqsimot"
                            right={<span style={{fontSize:9,color:T.muted}}>bo'limlar</span>}
                        />
                        <div style={{flex:1,overflowY:'auto',padding:'7px 14px 10px',display:'flex',flexDirection:'column',gap:6}}>
                            {zones.length===0?(
                                <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',opacity:.3}}>
                                    <span style={{fontSize:10,color:T.muted}}>Ma'lumot yo'q</span>
                                </div>
                            ):zones.map(([dept,cnt],i)=>{
                                const col=ZONE_COLS[i%ZONE_COLS.length];
                                const pct=Math.round(cnt/(data.employees.length||1)*100);
                                return (
                                    <div key={dept}>
                                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                                            <span style={{fontSize:10,color:T.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'60%'}}>{dept}</span>
                                            <span style={{fontSize:10,color:col,fontWeight:600,flexShrink:0}}>{cnt.toLocaleString('ru-RU')} <span style={{color:T.muted,fontWeight:400}}>({pct}%)</span></span>
                                        </div>
                                        <div style={{height:4,borderRadius:3,background:'rgba(255,255,255,0.07)'}}>
                                            <div style={{height:'100%',width:`${(cnt/zoneMax)*100}%`,background:`linear-gradient(90deg,${col}77,${col})`,borderRadius:3,transition:'width 1s ease'}}/>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Panel>
                </div>
            </div>
        </div>
        </div>
        </div>
    );
}
