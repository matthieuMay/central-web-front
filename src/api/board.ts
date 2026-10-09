import type { BoardData, CommentInput, TaskData, UserData } from '../types/board'

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

export async function getUsers() {
  const response = await request<UserData[] | { value: UserData[] }>('/users')
  if (Array.isArray(response)) return response
  if (Array.isArray(response.value)) return response.value
  throw new Error('Users response did not contain a user list')
}

export function createCard({ columnId, id, title }: { columnId: string; id: string; title: string }) {
  return request(`/columns/${encodeURIComponent(columnId)}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title }),
  })
}

export function editCard({ cardId, title, description, assignees, checklistItems }: { cardId: string; title: string; description?: string | null; assignees: string[]; checklistItems: TaskData[] }) {
  return request(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, ...(description !== undefined ? { description } : {}), assignees, checklistItems }),
  })
}

export function updateCardChecklistItems({ cardId, checklistItems }: { cardId: string; checklistItems: TaskData[] }) {
  return request(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checklistItems }),
  })
}

export function updateCardComments({ cardId, comments }: { cardId: string; comments: CommentInput[] }) {
  return request(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comments }),
  })
}

export function moveCard({ cardId, column, position }: { cardId: string; column: string; position?: number }) {
  return request<BoardData>(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column, ...(position === undefined ? {} : { position }) }),
  })
}
