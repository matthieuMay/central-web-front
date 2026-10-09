import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ColumnData } from '../types/board'
import { Card } from './Card'
import { AddCardForm } from './AddCardForm'


type ColumnProps = {
    column : ColumnData
}

export function Column ({ column} : ColumnProps) {
    return (
    <Box as="section" bg="gray.100" borderRadius="lg" p={4}>
      <Heading as="h2" size="md" mb={3}>
        {column.title}
      </Heading>
      {column.cards.length === 0 ? (
        <Text color="gray.500" fontSize="sm">No cards yet</Text>
      ) : (
        <Stack gap={3}>
          {column.cards.map(card => (
            <Card key={card.id} card={card} />
          ))}
        </Stack>
      )}
        <AddCardForm columnId={column.id} columnTitle={column.title} />

    </Box>
  )
}

