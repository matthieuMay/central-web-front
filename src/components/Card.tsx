import { Box, Button, Heading, IconButton, Text } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useDrag } from 'react-dnd'
import { motion, useReducedMotion } from 'motion/react'
import { useState, type MouseEvent } from 'react'
import type { CardData } from '../types/board'
import { getUsers, usersKey } from '../api/board'
import { useUpdateCardChecklistItems } from '../api/mutations'
import { cardElementId, editElementId } from './cardIds'
import Confetti from './Confetti'
import { CommentsDialog } from './CommentsDialog'
import { sortCommentsNewestFirst } from '../domain/comments'

type CardProps = { card: CardData; selected: boolean; confettiBurst?: number; onSelect: () => void; onEdit: () => void }

export function Card({ card, selected, confettiBurst = 0, onSelect, onEdit }: CardProps) {
  const users = useQuery({ queryKey: usersKey, queryFn: getUsers })
  const reducedMotion = useReducedMotion()
  const [commentsOpen, setCommentsOpen] = useState(false)
  const updateTasks = useUpdateCardChecklistItems()
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'card',
    item: { cardId: card.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [card.id])

  function select(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
    onSelect()
  }

  const assigneeNames = (card.assignees ?? []).map((assignee) => {
    if (typeof assignee !== 'string') return `${assignee.firstname} ${assignee.lastname}`
    const user = users.data?.find((candidate) => candidate.id === assignee)
    return user ? `${user.firstname} ${user.lastname}` : assignee
  })
  const comments = card.comments ?? []
  const latest = sortCommentsNewestFirst(comments)[0]
  const latestUser = latest ? users.data?.find((user) => user.id === latest.user) : undefined

  function toggleTask(index: number) {
    if (updateTasks.isPending) return
    const checklistItems = (card.checklistItems ?? []).map((task, taskIndex) => taskIndex === index ? { ...task, done: !task.done } : task)
    updateTasks.mutate({ cardId: card.id, checklistItems })
  }

  return (
    <motion.div layout={!reducedMotion} layoutId={reducedMotion ? undefined : `card-${card.id}`} transition={{ layout: { type: 'spring', stiffness: 280, damping: 32 } }}>
      <Box ref={drag} opacity={isDragging ? 0.45 : 1} as="article" id={cardElementId(card.id)} tabIndex={-1} onClick={select}
        className="board-card" aria-current={selected ? 'true' : undefined}
        bg={selected ? 'bg.info' : 'bg'} borderColor={selected ? 'border.info' : 'border'}
        borderWidth={selected ? '2px' : '1px'} borderRadius="md" p={4} overflowWrap="anywhere" position="relative">
        <Heading as="h3" size="sm">{card.title}</Heading>
        {card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
        {assigneeNames.length > 0 && <Text mt={2} fontSize="sm" aria-label={`Assigned users: ${assigneeNames.join(', ')}`}>Users: {assigneeNames.join(', ')}</Text>}
        {card.checklistItems && card.checklistItems.length > 0 && (
          <Box as="ul" mt={3} listStyleType="none" pl={0}>
            {card.checklistItems.map((task, index) => (
              <li key={`${index}-${task.description}`}>
                <Button type="button" size="sm" variant="ghost" aria-pressed={task.done} aria-label={`${task.done ? 'Invalider' : 'Valider'} la tâche ${task.description}`} onClick={() => toggleTask(index)} disabled={updateTasks.isPending}>
                  {task.done ? '☑' : '☐'} {task.description}
                </Button>
              </li>
            ))}
          </Box>
        )}
        {latest && <Text mt={2} fontSize="sm">Dernier commentaire — {latestUser ? `${latestUser.firstname} ${latestUser.lastname}` : latest.user}: {latest.comment}</Text>}
        <Button type="button" size="sm" variant="outline" mt={2} onClick={() => setCommentsOpen(true)}>Commentaires ({comments.length})</Button>
        <IconButton id={editElementId(card.id)} type="button" aria-label={`Edit ${card.title}`} size="xs" variant="outline" mt={2} onClick={onEdit}>✎</IconButton>
        {updateTasks.isError && <Text role="alert" color="red.700" mt={2}>Impossible de mettre à jour la tâche : {updateTasks.error.message}</Text>}
        <Confetti particleCount={confettiBurst} />
      </Box>
      {commentsOpen && <CommentsDialog card={card} onClose={() => setCommentsOpen(false)} />}
    </motion.div>
  )
}
