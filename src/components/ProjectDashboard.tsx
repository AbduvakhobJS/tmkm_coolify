import React, { useState } from 'react';
import { C } from './dashboardUI';
import { GC } from '../theme/palette';

/* ── Neon ikonka (umumiy dizayn tizimi) ── */
const NeonIcon: React.FC<{ color?: string; size?: number; children: React.ReactNode }> = ({ size = 26, children }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(145deg, ${GC.icon}40, ${GC.icon}12)`,
        border: `1.3px solid ${GC.icon}70`,
        boxShadow: `0 0 10px ${GC.icon}55, inset 0 0 6px ${GC.icon}25`,
        color: GC.icon,
    }}>
        {children}
    </div>
);

/* ── Professional ikonka to'plami ── */
const IconImage = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="8.5" cy="9.5" r="1.7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 17l5-5 3.5 3.5L16 12l4 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconInfo = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 11v6M12 7.5h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);
const IconLayers = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l9 5-9 5-9-5 9-5z" fill="currentColor" opacity="0.85" />
        <path d="M3 13l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3 17l9 5 9-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" opacity="0.6" />
    </svg>
);
const IconDollar = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
        <path d="M12 5.5v13M15.5 8.3c0-1.3-1.4-2.3-3.5-2.3-2.3 0-3.7 1.1-3.7 2.6 0 3.4 7.2 1.7 7.2 5.1 0 1.6-1.6 2.8-4 2.8-2.1 0-3.7-1-4-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconClipboard = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <rect x="9" y="2" width="6" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.5 12h7M8.5 16h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconCheck = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconRuler = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="8" width="19" height="8" rx="1.5" transform="rotate(-8 12 12)" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 9l1 2.5M10 8.3l1 2.5M14 7.6l1 2.5M18 6.9l1 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
);
const IconTrain = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="3" width="14" height="13" rx="3" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="8.5" cy="18.5" r="1.4" fill="currentColor" />
        <circle cx="15.5" cy="18.5" r="1.4" fill="currentColor" />
        <path d="M5 10h14M8 3v5M16 3v5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7 16l-2 3M17 16l2 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
);
const IconPackage = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 7.5L12 12l8-4.5M12 12v9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
);
const IconBolt = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" opacity="0.9" />
    </svg>
);
const IconFlask = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.5 3h5M10 3v5.5L5.6 17a2 2 0 001.8 2.9h9.2a2 2 0 001.8-2.9L14 8.5V3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7.8 14.5h8.4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);
const IconUsers = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2.8 19c.6-3.4 3.1-5.5 6.2-5.5s5.6 2.1 6.2 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="17" cy="8.5" r="2.6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M15.6 13.7c2.6.2 4.6 2 5.1 4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const IconDrill = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8l8 4M3 8l4-2 8 4-4 2-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M11 12l7-3.5 3 1.5-7 3.5-3-1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M13.5 13.2L9 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
);
const IconMapPin = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21s7-6.4 7-11.5A7 7 0 105 9.5C5 14.6 12 21 12 21z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
);
const IconChevronLeft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconChevronRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* ── Ma'lumot turlari ── */
interface Project {
    id: string;
    name: string;
    corporateName: string;
    location: string;
    region: string;
    condition: string;
    status: 'Yugori' | 'Normal';
    coordinates: string;
    images: string[];
}
interface Metric { label: string; value: string; icon: React.ReactNode }
interface Construction { label: string; value: string; color: string }
interface Parameter { label: string; status: string; date: string; value: number; verified?: boolean; approved?: boolean }

/* ── Yordamchi UI komponentlar ── */
const SectionCard: React.FC<{ title: string; icon: React.ReactNode; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ title, icon, color = GC.cyan, children, style }) => (
    <div style={{ background: `linear-gradient(165deg, ${C.card}, ${C.cardAlt})`, border: `1px solid ${C.border}`, borderRadius: 13, padding: '12px 14px', display: 'flex', flexDirection: 'column', minWidth: 0, ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <NeonIcon color={color} size={26}>{icon}</NeonIcon>
            <span style={{ color: GC.cyan, fontSize: 12.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{title}</span>
        </div>
        {children}
    </div>
);

const StatusBadge: React.FC<{ text: string; tone: 'ok' | 'warn' | 'down' | 'info' }> = ({ text, tone }) => {
    const col = tone === 'ok' ? C.up : tone === 'down' ? C.down : tone === 'warn' ? GC.amber : GC.cyan;
    return (
        <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: col, background: `${col}1c`, border: `1px solid ${col}55`, whiteSpace: 'nowrap' }}>
            {text}
        </span>
    );
};

/* ── Yordamchi: API "factory" obyektidan dashboard uchun ma'lumot chiqarish ── */
const FALLBACK_IMAGES = ["/imgs/f1.png", "/imgs/f2.jpg", "/imgs/f3.png"];

const parseImages = (images: any): string[] => {
    if (!images) return [];
    if (Array.isArray(images)) return images.filter(Boolean);
    if (typeof images === 'string') {
        try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed)) return parsed.filter(Boolean);
        } catch {
            // JSON emas — vergul bilan ajratilgan bo'lishi mumkin
        }
        return images.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
};

const objectEntries = (obj: any): { label: string; value: string }[] => {
    if (!obj || typeof obj !== 'object') return [];
    return Object.entries(obj)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([k, v]) => ({ label: k, value: typeof v === 'object' ? JSON.stringify(v) : String(v) }));
};

/* ── Asosiy komponent ── */
const ProjectDashboard: React.FC<{ factory?: any }> = ({ factory }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const apiImages = parseImages(factory?.images);
    const images = apiImages.length > 0 ? apiImages : FALLBACK_IMAGES;

    const project: Project = {
        id: factory?.id !== undefined ? String(factory.id) : "—",
        name: factory?.name || factory?.projectGoal || 'Loyiha nomi ko\'rsatilmagan',
        corporateName: factory?.enterprise_name || '—',
        location: factory?.projectGoal || factory?.location || '—',
        region: factory?.region || '—',
        condition: factory?.status || '—',
        status: factory?.importance === 'HIGH' ? 'Yugori' : 'Normal',
        coordinates: factory?.coords || '—',
        images,
    };

    // "Qo'shimcha maydonlar" — API custom_fields obyektidan
    const metricIcons = [<IconRuler />, <IconTrain />, <IconPackage />, <IconBolt />, <IconFlask />, <IconUsers />, <IconDrill />];
    const metrics: Metric[] = objectEntries(factory?.custom_fields).map((e, i) => ({
        label: e.label, value: e.value, icon: metricIcons[i % metricIcons.length],
    }));

    // "Loyiha qiymatlari" — API project_values obyektidan
    const valueColors = [GC.cyan, GC.green];
    const constructions: Construction[] = objectEntries(factory?.project_values).map((e, i) => ({
        label: e.label, value: e.value, color: valueColors[i % valueColors.length],
    }));

    // "Parametrlar" — API factoryParams massividan
    const parameters: Parameter[] = (Array.isArray(factory?.factoryParams) ? factory.factoryParams : []).map((p: any) => ({
        label: p.label ?? p.name ?? p.paramName ?? p.title ?? 'Parametr',
        status: p.status ?? p.statusText ?? 'Normal',
        date: p.date ?? p.updatedAt ?? p.updated_at ?? p.createdAt ?? '',
        value: typeof p.value === 'number' ? p.value : (p.value ?? 0),
        verified: !!p.verified,
        approved: !!p.approved,
    }));

    const handlePrevImage = () => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : project.images.length - 1));
    const handleNextImage = () => setCurrentImageIndex(prev => (prev < project.images.length - 1 ? prev + 1 : 0));

    return (
        <div style={{ background: C.bg, padding: 14, boxSizing: 'border-box', fontFamily: '"Segoe UI", system-ui, sans-serif', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* Sarlavha */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <NeonIcon color={GC.cyan} size={36}><IconLayers /></NeonIcon>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ color: GC.cyan, fontSize: 18, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>Лойиҳа карточкаси № {project.id}</div>
                        <div style={{ color: C.sub, fontSize: 11.5, marginTop: 2, maxWidth: 640, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{project.name}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <StatusBadge text={project.condition} tone="warn" />
                    <StatusBadge text={`Аҳамиятлилик: ${project.status}`} tone="down" />
                </div>
            </div>

            {/* Asosiy 3 ustunli qism */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: 10, alignItems: 'stretch' }}>

                {/* 1-ustun: Loyiha rasmlari + asosiy ma'lumotlar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                    <SectionCard title="Лойиҳа расмлари" icon={<IconImage />}>
                        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}`, aspectRatio: '4/3', background: C.cardAlt }}
                            onMouseEnter={(e) => { const btns = e.currentTarget.querySelectorAll<HTMLButtonElement>('.pd-carousel-btn'); btns.forEach(b => (b.style.opacity = '1')); }}
                            onMouseLeave={(e) => { const btns = e.currentTarget.querySelectorAll<HTMLButtonElement>('.pd-carousel-btn'); btns.forEach(b => (b.style.opacity = '0')); }}
                        >
                            <img src={project.images[currentImageIndex]} alt="Project view" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(10,15,29,0.75)', backdropFilter: 'blur(6px)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, color: C.text, border: `1px solid ${C.border}` }}>
                                {currentImageIndex + 1} / {project.images.length}
                            </div>
                            <button className="pd-carousel-btn" onClick={handlePrevImage} style={{ position: 'absolute', top: '50%', left: 8, transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(10,15,29,0.7)', border: `1px solid ${C.border}`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.25s ease' }}>
                                <IconChevronLeft />
                            </button>
                            <button className="pd-carousel-btn" onClick={handleNextImage} style={{ position: 'absolute', top: '50%', right: 8, transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(10,15,29,0.7)', border: `1px solid ${C.border}`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.25s ease' }}>
                                <IconChevronRight />
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                            {project.images.map((img, idx) => (
                                <button key={idx} onClick={() => setCurrentImageIndex(idx)} style={{
                                    flex: 1, height: 52, borderRadius: 8, overflow: 'hidden', padding: 0, cursor: 'pointer',
                                    border: idx === currentImageIndex ? `2px solid ${GC.cyan}` : `2px solid ${C.border}`,
                                    opacity: idx === currentImageIndex ? 1 : 0.55, transition: 'all 0.2s ease',
                                    boxShadow: idx === currentImageIndex ? '0 4px 12px rgba(79,179,217,0.25)' : 'none',
                                }}>
                                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                </button>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title="Асосий маълумотлар" icon={<IconInfo />} style={{ flex: 1 }}>
                        <div style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 11px', marginBottom: 10 }}>
                            <div style={{ color: C.sub, fontSize: 12, lineHeight: 1.6 }}>{project.name}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                            {[
                                { label: 'Корхона номи', value: project.corporateName },
                                { label: 'Лойиҳа мақсади', value: project.location },
                                { label: 'Ҳудуд', value: project.region },
                                { label: 'Иш жараёни', value: project.condition },
                            ].map((it) => (
                                <div key={it.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 14 }}>
                                    <span style={{ color: C.sub, fontSize: 11.5, flexShrink: 0 }}>{it.label}:</span>
                                    <span style={{ color: C.text, fontSize: 11.5, fontWeight: 600, textAlign: 'right' }}>{it.value}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                                <span style={{ color: C.sub, fontSize: 11.5 }}>Координаталар:</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: GC.cyan, fontSize: 11, fontFamily: 'monospace', background: 'rgba(79,179,217,0.12)', border: '1px solid rgba(79,179,217,0.25)', borderRadius: 8, padding: '3px 8px' }}>
                                    <IconMapPin />{project.coordinates}
                                </span>
                            </div>
                        </div>
                    </SectionCard>
                </div>

                {/* 2-ustun: Qo'shimcha maydonlar + Loyiha qiymatlari */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                    <SectionCard title="Қўшимча майдонлар" icon={<IconLayers />} color={GC.violet}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {metrics.length === 0 && (
                                <div style={{ color: C.sub, fontSize: 11, textAlign: 'center', padding: '8px 0' }}>Ma'lumot yo'q</div>
                            )}
                            {metrics.map((m, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 9, background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 9, padding: '7px 9px' }}>
                                    <NeonIcon color={GC.violet} size={22}>{m.icon}</NeonIcon>
                                    <span style={{ flex: 1, color: C.sub, fontSize: 10.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.label}</span>
                                    <span style={{ color: GC.cyan, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{m.value}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    <SectionCard title="Лойиҳа қийматлари" icon={<IconDollar />} color={GC.green} style={{ flex: 1 }}>
                        <div style={{ textAlign: 'center', marginBottom: 12 }}>
                            <div style={{ color: C.sub, fontSize: 11.5, marginBottom: 4 }}>Бажарилиш фоизи</div>
                            <div style={{
                                fontSize: 46, fontWeight: 700, lineHeight: 1,
                                background: `linear-gradient(135deg, ${GC.cyan} 0%, ${GC.green} 100%)`,
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                            }}>
                                {typeof factory?.work_persent === 'number' ? `${factory.work_persent}%` : '—'}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                            {constructions.length === 0 && (
                                <div style={{ gridColumn: '1 / -1', color: C.sub, fontSize: 11, textAlign: 'center', padding: '8px 0' }}>Ma'lumot yo'q</div>
                            )}
                            {constructions.map((item, idx) => (
                                <div key={idx} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 9, padding: '8px 10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.sub, fontSize: 10, marginBottom: 4 }}>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, boxShadow: `0 0 5px ${item.color}` }} />
                                        {item.label}
                                    </div>
                                    <div style={{ fontSize: 17, fontWeight: 700, color: item.color }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>

                {/* 3-ustun: Parametrlar */}
                <SectionCard title="Параметрлар" icon={<IconClipboard />} color={GC.amber}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {parameters.length === 0 && (
                            <div style={{ color: C.sub, fontSize: 11, textAlign: 'center', padding: '8px 0' }}>Ma'lumot yo'q</div>
                        )}
                        {parameters.map((param, idx) => (
                            <div key={idx} style={{ background: C.cardAlt, border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 11px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 8 }}>
                                    <span style={{ color: C.text, fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{param.label}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                        {(param.verified || param.approved) && (
                                            <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(34,197,94,0.18)', border: `1px solid ${C.up}55`, color: C.up, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <IconCheck />
                                            </span>
                                        )}
                                        <StatusBadge text={param.status} tone={param.status === 'Yaxhi' ? 'ok' : 'warn'} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10.5 }}>
                                    <span style={{ color: C.sub }}>Қиймат: <strong style={{ color: C.text, fontWeight: 600 }}>{param.value}</strong></span>
                                    {param.date && <span style={{ color: C.sub }}>Янгиланган: {param.date}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>
        </div>
    );
};

export default ProjectDashboard;
