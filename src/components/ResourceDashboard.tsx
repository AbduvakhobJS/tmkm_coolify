import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import ResourceDashboardPart2 from './ResourceDashboardPart2';
import EnterExit from "./EnterExit";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

/* ── Constants ── */
export const MONTHS       = ['Yanvar', 'Fevral', 'Mart', 'Aprel'];
export const MONTHS_SHORT = ['Yan', 'Fev', 'Mar', 'Apr'];
export const C = {
    electric:'#0EA8C7', gas:'#ff6b35', water:'#4fc3f7', solar:'#ffd700',
    chemical:'#bf5fff', cost:'#7fff00', co2:'#ff4444', eff:'#00ff88',
    warn:'#ffaa00', ok:'#00ff88', crit:'#ff4444', info:'#4fc3f7',
    bg:'#030d22', border:'#0EA8C722', text:'#a0c4e8', muted:'#7aa5cc',
};

/* ── Chart options ── */
export const baseOpts = (leg?: 'bottom'|'right'|false) => ({
    responsive: true, maintainAspectRatio: false, animation: { duration: 900 },
    plugins: {
        legend: leg ? { display:true, position:leg as 'bottom'|'right', labels:{ color:C.muted, font:{size:9}, boxWidth:9, padding:4 } } : { display:false },
        tooltip: { enabled:true },
    },
    scales: {
        x: { grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:C.muted, font:{size:9} } },
        y: { grid:{ color:'rgba(255,255,255,0.04)' }, ticks:{ color:C.muted, font:{size:9} } },
    },
});

/* ── Styles ── */
export const panelStyle: React.CSSProperties = {
    width:'100%', height:'100%', overflowY:'auto', overflowX:'hidden',
    padding:'8px', display:'flex', flexDirection:'column', gap:'10px',
    scrollbarWidth:'thin', scrollbarColor:'#0EA8C733 transparent',
};
/* alignItems:stretch — ikkala ustun bir xil balandlikda bo'ladi */
export const twoCol: React.CSSProperties = {
    display:'grid', gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)', gap:'8px', alignItems:'stretch',
};
export const colFlex: React.CSSProperties = {
    display:'flex', flexDirection:'column', gap:'6px',
};
/* Qattiq px o'rniga flex:1 ishlatish uchun — oxirgi kartochka kengaytiradi */
export const flexWrap = (minH: number): React.CSSProperties => ({
    flex: 1, position:'relative', minHeight:`${minH}px`, width:'100%',
});
export const wrap = (h:number): React.CSSProperties => ({ height:`${h}px`, position:'relative', width:'100%' });

const cardBase = (accent?:string): React.CSSProperties => ({
    background:'rgba(0,245,255,0.03)',
    border:`1px solid ${accent ? accent+'44' : C.border}`,
    borderRadius:'8px', padding:'10px', display:'flex', flexDirection:'column', gap:'5px',
});

/* ── UI Components ── */
export const SectionHeader: React.FC<{title:string; color:string; right?:React.ReactNode}> =
    ({title, color, right}) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'4px 0 4px 10px', borderLeft:`3px solid ${color}`,
        fontSize:'12px', fontWeight:700, letterSpacing:'1.5px', color, textTransform:'uppercase' }}>
        <span>{title}</span>
        {right && <span style={{fontWeight:400, textTransform:'none'}}>{right}</span>}
    </div>
);

export const Card: React.FC<{title:string; accent?:string; extra?:React.ReactNode; children:React.ReactNode; style?:React.CSSProperties}> =
    ({title, accent, extra, children, style}) => (
    <div style={{...cardBase(accent), ...style}}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'6px' }}>
            <div style={{ fontSize:'11px', fontWeight:600, letterSpacing:'1px', color:C.muted, textTransform:'uppercase' }}>{title}</div>
            {extra && <div style={{flexShrink:0}}>{extra}</div>}
        </div>
        {children}
    </div>
);

