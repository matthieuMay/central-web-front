import { Box, Button, Field, Text, Textarea } from '@chakra-ui/react'
import { useMemo, useState, type FormEvent } from 'react'
import type { CardData, CommentData, User } from '../types/board'

export type CardCommentsProps = {
  comments: CommentData[]
  users: User[]
  onOpen: () => void
}

function displayName(userId: string, users: User[]) {
  const user = users.find((item) => item.id === userId)
  return user ? `${user.firstname} ${user.lastname}` : userId
}

function sortComments(comments: CommentData[]) {
  return [...comments].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
}

function formatDate(createdAt: string) {
  return new Date(createdAt).toLocaleString()
}

function CommentBubble({ item, users, compact = false }: { item: CommentData; users: User[]; compact?: boolean }) {
  return (
    <Box
      position="relative"
      bg="blue.subtle"
      borderColor="blue.muted"
      borderWidth="1px"
      borderRadius="xl"
      px={compact ? 2 : 3}
      py={compact ? 1.5 : 2}
      _before={{
        content: '""',
        position: 'absolute',
        bottom: '-7px',
        left: '16px',
        width: '12px',
        height: '12px',
        bg: 'blue.subtle',
        borderRight: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'blue.muted',
        transform: 'rotate(45deg)',
      }}
    >
      <Text fontSize={compact ? '2xs' : 'xs'} fontWeight="bold" color="blue.fg">{displayName(item.user, users)}</Text>
      <Text fontSize={compact ? 'xs' : 'sm'} mt={1}>{item.comment}</Text>
      <Text fontSize="2xs" color="fg.muted" mt={1}>{formatDate(item.createdAt)}</Text>
    </Box>
  )
}

export function CardComments({ comments, users, onOpen }: CardCommentsProps) {
  const latest = sortComments(comments).slice(0, 1)
  if (!latest.length) return null
  return (
    <Box mt={3} data-component="card-comments">
      <Text fontWeight="semibold" fontSize="sm">Comments</Text>
      {latest.map((item) => (
        <Box key={`${item.createdAt}-${item.user}-${item.comment}`} mt={3} maxW="92%">
          <CommentBubble item={item} users={users} compact />
        </Box>
      ))}
      <Button type="button" size="xs" variant="outline" mt={2} onClick={onOpen} aria-label="View all comments">💬</Button>
    </Box>
  )
}

export function CardCommentsDrawer({ card, users, open, onClose, onSave, onDelete, isSaving, error }: {
  card: CardData | null
  users: User[]
  open: boolean
  onClose: () => void
  onSave: (comment: Omit<CommentData, 'createdAt'>) => Promise<boolean>
  onDelete: (comment: CommentData) => Promise<boolean>
  isSaving: boolean
  error: string | null
}) {
  const [user, setUser] = useState('')
  const [comment, setComment] = useState('')
  const comments = useMemo(() => sortComments(card?.comments ?? []), [card?.comments])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user || !comment.trim() || isSaving) return
    if (await onSave({ user, comment: comment.trim() })) setComment('')
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="comments-drawer-title" hidden={!open}>
      {open && card && (
        <Box position="fixed" inset={0} zIndex={10} onClick={onClose}>
          <Box position="absolute" inset={0} bg="blackAlpha.500" />
          <Box position="absolute" insetY={0} left={0} width={{ base: '100%', md: '28rem' }} bg="bg" borderRightWidth="1px" p={6} overflowY="auto" shadow="lg" onClick={(event) => event.stopPropagation()}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Text as="h2" id="comments-drawer-title" fontSize="xl" fontWeight="bold">Comments for {card.title}</Text>
          </Box>
          <form onSubmit={submit}>
            <Field.Root mt={6} required>
              <Field.Label htmlFor="comment-user">Author</Field.Label>
              <select
                id="comment-user"
                value={user}
                onChange={(event) => setUser(event.target.value)}
                required
                style={{
                  width: '100%',
                  border: '1px solid var(--chakra-colors-border)',
                  borderRadius: '9999px',
                  padding: '0.5rem 0.75rem',
                  background: 'var(--chakra-colors-bg)',
                  color: 'var(--chakra-colors-fg)',
                }}
              >
                <option value="">Choose an author</option>
                {users.map((item) => <option key={item.id} value={item.id}>{item.firstname} {item.lastname}</option>)}
              </select>
            </Field.Root>
            <Field.Root mt={4} required>
              <Field.Label htmlFor="comment-text">Comment</Field.Label>
              <Textarea id="comment-text" value={comment} onChange={(event) => setComment(event.target.value)} required />
            </Field.Root>
            <Button type="submit" mt={4} disabled={isSaving || !user || !comment.trim()}>Add comment</Button>
          </form>
          {error && <Text role="alert" color="red.700" mt={4}>{error}</Text>}
          <Box mt={8}>
            {comments.length === 0 && <Text color="fg.muted">No comments yet.</Text>}
            {comments.map((item) => (
              <Box key={`${item.createdAt}-${item.user}-${item.comment}`} mt={5} maxW="92%">
                <CommentBubble item={item} users={users} />
                <Button type="button" size="xs" variant="ghost" colorPalette="red" mt={3} onClick={() => onDelete(item)} disabled={isSaving}>Delete</Button>
              </Box>
            ))}
          </Box>
          </Box>
        </Box>
      )}
    </div>
  )
}
