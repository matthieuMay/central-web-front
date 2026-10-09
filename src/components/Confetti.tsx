import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface Particle {
  id: number
  x: number
  y: number
  rotate: number
  color: string
  round: boolean
}

const COLORS = ['#ff0055', '#0099ff', '#00ff66', '#ffaa00']

function createParticles(): Particle[] {
  // Génère 60 confettis avec des trajectoires aléatoires
  return Array.from({ length: 60 }).map((_, i) => ({
    id: Date.now() + i,
    x: (Math.random() - 0.5) * 500, // Dispersion horizontale
    y: -(Math.random() * 300 + 150), // Propulsion vers le haut
    rotate: Math.random() * 720,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    round: Math.random() > 0.5, // Forme mixte (cercles / carrés)
  }))
}

export default function Confetti({ origin }: { origin?: { x: number; y: number } }) {
  const [particles, setParticles] = useState<Particle[]>(createParticles)

  useEffect(() => {
    // Nettoie les particules après l'animation
    const timeoutId = setTimeout(() => setParticles([]), 2200)
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1500,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: origin ? origin.x : '50%',
          top: origin ? origin.y : '50%',
        }}
      >
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
                scale: 0.5,
              }}
              transition={{
                duration: 1.6,
                ease: 'easeOut',
              }}
              style={{
                position: 'absolute',
                width: '10px',
                height: '10px',
                backgroundColor: p.color,
                borderRadius: p.round ? '50%' : '0px',
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
