import React from 'react';
import WidgetWrapper from '../WidgetWrapper';
import { FiZap, FiDroplet, FiWind, FiThermometer, FiGlobe } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';

const Sparkline: React.FC<{ color: string }> = ({ color }) => {
    const data = {
        labels: ['', '', '', '', '', ''],
        datasets: [{
            data: [10, 15, 8, 12, 18, 14],
            borderColor: color,
            borderWidth: 1.5,
            tension: 0.4,
            pointRadius: 0,
        }]
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } }
    };
    return <div style={{ height: 24, width: 60 }}><Line data={data} options={options} /></div>;
};

const ResourcesWidget: React.FC<{ index: number }> = ({ index }) => {
    const resources = [
        { label: 'Elektr energiya', val: '256', unit: 'kWh', pct: '+5%', color: '#fbbf24', icon: FiZap },
        { label: 'Suv sarfi', val: '3.2', unit: 'm³', pct: '-3%', color: '#60a5fa', icon: FiDroplet },
        { label: 'Gaz sarfi', val: '18.7', unit: 'm³', pct: '+2%', color: '#f87171', icon: FiWind },
        { label: 'Issiqlik', val: '42.1', unit: 'kWh', pct: '-6%', color: '#f472b6', icon: FiThermometer },
        // { label: 'Internet trafigi', val: '840', unit: 'Mb/s', pct: '+12%', color: '#4ade80', icon: FiGlobe },
    ];

    return (
        <WidgetWrapper title="RESURSLAR SARFI" icon={FiZap} extra="Bugun" index={index}>
            <div className="fm-resources">
                <div className="fm-resources__grid">
                    {resources.map((r, i) => (
                        <div key={i} className="fm-resources__item">
                            <div className="fm-resources__item-top">
                                <r.icon size={12} color={r.color} />
                                <span className="fm-resources__item-label">{r.label}</span>
                            </div>
                            <div className="fm-resources__item-main">
                                <div className="fm-resources__val-row">
                                    <span className="fm-resources__val">{r.val}</span>
                                    <span className="fm-resources__unit">{r.unit}</span>
                                    <span className={`fm-resources__pct ${r.pct.startsWith('+') ? 'text-good' : 'text-danger'}`}>{r.pct}</span>
                                </div>
                                <Sparkline color={r.color} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </WidgetWrapper>
    );
};

export default ResourcesWidget;
