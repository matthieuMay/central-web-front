import { Box, Heading, IconButton, Text } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'motion/react'
import { useDrag, useDrop } from 'react-dnd'
import { useEffect, useRef, type MouseEvent } from 'react'
import type { CardData } from '../types/board'
import { cardElementId, editElementId } from './cardIds'

export const cardDragType = 'board-card'
export type CardDragItem = { cardId: string; columnId: string }
type CardProps = {
  card: CardData
  columnId: string
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  onDragOver: (position: number | null) => void
  onDrop: (item: CardDragItem, position: number) => void
}

// Responsibility: render one card, its title/description, and drag affordances.
// Props: card data, column id, selection state, and callbacks for selection,
// editing, drag-over placement, and drop; the page owns board data and moves.
// Actions: card click selects it, edit delegates to the drawer, and drag/drop
// delegates the requested position to the board owner.
// Correctness: selection focuses the card, controls do not select it, dragging
// shows the dragged state, and dropping reports the correct insertion position.
export function Card({ card, columnId, selected, onSelect, onEdit, onDragOver, onDrop }: CardProps) {
  const reducedMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const [{ isDragging }, drag] = useDrag(() => ({
    type: cardDragType,
    item: { cardId: card.id, columnId },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [card.id, columnId])
  const [, drop] = useDrop<CardDragItem>(() => ({
    accept: cardDragType,
    hover: (item, monitor) => {
      if (!cardRef.current || item.cardId === card.id) return
      const point = monitor.getClientOffset()
      if (!point) return
      const bounds = cardRef.current.getBoundingClientRect()
      onDragOver(point.y < bounds.top + bounds.height / 2 ? 0 : 1)
    },
    drop: (item, monitor) => {
      if (item.cardId === card.id || !monitor.isOver({ shallow: true })) return
      const point = monitor.getClientOffset()
      if (!point || !cardRef.current) return
      const bounds = cardRef.current.getBoundingClientRect()
      onDrop(item, point.y < bounds.top + bounds.height / 2 ? 0 : 1)
      return { dropped: true }
    },
    collect: (monitor) => {
      if (!monitor.isOver()) onDragOver(null)
      return {}
    },
  }), [card.id, onDragOver, onDrop])
  useEffect(() => {
    drag(drop(cardRef))
  }, [drag, drop])

  function select(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
    onSelect()
  }

  return (
    <motion.div layout={!reducedMotion} layoutId={reducedMotion ? undefined : `card-${card.id}`} transition={{ layout: { type: 'spring', stiffness: 280, damping: 32 } }}>
      <Box
        as="article" id={cardElementId(card.id)} tabIndex={-1} onClick={select}
        ref={cardRef} opacity={isDragging ? 0.35 : 1}
        className="board-card" aria-current={selected ? 'true' : undefined}
        bg={selected ? 'bg.info' : 'bg'} borderColor={selected ? 'border.info' : 'border'}
        borderWidth={selected ? '2px' : '1px'} borderRadius="md" p={4} overflowWrap="anywhere"
      >
        <Heading as="h3" size="sm">{card.title}</Heading>
        {card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
        <IconButton id={editElementId(card.id)} type="button" aria-label={`Edit ${card.title}`} size="xs" variant="outline" mt={2} onClick={onEdit}>✎</IconButton>
      </Box>
    </motion.div>
  )
}
