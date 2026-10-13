import type { BoardData } from './types/board'

export type CardDirection = 'left' | 'right' | 'up' | 'down'
export type CardMovement = { cardId: string; columnId: string; position?: number }
export type DropAnchor = { cardId: string; side: 'before' | 'after' }

export function isValidMovement(board: BoardData, intent: CardMovement): boolean {
  const sourceIndex = board.columns.findIndex(column => column.cards.some(card => card.id === intent.cardId))
  const targetIndex = board.columns.findIndex(column => column.id === intent.columnId)
  if (sourceIndex < 0 || targetIndex < 0 || Math.abs(sourceIndex - targetIndex) > 1) return false
  const source = board.columns[sourceIndex]
  const target = board.columns[targetIndex]
  const sameColumn = sourceIndex === targetIndex
  const lengthAfterRemoval = target.cards.length - (sameColumn ? 1 : 0)
  const position = intent.position ?? lengthAfterRemoval
  return Number.isSafeInteger(position) && position >= 0 && position <= lengthAfterRemoval &&
    (!sameColumn || position !== source.cards.findIndex(card => card.id === intent.cardId))
}

export function getDropMovement(board: BoardData, cardId: string, columnId: string, anchor?: DropAnchor): CardMovement | undefined {
  const target = board.columns.find(column => column.id === columnId)
  if (!target || anchor?.cardId === cardId) return
  const cards = target.cards.filter(card => card.id !== cardId)
  const anchorIndex = anchor ? cards.findIndex(card => card.id === anchor.cardId) : cards.length
  if (anchorIndex < 0) return
  const position = anchorIndex + (anchor?.side === 'after' ? 1 : 0)
  const intent = { cardId, columnId, position }
  return isValidMovement(board, intent) ? intent : undefined
}

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
