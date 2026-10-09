import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import type { FormEvent, DragEventHandler, FocusEventHandler, KeyboardEventHandler } from 'react'
import type { CardData, ChecklistItem, CommentData, UserData } from '../types/board'

type CardProps = {
  card: CardData
  users: UserData[]
  isLoadingUsers: boolean
  usersError: string | null
  isUpdating: boolean
  onUpdateAssignees: (assignees: string[]) => Promise<boolean>
  onUpdateChecklistItems: (items: ChecklistItem[]) => Promise<boolean>
  onUpdateComments: (comments: CommentData[]) => Promise<boolean>
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
  users,
  isLoadingUsers,
  usersError,
  isUpdating,
  onUpdateAssignees,
  onUpdateChecklistItems,
  onUpdateComments,
  onFocus,
  onKeyDown,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  dropBefore,
}: CardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newItemDescription, setNewItemDescription] = useState('')
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({})
  const [newCommentDraft, setNewCommentDraft] = useState('')
  const [newCommentUser, setNewCommentUser] = useState('')
  const assigneeNames = card.assignees.map((assigneeId) => {
    const user = users.find((candidate) => candidate.id === assigneeId)
    return user ? `${user.firstname} ${user.lastname}` : assigneeId
  })

  const addChecklistItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const description = newItemDescription.trim()
    if (!description) return

    const succeeded = await onUpdateChecklistItems([
      ...card.checklistItems,
      { description, done: false },
    ])
    if (succeeded) setNewItemDescription('')
  }

  const saveComment = async (index: number) => {
    const originalComment = card.comments[index]
    if (!originalComment) return
    const comment = (commentDrafts[index] ?? originalComment.comment).trim()
    if (!comment || comment === originalComment.comment) {
      setCommentDrafts((drafts) => {
        const remainingDrafts = { ...drafts }
        delete remainingDrafts[index]
        return remainingDrafts
      })
      return
    }

    const comments = card.comments.map((current, currentIndex) =>
      currentIndex === index ? { ...current, comment } : current,
    )
    if (await onUpdateComments(comments)) {
      setCommentDrafts((drafts) => {
        const remainingDrafts = { ...drafts }
        delete remainingDrafts[index]
        return remainingDrafts
      })
    }
  }

  const saveNewComment = async () => {
    const comment = newCommentDraft.trim()
    if (!comment || !newCommentUser) return

    const succeeded = await onUpdateComments([
      ...card.comments,
      { user: newCommentUser, comment, createdAt: new Date().toISOString() },
    ])
    if (succeeded) setNewCommentDraft('')
  }

  const handleDragStart: DragEventHandler<HTMLElement> = (event) => {
    if (event.target instanceof HTMLElement && event.target.closest('[data-card-details]')) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    onDragStart(event)
  }

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
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Heading as="h3" size="sm">{card.title}</Heading>
      {card.description && <Text color="var(--text-muted)" mt={2} fontSize="sm">{card.description}</Text>}
      <Stack gap={1} mt={3} fontSize="sm" color="var(--text-muted)">
        <Text>
          Assignees: {assigneeNames.length > 0 ? assigneeNames.join(', ') : 'None'}
        </Text>
        <Text>
          Checklist: {card.checklistItems.filter((item) => item.done).length}/{card.checklistItems.length}
        </Text>
      </Stack>
      <button
        type="button"
        className="card-details__button"
        aria-expanded={isExpanded}
        aria-controls={`card-details-${card.id}`}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        onDragStart={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        onDragOver={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        onDrop={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        {isExpanded ? 'Hide details' : 'Details'}
      </button>
      <Box
        id={`card-details-${card.id}`}
        data-card-details
        hidden={!isExpanded}
        className="card-details"
        mt={4}
        pt={4}
        borderTopWidth="1px"
        borderColor="var(--border-color)"
        onDragStart={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        onDragOver={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
        onDrop={(event) => {
          event.preventDefault()
          event.stopPropagation()
        }}
      >
        <Stack gap={4}>
          <Box>
            <Heading as="h4" size="xs" mb={2}>Assignees</Heading>
            {isLoadingUsers && <Text role="status">Loading users…</Text>}
            {usersError && <Text color="var(--text-muted)">Assignees unavailable.</Text>}
            {!isLoadingUsers && !usersError && users.length === 0 && (
              <Text color="var(--text-muted)">No users available.</Text>
            )}
            {!isLoadingUsers && !usersError && users.length > 0 && (
              <Stack gap={1}>
                {users.map((user) => (
                  <label className="card-details__choice" key={user.id}>
                    <input
                      type="checkbox"
                      checked={card.assignees.includes(user.id)}
                      disabled={isUpdating}
                      onChange={(event) => {
                        const assignees = event.target.checked
                          ? [...card.assignees, user.id]
                          : card.assignees.filter((assigneeId) => assigneeId !== user.id)
                        void onUpdateAssignees(assignees)
                      }}
                    />
                    <span>{user.firstname} {user.lastname}</span>
                  </label>
                ))}
              </Stack>
            )}
          </Box>
          <Box>
            <Heading as="h4" size="xs" mb={2}>Checklist</Heading>
            {card.checklistItems.length === 0
              ? <Text color="var(--text-muted)" mb={2}>No checklist items yet.</Text>
              : (
                <Stack gap={2} mb={3}>
                  {card.checklistItems.map((item, index) => (
                    <ChecklistRow
                      key={`${index}-${item.description}`}
                      item={item}
                      index={index}
                      isUpdating={isUpdating}
                      onSave={(description) => onUpdateChecklistItems(
                        card.checklistItems.map((current, itemIndex) =>
                          itemIndex === index ? { ...current, description } : current,
                        ),
                      )}
                      onToggle={(done) => onUpdateChecklistItems(
                        card.checklistItems.map((current, itemIndex) =>
                          itemIndex === index ? { ...current, done } : current,
                        ),
                      )}
                      onRemove={() => onUpdateChecklistItems(
                        card.checklistItems.filter((_, itemIndex) => itemIndex !== index),
                      )}
                    />
                  ))}
                </Stack>
              )}
            <form className="card-details__form" onSubmit={addChecklistItem}>
              <label htmlFor={`new-checklist-item-${card.id}`}>New checklist item</label>
              <input
                id={`new-checklist-item-${card.id}`}
                value={newItemDescription}
                disabled={isUpdating}
                onChange={(event) => setNewItemDescription(event.target.value)}
              />
              <button
                type="submit"
                className="card-details__button"
                disabled={isUpdating || !newItemDescription.trim()}
              >
                Add item
              </button>
            </form>
          </Box>
          <Box>
            <Heading as="h4" size="xs" mb={2}>Comment</Heading>
            {card.comments.length > 0 && (
              <Stack as="ul" gap={3} listStyle="none" p={0} m={0} mb={4}>
                {card.comments.map((comment, index) => {
                  const author = users.find((user) => user.id === comment.user)
                  const authorName = author
                    ? `${author.firstname} ${author.lastname}`
                    : comment.user
                  return (
                    <Box as="li" key={`${comment.createdAt}-${index}`}>
                      <Text fontWeight="semibold">{authorName}</Text>
                      <textarea
                        aria-label={`Comment by ${authorName}`}
                        className="card-details__comment"
                        value={commentDrafts[index] ?? comment.comment}
                        disabled={isUpdating}
                        onChange={(event) => setCommentDrafts((drafts) => ({
                          ...drafts,
                          [index]: event.target.value,
                        }))}
                        onBlur={() => void saveComment(index)}
                      />
                      <Text color="var(--text-muted)" fontSize="sm">
                        {new Date(comment.createdAt).toLocaleString()}
                      </Text>
                    </Box>
                  )
                })}
              </Stack>
            )}
            <Stack gap={2}>
              <label htmlFor={`new-comment-user-${card.id}`}>Comment author</label>
              <select
                id={`new-comment-user-${card.id}`}
                aria-label="Comment author"
                value={newCommentUser}
                disabled={isUpdating || users.length === 0}
                onChange={(event) => setNewCommentUser(event.target.value)}
              >
                <option value="">Select an author</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstname} {user.lastname}
                  </option>
                ))}
              </select>
              <label htmlFor={`new-card-comment-${card.id}`}>Comment</label>
              <textarea
                id={`new-card-comment-${card.id}`}
                aria-label="New comment"
                className="card-details__comment"
                value={newCommentDraft}
                disabled={isUpdating || users.length === 0}
                onChange={(event) => setNewCommentDraft(event.target.value)}
                onBlur={() => void saveNewComment()}
              />
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  )
}

