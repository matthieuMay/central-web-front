import { useMutation, useQueryClient } from '@tanstack/react-query'
import { boardKey, createCard, editCard, moveCard } from './board'

export type MoveCardInput = {
  cardId: string
  columnId: string
}

export function useMoveCard() {
  const queryClient = useQueryClient()

  return useMutation({
    scope: { id: 'board-writes' },
    mutationFn: moveCard,
    onSuccess: (board) => {
      queryClient.setQueryData(boardKey, board)
    },
  })
}