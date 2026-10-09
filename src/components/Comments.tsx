import { useState } from 'react'
import { Button, HStack, NativeSelect, Stack, Text, Textarea } from '@chakra-ui/react'
import type { CommentData, CommentInput, UserData } from '../types/board'

/**
 * Comments — section « Commentaires » d'une carte.
 *
 * Responsabilité : lister l'activité (auteur, texte, date) et publier un
 * nouveau commentaire avec un auteur choisi dans l'interface. Composant de
 * présentation : il reçoit la liste et remonte la liste complète mise à jour.
 *
 * Props :
 * - comments : CommentData[] — commentaires existants (source : la carte).
 * - users : UserData[] — auteurs possibles (source : GET /users).
 * - onChange : (comments: CommentInput[]) => void — remonte la liste complète.
 *
 * Action déclenchée : publier un commentaire → `onChange`.
 *
 * Cas à vérifier :
 * - Un nouveau commentaire est envoyé sans `createdAt` (l'API crée la date).
 * - Les commentaires existants sont renvoyés avec leur `createdAt` d'origine.
 * - Un texte vide ou un auteur manquant n'est pas publié.
 * - L'ordre d'ajout est conservé.
 */
type CommentsProps = {
  comments: CommentData[]
  users: UserData[]
  onChange: (comments: CommentInput[]) => void
}

function fullName(user: UserData) {
  return `${user.firstname} ${user.lastname}`
}

export function Comments({ comments, users, onChange }: CommentsProps) {
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')

  function submit() {
    const trimmed = text.trim()
    if (!author || !trimmed) return
    // Nouveau commentaire : pas de `createdAt`, l'API crée la date.
    // Les commentaires existants sont renvoyés tels quels, dates comprises.
    onChange([...comments, { user: author, comment: trimmed }])
    setText('')
  }

  return (
    <Stack gap={3}>
      <Text fontWeight="medium">Comments</Text>
      {comments.length === 0 ? (
        <Text color="fg.muted" fontSize="sm">
          No comments yet
        </Text>
      ) : (
        <Stack gap={3}>
          {comments.map((comment, index) => {
            const user = users.find((item) => item.id === comment.user)
            return (
              <Stack key={`${comment.user}-${comment.createdAt}-${index}`} gap={0}>
                <HStack gap={2}>
                  <Text fontWeight="medium" fontSize="sm">
                    {user ? fullName(user) : comment.user}
                  </Text>
                  {comment.createdAt && (
                    <Text color="fg.muted" fontSize="xs">
                      {new Date(comment.createdAt).toLocaleString()}
                    </Text>
                  )}
                </HStack>
                <Text fontSize="sm">{comment.comment}</Text>
              </Stack>
            )
          })}
        </Stack>
      )}
      <NativeSelect.Root size="sm">
        <NativeSelect.Field
          value={author}
          aria-label="Comment author"
          onChange={(event) => setAuthor(event.target.value)}
        >
          <option value="">Choose an author…</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {fullName(user)}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      <Textarea
        size="sm"
        rows={2}
        value={text}
        placeholder="Write a comment"
        aria-label="Comment"
        onChange={(event) => setText(event.target.value)}
      />
      <HStack justify="flex-end">
        <Button size="xs" colorPalette="blue" onClick={submit} disabled={!author || !text.trim()}>
          Comment
        </Button>
      </HStack>
    </Stack>
  )
}
