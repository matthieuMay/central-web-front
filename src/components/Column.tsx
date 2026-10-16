import { Heading, Stack, Text } from '@chakra-ui/react'
import { Card, type BoardCard } from './Card'

export interface BoardColumn {
  id: string
  title: string
  cards: BoardCard[]
}

interface ColumnProps {
  column: BoardColumn
}

export function Column({ column }: ColumnProps) {
  return (
    <Stack
      as="section"
      aria-labelledby={`${column.id}-heading`}
      minW={0}
      gap={3}
      p={4}
      bg="gray.100"
      borderRadius="lg"
    >
      <Heading
        id={`${column.id}-heading`}
        as="h2"
        size="md"
        overflowWrap="anywhere"
      >
        {column.title}
      </Heading>
      <Stack gap={3}>
        {column.cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
        {column.cards.length === 0 && (
          <Text color="gray.600" fontSize="sm">
            No cards yet.
          </Text>
        )}
      </Stack>
    </Stack>
  )
}