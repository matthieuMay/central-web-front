import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ColumnData } from '../Types'
import Card from './CardData'

type ColumnDataProps = {
  column: ColumnData
}

function Column({ column }: ColumnDataProps) {
  return (
    <Box borderWidth="1px" borderRadius="md" p={4}>
      <Stack gap={4}>
        <Heading as="h2" size="md">
          {column.title}
        </Heading>
        <Stack gap={3}>
        {column.cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
        {!column.cards.length && <Text color="gray.500">Aucune carte</Text>}
        </Stack>
      </Stack>
    </Box>
  )
}

export default Column