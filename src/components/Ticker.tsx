import React from 'react';
import { TICKER_ITEMS } from '../data/constants';

const Ticker: React.FC = () => {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <footer className="ticker-bar">
      <div className="ticker-label">LIVE FEED</div>
      <div className="ticker-track">
        <div className="ticker-content">
          {items.map((item, i) => (
            <React.Fragment key={i}>
              <span>{item}</span>
              {i < items.length - 1 && <span className="sep">|</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Ticker;
