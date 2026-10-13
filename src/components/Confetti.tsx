import { useCallback, useEffect, useImperativeHandle, useRef, useState, useSyncExternalStore, type Ref } from 'react'
import { motion } from 'motion/react'

interface Particle {
  id: string
  x: number
  y: number
  rotate: number
  color: string
  rounded: boolean
}

export type ConfettiHandle = { celebrate: () => void }
const reducedMotionQuery = '(prefers-reduced-motion: reduce)'
const colors = ['#ff0055', '#0099ff', '#00ff66', '#ffaa00']
function prefersReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches
}

export default function Confetti({ ref }: { ref: Ref<ConfettiHandle> }) {
  const [particles, setParticles] = useState<Particle[]>([])
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const eventId = useRef(0)

  const subscribe = useCallback((onChange: () => void) => {
    const preference = window.matchMedia(reducedMotionQuery)
    function onPreferenceChange() {
      if (preference.matches) {
        if (timeout.current !== null) clearTimeout(timeout.current)
        timeout.current = null
        setParticles([])
      }
      onChange()
    }
    preference.addEventListener('change', onPreferenceChange)
    return () => preference.removeEventListener('change', onPreferenceChange)
  }, [])
  const reducedMotion = useSyncExternalStore(subscribe, prefersReducedMotion)

  useImperativeHandle(ref, () => ({
    celebrate() {
      // Consume only a new confirmed event; turning motion back on never replays it.
      if (prefersReducedMotion()) return
      if (timeout.current !== null) clearTimeout(timeout.current)
      const id = ++eventId.current
      setParticles(Array.from({ length: 40 }, (_, index) => ({
        id: `${id}-${index}`,
        x: (Math.random() - 0.5) * 300,
        y: -(Math.random() * 200 + 100),
        rotate: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        rounded: Math.random() > 0.5,
      })))
      timeout.current = setTimeout(() => {
        setParticles([])
        timeout.current = null
      }, 2000)
    },
  }), [])

  useEffect(() => () => {
    if (timeout.current !== null) clearTimeout(timeout.current)
  }, [])

  if (reducedMotion || particles.length === 0) return null
  return (
    <div aria-hidden="true" data-confetti="" style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 50 }}>
      {particles.map(particle => (
        <motion.div key={particle.id} data-confetti-particle=""
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{ x: particle.x, y: particle.y, rotate: particle.rotate, opacity: 0, scale: 0.5 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ position: 'absolute', left: '50%', top: '55%', width: '10px', height: '10px',
            backgroundColor: particle.color, borderRadius: particle.rounded ? '50%' : '0px' }} />
      ))}
    </div>
  )
}
