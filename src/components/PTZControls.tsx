import { useState } from "react";

// PTZ uchun zarur bo'lgan minimal CSS uslublari
const ptzStyles = `
  .ptz-container {
    background: linear-gradient(145deg, #1e1e1e, #121212);
    border-radius: 24px;
    padding: 24px;
    border: 1px solid rgba(255,255,255,0.05);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1);
  }
  .ptz-root {
    user-select: none;
    position: relative;
    width: 220px;
    height: 220px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ptz-outer-ring {
    position: absolute;
    width: 210px;
    height: 210px;
    border-radius: 50%;
    border: 1px solid rgba(14, 168, 199, 0.2);
    box-shadow: 0 0 15px rgba(14, 168, 199, 0.05);
  }
  .ptz-panel {
    width: 180px;
    height: 180px;
    background: #1a1a1a;
    border-radius: 50%;
    position: relative;
    border: 1px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 2px 10px rgba(0,0,0,0.8), 0 5px 15px rgba(0,0,0,0.5);
  }
  .ptz-panel-content {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .ptz-icon {
    position: absolute;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 18px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    z-index: 2;
    border-radius: 12px;
  }
  .ptz-icon:hover {
    color: #0EA8C7;
    background: rgba(14, 168, 199, 0.1);
  }
  .ptz-icon.active {
    color: #fff;
    background: #0EA8C7;
    // transform: scale(1.1);
    box-shadow: 0 0 20px rgba(14, 168, 199, 0.6);
  }
  .ptz-icon-up { top: 4px; left: 50%; transform: translateX(-50%); }
  .ptz-icon-down { bottom: 4px; left: 50%; transform: translateX(-50%); }
  .ptz-icon-left { left: 4px; top: 50%; transform: translateY(-50%); }
  .ptz-icon-right { right: 4px; top: 50%; transform: translateY(-50%); }
  .ptz-icon-up-left { top: 24px; left: 24px; font-size: 14px; }
  .ptz-icon-up-right { top: 24px; right: 24px; font-size: 14px; }
  .ptz-icon-down-left { bottom: 24px; left: 24px; font-size: 14px; }
  .ptz-icon-down-right { bottom: 24px; right: 24px; font-size: 14px; }
  
  .ptz-center-joystick {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 68px;
    height: 68px;
    background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
    border-radius: 50%;
    border: 1px solid #333;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1);
  }
  .ptz-center-dot {
    width: 12px;
    height: 12px;
    background: #0EA8C7;
    border-radius: 50%;
    box-shadow: 0 0 10px #0EA8C7;
    opacity: 0.5;
  }

  .ptz-zoom-controls {
    display: flex;
    gap: 20px;
    margin-top: 24px;
    justify-content: center;
  }
  .zoom-btn {
    width: 54px;
    height: 48px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #888;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  }
  .zoom-btn span {
    font-size: 20px;
    font-weight: bold;
    line-height: 1;
  }
  .zoom-label {
    font-size: 9px;
    text-transform: uppercase;
    margin-top: 2px;
    letter-spacing: 0.5px;
  }
  .zoom-btn:hover {
    background: #222;
    color: #0EA8C7;
    border-color: #444;
  }
  .zoom-btn.active {
    background: #0EA8C7;
    border-color: #0EA8C7;
    color: #fff;
    box-shadow: 0 0 15px rgba(14, 168, 199, 0.4);
  }
`;

interface PTZControlsProps {
  camera: any;
  onSendCommand: any;
}

