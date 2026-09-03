import React, { useEffect } from 'react';
import MetalsDashboard from './MetalsDashboard';
import ExtractionDashboard from './ExtractionDashboard';
import ExpensesDashboard from './ExpensesDashboard';
import SalesDashboard from './SalesDashboard';
import { GC } from '../theme/palette';

interface StModalProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const BOXES: React.ReactNode[] = [
    <MetalsDashboard />,     // 1:1 — tepa chap: metall ishlab chiqarish (rasm nusxasi)
    <ExtractionDashboard />, // 1:2 — tepa o'ng: metall qazib chiqarish
    <ExpensesDashboard />,   // 2:1 — past chap: xarajatlar
    <SalesDashboard />,      // 2:2 — past o'ng: sotuv / foyda
];

const StModal: React.FC<StModalProps> = ({ isOpen, onClose }) => {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                top: '5vh',
                backgroundColor: 'rgba(0,0,0,0.45)',
                zIndex: 999999999,
                display: 'flex',
                flexDirection: 'column',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: GC.slate,
                    overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        padding: '8px 12px',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        flexShrink: 0,
                    }}
                >
                    <button
                        onClick={onClose}
                        aria-label="Yopish"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: GC.slate,
                            cursor: 'pointer',
                            fontSize: 22,
                            lineHeight: 1,
                            padding: '2px 8px',
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* 2x2 grid — 4 teng bo'lak */}
                <div
                    style={{
                        flex: 1,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gridTemplateRows: '1fr 1fr',
                        gap: 6,
                        padding: 6,
                        overflow: 'hidden',
                    }}
                >
                    {BOXES.map((node, i) => (
                        <div
                            key={i}
                            style={{
                                minWidth: 0,
                                minHeight: 0,
                                borderRadius: 8,
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.08)',
                                background: '#0a0f1d',
                            }}
                        >
                            {node}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StModal;
