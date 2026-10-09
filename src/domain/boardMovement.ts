import type { BoardData } from '../types/board'

export type MoveDirection = 'up' | 'down'

export function moveCardWithinColumn(board: BoardData, cardId: string, direction: MoveDirection): BoardData | null {
  const columns = board.columns.map((column) => {
    const index = column.cards.findIndex((card) => card.id === cardId)
    if (index < 0) return column
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= column.cards.length) return column
    const cards = [...column.cards]
    ;[cards[index], cards[targetIndex]] = [cards[targetIndex], cards[index]]
    return { ...column, cards }
  })
  return columns.some((column, index) => column !== board.columns[index]) ? { ...board, columns } : null
}

export function moveCardToPosition(board: BoardData, cardId: string, destinationColumnId: string, position: number): BoardData | null {
  const sourceColumn = board.columns.find((column) => column.cards.some((card) => card.id === cardId))
  const destinationColumn = board.columns.find((column) => column.id === destinationColumnId)
  if (!sourceColumn || !destinationColumn || !Number.isInteger(position) || position < 0) return null

  const card = sourceColumn.cards.find((item) => item.id === cardId)
  if (!card) return null
  const sourceCards = sourceColumn.cards.filter((item) => item.id !== cardId)
  const destinationCards = sourceColumn.id === destinationColumn.id
    ? sourceCards
    : destinationColumn.cards
  if (position > destinationCards.length) return null
  if (sourceColumn.id === destinationColumn.id && position === sourceColumn.cards.findIndex((item) => item.id === cardId)) return null

  const nextColumns = board.columns.map((column) => {
    if (column.id === sourceColumn.id && column.id === destinationColumn.id) {
      const cards = [...sourceCards]
      cards.splice(position, 0, card)
      return { ...column, cards }
    }
    if (column.id === sourceColumn.id) return { ...column, cards: sourceCards }
    if (column.id === destinationColumn.id) {
      const cards = [...destinationCards]
      cards.splice(position, 0, card)
      return { ...column, cards }
    }
    return column
  })
  return { ...board, columns: nextColumns }
}

export function entersLastColumn(board: BoardData, nextBoard: BoardData, cardId: string): boolean {
  const lastColumnId = board.columns.at(-1)?.id
  if (!lastColumnId) return false
  const sourceColumn = board.columns.find((column) => column.cards.some((card) => card.id === cardId))
  const destinationColumn = nextBoard.columns.find((column) => column.cards.some((card) => card.id === cardId))
  return sourceColumn?.id !== lastColumnId && destinationColumn?.id === lastColumnId
}
