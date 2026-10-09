import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

type Particle = {
  id: number
  x: number
  y: number
  rotate: number
  color: string
  circle: boolean
}

type ConfettiProps = { particleCount?: number }

function sample(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

export default function Confetti({ particleCount = 0 }: ConfettiProps) {
  const [visibleParticleCount, setVisibleParticleCount] = useState(0)
  const particles = useMemo<Particle[]>(() => {
    if (particleCount <= 0) return []

    const colors = ['#ff0055', '#0099ff', '#00cc66', '#ffaa00']
    return Array.from({ length: 40 }, (_, index) => ({
      id: particleCount * 100 + index,
      x: (sample(particleCount * 160 + index * 4 + 1) - 0.5) * 600,
      y: sample(particleCount * 160 + index * 4 + 2) * 400 + 100,
      rotate: sample(particleCount * 160 + index * 4 + 3) * 540,
      color: colors[Math.floor(sample(particleCount * 160 + index * 4 + 4) * colors.length)],
      circle: sample(particleCount * 160 + index * 4 + 5) > 0.5,
    }))
  }, [particleCount])

  useEffect(() => {
    if (particleCount <= 0) return
    const showTimeoutId = window.setTimeout(() => setVisibleParticleCount(particleCount), 0)
    const hideTimeoutId = window.setTimeout(() => setVisibleParticleCount(0), 2000)
    return () => {
      window.clearTimeout(showTimeoutId)
      window.clearTimeout(hideTimeoutId)
    }
  }, [particleCount])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <AnimatePresence>
        {visibleParticleCount === particleCount && particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
            animate={{
              x: particle.x,
              y: particle.y,
              opacity: 0,
              scale: 0.5,
              rotate: particle.rotate,
            }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '35%',
              width: 10,
              height: 10,
              backgroundColor: particle.color,
              borderRadius: particle.circle ? '50%' : 0,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
