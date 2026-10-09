import type { BoardData, CardData, ChecklistItem, CommentData, UserData } from '../types/board'
import fixture from '../../data/board.json'
import usersFixture from '../../data/users.json'

export const boardKey = ['board', 'mini-trello'] as const

const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'
type PartialBoard = {
  id: string
  title: string
  columns: { id: string; title: string; cards: (Omit<CardData, 'assignees' | 'comments' | 'checklistItems'> & Partial<Pick<CardData, 'assignees' | 'comments' | 'checklistItems'>> )[] }[]
}

let mockBoard: BoardData = normalizeBoard(structuredClone(fixture))
let mockUsers: UserData[] = structuredClone(usersFixture)

function normalizeBoard(board: PartialBoard): BoardData {
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) => ({
        ...card,
        assignees: card.assignees ?? [],
        comments: card.comments ?? [],
        checklistItems: card.checklistItems ?? [],
      })),
    })),
  }
}

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

export function getUsers() {
  if (useMockData) return Promise.resolve(structuredClone(mockUsers))
  return request<UserData[]>('/users')
}

export function createCard({ columnId, id, title }: { columnId: string; id: string; title: string }) {
  if (useMockData) {
    const column = mockBoard.columns.find((item) => item.id === columnId)
    if (!column) return Promise.reject(new Error('Column not found'))
    column.cards.push({ id, title, assignees: [], comments: [], checklistItems: [] })
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

export type CardCollectionsPatch = {
  assignees?: string[]
  comments?: (Omit<CommentData, 'createdAt'> & { createdAt?: string })[]
  checklistItems?: ChecklistItem[]
}

export function patchCardCollections({ cardId, ...collections }: { cardId: string } & CardCollectionsPatch) {
  if (useMockData) {
    const card = mockBoard.columns.flatMap((column) => column.cards).find((item) => item.id === cardId)
    if (!card) return Promise.reject(new Error('Card not found'))
    Object.assign(card, {
      ...collections,
      ...(collections.comments === undefined ? {} : {
        comments: collections.comments.map((comment) => ({
          ...comment,
          createdAt: comment.createdAt ?? new Date().toISOString(),
        })),
      }),
    })
    return Promise.resolve(structuredClone(card))
  }
  return request<CardData>(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(collections),
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
