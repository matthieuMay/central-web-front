import { Box, Button, Drawer, Field, Input, Portal, Text, Textarea } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { getUsers, usersKey } from '../api/board'
import type { CardCollectionsAction } from '../api/cardCollections'
import { useBoardWriteStatus, useUpdateCardCollections, useEditCard } from '../api/mutations'
import type { CardData } from '../types/board'
import { editElementId } from './cardIds'
import { CardMembers } from './CardMembers'
import { CardComments } from './CardComments'
import { CardChecklist } from './CardChecklist'

type Fields = { title: string; description: string }

function EditForm({ card, onClose }: { card: CardData; onClose: () => void }) {
  const edit = useEditCard()
  const collections = useUpdateCardCollections()
  const status = useBoardWriteStatus()
  const users = useQuery({ queryKey: usersKey, queryFn: getUsers, staleTime: 60_000, retry: false })
  const [announcement, setAnnouncement] = useState('')
  const disabled = status.busy || status.blocked
  async function update(action: CardCollectionsAction) {
    setAnnouncement('Enregistrement en cours…')
    try {
      const result = await collections.mutateAsync({ cardId: card.id, action })
      setAnnouncement(result.reconciliationError ?? 'Action enregistrée.')
    } catch (error) {
      setAnnouncement('')
      throw error
    }
  }
  async function refresh() {
    if (await status.refresh()) setAnnouncement('Tableau actualisé. Vérifiez les dernières actions avant un nouvel essai.')
  }
  const [initial] = useState(() => ({ title: card.title, description: card.description ?? '' }))
  const { register, handleSubmit, reset, trigger, formState: { errors, isValid } } = useForm<Fields>({
    mode: 'onChange',
    defaultValues: initial,
  })

  useEffect(() => {
    reset(initial)
    void trigger()
    // The form mounts afresh on every opening or card change. A background
    // refetch of this same card must not discard unsaved edits or a failed save.
  }, [initial, reset, trigger])

  async function submit(values: Fields) {
    if (disabled) return
    try {
      await edit.mutateAsync({ cardId: card.id, title: values.title.trim(), description: values.description || null })
      onClose()
    } catch {
      // Keep the form and its values in place so the user can retry.
    }
  }

  return (
    <Box display="flex" flexDirection="column" flex="1" minH={0}>
      <Drawer.Header borderBottomWidth="1px" borderColor="var(--app-border)"><Drawer.Title>Modifier la carte</Drawer.Title></Drawer.Header>
      <Drawer.Body overflowY="auto">
        <Text fontSize="sm" color="fg.muted" mb={4}>Membres, commentaires et tâches sont enregistrés immédiatement. Enregistrer concerne uniquement le titre et la description.</Text>
        <Text role="status" aria-live="polite" fontSize="sm" mb={3}>{status.busy ? 'Enregistrement ou actualisation en cours…' : announcement}</Text>
        {status.recovery && <Box role="alert" mb={4}><Text color="fg.error">{status.recovery}</Text><Button size="sm" mt={2} disabled={status.busy} onClick={() => void refresh()}>Actualiser</Button></Box>}
        <form id="edit-card-form" onSubmit={handleSubmit(submit)} noValidate>
          <Field.Root invalid={!!errors.title} mb={4}>
            <Field.Label htmlFor="edit-title">Titre</Field.Label>
            <Input id="edit-title" data-autofocus bg="var(--app-surface)" disabled={disabled} aria-invalid={!!errors.title} {...register('title', { validate: (value) => !!value.trim() || 'Le titre est obligatoire' })} />
            {errors.title && <Field.ErrorText role="alert">{errors.title.message}</Field.ErrorText>}
          </Field.Root>
          <Field.Root>
            <Field.Label htmlFor="edit-description">Description <Text as="span" color="fg.muted" fontWeight="400">(facultative)</Text></Field.Label>
            <Textarea id="edit-description" rows={5} bg="var(--app-surface)" disabled={disabled} {...register('description')} />
          </Field.Root>
          {edit.isError && <Text role="alert" color="fg.error" mt={3}>Enregistrement impossible : {edit.error.message}. Vérifiez votre connexion et réessayez.</Text>}
        </form>
        {users.isPending && <Text role="status" mt={4}>Chargement des utilisateurs…</Text>}
        {users.isError && <Box role="alert" mt={4}><Text color="fg.error">Catalogue des utilisateurs indisponible.</Text><Button size="sm" mt={2} disabled={users.isFetching} onClick={() => void users.refetch()}>Réessayer</Button></Box>}
        <CardMembers assignees={card.assignees} users={users.isError ? [] : users.data ?? []} disabled={disabled || users.isPending} onChange={(userId, assigned) => update({ type: 'set-assignee', userId, assigned })} />
        <CardComments comments={card.comments} users={users.isError ? [] : users.data ?? []} disabled={disabled || users.isPending} onPublish={(comment) => update({ type: 'add-comment', comment })} />
        <CardChecklist items={card.checklistItems} disabled={disabled} onAdd={(description) => update({ type: 'add-checklist-item', description })} onSetDone={(index, item, done) => update({ type: 'set-checklist-done', index, item, done })} />
      </Drawer.Body>
      <Drawer.Footer borderTopWidth="1px" borderColor="var(--app-border)">
        <Button type="button" variant="outline" disabled={status.busy} onClick={onClose}>Fermer</Button>
        <Button type="submit" form="edit-card-form" colorPalette="blue" disabled={!isValid || disabled} loading={edit.isPending} loadingText="Enregistrement…">Enregistrer</Button>
      </Drawer.Footer>
    </Box>
  )
}

export function EditCardDrawer({ card, onClose }: { card: CardData | null; onClose: () => void }) {
  const lastEditedId = useRef<string | null>(null)
  useEffect(() => { if (card) lastEditedId.current = card.id }, [card])
  return (
    <Drawer.Root open={!!card} onOpenChange={({ open }) => { if (!open) onClose() }} finalFocusEl={() => lastEditedId.current ? document.getElementById(editElementId(lastEditedId.current)) : null}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="var(--app-canvas)" colorPalette="blue">
            {card && <EditForm key={card.id} card={card} onClose={onClose} />}
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
