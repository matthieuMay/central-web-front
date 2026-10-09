import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
}

export default function Confetti({particleCount = 0}: {particleCount?:number}) {
  const [particles, setParticles] = useState<Particle[]>([]);

  React.useEffect(() => {
    if (particleCount <= 0) return;
    const colors = ['#ff0055', '#0099ff', '#00ff66', '#ffaa00'];
    
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 300,
      y: -(Math.random() * 200 + 100),
      rotate: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    setParticles(newParticles);

    const timeoutId = setTimeout(() => setParticles([]), 2000);
    return () => clearTimeout(timeoutId);
  },[particleCount]);

  return (
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
              animate={{ 
                x: p.x, 
                y: p.y, 
                rotate: p.rotate,
                opacity: 0,
                scale: 0.5
              }}
              transition={{ 
                duration: 1.5, 
                ease: "easeOut" 
              }}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '10px',
                height: '10px',
                backgroundColor: p.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '0px',
                pointerEvents: 'none',
              }}
            />
          ))}
        </AnimatePresence>
  );
}
