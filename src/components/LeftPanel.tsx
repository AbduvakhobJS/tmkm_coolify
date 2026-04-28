import React from 'react';
import KpiCard from './KpiCard';
import {ProductionLineChart, MetalPieChart, RegionalBarChart, RealtimeChart, EnergyChart} from './Charts';
import {LineChart} from "./charts/LineChart";
import {MapChartComponent} from "./charts/MapChartComponent";
import AlertsSection from "./AlertsSection";
import ProjectsSection from "./ProjectsSection";
import GaugeRow from "./Gauge";


const LeftPanel: React.FC = () => {
  return (
   <div className="left-panel">
       <div className="view-model-right-model">
           <div className="view-model" style={{ width: '100%', height: '44vh',padding: "20px", background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #00f5ff33', marginTop: '10px' }}>
             <div style={{display: "flex"}}>
                 <aside className="right-panel">
                     <div className="panel-label">SYSTEM MONITORING</div>
                     <div className="kpi-grid">
                         <KpiCard
                             icon="🏭"
                             target={2847193}
                             decimals={0}
                             unit="tonnes"
                             label="Total Output YTD"
                             trend="▲ 12.4%"
                             trendUp={true}
                         />
                         <KpiCard
                             icon="⚙️"
                             target={18}
                             decimals={0}
                             unit="active"
                             label="Operating Facilities"
                             trend="▲ 2"
                             trendUp={true}
                         />
                         <KpiCard
                             icon="📊"
                             target={94.7}
                             decimals={1}
                             unit="%"
                             label="Avg. Efficiency"
                             trend="▼ 0.3%"
                             trendUp={false}
                         />
                         <KpiCard
                             icon="👷"
                             target={34219}
                             decimals={0}
                             unit="personnel"
                             label="Active Workforce"
                             trend="▲ 847"
                             trendUp={true}
                         />
                     </div>
                     {/*<RealtimeChart />*/}
                     <EnergyChart />
                     {/*<GaugeRow />*/}
                     {/*<RealtimeChart />*/}
                     {/*<EnergyChart />*/}
                     {/*<AlertsSection />*/}
                     <ProjectsSection />
                 </aside>
               <aside className="left-panel">
                   <div className="panel-label">PRODUCTION ANALYTICS</div>
                   {/*<div className="d-flex" style={{ height: '300px', width: '100%' }}>*/}
                   {/*    <LineChart />*/}
                   {/*</div>*/}
                   {/*<div className="d-flex" style={{ height: '300px', width: '100%' }}>*/}

                   {/*    <MapChartComponent />*/}
                   {/*</div>*/}

                   <div className="kpi-grid">
                       <KpiCard
                           icon="🏭"
                           target={2847193}
                           decimals={0}
                           unit="tonnes"
                           label="Total Output YTD"
                           trend="▲ 12.4%"
                           trendUp={true}
                       />
                       <KpiCard
                           icon="⚙️"
                           target={18}
                           decimals={0}
                           unit="active"
                           label="Operating Facilities"
                           trend="▲ 2"
                           trendUp={true}
                       />
                       <KpiCard
                           icon="📊"
                           target={94.7}
                           decimals={1}
                           unit="%"
                           label="Avg. Efficiency"
                           trend="▼ 0.3%"
                           trendUp={false}
                       />
                       <KpiCard
                           icon="👷"
                           target={34219}
                           decimals={0}
                           unit="personnel"
                           label="Active Workforce"
                           trend="▲ 847"
                           trendUp={true}
                       />
                   </div>
                   <RealtimeChart />

                   {/*<ProductionLineChart />*/}
                   <MetalPieChart />
                   <RegionalBarChart />
               </aside>
             </div>
           </div>
       </div>
       <div className="view-model-right-model">
           <div className="view-model" style={{ width: '100%', height: '44vh',padding: "20px", background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #00f5ff33', marginTop: '10px' }}>
               <div style={{display: "flex"}}>
                   <aside className="right-panel">
                       <div className="panel-label">PRODUCTION ANALYTICS</div>
                       {/*<div className="d-flex" style={{ height: '300px', width: '100%' }}>*/}
                       {/*    <LineChart />*/}
                       {/*</div>*/}
                       {/*<div className="d-flex" style={{ height: '300px', width: '100%' }}>*/}

                       {/*    <MapChartComponent />*/}
                       {/*</div>*/}

                       <div className="kpi-grid">
                           <KpiCard
                               icon="🏭"
                               target={2847193}
                               decimals={0}
                               unit="tonnes"
                               label="Total Output YTD"
                               trend="▲ 12.4%"
                               trendUp={true}
                           />
                           <KpiCard
                               icon="⚙️"
                               target={18}
                               decimals={0}
                               unit="active"
                               label="Operating Facilities"
                               trend="▲ 2"
                               trendUp={true}
                           />
                           <KpiCard
                               icon="📊"
                               target={94.7}
                               decimals={1}
                               unit="%"
                               label="Avg. Efficiency"
                               trend="▼ 0.3%"
                               trendUp={false}
                           />
                           <KpiCard
                               icon="👷"
                               target={34219}
                               decimals={0}
                               unit="personnel"
                               label="Active Workforce"
                               trend="▲ 847"
                               trendUp={true}
                           />
                       </div>
                       {/*<RealtimeChart />*/}

                       {/*<ProductionLineChart />*/}
                       <RegionalBarChart />
                       {/*<MetalPieChart />*/}

                       <RegionalBarChart />

                   </aside>
               <aside className="left-panel">
                   <div className="panel-label">SYSTEM MONITORING</div>
                   <div className="kpi-grid">
                       <KpiCard
                           icon="🏭"
                           target={2847193}
                           decimals={0}
                           unit="tonnes"
                           label="Total Output YTD"
                           trend="▲ 12.4%"
                           trendUp={true}
                       />
                       <KpiCard
                           icon="⚙️"
                           target={18}
                           decimals={0}
                           unit="active"
                           label="Operating Facilities"
                           trend="▲ 2"
                           trendUp={true}
                       />
                       <KpiCard
                           icon="📊"
                           target={94.7}
                           decimals={1}
                           unit="%"
                           label="Avg. Efficiency"
                           trend="▼ 0.3%"
                           trendUp={false}
                       />
                       <KpiCard
                           icon="👷"
                           target={34219}
                           decimals={0}
                           unit="personnel"
                           label="Active Workforce"
                           trend="▲ 847"
                           trendUp={true}
                       />
                   </div>
                   <RealtimeChart />
                   <EnergyChart />
                   <GaugeRow />
                   <RealtimeChart />
                   <EnergyChart />
                   <AlertsSection />
                   <ProjectsSection />
               </aside>
               </div>
           </div>
       </div>
   </div>
  );
};

export default LeftPanel;
