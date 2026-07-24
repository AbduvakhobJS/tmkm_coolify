import React from 'react';
import WidgetWrapper from '../WidgetWrapper';
import { FiShuffle } from 'react-icons/fi';

const TurnstileWidget: React.FC<{ index: number }> = ({ index }) => {
    return (
        <WidgetWrapper title="TURNIKET" icon={FiShuffle} extra="Bugun" index={index}>
            <div className="fm-turnstile">
                <div className="fm-turnstile__main">
                    <span className="fm-turnstile__label">O'tganlar soni</span>
                    <span className="fm-turnstile__total">224</span>
                </div>
                <div className="fm-turnstile__footer">
                    <div className="fm-turnstile__sub">
                        <span className="fm-turnstile__sub-label text-good">Kirish</span>
                        <span className="fm-turnstile__sub-value text-good">128</span>
                    </div>
                    <div className="fm-turnstile__sub">
                        <span className="fm-turnstile__sub-label text-danger">Chiqish</span>
                        <span className="fm-turnstile__sub-value text-danger">96</span>
                    </div>
                </div>
            </div>
        </WidgetWrapper>
    );
};

export default TurnstileWidget;
