import { Box, Heading, IconButton, Text } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'motion/react'
import { useRef, type DragEvent, type MouseEvent, type PointerEvent } from 'react'
import type { CardData } from '../types/board'
import { cardElementId, editElementId } from './cardIds'
import { CardBadges } from './CardBadges'

type CardProps = {
  card: CardData
  selected: boolean
  onSelect: () => void
  onEdit: () => void
  canDrag: boolean
  dragging: boolean
  onDragStart: (height: number) => void
  onDragEnd: () => void
}

export function Card({ card, selected, onSelect, onEdit, canDrag, dragging, onDragStart, onDragEnd }: CardProps) {
  const reducedMotion = useReducedMotion()
  // The ✎ button sits inside the draggable card: remember where the press started
  // so that a drag starting on the button is cancelled.
  const pressedOnButton = useRef(false)

  function select(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
    onSelect()
  }

  function rememberPress(event: PointerEvent<HTMLElement>) {
    pressedOnButton.current = Boolean((event.target as Element).closest('button'))
  }

  function startDrag(event: DragEvent<HTMLElement>) {
    if (pressedOnButton.current) { event.preventDefault(); return }
    event.dataTransfer.effectAllowed = 'move'
    // Firefox only starts a drag when some data is set.
    event.dataTransfer.setData('text/plain', card.id)
    onDragStart(event.currentTarget.getBoundingClientRect().height)
  }

  return (
    <motion.div layout={!reducedMotion} layoutId={reducedMotion ? undefined : `card-${card.id}`} transition={{ layout: { type: 'spring', stiffness: 280, damping: 32 } }}>
      <Box
        as="article" id={cardElementId(card.id)} tabIndex={-1} onClick={select}
        draggable={canDrag} onDragStart={startDrag} onDragEnd={onDragEnd}
        onPointerDown={rememberPress}
        className="board-card" aria-current={selected ? 'true' : undefined}
        bg={selected ? 'blue.subtle' : 'bg.panel'} borderColor={selected ? 'blue.fg' : 'border.emphasized'}
        borderWidth={selected ? '2px' : '1px'} borderRadius="md" p={4} overflowWrap="anywhere"
        opacity={dragging ? 0.5 : 1} cursor={canDrag ? 'grab' : undefined}
      >
        <Heading as="h3" size="sm">{card.title}</Heading>
        {card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
                <CardBadges
          assigneeCount={card.assignees?.length ?? 0}
          checklistDone={card.checklistItems?.filter((item) => item.done).length ?? 0}
          checklistTotal={card.checklistItems?.length ?? 0}
          commentCount={card.comments?.length ?? 0}
        />
        <IconButton id={editElementId(card.id)} type="button" aria-label={`Edit ${card.title}`} size="xs" variant="outline" mt={2} onClick={onEdit}>✎</IconButton>
      </Box>
    </motion.div>
  )
}
