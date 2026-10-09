import { AnimatePresence, motion } from 'motion/react'

interface Particle {
  id: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
  shape: 'circle' | 'square';
}

const colors = ['#ff0055', '#0099ff', '#00ff66', '#ffaa00']
const particles: Particle[] = Array.from({ length: 40 }, (_, index) => ({
  id: index,
  x: ((index % 8) - 3.5) * 35 + (index * 17) % 19,
  y: -(100 + (index * 37) % 200),
  rotate: (index * 97) % 360,
  color: colors[index % colors.length],
  shape: index % 2 === 0 ? 'circle' : 'square',
}))

export default function Confetti({ particleCount = 0 }: { particleCount?: number }) {
  if (particleCount <= 0) return null

  return (
    <div aria-hidden="true" style={{
      position: 'fixed',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 1500,
    }}>
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={`${particleCount}-${p.id}`}
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
                top: '35%',
                width: '10px',
                height: '10px',
                backgroundColor: p.color,
                borderRadius: p.shape === 'circle' ? '50%' : '0px',
              }}
            />
          ))}
        </AnimatePresence>
    </div>
  );
}
