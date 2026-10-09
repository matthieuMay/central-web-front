import assert from 'node:assert/strict'
import { test } from 'node:test'
import { MutationObserver, QueryClient } from '@tanstack/query-core'
import { cardCollectionsMutationOptions, recoverBoard, CardCollectionsError } from '../src/api/cardCollectionsMutation.ts'
import { boardWriteState, reserveBoardWrite, releaseBoardWrite, setBoardRecovery } from '../src/api/boardWrites.ts'
import { boardKey, usersKey } from '../src/api/boardKeys.ts'
import type { CardCollectionsAction } from '../src/api/cardCollections.ts'
import type { BoardData, CardCollectionsPatch } from '../src/types/board.ts'

const initial: BoardData = { id: 'board', title: 'Board', columns: [{ id: 'left', title: 'Left', cards: [{ id: 'A', title: 'A', assignees: ['unknown'], comments: [], checklistItems: [{ description: 'Same', done: false }, { description: 'Same', done: false }] }] }] }
const users = [{ id: 'A', firstname: 'Alice', lastname: 'A' }, { id: 'B', firstname: 'Bob', lastname: 'B' }]
const comment: CardCollectionsAction = { type: 'add-comment', comment: { user: 'A', comment: ' new ' } }
function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}
function setup(overrides: { getBoard?: () => Promise<BoardData>; patchCardCollections?: (id: string, patch: CardCollectionsPatch) => Promise<void> } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } })
  client.setQueryData(boardKey, structuredClone(initial))
  client.setQueryData(usersKey, users)
  let server = structuredClone(initial)
  const events: string[] = []
  const payloads: CardCollectionsPatch[] = []
  const getBoard = overrides.getBoard ?? (async () => { events.push('GET'); return structuredClone(server) })
  const options = cardCollectionsMutationOptions(client, {
    getBoard,
    patchCardCollections: overrides.patchCardCollections ?? (async (_id, patch) => {
      events.push('PATCH'); payloads.push(structuredClone(patch))
      const card = server.columns[0].cards[0]
      Object.assign(card, patch, patch.comments ? { comments: patch.comments.map((item) => ({ ...item, createdAt: item.createdAt ?? '2026-10-09T12:00:00Z' })) } : {})
    }),
  })
  const observer = new MutationObserver(client, { ...options, onSettled: () => releaseBoardWrite(client) })
  function execute(action: CardCollectionsAction = comment, cardId = 'A') {
    reserveBoardWrite(client)
    return observer.mutate({ cardId, action })
  }
  return { client, events, payloads, getBoard, execute, observer, setServer: (board: BoardData) => { server = board } }
}

test('successive actions read server first, PATCH one full collection and await reconciliation', async () => {
  const context = setup()
  await context.execute({ type: 'set-assignee', userId: 'A', assigned: true })
  await context.execute({ type: 'set-assignee', userId: 'B', assigned: true })
  assert.deepEqual(context.payloads, [{ assignees: ['unknown', 'A'] }, { assignees: ['unknown', 'A', 'B'] }])
  await context.execute()
  await context.execute()
  assert.deepEqual(context.events, Array(4).fill(['GET', 'PATCH', 'GET']).flat())
  assert.deepEqual(context.payloads[3].comments, [{ user: 'A', comment: 'new', createdAt: '2026-10-09T12:00:00Z' }, { user: 'A', comment: 'new' }])
  assert.equal(boardWriteState(context.client).busy, false)
  assert.equal(context.observer.getCurrentResult().isSuccess, true)
})

test('fresh read replaces a stale open-card snapshot and rejects changed checklist occurrence', async () => {
  const context = setup()
  const fresh = structuredClone(initial)
  fresh.columns[0].cards[0].checklistItems[0].done = true
  context.setServer(fresh)
  await assert.rejects(context.execute({ type: 'set-checklist-done', index: 0, item: initial.columns[0].cards[0].checklistItems[0], done: true }), /a changé/)
  assert.deepEqual(context.events, ['GET'])
  assert.equal(context.client.getQueryData<BoardData>(boardKey)!.columns[0].cards[0].checklistItems[0].done, true)
})

test('synchronous lock rejects double invocation and all local write types until reconciliation completes', async () => {
  const first = deferred<BoardData>()
  const last = deferred<BoardData>()
  let reads = 0
  const context = setup({ getBoard: () => ++reads === 1 ? first.promise : last.promise })
  const promise = context.execute()
  assert.throws(() => context.execute(), /en cours/)
  assert.throws(() => reserveBoardWrite(context.client), /en cours/)
  assert.equal(boardWriteState(context.client).busy, true)
  first.resolve(structuredClone(initial))
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(reads, 2)
  assert.throws(() => reserveBoardWrite(context.client), /en cours/)
  last.resolve(structuredClone(initial))
  await promise
  assert.equal(boardWriteState(context.client).busy, false)
})

