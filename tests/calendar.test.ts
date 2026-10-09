import assert from 'node:assert/strict'
import { test } from 'node:test'
import { QueryClient } from '@tanstack/query-core'
import { addDays, adjustPeriod, createCalendarStore, demoCalendar, historySegments, monday, movePeriod, observeBoard, parseCalendar, validDay, watchConfirmedBoard, type CalendarData } from '../src/calendar/calendar.ts'
import { boardKey } from '../src/api/boardKeys.ts'
import type { BoardData } from '../src/types/board.ts'

function board(column = 'sprint-backlog'): BoardData {
  return { id: 'mini-trello', title: 'Sprint', columns: ['sprint-backlog', 'doing', 'review', 'done'].map((id) => ({ id, title: id, cards: id === column ? [{ id: 'card-1', title: 'Carte existante', assignees: ['user-1'], comments: [], checklistItems: [{ description: 'Test', done: true }] }] : [] })) }
}
const empty = (): CalendarData => ({ version: 1, boardId: 'mini-trello', cards: [] })
function memoryStorage(initial?: string) {
  let value = initial ?? null
  let writes = 0
  return { getItem: () => value, setItem: (_key: string, next: string) => { writes++; value = next }, value: () => value, writes: () => writes }
}

test('seven inclusive calendar days, leap days, months and daylight-saving boundaries', () => {
  assert.deepEqual(movePeriod(null, '2026-10-09'), { start: '2026-10-09', end: '2026-10-15' })
  assert.deepEqual(movePeriod(null, '2026-12-29'), { start: '2026-12-29', end: '2027-01-04' })
  assert.equal(addDays('2024-02-28', 2), '2024-03-01')
  assert.equal(addDays('2026-03-28', 2), '2026-03-30')
  assert.equal(addDays('2026-10-24', 2), '2026-10-26')
  assert.equal(monday('2026-10-11'), '2026-10-05')
  assert.equal(validDay('2026-02-29'), false)
  assert.equal(validDay('2026-13-01'), false)
  assert.equal(validDay('2026-10-09T00:00:00Z'), false)
})

test('moving retains duration; resizing both ends clamps at one day', () => {
  const period = movePeriod(null, '2026-10-09')
  assert.deepEqual(movePeriod(period, '2026-11-01'), { start: '2026-11-01', end: '2026-11-07' })
  assert.deepEqual(adjustPeriod(period, 'move', -2), { start: '2026-10-07', end: '2026-10-13' })
  assert.deepEqual(adjustPeriod(period, 'start', 20), { start: '2026-10-15', end: '2026-10-15' })
  assert.deepEqual(adjustPeriod(period, 'end', -20), { start: '2026-10-09', end: '2026-10-09' })
  assert.equal(adjustPeriod(period, 'start', -2).start, '2026-10-07')
  assert.equal(adjustPeriod(period, 'end', 2).end, '2026-10-17')
})

test('confirmed local transitions preserve phases; same-column observations do not duplicate', () => {
  const initial = observeBoard(empty(), board(), '2026-10-09T08:00:00.000Z', true)
  assert.equal(initial.cards[0].observations[0].kind, 'initial')
  const repeat = observeBoard(initial, board(), '2026-10-09T08:30:00.000Z', false)
  assert.equal(repeat.cards[0].observations.length, 1)
  const doing = observeBoard(repeat, board('doing'), '2026-10-09T09:00:00.000Z', false, { cardId: 'card-1', column: 'doing' })
  assert.equal(doing.cards[0].observations[1].kind, 'observed')
  const segments = historySegments(doing.cards[0], '2026-10-09T10:00:00.000Z')
  assert.equal(segments[0].end, '2026-10-09T09:00:00.000Z')
  assert.equal(segments[1].columnId, 'doing')
  assert.equal(initial.cards[0].observations.length, 1)
})

test('absence and external changes leave unknown intervals, including unchanged status on return', () => {
  const initial = observeBoard(empty(), board('doing'), '2026-10-09T08:00:00.000Z', true)
  const resumed = observeBoard(initial, board('review'), '2026-10-10T12:00:00.000Z', true)
  const segments = historySegments(resumed.cards[0], '2026-10-10T13:00:00.000Z')
  assert.equal(segments[0].end, '2026-10-09T08:00:00.000Z')
  assert.equal(segments[1].kind, 'gap')
  assert.equal(segments[1].end, '2026-10-10T12:00:00.000Z')
  assert.equal(segments[2].columnId, 'review')
  const same = observeBoard(initial, board('doing'), '2026-10-10T12:00:00.000Z', true)
  assert.equal(historySegments(same.cards[0], '2026-10-10T13:00:00.000Z')[1].kind, 'gap')
  const external = observeBoard(initial, board('review'), '2026-10-09T09:00:00.000Z', false)
  assert.equal(external.cards[0].observations[1].kind, 'uncertain')
  assert.equal(historySegments(initial.cards[0], '2026-10-09T10:00:00.000Z', true)[0].end, initial.cards[0].lastSeenAt)
})

