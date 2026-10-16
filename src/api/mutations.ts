import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type { BoardData, CommentData } from '../types/board'
import { boardKey, createCard, editCard, moveCard, type EditCardInput, type MoveCardInput } from './board'

export type CreateCardInput = { columnId: string; id: string; title: string }
type Change = (board: BoardData) => BoardData
type Entry = { token: symbol; change: Change; pending: boolean }
type Ledger = { base: BoardData | undefined; entries: Entry[] }
type Context = { previous: BoardData | undefined; token: symbol }

// Replaying from the pre-batch snapshot keeps later optimistic writes when an
// earlier request fails. Successful writes remain until the whole batch refetches.
const ledgers = new WeakMap<QueryClient, Ledger>()

function optimisticallyEdit(board: BoardData, input: EditCardInput): BoardData {
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) => {
        if (card.id !== input.cardId) return card
        return {
          ...card,
          ...(input.title === undefined ? {} : { title: input.title }),
          ...(input.description === undefined ? {} : { description: input.description ?? undefined }),
          ...(input.assignees === undefined ? {} : { assignees: input.assignees }),
          ...(input.comments === undefined || !input.comments.every((comment) => comment.createdAt)
            ? {}
            : { comments: input.comments as CommentData[] }),
          ...(input.checklistItems === undefined ? {} : { checklistItems: input.checklistItems }),
        }
      }),
    })),
  }
}

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

function optimisticallyMove(board: BoardData, input: MoveCardInput): BoardData {
  const card = board.columns.flatMap((column) => column.cards)
    .find((item) => item.id === input.cardId)
  const destination = board.columns.find((column) => column.id === input.columnId)
  if (!card || !destination) return board

  const columnsWithoutCard = board.columns.map((column) => ({
    ...column,
    cards: column.cards.filter((item) => item.id !== input.cardId),
  }))

  return {
    ...board,
    columns: columnsWithoutCard.map((column) => {
      if (column.id !== input.columnId) return column
      const position = Math.max(0, Math.min(input.position ?? column.cards.length, column.cards.length))
      return {
        ...column,
        cards: [...column.cards.slice(0, position), card, ...column.cards.slice(position)],
      }
    }),
  }
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    scope: { id: 'board-writes' },
    mutationFn: createCard,
    onMutate: (input: CreateCardInput) => begin(queryClient, (board) => ({
      ...board,
      columns: board.columns.map((column) => column.id === input.columnId
        ? { ...column, cards: [...column.cards, { id: input.id, title: input.title, assignees: [], comments: [], checklistItems: [] }] }
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
    onMutate: (input: EditCardInput) => begin(queryClient, (board) => optimisticallyEdit(board, input)),
    onError: (_error, _input, context) => rollback(queryClient, context),
    onSettled: (_data, _error, _input, context) => settle(queryClient, context),
  })
}

export function useMoveCard() {
  const queryClient = useQueryClient()
  return useMutation({
    scope: { id: 'board-writes' },
    mutationFn: moveCard,
    onMutate: (input: MoveCardInput) => begin(queryClient, (board) => optimisticallyMove(board, input)),
    onError: (_error, _input, context) => rollback(queryClient, context),
    onSettled: (_data, _error, _input, context) => settle(queryClient, context),
  })
}
