import { useId, useState } from 'react'
import { Box, Button, Heading, Stack, Text, Textarea } from '@chakra-ui/react'
import { userName } from '../../card-editing'
import type { CommentData } from '../../types/board'
import type { EditorProps, UsersProps } from './types'

export function Comments({ comments, users, usersUnavailable, blocked, onEdit }: EditorProps & UsersProps & { comments: CommentData[] }) {
  const id = useId()
  const [userId, setUserId] = useState('')
  const [draft, setDraft] = useState('')
  const chronological = comments.map((comment, index) => ({ comment, index }))
    .sort((a, b) => Date.parse(a.comment.createdAt) - Date.parse(b.comment.createdAt) || a.index - b.index)
  return (
    <Stack as="section" aria-label="Commentaires" gap={3}>
      <Heading as="h3" size="md">Commentaires</Heading>
      {comments.length === 0 && <Text color="fg.muted">Aucun commentaire.</Text>}
      {chronological.map(({ comment, index }) => <Box key={`${comment.createdAt}-${index}`} bg="bg.muted" p={3} borderRadius="md">
        <Text fontWeight="semibold">{userName(users, comment.user)}</Text>
        <Text color="fg.muted" fontSize="sm"><time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString('fr-FR')}</time></Text>
        <Text mt={2} whiteSpace="pre-wrap" overflowWrap="anywhere">{comment.comment}</Text>
      </Box>)}
      <form onSubmit={async event => {
        event.preventDefault()
        if (await onEdit({ kind: 'add-comment', userId, comment: draft })) setDraft('')
      }}>
        <Stack gap={2}>
          <label htmlFor={`${id}-author`}>Auteur</label>
          <select id={`${id}-author`} className="card-select" value={userId} required disabled={blocked || usersUnavailable} onChange={event => setUserId(event.currentTarget.value)}>
            <option value="">Choisir un auteur</option>
            {users.map(user => <option key={user.id} value={user.id}>{userName(users, user.id)}</option>)}
          </select>
          <label htmlFor={`${id}-comment`}>Nouveau commentaire</label>
          <Textarea id={`${id}-comment`} value={draft} disabled={blocked} required onChange={event => setDraft(event.currentTarget.value)} />
          <Button type="submit" alignSelf="start" disabled={blocked || usersUnavailable || !users.some(user => user.id === userId) || !draft.trim()}>Publier le commentaire</Button>
        </Stack>
      </form>
    </Stack>
  )
}
