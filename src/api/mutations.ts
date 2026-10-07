import { useMutation, useQueryClient } from '@tanstack/react-query'
import { boardKey, createCard, editCard } from './board'

export type CreateCardInput = { columnId: string; id: string; title: string }
export type EditCardInput = { cardId: string; title: string }

export function useCreateCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKey, exact: true }),
  })
}

export function useEditCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: editCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKey, exact: true }),
  })
}
