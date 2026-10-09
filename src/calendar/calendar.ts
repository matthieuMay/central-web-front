import type { QueryClient } from '@tanstack/query-core'
import { boardKey } from '../api/boardKeys.ts'
import type { BoardData } from '../types/board.ts'

export type PlannedPeriod = { start: string; end: string }
export type StatusObservation = {
  columnId: string
  title: string
  at: string
  kind: 'initial' | 'observed' | 'uncertain'
  gapStart?: string
  demo?: boolean
}
export type CalendarCard = {
  cardId: string
  period: PlannedPeriod | null
  observations: StatusObservation[]
  lastSeenAt: string | null
}
export type CalendarData = { version: 1; boardId: string; cards: CalendarCard[] }
export type HistorySegment = { columnId: string; title: string; start: string; end: string; kind: 'status' | 'gap' | 'done'; demo?: boolean }

const dayMilliseconds = 86_400_000
export function dayNumber(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return Date.UTC(year, month - 1, day) / dayMilliseconds
}
export function validDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) return false
  return new Date(dayNumber(value) * dayMilliseconds).toISOString().slice(0, 10) === value
}
export function addDays(value: string, count: number) {
  return new Date((dayNumber(value) + count) * dayMilliseconds).toISOString().slice(0, 10)
}
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function monday(value: string) {
  const weekday = new Date(dayNumber(value) * dayMilliseconds).getUTCDay()
  return addDays(value, -(weekday === 0 ? 6 : weekday - 1))
}
export function validPeriod(value: PlannedPeriod) {
  return validDay(value.start) && validDay(value.end) && value.start <= value.end
}
export function movePeriod(period: PlannedPeriod | null, start: string): PlannedPeriod {
  return { start, end: addDays(start, period ? dayNumber(period.end) - dayNumber(period.start) : 6) }
}
export function adjustPeriod(period: PlannedPeriod, mode: 'move' | 'start' | 'end', days: number): PlannedPeriod {
  if (mode === 'move') return movePeriod(period, addDays(period.start, days))
  if (mode === 'start') return { start: [addDays(period.start, days), period.end].sort()[0], end: period.end }
  return { start: period.start, end: [addDays(period.end, days), period.start].sort()[1] }
}

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}
function timestamp(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value
}

export function parseCalendar(raw: string, boardId: string, board?: BoardData): CalendarData {
  const value: unknown = JSON.parse(raw)
  if (!object(value) || value.version !== 1 || value.boardId !== boardId || !Array.isArray(value.cards)) {
    throw new Error('Fichier incompatible : vérifiez la version et le tableau.')
  }
  const cardIds = new Set<string>()
  const knownCards = board && new Set(board.columns.flatMap((column) => column.cards.map((card) => card.id)))
  const knownColumns = board && new Set(board.columns.map((column) => column.id))
  const cards: CalendarCard[] = value.cards.map((entry) => {
    if (!object(entry) || typeof entry.cardId !== 'string' || !entry.cardId || cardIds.has(entry.cardId) || (knownCards && !knownCards.has(entry.cardId))) {
      throw new Error('Le fichier contient une carte inconnue ou dupliquée.')
    }
    cardIds.add(entry.cardId)
    let period: PlannedPeriod | null = null
    if (entry.period !== null) {
      if (!object(entry.period) || !validDay(entry.period.start) || !validDay(entry.period.end) || entry.period.start > entry.period.end) {
        throw new Error('Une période contient des dates invalides ou inversées.')
      }
      period = { start: entry.period.start, end: entry.period.end }
    }
    if (!Array.isArray(entry.observations) || !(entry.lastSeenAt === null || timestamp(entry.lastSeenAt))) {
      throw new Error('L’historique contient une date invalide.')
    }
    let previous: string | undefined
    const observations: StatusObservation[] = entry.observations.map((observation) => {
      if (!object(observation) || typeof observation.columnId !== 'string' || !observation.columnId || typeof observation.title !== 'string' || !observation.title || (knownColumns && !knownColumns.has(observation.columnId)) || !timestamp(observation.at) || (previous && observation.at < previous) || !['initial', 'observed', 'uncertain'].includes(String(observation.kind))) {
        throw new Error('L’historique contient un statut ou un ordre de dates invalide.')
      }
      if (observation.gapStart !== undefined && (observation.kind !== 'uncertain' || !timestamp(observation.gapStart) || !previous || observation.gapStart < previous || observation.gapStart > observation.at)) {
        throw new Error('Une période d’observation inconnue est invalide.')
      }
      if (observation.demo !== undefined && typeof observation.demo !== 'boolean') throw new Error('L’origine de l’historique est invalide.')
      previous = observation.at
      return { columnId: observation.columnId, title: observation.title, at: observation.at, kind: observation.kind as StatusObservation['kind'], ...(observation.gapStart ? { gapStart: observation.gapStart as string } : {}), ...(observation.demo === true ? { demo: true } : {}) }
    })
    if ((observations.length > 0 && (!entry.lastSeenAt || entry.lastSeenAt < observations.at(-1)!.at)) || (observations.length === 0 && entry.lastSeenAt !== null)) {
      throw new Error('La dernière observation est incohérente.')
    }
    return { cardId: entry.cardId, period, observations, lastSeenAt: entry.lastSeenAt }
  })
  return { version: 1, boardId, cards }
}

