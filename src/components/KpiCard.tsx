import React from 'react';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

interface KpiCardProps {
  icon: string;
  target: number;
  decimals?: number;
  unit: string;
  label: string;
  trend: string;
  trendUp: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, target, decimals = 0, unit, label, trend, trendUp }) => {
  const value = useAnimatedCounter(target, decimals);

  return (
    <div className="kpi-card">
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-unit">{unit}</div>
      <div className="kpi-label">{label}</div>
      <div className={`kpi-trend ${trendUp ? 'up' : 'down'}`}>{trend}</div>
    </div>
  );
};

export default KpiCard;
