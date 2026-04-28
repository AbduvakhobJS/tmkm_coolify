import React, { useState, useEffect } from 'react';
import { OP_CARDS } from '../data/constants';
import { StageType } from '../types';

const STAGE_GROUPS: { stage: StageType; label: string; tag: string }[] = [
  { stage: 'upstream',   label: 'UPSTREAM',   tag: 'Exploration & Mining' },
  { stage: 'midstream',  label: 'MIDSTREAM',  tag: 'Processing & Transport' },
  { stage: 'downstream', label: 'DOWNSTREAM', tag: 'Finished Products' },
];

interface OpValue {
  id: string;
  value: string;
}

const PipelineSection: React.FC = () => {
  const [opValues, setOpValues] = useState<OpValue[]>(
    OP_CARDS.map(c => ({ id: c.id, value: c.base.toLocaleString('en-US') + ' t' }))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setOpValues(OP_CARDS.map(c => ({
        id: c.id,
        value: (c.base + Math.round((Math.random() - 0.5) * c.range)).toLocaleString('en-US') + ' t',
      })));
    }, 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pipeline-section">
      <div className="panel-label">INDUSTRIAL VALUE CHAIN — OPERATIONAL STAGES</div>
      <div className="pipeline-cards">
        {STAGE_GROUPS.map((g, gi) => {
          const cards = OP_CARDS.filter(c => c.stage === g.stage);
          return (
            <React.Fragment key={g.stage}>
              {gi > 0 && <div className="stage-arrow">→</div>}
              <div className={`stage-group ${g.stage}`}>
                <div className="stage-header">
                  <span className="stage-dot" />
                  <span className="stage-name">{g.label}</span>
                  <span className="stage-tag">{g.tag}</span>
                </div>
                <div className="stage-cards">
                  {cards.map(card => {
                    const val = opValues.find(v => v.id === card.id)?.value ?? '';
                    return (
                      <div key={card.id} className="op-card" data-stage={g.stage}>
                        <div className="op-icon">{card.icon}</div>
                        <div className="op-title">{card.title}</div>
                        <div className="op-value">{val}</div>
                        <div className="op-bar">
                          <div
                            className="op-fill"
                            style={{
                              width: `${card.capacityPct}%`,
                              background:
                                g.stage === 'upstream'   ? 'var(--upstream-color)' :
                                g.stage === 'midstream'  ? 'var(--midstream-color)' :
                                'var(--downstream-color)',
                            }}
                          />
                        </div>
                        <div className="op-sub">{card.capacityLabel}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineSection;