export function demoCalendar(board: BoardData, at: string): CalendarData {
  const today = localDay(new Date(at))
  const phases = board.columns.filter((column) => column.id !== 'done').slice(0, 3)
  let index = 0
  return {
    version: 1, boardId: board.id,
    cards: board.columns.flatMap((column) => column.cards.map((card) => {
      const offset = index++
      const stage = column.id === 'done' ? 3 : Math.max(0, phases.findIndex((phase) => phase.id === column.id))
      const start = addDays(today, stage === 0 ? 2 + (offset % 4) * 2 : -(stage * 2 + 1 + offset % 2))
      const end = stage === 3 ? addDays(today, -2 - offset % 2) : addDays(start, stage === 2 ? 6 + offset % 2 : 6)
      const observations: StatusObservation[] = stage === 0 ? [] : phases.slice(0, stage === 3 ? 3 : stage + 1).map((phase, phaseIndex) => ({ columnId: phase.id, title: phase.title, at: `${addDays(start, phaseIndex * 2)}T09:00:00.000Z`, kind: phaseIndex === 0 ? 'initial' : 'observed', demo: true }))
      if (column.id === 'done') observations.push({ columnId: column.id, title: column.title, at: `${end}T15:00:00.000Z`, kind: 'observed', demo: true })
      observations.push({ columnId: column.id, title: column.title, at, kind: 'initial' })
      return { cardId: card.id, period: { start, end }, observations, lastSeenAt: at }
    })),
  }
}

export function observeBoard(data: CalendarData, board: BoardData, at: string, interrupted: boolean, expectedMove?: { cardId: string; column: string }): CalendarData {
  const cards = new Map(data.cards.map((card) => [card.cardId, card]))
  for (const column of board.columns) for (const card of column.cards) {
    const old = cards.get(card.id) ?? { cardId: card.id, period: null, observations: [], lastSeenAt: null }
    const time = old.lastSeenAt && at < old.lastSeenAt ? old.lastSeenAt : at
    const previous = old.observations.at(-1)
    const localChange = !interrupted && expectedMove?.cardId === card.id && expectedMove.column === column.id
    const changed = previous?.columnId !== column.id
    const resume = interrupted && !!old.lastSeenAt && time > old.lastSeenAt
    const observation: StatusObservation = {
      columnId: column.id, title: column.title, at: time,
      kind: !previous ? 'initial' : localChange ? 'observed' : 'uncertain',
      ...((previous && (resume || (changed && !localChange))) ? { gapStart: old.lastSeenAt! } : {}),
    }
    cards.set(card.id, { ...old, lastSeenAt: time, observations: changed || resume ? [...old.observations, observation] : old.observations })
  }
  return { ...data, cards: [...cards.values()] }
}

export function historySegments(card: CalendarCard, now: string, interrupted = false): HistorySegment[] {
  const segments: HistorySegment[] = []
  card.observations.forEach((observation, index) => {
    const next = card.observations[index + 1]
    if (observation.gapStart && observation.gapStart < observation.at) {
      segments.push({ columnId: observation.columnId, title: 'Observation interrompue : transitions inconnues', start: observation.gapStart, end: observation.at, kind: 'gap' })
    }
    if (observation.columnId === 'done') {
      if (observation.kind !== 'initial' || observation.demo) segments.push({ columnId: observation.columnId, title: observation.title, start: observation.at, end: observation.at, kind: 'done', demo: observation.demo })
    } else {
      const end = next?.gapStart ?? next?.at ?? (interrupted ? card.lastSeenAt : now) ?? observation.at
      segments.push({ columnId: observation.columnId, title: observation.title, start: observation.at, end: end < observation.at ? observation.at : end, kind: 'status', demo: observation.demo })
    }
  })
  return segments
}

