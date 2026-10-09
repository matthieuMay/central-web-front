import { useState } from 'react'
import { Box, Button, HStack, Stack, Text, Textarea } from '@chakra-ui/react'
import type { CardComment, CommentInput, User } from '../types/board'
import { UserSelect } from './UserSelect'

/**
 * CardComments — the Commentaires section of a Card Detail.
 *
 * Responsibility: list a Card's activity (each Comment's author, timestamp,
 * and text) and compose a new Comment under the Acting Author.
 * Props: { comments: CardComment[]; users: User[]; authorId: string;
 *   onAuthorChange: (userId: string) => void; onSubmit: (input: CommentInput)
 *   => void; disabled?: boolean }.
 * Events: emits a new `{ user, comment }` with no `createdAt` (the API stamps
 *   it); existing Comments are never rebuilt.
 * Data owner: none — the board query owns `comments`; CardDetail owns the
 *   Acting Author and sends the appended array.
 * Correct when: existing Comments keep their original createdAt, and posting
 *   emits only the new `{ user, comment }`.
 */
type CardCommentsProps = {
  comments: CardComment[]
  users: User[]
  authorId: string
  onAuthorChange: (userId: string) => void
  onSubmit: (input: CommentInput) => void
  disabled?: boolean
}

function authorName(users: User[], id: string) {
  const user = users.find((candidate) => candidate.id === id)
  return user ? `${user.firstname} ${user.lastname}` : id
}

export function CardComments({ comments, users, authorId, onAuthorChange, onSubmit, disabled }: CardCommentsProps) {
  const [draft, setDraft] = useState('')

  function submit() {
    const comment = draft.trim()
    if (!comment || !authorId) return
    onSubmit({ user: authorId, comment })
    setDraft('')
  }

  return (
    <Stack gap={4}>
      {comments.length === 0 ? (
        <Text color="fg.muted" fontSize="sm">Aucun commentaire.</Text>
      ) : (
        <Stack gap={3}>
          {comments.map((entry, index) => (
            <Box key={index} bg="bg.muted" borderRadius="md" p={3}>
              <HStack justify="space-between">
                <Text fontWeight="medium" fontSize="sm">{authorName(users, entry.user)}</Text>
                <Text color="fg.muted" fontSize="xs">
                  {new Date(entry.createdAt).toLocaleString()}
                </Text>
              </HStack>
              <Text mt={1} fontSize="sm">{entry.comment}</Text>
            </Box>
          ))}
        </Stack>
      )}
      {disabled ? (
        <Text color="fg.muted" fontSize="sm">Les commentaires sont indisponibles.</Text>
      ) : (
        <Stack gap={2}>
          <UserSelect users={users} value={authorId} onChange={onAuthorChange} label="Auteur du commentaire" />
          <Textarea
            size="sm"
            aria-label="Nouveau commentaire"
            placeholder="Écrire un commentaire"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <HStack justify="flex-end">
            <Button size="sm" onClick={submit}>Publier</Button>
          </HStack>
        </Stack>
      )}
    </Stack>
  )
}
