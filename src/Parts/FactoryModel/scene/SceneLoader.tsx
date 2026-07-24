import React from "react";
import { useProgress } from "@react-three/drei";

/**
 * Full-screen loading overlay driven by drei's global loading store. Rendered in
 * the DOM (outside the Canvas) so the 82 MB model download has a premium,
 * deterministic progress state instead of a blank canvas.
 */
const SceneLoader: React.FC = () => {
    const { active, progress } = useProgress();
    if (!active) return null;

    return (
        <div className="fm-loader">
            <div className="fm-loader__ring" />
            <div className="fm-loader__bar">
                <div className="fm-loader__bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="fm-loader__text">Loading factory · {Math.round(progress)}%</div>
        </div>
    );
};

export default SceneLoader;