export default function PTZControls({
  camera,
  onSendCommand,
}: PTZControlsProps) {
  const [activeControl, setActiveControl] = useState<string | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const [status, setStatus] = useState<string>("");

  const sendPTZCommand = async (pan: number, tilt: number, zoom: number) => {
    if (!camera.streamUrl) return;

    const match = camera.streamUrl.match(/\/stream\/([^/]+)/);
    const streamName = match ? match[1] : null;

    if (!streamName) return;

    const x = pan / 60;
    const y = tilt / 60;
    const z = zoom / 60;

    onSendCommand({ cameraId: camera.id, x, y, z, streamName });

    try {
      const baseUrl = camera.streamUrl.split('/stream/')[0];
      const apiUrl = `${baseUrl}/api/onvif?src=${streamName}&action=move&x=${x}&y=${y}&z=${z}`;
      
      const response = await fetch(apiUrl, { method: 'POST' });
      if (!response.ok) {
        const retryResponse = await fetch(apiUrl, { method: 'GET' });
        if (!retryResponse.ok) {
          setStatus("Xatolik!");
          setTimeout(() => setStatus(""), 2000);
        } else {
          setStatus("Yuborildi");
          setTimeout(() => setStatus(""), 1000);
        }
      } else {
        setStatus("Yuborildi");
        setTimeout(() => setStatus(""), 1000);
      }
    } catch (error) {
      setStatus("Xato!");
      setTimeout(() => setStatus(""), 2000);
    }
  };

  const handleControlStart = (direction: string, pan: number, tilt: number) => {
    if (intervalId) clearInterval(intervalId);
    
    setActiveControl(direction);
    // Birinchi buyruqni darhol yuboramiz
    sendPTZCommand(pan, tilt, 0);
    
    // Keyin har 500ms da qayta yuboramiz (go2rtc harakatni davom ettirishi uchun)
    const id = setInterval(() => {
      sendPTZCommand(pan, tilt, 0);
    }, 500);
    setIntervalId(id);
  };

  const handleControlStop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setActiveControl(null);
    // To'xtatish buyrug'i (0,0,0)
    sendPTZCommand(0, 0, 0);
  };

  const handleZoomStart = (direction: "in" | "out") => {
    if (intervalId) clearInterval(intervalId);

    const zoomVal = direction === "in" ? 60 : -60;
    setActiveControl(direction);
    sendPTZCommand(0, 0, zoomVal);

    const id = setInterval(() => {
      sendPTZCommand(0, 0, zoomVal);
    }, 500);
    setIntervalId(id);
  };

  const handleZoomStop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setActiveControl(null);
    sendPTZCommand(0, 0, 0);
  };

  const ptzActions = [
    { id: "factoryUpLeft", icon: "↖", pan: -60, tilt: 60, title: "Chapga yuqoriga", className: "ptz-icon-up-left" },
    { id: "factoryUp", icon: "↑", pan: 0, tilt: 60, title: "Yuqoriga", className: "ptz-icon-up" },
    { id: "factoryUpRight", icon: "↗", pan: 60, tilt: 60, title: "O'ngga yuqoriga", className: "ptz-icon-up-right" },
    { id: "factoryLeft", icon: "←", pan: -60, tilt: 0, title: "Chapga", className: "ptz-icon-left" },
    { id: "factoryRight", icon: "→", pan: 60, tilt: 0, title: "O'ngga", className: "ptz-icon-right" },
    { id: "factoryDownLeft", icon: "↙", pan: -60, tilt: -60, title: "Chapga pastga", className: "ptz-icon-down-left" },
    { id: "factoryDown", icon: "↓", pan: 0, tilt: -60, title: "Pastga", className: "ptz-icon-down" },
    { id: "factoryDownRight", icon: "↘", pan: 60, tilt: -60, title: "O'ngga pastga", className: "ptz-icon-down-right" },
  ];

  return (
    <div className="flex flex-col gap-4" >
      <style>{ptzStyles}</style>

      <div >
        <div className="ptz-container" style={{ margin: "20px"}}>
          <h4 className="text-[11px] font-bold text-[#0EA8C7] text-center mb-6 uppercase tracking-[3px] opacity-80">
          Kamera boshqaruvi
          </h4>

          <div className="ptz-root">
            <div className="ptz-outer-ring"></div>
            <div className="ptz-panel mx-auto">
              <div className="ptz-panel-content">
                {ptzActions.map((action) => (
                    <div
                        key={action.id}
                        title={action.title}
                        className={`ptz-icon ${action.className} ${activeControl === action.id ? 'active' : ''}`}
                        onMouseDown={() => handleControlStart(action.id, action.pan, action.tilt)}
                        onMouseUp={handleControlStop}
                        onMouseLeave={handleControlStop}
                        onTouchStart={(e) => { e.preventDefault(); handleControlStart(action.id, action.pan, action.tilt); }}
                        onTouchEnd={(e) => { e.preventDefault(); handleControlStop(); }}
                    >
                      {action.icon}
                    </div>
                ))}

                {/* Center Joystick Decoration */}
                <div className="ptz-center-joystick">
                  <div className="ptz-center-dot"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="ptz-zoom-controls">
            <div
                title="Kichraytirish -"
                className={`zoom-btn ${activeControl === "out" ? "active" : ""}`}
                onMouseDown={() => handleZoomStart("out")}
                onMouseUp={handleZoomStop}
                onMouseLeave={handleZoomStop}
                onTouchStart={(e) => { e.preventDefault(); handleZoomStart("out"); }}
                onTouchEnd={(e) => { e.preventDefault(); handleZoomStop(); }}
            >
              <span style={{fontSize: "20px"}}>-</span>
            </div>
            <div
                title="Kattalashtirish +"
                className={`zoom-btn ${activeControl === "in" ? "active" : ""}`}
                onMouseDown={() => handleZoomStart("in")}
                onMouseUp={handleZoomStop}
                onMouseLeave={handleZoomStop}
                onTouchStart={(e) => { e.preventDefault(); handleZoomStart("in"); }}
                onTouchEnd={(e) => { e.preventDefault(); handleZoomStop(); }}
            >
              <span style={{fontSize: "20px"}}>+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
