
import type { DragEvent } from 'react'
import { Box, Button, Heading, HStack, Text } from '@chakra-ui/react'
import type { CardData } from '../types/board'

type CardProps = {
  card: CardData
  selected: boolean
  onSelect: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
  canMoveLeft: boolean
  canMoveRight: boolean
}

export function Card({
  card,
  selected,
  onSelect,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
}: CardProps) {
  function handleDragStart(event: DragEvent<HTMLDivElement>) {
    event.dataTransfer.setData('text/plain', card.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <Box
      data-card-id={card.id}
      draggable
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      aria-label={card.title}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
      onDragStart={handleDragStart}
      bg={selected ? 'blue.50' : 'white'}
      borderWidth="2px"
      borderColor={selected ? 'blue.500' : 'gray.200'}
      borderRadius="md"
      p={3}
      shadow={selected ? 'md' : 'sm'}
      cursor="grab"
      _hover={{ shadow: 'md' }}
      _active={{ cursor: 'grabbing' }}
    >
      <Heading size="sm">{card.title}</Heading>

      {card.description && (
        <Text mt={2} color="gray.600" fontSize="sm">
          {card.description}
        </Text>
      )}

      {selected && (
        <HStack mt={3} gap={2}>
          <Button
            size="xs"
            disabled={!canMoveLeft}
            onClick={(event) => {
              event.stopPropagation()
              onMoveLeft()
            }}
          >
            Move left
          </Button>

          <Button
            size="xs"
            disabled={!canMoveRight}
            onClick={(event) => {
              event.stopPropagation()
              onMoveRight()
            }}
          >
            Move right
          </Button>
        </HStack>
      )}
    </Box>
  )
}
