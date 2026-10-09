import { Box, Heading, IconButton, Text } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'motion/react'
import { Pencil } from 'lucide-react'
import type { MouseEvent } from 'react'
import { useDrag } from 'react-dnd'
import type { CardData } from '../types/board'
import { CardBadges } from './CardBadges'
import { CARD, cardElementId, editElementId, type DraggedCard } from './cardIds'
import { withoutEmoji } from './withoutEmoji'

type CardProps = { card: CardData; selected: boolean; onSelect: () => void; onEdit: () => void }

export function Card({ card, selected, onSelect, onEdit }: CardProps) {
  const reducedMotion = useReducedMotion()
  const title = withoutEmoji(card.title)
  const description = card.description && withoutEmoji(card.description)
  const [{ isDragging }, drag] = useDrag<DraggedCard, void, { isDragging: boolean }>({
    type: CARD,
    item: { id: card.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }, [card.id])

  function select(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
    onSelect()
  }

  return (
    <motion.div layout={!reducedMotion} layoutId={reducedMotion ? undefined : `card-${card.id}`} transition={{ layout: { type: 'spring', stiffness: 280, damping: 32 } }}>
      <Box
        // Braces keep the callback returning nothing: React 19 treats a returned value as a ref cleanup.
        ref={(node: HTMLElement | null) => { drag(node) }}
        as="article" id={cardElementId(card.id)} tabIndex={-1} onClick={select}
        className="board-card" aria-current={selected ? 'true' : undefined} data-dragging={isDragging || undefined}
      >
        <Heading as="h3" size="sm">{title}</Heading>
        {description && <Text color="fg.muted" mt={2} fontSize="sm">{description}</Text>}
        <CardBadges card={card} />
        <IconButton id={editElementId(card.id)} className="card-edit" type="button" aria-label={`Edit ${title}`} size="xs" variant="ghost" onClick={onEdit}><Pencil /></IconButton>
      </Box>
    </motion.div>
  )
}
