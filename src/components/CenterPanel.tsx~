import React from 'react';
import PipelineSection from './PipelineSection';
import MapSection from './MapSection';
import {MapChartComponent} from "./charts/MapChartComponent";
import Map3D from "../Parts/Map/Map3d";
import TopCenter from "./TopCenter";
import Part3 from "./Part3";
import Esg from "../Parts/ESG/ESG";
import Marketing from "../Parts/Marketing/Marketing";
import Investing from "../Parts/Investing/Investing";
import FinanceNew from "../Parts/Finance/FinanceNew";
import GRR from "../Parts/GRR/GRR";

const CenterPanel: React.FC<{highlightIndex: number, setHighlightIndex: React.Dispatch<React.SetStateAction<number>>}> = ({highlightIndex, setHighlightIndex}) => {
  return (
    <section className="center-panel">
        <div className="center-top-bottom">
            <div className="center-top-height">
                {/*<TopCenter/>*/}
                <Part3 highlightIndex={highlightIndex} setHighlightIndex={setHighlightIndex} />
            </div>


            <div className="center-bottom-height" style={{paddingTop: 10,  border: '1px solid rgba(14,168,199,0.2)',  borderRadius: '12px', marginTop: 10}}>
                {/*<Map3D highlightIndex={highlightIndex} setHighlightIndex={setHighlightIndex} />*/}

                {/*<FinanceNew />*/}
                <GRR />
            </div>
        </div>


    </section>
  );
};

export default CenterPanel;
