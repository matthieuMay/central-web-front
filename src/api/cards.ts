import type {
  BoardData,
  CardCollections,
  CardData,
  ChecklistItem,
  ColumnData,
  CommentData,
  UserData,
} from '../types/board'

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
    (!('description' in value) || typeof value.description === 'string') &&
    'assignees' in value &&
    Array.isArray(value.assignees) &&
    value.assignees.every((assignee) => typeof assignee === 'string') &&
    'comments' in value &&
    Array.isArray(value.comments) &&
    value.comments.every(isCommentData) &&
    'checklistItems' in value &&
    Array.isArray(value.checklistItems) &&
    value.checklistItems.every(isChecklistItem)
  )
}

function isCommentData(value: unknown): value is CommentData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'user' in value &&
    typeof value.user === 'string' &&
    'comment' in value &&
    typeof value.comment === 'string' &&
    'createdAt' in value &&
    typeof value.createdAt === 'string'
  )
}

function isChecklistItem(value: unknown): value is ChecklistItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'description' in value &&
    typeof value.description === 'string' &&
    'done' in value &&
    typeof value.done === 'boolean'
  )
}

function isUserData(value: unknown): value is UserData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'firstname' in value &&
    typeof value.firstname === 'string' &&
    'lastname' in value &&
    typeof value.lastname === 'string'
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

export async function getBoard(): Promise<BoardData> {
  const response = await fetch(`${apiBaseUrl}/boards/mini-trello`)
  if (!response.ok) {
    throw new Error(`Could not load board (server returned ${response.status}).`)
  }

  const board: unknown = await response.json()
  if (!isBoardData(board)) {
    throw new Error('Could not load board: the server returned an invalid board.')
  }

  return board
}

export async function getUsers(): Promise<UserData[]> {
  const response = await fetch(`${apiBaseUrl}/users`)
  if (!response.ok) {
    throw new Error(`Could not load users (server returned ${response.status}).`)
  }

  const users: unknown = await response.json()
  if (!Array.isArray(users) || !users.every(isUserData)) {
    throw new Error('Could not load users: the server returned invalid user data.')
  }

  return users
}

export async function patchCardCollection<K extends keyof CardCollections>(
  cardId: string,
  collection: K,
  value: CardCollections[K],
): Promise<CardData> {
  const response = await fetch(`${apiBaseUrl}/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [collection]: value }),
  })

  if (!response.ok) {
    throw new Error(`Could not update card details (server returned ${response.status}).`)
  }

  const card: unknown = await response.json()
  if (!isCardData(card)) {
    throw new Error('Could not update card details: the server returned an invalid card.')
  }

  return card
}
