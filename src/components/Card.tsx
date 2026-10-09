import { Box, Heading, IconButton, Text } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'motion/react'
import { useDrop, useDrag } from 'react-dnd'
import { useCallback, useRef, type MouseEvent } from 'react'
import type { CardData } from '../types/board'
import { cardElementId, editElementId } from './cardIds'
import Confetti from './Confetti'

export type DragCard = { cardId: string; sourceColumnId: string }
type CardProps = {
  card: CardData
  columnId: string
  cardIndex: number
  selected: boolean
  confetti: boolean
  onSelect: () => void
  onEdit: () => void
  onDropCard: (item: DragCard, columnId: string, position: number) => void
}

export function Card({ card, columnId, cardIndex, selected, confetti, onSelect, onEdit, onDropCard }: CardProps) {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'card',
    item: () => {
      onSelect()
      return { cardId: card.id, sourceColumnId: columnId }
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [card.id, columnId, onSelect])
  const [, drop] = useDrop<DragCard>(() => ({
    accept: 'card',
    drop: (item, monitor) => {
      if (monitor.didDrop() || item.cardId === card.id || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const offset = monitor.getClientOffset()
      if (!offset) return
      const insertAfter = offset.y >= rect.top + rect.height / 2
      const rawPosition = cardIndex + (insertAfter ? 1 : 0)
      const position = item.sourceColumnId === columnId && rawPosition > cardIndex
        ? rawPosition - 1
        : rawPosition
      onDropCard(item, columnId, position)
    },
  }), [card.id, columnId, cardIndex, onDropCard])
  const attachRef = useCallback((node: HTMLElement | null) => {
    ref.current = node
    drag(drop(node))
  }, [drag, drop])

  function select(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
    onSelect()
  }

  return (
    <motion.div layout={!reducedMotion} layoutId={reducedMotion ? undefined : `card-${card.id}`} transition={{ layout: { type: 'spring', stiffness: 280, damping: 32 } }}>
      <Box
        ref={attachRef} as="article" id={cardElementId(card.id)} tabIndex={0} onClick={select} onFocus={onSelect}
        className="board-card" aria-current={selected ? 'true' : undefined} aria-selected={selected}
        opacity={isDragging ? 0.45 : 1} position="relative"
        bg={selected ? 'bg.info' : 'bg'} borderColor={selected ? 'border.info' : 'border'}
        borderWidth={selected ? '2px' : '1px'} borderRadius="md" p={4} overflowWrap="anywhere"
      >
        <Heading as="h3" size="sm">{card.title}</Heading>
        {card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
        <IconButton id={editElementId(card.id)} type="button" aria-label={`Edit ${card.title}`} size="xs" variant="outline" mt={2} onClick={onEdit}>✎</IconButton>
        <Confetti particleCount={confetti ? 1 : 0} />
      </Box>
    </motion.div>
  )
}
