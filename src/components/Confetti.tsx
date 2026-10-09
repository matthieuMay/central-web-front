import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

export default function Confetti({ particleCount = 0 }: { particleCount?: number }) {
  const reducedMotion = useReducedMotion()
  const [particles, setParticles] = useState(() => {
    const colors = ['#ff0055', '#0099ff', '#00cc88', '#ffaa00']
    return Array.from({ length: particleCount }, (_, id) => ({
      id,
      x: (Math.random() - 0.5) * 220,
      y: -(Math.random() * 100 + 40),
      rotate: (Math.random() - 0.5) * 540,
      color: colors[Math.floor(Math.random() * colors.length)],
      round: Math.random() > 0.5,
    }))
  })

  useEffect(() => {
    const timeout = setTimeout(() => setParticles([]), 1000)
    return () => clearTimeout(timeout)
  }, [])

  if (reducedMotion || particles.length === 0) return null
  return (
    <div aria-hidden="true" data-confetti-burst="" style={{ position: 'absolute', left: '50%', top: '50%', pointerEvents: 'none', zIndex: 5 }}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)', opacity: 1 }}
          animate={{ transform: `translate3d(${particle.x}px, ${particle.y}px, 0) rotate(${particle.rotate}deg) scale(0.6)`, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          style={{ position: 'absolute', width: 6, height: 9, background: particle.color, borderRadius: particle.round ? '50%' : 1 }}
        />
      ))}
    </div>
  )
}
