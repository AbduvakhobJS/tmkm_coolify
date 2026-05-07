import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import { FactoryViewer } from './Map3d';
import { factoryData } from '../data/factorys';
import StreamGrid from "./VideoStream";
import KpiCard from "./KpiCard";
import {EnergyChart, RealtimeChart} from "./Charts";

const RightPanel: React.FC<{ highlightIndex: number }> = ({ highlightIndex }) => {
  const factorys = factoryData;

  return (
    <div className="right-panel">
      {/*<GaugeRow />*/}
      {/*<RealtimeChart />*/}
      {/*<EnergyChart />*/}
      
      <div className="view-model-right-panel">

        {/*<div className="view-model" style={{ width: '100%', height: '44vh', background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #0EA8C733', marginTop: '10px' }}>*/}
        {/*    <div style={{*/}
        {/*        width: '100%',*/}
        {/*        display: 'grid',*/}
        {/*        padding: '10px',*/}
        {/*        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',*/}
        {/*        gap: '10px',*/}
        {/*    }}>*/}
        {/*        <KpiCard icon="🏭" target={2847193} decimals={0} unit="tonnes" label="Total Output YTD" trend="▲ 12.4%" trendUp={true} />*/}
        {/*        <KpiCard icon="⚙️" target={18} decimals={0} unit="active" label="Operating Facilities" trend="▲ 2" trendUp={true} />*/}
        {/*        <KpiCard icon="📊" target={94.7} decimals={1} unit="%" label="Avg. Efficiency" trend="▼ 0.3%" trendUp={false} />*/}
        {/*        <KpiCard icon="👷" target={34219} decimals={0} unit="personnel" label="Active Workforce" trend="▲ 847" trendUp={true} />*/}
        {/*    </div>*/}

        {/*    <div style={{*/}
        {/*        width: '100%',*/}
        {/*        padding: '10px',*/}
        {/*        boxSizing: 'border-box',*/}
        {/*    }}>*/}
        {/*        <EnergyChart />*/}
        {/*        <RealtimeChart />*/}
        {/*    </div>*/}
        {/*</div>*/}

        {/*right panel 3d model item*/}

          <div >
              <div className="d-flex">
                  <div className="view-model" style={{ width: '100%', height: '21.5vh',padding: "20px", background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #0EA8C733'}}>
                      <div style={{ position: 'absolute', top: '15px', left: '20px', zIndex: 10, color: '#0EA8C7', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Tanlangan Zavod: {factorys[highlightIndex]?.title}
                      </div>
                      <div style={{ position: 'absolute', bottom: '10px',
                          right: '10px',
                          zIndex: 10, color: '#0EA8C7', fontWeight: 'bold',
                          textTransform: 'uppercase', letterSpacing: '1px' ,
                          backgroundColor: '#0EA8C733', padding: '5px 10px', borderRadius: '5px',
                      }}>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                Hudud:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  Buxoro viloyati, Peshku tumani
                              </span>
                          </div>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                NPV:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  49 mln. dollor
                              </span>
                          </div>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                ROI:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                 6 yil 6 oy Investitsiya qoplanishi
                              </span>
                          </div>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                Zaxira:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  9.17 mln. tonna
                              </span>
                          </div>
                      </div>
                      <Canvas shadows camera={{ position: [0, 2, 5], fov: 40 }}>
                          <ambientLight intensity={0.8} />
                          <pointLight position={[10, 10, 10]} intensity={1.5} />
                          <Suspense fallback={<Html center><div style={{ color: '#0EA8C7' }}>Model yuklanmoqda...</div></Html>}>
                              <FactoryViewer
                                  modelPath={"/models/geo3d_1.glb"}
                                  rotationSpeed={0.5}
                                  zoom={1.26} // factory.glb kichik bo'lgani uchun masshtabni mosladik
                              />
                              <Environment preset="city" />
                              <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={15} blur={3} />
                          </Suspense>
                          <OrbitControls enablePan={false} enableRotate={true} enableZoom={true} minDistance={2} maxDistance={15} />
                      </Canvas>
                  </div>
                  <div className="view-model" style={{ width: '100%', height: '21.5vh',padding: "20px", background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #0EA8C733', marginLeft: '10px'}}>
                      <div style={{ position: 'absolute', top: '15px', left: '20px', zIndex: 10, color: '#0EA8C7', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Tanlangan Zavod: {factorys[highlightIndex]?.title}
                      </div>
                      <div style={{ position: 'absolute', bottom: '10px',
                          right: '10px',
                          zIndex: 10, color: '#0EA8C7', fontWeight: 'bold',
                          textTransform: 'uppercase', letterSpacing: '1px' ,
                          backgroundColor: '#0EA8C733', padding: '5px 10px', borderRadius: '5px',
                      }}>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                Hudud:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  Jizzax viloyati, G'allaorol tumani
                              </span>
                          </div>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                Maydoni:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  106 Ga
                              </span>
                          </div>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                Chiqindi zaxirasi:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                19.9 mln. tonna
                              </span>
                          </div>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                Loyiha qiymati:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  287 000 dollor
                              </span>
                          </div>
                      </div>
                      <Canvas shadows camera={{ position: [0, 2, 5], fov: 40 }}>
                          <ambientLight intensity={0.8} />
                          <pointLight position={[10, 10, 10]} intensity={1.5} />
                          <Suspense fallback={<Html center><div style={{ color: '#0EA8C7' }}>Model yuklanmoqda...</div></Html>}>
                              <FactoryViewer
                                  modelPath={"/models/geo3d_2.glb"}
                                  rotationSpeed={0.5}
                                  zoom={0.002} // factory.glb kichik bo'lgani uchun masshtabni mosladik
                              />
                              <Environment preset="city" />
                              <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={15} blur={3} />
                          </Suspense>
                          <OrbitControls enablePan={false} enableRotate={true} enableZoom={true} minDistance={2} maxDistance={15} />
                      </Canvas>
                  </div>

              </div>
              <div className="d-flex" style={{marginTop: "10px"}}>

                  <div className="view-model" style={{ width: '100%', height: '21.5vh',padding: "20px", background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #0EA8C733'}}>
                      <div style={{ position: 'absolute', top: '15px', left: '20px', zIndex: 10, color: '#0EA8C7', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Tanlangan Zavod: {factorys[highlightIndex]?.title}
                      </div>
                      <div style={{ position: 'absolute', bottom: '10px',
                          right: '10px',
                          zIndex: 10, color: '#0EA8C7', fontWeight: 'bold',
                          textTransform: 'uppercase', letterSpacing: '1px' ,
                          backgroundColor: '#0EA8C733', padding: '5px 10px', borderRadius: '5px',
                      }}>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                Hudud:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  Toshkent viloyati, Piskent tumani
                              </span>
                          </div>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                Resurs hajmi:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  1 395 mln. tonna
                              </span>
                          </div>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                Kon-texnik sharoiti:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                 Yer osti usulida
                              </span>
                          </div>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                Yo'ldosh komponentlar:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  Mo, Ag, Au
                              </span>
                          </div>
                      </div>
                      <Canvas shadows camera={{ position: [0, 2, 5], fov: 40 }}>
                          <ambientLight intensity={0.8} />
                          <pointLight position={[10, 10, 10]} intensity={1.5} />
                          <Suspense fallback={<Html center><div style={{ color: '#0EA8C7' }}>Model yuklanmoqda...</div></Html>}>
                              <FactoryViewer
                                  modelPath={"/models/geo3d_2.glb"}

                                  rotationSpeed={0.5}
                                  zoom={0.002} // factory.glb kichik bo'lgani uchun masshtabni mosladik
                              />
                              <Environment preset="city" />
                              <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={15} blur={3} />
                          </Suspense>
                          <OrbitControls enablePan={false} enableRotate={true} enableZoom={true} minDistance={2} maxDistance={15} />
                      </Canvas>
                  </div>

                  <div className="view-model" style={{ width: '100%', height: '21.5vh',padding: "20px", background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #0EA8C733', marginLeft: '10px'}}>
                      <div style={{ position: 'absolute', top: '15px', left: '20px', zIndex: 10, color: '#0EA8C7', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Tanlangan Zavod: {factorys[highlightIndex]?.title}
                      </div>
                      <div style={{ position: 'absolute', bottom: '10px',
                          right: '10px',
                          zIndex: 10, color: '#0EA8C7', fontWeight: 'bold',
                          textTransform: 'uppercase', letterSpacing: '1px' ,
                          backgroundColor: '#0EA8C733', padding: '5px 10px', borderRadius: '5px',
                      }}>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                Hudud:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  Navoiy viloyati, Uchquduq tumani
                              </span>
                          </div>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                Maydoni:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  765 Ga
                              </span>
                          </div>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                Chiqindi zaxirasi:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                171.5 mln. tonna
                              </span>
                          </div>
                          <div>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px'}}>
                                Yo'ldosh komponentlar:
                              </span>
                              <span style={{ color: '#0EA8C7', fontWeight: 'bold', fontSize: '10px', marginLeft: '5px'}}>
                                  Au, Ag, W, Sb, Sc, Ga
                              </span>
                          </div>
                      </div>
                      <Canvas shadows camera={{ position: [0, 2, 5], fov: 40 }}>
                          <ambientLight intensity={0.8} />
                          <pointLight position={[10, 10, 10]} intensity={1.5} />
                          <Suspense fallback={<Html center><div style={{ color: '#0EA8C7' }}>Model yuklanmoqda...</div></Html>}>
                              <FactoryViewer
                                  modelPath={"/models/geo3d_1.glb"}
                                  rotationSpeed={0.5}
                                  zoom={1.26} // factory.glb kichik bo'lgani uchun masshtabni mosladik
                              />
                              <Environment preset="city" />
                              <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={15} blur={3} />
                          </Suspense>
                          <OrbitControls enablePan={false} enableRotate={true} enableZoom={true} minDistance={2} maxDistance={15} />
                      </Canvas>
                  </div>

              </div>
          </div>


      </div>

      <div className="view-model-right-model">
        <div className="view-model" style={{  width: '100%', height: '44vh',padding: "20px", background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #0EA8C733', marginTop: '10px' }}>

        <StreamGrid />
      </div>
      </div>

      {/*<AlertsSection />*/}
      {/*<ProjectsSection />*/}
    </div>
  );
};

export default RightPanel;
