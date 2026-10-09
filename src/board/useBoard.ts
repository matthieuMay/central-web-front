import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBoard, moveCard, type MoveRequest } from '../api/board'
import type { BoardData } from '../types/board'
import { applyMove } from './move'

export const boardQueryKey = (boardId: string) => ['board', boardId] as const

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: boardQueryKey(boardId),
    queryFn: () => fetchBoard(boardId),
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
