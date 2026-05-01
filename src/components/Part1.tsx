import React from 'react';
import KpiCard from "./KpiCard";
import {EnergyChart, MetalPieChart, RealtimeChart, RegionalBarChart} from "./Charts";
import ProjectsSection from "./ProjectsSection";

const Part1 = () => {
    return (
        <div>


            <div style={{display: "flex"}}>
                <aside className="right-panel">
                    <div className="panel-label">SYSTEM MONITORING</div>
                    <div className="kpi-grid">
                        <KpiCard
                            icon="🏭"
                            target={2847193}
                            decimals={0}
                            unit="tonnes"
                            label="Total Output YTD"
                            trend="▲ 12.4%"
                            trendUp={true}
                        />
                        <KpiCard
                            icon="⚙️"
                            target={18}
                            decimals={0}
                            unit="active"
                            label="Operating Facilities"
                            trend="▲ 2"
                            trendUp={true}
                        />
                        <KpiCard
                            icon="📊"
                            target={94.7}
                            decimals={1}
                            unit="%"
                            label="Avg. Efficiency"
                            trend="▼ 0.3%"
                            trendUp={false}
                        />
                        <KpiCard
                            icon="👷"
                            target={34219}
                            decimals={0}
                            unit="personnel"
                            label="Active Workforce"
                            trend="▲ 847"
                            trendUp={true}
                        />
                    </div>
                    {/*<RealtimeChart />*/}
                    <EnergyChart />
                    {/*<GaugeRow />*/}
                    {/*<RealtimeChart />*/}
                    {/*<EnergyChart />*/}
                    {/*<AlertsSection />*/}
                    <ProjectsSection />
                </aside>
                <aside className="left-panel">
                    <div className="panel-label">PRODUCTION ANALYTICS</div>
                    {/*<div className="d-flex" style={{ height: '300px', width: '100%' }}>*/}
                    {/*    <LineChart />*/}
                    {/*</div>*/}
                    {/*<div className="d-flex" style={{ height: '300px', width: '100%' }}>*/}

                    {/*    <MapChartComponent />*/}
                    {/*</div>*/}

                    <div className="kpi-grid">
                        <KpiCard
                            icon="🏭"
                            target={2847193}
                            decimals={0}
                            unit="tonnes"
                            label="Total Output YTD"
                            trend="▲ 12.4%"
                            trendUp={true}
                        />
                        <KpiCard
                            icon="⚙️"
                            target={18}
                            decimals={0}
                            unit="active"
                            label="Operating Facilities"
                            trend="▲ 2"
                            trendUp={true}
                        />
                        <KpiCard
                            icon="📊"
                            target={94.7}
                            decimals={1}
                            unit="%"
                            label="Avg. Efficiency"
                            trend="▼ 0.3%"
                            trendUp={false}
                        />
                        <KpiCard
                            icon="👷"
                            target={34219}
                            decimals={0}
                            unit="personnel"
                            label="Active Workforce"
                            trend="▲ 847"
                            trendUp={true}
                        />
                    </div>
                    <RealtimeChart />

                    {/*<ProductionLineChart />*/}
                    <MetalPieChart />
                    <RegionalBarChart />
                </aside>
            </div>
        </div>
    );
};

export default Part1;