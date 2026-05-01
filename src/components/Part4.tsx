import React, {useState} from 'react';
import Map3D from "./Map3d";
import Part3 from "./Part3";

const Part4 = () => {
    const [highlightIndex, setHighlightIndex] = useState<number>(0);

    return (
        <section className="center-panel">
            <div className="center-top-bottom">

                <div style={{height: '100vh'}}>
                    <Map3D highlightIndex={highlightIndex} setHighlightIndex={setHighlightIndex} />
                </div>
            </div>

        </section>
    );
};

export default Part4;