import { Box, Heading, Text } from '@chakra-ui/react'
import type { CardData } from '../types/board'

type CardProps = { card: CardData }

export function Card({ card }: CardProps) {
  return (
    <Box as="article" bg="var(--app-surface)" borderWidth="1px" borderColor="var(--app-border)" borderRadius="md" p={4} overflowWrap="anywhere">
      <Heading as="h3" size="sm">{card.title}</Heading>
      {card.description && <Text color="var(--app-muted)" mt={2} fontSize="sm">{card.description}</Text>}
    </Box>
  )
}
