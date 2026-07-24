import React from 'react';
import WidgetWrapper from '../WidgetWrapper';
import { FiUserCheck } from 'react-icons/fi';

const VisitorsWidget: React.FC<{ index: number }> = ({ index }) => {
    const visitors = [
        { time: '10:30', name: 'Azizbek T.', org: 'UzAuto' },
        { time: '11:00', name: 'Jahongir M.', org: 'IT Park' },
        { time: '13:30', name: 'Sarvar A.', org: 'Beeline' },
        { time: '14:20', name: 'Diyorbek R.', org: 'Korzinka' },
        { time: '15:10', name: 'Farrux B.', org: 'Epam' },
        { time: '16:45', name: 'Sanjar S.', org: 'Click' },
    ];

    return (
        <WidgetWrapper title="TASHRIF BUYURUVCHILAR" icon={FiUserCheck} extra="Bugun" index={index}>
            <div className="fm-visitors">
                <div className="fm-visitors__stats">
                    <div className="fm-visitors__stat">
                        <span className="fm-visitors__stat-label">Ro'yxatdan o'tgan</span>
                        <span className="fm-visitors__stat-val">18</span>
                    </div>
                    <div className="fm-visitors__stat">
                        <span className="fm-visitors__stat-label">Kutilayotgan</span>
                        <span className="fm-visitors__stat-val">6</span>
                    </div>
                </div>
                <div className="fm-visitors__list">
                    {visitors.map((v, i) => (
                        <div key={i} className="fm-visitors__item">
                            <span className="fm-visitors__time">{v.time}</span>
                            <span className="fm-visitors__name">{v.name}</span>
                            <span className="fm-visitors__org">{v.org}</span>
                        </div>
                    ))}
                </div>
                <button className="fm-visitors__more">Barchasini ko'rish</button>
            </div>
        </WidgetWrapper>
    );
};

export default VisitorsWidget;
