import React from 'react';
import EnterExitMain from "../../components/EnterExitMain";
import Esg from "../../Parts/ESG/ESG";

/* ── Bitta slot (юқори ёки пастки катак): рамка + ном ёрлиғи, ичи overflow: hidden ── */
const Slot: React.FC<{ title?: string; children?: React.ReactNode }> = ({ title, children }) => (
    <div style={{
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--gc-panel-bg)',
        border: '1px solid rgba(14,168,199,0.2)',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    }}>
        {title && (
            <div style={{
                flexShrink: 0,
                padding: '7px 12px 6px',
                fontFamily: 'var(--font-display)',
                fontSize: '0.6rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--gc-title)',
                borderBottom: '1px solid rgba(14,168,199,0.2)',
            }}>
                {title}
            </div>
        )}
        <div style={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
            {children}
        </div>
    </div>
);

/* ── MainPart3: юқори/пастки (50%/50%) 2 та слотли универсал контейнер.
   `top`/`bottom` орқали истаган компонент узатилади, лойиҳанинг қолган
   бўлимлари (view-model, GeoModelCard) билан бир хил рамка услубида. ── */
interface MainPart3Props {
    top?: React.ReactNode;
    bottom?: React.ReactNode;
    topTitle?: string;
    bottomTitle?: string;
}

const MainPart3: React.FC<MainPart3Props> = ({ top, bottom, topTitle, bottomTitle }) => {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            minHeight: 0,
            minWidth: 0,
            overflow: 'hidden',
            boxSizing: 'border-box',
        }}>
            <Slot title={topTitle}><EnterExitMain /></Slot>
            <Slot title={bottomTitle}><Esg /></Slot>
        </div>
    );
};

export default MainPart3;
