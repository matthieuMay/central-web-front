// x and y: how far the particle flies from the burst's starting point.
export type Particle = { id: number; x: number; y: number; rotate: number; color: string; isCircle: boolean }

// One burst of confetti, starting from the point (x, y) of the window.
export type Burst = { id: number; x: number; y: number; particles: Particle[] }

const colors = ['#ff0055', '#0099ff', '#00ff66', '#ffaa00']

// Uses Math.random, so call it from an event or a callback, never while rendering.
export function makeBurst(x: number, y: number): Burst {
  const particles = Array.from({ length: 40 }, (_, id) => ({
    id,
    x: (Math.random() - 0.5) * 300, // horizontal spread
    y: -(Math.random() * 200 + 100), // pushed upwards
    rotate: Math.random() * 360,
    color: colors[Math.floor(Math.random() * colors.length)],
    isCircle: Math.random() > 0.5, // mix of circles and squares
  }))
  return { id: Date.now(), x, y, particles }
}

// Where a card really sits in the window (top centre). getBoundingClientRect would
// include the card's move animation, which may still be running; offsetLeft/offsetTop don't.
export function cardOrigin(card: HTMLElement) {
  let x = card.offsetWidth / 2
  let y = 0
  for (let node: HTMLElement | null = card; node; node = node.offsetParent as HTMLElement | null) {
    x += node.offsetLeft
    y += node.offsetTop
  }
  return { x: x - window.scrollX, y: y - window.scrollY }
}