test('missing card, unavailable authors and failed prerequisite GET never PATCH', async () => {
  for (const unavailable of ['missing-card', 'missing-user', 'empty-users']) {
    const context = setup()
    if (unavailable === 'empty-users') context.client.setQueryData(usersKey, [])
    const action = unavailable === 'missing-user' ? { type: 'add-comment' as const, comment: { user: 'missing', comment: 'Hi' } } : comment
    await assert.rejects(context.execute(action, unavailable === 'missing-card' ? 'gone' : 'A'))
    assert.deepEqual(context.events, ['GET'])
    assert.equal(context.payloads.length, 0)
  }
  let patches = 0
  const context = setup({ getBoard: async () => { throw new Error('offline') }, patchCardCollections: async () => { patches++ } })
  await assert.rejects(context.execute(), (error: unknown) => error instanceof CardCollectionsError && error.outcome === 'read-failed')
  assert.equal(patches, 0)
  assert.ok(boardWriteState(context.client).recovery)
  assert.throws(() => reserveBoardWrite(context.client))
})

test('known HTTP rejection refreshes without retry; network and 5xx outcomes require explicit recovery', async () => {
  for (const status of [400, 500, undefined]) {
    let patches = 0
    const context = setup({ patchCardCollections: async () => { patches++; throw Object.assign(new Error('failure'), status ? { status } : {}) } })
    await assert.rejects(context.execute(), (error: unknown) => error instanceof CardCollectionsError && error.outcome === (status === 400 ? 'rejected' : 'uncertain'))
    assert.equal(patches, 1)
    assert.deepEqual(context.events, ['GET', 'GET'])
    assert.equal(boardWriteState(context.client).busy, false)
    if (status === 400) assert.equal(boardWriteState(context.client).recovery, null)
    else {
      assert.throws(() => reserveBoardWrite(context.client))
      await recoverBoard(context.client, context.getBoard)
      assert.equal(boardWriteState(context.client).recovery, null)
    }
  }
})

test('confirmed PATCH with failed reconciliation remains success, blocks writes and only refreshes', async () => {
  let reads = 0
  let patches = 0
  const context = setup({ getBoard: async () => { if (++reads > 1) throw new Error('offline'); return structuredClone(initial) }, patchCardCollections: async () => { patches++ } })
  const result = await context.execute()
  assert.equal(result.confirmed, true)
  assert.ok(result.reconciliationError)
  assert.equal(context.observer.getCurrentResult().isSuccess, true)
  assert.throws(() => reserveBoardWrite(context.client))
  assert.equal(await recoverBoard(context.client, context.getBoard), false)
  assert.ok(boardWriteState(context.client).recovery)
  assert.equal(await recoverBoard(context.client, async () => structuredClone(initial)), true)
  assert.equal(boardWriteState(context.client).recovery, null)
  assert.equal(patches, 1)
})

test('guard blocks fetching and other scope mutations without releasing their reservation', async () => {
  const context = setup()
  const read = deferred<BoardData>()
  const promise = context.client.fetchQuery({ queryKey: boardKey, queryFn: () => read.promise, staleTime: 0 })
  assert.throws(() => reserveBoardWrite(context.client))
  read.resolve(structuredClone(initial)); await promise
  const gate = deferred<void>()
  const other = new MutationObserver(context.client, { scope: { id: 'board-writes' }, mutationFn: () => gate.promise })
  const pending = other.mutate()
  assert.throws(() => reserveBoardWrite(context.client))
  gate.resolve(); await pending
  setBoardRecovery(context.client, 'Refresh needed')
  assert.throws(() => reserveBoardWrite(context.client), /Refresh needed/)
  assert.equal(boardWriteState(context.client).recovery, 'Refresh needed')
})

test('unknown existing members can be removed without a catalog; failed cached catalogs cannot authorize additions', async () => {
  const context = setup()
  context.client.setQueryData(usersKey, [])
  await context.execute({ type: 'set-assignee', userId: 'unknown', assigned: false })
  assert.deepEqual(context.payloads, [{ assignees: [] }])
  context.client.setQueryData(usersKey, users)
  await assert.rejects(context.client.fetchQuery({ queryKey: usersKey, queryFn: async () => { throw new Error('catalog offline') }, staleTime: 0 }))
  await assert.rejects(context.execute(), /indisponible/)
  assert.equal(context.payloads.length, 1)
})

test('an uncertain committed addition is reconciled once and cannot be automatically republished', async () => {
  let server = structuredClone(initial)
  let patches = 0
  const context = setup({
    getBoard: async () => structuredClone(server),
    patchCardCollections: async (_id, patch) => {
      patches++
      server.columns[0].cards[0].comments = patch.comments!.map((item) => ({ ...item, createdAt: item.createdAt ?? '2026-10-09T12:00:00Z' }))
      throw new Error('connection lost after commit')
    },
  })
  await assert.rejects(context.execute(), /Résultat incertain/)
  assert.equal(context.client.getQueryData<BoardData>(boardKey)!.columns[0].cards[0].comments.length, 1)
  assert.throws(() => context.execute(), /Résultat incertain/)
  await recoverBoard(context.client, context.getBoard)
  assert.equal(patches, 1)
  assert.equal(boardWriteState(context.client).recovery, null)
})
