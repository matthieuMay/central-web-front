import { Box, Button, Field, Heading, NativeSelect, Stack, Text, Textarea } from '@chakra-ui/react'
import { useState, type FormEvent } from 'react'
import type { CardComment, User } from '../types/board'

export type NewComment = {
  user: string // id of the author chosen in the interface
  comment: string
}

type CardCommentsProps = {
  comments: CardComment[]
  users: User[] // every User from GET /users, to choose the author and show names
  isSaving: boolean
  // Receives only the new comment, without createdAt. Resolves to true once it is
  // saved, false if the API refused it.
  onAdd: (newComment: NewComment) => Promise<boolean>
}

/*
 * CardComments — the activity of this Card.
 *
 * Responsibility:
 *   - Shows the existing comments: author name, text and date (createdAt).
 *   - Lets the user write a comment and choose its author among the Users.
 *
 * Action: calls onAdd with the new comment only. CardDetails builds the full list:
 * existing comments WITH their createdAt + the new one WITHOUT createdAt.
 * It clears the text only when onAdd resolves to true; on false the text stays,
 * so the user can retry. The chosen author stays for the next comment.
 * Who holds the data: CardDetails / the Board from the API.
 *
 * Cases to check:
 *   - Publishing keeps the history and the original dates.
 *   - An author must be chosen and the text must not be blank.
 *   - No comments yet: show "No comments" and the form still works.
 *   - Controls are disabled while isSaving.
 *   - A refused comment keeps the typed text.
 */
export function CardComments(props: CardCommentsProps) {
  const [authorId, setAuthorId] = useState('')
  const [text, setText] = useState('')

  function nameOf(id: string) {
    const user = props.users.find((item) => item.id === id)
    return user ? `${user.firstname} ${user.lastname}` : 'Unknown person'
  }

  async function publish(event: FormEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!authorId || !trimmed) return
    const saved = await props.onAdd({ user: authorId, comment: trimmed })
    if (saved) setText('')
  }

  return (
    <Box>
      <Heading as="h3" size="sm" mb={2}>Comments</Heading>
      {props.comments.length === 0 ? (
        <Text fontSize="sm" color="fg.muted" mb={2}>No comments</Text>
      ) : (
        <Stack as="ul" gap={3} mb={3} listStyleType="none">
          {props.comments.map((item, index) => (
            // Comments have no id: the index is their identity.
            <li key={index}>
              <Text fontSize="sm" fontWeight="semibold">
                {nameOf(item.user)}
                {item.createdAt && <Text as="span" fontWeight="normal" color="fg.muted"> · {new Date(item.createdAt).toLocaleString()}</Text>}
              </Text>
              <Text fontSize="sm" whiteSpace="pre-wrap">{item.comment}</Text>
            </li>
          ))}
        </Stack>
      )}
      <form onSubmit={publish}>
        <Stack gap={2}>
          <Field.Root>
            <Field.Label htmlFor="card-comment-author">Author</Field.Label>
            <NativeSelect.Root size="sm" disabled={props.isSaving || props.users.length === 0}>
              <NativeSelect.Field id="card-comment-author" value={authorId} onChange={(event) => setAuthorId(event.target.value)}>
                <option value="">Choose an author</option>
                {props.users.map((user) => <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>)}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          <Field.Root>
            <Field.Label htmlFor="card-comment-text">Comment</Field.Label>
            <Textarea id="card-comment-text" size="sm" rows={3} value={text} disabled={props.isSaving}
              onChange={(event) => setText(event.target.value)} />
          </Field.Root>
          <Button type="submit" size="sm" alignSelf="flex-start" disabled={props.isSaving || !authorId || !text.trim()}>Publish</Button>
        </Stack>
      </form>
    </Box>
  )
}
