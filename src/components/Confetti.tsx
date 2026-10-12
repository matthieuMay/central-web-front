import { motion, useReducedMotion } from 'motion/react'
import type { Burst } from './confettiBurst'

// Shows one burst of confetti on top of the page. It never blocks clicks and never
// moves the layout. People who ask for reduced motion get nothing here.
export default function Confetti({ burst }: { burst: Burst | null }) {
  const reducedMotion = useReducedMotion()
  if (!burst || reducedMotion) return null

  return (
    // zIndex 1300: above the board, below Chakra's drawer (1400).
    <div aria-hidden="true" style={{ position: 'fixed', left: burst.x, top: burst.y, pointerEvents: 'none', zIndex: 1300 }}>
      {burst.particles.map((p) => (
        <motion.div
          key={`${burst.id}-${p.id}`}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: p.x, y: p.y, rotate: p.rotate, opacity: 0, scale: 0.5 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ position: 'absolute', width: '10px', height: '10px', backgroundColor: p.color, borderRadius: p.isCircle ? '50%' : '0px' }}
        />
      ))}
    </div>
  )
}
