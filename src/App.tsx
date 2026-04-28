import React, { useState } from 'react';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import Ticker from './components/Ticker';
import './App.css';

const App: React.FC = () => {
  const [highlightIndex, setHighlightIndex] = useState<number>(0);

  return (
    <>
      <div id="scanline" />
      <div id="grid-overlay" />
      <Header />
      <main id="dashboard">
        <LeftPanel />
        <CenterPanel highlightIndex={highlightIndex} setHighlightIndex={setHighlightIndex} />
        <RightPanel highlightIndex={highlightIndex} />
      </main>
      <Ticker />
    </>
  );
};

export default App;
