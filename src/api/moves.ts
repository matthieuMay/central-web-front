import type { BoardData } from '../types/board'

// `position` is the 0-based index in `column` once the card has left its current
// place; omitting it appends the card to the end (same rules as PUT /cards/:cardId).
export type MoveCardInput = { cardId: string; column: string; position?: number }

// Mirrors the API: remove the card, then insert it at `position` (or append).
export function moveCardInBoard(board: BoardData, { cardId, column, position }: MoveCardInput): BoardData {
  const card = board.columns.flatMap((item) => item.cards).find((item) => item.id === cardId)
  if (!card) return board
  return {
    ...board,
    columns: board.columns.map((item) => {
      const cards = item.cards.filter((other) => other.id !== cardId)
      if (item.id !== column) return cards.length === item.cards.length ? item : { ...item, cards }
      const index = Math.min(Math.max(position ?? cards.length, 0), cards.length)
      return { ...item, cards: [...cards.slice(0, index), card, ...cards.slice(index)] }
    }),
  }
}

// Converts a drop slot into an API position. `index` counts the dragged card where it
// currently is (slot 0 is above the first card); the API counts without it.
// Returns null when the drop would leave the card where it is.
export function dropPosition(board: BoardData, cardId: string, columnId: string, index: number): number | null {
  const source = board.columns.find((column) => column.cards.some((card) => card.id === cardId))
  if (!source) return null
  const sourceIndex = source.cards.findIndex((card) => card.id === cardId)
  const sameColumn = source.id === columnId
  const position = sameColumn && sourceIndex < index ? index - 1 : index
  return sameColumn && position === sourceIndex ? null : position
}
