import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type { BoardData } from '../types/board'
import { boardKey, createCard, editCard, moveCard } from './board'

export type CreateCardInput = { columnId: string; id: string; title: string }
export type EditCardInput = { cardId: string; title: string }
export type MoveCardInput = { cardId: string; columnId: string; position: number }

type Change = (board: BoardData) => BoardData
type Entry = { token: symbol; change: Change; pending: boolean }
type Ledger = { base: BoardData | undefined; entries: Entry[] }
type Context = { previous: BoardData | undefined; token: symbol }

// Replaying from the pre-batch snapshot keeps later optimistic writes when an
// earlier request fails. Successful writes remain until the whole batch refetches.
const ledgers = new WeakMap<QueryClient, Ledger>()

async function begin(queryClient: QueryClient, change: Change): Promise<Context> {
  await queryClient.cancelQueries({ queryKey: boardKey, exact: true })
  const previous = queryClient.getQueryData<BoardData>(boardKey)
  let ledger = ledgers.get(queryClient)
  if (!ledger) {
    ledger = { base: previous, entries: [] }
    ledgers.set(queryClient, ledger)
  }
  const token = Symbol('board write')
  ledger.entries.push({ token, change, pending: true })
  if (previous) queryClient.setQueryData<BoardData>(boardKey, change(previous))
  return { previous, token }
}

function rollback(queryClient: QueryClient, context: Context | undefined) {
  if (!context) return
  const ledger = ledgers.get(queryClient)
  if (!ledger) return
  ledger.entries = ledger.entries.filter((entry) => entry.token !== context.token)
  // With no other writes this is exactly the snapshot taken in onMutate.
  const base = ledger.base ?? context.previous
  queryClient.setQueryData<BoardData>(boardKey,
    base && ledger.entries.reduce((board, entry) => entry.change(board), base))
}

async function settle(queryClient: QueryClient, context: Context | undefined) {
  const ledger = ledgers.get(queryClient)
  if (!ledger || !context) return
  const entry = ledger.entries.find((item) => item.token === context.token)
  if (entry) entry.pending = false
  if (ledger.entries.some((item) => item.pending)) return
  ledgers.delete(queryClient)
  // All writes have finished: one authoritative read reconciles server ordering.
  await queryClient.invalidateQueries({ queryKey: boardKey, exact: true })
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    scope: { id: 'board-writes' },
    mutationFn: createCard,
    onMutate: (input: CreateCardInput) => begin(queryClient, (board) => ({
      ...board,
      columns: board.columns.map((column) => column.id === input.columnId
        ? { ...column, cards: [...column.cards, { id: input.id, title: input.title }] }
        : column),
    })),
    onError: (_error, _input, context) => rollback(queryClient, context),
    onSettled: (_data, _error, _input, context) => settle(queryClient, context),
  })
}

export function useEditCard() {
  const queryClient = useQueryClient()
  return useMutation({
    scope: { id: 'board-writes' },
    mutationFn: editCard,
    onMutate: (input: EditCardInput) => begin(queryClient, (board) => ({
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) => card.id === input.cardId
          ? { ...card, title: input.title }
          : card),
      })),
    })),
    onError: (_error, _input, context) => rollback(queryClient, context),
    onSettled: (_data, _error, _input, context) => settle(queryClient, context),
  })
}

function moveCardInBoard(board: BoardData, input: MoveCardInput): BoardData {
  let movedCard = board.columns
    .flatMap((column) => column.cards)
    .find((card) => card.id === input.cardId)

  if (!movedCard) return board

  const columnsWithoutCard = board.columns.map((column) => ({
    ...column,
    cards: column.cards.filter((card) => card.id !== input.cardId),
  }))
  const destination = columnsWithoutCard.find((column) => column.id === input.columnId)
  if (!destination) return board

  const destinationIndex = Math.max(0, Math.min(input.position, destination.cards.length))
  const destinationCards = [...destination.cards]
  destinationCards.splice(destinationIndex, 0, movedCard)

  return {
    ...board,
    columns: columnsWithoutCard.map((column) => column.id === input.columnId
      ? { ...column, cards: destinationCards }
      : column),
  }
}

export function useMoveCard() {
  const queryClient = useQueryClient()
  return useMutation({
    scope: { id: 'board-writes' },
    mutationFn: moveCard,
    onMutate: (input: MoveCardInput) => begin(queryClient, (board) => moveCardInBoard(board, input)),
    onError: (_error, _input, context) => rollback(queryClient, context),
    onSettled: (_data, _error, _input, context) => settle(queryClient, context),
  })
}
