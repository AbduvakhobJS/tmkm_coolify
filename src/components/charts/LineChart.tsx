import React from 'react';
import {SciChartReact} from "scichart-react";
import {appTheme} from "../../tools/theme";
import {
    EllipsePointMarker,
    GradientParams,
    MouseWheelZoomModifier,
    NumericAxis,
    NumberRange,
    Point,
    RubberBandXyZoomModifier,
    SciChartSurface,
    SplineMountainRenderableSeries,
    WaveAnimation,
    XyDataSeries,
    ZoomExtentsModifier,
} from "scichart";

// Configure SciChart to use the wasm files from the public folder
SciChartSurface.configure({
    wasmUrl: "/scichart2d.wasm"
});

// SciChart litsenziyasini qo'llash
const licenseKey = "NbX+2XP9JhtSxLiFXWZHRkPfQJz1ladswS9bZa9nR+HQYgAvAQ+qGVaNrxbIHiFYjIkf7WbsQcgKkk5dIOar27oI78ndSaTKtUGcIg3QG1LphEcW7+M3az5rma0vDbjxz3MX4dN3r3+HnYK50ErzErnLx7kzUYYZRmZOgPiMIP/bnVLp1I07eKJv4J7pHGbf2/5Sz/+staHCf8OscRw0lOaodXWOybw9gigzKZpp9QBJbJr9b2YINi6sRikakhwRQ5RnW838qqTvxbbcPaRLjqp7+0tZlU3KQ2351+Hz96EMFZwKN2TdRYCZO1ARHp57eck+8M+9fUDcSEo0NzgdCTe3bZ6tXepsOyUIgwMFY8s9WWwvRScewcS2pFG1DCun2HvSC/G5rCaoAjFYuXhi3zx/Znx8qY5YNCGRI6uuBgHqJDDuZflM2Ot2XSl5PtatddhWogw97AeFUEbNAO3WNuUyPweKYSFAfhdlzfRof+3ZRxCtI7Wv6M269RGDToZJniFgn9Pw6mf+d3DVnz+RSj4/16eCI4ZUDeQJg/dfD/kefdNpa/+B22DexowqOjtjmR7ECgBktFN0Pq46enu+6Z0b9WphqUt7i62+9PD7ctHFJYqLfzwaHBrOG0VdpGRX7hoBHv4L9RaqEJ8kzEUswRuKkyKnwghr";
SciChartSurface.setRuntimeLicenseKey(licenseKey);

const initChart = async (rootElement: string | HTMLDivElement) => {
    // Create a SciChartSurface
    const { wasmContext, sciChartSurface } = await SciChartSurface.create(rootElement, {
        theme: appTheme.SciChartJsTheme,
        disableAspect: true,
    });

    // Create an XAxis and YAxis
    sciChartSurface.xAxes.add(new NumericAxis(wasmContext, { axisTitle: "X Axis" }));
    sciChartSurface.yAxes.add(
        new NumericAxis(wasmContext, {
            growBy: new NumberRange(0.05, 0.2),
            axisTitle: "Y Axis",
        })
    );

    // Create some data to add to the chart
    const xValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const yValues = [50, 35, 61, 58, 50, 50, 40, 53, 55, 23, 45, 12, 59, 60];

    // Create a Spline Mountain Series and add to the chart
    sciChartSurface.renderableSeries.add(
        new SplineMountainRenderableSeries(wasmContext, {
            dataSeries: new XyDataSeries(wasmContext, { xValues, yValues }),
            interpolationPoints: 20, // Sets number of points to interpolate to smooth the line
            stroke: appTheme.VividSkyBlue,
            strokeThickness: 5,
            zeroLineY: 0.0,
            fill: appTheme.VividSkyBlue, // when a solid color is required, use fill
            // when a gradient is required, use fillLinearGradient
            fillLinearGradient: new GradientParams(new Point(0, 0), new Point(0, 1), [
                { color: appTheme.MutedSkyBlue, offset: 0 },
                { color: "Transparent", offset: 1 },
            ]),
            pointMarker: new EllipsePointMarker(wasmContext, {
                strokeThickness: 3,
                width: 13,
                height: 13,
                stroke: appTheme.VividSkyBlue,
                fill: appTheme.ForegroundColor,
            }),
            animation: new WaveAnimation({ duration: 1000, fadeEffect: true, zeroLine: 10 }),
        })
    );

    // Optional: Add some interactivity to the chart
    sciChartSurface.chartModifiers.add(
        new ZoomExtentsModifier(),
        new RubberBandXyZoomModifier(),
        new MouseWheelZoomModifier()
    );

    sciChartSurface.zoomExtents();

    return { wasmContext, sciChartSurface };
};

export const LineChart = () => {
    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <SciChartReact
                style={{ width: "100%", height: "100%" }}
                initChart={initChart}
                onInit={(initResult) => console.log(initResult.sciChartSurface.id + ` was created`)}
            />
        </div>
    );
};
