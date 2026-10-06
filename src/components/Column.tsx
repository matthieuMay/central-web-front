import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ColumnData } from '../types/board'
import { Card } from './Card'

type ColumnProps = { column: ColumnData }

export function Column({ column }: ColumnProps) {
  return (
    <Box as="section" aria-label={column.title} bg="gray.100" borderRadius="lg" p={4} minW={0}>
      <Heading as="h2" size="md" mb={4}>{column.title}</Heading>
      <Stack gap={3}>
        {column.cards.length === 0 && <Text color="gray.600">No cards yet</Text>}
        {column.cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </Stack>
    </Box>
  )
}
