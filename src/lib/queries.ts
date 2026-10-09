import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBoard, moveCard, patchCard } from './api'
import type { BoardData, CardData, CardPatch } from '../types/board'

export const BOARD_ID = 'mini-trello'
const boardKey = ['board', BOARD_ID] as const

function replaceCard(board: BoardData, card: CardData): BoardData {
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.map((item) => (item.id === card.id ? card : item)),
    })),
  }
}

function applyPatch(board: BoardData, cardId: string, patch: CardPatch): BoardData {
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) => (card.id === cardId ? { ...card, ...patch } : card)),
    })),
  }
}

function applyMove(board: BoardData, cardId: string, columnId: string, position: number): BoardData {
  const columns = board.columns.map((column) => ({ ...column, cards: [...column.cards] }))

  let moved: CardData | undefined
  for (const column of columns) {
    const index = column.cards.findIndex((card) => card.id === cardId)
    if (index !== -1) {
      ;[moved] = column.cards.splice(index, 1)
      break
    }
  }

  const target = columns.find((column) => column.id === columnId)
  if (!moved || !target) return board

  target.cards.splice(Math.max(0, Math.min(position, target.cards.length)), 0, moved)
  return { ...board, columns }
}

export function useBoard() {
  return useQuery({ queryKey: boardKey, queryFn: () => fetchBoard(BOARD_ID) })
}

export function useUpdateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cardId, patch }: { cardId: string; patch: CardPatch }) => patchCard(cardId, patch),
    onMutate: async ({ cardId, patch }) => {
      await queryClient.cancelQueries({ queryKey: boardKey })
      const previous = queryClient.getQueryData<BoardData>(boardKey)
      if (previous) queryClient.setQueryData(boardKey, applyPatch(previous, cardId, patch))
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(boardKey, context.previous)
    },
    onSuccess: (card) => {
      const board = queryClient.getQueryData<BoardData>(boardKey)
      if (board) queryClient.setQueryData(boardKey, replaceCard(board, card))
    },
  })
}

export function useMoveCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ cardId, columnId, position }: { cardId: string; columnId: string; position: number }) =>
      moveCard(cardId, columnId, position),
    onMutate: async ({ cardId, columnId, position }) => {
      await queryClient.cancelQueries({ queryKey: boardKey })
      const previous = queryClient.getQueryData<BoardData>(boardKey)
      if (previous) queryClient.setQueryData(boardKey, applyMove(previous, cardId, columnId, position))
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(boardKey, context.previous)
    },
    onSuccess: (board) => queryClient.setQueryData(boardKey, board),
  })
}
