import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import { FactoryViewer } from './Map3d';
import { factoryData } from '../data/factorys';
import StreamGrid from "./VideoStream";
import KpiCard from "./KpiCard";
import {EnergyChart, RealtimeChart} from "./Charts";

const GeoModelCard: React.FC<{ title: string, factoryTitle: string, index: number }> = ({ title, factoryTitle, index }) => {
  return (
    <div className="view-model" style={{ 
      width: '100%', 
      height: '100%', 
      padding: "15px",
      background: 'transparent',
      borderRadius: '12px', 
      overflow: 'hidden', 
      position: 'relative', 
      border: '1px solid #0EA8C733',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ position: 'absolute', top: '10px', left: '15px', zIndex: 10, color: '#0EA8C7', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {title}
      </div>
      
      <div style={{ position: 'absolute', top: '30px', left: '15px', zIndex: 10 }}>
        <div style={{ 
          background: 'rgba(3, 13, 34, 0.8)', 
          color: '#0EA8C7', 
          border: '1px solid #0EA8C744', 
          borderRadius: '4px', 
          padding: '2px 6px',
          fontSize: '10px',
        }}>
          {factoryTitle}
        </div>
      </div>

      <div style={{ display: 'flex', width: '100%', flex: 1, minHeight: 0 }}>
        {/* Left side: 3D Model */}
        <div style={{ flex: 1.2, position: 'relative', marginLeft: '-40px' }}>
          <Canvas shadows camera={{ position: [0, 2, 5], fov: 40 }}>
            <ambientLight intensity={0.8} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <Suspense fallback={<Html center><div style={{ color: '#0EA8C7', fontSize: '10px' }}>...</div></Html>}>
              <FactoryViewer
                modelPath={"/models/geo3d_1.glb"}
                rotationSpeed={0.5}
                zoom={1.6}
              />
              <Environment preset="city" />
              <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={15} blur={3} />
            </Suspense>
            <OrbitControls enablePan={false} enableRotate={true} enableZoom={true} minDistance={2} maxDistance={15} />
          </Canvas>
          
          <div style={{ position: 'absolute', left: '15px', bottom: '45px', color: '#0EA8C766', fontSize: '9px', lineHeight: '1.2' }}>
            Z (м)<br/>1 400
          </div>
          <div style={{ position: 'absolute', left: '15px', bottom: '15px', color: '#0EA8C766', fontSize: '9px' }}>
            X (м)
          </div>
        </div>

        {/* Right side: Info Panels */}
        <div style={{ position: "absolute" , right: "10px", top: "16%", width: '100px', display: 'flex', flexDirection: 'column', gap: '4px', justifyContent: 'center', zIndex: 5, background: 'transparent' }}>
          <div style={{ background: '#030d22', border: '1px solid #0EA8C722', borderRadius: '4px', padding: '5px' }}>
            <div style={{ color: '#0EA8C7', fontSize: '7px', textTransform: 'uppercase' }}>Запасы (P+P)</div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>8,74</div>
            <div style={{ color: '#0EA8C7', fontSize: '7px' }}>млн т</div>
          </div>
          <div style={{ background: '#030d22', border: '1px solid #0EA8C722', borderRadius: '4px', padding: '5px' }}>
            <div style={{ color: '#0EA8C7', fontSize: '7px', textTransform: 'uppercase' }}>WO₃</div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>0,27%</div>
          </div>
          <div style={{ background: '#030d22', border: '1px solid #0EA8C722', borderRadius: '4px', padding: '5px' }}>
            <div style={{ color: '#0EA8C7', fontSize: '7px', textTransform: 'uppercase' }}>Скважины</div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>1 284</div>
          </div>
          <div style={{ background: '#030d22', border: '1px solid #0EA8C722', borderRadius: '4px', padding: '5px' }}>
            <div style={{ color: '#0EA8C7', fontSize: '7px', textTransform: 'uppercase' }}>Горизонт</div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>-1 400 м</div>
          </div>

          <div style={{ background: '#030d22', border: '1px solid #0EA8C722', borderRadius: '4px', padding: '5px' }}>
            <div style={{ color: '#0EA8C7', fontSize: '7px', textTransform: 'uppercase' }}>WO₃</div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>0,27%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RightPanel: React.FC<{ highlightIndex: number }> = ({ highlightIndex }) => {
  const factorys = factoryData;
  const currentFactoryTitle = factorys[highlightIndex]?.title || "Миссионское месторождение";

  return (
    <div className="right-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
      <div style={{ 
        flex: 1, 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr', 
        gridTemplateRows: '1fr 1fr', 
        gap: '10px',
        minHeight: 0
      }}>

        <GeoModelCard title="3D МОДЕЛЬ МЕСТОРОЖДЕНИЯ" factoryTitle={currentFactoryTitle} index={0} />
        <GeoModelCard title="3D МОДЕЛЬ МЕСТОРОЖДЕНИЯ" factoryTitle={currentFactoryTitle} index={1} />
        <GeoModelCard title="3D МОДЕЛЬ МЕСТОРОЖДЕНИЯ" factoryTitle={currentFactoryTitle} index={2} />
        <GeoModelCard title="3D МОДЕЛЬ МЕСТОРОЖДЕНИЯ" factoryTitle={currentFactoryTitle} index={3} />

      </div>

      <div className="view-model-right-model" style={{ height: '40%' }}>
        <div className="view-model" style={{ width: '100%', height: '100%', padding: "10px", background: '#030d22', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid #0EA8C733' }}>
          <StreamGrid />
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
