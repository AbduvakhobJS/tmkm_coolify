import React from 'react';

interface WidgetData {
    name: string;
    position: { x: number; y: number };
    image: string;
    side?: 'left' | 'right';
    angle?: number;
    opacity: number;
}

const TopCenter = () => {
    // Har bir qavat uchun widgetlar (piramida ko'rinishida)
    const layers: WidgetData[][] = [
        // Eng yuqori qavat (4-qavat, 3 ta)
        [
            { name: 'Metal', position: { x: 50.5, y: 14 }, image: '', side: 'left', angle: 0, opacity: 1 },
            { name: 'Mining', position: { x: 38, y: 17 }, image: '', side: 'left', angle: 20, opacity: 1 },
            { name: 'Marketing', position: { x: 64, y: 17 }, image: '', side: 'right', angle: 20, opacity: 1 },
        ],
        // 3-qavat (5 ta)
        [
            { name: 'Taskazgan grafit', position: { x: 62, y: 40  }, image: '', side: 'right', angle: 5,  opacity: 1 },
            { name: 'TMK Chemicals', position: { x: 38, y: 40 }, image: '', side: 'left', angle: 5, opacity: 1 },
            { name: 'R&D Park', position: { x: 50, y: 46 }, image: '', side: 'right', angle: 0, opacity: 1 }
        ],
        // 2-qavat (7 ta)
        [
            { name: 'Chirchiq', position: { x: 50, y: 64 }, image: '', side: 'right', angle: 0, opacity: 1 },
            { name: 'Ohangaron', position: { x: 39, y: 61 }, image: '', side: 'left', angle: 10, opacity: 1 },
            { name: 'Nurobod', position: { x: 61, y: 61 }, image: '', side: 'right', angle: 10, opacity: 1 },
            // { name: 'Boy Ko\'l', position: { x: 30, y: 57 }, image: '', side: 'left', angle: 20, opacity: 1 },
            // { name: 'Begona Buloq', position: { x: 70, y: 57 }, image: '', side: 'right', angle: 20, opacity: 1 },
        ],
        // 1-qavat (9 ta)
        [
            { name: 'Li klasteri', position: { x: 50, y: 92 }, image: './imgs/icon1.png', side: 'right', angle: 0, opacity: 1 },
            { name: 'Grafit klasteri', position: { x: 34, y: 88 }, image: './imgs/icon2.png', side: 'right', angle: 15, opacity: 1 },
            { name: 'Mg klasteri', position: { x: 66, y: 88 }, image: './imgs/icon4.png', side: 'left', angle: 15, opacity: 1 },
            { name: 'V klasteri', position: { x: 22, y: 80 }, image: './imgs/icon3.png', side: 'right', angle: 20, opacity: 1 },
            { name: 'Co , Ni, Cr klasteri', position: { x: 78, y: 80 }, image: './imgs/icon5.png', side: 'left', angle: 20, opacity: 1 },
        ],
        [
            { name: 'Grafit klasteri', position: { x: 50, y: 84 }, image: '', side: 'right', angle: 5, opacity: 0.7 },
            { name: 'Mg klasteri', position: { x: 68, y: 76 }, image: '', side: 'left', angle: 5, opacity: 0.7 },
            { name: 'V klasteri', position: { x: 34, y: 74 }, image: '', side: 'left', angle: 5, opacity: 0.7 },
        ],
    ];

    return (
        <div className="top-center-bg">
            <div className="logo-title-piro">
                <img src="./imgs/logo2.png" alt="" />

            </div>
            <div className="top-center-content">
                {layers.flat().map((widget, idx) => {
                    const rotationY = widget.side === 'left' ? -(widget.angle || 0) : (widget.angle || 0);
                    return (
                        <div 
                            key={idx}
                            className="top-center-widget"
                            style={{ 
                                left: `${widget.position.x}%`, 
                                top: `${widget.position.y}%`,
                                '--rotY': `${rotationY}deg`,
                                '--shine-delay': `${(idx % 9) * 0.28}s`,
                                opacity: widget.opacity
                            } as React.CSSProperties}
                        >
                            <div className="widget-inner">
                                {
                                    widget.image ?
                                        <img className="widget-icon" src={widget.image} alt={widget.name} />
                                        :
                                        ""
                                }
                                <span className="widget-text">{widget.name}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TopCenter;