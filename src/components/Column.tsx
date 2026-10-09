import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { DragEvent, KeyboardEvent } from 'react'
import type { CardCollectionsUpdate, ColumnData, UserData } from '../types/board'
import { Card } from './Card'

type ColumnProps = {
  column: ColumnData
  canMoveCards: boolean
  movingCardId: string | null
  users: UserData[]
  isUpdating: boolean
  onUpdateCard: (cardId: string, changes: CardCollectionsUpdate) => Promise<boolean>
  draggingCardId: string | null
  onCardKeyDown: (cardId: string, event: KeyboardEvent<HTMLElement>) => void
  onCardDragStart: (cardId: string) => void
  onCardDragEnd: () => void
  onCardDrop: (event: DragEvent<HTMLElement>, columnId: string, cardId: string, index: number) => void
  onColumnDrop: (event: DragEvent<HTMLElement>, columnId: string) => void
}

export function Column({
  column,
  canMoveCards,
  movingCardId,
  users,
  isUpdating,
  onUpdateCard,
  draggingCardId,
  onCardKeyDown,
  onCardDragStart,
  onCardDragEnd,
  onCardDrop,
  onColumnDrop,
}: ColumnProps) {
  return (
    <Box
      as="section"
      aria-label={column.title}
      bg="var(--app-muted-surface)"
      color="var(--app-text)"
      borderRadius="lg"
      p={4}
      minW={0}
      minH={{ base: 'auto', xl: 'calc(100dvh - 12rem)' }}
      onDragOver={(event) => {
        if (draggingCardId) {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'move'
        }
      }}
      onDrop={(event) => onColumnDrop(event, column.id)}
    >
      <Heading as="h2" size="md" mb={4}>{column.title}</Heading>
      <Stack gap={3}>
        {column.cards.length === 0 && <Text color="var(--app-muted-text)">No cards yet</Text>}
        {column.cards.map((card, index) => (
          <Card
            key={card.id}
            card={card}
            isSelected={movingCardId === card.id}
            isDragging={draggingCardId === card.id}
            canMove={canMoveCards}
            users={users}
            isUpdating={isUpdating}
            onUpdate={(changes) => onUpdateCard(card.id, changes)}
            onKeyDown={(event) => onCardKeyDown(card.id, event)}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', card.id)
              onCardDragStart(card.id)
            }}
            onDragEnd={onCardDragEnd}
            onDragOver={(event) => {
              if (draggingCardId) event.preventDefault()
            }}
            onDrop={(event) => onCardDrop(event, column.id, card.id, index)}
          />
        ))}
      </Stack>
    </Box>
  )
}
