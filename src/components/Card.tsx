import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'motion/react'
import type { MouseEvent } from 'react'
import { useDrag } from 'react-dnd'
import { useCardCollections } from '../collab/storage'
import type { CardData } from '../types/board'
import { CARD_DRAG_TYPE, type CardDragItem } from './cardDrag'
import { cardElementId, editElementId } from './cardIds'
import { Members } from './Members'

type CardProps = { card: CardData; selected: boolean; dragDisabled: boolean; onSelect: () => void; onEdit: () => void }

export function Card({ card, selected, dragDisabled, onSelect, onEdit }: CardProps) {
  const reducedMotion = useReducedMotion()
  const { assignees } = useCardCollections(card.id)
  const [{ isDragging }, drag] = useDrag<CardDragItem, void, { isDragging: boolean }>(() => ({
    type: CARD_DRAG_TYPE,
    item: { id: card.id },
    canDrag: !dragDisabled,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [card.id, dragDisabled])

  function select(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
    onSelect()
  }

  return (
    <motion.div layout={!reducedMotion} layoutId={reducedMotion ? undefined : `card-${card.id}`} transition={{ layout: { type: 'spring', stiffness: 280, damping: 32 } }}>
      <Box
        as="article" id={cardElementId(card.id)} tabIndex={-1} onClick={select}
        ref={(node: HTMLElement | null) => { drag(node) }} opacity={isDragging ? 0.4 : 1} cursor={dragDisabled ? undefined : 'grab'}
        className="board-card" aria-current={selected ? 'true' : undefined}
        bg={selected ? 'bg.info' : 'bg'} borderColor={selected ? 'border.info' : 'border'}
        borderWidth={selected ? '2px' : '1px'} borderRadius="md" p={4} overflowWrap="anywhere"
      >
        <Flex align="flex-start" justify="space-between" gap={2}>
          <Heading as="h3" size="sm">{card.title}</Heading>
          <IconButton id={editElementId(card.id)} type="button" aria-label={`Modifier ${card.title}`} size="xs" variant="ghost" mt="-1" me="-1" flexShrink={0} onClick={onEdit}>☰</IconButton>
        </Flex>
        <Members memberIds={assignees} />
        {card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
      </Box>
    </motion.div>
  )
}
