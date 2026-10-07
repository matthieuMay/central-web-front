import { Box, Heading, IconButton, Text } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'motion/react'
import type { MouseEvent } from 'react'
import type { CardData } from '../types/board'
import { cardElementId, editElementId } from './cardIds'

type CardProps = { card: CardData; selected: boolean; onSelect: () => void; onEdit: () => void }

export function Card({ card, selected, onSelect, onEdit }: CardProps) {
  const reducedMotion = useReducedMotion()

  function select(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
    onSelect()
  }

  return (
    <motion.div layout={!reducedMotion} layoutId={reducedMotion ? undefined : `card-${card.id}`} transition={{ layout: { type: 'spring', stiffness: 280, damping: 32 } }}>
      <Box
        as="article" id={cardElementId(card.id)} tabIndex={-1} onClick={select}
        className="board-card" aria-current={selected ? 'true' : undefined}
        bg={selected ? 'blue.50' : 'white'} borderColor={selected ? 'blue.600' : 'gray.300'}
        borderWidth={selected ? '2px' : '1px'} borderRadius="md" p={4} overflowWrap="anywhere"
      >
        <Heading as="h3" size="sm">{card.title}</Heading>
        {card.description && <Text color="gray.600" mt={2} fontSize="sm">{card.description}</Text>}
        <IconButton id={editElementId(card.id)} type="button" aria-label={`Edit ${card.title}`} size="xs" variant="outline" mt={2} onClick={onEdit}>✎</IconButton>
      </Box>
    </motion.div>
  )
}
