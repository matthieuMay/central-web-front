import type { DragEvent } from 'react'

export const CARD_DRAG_TYPE = 'application/x-kanban-card'

export type CardDragPayload = {
  cardId: string
  columnId: string
}

export type DropPoint = {
  x: number
  y: number
}

export function setCardDragData(event: DragEvent, payload: CardDragPayload) {
  const serialized = JSON.stringify(payload)
  event.dataTransfer.setData(CARD_DRAG_TYPE, serialized)
  event.dataTransfer.setData('text/plain', serialized)
  event.dataTransfer.effectAllowed = 'move'
}

export function getCardDragData(event: DragEvent): CardDragPayload | null {
  const raw =
    event.dataTransfer.getData(CARD_DRAG_TYPE) || event.dataTransfer.getData('text/plain')
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<CardDragPayload>
    if (typeof parsed.cardId === 'string' && typeof parsed.columnId === 'string') {
      return { cardId: parsed.cardId, columnId: parsed.columnId }
    }
  } catch {
    return null
  }

  return null
}
