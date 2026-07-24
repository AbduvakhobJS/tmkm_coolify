import React from "react";
import { motion } from "framer-motion";
import type { WidgetGroup, WidgetMetric } from "../types";

const VALUE_TONE_CLASS: Record<NonNullable<WidgetMetric["tone"]>, string> = {
    normal: "",
    good: "fm-widget__value--good",
    warning: "fm-widget__value--warning",
    danger: "fm-widget__value--danger",
};

interface GlassWidgetProps {
    group: WidgetGroup;
    /** Stagger index used to sequence the fade-in animation. */
    index: number;
}

/**
 * A single glassmorphism dashboard card. Reusable across both side panels — it
 * simply renders whatever {@link WidgetGroup} it is given.
 */
const GlassWidget: React.FC<GlassWidgetProps> = ({ group, index }) => {
    const HeadIcon = group.icon;

    return (
        <motion.div
            className="fm-widget"
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
        >
            <div className="fm-widget__head">
                <span className="fm-widget__head-icon">
                    <HeadIcon size={16} />
                </span>
                <span className="fm-widget__title">{group.title}</span>
            </div>

            {group.metrics.map((metric) => {
                const RowIcon = metric.icon;
                return (
                    <div key={metric.id} className="fm-widget__row">
                        <span className="fm-widget__label">
                            <RowIcon size={13} />
                            {metric.label}
                        </span>
                        <span className={`fm-widget__value ${VALUE_TONE_CLASS[metric.tone ?? "normal"]}`}>
                            {metric.value}
                            {metric.unit && <span className="fm-widget__unit">{metric.unit}</span>}
                        </span>
                    </div>
                );
            })}
        </motion.div>
    );
};

export default React.memo(GlassWidget);
