import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Box, Button, Stack, Text } from '@chakra-ui/react'
import { useUpdateCardCollections } from '../api/mutations'
import type { CardData } from '../types/board'
import { useSession } from '../session/SessionContext'

type CommentaryProps = { card: CardData }

export function Commentary({ card }: CommentaryProps) {
  const [comment, setComment] = useState('')
  const [active, setActive] = useState(false)
  const [validationError, setValidationError] = useState('')
  const update = useUpdateCardCollections()
  const { user, isAnonymous } = useSession()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedComment = comment.trim()
    if (isAnonymous || !user) {
      setValidationError('Choose a named session to add a comment.')
      return
    }
    if (!trimmedComment) {
      setValidationError('Enter a comment.')
      return
    }
    setValidationError('')
    update.mutate({
      cardId: card.id,
      collections: { assignees: card.assignees, comments: [...card.comments, { user: user.id, comment: trimmedComment }], subtasks: card.subtasks },
    }, {
      onSuccess: () => {
        setComment('')
        setActive(false)
      },
    })
  }

  function keyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <Box mt={3} data-card-drag-disabled>
      <Stack as="section" aria-label={`Comments for ${card.title}`} gap={2}>
        {card.comments.map((entry, index) => (
          <Box key={`${entry.createdAt}-${index}`} borderLeftWidth="2px" borderColor="border.muted" pl={2}>
            <Text fontSize="sm"><strong>{entry.user}</strong>: {entry.comment}</Text>
            {entry.createdAt && <time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleString()}</time>}
          </Box>
        ))}
        <form onSubmit={submit}>
          <Stack gap={2}>
            <label htmlFor={`comment-text-${card.id}`}>Add a comment</label>
            <textarea id={`comment-text-${card.id}`} value={comment} onChange={(event) => { setComment(event.target.value); setActive(true) }} onFocus={() => setActive(true)} onKeyDown={keyDown} aria-invalid={Boolean(validationError) || undefined} aria-describedby={validationError ? `comment-error-${card.id}` : undefined} placeholder="Write a comment…" />
            {isAnonymous && <Text color="fg.muted">Anonymous visitors can read comments but cannot submit new ones.</Text>}
            {(active || comment) && <Button type="submit" size="sm" alignSelf="start" disabled={update.isPending || isAnonymous}>Submit comment</Button>}
            {validationError && <Text id={`comment-error-${card.id}`} role="alert" color="red.700">{validationError}</Text>}
            {update.isPending && <Text role="status">Saving comment…</Text>}
            {update.isError && <Text role="alert" color="red.700">Could not save comment: {update.error.message}. Your draft is still available; try again.</Text>}
          </Stack>
        </form>
      </Stack>
    </Box>
  )
}