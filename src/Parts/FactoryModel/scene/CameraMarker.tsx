import React, { useCallback } from "react";
import { Html } from "@react-three/drei";
import { FiVideo } from "react-icons/fi";
import { LuCamera } from "react-icons/lu";
import { MARKER_DISTANCE_FACTOR } from "../constants";
import type { BuildingMarker } from "../types";

interface CameraMarkerProps {
    marker: BuildingMarker;
    onSelect: (marker: BuildingMarker) => void;
}

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
                    className="fm-marker"
                    role="button"
                    tabIndex={0}
                    aria-label={`${marker.building} — ${marker.cameraName}`}
                    onClick={handleSelect}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSelect()}
                >
                    <span className="fm-marker__ring" />
                    <span className="fm-marker__btn">
                        <FiVideo size={16} />
                    </span>
                    <span className="fm-marker__label">{marker.building}</span>
                </div>
            </Html>
        </group>
    );
};

export default React.memo(CameraMarker);
