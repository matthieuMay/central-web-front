import { Box, Button, Heading, Text } from '@chakra-ui/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CardData } from '../types/board'

/**
 * Card — a single Card tile on a Board.
 *
 * Responsibility: present a Card's title and description and expose two
 * intents — select (for a keyboard Move) and open (its Card Detail). It owns
 * no data.
 * Props: { card: CardData; columnId: string; isSelected: boolean;
 *   onSelect: (cardId: string) => void; onOpen: (cardId: string) => void }.
 * Events: onSelect toggles Move selection (existing behaviour, kept on a
 *   `role="button"` select surface so `Board` can focus it after a Move);
 *   onOpen requests the Card Detail. The "Ouvrir" button stops propagation so
 *   it neither selects nor starts a drag.
 * Data owner: none — the Board owns all Card data and passes the slice down.
 * Correct when: clicking/Enter on the tile still selects for a Move exactly as
 *   before, and "Ouvrir" opens the Detail without disturbing that selection or
 *   the drag gesture.
 */
type CardProps = {
  card: CardData
  columnId: string
  isSelected: boolean
  onSelect: (cardId: string) => void
  onOpen: (cardId: string) => void
}

export function Card({ card, columnId, isSelected, onSelect, onOpen }: CardProps) {
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { columnId },
  })

  return (
    <Box
      ref={setNodeRef}
      as="article"
      display="flex"
      alignItems="flex-start"
      gap={1}
      bg="bg.panel"
      borderWidth="1px"
      borderColor={isSelected ? 'blue.500' : 'transparent'}
      borderRadius="md"
      p={4}
      overflowWrap="anywhere"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <Box
        data-card-id={card.id}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        flex="1"
        minW={0}
        cursor="grab"
        outline="none"
        _focusVisible={{ boxShadow: 'outline' }}
        {...listeners}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(card.id)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onSelect(card.id)
          }
        }}
      >
        <Heading as="h3" size="sm">{card.title}</Heading>
        {card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
      </Box>
      <Button
        size="xs"
        variant="ghost"
        flexShrink={0}
        aria-label={`Ouvrir la carte ${card.title}`}
        onClick={(event) => {
          event.stopPropagation()
          onOpen(card.id)
        }}
      >
        Ouvrir
      </Button>
    </Box>
  )
}
