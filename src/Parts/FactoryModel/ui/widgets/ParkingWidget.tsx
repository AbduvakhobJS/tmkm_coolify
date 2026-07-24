import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
} from 'chart.js';
import WidgetWrapper from '../WidgetWrapper';
import { FiTruck } from 'react-icons/fi';

ChartJS.register(ArcElement, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip);

const ParkingWidget: React.FC<{ index: number }> = ({ index }) => {
    const doughnutData = {
        labels: ['Band', 'Bo\'sh'],
        datasets: [
            {
                data: [72, 28],
                backgroundColor: ['#f87171', '#4ade80'],
                borderWidth: 0,
                cutout: '75%',
            },
        ],
    };

    const barData = {
        labels: ['00:00', '06:00', '12:00', '18:00', '24:00'],
        datasets: [
            {
                label: 'Band',
                data: [10, 25, 45, 30, 15],
                backgroundColor: '#4ade80',
                borderRadius: 2,
            },
        ],
    };

    return (
        <WidgetWrapper title="PARKING" icon={FiTruck} extra="Bugun" index={index}>
            <div className="fm-parking">
                <div className="fm-parking__top">
                    <div style={{ width: 60, height: 60, position: 'relative' }}>
                        <Doughnut data={doughnutData} options={{ plugins: { tooltip: { enabled: false }, legend: { display: false } } }} />
                        <div className="fm-parking__percentage">72%</div>
                    </div>
                    <div className="fm-parking__info">
                        <div className="fm-parking__info-item">
                            <span className="dot dot-danger"></span>
                            <span>Band</span>
                            <span className="fm-parking__info-val">14</span>
                        </div>
                        <div className="fm-parking__info-item">
                            <span className="dot dot-good"></span>
                            <span>Bo'sh</span>
                            <span className="fm-parking__info-val">36</span>
                        </div>
                    </div>
                </div>
                <div className="fm-widget__chart-container">
                    <Bar 
                        data={barData} 
                        options={{ 
                            responsive: true, 
                            maintainAspectRatio: false, 
                            plugins: { legend: { display: false } },
                            scales: {
                                x: { display: true, grid: { display: false }, ticks: { color: '#5f8496', font: { size: 8 } } },
                                y: { display: false }
                            }
                        }} 
                    />
                </div>
            </div>
        </WidgetWrapper>
    );
};

export default ParkingWidget;
