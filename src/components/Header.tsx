import React from 'react';
import { useClock } from '../hooks/useClock';

const Header: React.FC = () => {
  const { time, date } = useClock();

  return (
    <header className="top-bar">
      <div className="top-left">
        <div className="logo-block">
          <div className="logo-hex">⬡</div>
          <div>
            <div className="logo-title">UZTMK</div>
            <div className="logo-sub">Uzbekistan Metallurgical Complex</div>
          </div>
        </div>
      </div>
      <div className="top-center">
        <div className="center-title">NATIONAL INDUSTRIAL SITUATION CENTER</div>
        <div className="center-sub">Real-time Operational Command &amp; Control Interface</div>
      </div>
      <div className="top-right">
        <div className="clock-block">
          <div className="live-time">{time}</div>
          <div className="live-date">{date}</div>
        </div>
        <div className="status-pill pulse-green">● SYSTEM LIVE</div>
      </div>
    </header>
  );
};

export default Header;
