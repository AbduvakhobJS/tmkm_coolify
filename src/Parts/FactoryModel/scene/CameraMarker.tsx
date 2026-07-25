import React, { useCallback } from "react";
import { Html } from "@react-three/drei";
import { FiActivity, FiUsers, FiCpu, FiVideo, FiZap } from "react-icons/fi";
import { MARKER_DISTANCE_FACTOR } from "../constants";
import type { BuildingMarker, MarkerType } from "../types";

interface CameraMarkerProps {
    marker: BuildingMarker;
    onSelect: (marker: BuildingMarker) => void;
}

const getMarkerIcon = (type: MarkerType) => {
    switch (type) {
        case "scada": return <FiCpu size={16} />;
        case "energy": return <FiZap size={16} />;
        case "production": return <FiActivity size={16} />;
        case "staff": return <FiUsers size={16} />;
        default: return <FiVideo size={16} />;
    }
};

/**
 * A billboard CCTV marker anchored in 3D space. It always faces the camera
 * (`sprite`), scales with distance (`distanceFactor`) and exposes hover glow /
 * pulse purely through CSS (see factoryModel.css). Clicking opens the modal.
 */
const CameraMarker: React.FC<CameraMarkerProps> = ({ marker, onSelect }) => {
    const handleSelect = useCallback(() => onSelect(marker), [marker, onSelect]);

    return (
        <group position={marker.position}>
            <Html center sprite distanceFactor={MARKER_DISTANCE_FACTOR} zIndexRange={[10, 0]}>
                <div
                    className={`fm-marker fm-marker--${marker.type}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`${marker.building} — ${marker.type}`}
                    onClick={handleSelect}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSelect()}
                >
                    <span className="fm-marker__ring" />
                    <span className="fm-marker__btn">
                        {getMarkerIcon(marker.type)}
                    </span>
                    <span className="fm-marker__label">{marker.building}</span>
                </div>
            </Html>
        </group>
    );
};

export default React.memo(CameraMarker);
