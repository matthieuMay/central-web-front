import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ColumnData } from '../types/board'
import { Card } from './Card'
import type { CardDirection } from '../board-movement'

type ColumnProps = {
  column: ColumnData
  selectedCardId: string | null
  onSelectCard: (cardId: string) => void
  onDeselectCard: () => void
  onMoveCard: (cardId: string, direction: CardDirection) => Promise<void>
}

export function Column({ column, selectedCardId, onSelectCard, onDeselectCard, onMoveCard }: ColumnProps) {
  return (
    <Box as="section" aria-label={column.title} bg="bg.muted" borderWidth="1px" borderColor="fg.muted" borderRadius="lg" p={4} minW={0} minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}>
      <Heading as="h2" size="md" mb={4}>{column.title}</Heading>
      <Stack gap={3}>
        {column.cards.length === 0 && <Text color="fg.muted">No cards yet</Text>}
        {column.cards.map((card) => (
          <Card key={card.id} card={card} selected={selectedCardId === card.id}
            onSelect={() => onSelectCard(card.id)} onDeselect={onDeselectCard}
            onMove={direction => onMoveCard(card.id, direction)} />
        ))}
      </Stack>
    </Box>
  )
}
