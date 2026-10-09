import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBoard, fetchUsers, moveCard, patchCard, type CardPatch, type MoveRequest } from '../api/board'
import type { BoardData } from '../types/board'
import { replaceCard } from './collections'
import { applyMove } from './move'

export const boardQueryKey = (boardId: string) => ['board', boardId] as const
export const usersQueryKey = ['users'] as const

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: boardQueryKey(boardId),
    queryFn: () => fetchBoard(boardId),
  })
}

export function useUsers() {
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: fetchUsers,
  })
}

type MoveVariables = { cardId: string; move: MoveRequest }

export function useMoveCard(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cardId, move }: MoveVariables) => moveCard(cardId, move),
    onMutate: async ({ cardId, move }) => {
      const key = boardQueryKey(boardId)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<BoardData>(key)
      if (previous) {
        queryClient.setQueryData(key, applyMove(previous, cardId, move.column, move.position))
      }
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(boardQueryKey(boardId), context.previous)
      }
    },
    onSuccess: (serverBoard) => {
      queryClient.setQueryData(boardQueryKey(boardId), serverBoard)
    },
  })
}

type PatchVariables = { cardId: string; changes: CardPatch }

export function usePatchCard(boardId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cardId, changes }: PatchVariables) => patchCard(cardId, changes),
    onSuccess: (card) => {
      const key = boardQueryKey(boardId)
      const board = queryClient.getQueryData<BoardData>(key)
      if (board) queryClient.setQueryData(key, replaceCard(board, card))
    },
  })
}
