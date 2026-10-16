import { Box, Stack, Text } from '@chakra-ui/react'

export interface BoardCard {
  id: string
  title: string
  description?: string
}

interface CardProps {
  card: BoardCard
}

export function Card({ card }: CardProps) {
  return (
    <Box
      minW={0}
      p={4}
      bg="white"
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="md"
      shadow="sm"
    >
      <Stack gap={2}>
        <Text fontWeight="semibold" overflowWrap="anywhere">
          {card.title}
        </Text>
        {card.description && (
          <Text color="gray.600" fontSize="sm" overflowWrap="anywhere">
            {card.description}
          </Text>
        )}
      </Stack>
    </Box>
  )
}