import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
  round: boolean;
}

export default function Confetti({particleCount = 0}: {particleCount?:number}) {
  const [particles, setParticles] = useState<Particle[]>([]);

  React.useEffect(() => {
    if (particleCount <= 0) return;
    const colors = ['#ff0055', '#0099ff', '#00ff66', '#ffaa00'];
    
    // Génère 40 confettis avec des trajectoires aléatoires
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 300, // Dispersion horizontale
      y: -(Math.random() * 200 + 100), // Propulsion vers le haut
      rotate: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      round: Math.random() > 0.5
    }));

    setParticles(newParticles);

    // Nettoie les particules après l'animation
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
                width: '10px',
                height: '10px',
                backgroundColor: p.color,
                borderRadius: p.round ? '50%' : '0px' // Forme mixte (cercles / carrés)
              }}
            />
          ))}
        </AnimatePresence>
  );
}
