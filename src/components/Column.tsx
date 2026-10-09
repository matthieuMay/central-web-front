import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { ColumnData } from '../types/board'
import { Card } from './Card'

type ColumnProps = {
  column: ColumnData
  selectedId: string | null
  onSelect: (cardId: string) => void
}

export function Column({ column, selectedId, onSelect }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <Box
      ref={setNodeRef}
      as="section"
      aria-label={column.title}
      bg="bg.muted"
      borderRadius="lg"
      p={4}
      minW={0}
      minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}
      outline={isOver ? '2px dashed' : undefined}
      outlineColor={isOver ? 'blue.400' : undefined}
      outlineOffset={2}
    >
      <Heading as="h2" size="md" mb={4}>{column.title}</Heading>
      <SortableContext items={column.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <Stack gap={3}>
          {column.cards.length === 0 && <Text color="fg.muted">No cards yet</Text>}
          {column.cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              columnId={column.id}
              isSelected={selectedId === card.id}
              onSelect={onSelect}
            />
          ))}
        </Stack>
      </SortableContext>
    </Box>
  )
}
