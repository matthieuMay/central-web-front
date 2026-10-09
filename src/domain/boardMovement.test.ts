import { describe, expect, it } from 'vitest'
import { entersLastColumn, moveCardToPosition, moveCardWithinColumn } from './boardMovement'
import type { BoardData } from '../types/board'

const board: BoardData = {
  id: 'board',
  title: 'Board',
  columns: [
    { id: 'todo', title: 'Todo', cards: [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }, { id: 'c', title: 'C' }] },
    { id: 'done', title: 'Done', cards: [{ id: 'd', title: 'D' }] },
  ],
}

describe('board movement', () => {
  it('swaps a card with its neighbour and leaves boundaries unchanged', () => {
    expect(moveCardWithinColumn(board, 'b', 'up')?.columns[0].cards.map((card) => card.id)).toEqual(['b', 'a', 'c'])
    expect(moveCardWithinColumn(board, 'a', 'up')).toBeNull()
    expect(moveCardWithinColumn(board, 'c', 'down')).toBeNull()
  })

  it('inserts a card at an exact destination position', () => {
    const next = moveCardToPosition(board, 'a', 'todo', 2)
    expect(next?.columns[0].cards.map((card) => card.id)).toEqual(['b', 'c', 'a'])
    expect(moveCardToPosition(board, 'a', 'todo', 0)).toBeNull()
  })

  it('moves into an empty or populated destination', () => {
    const next = moveCardToPosition(board, 'a', 'done', 1)
    expect(next?.columns[0].cards.map((card) => card.id)).toEqual(['b', 'c'])
    expect(next?.columns[1].cards.map((card) => card.id)).toEqual(['d', 'a'])
  })

  it('detects entry into the last column but not reorder within it', () => {
    const entered = moveCardToPosition(board, 'a', 'done', 1)!
    expect(entersLastColumn(board, entered, 'a')).toBe(true)
    const reordered = moveCardToPosition(entered, 'a', 'done', 0)!
    expect(entersLastColumn(entered, reordered, 'a')).toBe(false)
  })
})
