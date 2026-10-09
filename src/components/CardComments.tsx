import { Box, Button, Field, Heading, NativeSelect, Stack, Text, Textarea } from '@chakra-ui/react'
import { useState, type FormEvent } from 'react'
import type { CardComment, NewCardComment } from '../types/board'
import type { UserData } from '../types/user'

export type CardCommentsProps = {
  comments: CardComment[]
  users: UserData[]
  disabled: boolean
  onPublish: (comment: NewCardComment) => Promise<void>
}

export function CardComments({ comments, users, disabled, onPublish }: CardCommentsProps) {
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const validAuthor = users.some((user) => user.id === author)
  async function publish(event: FormEvent) {
    event.preventDefault()
    if (disabled || !validAuthor || !text.trim()) return
    setError('')
    try {
      await onPublish({ user: author, comment: text.trim() })
      setText('')
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Publication impossible.') }
  }
  return (
    <Box as="section" mt={6}>
      <Heading as="h3" size="sm" mb={3}>Commentaires</Heading>
      <Stack as="ol" listStyleType="none" p={0} gap={3} mb={4}>
        {comments.map((comment, index) => {
          const user = users.find((item) => item.id === comment.user)
          const date = new Date(comment.createdAt)
          return <Box as="li" key={index} borderWidth="1px" borderColor="var(--app-border)" borderRadius="md" p={3}>
            <Text fontWeight="500" fontSize="sm" overflowWrap="anywhere">{user ? `${user.firstname} ${user.lastname}` : `Utilisateur inconnu (${comment.user})`}</Text>
            <Text fontSize="xs" color="fg.muted"><time dateTime={comment.createdAt}>{Number.isNaN(date.getTime()) ? comment.createdAt : date.toLocaleString('fr-FR')}</time></Text>
            <Text mt={2} whiteSpace="pre-wrap" overflowWrap="anywhere">{comment.comment}</Text>
          </Box>
        })}
      </Stack>
      {!comments.length && <Text fontSize="sm" color="fg.muted" mb={3}>Aucun commentaire.</Text>}
      <form onSubmit={publish}>
        <Field.Root mb={3} disabled={disabled || !users.length}>
          <Field.Label htmlFor="comment-author">Auteur</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field id="comment-author" value={author} onChange={(event) => setAuthor(event.target.value)}>
              <option value="">Choisir un utilisateur</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>)}
            </NativeSelect.Field><NativeSelect.Indicator />
          </NativeSelect.Root>
          <Field.HelperText>Choisissez votre nom avant de saisir le commentaire.</Field.HelperText>
        </Field.Root>
        <Field.Root>
          <Field.Label htmlFor="comment-text">Commentaire</Field.Label>
          <Textarea id="comment-text" rows={3} value={text} disabled={disabled || !validAuthor} onChange={(event) => setText(event.target.value)} bg="var(--app-surface)" />
        </Field.Root>
        <Button type="submit" size="sm" mt={3} disabled={disabled || !validAuthor || !text.trim()}>Publier</Button>
        {!users.length && <Text fontSize="sm" color="fg.muted" mt={2}>Aucun auteur disponible.</Text>}
        {error && <Text role="alert" color="fg.error" fontSize="sm" mt={2}>{error}</Text>}
      </form>
    </Box>
  )
}
