import { Box, Button, Heading, Stack, Text, Textarea } from '@chakra-ui/react'
import { useState, type FormEvent } from 'react'
import { v7 as uuidv7 } from 'uuid'
import { useCurrentMemberId } from '../collab/storage'
import type { CommentData } from '../types/board'
import { MemberName } from './Members'

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })

type CommentsProps = { comments: CommentData[]; onAdd: (comment: CommentData) => void }

export function Comments({ comments, onAdd }: CommentsProps) {
  const currentMemberId = useCurrentMemberId()
  const [text, setText] = useState('')
  const sorted = [...comments].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || !currentMemberId) return
    onAdd({ id: uuidv7(), authorId: currentMemberId, text: trimmed, createdAt: new Date().toISOString() })
    setText('')
  }

  return (
    <Box as="section" aria-labelledby="comments-heading">
      <Heading as="h3" size="sm" id="comments-heading" mb={3}>Commentaires</Heading>
      <Stack as="ol" gap={3} listStyleType="none" mb={4}>
        {sorted.length === 0 && <Text as="li" color="fg.muted" fontSize="sm">Aucun commentaire</Text>}
        {sorted.map((comment) => (
          <Box as="li" key={comment.id} borderWidth="1px" borderColor="border" borderRadius="md" p={3}>
            <Text fontSize="xs" color="fg.muted">
              <MemberName memberId={comment.authorId} /> · <time dateTime={comment.createdAt}>{dateFormat.format(new Date(comment.createdAt))}</time>
            </Text>
            <Text fontSize="sm" mt={1} whiteSpace="pre-wrap">{comment.text}</Text>
          </Box>
        ))}
      </Stack>
      <form onSubmit={submit}>
        <label htmlFor="new-comment"><Text as="span" fontSize="sm">Nouveau commentaire</Text></label>
        <Textarea id="new-comment" rows={3} value={text} onChange={(event) => setText(event.target.value)} disabled={!currentMemberId} />
        {!currentMemberId && <Text fontSize="xs" color="fg.muted" mt={1}>Choisissez qui vous êtes (page d’accueil ou en-tête) pour commenter.</Text>}
        <Button type="submit" size="sm" mt={2} disabled={!currentMemberId || !text.trim()}>Envoyer</Button>
      </form>
    </Box>
  )
}
