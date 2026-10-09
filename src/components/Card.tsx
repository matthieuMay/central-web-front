import { Box, Heading, IconButton, Text } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, type MouseEvent } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import type { CardData } from '../types/board'
import { cardElementId, editElementId } from './cardIds'
import Confetti from './Confetti'

type CardProps = {
  card: CardData
  columnId: string
  position: number
  selected: boolean
  disabled: boolean
  celebrationToken: number | null
  onSelect: () => void
  onEdit: () => void
}

export function Card({ card, columnId, position, selected, disabled, celebrationToken, onSelect, onEdit }: CardProps) {
  const reducedMotion = useReducedMotion()
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: 'CARD',
    item: { cardId: card.id, title: card.title, sourceColumnId: columnId, sourcePosition: position },
    canDrag: !disabled,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [card.id, columnId, position, disabled])

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [preview])

  function select(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
    onSelect()
  }

  return (
    <motion.div
      layout={!reducedMotion}
      layoutId={reducedMotion ? undefined : `card-${card.id}`}
      transition={{ layout: { type: 'spring', stiffness: 280, damping: 32 } }}
    >
      <Box
        ref={drag}
        as="article" id={cardElementId(card.id)} tabIndex={-1} onClick={select}
        className="board-card" aria-current={selected ? 'true' : undefined} aria-busy={isDragging || undefined}
        aria-label={`${card.title}${selected ? ', selected' : ''}`}
        bg={selected ? 'bg.info' : 'bg'} borderColor={selected ? 'border.info' : 'border'}
        borderWidth={selected ? '2px' : '1px'} borderRadius="md" p={4} overflowWrap="anywhere"
        cursor={disabled ? 'default' : 'grab'} position="relative" overflow="visible"
      >
        {celebrationToken !== null && <Confetti key={`${card.id}-${celebrationToken}`} particleCount={1} />}
        <Heading as="h3" size="sm">{card.title}</Heading>
        {card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
        <IconButton id={editElementId(card.id)} type="button" aria-label={`Edit ${card.title}`} size="xs" variant="outline" mt={2} onClick={onEdit}>✎</IconButton>
      </Box>
    </motion.div>
  )
}
