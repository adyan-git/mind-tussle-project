import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './ParticleBackground.css';

const PREMIUM_COLORS = {
  primary: '#a855f7',
  secondary: '#ec4899',
  success: '#22d3ee',
  info: '#38bdf8',
  warning: '#f472b6',
};

const ParticleBackground = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const particleCount = 32;
    const baseOpacity = [0.08, 0.22, 0.08];
    const movement = { x: 28, y: 70 };
    const duration = { min: 18, max: 32 };

    setParticles(
      Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        initialX: Math.random() * 100,
        initialY: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        duration: Math.random() * (duration.max - duration.min) + duration.min,
        opacity: baseOpacity,
        movement,
        colors: PREMIUM_COLORS,
      }))
    );
  }, []);

  return (
    <div className="particle-background" aria-hidden="true">
      {particles.map((particle) => {
        let particleColor = particle.colors.primary;
        if (particle.id % 5 === 0) particleColor = particle.colors.warning;
        else if (particle.id % 3 === 0) particleColor = particle.colors.success;
        else if (particle.id % 2 === 0) particleColor = particle.colors.secondary;
        else if (particle.id % 7 === 0) particleColor = particle.colors.info;

        return (
          <motion.div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.initialX}%`,
              top: `${particle.initialY}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particleColor,
              boxShadow: `0 0 ${particle.size * 3}px ${particleColor}`,
            }}
            animate={{
              y: [0, -particle.movement.y, 0],
              x: [0, Math.random() * particle.movement.x - particle.movement.x / 2, 0],
              opacity: particle.opacity,
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
};

export default ParticleBackground;
