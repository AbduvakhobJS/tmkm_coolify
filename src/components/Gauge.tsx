import React, { useRef, useEffect, useState } from 'react';

interface GaugeProps {
  value: number;
  color: string;
  label: string;
}

const Gauge: React.FC<GaugeProps> = ({ value, color, label }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 70;
    canvas.width = size;
    canvas.height = size / 1.6;
    const cx = size / 2, cy = size / 1.5;
    const r = size * 0.36;
    const startA = Math.PI, endA = 2 * Math.PI;
    const valA = startA + (value / 100) * Math.PI;

    ctx.clearRect(0, 0, size, size);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, endA);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Fill
    const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    grad.addColorStop(0, color + '88');
    grad.addColorStop(1, color);
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, valA);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }, [value, color]);

  return (
    <div className="gauge-block">
      <canvas ref={canvasRef} style={{ width: '100%', height: 'auto' }} />
      <div className="gauge-label">{label}</div>
      <div className="gauge-val">{value.toFixed(1)}%</div>
    </div>
  );
};

export const GaugeRow: React.FC = () => {
  const [vals, setVals] = useState({ uptime: 99.2, load: 87.4, safety: 96.1 });

  useEffect(() => {
    const id = setInterval(() => {
      setVals(prev => ({
        uptime: Math.max(97, Math.min(100, prev.uptime + (Math.random() - 0.5) * 0.3)),
        load:   Math.max(70, Math.min(98,  prev.load   + (Math.random() - 0.5) * 3)),
        safety: Math.max(92, Math.min(100, prev.safety + (Math.random() - 0.5) * 0.5)),
      }));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="gauge-row">
      <Gauge value={vals.uptime} color="#00f5ff" label="UPTIME" />
      <Gauge value={vals.load}   color="#ff6b35" label="LOAD" />
      <Gauge value={vals.safety} color="#7fff00" label="SAFETY" />
    </div>
  );
};

export default GaugeRow;
