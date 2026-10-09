import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

type Point = { x: number; y: number }
type Spark = { angle: number; radius: number; inner: boolean; twinkle: boolean }
type Firework = { id: number; x: number; y: number; delay: number; outer: string; inner: string; sparks: Spark[] }
type Piece = {
  id: number; x: number; drift: number; spin: number; flips: number; color: string
  delay: number; duration: number; width: number; height: number; round: boolean
}

const palette = ['#ffd166', '#ef476f', '#06d6a0', '#4cc9f0', '#9b5de5', '#ff8fab', '#ffffff']
const fireworkCount = 7
const outerSparks = 40
const innerSparks = 20
const confettiCount = 160
// The rocket climbs for this long before it explodes.
const launch = 0.65
export const celebrationDuration = 4600

const random = (min: number, max: number) => min + Math.random() * (max - min)
const pick = () => palette[Math.floor(Math.random() * palette.length)]

// Built once per celebration: the first firework explodes over the card that reached Done,
// the others at random spots in the upper part of the screen.
function createScene(origin: Point) {
  const width = window.innerWidth
  const height = window.innerHeight
  const fireworks: Firework[] = Array.from({ length: fireworkCount }, (_, id) => ({
    id,
    x: id === 0 ? origin.x : random(width * 0.1, width * 0.9),
    y: id === 0 ? origin.y : random(height * 0.12, height * 0.5),
    delay: id === 0 ? 0 : random(0.25, 2.1),
    outer: pick(),
    inner: pick(),
    sparks: [
      ...Array.from({ length: outerSparks }, (_, index) => ({
        angle: (index / outerSparks) * Math.PI * 2 + random(-0.05, 0.05),
        radius: random(140, 190), inner: false, twinkle: Math.random() < 0.4,
      })),
      ...Array.from({ length: innerSparks }, (_, index) => ({
        angle: (index / innerSparks) * Math.PI * 2 + Math.PI / innerSparks,
        radius: random(55, 85), inner: true, twinkle: false,
      })),
    ],
  }))
  const confetti: Piece[] = Array.from({ length: confettiCount }, (_, id) => {
    const ribbon = Math.random() < 0.2
    const round = !ribbon && Math.random() < 0.25
    return {
      id,
      x: random(0, width),
      drift: random(-140, 140),
      spin: random(-540, 540),
      flips: Math.round(random(2, 5)) * 360,
      color: pick(),
      delay: random(0, 1.4),
      duration: random(2.6, 3.8),
      width: ribbon ? 4 : round ? 9 : random(7, 12),
      height: ribbon ? random(22, 32) : round ? 9 : random(11, 17),
      round,
    }
  })
  return { fireworks, confetti, height }
}

type CelebrationProps = { origin: Point; title: string; onDone: () => void }

