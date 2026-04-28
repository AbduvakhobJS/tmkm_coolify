import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { MONTHS, PRODUCTION_DATA, INITIAL_ENERGY_DATA } from '../data/constants';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

ChartJS.defaults.color = '#7aa5cc';
ChartJS.defaults.font.family = "'Share Tech Mono', monospace";

/* ── Production Line ── */
export const ProductionLineChart: React.FC = () => {
  const data = {
    labels: MONTHS,
    datasets: [{
      label: 'Production',
      data: [...PRODUCTION_DATA],
      borderColor: '#00f5ff',
      backgroundColor: 'rgba(0,245,255,0.15)',
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: '#00f5ff',
      pointBorderColor: '#020b18',
      tension: 0.4,
      fill: true,
    }],
  };

  return (
    <div className="chart-block">
      <div className="chart-title">MONTHLY PRODUCTION (000 t)</div>
      <div className="chart-wrap">
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 2000, easing: 'easeInOutQuart' },
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } },
              y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 9 } } },
            },
          }}
        />
      </div>
    </div>
  );
};

/* ── Metal Pie ── */
export const MetalPieChart: React.FC = () => {
  const data = {
    labels: ['Steel', 'Copper', 'Aluminum', 'Gold', 'Zinc', 'Other'],
    datasets: [{
      data: [38, 22, 18, 8, 9, 5],
      backgroundColor: ['#00f5ff','#ff6b35','#7fff00','#ffa500','#bf5fff','#3a5f85'],
      borderColor: '#020b18',
      borderWidth: 2,
      hoverOffset: 6,
    }],
  };

  return (
    <div className="chart-block">
      <div className="chart-title">METAL TYPE DISTRIBUTION</div>
      <div className="chart-wrap pie-wrap">
        <Doughnut
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            animation: { duration: 2500, easing: 'easeInOutQuart' },
            plugins: {
              legend: {
                position: 'right',
                labels: { font: { size: 9 }, boxWidth: 10, padding: 8 },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

/* ── Regional Bar ── */
export const RegionalBarChart: React.FC = () => {
  const data = {
    labels: ['Tashkent','Navoi','Almalyk','Angren','Fergana','Samarkand'],
    datasets: [{
      label: 'Output (000t)',
      data: [520, 440, 380, 290, 210, 165],
      backgroundColor: [
        'rgba(0,245,255,0.7)','rgba(0,245,255,0.55)','rgba(255,107,53,0.7)',
        'rgba(255,107,53,0.55)','rgba(127,255,0,0.7)','rgba(127,255,0,0.55)',
      ],
      borderColor: 'transparent',
      borderRadius: 3,
    }],
  };

  return (
    <div className="chart-block">
      <div className="chart-title">REGIONAL OUTPUT COMPARISON</div>
      <div className="chart-wrap">
        <Bar
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 2000, easing: 'easeInOutQuart' },
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 8 } } },
              y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 8 } } },
            },
          }}
        />
      </div>
    </div>
  );
};

/* ── Realtime Chart ── */
export const RealtimeChart: React.FC = () => {
  const dataRef = useRef<number[]>(Array.from({length: 20}, () => Math.random() * 40 + 60));
  const chartRef = useRef<ChartJS<'line'> | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const d = dataRef.current;
      d.shift();
      const last = d[d.length - 1];
      d.push(Math.max(20, Math.min(110, last + (Math.random() - 0.5) * 18)));
      if (chartRef.current) {
        chartRef.current.data.datasets[0].data = [...d];
        chartRef.current.update('none');
      }
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const data = {
    labels: dataRef.current.map(() => ''),
    datasets: [{
      data: [...dataRef.current],
      borderColor: '#00f5ff',
      backgroundColor: 'rgba(0,245,255,0.15)',
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.4,
      fill: true,
    }],
  };

  return (
    <div className="chart-block">
      <div className="chart-title">REAL-TIME THROUGHPUT</div>
      <div className="chart-wrap">
        <Line
          ref={chartRef}
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { display: false },
              y: { display: false, min: 0, max: 120 },
            },
          }}
        />
      </div>
    </div>
  );
};

/* ── Energy Chart ── */
export const EnergyChart: React.FC = () => {
  const energyData = INITIAL_ENERGY_DATA;

  const data = {
    labels: MONTHS,
    datasets: [
      {
        type: 'bar' as const,
        data: energyData,
        backgroundColor: 'rgba(255,107,53,0.65)',
        borderRadius: 2,
      },
      {
        type: 'line' as const,
        data: energyData.map(v => v * 0.85),
        borderColor: '#ffa500',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
        backgroundColor: 'transparent',
      },
    ],
  };

  return (
    <div className="chart-block">
      <div className="chart-title">ENERGY CONSUMPTION (MWh)</div>
      <div className="chart-wrap">
        <Bar
          data={data as any}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1500 },
            plugins: { legend: { display: false } },
            scales: {
              x: { display: false },
              y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 8 } } },
            },
          }}
        />
      </div>
    </div>
  );
};
