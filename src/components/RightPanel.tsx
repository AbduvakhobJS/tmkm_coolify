import React, {Suspense, useMemo, useRef} from 'react';
import { Canvas } from '@react-three/fiber';
import {OrbitControls, Environment, ContactShadows, Html, useGLTF} from '@react-three/drei';
import { FactoryViewer } from '../Parts/Map/Map3d';
import { DRACO_DECODER_PATH } from '../Parts/FactoryModel/constants';
import { factoryData } from '../data/factorys';
import StreamGrid from "./VideoStream";
import KpiCard from "./KpiCard";
import {EnergyChart, RealtimeChart} from "./Charts";
import EnterExit from "./EnterExit";
import * as THREE from 'three';
import EnterExitMain from "./EnterExitMain";
import ESG from "../Parts/ESG/ESG";
import FinanceNewMain from "../Parts/Finance/FinanceNewMain";
import FinanceNew from "../Parts/Finance/FinanceNew";




const RightPanel: React.FC<{ highlightIndex: number }> = ({ highlightIndex }) => {
  return (
    <div className="right-panel"

         style={{ display: "grid", gridTemplateRows: '1fr 1fr 1fr', height: '100%', gap: '10px' }}
    >
        <div style={{ height: '100%', minHeight: 0, overflow: 'auto' ,  border: '1px solid rgba(14,168,199,0.2)',  borderRadius: '12px'}}>

            <FinanceNew />
        </div>

            <div style={{ height: '100%', minHeight: 0, overflow: 'auto' ,  border: '1px solid rgba(14,168,199,0.2)',  borderRadius: '12px'}}>
                <EnterExitMain />
            </div>

            <div style={{ height: '100%', minHeight: 0, overflow: 'auto',   border: '1px solid rgba(14,168,199,0.2)',  borderRadius: '12px' }}>
                <ESG />
            </div>

      {/*<div className="view-model-right-model" style={{ height: '50%' }}>*/}
      {/*  <div className="view-model" style={{ width: '100%', height: '100%', padding: "10px", background: 'var(--gc-panel-bg)', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(14,168,199,0.2)' }}>*/}
      {/*    /!*<StreamGrid />*!/*/}
      {/*    <EnterExit />*/}
      {/*  </div>*/}
      {/*</div>*/}
    </div>
  );
};

export default RightPanel;
