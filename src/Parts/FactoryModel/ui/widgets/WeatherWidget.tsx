// import React from 'react';
// import WidgetWrapper from '../WidgetWrapper';
// import { FiSun, FiMapPin } from 'react-icons/fi';
//
// const WeatherWidget: React.FC<{ index: number }> = ({ index }) => {
//     return (
//         <WidgetWrapper title="OB-HAVO" icon={FiSun} extra="Toshkent" index={index}>
//             <div className="fm-weather">
//                 <div className="fm-weather__main">
//                     <FiSun size={32} color="#fbbf24" />
//                     <div className="fm-weather__temp-box">
//                         <span className="fm-weather__temp">24°C</span>
//                         <span className="fm-weather__desc">Quyoshli</span>
//                     </div>
//                 </div>
//                 <div className="fm-weather__details">
//                     <div className="fm-weather__detail">
//                         <span>Namlik</span>
//                         <span>45 %</span>
//                     </div>
//                     <div className="fm-weather__detail">
//                         <span>Shamol</span>
//                         <span>3.6 m/s</span>
//                     </div>
//                     <div className="fm-weather__detail">
//                         <span>Bosim</span>
//                         <span>1012 hPa</span>
//                     </div>
//                 </div>
//             </div>
//         </WidgetWrapper>
//     );
// };
//
// export default WeatherWidget;

import React from 'react';
import WidgetWrapper from '../WidgetWrapper';
import { FiMapPin, FiGrid, FiHome, FiTrendingUp } from 'react-icons/fi';

const TECHNOPARK_STATS = [
    {
        label: 'Umumiy maydon',
        value: '204 000,0',
        unit: 'm²',
        icon: FiGrid,
        percent: 100,
        color: '#38bdf8',
    },
    {
        label: 'Ishlab chiqarish maydoni',
        value: '68 000,0',
        unit: 'm²',
        icon: FiHome,
        percent: 33,
        color: '#fbbf24',
    },
    {
        label: 'Infratuzilma va ko\'kalamzorlashtirish',
        value: '136 000,0',
        unit: 'm²',
        icon: FiTrendingUp,
        percent: 67,
        color: '#34d399',
    },
];

const WeatherWidget: React.FC<{ index: number }> = ({ index }) => {
    return (
        <WidgetWrapper
            title="TEXNOPARK"
            icon={FiMapPin}
            extra="«Kelajak metallari» Chirchiq"
            index={index}
        >
            <div className="fm-technopark">
                {TECHNOPARK_STATS.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div className="fm-technopark__row" key={stat.label}>
                            <div className="fm-technopark__row-head">
                                <Icon size={16} color={stat.color} />
                                <span className="fm-technopark__label">{stat.label}</span>
                            </div>
                            <div className="fm-technopark__value-row">
                                <span className="fm-technopark__value">{stat.value}</span>
                                <span className="fm-technopark__unit">{stat.unit}</span>
                            </div>
                            <div className="fm-technopark__bar">
                                <div
                                    className="fm-technopark__bar-fill"
                                    style={{
                                        width: `${stat.percent}%`,
                                        background: stat.color,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </WidgetWrapper>
    );
};

export default WeatherWidget;
