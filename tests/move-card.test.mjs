import assert from 'node:assert/strict'
import { setImmediate } from 'node:timers/promises'
import { after, before, test } from 'node:test'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createServer } from 'vite'

let vite
let useMoveCard
let useCreateCard
let boardKey

before(async () => {
  vite = await createServer({ server: { middlewareMode: true, hmr: false, ws: false } })
  ;({ useMoveCard, useCreateCard } = await vite.ssrLoadModule('/src/api/mutations.ts'))
  ;({ boardKey } = await vite.ssrLoadModule('/src/api/board.ts'))
})

after(async () => {
  await vite?.close()
})

function setup(t) {
  const board = {
    id: 'mini-trello', title: 'Test board', columns: [
      { id: 'backlog', title: 'Backlog', cards: [{ id: 'card-1', title: 'A task', description: 'Keep this description' }] },
      { id: 'doing', title: 'Doing', cards: [] },
      { id: 'review', title: 'Review', cards: [] },
    ],
  }
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: 0 } } })
  client.setQueryData(boardKey, board)
  t.after(() => client.clear())
  let mutations
  function Probe() {
    // oxlint-disable-next-line react/globals -- Capture the real hooks from this one-off server render.
    mutations = { move: useMoveCard(), create: useCreateCard() }
    return null
  }
  renderToString(createElement(QueryClientProvider, { client }, createElement(Probe)))
  return { client, board, ...mutations }
}

test('moves immediately and preserves the card content without changing the snapshot', async (t) => {
  const { client, board, move } = setup(t)
  let complete
  let started
  const requestStarted = new Promise((resolve) => { started = resolve })
  t.mock.method(globalThis, 'fetch', () => {
    started()
    return new Promise((resolve) => { complete = () => resolve(Response.json({})) })
  })
  const result = move.mutateAsync({ cardId: 'card-1', columnId: 'doing' })
  await requestStarted
  const optimistic = client.getQueryData(boardKey)
  assert.deepEqual(optimistic.columns[0].cards, [])
  assert.deepEqual(optimistic.columns[1].cards, board.columns[0].cards)
  assert.equal(board.columns[0].cards.length, 1)
  complete()
  await result
  assert.equal(client.getQueryState(boardKey).isInvalidated, true)
})

test('a failed move rolls back without removing a queued optimistic creation', async (t) => {
  const { client, move, create } = setup(t)
  let fail
  let started
  const requestStarted = new Promise((resolve) => { started = resolve })
  t.mock.method(globalThis, 'fetch', (_url, init) => {
    if (init.method === 'PUT') {
      started()
      return new Promise((_resolve, reject) => { fail = reject })
    }
    return Promise.resolve(Response.json({}))
  })
  const result = move.mutateAsync({ cardId: 'card-1', columnId: 'doing' }).catch((error) => error)
  await requestStarted
  const creation = create.mutateAsync({ columnId: 'review', id: 'new-card', title: 'Queued task' })
  await setImmediate()
  assert.equal(client.getQueryData(boardKey).columns[2].cards[0].id, 'new-card')
  fail(new Error('Simulated move failure'))
  assert.equal((await result).message, 'Simulated move failure')
  await creation
  const restored = client.getQueryData(boardKey)
  assert.equal(restored.columns[0].cards[0].id, 'card-1')
  assert.deepEqual(restored.columns[1].cards, [])
  assert.equal(restored.columns[2].cards[0].id, 'new-card')
})

test('missing cards, missing destinations and same-column moves leave the cache unchanged', async (t) => {
  for (const input of [
    { cardId: 'missing', columnId: 'doing' },
    { cardId: 'card-1', columnId: 'missing' },
    { cardId: 'card-1', columnId: 'backlog' },
  ]) {
    const { client, board, move } = setup(t)
    t.mock.method(globalThis, 'fetch', () => Promise.resolve(Response.json({})))
    await move.mutateAsync(input)
    assert.deepEqual(client.getQueryData(boardKey), board)
  }
})
