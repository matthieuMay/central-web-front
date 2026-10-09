import { Box, Heading, IconButton, Text } from '@chakra-ui/react'
import { useDrag, useDrop } from 'react-dnd'
import { motion, useReducedMotion } from 'motion/react'
import { useRef, useState, type MouseEvent } from 'react'
import type { CardData } from '../types/board'
import { cardElementId, editElementId } from './cardIds'

type CardProps = {
  card: CardData
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  position: number
  onHoverPosition: (position: number | null) => void
  onDropPosition: (cardId: string, position: number) => void
}

export function Card({ card, selected, onSelect, onEdit, position, onHoverPosition, onDropPosition }: CardProps) {
  const reducedMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const insertionPosition = useRef<number | null>(null)
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  const [dragEnabled, setDragEnabled] = useState(false)
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'card',
    item: { cardId: card.id },
    canDrag: dragEnabled,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [card.id, dragEnabled])
  const [, drop] = useDrop(() => ({
    accept: 'card',
    hover: (item: { cardId: string }, monitor) => {
      if (item.cardId === card.id) return
      const point = monitor.getClientOffset()
      const bounds = cardRef.current?.getBoundingClientRect()
      if (!point || !bounds) return
      const nextPosition = point.y < bounds.top + bounds.height / 2 ? position : position + 1
      insertionPosition.current = nextPosition
      onHoverPosition(nextPosition)
    },
    drop: (item: { cardId: string }) => {
      if (insertionPosition.current !== null) onDropPosition(item.cardId, insertionPosition.current)
    },
  }), [card.id, position, onDropPosition, onHoverPosition])

  function select(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
    onSelect()
  }

  return (
    <motion.div layout={!reducedMotion} layoutId={reducedMotion ? undefined : `card-${card.id}`} transition={{ layout: { type: 'spring', stiffness: 280, damping: 32 } }}>
      <Box
        ref={(node: HTMLDivElement | null) => {
          cardRef.current = node
          drag(node)
          drop(node)
        }}
        opacity={isDragging ? 0.45 : 1}
        as="article" id={cardElementId(card.id)} tabIndex={-1} onClick={select}
        onPointerDown={(event) => {
          if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
          pointerStart.current = { x: event.clientX, y: event.clientY }
          setDragEnabled(false)
        }}
        onPointerMove={(event) => {
          const start = pointerStart.current
          if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) >= 6) setDragEnabled(true)
        }}
        onPointerUp={() => { pointerStart.current = null; setDragEnabled(false) }}
        onPointerCancel={() => { pointerStart.current = null; setDragEnabled(false) }}
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
