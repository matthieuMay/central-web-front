import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBoard, fetchUsers, moveCard, patchCard } from './api'
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

function mergeCard(card: CardData, patch: CardPatch): CardData {
  return {
    ...card,
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    ...(patch.description !== undefined ? { description: patch.description ?? undefined } : {}),
    ...(patch.assignees !== undefined ? { assignees: patch.assignees } : {}),
    ...(patch.comments !== undefined
      ? {
          comments: patch.comments.map((comment) => ({
            user: comment.user,
            comment: comment.comment,
            createdAt: comment.createdAt ?? '',
          })),
        }
      : {}),
    ...(patch.checklistItems !== undefined ? { checklistItems: patch.checklistItems } : {}),
  }
}

function applyPatch(board: BoardData, cardId: string, patch: CardPatch): BoardData {
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) => (card.id === cardId ? mergeCard(card, patch) : card)),
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

export function useUsers() {
  return useQuery({ queryKey: ['users'], queryFn: fetchUsers })
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
