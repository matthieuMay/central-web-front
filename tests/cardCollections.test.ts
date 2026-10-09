import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildCardCollectionsPatch } from '../src/api/cardCollections.ts'
import type { CardData } from '../src/types/board.ts'

const card: CardData = {
  id: 'A', title: 'Card', description: 'Keep', assignees: ['unknown', 'A'],
  comments: [{ user: 'unknown', comment: 'Existing', createdAt: '2026-10-09T10:00:00.000+02:00' }],
  checklistItems: [{ description: 'Same', done: false }, { description: 'Same', done: true }],
}

test('assignee actions preserve unknown references, avoid duplicates, and explicitly empty the list', () => {
  assert.deepEqual(buildCardCollectionsPatch(card, { type: 'set-assignee', userId: 'B', assigned: true }), { assignees: ['unknown', 'A', 'B'] })
  assert.deepEqual(buildCardCollectionsPatch(card, { type: 'set-assignee', userId: 'A', assigned: true }), { assignees: ['unknown', 'A'] })
  assert.deepEqual(buildCardCollectionsPatch(card, { type: 'set-assignee', userId: 'unknown', assigned: false }), { assignees: ['A'] })
  assert.deepEqual(buildCardCollectionsPatch({ ...card, assignees: ['A'] }, { type: 'set-assignee', userId: 'A', assigned: false }), { assignees: [] })
})

test('comments preserve order and exact dates and append a trimmed comment with no client date', () => {
  const original = structuredClone(card)
  const patch = buildCardCollectionsPatch(card, { type: 'add-comment', comment: { user: 'A', comment: '  New\ntext  ' } })
  assert.deepEqual(Object.keys(patch), ['comments'])
  assert.deepEqual(patch.comments, [...original.comments, { user: 'A', comment: 'New\ntext' }])
  assert.equal('createdAt' in patch.comments![1], false)
  assert.deepEqual(card, original)
})

test('checklist keeps duplicate descriptions distinct and changes only the targeted occurrence', () => {
  const original = structuredClone(card)
  assert.deepEqual(buildCardCollectionsPatch(card, { type: 'add-checklist-item', description: ' Same ' }), {
    checklistItems: [...card.checklistItems, { description: 'Same', done: false }],
  })
  const patch = buildCardCollectionsPatch(card, { type: 'set-checklist-done', index: 0, item: card.checklistItems[0], done: true })
  assert.deepEqual(Object.keys(patch), ['checklistItems'])
  assert.deepEqual(patch.checklistItems, [{ description: 'Same', done: true }, { description: 'Same', done: true }])
  assert.deepEqual(card, original)
  assert.notEqual(patch.checklistItems![0], card.checklistItems[0])
})

test('invalid texts, author IDs, indices and stale task values are rejected before writing', () => {
  assert.throws(() => buildCardCollectionsPatch(card, { type: 'add-comment', comment: { user: '', comment: 'text' } }))
  assert.throws(() => buildCardCollectionsPatch(card, { type: 'add-comment', comment: { user: 'A', comment: ' \n ' } }))
  assert.throws(() => buildCardCollectionsPatch(card, { type: 'set-assignee', userId: ' ', assigned: true }))
  assert.throws(() => buildCardCollectionsPatch(card, { type: 'add-checklist-item', description: ' \n ' }))
  for (const index of [-1, 0.5, 2, NaN, Infinity]) {
    assert.throws(() => buildCardCollectionsPatch(card, { type: 'set-checklist-done', index, item: card.checklistItems[0], done: true }))
  }
  for (const item of [{ description: 'Changed', done: false }, { description: 'Same', done: true }]) {
    assert.throws(() => buildCardCollectionsPatch(card, { type: 'set-checklist-done', index: 0, item, done: true }))
  }
})

test('empty collections accept additions without adding unrelated payload properties', () => {
  const empty = { ...card, assignees: [], comments: [], checklistItems: [] }
  assert.deepEqual(buildCardCollectionsPatch(empty, { type: 'add-comment', comment: { user: 'A', comment: 'Hi' } }), { comments: [{ user: 'A', comment: 'Hi' }] })
  assert.deepEqual(buildCardCollectionsPatch(empty, { type: 'add-checklist-item', description: 'Task' }), { checklistItems: [{ description: 'Task', done: false }] })
})
