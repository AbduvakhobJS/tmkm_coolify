import React from 'react';
import TopCenter from "./TopCenter";

const Part3 = ({
                   highlightIndex,
                   setHighlightIndex,
               }: {
    highlightIndex: number;
    setHighlightIndex: React.Dispatch<React.SetStateAction<number>>;
}) => {
    return (
        <>
            <TopCenter highlightIndex={highlightIndex} setHighlightIndex={setHighlightIndex}/>
            </>
    );
};

export default Part3;