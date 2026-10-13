import assert from 'node:assert/strict'
import test from 'node:test'
import { findCard, replaceCardInBoard, isMoveIntoLastColumn } from '../src/board-state.ts'
import { CardEditConflict, createCardPatch, getChronologicalComments } from '../src/card-editing.ts'

const existingComment = { user: 'alex', comment: 'Historique', createdAt: '2026-10-12T09:00:00Z' }
const firstTask = { description: 'Première tâche', done: false }
const card = { id: 'a', title: 'Carte', assignees: ['alex', 'maya'],
  comments: [existingComment], checklistItems: [firstTask, { description: 'Seconde', done: true }] }
const otherCard = { ...card, id: 'b', title: 'Autre' }
const board = { id: 'mini-trello', title: 'Sprint', columns: [
  { id: 'active', title: 'Actives', cards: [card, otherCard] },
  { id: 'done', title: 'Terminées', cards: [] },
] }

test('la réponse PATCH conserve le tableau complet et toutes les autres cartes', () => {
  const confirmed = { ...card, assignees: ['maya'] }
  const original = structuredClone(board)
  const result = replaceCardInBoard(board, confirmed)
  assert.deepEqual(result, { id: 'mini-trello', title: 'Sprint', columns: [
    { id: 'active', title: 'Actives', cards: [confirmed, otherCard] },
    { id: 'done', title: 'Terminées', cards: [] },
  ] })
  assert.deepEqual(board, original)
  assert.equal(findCard(result, 'a'), confirmed)
  assert.equal(findCard(result, 'absente'), undefined)
})

test('seule une entrée confirmée depuis une autre colonne peut célébrer', () => {
  const completedBoard = { ...board, columns: [
    { id: 'active', title: 'Actives', cards: [otherCard] },
    { id: 'done', title: 'Terminées', cards: [card] },
  ] }
  assert.equal(isMoveIntoLastColumn(completedBoard, 'active', 'a'), true)
  assert.equal(isMoveIntoLastColumn(completedBoard, 'done', 'a'), false)
  assert.equal(isMoveIntoLastColumn(board, 'active', 'a'), false)
  assert.equal(isMoveIntoLastColumn(undefined, 'active', 'a'), false)
})

test('une modification de tâche conserve sa voisine et refuse un snapshot obsolète', () => {
  assert.deepEqual(createCardPatch(card, {
    kind: 'rename-task', index: 0, expected: firstTask, description: ' Renommée ',
  }), { checklistItems: [{ description: 'Renommée', done: false }, { description: 'Seconde', done: true }] })
  assert.throws(() => createCardPatch(card, {
    kind: 'set-task-done', index: 0, expected: { ...firstTask, done: true }, done: false,
  }), CardEditConflict)
  assert.equal(createCardPatch(card, {
    kind: 'set-task-done', index: 0, expected: firstTask, done: false,
  }), undefined)
  assert.equal(card.checklistItems[0].description, 'Première tâche')
})

test('ajouter un commentaire conserve les dates et cible uniquement comments', () => {
  assert.deepEqual(createCardPatch(card, { kind: 'add-comment', userId: 'maya', comment: ' Nouveau ' }), {
    comments: [existingComment, { user: 'maya', comment: 'Nouveau' }],
  })
  assert.deepEqual(createCardPatch(card, { kind: 'remove-member', userId: 'alex' }), {
    assignees: ['maya'],
  })
  assert.equal(createCardPatch(card, { kind: 'add-member', userId: 'alex' }), undefined)
})

test('l’affichage chronologique est stable et ne réordonne pas le payload', () => {
  const recent = { user: 'maya', comment: 'Récent', createdAt: '2026-10-13T09:00:00Z' }
  const sameDate = { ...existingComment, comment: 'Même date' }
  const comments = [recent, existingComment, sameDate]
  assert.deepEqual(getChronologicalComments(comments), [
    { comment: existingComment, index: 1 }, { comment: sameDate, index: 2 },
    { comment: recent, index: 0 },
  ])
  assert.deepEqual(comments, [recent, existingComment, sameDate])
})
