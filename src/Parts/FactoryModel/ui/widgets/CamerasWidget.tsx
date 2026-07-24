import React from 'react';
import WidgetWrapper from '../WidgetWrapper';
import { FiVideo } from 'react-icons/fi';

const CamerasWidget: React.FC<{ index: number }> = ({ index }) => {
    const cams = [
        { id: '01', name: 'CAM 01' },
        { id: '02', name: 'CAM 02' },
        { id: '03', name: 'CAM 03' },
        { id: '04', name: 'CAM 04' },
    ];

    return (
        <WidgetWrapper title="KAMERALAR" icon={FiVideo} extra="Barchasi" index={index}>
            <div className="fm-cameras">
                <div className="fm-cameras__grid">
                    {cams.map((cam) => (
                        <div key={cam.id} className="fm-cameras__item">
                            <div className="fm-cameras__thumb">
                                <span className="fm-cameras__live">Live</span>
                            </div>
                            <span className="fm-cameras__name">{cam.name}</span>
                        </div>
                    ))}
                </div>
                <button className="fm-cameras__more">Barchasini ko'rish</button>
            </div>
        </WidgetWrapper>
    );
};

export default CamerasWidget;
