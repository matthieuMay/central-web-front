import type { BoardData, CardData, CommentInput, SubtaskData, UserData } from '../types/board'

export const boardKey = ['board', 'mini-trello'] as const

const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, init)
  if (!response.ok) {
    throw new Error(`Request failed for ${path} (${response.status} ${response.statusText})`)
  }
  return response.json() as Promise<T>
}

export function getBoard() {
  return request<BoardData & { columns: Array<{ cards: Array<CardData & { checklistItems?: Array<{ description: string; done: boolean }> }> }> }>('/boards/mini-trello').then((board) => {
    const normalized = normalizeBoard(board)
    const missingCollections = normalized.columns
      .flatMap((column) => column.cards)
      .some((card) => !Array.isArray(card.assignees) || !Array.isArray(card.comments) || !Array.isArray(card.subtasks))
    if (missingCollections) {
      throw new Error('Board response is missing card collections (assignees, comments, or subtasks); update the backend contract before using card controls.')
    }
    return normalized
  })
}

export function getUsers() {
  return request<Array<UserData & {
    userId?: string | number
    display_name?: string
    fullName?: string
    first_name?: string
    last_name?: string
    firstname?: string
    lastname?: string
  }>>('/users').then((users) => users.map(normalizeUser))
}

export type CardCollections = {
  assignees: CardData['assignees']
  comments: CommentInput[]
  subtasks: CardData['subtasks']
}

export function updateCardCollections({ cardId, collections }: { cardId: string; collections: CardCollections }) {
  const { subtasks, ...apiCollections } = collections
  return request<CardData>(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...apiCollections, checklistItems: subtasks }),
  }).then(normalizeCard)
}

function normalizeUser(user: UserData & {
  userId?: string | number
  display_name?: string
  fullName?: string
  first_name?: string
  last_name?: string
  firstname?: string
  lastname?: string
}): UserData {
  const firstName = user.firstName ?? user.first_name ?? user.firstname
  const lastName = user.lastName ?? user.last_name ?? user.lastname
  return {
    ...user,
    id: String(user.id ?? user.userId),
    name: user.name ?? user.displayName ?? user.display_name ?? user.fullName ?? ([firstName, lastName].filter(Boolean).join(' ') || user.username || String(user.id ?? user.userId)),
    firstName,
    lastName,
  }
}

function normalizeCard(card: CardData & { checklistItems?: Array<{ description: string; done: boolean }> }): CardData {
  const legacy = card.checklistItems
  const subtasks: SubtaskData[] = Array.isArray(card.subtasks)
    ? card.subtasks
    : (legacy ?? []).map((item, index) => ({ id: `legacy-${index}-${item.description}`, title: item.description, done: item.done }))
  return {
    ...card,
    assignees: Array.isArray(card.assignees) ? card.assignees.map(String) : [],
    subtasks,
  }
}

function normalizeBoard(board: BoardData & { columns: Array<{ cards: Array<CardData & { checklistItems?: Array<{ description: string; done: boolean }> }> }> }): BoardData {
  return { ...board, columns: board.columns.map((column) => ({ ...column, cards: column.cards.map(normalizeCard) })) }
}

export function createCard({ columnId, id, title }: { columnId: string; id: string; title: string }) {
  return request(`/columns/${encodeURIComponent(columnId)}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title }),
  })
}

export function editCard({ cardId, title, description }: { cardId: string; title: string; description?: string | null }) {
  return request(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, ...(description !== undefined ? { description } : {}) }),
  })
}

export function moveCard({ cardId, column, position }: { cardId: string; column: string; position: number }) {
  return request<BoardData>(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column, position }),
  })
}