export const KpiRow: React.FC<{value:string; unit:string; color:string; trend?:string; up?:boolean; sub?:string; right?:React.ReactNode}> =
    ({value, unit, color, trend, up, sub, right}) => (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
            <div style={{display:'flex', alignItems:'baseline', gap:'4px'}}>
                <span style={{fontSize:'26px', fontWeight:700, color, lineHeight:1.1}}>{value}</span>
                <span style={{fontSize:'13px', color:C.muted}}>{unit}</span>
            </div>
            {trend && <div style={{fontSize:'12px', color:up?C.ok:C.crit, display:'flex', alignItems:'center', gap:'3px'}}>
                <span>{up?'▲':'▼'}</span><span>{trend}</span>
            </div>}
            {sub && <div style={{fontSize:'10px', color:C.muted, marginTop:'2px'}}>{sub}</div>}
        </div>
        {right && <div style={{flexShrink:0}}>{right}</div>}
    </div>
);

export const MonthRow: React.FC<{values:(number|string)[]; color?:string; warn?:number}> =
    ({values, color, warn}) => (
    <div style={{display:'flex', justifyContent:'space-between', marginTop:'2px'}}>
        {MONTHS_SHORT.map((m,i) => (
            <div key={m} style={{textAlign:'center', flex:1}}>
                <div style={{fontSize:'11px', fontWeight:700, color: warn!==undefined&&i===warn ? C.crit : (color||C.eff)}}>{values[i]}</div>
                <div style={{fontSize:'9px', color:C.muted}}>{m}</div>
            </div>
        ))}
    </div>
);

export const badge = (color:string, text:string) => (
    <span style={{display:'inline-block', padding:'2px 6px', borderRadius:'3px',
        background:`${color}22`, border:`1px solid ${color}55`, color, fontSize:'10px', fontWeight:600}}>
        {text}
    </span>
);

export const Div: React.FC<{color:string}> = ({color}) => (
    <div style={{height:'1px', background:`${color}22`, margin:'2px 0'}} />
);

/* ── Chart helpers ── */
export const MiniLine: React.FC<{data:number[]; color:string; warnIdx?:number; refLine?:number; height?:number; fill?:boolean}> =
    ({data, color, warnIdx, refLine, height=75, fill=true}) => {
    const pts = data.map((_,i) => warnIdx!==undefined&&i===warnIdx ? C.crit : color);
    const ds:any[] = [{data, borderColor:color, backgroundColor:fill?`${color}18`:'transparent', borderWidth:1.8, pointRadius:3, pointBackgroundColor:pts, tension:0.4, fill}];
    if (refLine!==undefined) ds.push({data:data.map(()=>refLine), borderColor:'#ff444488', borderWidth:1, borderDash:[4,4], pointRadius:0, fill:false, backgroundColor:'transparent'} as any);
    return <div style={wrap(height)}><Line data={{labels:MONTHS, datasets:ds}} options={baseOpts() as any}/></div>;
};

export const MiniArea: React.FC<{data:number[]; color:string; height?:number}> =
    ({data, color, height=80}) => (
    <div style={wrap(height)}>
        <Line data={{labels:MONTHS, datasets:[{data, borderColor:color, backgroundColor:`${color}25`, borderWidth:2, pointRadius:3, tension:0.4, fill:true}]}} options={baseOpts() as any}/>
    </div>
);

export const MiniBar: React.FC<{data:number[]; color?:string; barColors?:string[]; height?:number; labels?:string[]}> =
    ({data, color=C.electric, barColors, height=80, labels}) => (
    <div style={wrap(height)}>
        <Bar data={{labels:labels||MONTHS, datasets:[{data, backgroundColor:barColors||`${color}99`, borderRadius:3, borderColor:'transparent'}]}} options={baseOpts() as any}/>
    </div>
);

