import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import { FactoryViewer } from './Map3d';
import { factoryData } from '../data/factorys';
import StreamGrid from "./VideoStream";

const RightPanel: React.FC<{ highlightIndex: number }> = ({ highlightIndex }) => {
  const factorys = factoryData;

  return (
    <div className="right-panel">
      {/*<GaugeRow />*/}
      {/*<RealtimeChart />*/}
      {/*<EnergyChart />*/}
      
      <div className="view-model-right-panel">
        <div className="view-model" style={{ width: '100%', height: '44vh',padding: "20px", background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #00f5ff33', marginTop: '10px' }}>
          <div style={{ position: 'absolute', top: '15px', left: '20px', zIndex: 10, color: '#00f5ff', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Tanlangan Zavod: {factorys[highlightIndex]?.title}
          </div>
          <Canvas shadows camera={{ position: [0, 2, 5], fov: 40 }}>
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <Suspense fallback={<Html center><div style={{ color: '#00f5ff' }}>Model yuklanmoqda...</div></Html>}>
              <FactoryViewer
                modelPath={factorys[highlightIndex].factory_model}
                rotationSpeed={0.5}
                zoom={0.06} // factory.glb kichik bo'lgani uchun masshtabni mosladik
              />
              <Environment preset="city" />
              <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={15} blur={3} />
            </Suspense>
            <OrbitControls enablePan={false} enableRotate={true} enableZoom={true} minDistance={2} maxDistance={15} />
          </Canvas>
        </div>
      </div>

      <div className="view-model-right-model">
        <div className="view-model" style={{ width: '100%', height: '44vh',padding: "20px", background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #00f5ff33', marginTop: '10px' }}>

        <StreamGrid />
      </div>
      </div>

      {/*<AlertsSection />*/}
      {/*<ProjectsSection />*/}
    </div>
  );
};

export default RightPanel;
