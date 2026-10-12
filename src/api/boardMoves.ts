import type { BoardData } from '../types/board'

export type CardMove = { cardId: string; column: string; position: number }

// The API wants the index in the target column once the card has been removed
// from its own column. `insertBeforeIndex` is the index in the column as it is
// displayed now (the card itself included when it stays in the same column).
export function positionAfterRemoval(board: BoardData, cardId: string, columnId: string, insertBeforeIndex: number) {
  const column = board.columns.find((item) => item.id === columnId)
  const currentIndex = column?.cards.findIndex((card) => card.id === cardId) ?? -1
  return currentIndex !== -1 && insertBeforeIndex > currentIndex ? insertBeforeIndex - 1 : insertBeforeIndex
}

// Returns a new board where the card has left its column and sits at `position` in `column`.
export function moveCardInBoard(board: BoardData, { cardId, column, position }: CardMove): BoardData {
  const card = board.columns.flatMap((item) => item.cards).find((item) => item.id === cardId)
  if (!card) return board
  return {
    ...board,
    columns: board.columns.map((item) => {
      const cards = item.cards.filter((other) => other.id !== cardId)
      if (item.id === column) cards.splice(position, 0, card)
      return { ...item, cards }
    }),
  }
}
