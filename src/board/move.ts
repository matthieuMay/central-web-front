import type { BoardData, ColumnData } from '../types/board'

export type ArrowKey = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown'

export type Move = { column: string; position: number }

export function columnOfCard(board: BoardData, cardId: string): ColumnData | undefined {
  return board.columns.find((column) => column.cards.some((card) => card.id === cardId))
}

export function applyMove(
  board: BoardData,
  cardId: string,
  columnId: string,
  position?: number,
): BoardData {
  const source = columnOfCard(board, cardId)
  const destination = board.columns.find((column) => column.id === columnId)
  if (!source || !destination) return board

  const columns = board.columns.map((column) => ({ ...column, cards: [...column.cards] }))
  const from = columns.find((column) => column.id === source.id)
  const to = columns.find((column) => column.id === columnId)
  if (!from || !to) return board

  const fromIndex = from.cards.findIndex((card) => card.id === cardId)
  if (fromIndex < 0) return board

  const [card] = from.cards.splice(fromIndex, 1)
  const target = position === undefined ? to.cards.length : Math.max(0, Math.min(position, to.cards.length))
  to.cards.splice(target, 0, card)

  return { ...board, columns }
}

export function keyboardMove(board: BoardData, cardId: string, key: ArrowKey): Move | null {
  const columnIndex = board.columns.findIndex((column) => column.cards.some((card) => card.id === cardId))
  if (columnIndex < 0) return null

  const column = board.columns[columnIndex]
  const cardIndex = column.cards.findIndex((card) => card.id === cardId)

  switch (key) {
    case 'ArrowUp':
      return cardIndex > 0 ? { column: column.id, position: cardIndex - 1 } : null
    case 'ArrowDown':
      return cardIndex < column.cards.length - 1 ? { column: column.id, position: cardIndex + 1 } : null
    case 'ArrowLeft': {
      if (columnIndex === 0) return null
      const target = board.columns[columnIndex - 1]
      return { column: target.id, position: Math.min(cardIndex, target.cards.length) }
    }
    case 'ArrowRight': {
      if (columnIndex === board.columns.length - 1) return null
      const target = board.columns[columnIndex + 1]
      return { column: target.id, position: Math.min(cardIndex, target.cards.length) }
    }
  }
}
