import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { DragEvent, KeyboardEvent } from 'react'
import { urgencyOptions, type CardCollectionsUpdate, type CardData, type UserData, type Urgency } from '../types/board'
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
  const urgencyValue = card.urgency ?? 'softly_urgent'
  const urgency = urgencyOptions.find((option) => option.value === urgencyValue)!

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
      onDragStart={(event) => {
        if ((event.target as HTMLElement).closest('select, summary, input, textarea, button')) {
          event.preventDefault()
          return
        }
        onDragStart(event)
      }}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Heading as="h3" size="sm">{card.title}</Heading>
      {card.description && <Text color="var(--app-muted-text)" mt={2} fontSize="sm">{card.description}</Text>}
      <Stack direction="row" alignItems="center" gap={2} mt={3}>
        <Text fontSize="xs" fontWeight="semibold">Urgency</Text>
        <select
          aria-label={`Urgency for ${card.title}`}
          value={urgencyValue}
          disabled={isUpdating}
          onChange={(event) => { void onUpdate({ urgency: event.currentTarget.value as Urgency }) }}
          style={{
            backgroundColor: urgency.background,
            border: 0,
            borderRadius: '0.375rem',
            color: urgency.color,
            fontSize: '0.75rem',
            fontWeight: 600,
            maxWidth: '100%',
            padding: '0.375rem 0.5rem',
          }}
        >
          {urgencyOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </Stack>
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
