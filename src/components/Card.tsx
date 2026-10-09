import { Box, Heading, Text } from '@chakra-ui/react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CardData } from '../types/board'

type CardProps = {
  card: CardData
  columnId: string
  isSelected: boolean
  onSelect: (cardId: string) => void
}

export function Card({ card, columnId, isSelected, onSelect }: CardProps) {
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { columnId },
  })

  return (
    <Box
      ref={setNodeRef}
      as="article"
      role="button"
      tabIndex={0}
      data-card-id={card.id}
      aria-pressed={isSelected}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
      }}
      bg="bg.panel"
      borderWidth="1px"
      borderColor={isSelected ? 'blue.500' : 'transparent'}
      borderRadius="md"
      p={4}
      overflowWrap="anywhere"
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
  )
}
