import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import WidgetWrapper from '../WidgetWrapper';
import { FiUsers } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const StaffWidget: React.FC<{ index: number }> = ({ index }) => {
    const data = {
        labels: ['Ishda', 'Tashqarida', 'Masofadan', 'Ta\'tilda'],
        datasets: [
            {
                data: [132, 18, 12, 6],
                backgroundColor: ['#4ade80', '#fbbf24', '#60a5fa', '#f87171'],
                borderWidth: 0,
                cutout: '70%',
            },
        ],
    };

    return (
        <WidgetWrapper title="XODIMLAR HOLATI" icon={FiUsers} index={index}>
            <div className="fm-staff">
                <div className="fm-staff__main">
                    <div className="fm-staff__total-box">
                        <span className="fm-staff__total-label">Jami xodimlar</span>
                        <span className="fm-staff__total-val">156</span>
                    </div>
                    <div style={{ width: 70, height: 70 }}>
                        <Doughnut data={data} options={{ plugins: { legend: { display: false } } }} />
                    </div>
                </div>
                <div className="fm-staff__list">
                    <div className="fm-staff__item">
                        <div className="fm-staff__item-left">
                            <span className="dot dot-good"></span>
                            <span>Ishda</span>
                        </div>
                        <span className="fm-staff__item-val">132 (85%)</span>
                    </div>
                    <div className="fm-staff__item">
                        <div className="fm-staff__item-left">
                            <span className="dot dot-warning"></span>
                            <span>Tashqarida</span>
                        </div>
                        <span className="fm-staff__item-val">18 (12%)</span>
                    </div>
                    <div className="fm-staff__item">
                        <div className="fm-staff__item-left">
                            <span className="dot dot-normal"></span>
                            <span>Masofadan</span>
                        </div>
                        <span className="fm-staff__item-val">12 (8%)</span>
                    </div>
                    <div className="fm-staff__item">
                        <div className="fm-staff__item-left">
                            <span className="dot dot-danger"></span>
                            <span>Ta'tilda</span>
                        </div>
                        <span className="fm-staff__item-val">6 (3%)</span>
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
};

export default StaffWidget;
