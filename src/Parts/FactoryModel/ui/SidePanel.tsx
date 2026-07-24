import React from "react";
import AttendanceWidget from "./widgets/AttendanceWidget";
import TurnstileWidget from "./widgets/TurnstileWidget";
import ParkingWidget from "./widgets/ParkingWidget";
import VisitorsWidget from "./widgets/VisitorsWidget";
import CamerasWidget from "./widgets/CamerasWidget";
import ResourcesWidget from "./widgets/ResourcesWidget";
import SecurityWidget from "./widgets/SecurityWidget";
import WeatherWidget from "./widgets/WeatherWidget";
import StaffWidget from "./widgets/StaffWidget";

interface SidePanelProps {
    side: "left" | "right";
}

/** A vertical stack of glass widgets pinned to the left or right of the scene. */
const SidePanel: React.FC<SidePanelProps> = ({ side }) => (
    <div className={`fm-panel fm-panel--${side}`}>
        {side === "left" ? (
            <>
                <AttendanceWidget index={0} />
                <TurnstileWidget index={1} />
                <ParkingWidget index={2} />
                <VisitorsWidget index={3} />
            </>
        ) : (
            <>
                {/*<CamerasWidget index={0} />*/}
                <ResourcesWidget index={1} />
                <SecurityWidget index={2} />
                <WeatherWidget index={3} />
                <StaffWidget index={4} />
            </>
        )}
    </div>
);

export default React.memo(SidePanel);
