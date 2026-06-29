import React from 'react';

interface IframeItem {
    src: string;
    title: string;
    /** 3 katak ichida nechta egallashi: 1 = 1/3, 2 = 2/3, 3 = to'liq */
    cell: 1 | 2 | 3;
}

interface StModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    iframes?: IframeItem[];
}

/**
 * Array length ga qarab qator taqsimoti:
 *  1 → [1]
 *  2 → [2]
 *  3 → [2, 1]
 *  4 → [2, 2]
 *  5 → [3, 2]
 *  6 → [3, 3]
 *  7 → [3, 3, 1]
 *  8+ → har qatorda max 3 ta
 */
function buildRows(items: IframeItem[]): IframeItem[][] {
    const n = items.length;

    const patterns: Record<number, number[]> = {
        1: [1],
        2: [2],
        3: [2, 1],
        4: [2, 2],
        5: [3, 2],
        6: [3, 3],
        7: [3, 3, 1],
    };

    const pattern = patterns[n];

    if (pattern) {
        const rows: IframeItem[][] = [];
        let idx = 0;
        for (const count of pattern) {
            rows.push(items.slice(idx, idx + count));
            idx += count;
        }
        return rows;
    }

    // 8+ ta: har qatorda max 3 ta
    const rows: IframeItem[][] = [];
    for (let i = 0; i < items.length; i += 3) {
        rows.push(items.slice(i, i + 3));
    }
    return rows;
}

const DEMO_IFRAMES: IframeItem[] = [
    { src: 'https://www.scichart.com/demo/iframe/phasor-diagram-chart', title: 'Chart 1', cell: 1 },
    { src: 'https://www.scichart.com/demo/iframe/polar-gauge-fifo-dashboard', title: 'Chart 2', cell: 1 },
    { src: 'https://www.scichart.com/demo/iframe/column-chart', title: 'Chart 3', cell: 1 },
    { src: 'https://www.scichart.com/demo/iframe/static-x-axis', title: 'Chart 4', cell: 1 },
    { src: 'https://www.scichart.com/demo/iframe/spline-mountain-chart', title: 'Chart 5', cell: 1 },
    { src: 'https://www.scichart.com/demo/iframe/mountain-chart', title: 'Chart 6', cell: 1 },
];

const StModal: React.FC<StModalProps> = ({
                                             isOpen = true,
                                             onClose = () => {},
                                             iframes = DEMO_IFRAMES,
                                         }) => {
    if (!isOpen) return null;

    const rows = buildRows(iframes);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                top: '8vh',
                backgroundColor: 'rgba(0,0,0,0.45)',
                zIndex: 1000,
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
                    backgroundColor: '#0f172a',
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
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontSize: 22,
                            lineHeight: 1,
                            padding: '2px 8px',
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Grid */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        padding: 6,
                        overflow: 'hidden',
                    }}
                >
                    {rows.map((row, ri) => (
                        <div
                            key={ri}
                            style={{ flex: 1, display: 'flex', gap: 6, minHeight: 0 }}
                        >
                            {row.map((item, ci) => (
                                <div
                                    key={ci}
                                    style={{
                                        flex: item.cell,   // cell: 1 | 2 | 3  →  flex shu qiymatga teng
                                        minWidth: 0,
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        background: '#1e293b',
                                    }}
                                >
                                    <iframe
                                        src={item.src}
                                        title={item.title}
                                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                                        loading="lazy"
                                        sandbox="allow-scripts allow-same-origin"
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StModal;


// ─── Ishlatish ────────────────────────────────────────────────────────────────
//
// const iframes = [
//   { src: '/chart/sales',   title: 'Sotuv',          cell: 2 },  // 2/3 kenglik
//   { src: '/chart/users',   title: 'Foydalanuvchi',  cell: 1 },  // 1/3 kenglik
//   { src: '/chart/orders',  title: 'Buyurtmalar',    cell: 1 },
//   { src: '/chart/revenue', title: 'Daromad',        cell: 1 },
//   { src: '/chart/costs',   title: 'Xarajatlar',     cell: 1 },
// ];
//
// <StModal
//   isOpen={open}
//   onClose={() => setOpen(false)}
//   iframes={iframes}
// />
//
// cell qiymati:
//   1  →  qatorning 1/3 qismini egallaydi
//   2  →  qatorning 2/3 qismini egallaydi
//   3  →  qatorning to'liq kengligini egallaydi