export const StackedBar: React.FC<{datasets:{label:string; data:number[]; color:string}[]; height?:number; flex?:boolean}> =
    ({datasets, height=110, flex}) => (
    <div style={flex ? flexWrap(height) : wrap(height)}>
        <Bar data={{labels:MONTHS, datasets:datasets.map(d=>({label:d.label, data:d.data, backgroundColor:`${d.color}bb`, borderRadius:2, borderColor:'transparent'}))}}
            options={{...baseOpts('bottom'), scales:{
                x:{stacked:true, grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:C.muted, font:{size:9}}},
                y:{stacked:true, grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:C.muted, font:{size:9}}},
            }} as any}/>
    </div>
);

export const GroupedBar: React.FC<{datasets:{label:string; data:number[]; color:string}[]; height?:number; flex?:boolean}> =
    ({datasets, height=110, flex}) => (
    <div style={flex ? flexWrap(height) : wrap(height)}>
        <Bar data={{labels:MONTHS, datasets:datasets.map(d=>({label:d.label, data:d.data, backgroundColor:`${d.color}bb`, borderRadius:3, borderColor:'transparent'}))}}
            options={baseOpts('bottom') as any}/>
    </div>
);

export const DonutChart: React.FC<{data:number[]; labels:string[]; colors:string[]; height?:number; flex?:boolean}> =
    ({data, labels, colors, height=110, flex}) => (
    <div style={flex ? flexWrap(height) : wrap(height)}>
        <Doughnut data={{labels, datasets:[{data, backgroundColor:colors, borderColor:C.bg, borderWidth:2, hoverOffset:4}]}}
            options={{responsive:true, maintainAspectRatio:false, cutout:'65%',
                plugins:{legend:{position:'bottom', labels:{color:C.muted, font:{size:9}, boxWidth:9, padding:4}}}
            } as any}/>
    </div>
);

export const GaugeChart: React.FC<{value:number; color:string; label:string; height?:number}> =
    ({value, color, label, height=90}) => (
    <div style={{...wrap(height), display:'flex', justifyContent:'center'}}>
        <Doughnut data={{datasets:[{data:[value, 100-value], backgroundColor:[color,'rgba(255,255,255,0.07)'], borderWidth:0, circumference:180, rotation:270}]}}
            options={{responsive:true, maintainAspectRatio:false, cutout:'72%', plugins:{legend:{display:false}, tooltip:{enabled:false}}} as any}/>
        <div style={{position:'absolute', bottom:'6px', width:'100%', textAlign:'center', pointerEvents:'none'}}>
            <div style={{fontSize:'22px', fontWeight:700, color}}>{value}%</div>
            <div style={{fontSize:'10px', color:C.muted}}>{label}</div>
        </div>
    </div>
);

export const ProgressItem: React.FC<{label:string; pct:number; color:string; value:string}> =
    ({label, pct, color, value}) => {
    const over = pct>100;
    return (
        <div style={{marginBottom:'2px'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'3px'}}>
                <span style={{fontSize:'11px', color:C.text}}>{label}</span>
                <span style={{fontSize:'11px', fontWeight:600, color:over?C.crit:color}}>{value}</span>
            </div>
            <div style={{height:'6px', background:'rgba(255,255,255,0.07)', borderRadius:'3px', overflow:'hidden'}}>
                <div style={{height:'100%', width:`${Math.min(pct,100)}%`, background:over?C.crit:color, borderRadius:'3px', transition:'width 1s ease'}}/>
            </div>
            <div style={{textAlign:'right', fontSize:'9px', color:over?C.crit:C.muted, marginTop:'1px'}}>{pct}%{over&&' ⚠️ limit oshdi'}</div>
        </div>
    );
};

export const AlertList: React.FC<{items:{type:'warn'|'crit'|'ok'|'info'; text:string; time:string}[]}> =
    ({items}) => (
    <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
        {items.map((a,i) => (
            <div key={i} style={{display:'flex', alignItems:'center', gap:'6px', padding:'5px 7px', borderRadius:'4px',
                background:a.type==='crit'?'rgba(255,68,68,0.1)':a.type==='warn'?'rgba(255,170,0,0.1)':a.type==='ok'?'rgba(0,255,136,0.1)':'rgba(79,195,247,0.1)',
                borderLeft:`2px solid ${C[a.type]}`}}>
                <span style={{width:'7px', height:'7px', borderRadius:'50%', background:C[a.type], flexShrink:0}}/>
                <span style={{flex:1, fontSize:'11px', color:C.text}}>{a.text}</span>
                <span style={{fontSize:'10px', color:C.muted, flexShrink:0}}>{a.time}</span>
            </div>
        ))}
    </div>
);

