import type { BoardData, CardCollectionsPatch } from '../types/board'
import type { UserData } from '../types/user'
import type { MoveCardInput } from './placement'

export { boardKey, usersKey } from './boardKeys'

const apiUrl = (import.meta.env?.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

class HttpError extends Error {
  status: number
  constructor(response: Response) {
    super(`Request failed (${response.status} ${response.statusText})`)
    this.status = response.status
  }
}

async function request<T>(path: string, init?: RequestInit, readBody = true): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, init)
  if (!response.ok) {
    throw new HttpError(response)
  }
  return readBody ? response.json() as Promise<T> : undefined as T
}

export function getBoard() {
  return request<BoardData>('/boards/mini-trello')
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

export function moveCard({ cardId, column, position }: MoveCardInput) {
  return request<BoardData>(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column, position }),
  })
}

export function getUsers() {
  return request<UserData[]>('/users')
}

export function patchCardCollections(cardId: string, patch: CardCollectionsPatch): Promise<void> {
  // The confirmed 200 response contains a card; the subsequent GET is authoritative.
  return request<void>(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  }, false)
}
