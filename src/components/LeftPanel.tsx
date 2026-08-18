import React from 'react';
import { ResourceCardsGrid } from './ResourceDashboard';
import ResourceDashboardPart2 from "./ResourceDashboardPart2";
import MetalsDashboard from "./MetalsDashboard";
import MetalsDashboardMain from "./MetalsDashboardMain";

const LeftPanel: React.FC = () => {
  return (
      <div className="left-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
        {/*<ResourceCardsGrid />*/}
          <MetalsDashboardMain />


          <div className="view-model-right-model" style={{ height: '100%' }}>
          <div className="view-model" style={{ width: '100%', height: '100%', padding: "10px", background: 'var(--gc-panel-bg)',
              borderRadius: '12px', overflow: 'hidden', position: 'relative',
              // border: '1px solid rgba(14,168,199,0.2)'
          }}
          >
            <ResourceDashboardPart2 />
          </div>
        </div>
      </div>
  );
};

export default LeftPanel;
