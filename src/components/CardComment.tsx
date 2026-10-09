import { useState, type FormEvent } from 'react'
import { Box, Button, Stack, Text, Textarea } from '@chakra-ui/react'
import type { CommentData, UserData } from '../types/board'

type CardCommentsProps = {
  comments: CommentData[]
  availableUsers: UserData[]
  disabled?: boolean
  onAddComment: (user: string, text: string) => Promise<boolean>
}

export function CardComments({ comments, availableUsers, disabled = false, onAddComment }: CardCommentsProps) {
  const [authorId, setAuthorId] = useState('')
  const [text, setText] = useState('')
  const usersById = new Map(availableUsers.map((user) => [user.id, user]))
  const selectedAuthorId = authorId || availableUsers[0]?.id || ''

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const comment = text.trim()
    if (!comment || !selectedAuthorId) return
    if (await onAddComment(selectedAuthorId, comment)) setText('')
  }

  return (
    <Stack gap={3}>
      {comments.length === 0 && <Text color="var(--app-muted-text)" fontSize="sm">No comments yet</Text>}
      {comments.map((entry, index) => {
        const author = usersById.get(entry.user)
        return (
          <Box key={`${entry.createdAt}-${index}`} borderLeftWidth="2px" borderColor="var(--app-border)" pl={2}>
            <Text fontSize="sm">{entry.comment}</Text>
            <Text color="var(--app-muted-text)" fontSize="xs">
              {author ? `${author.firstname} ${author.lastname}` : 'Unknown member'} · {new Date(entry.createdAt).toLocaleString()}
            </Text>
          </Box>
        )
      })}
      <form onSubmit={(event) => { void submitComment(event) }}>
        <Stack gap={2}>
          <select
            aria-label="Comment author"
            value={selectedAuthorId}
            disabled={disabled || availableUsers.length === 0}
            onChange={(event) => setAuthorId(event.currentTarget.value)}
            style={{
              background: 'var(--app-surface)',
              border: '1px solid var(--app-border)',
              borderRadius: '0.375rem',
              color: 'var(--app-text)',
              padding: '0.375rem 0.5rem',
            }}
          >
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>
            ))}
          </select>
          <Textarea
            aria-label="New comment"
            placeholder="Write a comment"
            value={text}
            disabled={disabled || availableUsers.length === 0}
            onChange={(event) => setText(event.currentTarget.value)}
            size="sm"
          />
          <Button type="submit" size="xs" alignSelf="flex-start" disabled={disabled || !text.trim() || availableUsers.length === 0}>
            Add comment
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}