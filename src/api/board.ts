import type {
  BoardData,
  CardData,
  CardCollectionsPatch,
  ColumnData,
  UserData,
} from '../types/board'
import type { CardMovement } from '../board-movement'
// Reused from Sprint 2: the query identity and configurable API origin.
export const boardKey = ['board', 'mini-trello'] as const
export const boardWriteKey = ['board', 'write'] as const
export const usersKey = ['users'] as const
const apiUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')
export class WriteRefused extends Error {
}
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function isCard(value: unknown): value is CardData {
  return isObject(value) && typeof value.id === 'string' && value.id.length > 0 &&
    typeof value.title === 'string' &&
    (value.description === undefined || typeof value.description === 'string') &&
    Array.isArray(value.assignees) && value.assignees.every(id => typeof id === 'string') &&
    Array.isArray(value.comments) && value.comments.every(comment => isObject(comment) &&
    typeof comment.user === 'string' && typeof comment.comment === 'string' &&
    typeof comment.createdAt === 'string' && Number.isFinite(Date.parse(comment.createdAt))) &&
    Array.isArray(value.checklistItems) && value.checklistItems.every(item => isObject(item) &&
    typeof item.description === 'string' && typeof item.done === 'boolean')
}
function isColumn(value: unknown): value is ColumnData {
  return isObject(value) && typeof value.id === 'string' && value.id.length > 0 &&
    typeof value.title === 'string' && Array.isArray(value.cards) && value.cards.every(isCard)
}
function isBoard(value: unknown): value is BoardData {
  if (!isObject(value) || value.id !== 'mini-trello' || typeof value.title !== 'string' ||
    !Array.isArray(value.columns) || !value.columns.every(isColumn))
    return false
  const columns = value.columns.map(column => column.id)
  const cards = value.columns.flatMap(column => column.cards.map(card => card.id))
  return new Set(columns).size === columns.length && new Set(cards).size === cards.length
}
async function requestJson(path: string, init: RequestInit): Promise<unknown> {
  const response = await fetch(`${apiUrl}${path}`, init)
  const body: unknown = await response.json()
  if (!response.ok) {
    // Only documented refusals with a readable error prove no write occurred.
    if (['PUT', 'PATCH'].includes(init.method ?? '') && [400, 404].includes(response.status) &&
      isObject(body) && typeof body.error === 'string') {
      throw new WriteRefused(`Modification refusée (${response.status}) : ${body.error}`)
    }
    throw new Error(`L'API a retourné une erreur (${response.status}).`)
  }
  return body
}
async function requestBoard(path: string, init: RequestInit): Promise<BoardData> {
  const body = await requestJson(path, init)
  if (!isBoard(body))
    throw new Error('La réponse du tableau est incohérente.')
  return body
}
export async function getUsers(signal?: AbortSignal): Promise<UserData[]> {
  const body = await requestJson('/users', { signal })
  if (!Array.isArray(body) || !body.every(isUser) ||
    new Set(body.map(user => user.id)).size !== body.length)
    throw new Error('La réponse des utilisateurs est incohérente.')
  return body
}

function isUser(value: unknown): value is UserData {
  return isObject(value) &&
    typeof value.id === 'string' && value.id.length > 0 &&
    typeof value.firstname === 'string' && typeof value.lastname === 'string'
}

function confirmsCardCollections(card: CardData, patch: CardCollectionsPatch): boolean {
  const assigneesMatch = !patch.assignees ||
    JSON.stringify(card.assignees) === JSON.stringify(patch.assignees)
  const checklistMatches = !patch.checklistItems ||
    JSON.stringify(card.checklistItems) === JSON.stringify(patch.checklistItems)
  const commentsMatch = !patch.comments || (
    card.comments.length === patch.comments.length &&
    patch.comments.every((comment, index) => {
      const confirmed = card.comments[index]
      return confirmed.user === comment.user && confirmed.comment === comment.comment &&
        (comment.createdAt === undefined || confirmed.createdAt === comment.createdAt)
    })
  )
  return assigneesMatch && checklistMatches && commentsMatch
}
export async function patchCardApi(cardId: string, patch: CardCollectionsPatch): Promise<CardData> {
  const body = await requestJson(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
  })
  if (!isCard(body) || body.id !== cardId)
    throw new Error('La réponse de la carte est incohérente.')
  if (!confirmsCardCollections(body, patch)) {
    throw new Error('La réponse ne confirme pas les collections demandées.')
  }
  return body
}
export function getBoard(signal?: AbortSignal) {
  return requestBoard('/boards/mini-trello', { signal })
}
export async function moveCardApi({ cardId, columnId, position }: CardMovement) {
  const board = await requestBoard(`/cards/${encodeURIComponent(cardId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ column: columnId, ...(position === undefined ? {} : { position }) }),
  })
  if (!board.columns.some(column => column.id === columnId &&
    (position === undefined ? column.cards.some(card => card.id === cardId) : column.cards[position]?.id === cardId))) {
    throw new Error('La réponse ne confirme pas le déplacement demandé.')
  }
  return board
}
