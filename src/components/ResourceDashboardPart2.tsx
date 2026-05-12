import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    C, MONTHS, MONTHS_SHORT, baseOpts, wrap, flexWrap, twoCol, colFlex,
    SectionHeader, Card, KpiRow, MonthRow, badge, Div,
    MiniLine, MiniBar, StackedBar, GroupedBar, DonutChart, GaugeChart,
    ProgressItem, AlertList, Leaderboard, PeakHeatmap,
} from './ResourceDashboard';

/* ══════════════════════════════════════════
   ROW 3 — Kimyoviy Moddalar | Xarajatlar
══════════════════════════════════════════ */
const Row3Kimyo = () => (
    <div style={colFlex}>
        <SectionHeader title="Kimyoviy Moddalar" color={C.chemical} right={badge(C.warn,'Mart: +30%')}/>
        <Card title="Bugungi reagentlar — haqiqiy vs norma (tonna)" accent={C.chemical} extra={badge(C.chemical,'5 ta modda')}>
            <div style={wrap(115)}>
                <Bar data={{
                    labels:['CaO','FeSi','MnO₂','Al₂O₃','SiO₂'],
                    datasets:[
                        {label:'Haqiqiy', data:[4.2,1.5,0.8,2.1,3.5], backgroundColor:`${C.chemical}bb`, borderRadius:4},
                        {label:'Norma',   data:[4.0,1.5,0.6,2.0,3.2], backgroundColor:'#ffffff33', borderRadius:4},
                    ],
                }} options={baseOpts('bottom') as any}/>
            </div>
            <div style={{display:'flex', gap:'4px', flexWrap:'wrap'}}>
                {[['CaO','+5%',true],['FeSi','±0%',true],['MnO₂','+33%',false],['Al₂O₃','+5%',true],['SiO₂','+9%',false]].map(([n,d,ok]) => (
                    <span key={n as string} style={{padding:'2px 7px', borderRadius:'3px',
                        background:(ok?C.ok:C.crit)+'22', border:`1px solid ${ok?C.ok:C.crit}44`,
                        color:ok?C.ok:C.crit, fontSize:'10px', fontWeight:600}}>
                        {n}: {d}
                    </span>
                ))}
            </div>
        </Card>
        {/* Oxirgi karta flex:1 — StackedBar flex prop bilan kengayadi */}
        <Card title="Oylik kimyo sarfi (tonna)" accent={C.chemical} extra={badge(C.warn,'Mart: 252t')} style={{flex:1}}>
            <StackedBar datasets={[
                {label:'CaO',    data:[100,95,130,110], color:C.chemical},
                {label:'FeSi',   data:[40,38,55,45],    color:'#9933ff'},
                {label:'MnO₂',  data:[20,18,27,22],    color:'#cc66ff'},
                {label:'Boshqa', data:[30,28,40,33],    color:'#6600cc'},
            ]} height={100} flex/>
            <MonthRow values={['190t','179t','252t ⚠','210t']} color={C.chemical} warn={2}/>
        </Card>
    </div>
);

const Row3Xarajat = () => (
    <div style={colFlex}>
        <SectionHeader title="Xarajatlar Tahlili" color={C.cost} right={badge(C.crit,'Mart: +38%')}/>
        <Card title="Joriy oy xarajati taqsimoti" accent={C.cost} extra={badge(C.cost,'$130k/oy')}>
            <DonutChart
                data={[45,30,10,15]}
                labels={['Elektr: 45%','Gaz: 30%','Suv: 10%','Kimyo: 15%']}
                colors={[C.electric,C.gas,C.water,C.chemical]}
                height={130}/>
        </Card>
        {/* Oxirgi karta flex:1 — GroupedBar flex prop bilan kengayadi */}
        <Card title="Oylik xarajatlar ($1000)" accent={C.cost} extra={badge(C.crit,'Mart: $130k')} style={{flex:1}}>
            <GroupedBar datasets={[
                {label:'Elektr', data:[50,45,60,55], color:C.electric},
                {label:'Gaz',    data:[30,28,40,35], color:C.gas},
                {label:'Suv',    data:[10,9,12,11],  color:C.water},
                {label:'Kimyo',  data:[15,14,18,16], color:C.chemical},
            ]} height={100} flex/>
            <MonthRow values={['$105k','$96k','$130k ⚠','$117k']} color={C.cost} warn={2}/>
        </Card>
    </div>
);

