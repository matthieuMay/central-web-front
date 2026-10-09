import { Box, Heading, Text } from '@chakra-ui/react'
import type { DragEvent, KeyboardEvent } from 'react'
import type { CardData } from '../types/board'

type CardProps = {
  card: CardData
  isSelected: boolean
  isDragging: boolean
  canMove: boolean
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  onDragStart: (event: DragEvent<HTMLElement>) => void
  onDragEnd: () => void
  onDragOver: (event: DragEvent<HTMLElement>) => void
  onDrop: (event: DragEvent<HTMLElement>) => void
}

export function Card({
  card,
  isSelected,
  isDragging,
  canMove,
  onKeyDown,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: CardProps) {
  return (
    <Box
      as="article"
      data-card-id={card.id}
      aria-label={`Card: ${card.title}`}
      tabIndex={0}
      draggable={canMove}
      bg="var(--app-surface)"
      color="var(--app-text)"
      borderColor="var(--app-border)"
      borderWidth="1px"
      borderRadius="md"
      p={4}
      overflowWrap="anywhere"
      opacity={isDragging ? 0.45 : 1}
      outline={isSelected ? '2px solid var(--app-focus)' : undefined}
      outlineOffset="2px"
      _focusVisible={{ outline: '2px solid var(--app-focus)', outlineOffset: '2px' }}
      onKeyDown={onKeyDown}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Heading as="h3" size="sm">{card.title}</Heading>
      {card.description && <Text color="var(--app-muted-text)" mt={2} fontSize="sm">{card.description}</Text>}
    </Box>
  )
}
