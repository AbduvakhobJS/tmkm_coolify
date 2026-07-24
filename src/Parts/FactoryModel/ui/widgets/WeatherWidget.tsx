import React from 'react';
import WidgetWrapper from '../WidgetWrapper';
import { FiSun, FiMapPin } from 'react-icons/fi';

const WeatherWidget: React.FC<{ index: number }> = ({ index }) => {
    return (
        <WidgetWrapper title="OB-HAVO" icon={FiSun} extra="Toshkent" index={index}>
            <div className="fm-weather">
                <div className="fm-weather__main">
                    <FiSun size={32} color="#fbbf24" />
                    <div className="fm-weather__temp-box">
                        <span className="fm-weather__temp">24°C</span>
                        <span className="fm-weather__desc">Quyoshli</span>
                    </div>
                </div>
                <div className="fm-weather__details">
                    <div className="fm-weather__detail">
                        <span>Namlik</span>
                        <span>45 %</span>
                    </div>
                    <div className="fm-weather__detail">
                        <span>Shamol</span>
                        <span>3.6 m/s</span>
                    </div>
                    <div className="fm-weather__detail">
                        <span>Bosim</span>
                        <span>1012 hPa</span>
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
};

export default WeatherWidget;
