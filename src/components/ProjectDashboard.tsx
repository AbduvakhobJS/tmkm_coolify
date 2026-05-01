import React, { useState } from 'react';
import './dashboard.css';

interface Project {
    id: string;
    name: string;
    organization: string;
    description: string;
    corporateName: string;
    location: string;
    technologiesUsed: string;
    region: string;
    condition: string;
    status: 'Yugori' | 'Normal';
    coordinates: string;
    images: string[];
}

interface Metric {
    label: string;
    value: string;
    icon: string;
}

interface Construction {
    label: string;
    value: string;
}

const ProjectDashboard: React.FC = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const project: Project = {
        id: "383",
        name: "«Наводий КМК» АЖ 3-сон Лойиҳавидрометаллургия заводи техноген номи: чикиндиларидан йўлдош ажратиб олиш технологиясини ишлаб чикиш",
        organization: "«Узбекистон ТМК» АЖ",
        description: "Чикиндилардан йўлдош металларни ажратиб олиш технологиясини ишлаб чикиш",
        corporateName: "«Узбекистон ТМК» АЖ",
        location: "Чикиндилардан йўлдош металларни ажратиб олиш технологиясини ишлаб чикиш",
        technologiesUsed: "Наводий вилояти, Учқудуқ тумани",
        region: "Наводий вилояти, Учқудуқ тумани",
        condition: "Rasmiylashtirilgan jarayenda",
        status: "Yugori",
        coordinates: "42.287819, 63.389067",
        images: [
            "/imgs/f1.png",
            "/imgs/f2.jpg",
            "/imgs/f3.png"
        ]
    };

    const metrics: Metric[] = [
        { label: "Maydoni:", value: "765 Га", icon: "📐" },
        { label: "Temir yo'lgacha:", value: "15 км", icon: "🚂" },
        { label: "Чиқинди захираси:", value: "171,5 млн тн", icon: "📦" },
        { label: "Электр энергигача:", value: "1 км", icon: "⚡" },
        { label: "Йўлдош компонентлар:", value: "Au, Ag, W, Sb, Sb, Ga", icon: "🧪" },
        { label: "Аҳоли пункти:", value: "27 км", icon: "👥" },
        { label: "Фойдали қазилмаларни ётиш чуқурлиги:", value: "25 метр", icon: "⛏️" }
    ];

    const constructions: Construction[] = [
        { label: "Burg'ulash:", value: "883" },
        { label: "Sinovlar:", value: "150$" },
        { label: "Namunalar:", value: "455" },
        { label: "Resurslar:", value: "50$" }
    ];

    const parameters = [
        { label: "ТЕО", status: "Yaxhi", date: "2025-11-12", value: 1 },
        { label: "Қурилманар рўйхати", status: "Normal", date: "", value: 0 },
        { label: "Қурилиши тугатиш санаси", status: "Normal", date: "2025-11-20 / 2026-11-12", value: 0 },
        { label: "Таклифлар олиниши", status: "Nepmal", date: "", value: 0 },
        { label: "Қурилиш лойиҳаси", status: "Normal", date: "", value: 0 },
        { label: "Концепция", status: "Normal", date: "2025-11-12", value: 0, verified: true },
        { label: "Қурилиш лойиҳаси", status: "Normal", date: "", value: 0 },
        { label: "Концепция", status: "Normal", date: "2025-11-12", value: 0, verified: true },
        { label: "Қурилиш лойиҳаси", status: "Normal", date: "", value: 0 },
        { label: "Лойиҳалаш (Layout)", status: "Normal", date: "2025-11-12", value: 1, approved: true }
    ];

    const handlePrevImage = () => {
        setCurrentImageIndex(prev => prev > 0 ? prev - 1 : project.images.length - 1);
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev => prev < project.images.length - 1 ? prev + 1 : 0);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-grid">

                {/* Left Panel - Project Images */}
                <div className="panel panel-left">
                    <div className="panel-header">
                        <div className="header-icon">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2>Loyiha rasmlari</h2>
                    </div>

                    <div className="image-carousel">
                        <div className="main-image">
                            <img src={project.images[currentImageIndex]} alt="Project view" />
                            <div className="image-counter">
                                {currentImageIndex + 1} / {project.images.length}
                            </div>
                        </div>

                        <button className="carousel-btn carousel-btn-prev" onClick={handlePrevImage}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button className="carousel-btn carousel-btn-next" onClick={handleNextImage}>
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="thumbnail-list">
                        {project.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`thumbnail ${idx === currentImageIndex ? 'thumbnail-active' : ''}`}
                            >
                                <img src={img} alt="" />
                            </button>
                        ))}
                    </div>

                    <div className="project-info">
                        <div className="info-header">
                            <div className="header-icon">
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3>Asosiy ma'lumotlar</h3>
                        </div>

                        <div className="project-description">
                            <p>{project.name}</p>
                        </div>

                        <div className="info-list">
                            <div className="info-item">
                                <span className="info-label">Корхона номи:</span>
                                <span className="info-value">{project.corporateName}</span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Лойиҳа макқади:</span>
                                <span className="info-value">{project.location}</span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Худуд:</span>
                                <span className="info-value">{project.region}</span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Иш жараёни:</span>
                                <span className="info-value">-‰</span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Ҳолат:</span>
                                <span className="badge badge-warning">
                  Rasmiylashtirilgan jarayenda
                </span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Аҳамиятлилик:</span>
                                <span className="badge badge-danger">
                  Yugori
                </span>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Координаталар:</span>
                                <span className="badge badge-info">
                  {project.coordinates}
                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Panel - Metrics */}
                <div className="panel panel-middle">
                    <div className="panel-header">
                        <div className="header-icon">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h2>Qo'shimcha maydonlar</h2>
                    </div>

                    <div className="metrics-list">
                        {metrics.map((metric, idx) => (
                            <div key={idx} className="metric-item">
                                <div className="metric-left">
                                    <span className="metric-icon">{metric.icon}</span>
                                    <span className="metric-label">{metric.label}</span>
                                </div>
                                <span className="metric-value">{metric.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="project-value-card">
                        <div className="value-header">
                            <div className="header-icon">
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3>Loyiha qiymatlari</h3>
                        </div>

                        <div className="value-display">
                            <div className="value-label">Лойиҳанинг қиймати</div>
                            <div className="value-number">
                                {project.id}
                                <div className="value-icon">
                                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <div className="value-currency">ming dollar</div>
                        </div>

                        <div className="constructions-grid">
                            {constructions.map((item, idx) => (
                                <div key={idx} className={`construction-item ${idx % 2 === 0 ? 'construction-primary' : 'construction-success'}`}>
                                    <div className="construction-label">
                                        <span className="construction-dot"></span>
                                        {item.label}
                                    </div>
                                    <div className="construction-value">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Parameters */}
                <div className="panel panel-right">
                    <div className="panel-header">
                        <div className="header-icon">
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h2>Parametrlar</h2>
                    </div>

                    <div className="parameters-list">
                        {parameters.map((param, idx) => (
                            <div key={idx} className="parameter-item">
                                <div className="parameter-header">
                                    <span className="parameter-label">{param.label}</span>
                                    <div className="parameter-badges">
                                        {param.verified && (
                                            <div className="verified-badge">
                                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                        {param.approved && (
                                            <div className="verified-badge">
                                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                        <span className={`parameter-status ${param.status === 'Yaxhi' ? 'status-success' : 'status-warning'}`}>
                      {param.status}
                    </span>
                                    </div>
                                </div>
                                <div className="parameter-footer">
                  <span className="parameter-value">
                    Қиймат: <strong>{param.value}</strong>
                  </span>
                                    {param.date && (
                                        <span className="parameter-date">
                      Янгиланган: {param.date}
                    </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDashboard;