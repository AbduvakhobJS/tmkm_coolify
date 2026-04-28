import React, {useEffect, useRef, useState} from 'react';
import 'gridstack/dist/gridstack.min.css';
import {GridStack} from "gridstack";
import '../App.css';
import Header from "./Header";
import LeftPanel from "./LeftPanel";
import CenterPanel from "./CenterPanel";
import RightPanel from "./RightPanel";
import Ticker from "./Ticker";

const STORAGE_KEY = 'test-grid-layout';
const DEFAULT_LAYOUT = [
    {w: 12, id: 'widget-1', x: 0, y: 0},
    {w: 4, h: 15, id: 'widget-1_1', x: 0, y: 1},
    {w: 4, h: 15, id: 'widget-1_2', x: 4, y: 1},
    {w: 4, h: 15, id: 'widget-1_3', x: 8, y: 1},
    {w: 12, id: 'widget-1_4', x: 0, y: 16},
];

const TestGrid = () => {
    const gridRef: any = useRef(null);

    useEffect(() => {
        // Initialize GridStack on the referenced element
        const grid = GridStack.init({
            cellHeight: 70,
            margin: 1,
            acceptWidgets: true,
            removable: '#trash', // example option
            draggable: {
                handle: '.grid-drag-handle',
                cancel: '.grid-stack-item-content',
            },
            resizable: {
                handles: 'se',
            },
            alwaysShowResizeHandle: true,
        }, gridRef.current);

        // Load saved layout from localStorage (if exists), otherwise fallback to default layout
        const savedLayout = localStorage.getItem(STORAGE_KEY);
        if (savedLayout) {
            try {
                const parsedLayout = JSON.parse(savedLayout);
                grid.load(Array.isArray(parsedLayout) ? parsedLayout : DEFAULT_LAYOUT);
            } catch (error) {
                console.error('Failed to parse saved grid layout:', error);
                grid.load(DEFAULT_LAYOUT);
            }
        } else {
            grid.load(DEFAULT_LAYOUT);
        }

        // Save current layout on each change
        const saveLayout = () => {
            const layout = grid.save(false);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
        };

        grid.on('change', saveLayout);

        // Optional: Cleanup on unmount
        return () => {
            grid.off('change');
            grid.destroy(false);
        };
    }, []);
    const [highlightIndex, setHighlightIndex] = useState<number>(0);


    return (
        <div className="grid-stack" ref={gridRef}>
            <div className="grid-stack-item" gs-id="widget-1" gs-w="12" gs-x="0" gs-y="0">
                <div className="grid-drag-handle" title="Drag" />
                <div className="grid-stack-item-content">
                    <Header />
                </div>
            </div>
            <div className="grid-stack-item" gs-id="widget-1_1" gs-w="4" gs-h="15" gs-x="0" gs-y="1">
                <div className="grid-drag-handle" title="Drag" />
                <div className="grid-stack-item-content">
                    <LeftPanel />
                </div>
            </div>
            <div className="grid-stack-item" gs-id="widget-1_2" gs-w="4" gs-h="15" gs-x="4" gs-y="1">
                <div className="grid-drag-handle" title="Drag" />
                <div className="grid-stack-item-content">

                    <CenterPanel highlightIndex={highlightIndex} setHighlightIndex={setHighlightIndex} />
                 </div>
            </div>
            <div className="grid-stack-item" gs-id="widget-1_3" gs-w="4" gs-h="15" gs-x="8" gs-y="1">
                <div className="grid-drag-handle" title="Drag" />
                <div className="grid-stack-item-content">
                    <RightPanel highlightIndex={highlightIndex} />
                 </div>
            </div>
            <div className="grid-stack-item" gs-id="widget-1_4" gs-w="12" gs-x="0" gs-y="16">
                <div className="grid-drag-handle" title="Drag" />
                <div className="grid-stack-item-content">
                    <Ticker />

                </div>
            </div>
        </div>
    );
};

export default TestGrid;
