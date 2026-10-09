import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'

const DEMO_DURATION_MS = 30_000
const CENTER = 50
const RADIUS = 42

function pointAt(angle: number) {
  const radians = (angle - 90) * Math.PI / 180
  return { x: CENTER + RADIUS * Math.cos(radians), y: CENTER + RADIUS * Math.sin(radians) }
}

function sectorPath(progress: number) {
  if (progress >= 1) return `M ${CENTER} ${CENTER - RADIUS} A ${RADIUS} ${RADIUS} 0 1 1 ${CENTER - 0.01} ${CENTER - RADIUS} Z`
  if (progress <= 0) return ''
  const end = pointAt(progress * 360)
  const largeArc = progress > 0.5 ? 1 : 0
  return `M ${CENTER} ${CENTER} L ${CENTER} ${CENTER - RADIUS} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
}

function colorFor(progress: number) {
  return `hsl(${Math.round(progress * 120)} 72% 42%)`
}

export function CountdownClock({ deadline }: { deadline: string }) {
  const deadlineTime = new Date(deadline).getTime()
  const [resetAt, setResetAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const deadlineExpired = !Number.isFinite(deadlineTime) || deadlineTime <= now
  const elapsed = now - resetAt
  const progress = deadlineExpired ? 0 : Math.max(0, 1 - elapsed / DEMO_DURATION_MS)
  const color = colorFor(progress)

  useEffect(() => {
    if (deadlineExpired) return
    const interval = window.setInterval(() => {
      const timestamp = Date.now()
      setNow(timestamp)
      if (timestamp - resetAt >= DEMO_DURATION_MS) window.clearInterval(interval)
    }, 100)
    return () => window.clearInterval(interval)
  }, [deadlineExpired, resetAt])

  function reset(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    const timestamp = Date.now()
    setResetAt(timestamp)
    setNow(timestamp)
  }

  return (
    <button type="button" className="countdown-clock" onClick={reset}
      aria-label="Réinitialiser le compte à rebours visuel"
      title={`Deadline : ${new Date(deadline).toLocaleString()}`}>
      <svg viewBox="0 0 100 100" role="img" aria-hidden="true">
        <circle className="countdown-clock__track" cx={CENTER} cy={CENTER} r={RADIUS} />
        <path d={sectorPath(progress)} fill={color} />
      </svg>
    </button>
  )
}
