import ConfettiEffect from 'react-confetti'
import { useReducedMotion } from 'motion/react'

export default function Confetti({ particleCount = 0 }: { particleCount?: number }) {
  const reducedMotion = useReducedMotion()

  if (particleCount <= 0 || reducedMotion) return null

  return (
    <ConfettiEffect
      width={240}
      height={160}
      numberOfPieces={80}
      recycle={false}
      gravity={0.2}
      initialVelocityY={8}
      aria-hidden
      style={{ pointerEvents: 'none', position: 'absolute', inset: 0, zIndex: 1 }}
    />
  )
}
