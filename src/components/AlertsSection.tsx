import React, { useState, useEffect, useRef } from 'react';
import { Alert, AlertType } from '../types';
import { ALERT_POOL } from '../data/constants';

const ICONS: Record<AlertType, string> = { warn: '⚠', info: '●', ok: '✓', crit: '✖' };

const AlertsSection: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const idxRef = useRef(0);

  const addAlert = () => {
    const a = ALERT_POOL[idxRef.current % ALERT_POOL.length];
    idxRef.current++;
    const now = new Date();
    const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setAlerts(prev => [{
      ...a,
      time: t,
      id: Date.now(),
    }, ...prev].slice(0, 4));
  };

  useEffect(() => {
    addAlert(); addAlert(); addAlert();
    const id = setInterval(addAlert, 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="alerts-section">
      <div className="chart-title">OPERATIONAL ALERTS</div>
      <div className="alerts-list">
        {alerts.map(a => (
          <div key={a.id} className={`alert-item ${a.type}`}>
            <span className="alert-dot">{ICONS[a.type]}</span>
            <span className="alert-text">{a.text}</span>
            <span className="alert-time">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsSection;
