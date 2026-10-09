import type { BoardData, CardData, CardPatch } from '../types/board'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Request failed (${response.status})`)
  }

  return (await response.json()) as T
}

export function fetchBoard(id: string): Promise<BoardData> {
  return request<BoardData>(`/boards/${encodeURIComponent(id)}`)
}

export function patchCard(cardId: string, patch: CardPatch): Promise<CardData> {
  return request<CardData>(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function moveCard(cardId: string, columnId: string, position: number): Promise<BoardData> {
  return request<BoardData>(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PUT',
    body: JSON.stringify({ column: columnId, position }),
  })
}
