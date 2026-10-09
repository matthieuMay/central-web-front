import type { BoardData, CardData, ColumnData } from '../types/board'

const apiBaseUrl = (
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:3000'
)

function isCardData(value: unknown): value is CardData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'title' in value &&
    typeof value.title === 'string' &&
    (!('description' in value) || typeof value.description === 'string')
  )
}

function isColumnData(value: unknown): value is ColumnData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'title' in value &&
    typeof value.title === 'string' &&
    'cards' in value &&
    Array.isArray(value.cards) &&
    value.cards.every(isCardData)
  )
}

function isBoardData(value: unknown): value is BoardData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'title' in value &&
    typeof value.title === 'string' &&
    'columns' in value &&
    Array.isArray(value.columns) &&
    value.columns.every(isColumnData)
  )
}

export async function updateCardPosition(
  cardId: string,
  column: string,
  position: number,
): Promise<BoardData> {
  const response = await fetch(`${apiBaseUrl}/cards/${encodeURIComponent(cardId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column, position }),
  })

  if (!response.ok) {
    throw new Error(`Could not move card (server returned ${response.status}).`)
  }

  const board: unknown = await response.json()
  if (!isBoardData(board)) {
    throw new Error('Could not move card: the server returned an invalid board.')
  }

  return board
}
