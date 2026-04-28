import React, { useEffect, useState } from 'react';
import { PROJECTS } from '../data/constants';

const ProjectsSection: React.FC = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 500);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="projects-section">
      <div className="chart-title">ACTIVE PROJECTS</div>
      <div className="project-list">
        {PROJECTS.map((p, i) => (
          <div key={i} className="project-item">
            <div className="project-header">
              <span>{p.name}</span>
              <span className="project-pct">{p.pct}%</span>
            </div>
            <div className="project-bar">
              <div
                className="project-fill"
                style={{
                  width: animated ? `${p.pct}%` : '0%',
                  background: p.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsSection;