type ChecklistRowProps = {
  item: ChecklistItem
  index: number
  isUpdating: boolean
  onSave: (description: string) => Promise<boolean>
  onToggle: (done: boolean) => Promise<boolean>
  onRemove: () => Promise<boolean>
}

function ChecklistRow({
  item,
  index,
  isUpdating,
  onSave,
  onToggle,
  onRemove,
}: ChecklistRowProps) {
  const [description, setDescription] = useState(item.description)

  const saveDescription = async () => {
    const trimmedDescription = description.trim()
    if (!trimmedDescription || trimmedDescription === item.description) return
    if (await onSave(trimmedDescription)) setDescription(trimmedDescription)
  }

  return (
    <Box className="card-details__checklist-row">
      <label className="card-details__choice">
        <input
          type="checkbox"
          aria-label={`Mark checklist item ${index + 1} done`}
          checked={item.done}
          disabled={isUpdating}
          onChange={(event) => void onToggle(event.target.checked)}
        />
      </label>
      <input
        aria-label={`Checklist item ${index + 1} description`}
        value={description}
        disabled={isUpdating}
        onChange={(event) => setDescription(event.target.value)}
        onBlur={(event) => {
          if (
            event.relatedTarget instanceof Node &&
            event.currentTarget.parentElement?.contains(event.relatedTarget)
          ) return
          void saveDescription()
        }}
      />
      <button
        type="button"
        className="card-details__button"
        disabled={isUpdating}
        aria-label={`Remove checklist item ${index + 1}`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => void onRemove()}
      >
        Remove
      </button>
    </Box>
  )
}
