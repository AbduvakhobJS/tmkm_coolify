import React, { useEffect, useRef } from "react";
import {Phasor} from "./Phasor";

export const MapChartComponent = () => {
    const chartRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let sciChartSurface: any;

        if (chartRef.current) {
            Phasor(chartRef.current).then(res => {
                sciChartSurface = res.sciChartSurface;
            });
        }

        return () => {
            sciChartSurface?.delete(); // cleanup
        };
    }, []);

    return (
        <div
            ref={chartRef}
            style={{ width: "100%", height: "400px" }}
        />
    );
};