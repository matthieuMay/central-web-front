import { Box, Stack, Text } from '@chakra-ui/react'
import type { CardData } from '../Types'

type CardDataProps = {
  card: CardData
}

function Card({ card }: CardDataProps) {
  return (
    <Box borderWidth="1px" borderRadius="md" p={3}>
      <Stack gap={1}>
        <Text fontWeight="bold">{card.title}</Text>
        {card.description && <Text>{card.description}</Text>}
      </Stack>
    </Box>
  )
}

export default Card