import { describe, expect, it } from 'vitest'
import type { BoardData } from '../types/board'
import { addChecklistItem, appendComment, applyCollectionsPatch, toggleAssignee, toggleChecklistItem } from './collections'

describe('toggleAssignee', () => {
  it('adds a person without dropping the others', () => {
    expect(toggleAssignee(['a', 'b'], 'c')).toEqual(['a', 'b', 'c'])
    expect(toggleAssignee([], 'a')).toEqual(['a'])
  })

  it('removes only that person', () => {
    expect(toggleAssignee(['a', 'b', 'c'], 'b')).toEqual(['a', 'c'])
  })
})

describe('checklist', () => {
  const items = [{ description: 'one', done: false }, { description: 'two', done: true }, { description: 'three', done: false }]

  it('flips only the item at the index', () => {
    expect(toggleChecklistItem(items, 1)).toEqual([items[0], { description: 'two', done: false }, items[2]])
    expect(toggleChecklistItem(toggleChecklistItem(items, 0), 0)).toEqual(items)
  })

  it('appends an unchecked, trimmed item and keeps the rest', () => {
    expect(addChecklistItem(items, '  four ')).toEqual([...items, { description: 'four', done: false }])
    expect(addChecklistItem([], 'first')).toEqual([{ description: 'first', done: false }])
  })
})

describe('appendComment', () => {
  it('keeps existing dates and sends the new comment undated', () => {
    const existing = [{ user: 'a', comment: 'hi', createdAt: '2026-10-01T10:00:00.000Z' }]
    const next = appendComment(existing, 'b', ' hello ')
    expect(next).toEqual([existing[0], { user: 'b', comment: 'hello' }])
    expect(next[1]).not.toHaveProperty('createdAt')
  })
})

describe('applyCollectionsPatch', () => {
  const board: BoardData = {
    id: 'board',
    title: 'Board',
    columns: [{ id: 'todo', title: 'Todo', cards: [
      { id: 'x', title: 'X', assignees: ['a'], comments: [], checklistItems: [{ description: 'one', done: false }] },
      { id: 'y', title: 'Y', assignees: ['b'] },
    ] }],
  }

  it('replaces only the lists sent, on the target card only', () => {
    const next = applyCollectionsPatch(board, 'x', { assignees: ['a', 'c'] })
    expect(next.columns[0].cards[0]).toEqual({ ...board.columns[0].cards[0], assignees: ['a', 'c'] })
    expect(next.columns[0].cards[1]).toBe(board.columns[0].cards[1])
  })

  it('leaves comments to the refetch', () => {
    const next = applyCollectionsPatch(board, 'x', { comments: [{ user: 'a', comment: 'new' }] })
    expect(next.columns[0].cards[0]).toEqual(board.columns[0].cards[0])
  })
})
