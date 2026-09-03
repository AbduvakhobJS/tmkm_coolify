import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
} from 'chart.js';
import WidgetWrapper from '../WidgetWrapper';
import { FiUsers } from 'react-icons/fi';
import { GC } from '../../../../theme/palette';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

const AttendanceWidget: React.FC<{ index: number }> = ({ index }) => {
    const data = {
        labels: ['00:00', '06:00', '12:00', '18:00', '24:00'],
        datasets: [
            {
                label: 'Keldi',
                data: [40, 60, 100, 120, 80],
                borderColor: GC.green,
                tension: 0.4,
                pointRadius: 0,
            },
            {
                label: 'Ketti',
                data: [30, 45, 90, 70, 60],
                borderColor: GC.red,
                tension: 0.4,
                pointRadius: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { display: true, grid: { display: false }, ticks: { color: GC.slate, font: { size: 9 } } },
            y: { display: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: GC.slate, font: { size: 9 } } },
        },
    };

    return (
        <WidgetWrapper title="KELDI / KETDI" icon={FiUsers} extra="Bugun" index={index}>
            <div className="fm-attendance">
                <div className="fm-attendance__stats">
                    <div className="fm-attendance__stat">
                        <span className="fm-attendance__label">Keldi</span>
                        <div className="fm-attendance__value-row">
                            <span className="fm-attendance__value text-good">128</span>
                            <span className="fm-attendance__percent text-good">+12%</span>
                        </div>
                    </div>
                    <div className="fm-attendance__stat">
                        <span className="fm-attendance__label">Ketti</span>
                        <div className="fm-attendance__value-row">
                            <span className="fm-attendance__value text-danger">96</span>
                            <span className="fm-attendance__percent text-danger">-8%</span>
                        </div>
                    </div>
                </div>
                <div className="fm-widget__chart-container">
                    <Line data={data} options={options} />
                </div>
            </div>
        </WidgetWrapper>
    );
};

export default AttendanceWidget;
