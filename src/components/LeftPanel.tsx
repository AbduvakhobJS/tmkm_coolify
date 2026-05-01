import React from 'react';
import KpiCard from './KpiCard';
import {ProductionLineChart, MetalPieChart, RegionalBarChart, RealtimeChart, EnergyChart} from './Charts';
import {LineChart} from "./charts/LineChart";
import {MapChartComponent} from "./charts/MapChartComponent";
import AlertsSection from "./AlertsSection";
import ProjectsSection from "./ProjectsSection";
import GaugeRow from "./Gauge";
import Part1 from "./Part1";
import Part2 from "./Part2";


const LeftPanel: React.FC = () => {
  return (
   <div className="left-panel">
       <div className="view-model-right-model">
           <div className="view-model" style={{ width: '100%', height: '44vh',padding: "20px", background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #00f5ff33', marginTop: '10px' }}>
               <Part1 />

           </div>
       </div>
       <div className="view-model-right-model">
           <div className="view-model" style={{ width: '100%', height: '44vh',padding: "20px", background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #00f5ff33', marginTop: '10px' }}>
               <Part2 />
           </div>
       </div>
   </div>
  );
};

export default LeftPanel;
