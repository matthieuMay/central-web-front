import { Button, Dialog, Field, Portal, Stack, Text, Textarea } from '@chakra-ui/react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUsers, usersKey } from '../api/board'
import { useUpdateCardComments } from '../api/mutations'
import { sortCommentsNewestFirst } from '../domain/comments'
import type { CardData } from '../types/board'

type CommentsDialogProps = { card: CardData; onClose: () => void }

export function CommentsDialog({ card, onClose }: CommentsDialogProps) {
  const users = useQuery({ queryKey: usersKey, queryFn: getUsers })
  const update = useUpdateCardComments()
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const comments = card.comments ?? []
  const sortedComments = sortCommentsNewestFirst(comments)
  const selectedAuthor = author || users.data?.[0]?.id || ''

  function submit() {
    const trimmed = text.trim()
    if (!selectedAuthor || !trimmed || update.isPending) return
    update.mutate({ cardId: card.id, comments: [...comments, { user: selectedAuthor, comment: trimmed }] }, {
      onSuccess: () => setText(''),
    })
  }

  return (
    <Dialog.Root open onOpenChange={({ open }) => { if (!open) onClose() }} size="lg">
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header><Dialog.Title>Commentaires — {card.title}</Dialog.Title></Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                {sortedComments.length === 0 && <Text color="fg.muted">Aucun commentaire.</Text>}
                {sortedComments.map((comment, index) => {
                  const user = users.data?.find((candidate) => candidate.id === comment.user)
                  return (
                  <Stack key={`${comment.createdAt}-${index}`} gap={1} borderBottomWidth="1px" borderColor="border" pb={3}>
                    <Text fontWeight="bold">{user ? `${user.firstname} ${user.lastname}` : comment.user}</Text>
                    <Text fontSize="sm" color="fg.muted">{comment.createdAt}</Text>
                    <Text>{comment.comment}</Text>
                  </Stack>
                  )
                })}
                <Field.Root>
                  <Field.Label htmlFor={`comment-author-${card.id}`}>Auteur</Field.Label>
                  <select id={`comment-author-${card.id}`} value={selectedAuthor} onChange={(event) => setAuthor(event.target.value)} disabled={users.isPending || users.isError}>
                    <option value="">Sélectionner un utilisateur</option>
                    {(users.data ?? []).map((user) => <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>)}
                  </select>
                </Field.Root>
                <Field.Root>
                  <Field.Label htmlFor={`comment-text-${card.id}`}>Commentaire</Field.Label>
                  <Textarea id={`comment-text-${card.id}`} value={text} onChange={(event) => setText(event.target.value)} />
                </Field.Root>
                {users.isPending && <Text role="status">Chargement des utilisateurs…</Text>}
                {users.isError && <Text role="alert">Impossible de charger les utilisateurs : {users.error.message}</Text>}
                {update.isError && <Text role="alert">Impossible d’ajouter le commentaire : {update.error.message}</Text>}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={onClose}>Fermer</Button>
              <Button onClick={submit} disabled={!selectedAuthor || !text.trim() || update.isPending || users.isPending || users.isError}>Commenter</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
