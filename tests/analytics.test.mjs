import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateSprintAnalytics } from '../src/analytics.ts'

const users = [
  { id: 'alex', firstname: 'Alex', lastname: 'Kim' },
  { id: 'maya', firstname: 'Maya', lastname: 'Haddad' },
  { id: 'noah', firstname: 'Noah', lastname: 'Chen' },
]
const card = (id, assignees, states) => ({ id, title: id, assignees, comments: [],
  checklistItems: states.map(done => ({ description: 'Tâche', done })) })
const board = { id: 'mini-trello', title: 'Exemple travaillé', columns: [
  { id: 'active', title: 'Actives', cards: [card('a', ['alex', 'maya', 'alex'], [true, false]),
    card('b', ['alex'], []), card('c', [], [true]), card('d', ['indisponible'], [false, false, false])] },
  { id: 'done', title: 'Terminées', cards: [card('e', ['maya'], [true, true])] },
] }

test('la répartition globale compte une fois chaque carte, même multi-assignée', () => {
  const result = calculateSprintAnalytics(board, users)
  assert.equal(result.total, 5)
  assert.deepEqual(result.completion, { done: 1, total: 5, percent: 20 })
  assert.deepEqual(result.columns.map(c => [c.count, c.percent]), [[4, 80], [1, 20]])
  assert.equal(result.unassigned, 1)
  assert.equal(result.unavailableAssigneeCards, 1)
})

test('les checklists sont pondérées par tâches, y compris les cartes sans membre', () => {
  assert.deepEqual(calculateSprintAnalytics(board, users).checklist, { done: 4, total: 8, percent: 50 })
})

test('chaque membre reçoit toute la carte, sans doublon d’assignation ni oubli des zéros', () => {
  const result = calculateSprintAnalytics(board, users)
  assert.deepEqual(result.members, [
    { id: 'alex', name: 'Alex Kim', total: 2, active: 2, completed: 0, checklist: { done: 1, total: 2, percent: 50 } },
    { id: 'maya', name: 'Maya Haddad', total: 2, active: 1, completed: 1, checklist: { done: 3, total: 4, percent: 75 } },
    { id: 'noah', name: 'Noah Chen', total: 0, active: 0, completed: 0, checklist: { done: 0, total: 0, percent: null } },
  ])
  assert.deepEqual(result.workload, { average: 1, min: 0, max: 2, gap: 2 })
})

test('tableau sans colonnes ou sans cartes : zéro, jamais NaN ni 100 % fictif', () => {
  for (const columns of [[], [{ id: 'empty', title: 'Vide', cards: [] }]]) {
    const result = calculateSprintAnalytics({ ...board, columns }, users)
    assert.equal(result.total, 0)
    assert.deepEqual(result.completion, { done: 0, total: 0, percent: null })
    assert.deepEqual(result.checklist, { done: 0, total: 0, percent: null })
    assert.deepEqual(result.workload, { average: 0, min: 0, max: 0, gap: 0 })
    assert.equal(result.members.length, 3)
  }
})

test('aucun utilisateur : pas de membre inventé et aucune moyenne calculable', () => {
  const result = calculateSprintAnalytics(board, [])
  assert.deepEqual(result.members, [])
  assert.deepEqual(result.workload, { average: null, min: 0, max: 0, gap: 0 })
  assert.equal(result.unavailableAssigneeCards, 4)
  assert.equal(result.total, 5)
})

test('une seule colonne est la dernière ; une carte sans tâche reste sans progression', () => {
  const result = calculateSprintAnalytics({ ...board, columns: [
    { id: 'unique', title: 'Unique', cards: [card('a', ['alex'], [])] },
  ] }, users)
  assert.deepEqual(result.completion, { done: 1, total: 1, percent: 100 })
  assert.deepEqual(result.members.find(m => m.id === 'alex').checklist, { done: 0, total: 0, percent: null })
  assert.equal(result.members.find(m => m.id === 'alex').active, 0)
})

test('les données du cache restent intactes et deux calculs donnent le même résultat', () => {
  function freeze(value) {
    if (value && typeof value === 'object') {
      Object.values(value).forEach(freeze)
      Object.freeze(value)
    }
    return value
  }
  const frozenBoard = freeze(structuredClone(board))
  const frozenUsers = freeze(structuredClone(users))
  assert.deepEqual(calculateSprintAnalytics(frozenBoard, frozenUsers), calculateSprintAnalytics(board, users))
  assert.deepEqual(frozenBoard, board)
  assert.deepEqual(frozenUsers, users)
})
