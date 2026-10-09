import { Button, Dialog, Drawer, Field, Input, Portal, Text, Textarea } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { getUsers, usersKey } from '../api/board'
import { useEditCard } from '../api/mutations'
import type { CardData, UserData } from '../types/board'
import { editElementId } from './cardIds'

type Fields = { title: string; description: string }

function EditForm({ card, onClose }: { card: CardData; onClose: () => void }) {
  const edit = useEditCard()
  const users = useQuery({ queryKey: usersKey, queryFn: getUsers })
  const [assignedUsers, setAssignedUsers] = useState<UserData[]>(() => (card.assignees ?? []).filter((user): user is UserData => typeof user !== 'string'))
  const [isAssigneeDialogOpen, setIsAssigneeDialogOpen] = useState(false)
  const [draftAssignedUsers, setDraftAssignedUsers] = useState<UserData[]>([])
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

  useEffect(() => {
    if (!users.data || !card.assignees?.some((assignee) => typeof assignee === 'string')) return
    const assignedIds = new Set(card.assignees.filter((assignee): assignee is string => typeof assignee === 'string'))
    setAssignedUsers(users.data.filter((user) => assignedIds.has(user.id)))
  }, [card.assignees, users.data])

  function removeUser(userId: string) {
    setAssignedUsers((current) => current.filter((user) => user.id !== userId))
  }

  function openAssigneeDialog() {
    setDraftAssignedUsers(assignedUsers)
    setIsAssigneeDialogOpen(true)
  }

  function switchAssignee(user: UserData) {
    setDraftAssignedUsers((current) => current.some((assigned) => assigned.id === user.id)
      ? current.filter((assigned) => assigned.id !== user.id)
      : [...current, user])
  }

  function confirmAssignees() {
    setAssignedUsers(draftAssignedUsers)
    setIsAssigneeDialogOpen(false)
  }

  async function submit(values: Fields) {
    try {
      await edit.mutateAsync({ cardId: card.id, title: values.title.trim(), description: values.description || null, assignees: assignedUsers.map((user) => user.id), assignedUsers })
      onClose()
    } catch {
      // Keep the form and its values in place so the user can retry.
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <Drawer.Header><Drawer.Title>Edit card</Drawer.Title></Drawer.Header>
      <Drawer.Body>
        <Field.Root invalid={!!errors.title} mb={4}>
          <Field.Label htmlFor="edit-title">Title</Field.Label>
          <Input id="edit-title" data-autofocus aria-invalid={!!errors.title} {...register('title', { validate: (value) => !!value.trim() || 'Title is required' })} />
          {errors.title && <Field.ErrorText role="alert">{errors.title.message}</Field.ErrorText>}
        </Field.Root>
        <Field.Root>
          <Field.Label htmlFor="edit-description">Description (optional)</Field.Label>
          <Textarea id="edit-description" rows={5} {...register('description')} />
        </Field.Root>
        <Field.Root mt={4}>
          <Field.Label>Assignés</Field.Label>
          {assignedUsers.length === 0 && <Text color="fg.muted">Aucun assigné</Text>}
          {assignedUsers.map((user) => (
            <div key={user.id}>
              <span>{user.firstname} {user.lastname}</span>
              <Button type="button" size="xs" variant="outline" ml={2} onClick={() => removeUser(user.id)}>Enlever</Button>
            </div>
          ))}
          <Button type="button" size="sm" variant="outline" mt={2} disabled={users.isPending || users.isError || (users.data?.length ?? 0) === assignedUsers.length} onClick={openAssigneeDialog}>Ajouter des assignés</Button>
          {users.isPending && <Text role="status">Loading users…</Text>}
          {users.isError && <Text role="alert" color="red.700">Could not load users: {users.error.message}. Try again.</Text>}
        </Field.Root>
        {edit.isError && <Text role="alert" color="red.700" mt={3}>Could not save card: {edit.error.message}. Check your connection and try Save again.</Text>}
      </Drawer.Body>
      <Drawer.Footer>
        <Button type="button" variant="outline" disabled={edit.isPending} onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={!isValid || edit.isPending || users.isPending || users.isError}>Save</Button>
      </Drawer.Footer>
      <Dialog.Root open={isAssigneeDialogOpen} onOpenChange={({ open }) => setIsAssigneeDialogOpen(open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header><Dialog.Title>Gérer les assignés</Dialog.Title></Dialog.Header>
              <Dialog.Body>
                <Text fontSize="sm" mb={2}>Cliquez sur un utilisateur pour le déplacer d’une liste à l’autre.</Text>
                <div className="assignee-transfer">
                  <Field.Root>
                    <Field.Label htmlFor="available-assignees">Disponibles</Field.Label>
                    <div id="available-assignees" role="listbox" aria-label="Utilisateurs disponibles">
                      {(users.data ?? []).filter((user) => !draftAssignedUsers.some((assigned) => assigned.id === user.id)).map((user) => (
                        <button key={user.id} type="button" role="option" aria-selected="false" onClick={() => switchAssignee(user)}>{user.firstname} {user.lastname}</button>
                      ))}
                    </div>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label htmlFor="assigned-assignees">Assignés</Field.Label>
                    <div id="assigned-assignees" role="listbox" aria-label="Utilisateurs assignés">
                      {draftAssignedUsers.map((user) => (
                        <button key={user.id} type="button" role="option" aria-selected="true" onClick={() => switchAssignee(user)}>{user.firstname} {user.lastname}</button>
                      ))}
                    </div>
                  </Field.Root>
                </div>
              </Dialog.Body>
              <Dialog.Footer>
                <Button type="button" variant="outline" onClick={() => setIsAssigneeDialogOpen(false)}>Annuler</Button>
                <Button type="button" onClick={confirmAssignees}>Valider</Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </form>
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
          <Drawer.Content>
            {card && <EditForm key={card.id} card={card} onClose={onClose} />}
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
