import type { BoardData, CardComment, CardData, ChecklistItem, CommentInput, User } from '../types/board'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type MoveRequest = { column: string; position?: number }

export type CardPatch = {
  assignees?: string[]
  comments?: (CardComment | CommentInput)[]
  checklistItems?: ChecklistItem[]
}

export async function fetchBoard(boardId: string): Promise<BoardData> {
  const response = await fetch(`${API_URL}/boards/${boardId}`)
  if (!response.ok) throw new Error(`Could not load board (${response.status})`)
  return response.json()
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`)
  if (!response.ok) throw new Error(`Could not load users (${response.status})`)
  return response.json()
}

export async function moveCard(cardId: string, move: MoveRequest): Promise<BoardData> {
  const response = await fetch(`${API_URL}/cards/${cardId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(move),
  })
  if (!response.ok) throw new Error(`Could not move card (${response.status})`)
  return response.json()
}

export async function patchCard(cardId: string, changes: CardPatch): Promise<CardData> {
  const response = await fetch(`${API_URL}/cards/${cardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  })
  if (!response.ok) throw new Error(`Could not update card (${response.status})`)
  return response.json()
}
