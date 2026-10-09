import { Box, Heading, Text } from '@chakra-ui/react'
import type { ColumnData } from '../types'
import { Card } from './Card'

export const Column = ({ column }: { column: ColumnData }) => (
  <Box>
    <Heading>{column.title}</Heading>
    {column.cards.length === 0 && <Text>Aucune carte</Text>}
    {column.cards.map((card) => <Card key={card.id} card={card} />)}
  </Box>
)