import { Box, Button, Heading, IconButton, Input, Stack, Text, Textarea } from '@chakra-ui/react'
import { motion, useReducedMotion } from 'motion/react'
import { useDrag, useDrop } from 'react-dnd'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react'
import type { CardData, UserData } from '../types/board'
import type { UpdateCardCollectionsInput } from '../api/mutations'
import { cardElementId, editElementId } from './cardIds'

export const cardDragType = 'board-card'
export type CardDragItem = { cardId: string; columnId: string }
type CardProps = {
  card: CardData
  columnId: string
  selected: boolean
  users: UserData[]
  onSelect: () => void
  onEdit: () => void
  onDragOver: (position: number | null) => void
  onDrop: (item: CardDragItem, position: number) => void
  onUpdateCollections: (input: UpdateCardCollectionsInput) => Promise<unknown>
  collectionsPending: boolean
}

// Responsibility: render one card, its title/description, and drag affordances.
// Props: card data, column id, selection state, and callbacks for selection,
// editing, drag-over placement, and drop; the page owns board data and moves.
// Actions: card click selects it, edit delegates to the drawer, and drag/drop
// delegates the requested position to the board owner.
// Correctness: selection focuses the card, controls do not select it, dragging
// shows the dragged state, and dropping reports the correct insertion position.
export function Card({ card, columnId, selected, users, onSelect, onEdit, onDragOver, onDrop, onUpdateCollections, collectionsPending }: CardProps) {
  const reducedMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [checklistOpen, setChecklistOpen] = useState(false)
  const [memberId, setMemberId] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [commentText, setCommentText] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [{ isDragging }, drag] = useDrag(() => ({
    type: cardDragType,
    item: { cardId: card.id, columnId },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [card.id, columnId])
  const [, drop] = useDrop<CardDragItem>(() => ({
    accept: cardDragType,
    hover: (item, monitor) => {
      if (!cardRef.current || item.cardId === card.id) return
      const point = monitor.getClientOffset()
      if (!point) return
      const bounds = cardRef.current.getBoundingClientRect()
      onDragOver(point.y < bounds.top + bounds.height / 2 ? 0 : 1)
    },
    drop: (item, monitor) => {
      if (item.cardId === card.id || !monitor.isOver({ shallow: true })) return
      const point = monitor.getClientOffset()
      if (!point || !cardRef.current) return
      const bounds = cardRef.current.getBoundingClientRect()
      onDrop(item, point.y < bounds.top + bounds.height / 2 ? 0 : 1)
      return { dropped: true }
    },
    collect: (monitor) => {
      if (!monitor.isOver()) onDragOver(null)
      return {}
    },
  }), [card.id, onDragOver, onDrop])
  useEffect(() => {
    drag(drop(cardRef))
  }, [drag, drop])

  function select(event: MouseEvent<HTMLElement>) {
    if ((event.target as Element).closest('button, input, textarea, select, a, [contenteditable]:not([contenteditable="false"])')) return
    onSelect()
  }

  function updateMembers(event: ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value
    if (!id || card.assignees.includes(id)) return
    setMemberId('')
    void onUpdateCollections({ cardId: card.id, assignees: [...card.assignees, id] })
  }

  function removeMember(id: string) {
    void onUpdateCollections({ cardId: card.id, assignees: card.assignees.filter((member) => member !== id) })
  }

  function publishComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const comment = commentText.trim()
    if (!comment || !commentAuthor || collectionsPending) return
    setCommentText('')
    void onUpdateCollections({
      cardId: card.id,
      comments: [...card.comments, { user: commentAuthor, comment }],
    }).catch(() => setCommentText(comment))
  }

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const description = taskDescription.trim()
    if (!description || collectionsPending) return
    setTaskDescription('')
    void onUpdateCollections({
      cardId: card.id,
      checklistItems: [...card.checklistItems, { description, done: false }],
    }).catch(() => setTaskDescription(description))
  }

  function toggleTask(index: number) {
    if (collectionsPending) return
    void onUpdateCollections({
      cardId: card.id,
      checklistItems: card.checklistItems.map((item, itemIndex) => itemIndex === index ? { ...item, done: !item.done } : item),
    })
  }

  const userName = (id: string) => {
    const user = users.find((item) => item.id === id)
    return user ? `${user.firstname} ${user.lastname}` : id
  }

  return (
    <motion.div layout={!reducedMotion} layoutId={reducedMotion ? undefined : `card-${card.id}`} transition={{ layout: { type: 'spring', stiffness: 280, damping: 32 } }}>
      <Box
        as="article" id={cardElementId(card.id)} tabIndex={-1} onClick={select}
        ref={cardRef} opacity={isDragging ? 0.35 : 1}
        className="board-card" aria-current={selected ? 'true' : undefined}
        bg={selected ? 'bg.info' : 'bg'} borderColor={selected ? 'border.info' : 'border'}
        borderWidth={selected ? '2px' : '1px'} borderRadius="md" p={4} overflowWrap="anywhere"
      >
        <Heading as="h3" size="sm">{card.title}</Heading>
        {card.description && <Text color="fg.muted" mt={2} fontSize="sm">{card.description}</Text>}
        {!selected && <Text mt={2} fontSize="sm" color="fg.muted">{card.assignees.length} member{card.assignees.length === 1 ? '' : 's'}</Text>}
        {selected && (
          <Stack mt={3} gap={3} onClick={(event) => event.stopPropagation()}>
            <Box>
              <Text fontWeight="medium">Members</Text>
              {card.assignees.length === 0 && <Text fontSize="sm" color="fg.muted">No members assigned.</Text>}
              {card.assignees.map((id) => (
                <Stack key={id} direction="row" align="center" gap={2}>
                  <Text fontSize="sm">{userName(id)}</Text>
                  <Button type="button" size="xs" variant="ghost" disabled={collectionsPending} onClick={() => removeMember(id)} aria-label={`Remove ${userName(id)}`}>×</Button>
                </Stack>
              ))}
              <select aria-label="Assign member" value={memberId} disabled={collectionsPending} onChange={updateMembers}>
                <option value="">Assign member…</option>
                {users.filter((user) => !card.assignees.includes(user.id)).map((user) => <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>)}
              </select>
            </Box>
            <Box>
              <Button type="button" size="sm" variant="outline" onClick={() => setCommentsOpen((open) => !open)} aria-expanded={commentsOpen}>
                {commentsOpen ? 'Hide comments' : `Show comments (${card.comments.length})`}
              </Button>
              {commentsOpen && (
                <Stack mt={2} gap={2}>
                  {card.comments.length === 0 && <Text fontSize="sm" color="fg.muted">No activity yet.</Text>}
                  {card.comments.map((entry, index) => (
                    <Box key={`${entry.createdAt}-${index}`} borderWidth="1px" borderRadius="sm" p={2}>
                      <Text fontSize="sm" fontWeight="medium">{userName(entry.user)}</Text>
                      <Text fontSize="sm">{entry.comment}</Text>
                      <Text fontSize="xs" color="fg.muted">{new Date(entry.createdAt).toLocaleString()}</Text>
                    </Box>
                  ))}
                  <form onSubmit={publishComment}>
                    <select aria-label="Comment author" value={commentAuthor} disabled={collectionsPending} onChange={(event) => setCommentAuthor(event.target.value)}>
                      <option value="">Choose author…</option>
                      {users.map((user) => <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>)}
                    </select>
                    <Textarea aria-label="Comment" value={commentText} disabled={collectionsPending} onChange={(event) => setCommentText(event.target.value)} placeholder="Write a comment" mt={2} />
                    <Button type="submit" size="sm" mt={2} disabled={collectionsPending || !commentAuthor || !commentText.trim()}>Publish comment</Button>
                  </form>
                </Stack>
              )}
            </Box>
            <Box>
              <Button type="button" size="sm" variant="outline" onClick={() => setChecklistOpen((open) => !open)} aria-expanded={checklistOpen}>
                {checklistOpen ? 'Hide checklist' : `Show checklist (${card.checklistItems.length})`}
              </Button>
              {checklistOpen && (
                <Stack mt={2} gap={2}>
                  {card.checklistItems.map((item, index) => (
                    <label key={`${item.description}-${index}`}>
                      <input type="checkbox" checked={item.done} disabled={collectionsPending} onChange={() => toggleTask(index)} /> {item.description}
                    </label>
                  ))}
                  <form onSubmit={addTask}>
                    <Input aria-label="New checklist task" value={taskDescription} disabled={collectionsPending} onChange={(event) => setTaskDescription(event.target.value)} placeholder="New task" />
                    <Button type="submit" size="sm" mt={2} disabled={collectionsPending || !taskDescription.trim()}>Add task</Button>
                  </form>
                </Stack>
              )}
            </Box>
          </Stack>
        )}
        <IconButton id={editElementId(card.id)} type="button" aria-label={`Edit ${card.title}`} size="xs" variant="outline" mt={2} onClick={onEdit}>✎</IconButton>
      </Box>
    </motion.div>
  )
}
