import React from "react";
import { motion } from "framer-motion";
import "./Loading.css";

const Loading = ({ fullScreen = true, size = "large" }) => {
    const sizeClasses = {
        small: "loading-small",
        medium: "loading-medium",
        large: "loading-large"
    };

    const containerClass = fullScreen ? "loading-fullscreen" : "loading-inline";
    const sizeClass = sizeClasses[size] || sizeClasses.large;

    return (
        <motion.div
            className={`loading-wrapper ${containerClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
        >
            <div className={`loading-container ${sizeClass}`}>
                <motion.div className="loading-glass-card" initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <div className="loading-swoosh">
                        <span className="loading-swoosh-line line-cyan" />
                        <span className="loading-swoosh-line line-purple" />
                        <span className="loading-swoosh-line line-magenta" />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Loading;
