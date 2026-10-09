import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { DragEvent, KeyboardEvent } from 'react'
import type { CardCollectionsUpdate, CardData, UserData } from '../types/board'
import { CardChecklist } from './CardChecklist'
import { CardComments } from './CardComment'
import { CardMembers } from './CardMember'

type CardProps = {
  card: CardData
  isSelected: boolean
  isDragging: boolean
  canMove: boolean
  users: UserData[]
  isUpdating: boolean
  onUpdate: (changes: CardCollectionsUpdate) => Promise<boolean>
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
  users,
  isUpdating,
  onUpdate,
  onKeyDown,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: CardProps) {
  const assignees = card.assignees ?? []
  const comments = card.comments ?? []
  const checklistItems = card.checklistItems ?? []

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
      <details style={{ marginTop: '0.75rem' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--app-link)', fontSize: '0.875rem' }}>
          Details · {assignees.length} members · {comments.length} updates · Checklist {checklistItems.filter((item) => item.done).length}/{checklistItems.length}
        </summary>
        <Stack gap={4} mt={3}>
          <Box as="section" aria-label="Members">
            <Text fontSize="sm" fontWeight="semibold" mb={2}>Members</Text>
            <CardMembers
              assignees={assignees}
              availableUsers={users}
              disabled={isUpdating}
              onAssign={(userId) => onUpdate({ assignees: [...assignees, userId] })}
              onRemove={(userId) => onUpdate({ assignees: assignees.filter((id) => id !== userId) })}
            />
          </Box>
          <Box as="section" aria-label="Activity and comments">
            <Text fontSize="sm" fontWeight="semibold" mb={2}>Activity</Text>
            <CardComments
              comments={comments}
              availableUsers={users}
              disabled={isUpdating}
              onAddComment={(user, comment) => onUpdate({
                comments: [...comments, { user, comment }],
              })}
            />
          </Box>
          <Box as="section" aria-label="Checklist">
            <Text fontSize="sm" fontWeight="semibold" mb={2}>Checklist</Text>
            <CardChecklist
              items={checklistItems}
              disabled={isUpdating}
              onAddItem={(description) => onUpdate({
                checklistItems: [...checklistItems, { description, done: false }],
              })}
              onToggleItem={(itemIndex) => onUpdate({
                checklistItems: checklistItems.map((item, index) =>
                  index === itemIndex ? { ...item, done: !item.done } : item),
              })}
            />
          </Box>
        </Stack>
      </details>
    </Box>
  )
}
