export const cardElementId = (id: string) => `board-card-${id}`
export const editElementId = (id: string) => `edit-card-${id}`

// react-dnd item type and payload for a dragged card.
export const CARD = 'card'
export type DraggedCard = { id: string }