type Storage = { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void }
export type CalendarSnapshot = { data: CalendarData; error: string | null; interrupted: boolean }
export function createCalendarStore(boardId: string, storage: Storage | null, now = () => new Date().toISOString()) {
  const key = `mini-trello:calendar:v1:${boardId}`
  let snapshot: CalendarSnapshot = { data: { version: 1, boardId, cards: [] }, error: null, interrupted: true }
  const listeners = new Set<() => void>()
  let expectedMove: { cardId: string; column: string } | undefined
  let firstLaunch = false
  let savedRaw: string | null = null
  try {
    if (!storage) throw new Error('Stockage local indisponible.')
    const raw = storage.getItem(key)
    savedRaw = raw
    firstLaunch = raw === null
    if (raw !== null) snapshot.data = parseCalendar(raw, boardId)
  } catch {
    snapshot.error = 'Sauvegarde locale indisponible ou invalide. Les données existantes sont conservées. Importez un fichier valide pour réessayer.'
  }
  function publish(next: CalendarSnapshot) {
    snapshot = next
    listeners.forEach((listener) => listener())
  }
  function save(data: CalendarData, interrupted = snapshot.interrupted, replace = false) {
    try {
      if (!storage) throw new Error('Stockage inaccessible.')
      if (!replace && storage.getItem(key) !== savedRaw) throw new Error('Le planning a changé dans un autre onglet. Rechargez avant de le modifier.')
      const raw = JSON.stringify(data)
      storage.setItem(key, raw)
      savedRaw = raw
      publish({ data, error: null, interrupted })
    } catch (error) {
      publish({ ...snapshot, error: error instanceof Error && error.message.includes('autre onglet') ? error.message : 'Sauvegarde locale impossible. La dernière sauvegarde est conservée ; exportez-la avant de réessayer.' })
      throw new Error(snapshot.error!)
    }
  }
  return {
    key,
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    interrupt() { if (!snapshot.interrupted) publish({ ...snapshot, interrupted: true }); expectedMove = undefined },
    expectMove(input: { cardId: string; column: string }) { expectedMove = input },
    finishMove() { expectedMove = undefined },
    observe(board: BoardData) {
      if (snapshot.error || board.id !== boardId) return
      try {
        const at = now()
        save(firstLaunch ? demoCalendar(board, at) : observeBoard(snapshot.data, board, at, snapshot.interrupted, expectedMove), false)
        firstLaunch = false
      } catch { /* The snapshot exposes the persistence error. */ }
    },
    setPeriod(cardId: string, period: PlannedPeriod | null) {
      if (snapshot.error) throw new Error(snapshot.error)
      if (period && !validPeriod(period)) throw new Error('Choisissez une période valide d’au moins un jour.')
      const old = snapshot.data.cards.find((card) => card.cardId === cardId) ?? { cardId, period: null, observations: [], lastSeenAt: null }
      save({ ...snapshot.data, cards: [...snapshot.data.cards.filter((card) => card.cardId !== cardId), { ...old, period }] })
      firstLaunch = false
    },
    importData(data: CalendarData) { save(parseCalendar(JSON.stringify(data), boardId), true, true); firstLaunch = false; expectedMove = undefined },
    clearDemo() {
      if (snapshot.error) throw new Error(snapshot.error)
      save({ ...snapshot.data, cards: snapshot.data.cards.map((card) => {
        const observations = card.observations.filter((observation) => !observation.demo)
        return { ...card, observations, lastSeenAt: observations.length ? card.lastSeenAt : null }
      }) })
    },
    exportData: () => JSON.stringify(snapshot.data, null, 2),
  }
}
export type CalendarStore = ReturnType<typeof createCalendarStore>

export function watchConfirmedBoard(client: QueryClient, store: Pick<CalendarStore, 'observe' | 'interrupt'>) {
  return client.getQueryCache().subscribe((event) => {
    if (event.type !== 'updated' || JSON.stringify(event.query.queryKey) !== JSON.stringify(boardKey)) return
    if (event.action.type === 'error') store.interrupt()
    if (event.action.type === 'success' && !event.action.manual) store.observe(event.query.state.data as BoardData)
  })
}
