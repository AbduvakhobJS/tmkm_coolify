import React from "react";

interface SceneTogglesProps {
    camerasOn: boolean;
    onToggleCameras: (next: boolean) => void;
    panelsOn: boolean;
    onTogglePanels: (next: boolean) => void;
}

/** Top-of-screen switches: mass camera-popup on/off, and left/right side-panel visibility. */
const SceneToggles: React.FC<SceneTogglesProps> = ({
    camerasOn,
    onToggleCameras,
    panelsOn,
    onTogglePanels,
}) => (
    <div className="fm-toggles">
        <button
            type="button"
            className={`fm-toggle${camerasOn ? " fm-toggle--on" : ""}`}
            onClick={() => onToggleCameras(!camerasOn)}
        >
            <span className="fm-toggle__switch" />
            Camera
        </button>
        <button
            type="button"
            className={`fm-toggle${panelsOn ? " fm-toggle--on" : ""}`}
            onClick={() => onTogglePanels(!panelsOn)}
        >
            <span className="fm-toggle__switch" />
            Panels
        </button>
    </div>
);

export default React.memo(SceneToggles);