test('done ends the actual bar and reopening retains the completed interval', () => {
  const doing = observeBoard(empty(), board('doing'), '2026-10-09T08:00:00.000Z', true)
  const done = observeBoard(doing, board('done'), '2026-10-09T09:00:00.000Z', false, { cardId: 'card-1', column: 'done' })
  assert.deepEqual(historySegments(done.cards[0], '2026-10-10T12:00:00.000Z').map((segment) => segment.kind), ['status', 'done'])
  const reopened = observeBoard(done, board('doing'), '2026-10-10T12:00:00.000Z', false, { cardId: 'card-1', column: 'doing' })
  const segments = historySegments(reopened.cards[0], '2026-10-10T13:00:00.000Z')
  assert.equal(segments.length, 3)
  assert.equal(segments[2].start, '2026-10-10T12:00:00.000Z')
})

test('local save, reload and import preserve history while rescheduling and removing dates', () => {
  const storage = memoryStorage(JSON.stringify(empty()))
  const store = createCalendarStore('mini-trello', storage, () => '2026-10-09T08:00:00.000Z')
  store.observe(board())
  const observations = store.getSnapshot().data.cards[0].observations
  store.setPeriod('card-1', movePeriod(null, '2026-10-09'))
  store.setPeriod('card-1', movePeriod(null, '2026-11-01'))
  assert.equal(store.getSnapshot().data.cards[0].observations, observations)
  const reloaded = createCalendarStore('mini-trello', storage)
  assert.equal(reloaded.getSnapshot().data.cards[0].period?.start, '2026-11-01')
  const exported = store.exportData()
  reloaded.setPeriod('card-1', null)
  assert.equal(reloaded.getSnapshot().data.cards[0].observations.length, 1)
  reloaded.importData(parseCalendar(exported, 'mini-trello', board()))
  assert.equal(reloaded.getSnapshot().data.cards[0].period?.start, '2026-11-01')
  assert.equal(reloaded.getSnapshot().interrupted, true)
})

test('import rejects malformed JSON, identifiers, dates, duplicate cards and unordered observations', () => {
  const data = observeBoard(empty(), board(), '2026-10-09T08:00:00.000Z', true)
  data.cards[0].period = movePeriod(null, '2026-10-09')
  const invalid = [
    { ...data, version: 2 }, { ...data, boardId: 'other' },
    { ...data, cards: [...data.cards, ...data.cards] },
    { ...data, cards: [{ ...data.cards[0], cardId: 'unknown' }] },
    { ...data, cards: [{ ...data.cards[0], period: { start: '2026-02-30', end: '2026-03-01' } }] },
    { ...data, cards: [{ ...data.cards[0], period: { start: '2026-10-20', end: '2026-10-09' } }] },
    { ...data, cards: [{ ...data.cards[0], observations: [{ ...data.cards[0].observations[0], columnId: 'unknown' }] }] },
    { ...data, cards: [{ ...data.cards[0], observations: [...data.cards[0].observations, { ...data.cards[0].observations[0], at: '2026-10-08T00:00:00.000Z' }] }] },
    { ...data, cards: [{ ...data.cards[0], lastSeenAt: '2026-10-08T00:00:00.000Z' }] },
  ]
  for (const value of invalid) assert.throws(() => parseCalendar(JSON.stringify(value), 'mini-trello', board()))
  assert.throws(() => parseCalendar('{bad', 'mini-trello'))
  assert.deepEqual(parseCalendar(JSON.stringify(data), 'mini-trello', board()), data)
})

test('invalid or inaccessible storage never overwrites the existing saved value', () => {
  const corrupt = memoryStorage('{broken')
  const store = createCalendarStore('mini-trello', corrupt)
  assert.ok(store.getSnapshot().error)
  store.observe(board())
  assert.throws(() => store.setPeriod('card-1', movePeriod(null, '2026-10-09')))
  assert.equal(corrupt.writes(), 0)
  assert.equal(corrupt.value(), '{broken')
  const good = observeBoard(empty(), board(), '2026-10-09T08:00:00.000Z', true)
  const raw = JSON.stringify(good)
  const unavailable = createCalendarStore('mini-trello', { getItem: () => raw, setItem: () => { throw new Error('Quota exceeded') } })
  assert.throws(() => unavailable.setPeriod('card-1', movePeriod(null, '2026-10-09')))
  assert.deepEqual(unavailable.getSnapshot().data, good)
  assert.ok(unavailable.getSnapshot().error)
  const recovered = createCalendarStore('mini-trello', corrupt)
  recovered.importData(good)
  assert.equal(recovered.getSnapshot().error, null)
  assert.equal(corrupt.value(), raw)
})

