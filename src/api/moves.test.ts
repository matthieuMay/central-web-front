import { describe, expect, it } from 'vitest'
import type { BoardData } from '../types/board'
import { dropPosition, moveCardInBoard } from './moves'

function board(columns: Record<string, string[]>): BoardData {
  return {
    id: 'board',
    title: 'Board',
    columns: Object.entries(columns).map(([id, cards]) => ({ id, title: id, cards: cards.map((card) => ({ id: card, title: card })) })),
  }
}

function order(data: BoardData) {
  return Object.fromEntries(data.columns.map((column) => [column.id, column.cards.map((card) => card.id)]))
}

describe('moveCardInBoard', () => {
  const start = board({ todo: ['a', 'b', 'c'], doing: ['d'], done: [] })

  it('appends to the destination when no position is given', () => {
    expect(order(moveCardInBoard(start, { cardId: 'a', column: 'doing' }))).toEqual({ todo: ['b', 'c'], doing: ['d', 'a'], done: [] })
  })

  it('inserts at the position counted without the moved card', () => {
    expect(order(moveCardInBoard(start, { cardId: 'a', column: 'todo', position: 1 }))).toEqual({ todo: ['b', 'a', 'c'], doing: ['d'], done: [] })
    expect(order(moveCardInBoard(start, { cardId: 'c', column: 'todo', position: 0 }))).toEqual({ todo: ['c', 'a', 'b'], doing: ['d'], done: [] })
    expect(order(moveCardInBoard(start, { cardId: 'b', column: 'doing', position: 0 }))).toEqual({ todo: ['a', 'c'], doing: ['b', 'd'], done: [] })
  })

  it('accepts a card in an empty column', () => {
    expect(order(moveCardInBoard(start, { cardId: 'd', column: 'done', position: 0 }))).toEqual({ todo: ['a', 'b', 'c'], doing: [], done: ['d'] })
  })

  it('clamps out-of-range positions', () => {
    expect(order(moveCardInBoard(start, { cardId: 'a', column: 'done', position: 9 })).done).toEqual(['a'])
    expect(order(moveCardInBoard(start, { cardId: 'c', column: 'todo', position: -3 })).todo).toEqual(['c', 'a', 'b'])
  })

  it('leaves the board untouched for an unknown card', () => {
    expect(moveCardInBoard(start, { cardId: 'zzz', column: 'done' })).toBe(start)
  })

  it('does not mutate the input board', () => {
    moveCardInBoard(start, { cardId: 'a', column: 'done' })
    expect(order(start)).toEqual({ todo: ['a', 'b', 'c'], doing: ['d'], done: [] })
  })
})

describe('dropPosition', () => {
  const start = board({ todo: ['a', 'b', 'c'], done: [] })

  it('keeps the slot index when moving up or to another column', () => {
    expect(dropPosition(start, 'c', 'todo', 0)).toBe(0)
    expect(dropPosition(start, 'b', 'done', 0)).toBe(0)
  })

  it('subtracts the dragged card when moving down its own column', () => {
    expect(dropPosition(start, 'a', 'todo', 2)).toBe(1)
    expect(dropPosition(start, 'a', 'todo', 3)).toBe(2)
  })

  it('returns null when the card would land where it already is', () => {
    expect(dropPosition(start, 'b', 'todo', 1)).toBeNull()
    expect(dropPosition(start, 'b', 'todo', 2)).toBeNull()
  })

  it('returns null for an unknown card', () => {
    expect(dropPosition(start, 'zzz', 'todo', 0)).toBeNull()
  })

  it('agrees with moveCardInBoard on the resulting order', () => {
    const position = dropPosition(start, 'a', 'todo', 3)
    expect(position).not.toBeNull()
    expect(order(moveCardInBoard(start, { cardId: 'a', column: 'todo', position: position! })).todo).toEqual(['b', 'c', 'a'])
  })
})
