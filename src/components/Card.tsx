import { Box, Heading, Text } from '@chakra-ui/react'
import { useEditCard } from '../api/mutations'
import type { CardData, UserData } from '../types/board'
import { AssigneesSection } from './AssigneesSection'
import { ChecklistSection } from './ChecklistSection'
import { CommentsSection } from './CommentsSection'
import { RefusalShake } from './RefusalShake'

type MoveDirection = 'up' | 'down' | 'left' | 'right'
type CardProps = {
  card: CardData
  users: UserData[]
  usersLoading: boolean
  refused: boolean
  selected: boolean
  dragging: boolean
  dropPosition: 'before' | 'after' | null
  movePending: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  canMoveLeft: boolean
  canMoveRight: boolean
  onSelect: () => void
  onMove: (direction: MoveDirection) => void
  onDragStart: () => void
  onDragEnd: () => void
  onDragOver: (after: boolean) => boolean
  onDrop: (after: boolean) => void
}

export function Card({
  card, users, usersLoading, refused, selected, dragging, dropPosition, movePending, canMoveUp, canMoveDown,
  canMoveLeft, canMoveRight, onSelect, onMove, onDragStart, onDragEnd, onDragOver, onDrop,
}: CardProps) {
  const edit = useEditCard()

  return (
    <RefusalShake refused={refused}>
    <Box
      as="article"
      className="board-card"
      bg="var(--app-surface)"
      borderWidth="1px"
      borderColor={refused ? 'red.500' : selected ? 'var(--app-focus)' : 'var(--app-border)'}
      borderRadius="md"
      p={4}
      overflowWrap="anywhere"
      tabIndex={0}
      draggable={!movePending}
      data-selected={selected || undefined}
      data-dragging={dragging || undefined}
      data-drop-position={dropPosition ?? undefined}
      aria-label={card.title}
      onClick={(event) => {
        if (event.target instanceof HTMLElement &&
          event.target.closest('button, input, select, textarea, form, label, a')) return
        onSelect()
      }}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          onSelect()
        }
      }}
      onDragStart={(event) => {
        if (movePending) {
          event.preventDefault()
          return
        }
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', card.id)
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        const after = event.clientY >= event.currentTarget.getBoundingClientRect().top +
          event.currentTarget.getBoundingClientRect().height / 2
        if (onDragOver(after)) {
          event.preventDefault()
          event.stopPropagation()
        }
      }}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        const rect = event.currentTarget.getBoundingClientRect()
        onDrop(event.clientY >= rect.top + rect.height / 2)
      }}
    >
      <Heading as="h3" size="sm">{card.title}</Heading>
      {card.description && <Text color="var(--app-muted)" mt={2} fontSize="sm">{card.description}</Text>}
      {edit.isPending && <Text role="status" fontSize="sm">Saving card changes…</Text>}
      {edit.isError && <Text role="alert" color="red.600" fontSize="sm">Could not save card changes: {edit.error.message}</Text>}
      <AssigneesSection
        card={card}
        users={users}
        disabled={usersLoading || edit.isPending}
        onChange={(assignees) => edit.mutate({ cardId: card.id, assignees })}
      />
      <CommentsSection
        card={card}
        users={users}
        disabled={usersLoading || edit.isPending}
        onAdd={async (userId, comment) => {
          await edit.mutateAsync({
            cardId: card.id,
            comments: [...card.comments, { user: userId, comment }],
          })
        }}
      />
      <ChecklistSection
        card={card}
        disabled={edit.isPending}
        onAdd={async (description) => {
          await edit.mutateAsync({
            cardId: card.id,
            checklistItems: [...card.checklistItems, { description, done: false }],
          })
        }}
        onToggle={async (index) => {
          await edit.mutateAsync({
            cardId: card.id,
            checklistItems: card.checklistItems.map((item, itemIndex) =>
              itemIndex === index ? { ...item, done: !item.done } : item),
          })
        }}
      />
      {selected && (
        <div className="card-move-controls" role="group" aria-label={`Move ${card.title}`}>
          <button type="button" aria-label={`Move ${card.title} to previous column`} disabled={!canMoveLeft || movePending} onClick={() => onMove('left')}>←</button>
          <button type="button" aria-label={`Move ${card.title} up`} disabled={!canMoveUp || movePending} onClick={() => onMove('up')}>↑</button>
          <button type="button" aria-label={`Move ${card.title} down`} disabled={!canMoveDown || movePending} onClick={() => onMove('down')}>↓</button>
          <button type="button" aria-label={`Move ${card.title} to next column`} disabled={!canMoveRight || movePending} onClick={() => onMove('right')}>→</button>
        </div>
      )}
    </Box>
    </RefusalShake>
  )
}