/* ══════════════════════════════════════════
   ROW 4 — Samaradorlik KPI | Reja va Nazorat (4 box)
══════════════════════════════════════════ */
const Row4Samaradorlik = () => (
    <div style={colFlex}>
        <SectionHeader title="Samaradorlik KPI" color={C.eff} right={badge(C.ok,'Joriy: 78%')}/>

        <Card title="Samaradorlik indeksi (%)" accent={C.eff} extra={badge(C.ok,'Joriy: 78%')}>
            <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                <div style={{flex:'0 0 110px', position:'relative'}}>
                    <GaugeChart value={78} color={C.eff} label="Joriy indeks" height={90}/>
                </div>
                <div style={{flex:1}}>
                    {MONTHS_SHORT.map((m,i) => {
                        const vals=[82,85,75,78];
                        return (
                            <div key={m} style={{display:'flex', gap:'6px', alignItems:'center', marginBottom:'5px'}}>
                                <span style={{fontSize:'9px', color:C.muted, width:'24px'}}>{m}</span>
                                <div style={{flex:1, height:'8px', background:'rgba(255,255,255,0.07)', borderRadius:'4px', overflow:'hidden'}}>
                                    <div style={{height:'100%', width:`${vals[i]}%`, background:i===2?C.crit:C.eff, borderRadius:'4px'}}/>
                                </div>
                                <span style={{fontSize:'11px', fontWeight:600, color:i===2?C.crit:C.eff, width:'34px', textAlign:'right'}}>{vals[i]}%</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
        <div style={{display:'flex', width: "100%", gap: "8px"}}>
            <div style={{flex: 1, minWidth: 0}}>
                <Card title="1 tonna uchun energiya (kWh/t)" accent={C.eff} extra={badge(C.ok,'Yaxshilanish ↓')} style={{height:'100%'}}>
                    <KpiRow value="620" unit="kWh/t" color={C.eff} trend="−11.4% yaxshilandi" up={true}
                            sub="Yanvar: 650 → Aprel: 620  |  Maqsad: 580 kWh/t"
                            right={<div style={{textAlign:'right', background:`${C.crit}11`, borderRadius:'6px', padding:'6px 8px', border:`1px solid ${C.crit}33`}}>
                                <div style={{fontSize:'10px', color:C.muted}}>Mart ⚠️</div>
                                <div style={{fontSize:'18px', fontWeight:700, color:C.crit}}>700 kWh/t</div>
                            </div>}/>
                    <MiniLine data={[650,630,700,620]} color={C.eff} warnIdx={2} height={65}/>
                    <MonthRow values={['650','630','700 ⚠','620']} color={C.eff} warn={2}/>
                </Card>
            </div>
            <div style={{flex: 1, minWidth: 0}}>
                <Card title="CO₂ chiqindilar (tonna/kun)" accent={C.co2} extra={badge(C.crit,'Mart: +30%')} style={{height:'100%'}}>
                    <KpiRow value="1,200" unit="t CO₂/kun" color={C.co2} trend="+30% Martda" up={false}
                            right={<div style={{textAlign:'right', background:`${C.co2}11`, borderRadius:'6px', padding:'6px 8px', border:`1px solid ${C.co2}33`}}>
                                <div style={{fontSize:'10px', color:C.muted}}>Mart ⚠️</div>
                                <div style={{fontSize:'18px', fontWeight:700, color:C.co2}}>1,300 t/kun</div>
                            </div>}/>
                    <div style={wrap(100)}>
                        <Line data={{labels:MONTHS, datasets:[{
                                data:[1000,950,1300,1100], borderColor:C.co2, backgroundColor:`${C.co2}18`,
                                borderWidth:1.8, pointRadius:[3,3,5,3], pointBackgroundColor:[C.co2,C.co2,'#fff',C.co2],
                                tension:0.4, fill:true,
                            }]}} options={baseOpts() as any}/>
                    </div>
                    <MonthRow values={['1000','950','1300 ⚠','1100']} color={C.co2} warn={2}/>
                </Card>
            </div>
        </div>

    </div>
);

const Row4Nazorat = () => (
    <div style={colFlex}>
        <SectionHeader title="Reja va Nazorat" color={C.warn} right={badge(C.crit,'Mart: limit oshdi')}/>
        {/* 2×2 grid — flex:1 bilan butun qolgan joyni egallaydi */}

        <div style={{display:'flex', flexDirection:'column', width: "100%", gap: "8px"}}>
            <Card title="Oylik byudjet nazorati" accent={C.warn} extra={badge(C.crit,'Mar: 120%')}>
                <ProgressItem label="Yanvar" pct={90}  color={C.warn} value="$105k / $117k"/>
                <ProgressItem label="Fevral" pct={85}  color={C.cost} value="$96k / $113k"/>
                <ProgressItem label="Mart ⚠️" pct={120} color={C.warn} value="$145k / $121k"/>
                <ProgressItem label="Aprel"  pct={80}  color={C.cost} value="$90k / $113k"/>
            </Card>
            <div style={{display: "flex", width: "100%", gap: "8px"}}>
                <div style={{flex: 1, minWidth: 0}}>
                    <Card title="Reja vs Fakt (GWh)" accent={C.warn} extra={badge(C.crit,'Mar +17%')} style={{height: "100%"}}>
                        <div style={wrap(105)}>
                            <Bar data={{labels:MONTHS, datasets:[
                                    {label:'Reja', data:[30,30,30,30], backgroundColor:'#ffffff33', borderRadius:3},
                                    {label:'Fakt', data:[32,30,35,33], backgroundColor:['#ff444499','#00ff8899','#ff444499','#ffaa0099'], borderRadius:3},
                                ]}} options={baseOpts('bottom') as any}/>
                        </div>
                        <MonthRow values={['+7%','±0%','+17% ⚠','+10%']} color={C.warn} warn={2}/>
                    </Card>
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                    <Card title="Normadan og'ish (%)" accent={C.co2} extra={badge(C.crit,'Mart ⚠️')} style={{height: "100%"}}>
                        <MiniBar data={[7,0,17,10]} barColors={['#ffaa0066','#00ff8866','#ff444488','#ffaa0066']} height={85}/>
                        <MonthRow values={['+7%','±0%','+17% ⚠','+10%']} color={C.warn} warn={2}/>
                    </Card>
                </div>
            </div>
        </div>
    </div>
);

/* ══════════════════════════════════════════
   ROW 5 — Uskunalar va Zavodlar | Monitoring va Prognoz
══════════════════════════════════════════ */
const Row5Uskunalar = () => (
    <div style={colFlex}>
        <SectionHeader title="Uskunalar va Zavodlar" color={C.gas} right={badge(C.crit,'Furnace #3 ⚠️')}/>
        <Card title="Furnace energiya sarfi — oylik (%)" accent={C.gas} extra={badge(C.crit,'#3: +75% Martda')}>
            <div style={wrap(130)}>
                <Line data={{labels:MONTHS, datasets:[
                    {label:'Furnace #3', data:[20,22,35,28], borderColor:C.crit, backgroundColor:'#ff444418', borderWidth:2, pointRadius:[3,3,6,3], pointBackgroundColor:[C.crit,C.crit,'#fff',C.crit], tension:0.4, fill:true},
                    {label:'Furnace #1', data:[15,14,18,16], borderColor:C.gas,  backgroundColor:'transparent', borderWidth:1.5, pointRadius:3, tension:0.4, fill:false},
                    {label:'Furnace #2', data:[12,13,14,13], borderColor:C.electric, backgroundColor:'transparent', borderWidth:1.5, pointRadius:3, tension:0.4, fill:false},
                ]}} options={baseOpts('bottom') as any}/>
            </div>
            <div style={{fontSize:'11px', color:C.muted, padding:'2px 0'}}>
                Furnace #3 Martda +75% oshgan — texnik ko'rikdan o'tkazish zarur
            </div>
        </Card>
        <Card title="Zavodlar samaradorlik reytingi" accent={C.eff} extra={badge(C.electric,'Zavod A #1')}>
            <Leaderboard items={[
                {rank:1, name:'Zavod A — Toshkent',  value:'89%', delta:'4%', up:true},
                {rank:2, name:'Zavod C — Navoiy',    value:'86%', delta:'1%', up:true},
                {rank:3, name:'Zavod E — Angren',    value:'83%', delta:'2%', up:false},
                {rank:4, name:'Zavod B — Almaliq',   value:'79%', delta:'3%', up:false},
                {rank:5, name:"Zavod D — Farg'ona",  value:'76%', delta:'5%', up:false},
            ]}/>
            <div style={{fontSize:'11px', color:C.muted, marginTop:'2px'}}>
                Mart: B va D keskin tushdi — sabab Furnace #3 ortiqcha sarfi
            </div>
        </Card>
        {/* 3-chi karta qo'shildi — Monitoring ustunidagi 3 karta bilan balandlikni tenglash */}
        <Card title="Oylik uskuna nosozliklari (ta)" accent={C.crit} extra={badge(C.crit,'Mart: 8 ta')} style={{flex:1}}>
            <div style={flexWrap(75)}>
                <Bar data={{labels:MONTHS, datasets:[
                    {label:'Furnace',  data:[2,1,4,2], backgroundColor:`${C.crit}bb`, borderRadius:3},
                    {label:'Nasoslar', data:[1,1,3,1], backgroundColor:`${C.gas}bb`,  borderRadius:3},
                    {label:'Boshqa',   data:[0,1,1,1], backgroundColor:`${C.muted}66`,borderRadius:3},
                ]}} options={baseOpts('bottom') as any}/>
            </div>
            <MonthRow values={['3 ta','3 ta','8 ta ⚠','4 ta']} color={C.crit} warn={2}/>
        </Card>
    </div>
);

const Row5Monitoring = () => (
    <div style={colFlex}>
        <SectionHeader title="Monitoring va Prognoz" color={C.crit} right={badge(C.crit,'4 ta kritik')}/>
        <Card title="Real-time ogohlantirishlar" accent={C.crit} extra={badge(C.crit,'6 ta aktiv')}>
            <AlertList items={[
                {type:'crit', text:'Suv oqimi: +44% normadan — Zavod C quvuri',    time:'14:23'},
                {type:'warn', text:'Gaz bosimi Zavod D: 92% → tushib bormoqda',    time:'13:47'},
                {type:'warn', text:'Furnace #3 — energiya sarfi +35% normadan',    time:'12:10'},
                {type:'crit', text:'Mart byudjeti: $145k — limit $121k oshdi',     time:'11:55'},
                {type:'info', text:'Quyosh paneli: kecha 15% ulush — yangi rekord',time:'11:30'},
                {type:'ok',   text:'Zavod A — barcha 12 tizim normal ishlayapti',  time:'10:05'},
            ]}/>
        </Card>
        <Card title="AI Prognoz — keyingi 4 oy (GWh)" accent={C.warn} extra={badge(C.ok,'May: −11%')}>
            <div style={wrap(110)}>
                <Line data={{
                    labels:['Yan','Fev','Mar','Apr','May*','Iyn*','Iyl*','Avg*'],
                    datasets:[
                        {label:'Haqiqiy', data:[32,30,35,33,null,null,null,null], borderColor:C.electric, backgroundColor:`${C.electric}18`, borderWidth:2, pointRadius:4, tension:0.4, fill:true, spanGaps:false} as any,
                        {label:'Prognoz', data:[null,null,null,33,31,29,30,28],  borderColor:C.warn, backgroundColor:`${C.warn}11`, borderWidth:2, pointRadius:3, tension:0.4, fill:true, spanGaps:false, borderDash:[6,4]} as any,
                    ],
                }} options={{...baseOpts('bottom'), spanGaps:true} as any}/>
            </div>
            <div style={{fontSize:'10px', color:C.muted}}>
                * Prognoz. Mart anomaliyasiz May'da −11% kutilmoqda (31 GWh)
            </div>
        </Card>
        {/* Oxirgi karta flex:1 — Uskunalar ustunining 3-chi kartasi bilan tenglashadi */}
        <Card title="Cho'qqi yuklama — haftalik (18:00–21:00 eng qimmat)" accent={C.warn} style={{flex:1}}>
            <PeakHeatmap/>
        </Card>
    </div>
);

/* ══════════════════════════════════════════
   MART XULOSASI
══════════════════════════════════════════ */
const MartSummary = () => (
    <div style={{background:'rgba(255,68,68,0.06)', border:'1px solid #ff444433', borderRadius:'8px', padding:'10px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
            <div style={{fontSize:'12px', fontWeight:700, color:C.crit, letterSpacing:'1px'}}>
                MART OYI — BARCHA RESURSLAR KESIMIDA UMUMIY XULOSALAR
            </div>
            <div style={{fontSize:'11px', color:C.muted}}>Yanvar bazasiga nisbatan o'zgarish</div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:'6px'}}>
            {[
                ['Energiya','+17%','35 GWh',    C.crit],
                ['Gaz',     '+24%','2.6 mln m³',C.crit],
                ['Suv',     '+20%','18,000 m³', C.crit],
                ['CO₂',     '+30%','1,300 t/kun',C.crit],
                ['Byudjet', '+38%','$145k',     C.crit],
                ['Downtime','+100%','20 soat',  C.warn],
                ['Kimyo',   '+30%','252 tonna', C.warn],
                ['Solar',   '+140%','12% ulush',C.ok],
            ].map(([label,pct,val,col]) => (
                <div key={label as string} style={{textAlign:'center', background:`${col}11`, border:`1px solid ${col}33`, borderRadius:'6px', padding:'7px 4px'}}>
                    <div style={{fontSize:'10px', color:C.muted, marginBottom:'2px'}}>{label}</div>
                    <div style={{fontSize:'15px', fontWeight:700, color:col as string}}>{pct}</div>
                    <div style={{fontSize:'9px', color:C.muted}}>{val}</div>
                </div>
            ))}
        </div>
    </div>
);

/* ══════════════════════════════════════════
   EXPORT
══════════════════════════════════════════ */
const ResourceDashboardPart2: React.FC = () => (
    <>
        {/*<Div color={C.gas}/>*/}

        <div style={twoCol}>
            <Row4Samaradorlik/>
            <Row4Nazorat/>
        </div>
        <div style={twoCol}>
            <Row3Kimyo/>
            <Row3Xarajat/>
        </div>
        <div style={twoCol}>
            <Row5Uskunalar/>
            <Row5Monitoring/>
        </div>

        <MartSummary/>
    </>
);

export default ResourceDashboardPart2;
