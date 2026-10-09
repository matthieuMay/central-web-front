import { Box, Button, Flex, Heading, IconButton, Stack, Text, Textarea } from '@chakra-ui/react'
import { useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react'
import { v7 as uuidv7 } from 'uuid'
import { formatSize, MAX_FILE_SIZE, saveFile } from '../collab/files'
import { useCurrentMemberId } from '../collab/storage'
import type { CommentData } from '../types/board'
import { Attachment } from './Attachment'
import { MemberName } from './Members'

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })

type Pending = { id: string; file: File }

type CommentsProps = { comments: CommentData[]; onAdd: (comment: CommentData) => void }

export function Comments({ comments, onAdd }: CommentsProps) {
  const currentMemberId = useCurrentMemberId()
  const [text, setText] = useState('')
  const [pending, setPending] = useState<Pending[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [sending, setSending] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  // A file dropped beside the drop zone would make the browser open it and leave the app.
  useEffect(() => {
    const block = (event: globalThis.DragEvent) => {
      if (event.dataTransfer?.types.includes('Files')) event.preventDefault()
    }
    window.addEventListener('dragover', block)
    window.addEventListener('drop', block)
    return () => {
      window.removeEventListener('dragover', block)
      window.removeEventListener('drop', block)
    }
  }, [])

  const sorted = [...comments].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const canSend = !!currentMemberId && !sending && (!!text.trim() || pending.length > 0)

  function addFiles(files: FileList | null) {
    if (!files) return
    const all = [...files]
    const tooBig = all.filter((file) => file.size > MAX_FILE_SIZE)
    setError(tooBig.length ? `Trop volumineux (10 Mo maximum) : ${tooBig.map((file) => file.name).join(', ')}` : null)
    setPending((current) => [...current, ...all.filter((file) => file.size <= MAX_FILE_SIZE).map((file) => ({ id: uuidv7(), file }))])
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSend || !currentMemberId) return
    setSending(true)
    try {
      await Promise.all(pending.map(({ id, file }) => saveFile(id, file)))
      const attachments = pending.map(({ id, file }) => ({ id, name: file.name, type: file.type, size: file.size }))
      onAdd({ id: uuidv7(), authorId: currentMemberId, text: text.trim(), createdAt: new Date().toISOString(), ...(attachments.length ? { attachments } : {}) })
      setText('')
      setPending([])
      setError(null)
    } catch {
      setError('Impossible d’enregistrer les fichiers dans ce navigateur. Réessayez.')
    } finally {
      setSending(false)
    }
  }

  function onDragOver(event: DragEvent) {
    if (!currentMemberId || !event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    setDragging(true)
  }

  function onDragLeave(event: DragEvent) {
    // Moving between children also fires dragleave: only react when leaving the zone.
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
  }

  function onDrop(event: DragEvent) {
    if (!currentMemberId) return
    event.preventDefault()
    setDragging(false)
    addFiles(event.dataTransfer.files)
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
            {comment.text && <Text fontSize="sm" mt={1} whiteSpace="pre-wrap">{comment.text}</Text>}
            {comment.attachments?.length ? (
              <Stack gap={2} mt={2}>
                {comment.attachments.map((attachment) => <Attachment key={attachment.id} attachment={attachment} />)}
              </Stack>
            ) : null}
          </Box>
        ))}
      </Stack>
      <Box
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        borderRadius="md" outline={dragging ? '2px dashed' : undefined} outlineColor="border.info" outlineOffset="4px"
      >
        <form onSubmit={submit}>
          <label htmlFor="new-comment"><Text as="span" fontSize="sm">Nouveau commentaire</Text></label>
          <Textarea id="new-comment" rows={3} value={text} onChange={(event) => setText(event.target.value)} disabled={!currentMemberId}
            placeholder={currentMemberId ? 'Écrivez un commentaire ou déposez des fichiers ici' : undefined} />
          {pending.length > 0 && (
            <Flex as="ul" gap={2} wrap="wrap" mt={2} listStyleType="none" aria-label="Fichiers à envoyer">
              {pending.map(({ id, file }) => (
                <Flex as="li" key={id} align="center" gap={1} borderWidth="1px" borderColor="border" borderRadius="full" ps={3} pe={1} fontSize="xs">
                  📎 {file.name} ({formatSize(file.size)})
                  <IconButton type="button" size="2xs" variant="ghost" m={0} aria-label={`Retirer ${file.name}`}
                    onClick={() => setPending((current) => current.filter((item) => item.id !== id))}>✕</IconButton>
                </Flex>
              ))}
            </Flex>
          )}
          {error && <Text role="alert" fontSize="xs" color="red.fg" mt={1}>{error}</Text>}
          {!currentMemberId && <Text fontSize="xs" color="fg.muted" mt={1}>Choisissez qui vous êtes (page d’accueil ou en-tête) pour commenter.</Text>}
          <input ref={fileInput} type="file" multiple hidden onChange={(event) => { addFiles(event.target.files); event.target.value = '' }} />
          <Flex gap={2} align="center" mt={2}>
            <IconButton type="button" size="sm" variant="outline" m={0} aria-label="Joindre des fichiers" disabled={!currentMemberId || sending} onClick={() => fileInput.current?.click()}>📎</IconButton>
            <Button type="submit" size="sm" m={0} disabled={!canSend}>{sending ? 'Envoi…' : 'Envoyer'}</Button>
          </Flex>
        </form>
      </Box>
    </Box>
  )
}
