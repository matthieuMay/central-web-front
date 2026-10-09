import type { BoardData } from '../types/board'

export type MoveCardInput = { cardId: string; column: string; position?: number }

// API positions refer to the destination list after removing the moved card.
export function placeCard(board: BoardData, { cardId, column, position }: MoveCardInput): BoardData {
  const source = board.columns.find((item) => item.cards.some((card) => card.id === cardId))
  const destination = board.columns.find((item) => item.id === column)
  const card = source?.cards.find((item) => item.id === cardId)
  if (!source || !destination || !card) return board
  const remaining = destination.cards.filter((item) => item.id !== cardId)
  const index = position ?? remaining.length
  if (!Number.isSafeInteger(index) || index < 0 || index > remaining.length) return board
  if (source.id === column && source.cards.indexOf(card) === index) return board
  remaining.splice(index, 0, card)
  return {
    ...board,
    columns: board.columns.map((item) => item.id === column
      ? { ...item, cards: remaining }
      : item.id === source.id ? { ...item, cards: item.cards.filter((item) => item.id !== cardId) } : item),
  }
}