test('query watcher records only successful network reads, not optimistic updates or rollback', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const store = createCalendarStore('mini-trello', memoryStorage(JSON.stringify(empty())), () => '2026-10-09T08:00:00.000Z')
  const unwatch = watchConfirmedBoard(client, store)
  try {
    await client.fetchQuery({ queryKey: boardKey, queryFn: async () => board() })
    client.setQueryData(boardKey, board('doing'))
    assert.equal(store.getSnapshot().data.cards[0].observations.length, 1)
    client.setQueryData(boardKey, board())
    await assert.rejects(client.fetchQuery({ queryKey: boardKey, queryFn: async () => { throw new Error('Offline') } }))
    assert.equal(store.getSnapshot().data.cards[0].observations.length, 1)
    assert.equal(store.getSnapshot().interrupted, true)
    await client.fetchQuery({ queryKey: ['other'], queryFn: async () => board('review') })
    assert.equal(store.getSnapshot().data.cards[0].observations.length, 1)
    await client.fetchQuery({ queryKey: boardKey, queryFn: async () => board('doing') })
    assert.equal(store.getSnapshot().data.cards[0].observations.at(-1)?.columnId, 'doing')
  } finally { unwatch(); client.clear() }
})

test('first launch seeds planning and labelled demo phases only once, without changing API cards', () => {
  const server = board('doing')
  const original = structuredClone(server)
  const storage = memoryStorage()
  const store = createCalendarStore('mini-trello', storage, () => '2026-10-09T08:00:00.000Z')
  store.observe(server)
  const card = store.getSnapshot().data.cards[0]
  assert.ok(card.period)
  assert.equal(card.observations.filter((observation) => observation.demo).length, 2)
  assert.equal(card.observations.at(-1)?.demo, undefined)
  assert.equal(card.observations.at(-1)?.columnId, 'doing')
  assert.deepEqual(parseCalendar(store.exportData(), 'mini-trello', server), store.getSnapshot().data)
  assert.deepEqual(server, original)
  store.clearDemo()
  assert.equal(store.getSnapshot().data.cards[0].observations.length, 1)
  assert.deepEqual(store.getSnapshot().data.cards[0].period, card.period)
  store.setPeriod('card-1', null)
  const again = createCalendarStore('mini-trello', storage, () => '2026-10-10T08:00:00.000Z')
  again.observe(server)
  assert.equal(again.getSnapshot().data.cards[0].period, null)
  assert.equal(again.getSnapshot().data.cards[0].observations.some((observation) => observation.demo), false)
})

test('demo phases always precede the real baseline, including Mondays and year boundaries', () => {
  for (const at of ['2026-11-02T00:00:00.000Z', '2027-01-01T00:00:00.000Z']) {
    const data = demoCalendar(board('done'), at)
    assert.ok(data.cards[0].observations.every((observation) => observation.at <= at))
    assert.deepEqual(parseCalendar(JSON.stringify(data), 'mini-trello', board('done')), data)
    assert.ok(historySegments(data.cards[0], at).some((segment) => segment.kind === 'done' && segment.demo))
  }
})

test('an older tab cannot silently overwrite another tab’s saved planning', () => {
  const storage = memoryStorage(JSON.stringify(empty()))
  const first = createCalendarStore('mini-trello', storage)
  const second = createCalendarStore('mini-trello', storage)
  first.setPeriod('card-1', movePeriod(null, '2026-10-09'))
  const saved = storage.value()
  assert.throws(() => second.setPeriod('card-1', movePeriod(null, '2026-11-09')), /autre onglet/)
  assert.equal(storage.value(), saved)
})

test('demo chronology follows the current column: future backlog, active phases and one completion marker', () => {
  const at = '2026-10-09T12:00:00.000Z'
  const backlog = demoCalendar(board(), at).cards[0]
  assert.ok(backlog.period!.start > '2026-10-09')
  assert.equal(backlog.observations.some((observation) => observation.demo), false)
  for (const [column, expected] of [['doing', ['sprint-backlog', 'doing']], ['review', ['sprint-backlog', 'doing', 'review']], ['done', ['sprint-backlog', 'doing', 'review', 'done']]] as const) {
    const card = demoCalendar(board(column), at).cards[0]
    assert.deepEqual(card.observations.filter((observation) => observation.demo).map((observation) => observation.columnId), expected)
    assert.equal(card.observations.at(-1)!.columnId, column)
    assert.equal(historySegments(card, at).filter((segment) => segment.kind === 'done').length, column === 'done' ? 1 : 0)
    assert.deepEqual(parseCalendar(JSON.stringify({ version: 1, boardId: 'mini-trello', cards: [card] }), 'mini-trello', board(column)).cards[0], card)
  }
})
