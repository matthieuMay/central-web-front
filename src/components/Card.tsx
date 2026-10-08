import {Box, Text} from '@chakra-ui/react'
import type {CardData} from '../types/board'

type CardProps = {
    card : CardData
}

export function Card({card} : CardProps) {
    return (
    <Box as="article" bg="white" borderWidth="1px" borderRadius="md" p={3} shadow="xs">
      <Text fontWeight="semibold">{card.title}</Text>
      {card.description && (
        <Text mt={1} fontSize="sm" color="gray.600">
          {card.description}
        </Text>
      )}
      </Box>
    )
}

