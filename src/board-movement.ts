import type { BoardData } from './types/board'

export type CardDirection = 'left' | 'right' | 'up' | 'down'
export type CardMovement = { cardId: string; columnId: string; position?: number }

export function getKeyboardMovement(board: BoardData, cardId: string, direction: CardDirection): CardMovement | undefined {
  const columnIndex = board.columns.findIndex(column => column.cards.some(card => card.id === cardId))
  const source = board.columns[columnIndex]
  if (!source) return

  if (direction === 'left' || direction === 'right') {
    const target = board.columns[columnIndex + (direction === 'left' ? -1 : 1)]
    if (target) return { cardId, columnId: target.id }
    return
  }

  const cardIndex = source.cards.findIndex(card => card.id === cardId)
  // After removal, moving one rank inserts at i - 1 or i + 1 respectively.
  const position = cardIndex + (direction === 'up' ? -1 : 1)
  if (position < 0 || position >= source.cards.length) return
  return { cardId, columnId: source.id, position }
}
