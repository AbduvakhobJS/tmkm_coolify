import React from 'react';
import { ElectricResourceCard, SolarResourceCard, GasResourceCard, WaterResourceCard } from './ResourceDashboard';
import ResourceDashboardPart2 from "./ResourceDashboardPart2";

const LeftPanel: React.FC = () => {
  return (
      <div className="left-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
        <div style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '10px',
          minHeight: 0
        }}>
          <ElectricResourceCard />
          <SolarResourceCard />
          <GasResourceCard />
          <WaterResourceCard />
        </div>

        <div className="view-model-right-model" style={{ height: '50%' }}>
          <div className="view-model" style={{ width: '100%', height: '100%', padding: "10px", background: 'var(--gc-panel-bg)', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(14,168,199,0.2)' }}>
            <ResourceDashboardPart2 />
          </div>
        </div>
      </div>
  );
};

export default LeftPanel;
