import React, { useCallback } from "react";
import { Html } from "@react-three/drei";
import { MARKER_DISTANCE_FACTOR } from "../constants";
import type { BuildingMarker } from "../types";

interface CameraMarkerProps {
    marker: BuildingMarker;
    onSelect: (marker: BuildingMarker) => void;
}

/**
 * A billboard marker anchored in 3D space — a plain, semi-transparent text
 * pill (no icon), coloured by marker type. Always faces the camera (`sprite`),
 * scales with distance (`distanceFactor`). Clicking opens the type's modal.
 */
const CameraMarker: React.FC<CameraMarkerProps> = ({ marker, onSelect }) => {
    const handleSelect = useCallback(() => onSelect(marker), [marker, onSelect]);
    const getFontSize = (text: string) => {
        const len = text.length;

        if (len <= 15) return 16;
        if (len <= 25) return 14;
        if (len <= 35) return 12;
        if (len <= 50) return 10;
        if (len <= 70) return 8;
        return 10;
    };
    return (
        <group position={marker.position}>
            <Html center sprite distanceFactor={MARKER_DISTANCE_FACTOR} zIndexRange={[10, 0]}>
                <div
                    className={`fm-text-marker fm-marker--${marker.type}`}
                    role="button"
                    tabIndex={0}
                    style={{
                        width: 130,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        overflow: "hidden",
                        padding: "4px 8px",
                        boxSizing: "border-box",
                        cursor: "pointer",
                    }}
                    aria-label={`${marker.building} — ${marker.type}`}
                    onClick={handleSelect}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleSelect()}
                >
                    <h1
                        style={{
                            margin: 0,
                            fontSize: getFontSize(marker.cameraName),
                            lineHeight: 1.15,
                            fontWeight: 600,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                        }}
                    >
                        {marker.cameraName}
                    </h1>
                </div>
            </Html>
        </group>
    );
};

export default React.memo(CameraMarker);
