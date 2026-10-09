import { Box, Heading, Text } from '@chakra-ui/react'
import type { DragEventHandler, FocusEventHandler, KeyboardEventHandler } from 'react'
import type { CardData } from '../types/board'

type CardProps = {
  card: CardData
  onFocus: FocusEventHandler<HTMLElement>
  onKeyDown: KeyboardEventHandler<HTMLElement>
  onDragStart: DragEventHandler<HTMLElement>
  onDragEnd: DragEventHandler<HTMLElement>
  onDragOver: DragEventHandler<HTMLElement>
  onDrop: DragEventHandler<HTMLElement>
  dropBefore: boolean
}

export function Card({
  card,
  onFocus,
  onKeyDown,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  dropBefore,
}: CardProps) {
  return (
    <Box
      as="article"
      className={`board-card${dropBefore ? ' board-card--drop-before' : ''}`}
      tabIndex={0}
      draggable
      aria-label={`${card.title}. Use the arrow keys to move this card.`}
      bg="var(--surface-card)"
      borderWidth="1px"
      borderColor="var(--border-color)"
      borderRadius="md"
      p={4}
      overflowWrap="anywhere"
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Heading as="h3" size="sm">{card.title}</Heading>
      {card.description && <Text color="var(--text-muted)" mt={2} fontSize="sm">{card.description}</Text>}
    </Box>
  )
}
