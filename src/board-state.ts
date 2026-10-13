import type { BoardData, CardData } from './types/board'

export function findCard(board: BoardData, cardId: string): CardData | undefined {
  return board.columns.flatMap(column => column.cards).find(card => card.id === cardId)
}
/** PATCH returns a card; retain the complete board and all other collections. */

export function replaceCardInBoard(board: BoardData, confirmedCard: CardData): BoardData {
  return {
    ...board,
    columns: board.columns.map(column => ({
      ...column,
      cards: column.cards.map(card => card.id === confirmedCard.id ? confirmedCard : card),
    })),
  }
}

export function isMoveIntoLastColumn(board: BoardData | undefined, sourceColumnId: string, cardId: string): boolean {
  const lastColumn = board?.columns.at(-1)
  return !!lastColumn && sourceColumnId !== lastColumn.id &&
    lastColumn.cards.some(card => card.id === cardId)
}
