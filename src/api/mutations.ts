import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type { BoardData, ChecklistItem } from '../types/board'
import { boardKey, createCard, editCard, moveCard, type CommentInput } from './board'

export type CreateCardInput = { columnId: string; id: string; title: string }
export type EditCardInput = { cardId: string; title?: string; description?: string | null; checklistItems?: ChecklistItem[]; comments?: CommentInput[] }

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
        ? {
          ...column,
          cards: [...column.cards, {
            id: input.id,
            title: input.title,
            assignees: [],
            comments: [],
            checklistItems: [],
          }],
        }
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
          ? {
            ...card,
            ...(input.title === undefined ? {} : { title: input.title }),
            ...(input.description === undefined ? {} : input.description === null ? { description: undefined } : { description: input.description }),
            ...(input.checklistItems === undefined ? {} : { checklistItems: input.checklistItems }),
            ...(input.comments === undefined ? {} : { comments: input.comments.map((comment) => ({ ...comment, createdAt: comment.createdAt ?? new Date().toISOString() })) }),
          }
          : card),
      })),
    })),
    onError: (_error, _input, context) => rollback(queryClient, context),
    onSettled: (_data, _error, _input, context) => settle(queryClient, context),
  })
}

export function useMoveCard() {
  const queryClient = useQueryClient()
  return useMutation({
    scope: { id: 'board-writes' },
    mutationFn: moveCard,
    onSuccess: (board) => queryClient.setQueryData(boardKey, board),
  })
}
