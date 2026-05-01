import React from 'react';
import PipelineSection from './PipelineSection';
import MapSection from './MapSection';
import {MapChartComponent} from "./charts/MapChartComponent";
import Map3D from "./Map3d";
import TopCenter from "./TopCenter";
import Part3 from "./Part3";

const CenterPanel: React.FC<{highlightIndex: number, setHighlightIndex: React.Dispatch<React.SetStateAction<number>>}> = ({highlightIndex, setHighlightIndex}) => {
  return (
    <section className="center-panel">
        <div className="center-top-bottom">
            <div className="center-top-height">
                {/*<TopCenter/>*/}
                <Part3/>
            </div>


            <div className="center-bottom-height">
                <Map3D highlightIndex={highlightIndex} setHighlightIndex={setHighlightIndex} />

            </div>
        </div>


    </section>
  );
};

export default CenterPanel;
