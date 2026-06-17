import React from 'react';
import ResourceDashboard from './ResourceDashboard';

const LeftPanel: React.FC = () => {
  return (
    <div className="left-panel">
      <div style={{
        width: '100%',
        height: '90vh',
        background: 'var(--gc-panel-bg)',  // gc-panel-bg
        borderRadius: '12px',
        border: '1px solid rgba(14,168,199,0.2)',  // gc-title opacity
        marginTop: '10px',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <ResourceDashboard />
      </div>
    </div>
  );
};

export default LeftPanel;