// Full-screen overlay: the page dims, fireworks burst, confetti rains over the whole width
// and a headline pops in the centre. Give it a new `key` to restart; `onDone` fires once
// everything has faded.
export function Celebration({ origin, title, onDone }: CelebrationProps) {
  const [{ fireworks, confetti, height }] = useState(() => createScene(origin))

  useEffect(() => {
    const timeout = setTimeout(onDone, celebrationDuration)
    return () => clearTimeout(timeout)
  }, [onDone])

  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 2000, perspective: 800 }}>
      {/* Night sky: dims the page so the light effects stand out, in light mode too. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: celebrationDuration / 1000 - 0.2, times: [0, 0.1, 0.78, 1] }}
        style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 35%, rgba(24, 12, 54, 0.55), rgba(4, 2, 14, 0.82))' }}
      />

      {fireworks.map((firework) => {
        const burst = firework.delay + launch
        return (
          <div key={`firework-${firework.id}`}>
            {/* Rocket with a fading trail, rising from the bottom edge. */}
            <motion.div
              initial={{ x: firework.x, y: height, opacity: 0 }}
              animate={{ y: firework.y, opacity: [1, 1, 0] }}
              transition={{ duration: launch, delay: firework.delay, ease: [0.2, 0.7, 0.4, 1] }}
              style={{
                position: 'absolute', top: 0, left: -1.5, width: 3, height: 34, borderRadius: 3,
                background: `linear-gradient(to bottom, #fff, ${firework.outer} 40%, transparent)`,
                boxShadow: '0 -2px 10px 2px rgba(255, 255, 255, 0.55)',
              }}
            />
            {/* Flash of light at the moment of the explosion. */}
            <motion.div
              initial={{ x: firework.x - 130, y: firework.y - 130, opacity: 0, scale: 0.2 }}
              animate={{ opacity: [0, 0.85, 0], scale: [0.2, 1.3, 1.7] }}
              transition={{ duration: 0.9, delay: burst, ease: 'easeOut' }}
              style={{
                position: 'absolute', top: 0, left: 0, width: 260, height: 260, borderRadius: '50%',
                background: `radial-gradient(circle, #fff 0%, ${firework.outer}aa 18%, transparent 65%)`,
                mixBlendMode: 'screen',
              }}
            />
            {/* Sparks are streaks pointing outwards; the outer ring sags as it falls, some twinkle. */}
            {firework.sparks.map((spark, index) => {
              const color = spark.inner ? firework.inner : firework.outer
              const dx = Math.cos(spark.angle) * spark.radius
              const dy = Math.sin(spark.angle) * spark.radius
              const fall = spark.inner ? 25 : 70
              return (
                <motion.div
                  key={index}
                  initial={{ x: firework.x, y: firework.y, rotate: (spark.angle * 180) / Math.PI + 90, opacity: 0 }}
                  animate={{
                    x: [firework.x, firework.x + dx * 0.8, firework.x + dx],
                    y: [firework.y, firework.y + dy * 0.8, firework.y + dy + fall],
                    opacity: spark.twinkle ? [1, 1, 0.2, 1, 0.3, 0.9, 0] : [1, 1, 0],
                    scaleY: [1.8, 1, 0.4],
                  }}
                  transition={{
                    duration: spark.inner ? 1.1 : 1.7, delay: burst, ease: [0.1, 0.8, 0.3, 1],
                    opacity: { duration: spark.inner ? 1.1 : 1.7, delay: burst, ease: 'linear' },
                  }}
                  style={{
                    position: 'absolute', top: -8, left: -1.5, width: 3, height: 16, borderRadius: 3,
                    background: `linear-gradient(to top, #fff, ${color} 45%, transparent)`,
                    boxShadow: `0 0 8px 1px ${color}`, mixBlendMode: 'screen',
                  }}
                />
              )
            })}
          </div>
        )
      })}

      {/* Confetti flutters in 3D while falling; a white streak gives it a metallic sheen. */}
      {confetti.map((piece) => (
        <motion.div
          key={`confetti-${piece.id}`}
          initial={{ x: piece.x, y: -40, rotate: 0, rotateX: 0, rotateY: 0 }}
          animate={{ x: piece.x + piece.drift, y: height + 40, rotate: piece.spin, rotateX: piece.flips, rotateY: piece.flips / 2 }}
          transition={{ duration: piece.duration, delay: piece.delay, ease: [0.3, 0, 0.7, 1] }}
          style={{
            position: 'absolute', top: 0, left: 0, width: piece.width, height: piece.height,
            borderRadius: piece.round ? '50%' : 2,
            background: `linear-gradient(135deg, ${piece.color} 0%, ${piece.color} 40%, rgba(255, 255, 255, 0.85) 50%, ${piece.color} 60%)`,
          }}
        />
      ))}

      {/* Headline. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4, y: 30 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.08, 1, 0.96], y: [30, 0, 0, -10] }}
        transition={{ duration: 3.6, delay: 0.35, times: [0, 0.12, 0.85, 1], ease: 'easeOut' }}
        style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center', padding: 16,
        }}
      >
        <span style={{
          fontSize: 'clamp(3rem, 10vw, 7rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1,
          color: '#fff', textShadow: '6px 6px 0 #f07a2b',
        }}>
          Bravo !
        </span>
        <span style={{ color: '#fff', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)', fontWeight: 600, maxWidth: '40ch', opacity: 0.9 }}>
          « {title} » est terminée
        </span>
      </motion.div>
    </div>
  )
}
