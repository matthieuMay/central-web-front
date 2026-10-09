import type { BoardData } from '../types/board'
import fixture from '../../data/board.json'

export const boardKey = ['board', 'mini-trello'] as const

const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'
let mockBoard: BoardData = structuredClone(fixture)

function mockResponse() {
  return structuredClone(mockBoard)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, init)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status} ${response.statusText})`)
  }
  return response.json() as Promise<T>
}

export function getBoard() {
  if (useMockData) return Promise.resolve(mockResponse())
  return request<BoardData>('/boards/mini-trello')
}

export function createCard({ columnId, id, title }: { columnId: string; id: string; title: string }) {
  if (useMockData) {
    const column = mockBoard.columns.find((item) => item.id === columnId)
    if (!column) return Promise.reject(new Error('Column not found'))
    column.cards.push({ id, title })
    return Promise.resolve(mockResponse())
  }
  return request(`/columns/${encodeURIComponent(columnId)}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title }),
  })
}

export function editCard({ cardId, title, description }: { cardId: string; title: string; description?: string | null }) {
  if (useMockData) {
    const card = mockBoard.columns.flatMap((column) => column.cards).find((item) => item.id === cardId)
    if (!card) return Promise.reject(new Error('Card not found'))
    card.title = title
    if (description !== undefined) card.description = description ?? undefined
    return Promise.resolve(mockResponse())
  }
  return request(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, ...(description !== undefined ? { description } : {}) }),
  })
}

export function moveCard({ cardId, column, position }: { cardId: string; column: string; position?: number }) {
  if (useMockData) {
    const source = mockBoard.columns.find((item) => item.cards.some((card) => card.id === cardId))
    const destination = mockBoard.columns.find((item) => item.id === column)
    if (!source) return Promise.reject(new Error('Card not found'))
    if (!destination) return Promise.reject(new Error('Column not found'))
    const sourceIndex = source.cards.findIndex((card) => card.id === cardId)
    const [card] = source.cards.splice(sourceIndex, 1)
    const targetPosition = Math.max(0, Math.min(position ?? destination.cards.length, destination.cards.length))
    destination.cards.splice(targetPosition, 0, card)
    return Promise.resolve(mockResponse())
  }
  return request<BoardData>(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column, ...(position === undefined ? {} : { position }) }),
  })
}
