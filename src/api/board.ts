import type { BoardData, CardData, CommentData } from '../types/board'

export type CommentInput = Omit<CommentData, 'createdAt'> & { createdAt?: string }

export const boardKey = ['board', 'mini-trello'] as const

const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, init)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status} ${response.statusText})`)
  }
  return response.json() as Promise<T>
}

function normalizeCard(card: CardData): CardData {
  return {
    ...card,
    assignees: card.assignees ?? [],
    comments: card.comments ?? [],
    checklistItems: card.checklistItems ?? [],
  }
}

function normalizeBoard(board: BoardData): BoardData {
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.map(normalizeCard),
    })),
  }
}

export async function getBoard() {
  return normalizeBoard(await request<BoardData>('/boards/mini-trello'))
}

export function createCard({ columnId, id, title }: { columnId: string; id: string; title: string }) {
  return request(`/columns/${encodeURIComponent(columnId)}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title }),
  })
}

export function editCard({ cardId, title, description, assignees, checklistItems, comments }: { cardId: string; title?: string; description?: string | null; assignees?: string[]; checklistItems?: { description: string; done: boolean }[]; comments?: CommentInput[] }) {
  return request(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(assignees !== undefined ? { assignees } : {}),
      ...(checklistItems !== undefined ? { checklistItems } : {}),
      ...(comments !== undefined ? { comments } : {}),
    }),
  })
}

export function moveCard({ cardId, column, position }: { cardId: string; column: string; position: number }) {
  return request<BoardData>(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column, position }),
  })
}
