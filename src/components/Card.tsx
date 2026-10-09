import { Box, Heading, Text } from '@chakra-ui/react'
import type { CardData } from '../types'

export const Card = ({ card }: { card: CardData }) => (
  <Box>
    <Heading>{card.title}</Heading>
    {card.description && <Text>{card.description}</Text>}
  </Box>
)