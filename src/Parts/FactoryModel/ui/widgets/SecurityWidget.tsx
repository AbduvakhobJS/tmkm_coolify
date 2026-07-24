import React from 'react';
import WidgetWrapper from '../WidgetWrapper';
import { FiShield, FiAlertTriangle, FiSearch } from 'react-icons/fi';

const SecurityWidget: React.FC<{ index: number }> = ({ index }) => {
    return (
        <WidgetWrapper title="XAVFSIZLIK" icon={FiShield} extra="Bugun" index={index}>
            <div className="fm-security">
                <div className="fm-security__grid">
                    <div className="fm-security__item">
                        <div className="fm-security__icon-box bg-normal">
                            <FiShield size={14} />
                        </div>
                        <div className="fm-security__info">
                            <span className="fm-security__label">Hodisalar</span>
                            <div className="fm-security__val-row">
                                <span className="fm-security__val">2</span>
                                <span className="fm-security__pct text-good">-20%</span>
                            </div>
                        </div>
                    </div>
                    <div className="fm-security__item">
                        <div className="fm-security__icon-box bg-warning">
                            <FiAlertTriangle size={14} />
                        </div>
                        <div className="fm-security__info">
                            <span className="fm-security__label">Ogohlantirishlar</span>
                            <div className="fm-security__val-row">
                                <span className="fm-security__val">5</span>
                                <span className="fm-security__pct text-warning">+12%</span>
                            </div>
                        </div>
                    </div>
                    <div className="fm-security__item">
                        <div className="fm-security__icon-box bg-danger">
                            <FiSearch size={14} />
                        </div>
                        <div className="fm-security__info">
                            <span className="fm-security__label">Tekshiruvlar</span>
                            <div className="fm-security__val-row">
                                <span className="fm-security__val">12</span>
                                <span className="fm-security__pct text-danger">+8%</span>
                            </div>
                        </div>
                    </div>
                    <div className="fm-security__item">
                        <div className="fm-security__icon-box bg-good">
                            {/*<FiFlame size={14} />*/}
                        </div>
                        <div className="fm-security__info">
                            <span className="fm-security__label">Yong'in tizimi</span>
                            <div className="fm-security__val-row">
                                <span className="fm-security__val">Normal</span>
                                <span className="fm-security__pct text-good">100%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
};

export default SecurityWidget;
