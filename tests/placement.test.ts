import assert from 'node:assert/strict'
import { test } from 'node:test'
import { placeCard } from '../src/api/placement.ts'

const board = {
  id: 'board', title: 'Board', columns: [
    { id: 'left', title: 'Left', cards: [{ id: 'A', title: 'A' }, { id: 'B', title: 'B', description: 'Keep me' }, { id: 'C', title: 'C' }, { id: 'D', title: 'D' }] },
    { id: 'right', title: 'Right', cards: [{ id: 'E', title: 'E' }] },
    { id: 'empty', title: 'Empty', cards: [] },
  ],
}
const order = (value: typeof board) => value.columns.map((column) => column.cards.map((card) => card.id))

test('same-column indices are after removal, in both directions', () => {
  assert.deepEqual(order(placeCard(board, { cardId: 'B', column: 'left', position: 2 })), [['A', 'C', 'B', 'D'], ['E'], []])
  assert.deepEqual(order(placeCard(board, { cardId: 'D', column: 'left', position: 0 })), [['D', 'A', 'B', 'C'], ['E'], []])
  assert.deepEqual(order(placeCard(board, { cardId: 'A', column: 'left', position: 3 })), [['B', 'C', 'D', 'A'], ['E'], []])
})

test('cross-column insertion, append and empty edge column preserve card data', () => {
  assert.deepEqual(order(placeCard(board, { cardId: 'B', column: 'right', position: 0 })), [['A', 'C', 'D'], ['B', 'E'], []])
  assert.deepEqual(order(placeCard(board, { cardId: 'B', column: 'right' })), [['A', 'C', 'D'], ['E', 'B'], []])
  const moved = placeCard(board, { cardId: 'B', column: 'empty', position: 0 })
  assert.equal(moved.columns[2].cards[0], board.columns[0].cards[1])
  assert.equal(moved.columns[1], board.columns[1])
  assert.deepEqual(order(board), [['A', 'B', 'C', 'D'], ['E'], []])
})

test('invalid and unchanged placement is a no-op, including replay after a missing card', () => {
  for (const input of [
    { cardId: 'B', column: 'left', position: 1 },
    { cardId: 'missing', column: 'right' },
    { cardId: 'B', column: 'missing' },
    ...[-1, 2, 0.5, NaN, Infinity].map((position) => ({ cardId: 'B', column: 'right', position })),
  ]) assert.equal(placeCard(board, input), board)
})
