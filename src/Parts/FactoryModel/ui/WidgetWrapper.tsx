import React from "react";
import { motion } from "framer-motion";

interface WidgetWrapperProps {
    title: string;
    icon?: React.ElementType;
    extra?: React.ReactNode;
    children: React.ReactNode;
    index: number;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({
    title,
    icon: Icon,
    extra,
    children,
    index,
}) => {
    return (
        <motion.div
            className="fm-widget"
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.45, delay: index * 0.07, ease: "easeOut" }}
        >
            <div className="fm-widget__head">
                <div className="fm-widget__head-left">
                    {Icon && (
                        <span className="fm-widget__head-icon">
                            <Icon size={14} />
                        </span>
                    )}
                    <span className="fm-widget__title">{title}</span>
                </div>
                {extra && <div className="fm-widget__head-extra">{extra}</div>}
            </div>
            <div className="fm-widget__content">{children}</div>
        </motion.div>
    );
};

export default React.memo(WidgetWrapper);
