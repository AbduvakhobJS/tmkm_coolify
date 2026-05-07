import React from 'react';
import ResourceDashboard from './ResourceDashboard';

const LeftPanel: React.FC = () => {
  return (
    <div className="left-panel">
      <div style={{
        width: '100%',
        height: '90vh',
        background: '#030d22',
        borderRadius: '12px',
        border: '1px solid #0EA8C733',
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
