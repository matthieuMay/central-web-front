import { describe, expect, it } from 'vitest'
import { withoutEmoji } from './withoutEmoji'

describe('withoutEmoji', () => {
  it('removes emoji from the seed titles', () => {
    expect(withoutEmoji('Sprint board 🚀')).toBe('Sprint board')
    expect(withoutEmoji('Done ✅')).toBe('Done')
    expect(withoutEmoji('Sketch the board layout ✏️')).toBe('Sketch the board layout')
    expect(withoutEmoji('Check keyboard navigation ⌨️')).toBe('Check keyboard navigation')
  })

  it('removes composed emoji: joiners, skin tones, flags, keycaps', () => {
    expect(withoutEmoji('Team 👩‍💻 sync')).toBe('Team sync')
    expect(withoutEmoji('Wave 👋🏽')).toBe('Wave')
    expect(withoutEmoji('Ship 🇫🇷')).toBe('Ship')
    expect(withoutEmoji('Step #️⃣')).toBe('Step #')
  })

  it('keeps plain text, accents and punctuation', () => {
    expect(withoutEmoji('Prêt à l’emploi : « tâche » (v2) → ok')).toBe('Prêt à l’emploi : « tâche » (v2) → ok')
  })
})
