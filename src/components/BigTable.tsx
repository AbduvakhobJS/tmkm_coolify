import React from 'react';
import { C } from './dashboardUI';
import { GC, alpha } from '../theme/palette';

/* ══════════════════════════════════════════════════════════════════════════
   BigTable — `BigCard` ichidagi jadval ("large style", video devor uchun).

   Kartaning qolgan balandligini egallaydi (`flex:1, minHeight:0`); sig'magan
   qatorlar jadval ichida aylantiriladi, sarlavha qatori yopishib turadi.
   Shriftlar karta o'lchamiga (`cqmin`) qarab o'zgaradi — `BigCard`
   `containerType: 'size'` beradi.
   ══════════════════════════════════════════════════════════════════════════ */

export type BigColumn<T> = {
    key: string;
    title: React.ReactNode;
    /** CSS kenglik (masalan '12%' yoki '140px'). Berilmasa — avtomatik. */
    width?: string;
    align?: 'left' | 'right' | 'center';
    render: (row: T, index: number) => React.ReactNode;
};

export const bigTableText = 'clamp(12px, 2.3cqmin, 17px)';
export const bigTableSub = 'clamp(11px, 1.9cqmin, 14px)';

/** Uzun matnni N qatorga qirqadi; to'liq matn sichqoncha ustiga olib borilganda. */
export const Clamp: React.FC<{ text?: string | null; lines?: number; color?: string }> = ({ text, lines = 2, color }) => {
    if (!text) return <span style={{ color: C.sub }}>—</span>;
    return (
        <span title={text} style={{
            display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            color: color ?? C.text, lineHeight: 1.35,
        }}>{text}</span>
    );
};

/** Kichik rangli yorliq (holat, tur). */
export const Tag: React.FC<{ color: string; children: React.ReactNode; title?: string }> = ({ color, children, title }) => (
    <span title={title} style={{
        display: 'inline-block', color, background: alpha(color, 0.13), border: `1px solid ${alpha(color, 0.4)}`,
        borderRadius: 6, padding: '1px 8px', fontSize: bigTableSub, fontWeight: 700, whiteSpace: 'nowrap',
    }}>{children}</span>
);

export function BigTable<T>({ columns, rows, rowKey, rowStyle, footer, fill }: {
    columns: BigColumn<T>[];
    rows: T[];
    rowKey: (row: T, index: number) => string;
    /** Qatorga qo'shimcha uslub (masalan yig'indi qatorini ajratish). */
    rowStyle?: (row: T, index: number) => React.CSSProperties | undefined;
    /** Jadval ostidagi yopishqoq qator (yig'indi va h.k.). */
    footer?: React.ReactNode;
    /** Qatorlar kam bo'lsa ular kartaning butun balandligiga cho'ziladi (bo'sh joy qolmaydi). */
    fill?: boolean;
}) {
    return (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', borderRadius: 8, border: `1px solid ${C.border}` }}>
            <table style={{ width: '100%', height: fill ? '100%' : undefined, borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'fixed' }}>
                <colgroup>
                    {columns.map((c) => <col key={c.key} style={c.width ? { width: c.width } : undefined} />)}
                </colgroup>
                <thead>
                    <tr>
                        {columns.map((c) => (
                            <th key={c.key} style={{
                                position: 'sticky', top: 0, zIndex: 1, background: C.cardAlt, color: C.sub,
                                fontSize: bigTableSub, fontWeight: 600, textAlign: c.align ?? 'left',
                                padding: 'clamp(6px, 1.3cqmin, 11px) clamp(6px, 1.2cqmin, 10px)',
                                borderBottom: `1px solid ${GC.axisLine}`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>{c.title}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={rowKey(row, i)} style={{ background: i % 2 ? 'rgba(255,255,255,0.018)' : 'transparent', ...rowStyle?.(row, i) }}>
                            {columns.map((c) => (
                                <td key={c.key} style={{
                                    color: C.text, fontSize: bigTableText, textAlign: c.align ?? 'left', verticalAlign: fill ? 'middle' : 'top',
                                    padding: 'clamp(5px, 1.1cqmin, 9px) clamp(6px, 1.2cqmin, 10px)',
                                    borderBottom: `1px solid ${C.border}`,
                                }}>{c.render(row, i)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                {footer && <tfoot>{footer}</tfoot>}
            </table>
        </div>
    );
}
