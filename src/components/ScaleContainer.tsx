import React, { useEffect, useState } from 'react';

interface ScaleContainerProps {
    children: React.ReactNode;
    designWidth?: number;
    designHeight?: number;
}

/* 1920x1080 uchun mo'ljallangan dizaynni bitta rasmdek proporsional
   scale qiladi. Ichidagi barcha komponentlar o'zgarishsiz qoladi —
   faqat tashqi CSS transform orqali kattalashadi/kichraydi. */
const ScaleContainer: React.FC<ScaleContainerProps> = ({ children, designWidth = 1920, designHeight = 1080 }) => {
    const [scale, setScale] = useState(() => Math.min(window.innerWidth / designWidth, window.innerHeight / designHeight));

    useEffect(() => {
        const handleResize = () => {
            setScale(Math.min(window.innerWidth / designWidth, window.innerHeight / designHeight));
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [designWidth, designHeight]);

    return (
        <div style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div style={{
                width: designWidth,
                height: designHeight,
                flexShrink: 0,
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
            }}>
                {children}
            </div>
        </div>
    );
};

export default ScaleContainer;
