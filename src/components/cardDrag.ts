export const CARD_DRAG_TYPE = 'card'

export type CardDragItem = { id: string }

// Viewport coordinates where a dropped card arrives: its column's centre, at the drop line.
export type DropPoint = { x: number; y: number }
