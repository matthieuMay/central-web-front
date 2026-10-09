import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import type { BoardData, CommentInput, TaskData, UserData } from '../types/board'
import { boardKey, createCard, editCard, moveCard, updateCardChecklistItems, updateCardComments } from './board'
import { moveCardToPosition } from '../domain/boardMovement'

export type CreateCardInput = { columnId: string; id: string; title: string }
export type EditCardInput = { cardId: string; title: string; description?: string | null; assignees: string[]; assignedUsers: UserData[]; checklistItems: TaskData[] }
export type MoveCardInput = { cardId: string; column: string; position?: number }
export type UpdateCardCommentsInput = { cardId: string; comments: CommentInput[] }
export type UpdateCardChecklistItemsInput = { cardId: string; checklistItems: TaskData[] }

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
          ? { ...card, title: input.title, assignees: input.assignedUsers, checklistItems: input.checklistItems, ...(input.description === undefined ? {} : input.description === null ? { description: undefined } : { description: input.description }) }
          : card),
      })),
    })),
    onError: (_error, _input, context) => rollback(queryClient, context),
    onSettled: (_data, _error, _input, context) => settle(queryClient, context),
  })
}

export function useUpdateCardChecklistItems() {
  const queryClient = useQueryClient()
  return useMutation({
    scope: { id: 'board-writes' },
    mutationFn: updateCardChecklistItems,
    onMutate: (input: UpdateCardChecklistItemsInput) => begin(queryClient, (board) => ({
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) => card.id === input.cardId ? { ...card, checklistItems: input.checklistItems } : card),
      })),
    })),
    onError: (_error, _input, context) => rollback(queryClient, context),
    onSettled: (_data, _error, _input, context) => settle(queryClient, context),
  })
}

export function useUpdateCardComments() {
  const queryClient = useQueryClient()
  return useMutation({
    scope: { id: 'board-writes' },
    mutationFn: updateCardComments,
    onMutate: (input: UpdateCardCommentsInput) => begin(queryClient, (board) => ({
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) => card.id === input.cardId
          ? { ...card, comments: input.comments.map((comment) => ({ ...comment, createdAt: comment.createdAt ?? new Date().toISOString() })) }
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
    onMutate: async (input: MoveCardInput) => {
      await queryClient.cancelQueries({ queryKey: boardKey, exact: true })
      const previous = queryClient.getQueryData<BoardData>(boardKey)
      if (previous) {
        const destination = previous.columns.find((column) => column.id === input.column)
        const position = input.position ?? destination?.cards.length
        if (position !== undefined) {
          const next = moveCardToPosition(previous, input.cardId, input.column, position)
          if (next) queryClient.setQueryData(boardKey, next)
        }
      }
      return { previous }
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(boardKey, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: boardKey, exact: true }),
  })
}