export const Leaderboard: React.FC<{items:{rank:number; name:string; value:string; delta?:string; up?:boolean}[]}> =
    ({items}) => (
    <div style={{display:'flex', flexDirection:'column', gap:'3px'}}>
        {items.map(item => (
            <div key={item.rank} style={{display:'flex', alignItems:'center', gap:'6px', padding:'5px 7px', borderRadius:'4px',
                background:item.rank===1?'rgba(0,245,255,0.07)':'transparent'}}>
                <span style={{width:'18px', height:'18px', borderRadius:'50%', flexShrink:0,
                    background:item.rank<=3?[C.electric,C.solar,C.gas][item.rank-1]+'33':'rgba(255,255,255,0.05)',
                    border:`1px solid ${item.rank<=3?[C.electric,C.solar,C.gas][item.rank-1]:'#ffffff22'}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'9px', fontWeight:700,
                    color:item.rank<=3?[C.electric,C.solar,C.gas][item.rank-1]:C.muted}}>
                    {item.rank}
                </span>
                <span style={{flex:1, fontSize:'11px', color:C.text}}>{item.name}</span>
                <span style={{fontSize:'12px', fontWeight:700, color:item.rank<=3?C.eff:C.warn}}>{item.value}</span>
                {item.delta && <span style={{fontSize:'10px', color:item.up?C.ok:C.crit}}>{item.up?'▲':'▼'}{item.delta}</span>}
            </div>
        ))}
    </div>
);

export const PeakHeatmap: React.FC = () => {
    const hours = ['06','09','12','15','18','21','00','03'];
    const days  = ['Dush','Sesh','Chor','Pay','Jum'];
    const heat  = [[0.3,0.4,0.6,0.7,0.95,0.85,0.3,0.2],[0.3,0.45,0.65,0.75,0.98,0.82,0.25,0.18],[0.35,0.5,0.6,0.7,0.9,0.88,0.35,0.22],[0.28,0.42,0.58,0.68,0.92,0.80,0.28,0.2],[0.25,0.35,0.5,0.6,0.75,0.65,0.2,0.15]];
    const bg = (v:number) => v>0.85?'#ff4444bb':v>0.65?'#ff6b35bb':v>0.45?'#ffd700bb':'#0EA8C722';
    return (
        <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
            <div style={{display:'flex', gap:'2px', paddingLeft:'32px'}}>
                {hours.map(h=><div key={h} style={{flex:1, fontSize:'8px', color:C.muted, textAlign:'center'}}>{h}</div>)}
            </div>
            {heat.map((r,di) => (
                <div key={di} style={{display:'flex', gap:'2px', alignItems:'center'}}>
                    <div style={{width:'28px', fontSize:'9px', color:C.muted, flexShrink:0}}>{days[di]}</div>
                    {r.map((v,hi) => <div key={hi} style={{flex:1, height:'16px', borderRadius:'2px', background:bg(v), border:v>0.85?'1px solid #ff444466':'1px solid transparent'}} title={`${hours[hi]}:00 — ${Math.round(v*100)}%`}/>)}
                </div>
            ))}
            <div style={{display:'flex', gap:'8px', marginTop:'4px', justifyContent:'flex-end'}}>
                {[['#ff4444bb','Yuqori'],['#ff6b35bb',"O'rta"],['#ffd700bb','Normal'],['#0EA8C722','Past']].map(([c,l]) => (
                    <div key={l} style={{display:'flex', alignItems:'center', gap:'3px'}}>
                        <div style={{width:'10px', height:'10px', borderRadius:'2px', background:c}}/>
                        <span style={{fontSize:'9px', color:C.muted}}>{l}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const miniBox = (label:string, value:string, col:string) => (
    <div style={{textAlign:'center', background:`${col}11`, borderRadius:'4px', padding:'5px 2px', border:`1px solid ${col}22`}}>
        <div style={{fontSize:'13px', fontWeight:700, color:col}}>{value}</div>
        <div style={{fontSize:'9px', color:C.muted}}>{label}</div>
    </div>
);

const rightStat = (label:string, value:string, unit:string, col:string) => (
    <div style={{textAlign:'right', background:`${col}11`, borderRadius:'6px', padding:'6px 8px', border:`1px solid ${col}33`}}>
        <div style={{fontSize:'10px', color:C.muted}}>{label}</div>
        <div style={{fontSize:'18px', fontWeight:700, color:col}}>{value}</div>
        <div style={{fontSize:'10px', color:C.muted}}>{unit}</div>
    </div>
);

/* ══════════════════════════════
   ROW 1 — Elektr | Quyosh
══════════════════════════════ */
const Row1Elektr = () => (
    <div style={colFlex}>
        <SectionHeader title="Elektr Energiya" color={C.electric} right={badge(C.crit,'Bugun +9%')}/>
       <div style={{display: "flex", width: "100%", gap: "8px"}}>
           <div style={{flex: 1, minWidth: 0}}>
               <Card title="Umumiy sarf" accent={C.electric} style={{height: "100%"}}>
                   <KpiRow value="1.2" unit="GWh" color={C.electric} trend="+9% kechaga nisbatan" up={false}
                           sub="Kecha: 1.1 GWh  |  Haftalik o'rta: 1.15 GWh"
                           right={rightStat('Pik soat','380 MW','18:00–20:00',C.electric)}/>
                   <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'4px'}}>
                       {miniBox("O'rta quvvat",'290 MW',C.electric)}
                       {miniBox('Minimal','180 MW',C.muted)}
                       {miniBox('Tejam','-18 MWh',C.ok)}
                   </div>
               </Card>
           </div>
           <div style={{flex: 1, minWidth: 0}}>
               <Card title="Zavodlar bo'yicha oylik sarf (GWh)" accent={C.electric} extra={badge(C.warn,'Mart: 57 GWh')} style={{height: "100%"}}>
                   <StackedBar datasets={[
                       {label:'A+B', data:[18,16,21,19], color:C.electric},
                       {label:'C+D', data:[12,11,15,13], color:'#00ccdd'},
                       {label:'E+F', data:[10,9,12,11],  color:'#008899'},
                       {label:'G–J', data:[8,8,9,9],     color:'#005566'},
                   ]} height={110}/>
               </Card>
           </div>
       </div>

        {/* Oxirgi karta flex:1 bilan kengayadi */}
        <Card title="Oylik umumiy trend (GWh)" accent={C.electric} extra={badge(C.crit,'Mart: +25%')} style={{flex:13}}>
            <div style={flexWrap(50)}>
                <Line data={{labels:MONTHS, datasets:[{
                    data:[24,28,35,33], borderColor:C.electric, backgroundColor:`${C.electric}18`,
                    borderWidth:1.8, pointRadius:[3,3,5,3], pointBackgroundColor:[C.electric,C.electric,'#fff',C.electric],
                    tension:0.4, fill:true,
                }]}} options={baseOpts() as any}/>
            </div>
            <MonthRow values={['30','28','35 ⚠','33']} color={C.electric} warn={2}/>
        </Card>
    </div>
);

const Row1Quyosh = () => (
    <div style={colFlex}>
        <SectionHeader title="Quyosh Energiyasi" color={C.solar} right={badge(C.ok,'Oshmoqda ↑')}/>
        <div style={{display:'flex', width: "100%", gap: "8px"}}>
            <div style={{flex: 1, minWidth: 0}}>
                <Card title="Joriy ishlab chiqarish" accent={C.solar} style={{height: "100%"}}>
                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                        <div style={{flex:1, position:'relative'}}>
                            <GaugeChart value={12} color={C.solar} label="Umumiydan ulush" height={95}/>
                        </div>
                        <div style={{display:'flex', flexDirection:'column', gap:'5px', flexShrink:0, marginRight: '20px'}}>
                            {[['Ishlab chiqarildi','320 kWh',C.solar],['Quvvat','45 kW',C.solar],['Panel bloklar','10 ta',C.muted],['Foydali ish','94%',C.ok]].map(([l,v,col]) => (
                                <div key={l as string} style={{background:`${col}11`, borderRadius:'4px', padding:'3px 8px', border:`1px solid ${col}22`}}>
                                    <div style={{fontSize:'13px', fontWeight:700, color:col as string}}>{v}</div>
                                    <div style={{fontSize:'9px', color:C.muted}}>{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
            <div style={{flex: 1, minWidth: 0}}>
                <Card title="Energiya manbalari tarkibi" accent={C.electric} extra={badge(C.solar,'Solar: 20%')} style={{flex:1, height: "100%"}}>
                    <DonutChart
                        data={[70,20,10]}
                        labels={['Grid: 70%','Solar: 20%','Generator: 10%']}
                        colors={[C.electric,C.solar,C.gas]}
                        height={100} flex/>
                </Card>
            </div>
        </div>

        <Card title="Oylik quyosh ulushi (%)" style={{ height: "100%"}} accent={C.solar} extra={badge(C.ok,'5%→12% ↑')}>
            <div style={{marginTop:'10px'}}/>
            <MiniLine data={[5,7,12,10]} color={C.solar} height={80}/>
            <div style={{marginTop:'4px'}}/>
            <MonthRow values={['5%','7%','12%','10%']} color={C.solar}/>
        </Card>
        {/* Oxirgi karta flex:1 */}

    </div>
);

/* ══════════════════════════════
   ROW 2 — Gaz | Suv
══════════════════════════════ */
const Row2Gaz = () => (
    <div style={colFlex}>
        <SectionHeader title="Gaz Sarfi" color={C.gas} right={badge(C.warn,'Mart: +24%')}/>
        <div style={{display:'flex', width: "100%", gap: "8px"}}>
            <div style={{flex: 1, minWidth: 0}}>
                <Card title="Bugungi sarf" accent={C.gas}  extra={badge(C.gas,'2.4 mln m³')} style={{height: "100%"}}>
                    <KpiRow value="2.4" unit="mln m³" color={C.gas} trend="+8% o'rtachadan" up={false}
                            sub="1t po'lat = 85 m³  |  Normativ: 2.22 mln m³"
                            right={rightStat('Haddan oshiq','+180k','m³/kun',C.crit)}/>
                    <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'4px'}}>
                        {miniBox('Pechlar','1.4M m³',C.gas)}
                        {miniBox('Qozonlar','0.6M m³','#ff8844')}
                        {miniBox('Boshqa','0.4M m³',C.muted)}
                    </div>
                </Card>
            </div>
            <div style={{flex: 1, minWidth: 0}}>
                <Card title="Oylik gaz sarfi (mln m³)" accent={C.gas} extra={badge(C.warn,'Mart: pik')} style={{height: "100%"}}>
                    <MiniArea data={[2.1,2.0,2.6,2.3]} color={C.gas} height={80}/>
                    <MonthRow values={['2.1','2.0','2.6 ⚠','2.3']} color={C.gas} warn={2}/>
                </Card>
            </div>
        </div>
        {/* Oxirgi karta flex:1 */}
        <Card title="Energiya vs Gaz — korrelyatsiya (r=0.94)" accent={C.electric} extra={badge(C.warn,'r=0.94')} style={{flex:1}}>
            <div style={flexWrap(25)}>
                <Line data={{labels:MONTHS, datasets:[
                    {label:'Energiya (GWh)',     data:[25,28,27,29], borderColor:C.electric, backgroundColor:`${C.electric}12`, borderWidth:2, pointRadius:3, tension:0.4, fill:true},
                    {label:'Gaz (×10 mln m³)',   data:[21,20,26,23], borderColor:C.gas,     backgroundColor:`${C.gas}12`,     borderWidth:2, pointRadius:3, tension:0.4, fill:true},
                ]}} options={baseOpts('bottom') as any}/>
            </div>
        </Card>
    </div>
);

const Row2Suv = () => (
    <div style={colFlex}>
        <SectionHeader title="Suv Sarfi" color={C.water} right={badge(C.crit,'OGOHLANTIRISH')}/>
        <div style={{display:'flex', width: "100%", gap: "8px"}}>
            <div style={{flex: 1, minWidth: 0}}>
                <Card title="Real-vaqt monitoring" accent={C.water} extra={badge(C.crit,'+44% normadan')} style={{height: "100%"}}>
                    <KpiRow value="720" unit="m³/soat" color={C.crit} trend="+44% normadan" up={false}
                            sub="Norm: 500 m³/soat  |  Max ruxsat: 600 m³/soat"
                            right={rightStat('Utilizatsiya','72%','quvvat',C.water)}/>

                    <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'4px'}}>
                        {miniBox('Sovitish','420 m³/h',C.water)}
                        {miniBox('Texnologik','180 m³/h','#2299bb')}
                        {miniBox('Maishiy','120 m³/h',C.muted)}
                    </div>
                </Card>
            </div>
            <div style={{flex: 1, minWidth: 0}}>
                <Card title="Suv sarfi tarkibi (joriy, m³/soat)" accent={C.water} extra={badge(C.water,'720 m³/h')} style={{flex:1, height: "100%"}}>
                    <DonutChart
                        data={[420,180,120]}
                        labels={['Sovitish: 420','Texnologik: 180','Maishiy: 120']}
                        colors={[C.water,'#2299bb','#115577']}
                        height={100} flex/>
                </Card>
            </div>
        </div>

        <Card title="Oylik suv sarfi (m³ × 1000)" accent={C.water} extra={badge(C.crit,'Mart: +20%')} style={{height: "100%"}}>
            <MiniLine data={[15,14.5,18,16]} color={C.water} warnIdx={2} refLine={16} height={85}/>
            <MonthRow values={['15k','14.5k','18k ⚠','16k']} color={C.water} warn={2}/>
        </Card>
        {/* Oxirgi karta flex:1 */}

    </div>
);

/* ══════════════════════════════
   MAIN
══════════════════════════════ */
const ResourceDashboard: React.FC = () => {
    const [clock, setClock] = useState(new Date());
    useEffect(() => { const id = setInterval(()=>setClock(new Date()),1000); return ()=>clearInterval(id); }, []);
    return (
        <div style={panelStyle}>
            <div style={{
                width: "100%",
                height: "100%",
                padding: "10px",
                background: "rgb(3, 13, 34)",
                borderRadius: "12px",
                overflowY: "scroll",
                position: "relative",
                overflowX: "hidden",
                border: "1px solid rgba(14, 168, 199, 0.2)",
            }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div style={{fontSize:'13px', fontWeight:700, letterSpacing:'2px', color:C.electric}}>
                        RESURSLAR SARFI MONITORINGI
                    </div>
                    <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                        {badge(C.ok,'10 zavod online')}
                        {badge(C.crit,'3 ta kritik')}
                        <div style={{fontSize:'11px', color:C.muted}}>{clock.toLocaleTimeString('uz-UZ')}</div>
                    </div>
                </div>
                <div style={twoCol}><Row1Elektr/><Row1Quyosh/></div>
                <Div color={C.electric}/>
                <div style={twoCol}><Row2Gaz/><Row2Suv/></div>
            </div>
            <div style={{
                width: "100%",
                height: "100%",
                padding: "10px",
                background: "rgb(3, 13, 34)",
                borderRadius: "12px",
                overflowY: "scroll",
                position: "relative",
                overflowX: "hidden",
                border: "1px solid rgba(14, 168, 199, 0.2)",
            }}>
                {/*<ResourceDashboardPart2/>*/}
                <EnterExit />
            </div>
        </div>
    );
};

export default ResourceDashboard;
