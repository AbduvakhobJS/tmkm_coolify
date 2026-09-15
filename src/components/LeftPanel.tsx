import React from 'react';
import { ResourceCardsGrid } from './ResourceDashboard';
import ResourceDashboardPart2 from "./ResourceDashboardPart2";
import MetalsDashboard from "./MetalsDashboard";
import MetalsDashboardMain from "./MetalsDashboardMain";
import ExportProduct from "../Parts/ExportProduct";
import Resoursec from "./Resoursec";

const LeftPanel: React.FC = () => {
  return (
      <div className="left-panel" style={{ display: 'grid', gridTemplateRows: '1fr 1fr 1fr', height: '100%', gap: '10px' }}>
        {/*<ResourceCardsGrid />*/}
          <div style={{ height: '100%', minHeight: 0, overflow: 'auto' ,  border: '1px solid rgba(14,168,199,0.2)',  borderRadius: '12px'}}>
          <MetalsDashboardMain />
          </div>

          <div style={{ height: '100%', minHeight: 0, overflow: 'auto' ,  border: '1px solid rgba(14,168,199,0.2)',  borderRadius: '12px'}}>
          <ExportProduct />
          </div>

          <div style={{ height: '100%', minHeight: 0, overflow: 'auto' ,  border: '1px solid rgba(14,168,199,0.2)',  borderRadius: '12px'}}>
          <Resoursec />
          {/*<ResourceDashboardPart2 />*/}
          </div>
      </div>
  );
};

export default LeftPanel;
