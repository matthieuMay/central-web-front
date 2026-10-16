import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ColumnData } from '../types/board'
import { Card } from './Card'

type MoveDirection = 'up' | 'down' | 'left' | 'right'
type DropMarker = { columnId: string; cardId: string | null; after: boolean } | null

type ColumnProps = {
  column: ColumnData
  columnIndex: number
  columnCount: number
  selectedCardId: string | null
  draggingCardId: string | null
  dropMarker: DropMarker
  movePending: boolean
  isDropTarget: boolean
  onSelectCard: (cardId: string | null) => void
  onMoveCard: (cardId: string, direction: MoveDirection) => void
  onDragStart: (cardId: string) => void
  onDragEnd: () => void
  onDragOverCard: (columnId: string, cardId: string, after: boolean) => boolean
  onDropOnCard: (columnId: string, cardId: string, after: boolean) => void
  onDragOverColumn: (columnId: string) => boolean
  onDropInColumn: (columnId: string) => void
}

export function Column({
  column, columnIndex, columnCount, selectedCardId, draggingCardId, dropMarker,
  movePending, isDropTarget, onSelectCard, onMoveCard, onDragStart, onDragEnd,
  onDragOverCard, onDropOnCard, onDragOverColumn, onDropInColumn,
}: ColumnProps) {
  return (
    <Box
      as="section"
      aria-label={column.title}
      bg="var(--app-column)"
      borderWidth="1px"
      borderColor="var(--app-border)"
      borderRadius="lg"
      p={4}
      minW={0}
      minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}
      data-drop-target={isDropTarget || undefined}
      onDragOver={(event) => {
        if (onDragOverColumn(column.id)) event.preventDefault()
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDropInColumn(column.id)
      }}
    >
      <Heading as="h2" size="md" mb={4}>{column.title}</Heading>
      <Stack gap={3}>
        {column.cards.length === 0 && <Text color="var(--app-muted)">No cards yet</Text>}
        {column.cards.map((card, cardIndex) => (
          <Card
            key={card.id}
            card={card}
            selected={selectedCardId === card.id}
            dragging={draggingCardId === card.id}
            dropPosition={dropMarker?.columnId === column.id && dropMarker.cardId === card.id
              ? dropMarker.after ? 'after' : 'before'
              : null}
            movePending={movePending}
            canMoveUp={cardIndex > 0}
            canMoveDown={cardIndex < column.cards.length - 1}
            canMoveLeft={columnIndex > 0}
            canMoveRight={columnIndex < columnCount - 1}
            onSelect={() => onSelectCard(selectedCardId === card.id ? null : card.id)}
            onMove={(direction) => onMoveCard(card.id, direction)}
            onDragStart={() => onDragStart(card.id)}
            onDragEnd={onDragEnd}
            onDragOver={(after) => onDragOverCard(column.id, card.id, after)}
            onDrop={(after) => onDropOnCard(column.id, card.id, after)}
          />
        ))}
      </Stack>
    </Box>
  )
}
