import { describe, expect, it } from 'vitest'
import { applyMove, keyboardMove } from './move'
import type { BoardData } from '../types/board'

function makeBoard(): BoardData {
  return {
    id: 'board',
    title: 'Board',
    columns: [
      {
        id: 'todo',
        title: 'Todo',
        cards: [
          { id: 'a', title: 'A' },
          { id: 'b', title: 'B' },
          { id: 'c', title: 'C' },
        ],
      },
      { id: 'doing', title: 'Doing', cards: [{ id: 'd', title: 'D' }] },
      { id: 'done', title: 'Done', cards: [{ id: 'e', title: 'E' }] },
    ],
  }
}

function ids(board: BoardData, columnId: string) {
  return board.columns.find((column) => column.id === columnId)!.cards.map((card) => card.id)
}

describe('applyMove', () => {
  it('reorders within a column, counting the position after removal', () => {
    const moved = applyMove(makeBoard(), 'a', 'todo', 2)
    expect(ids(moved, 'todo')).toEqual(['b', 'c', 'a'])
  })

  it('moves across columns and inserts at the position', () => {
    const moved = applyMove(makeBoard(), 'a', 'doing', 0)
    expect(ids(moved, 'todo')).toEqual(['b', 'c'])
    expect(ids(moved, 'doing')).toEqual(['a', 'd'])
  })

  it('appends when the position is omitted', () => {
    const moved = applyMove(makeBoard(), 'a', 'doing')
    expect(ids(moved, 'doing')).toEqual(['d', 'a'])
  })

  it('accepts a drop into an empty column', () => {
    const board = makeBoard()
    board.columns[1].cards = []
    const moved = applyMove(board, 'a', 'doing', 0)
    expect(ids(moved, 'doing')).toEqual(['a'])
  })
})

describe('keyboardMove', () => {
  it('stops at the top of a column', () => {
    expect(keyboardMove(makeBoard(), 'a', 'ArrowUp')).toBeNull()
  })

  it('stops at the bottom of a column', () => {
    expect(keyboardMove(makeBoard(), 'c', 'ArrowDown')).toBeNull()
  })

  it('moves one step down within a column', () => {
    expect(keyboardMove(makeBoard(), 'a', 'ArrowDown')).toEqual({ column: 'todo', position: 1 })
  })

  it('stops at the first column', () => {
    expect(keyboardMove(makeBoard(), 'a', 'ArrowLeft')).toBeNull()
  })

  it('stops at the last column', () => {
    expect(keyboardMove(makeBoard(), 'e', 'ArrowRight')).toBeNull()
  })

  it('crosses to the next column preserving the position', () => {
    expect(keyboardMove(makeBoard(), 'a', 'ArrowRight')).toEqual({ column: 'doing', position: 0 })
  })

  it('clamps the position to a shorter destination column', () => {
    expect(keyboardMove(makeBoard(), 'c', 'ArrowRight')).toEqual({ column: 'doing', position: 1 })
  })
})
