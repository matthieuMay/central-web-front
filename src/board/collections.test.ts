import { describe, expect, it } from 'vitest'
import { addChecklistItem, appendComment, replaceCard, toggleChecklistItem } from './collections'
import type { BoardData, CardComment, CardData } from '../types/board'

function card(id: string): CardData {
  return { id, title: id, assignees: [], comments: [], checklistItems: [] }
}

function board(): BoardData {
  return {
    id: 'b',
    title: 'B',
    columns: [
      { id: 'one', title: 'One', cards: [card('a'), card('b')] },
      { id: 'two', title: 'Two', cards: [card('c')] },
    ],
  }
}

describe('addChecklistItem', () => {
  it('appends a trimmed, not-done item without dropping existing ones', () => {
    const items = [{ description: 'First', done: true }]
    expect(addChecklistItem(items, '  Second  ')).toEqual([
      { description: 'First', done: true },
      { description: 'Second', done: false },
    ])
  })

  it('ignores a blank description', () => {
    const items = [{ description: 'First', done: false }]
    expect(addChecklistItem(items, '   ')).toBe(items)
  })
})

describe('toggleChecklistItem', () => {
  it('flips exactly the addressed item', () => {
    const items = [
      { description: 'A', done: false },
      { description: 'B', done: false },
    ]
    expect(toggleChecklistItem(items, 1)).toEqual([
      { description: 'A', done: false },
      { description: 'B', done: true },
    ])
  })

  it('ignores an out-of-range index', () => {
    const items = [{ description: 'A', done: false }]
    expect(toggleChecklistItem(items, 3)).toBe(items)
  })
})

describe('appendComment', () => {
  it('keeps existing comments and appends the new one without a date', () => {
    const existing: CardComment[] = [{ user: 'u1', comment: 'Hi', createdAt: '2026-01-01T00:00:00.000Z' }]
    expect(appendComment(existing, { user: 'u2', comment: 'Yo' })).toEqual([
      { user: 'u1', comment: 'Hi', createdAt: '2026-01-01T00:00:00.000Z' },
      { user: 'u2', comment: 'Yo' },
    ])
  })
})

describe('replaceCard', () => {
  it('replaces the card in place and leaves the others untouched', () => {
    const updated = { ...card('b'), title: 'B2', assignees: ['u1'] }
    const next = replaceCard(board(), updated)
    expect(next.columns[0].cards.map((entry) => entry.id)).toEqual(['a', 'b'])
    expect(next.columns[0].cards[1]).toEqual(updated)
    expect(next.columns[1].cards[0].title).toBe('c')
  })

  it('returns the board unchanged when the card is absent', () => {
    const current = board()
    expect(replaceCard(current, card('zzz'))).toEqual(current)
  })
})
