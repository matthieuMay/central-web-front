import { useMutation, useQueryClient, useQuery, useIsFetching, useIsMutating, type QueryClient, type UseMutationOptions } from '@tanstack/react-query'
import type { BoardData } from '../types/board'
import { boardKey, createCard, editCard, moveCard, getBoard, patchCardCollections } from './board'
import { boardWriteKey } from './boardKeys'
import { idleBoardWrite, reserveBoardWrite, releaseBoardWrite, setBoardRecovery } from './boardWrites'
import { cardCollectionsMutationOptions, recoverBoard } from './cardCollectionsMutation'
import { placeCard, type MoveCardInput } from './placement'

export type CreateCardInput = { columnId: string; id: string; title: string }
export type EditCardInput = { cardId: string; title: string; description?: string | null }

export function useBoardWriteStatus() {
  const client = useQueryClient()
  const { data } = useQuery({ queryKey: boardWriteKey, queryFn: () => idleBoardWrite, initialData: idleBoardWrite, enabled: false })
  const writes = useIsMutating({ predicate: (mutation) => mutation.options.scope?.id === 'board-writes' })
  const fetching = useIsFetching({ queryKey: boardKey, exact: true })
  const readFailed = client.getQueryState(boardKey)?.status === 'error'
  const recovery = data.recovery ?? (readFailed ? 'Actualisation du tableau impossible. Actualisez avant toute nouvelle écriture.' : null)
  return { ...data, recovery, busy: data.busy || writes > 0 || fetching > 0, blocked: !!recovery, refresh: () => recoverBoard(client, getBoard) }
}

function useBoardMutation<TData, TInput, TContext = unknown>(options: UseMutationOptions<TData, Error, TInput, TContext>) {
  const client = useQueryClient()
  const mutation = useMutation({
    ...options,
    retry: false,
    onSettled: async (...args) => {
      try { await options.onSettled?.(...args) } finally { releaseBoardWrite(client) }
    },
  })
  const mutate: typeof mutation.mutate = (...args) => {
    try { reserveBoardWrite(client) } catch { return }
    mutation.mutate(...args)
  }
  const mutateAsync: typeof mutation.mutateAsync = async (...args) => {
    reserveBoardWrite(client)
    return mutation.mutateAsync(...args)
  }
  return { ...mutation, mutate, mutateAsync }
}

export function useUpdateCardCollections() {
  const client = useQueryClient()
  return useBoardMutation(cardCollectionsMutationOptions(client, { getBoard, patchCardCollections }))
}

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
  try {
    await queryClient.invalidateQueries({ queryKey: boardKey, exact: true }, { throwOnError: true })
  } catch {
    setBoardRecovery(queryClient, 'Actualisation impossible. Actualisez avant toute nouvelle écriture.')
  }
}

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useBoardMutation({
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
  return useBoardMutation({
    scope: { id: 'board-writes' },
    mutationFn: editCard,
    onMutate: (input: EditCardInput) => begin(queryClient, (board) => ({
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) => card.id === input.cardId
          ? { ...card, title: input.title, ...(input.description === undefined ? {} : input.description === null ? { description: undefined } : { description: input.description }) }
          : card),
      })),
    })),
    onError: (_error, _input, context) => rollback(queryClient, context),
    onSettled: (_data, _error, _input, context) => settle(queryClient, context),
  })
}

export function useMoveCard(onFailure: (input: MoveCardInput) => void) {
  const queryClient = useQueryClient()
  return useBoardMutation({
    scope: { id: 'board-writes' },
    mutationFn: moveCard,
    onMutate: (input: MoveCardInput) => begin(queryClient, (board) => placeCard(board, input)),
    onError: (_error, input, context) => {
      onFailure(input)
      rollback(queryClient, context)
    },
    onSettled: (_data, _error, _input, context) => settle(queryClient, context),
  })
}
