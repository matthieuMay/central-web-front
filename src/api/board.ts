import type { BoardData, ChecklistItemData, CommentData, UserData } from '../types/board'

export const boardKey = ['board', 'mini-trello'] as const
export const usersKey = ['users'] as const

const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, init)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status} ${response.statusText})`)
  }
  return response.json() as Promise<T>
}

export function getBoard() {
  return request<BoardData>('/boards/mini-trello')
}

export function getUsers() {
  return request<UserData[]>('/users')
}

export function createCard({ columnId, id, title }: { columnId: string; id: string; title: string }) {
  return request(`/columns/${encodeURIComponent(columnId)}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title }),
  })
}

export type CommentPatch = Omit<CommentData, 'createdAt'> & { createdAt?: string }
export type EditCardInput = {
  cardId: string
  title?: string
  description?: string | null
  assignees?: string[]
  comments?: CommentPatch[]
  checklistItems?: ChecklistItemData[]
}

export function editCard({ cardId, ...changes }: EditCardInput) {
  return request(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  })
}

export type MoveCardInput = {
  cardId: string
  columnId: string
  position?: number
}

export function moveCard({ cardId, columnId, position }: MoveCardInput) {
  return request<BoardData>(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column: columnId, ...(position === undefined ? {} : { position }) }),
  })
}
