// import React, { useEffect, useRef } from 'react';
// import { FACILITIES, FACILITY_COLORS } from '../data/constants';
//
// declare global {
//   interface Window {
//     maplibregl: any;
//   }
// }
//
// const MapSection: React.FC = () => {
//   const mapRef = useRef<HTMLDivElement>(null);
//
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       try {
//         if (!window.maplibregl || !mapRef.current) return;
//
//         const map = new window.maplibregl.Map({
//           container: mapRef.current,
//           style: {
//             version: 8,
//             sources: {
//               osm: {
//                 type: 'raster',
//                 tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
//                 tileSize: 256,
//                 attribution: '© OpenStreetMap contributors',
//               },
//             },
//             layers: [{
//               id: 'osm-tiles',
//               type: 'raster',
//               source: 'osm',
//               paint: {
//                 'raster-opacity': 0.25,
//                 'raster-saturation': -1,
//                 'raster-brightness-min': 0,
//                 'raster-brightness-max': 0.2,
//               },
//             }],
//           },
//           center: [67.0, 40.5],
//           zoom: 5.4,
//           pitch: 30,
//           bearing: -5,
//           attributionControl: false,
//         });
//
//         map.on('load', () => {
//           FACILITIES.forEach(f => {
//             const el = document.createElement('div');
//             const color = FACILITY_COLORS[f.type];
//             el.style.cssText = `
//               width:14px;height:14px;border-radius:50%;
//               background:${color};border:2px solid rgba(255,255,255,0.4);
//               box-shadow:0 0 10px ${color},0 0 20px ${color}66;
//               cursor:pointer;transition:transform 0.2s;
//             `;
//
//             const popupHtml = `
//               <div class="popup-title">${f.name}</div>
//               <div class="popup-row"><span>Stage</span><span class="popup-val">${f.stage}</span></div>
//               <div class="popup-row"><span>Output</span><span class="popup-val">${f.output}/yr</span></div>
//               <div class="popup-row"><span>Workers</span><span class="popup-val">${f.workers.toLocaleString()}</span></div>
//             `;
//
//             const popup = new window.maplibregl.Popup({
//               offset: 14,
//               closeButton: false,
//               className: 'facility-popup',
//             }).setHTML(popupHtml);
//
//             new window.maplibregl.Marker({ element: el })
//               .setLngLat(f.coords)
//               .setPopup(popup)
//               .addTo(map);
//
//             el.addEventListener('mouseenter', () => { popup.addTo(map); el.style.transform = 'scale(1.5)'; });
//             el.addEventListener('mouseleave', () => { popup.remove();   el.style.transform = 'scale(1)'; });
//           });
//
//           let bearing = -5;
//           const rotateCam = () => { bearing += 0.015; map.setBearing(bearing); requestAnimationFrame(rotateCam); };
//           setTimeout(rotateCam, 3000);
//         });
//       } catch (e) {
//         console.warn('MapLibre init failed', e);
//         if (mapRef.current) {
//           mapRef.current.innerHTML = `
//             <div style="height:100%;display:flex;align-items:center;justify-content:center;
//               font-family:var(--font-mono);font-size:0.7rem;color:var(--text-muted);flex-direction:column;gap:0.5rem;">
//               <div>🗺️</div>
//               <div>FACILITY MAP — 10 ACTIVE SITES ACROSS UZBEKISTAN</div>
//             </div>`;
//         }
//       }
//     }, 300);
//
//     return () => clearTimeout(timer);
//   }, []);
//
//   return (
//     <div className="map-section">
//       <div className="panel-label">FACILITY NETWORK — UZBEKISTAN INDUSTRIAL MAP</div>
//       <div className="map-container">
//         <div ref={mapRef} className="map" />
//         <div className="map-legend">
//           <div className="legend-title">FACILITY TYPE</div>
//           <div className="legend-item"><span className="legend-dot" style={{ background: '#00f5ff' }} />Mining Site</div>
//           <div className="legend-item"><span className="legend-dot" style={{ background: '#ff6b35' }} />Smelting Plant</div>
//           <div className="legend-item"><span className="legend-dot" style={{ background: '#7fff00' }} />Refinery</div>
//           <div className="legend-item"><span className="legend-dot" style={{ background: '#bf5fff' }} />Manufacturing</div>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default MapSection;

import React from 'react';
import {MapChartComponent} from "./charts/MapChartComponent";

// import commonClasses from "./styles/Examples.module.scss";
import { SciChartReact, ChartGroupLoader } from "scichart-react";
import {drawHeatmapLegend, DrawExample} from "./charts/MapChart";
const MapSection = () => {
  return (
      <ChartGroupLoader
          // className={commonClasses.ChartWrapper}
      >
          <SciChartReact initChart={DrawExample} style={{ width: "calc(100% - 60px)", height: "100%" }} />
          <SciChartReact
              initChart={drawHeatmapLegend}
              style={{
                  position: "absolute",
                  height: "100%",
                  width: "65px",
                  top: 0,
                  right: 0,
                  backgroundColor: "#000000DD",
              }}
          />
      </ChartGroupLoader>
  );
};

export default MapSection;