import { Button, Drawer, Field, Input, Portal, Text, Textarea } from '@chakra-ui/react'
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
  const [isAddingUsers, setIsAddingUsers] = useState(false)
  const [usersToAdd, setUsersToAdd] = useState<string[]>([])
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

  function addUsers() {
    const availableUsers = new Map((users.data ?? []).map((user) => [user.id, user]))
    const addedUsers = usersToAdd
      .map((userId) => availableUsers.get(userId))
      .filter((user): user is UserData => user !== undefined)
    setAssignedUsers((current) => [...current, ...addedUsers.filter((user) => !current.some((assigned) => assigned.id === user.id))])
    setUsersToAdd([])
    setIsAddingUsers(false)
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
          {!isAddingUsers && <Button type="button" size="sm" variant="outline" mt={2} disabled={users.isPending || users.isError || (users.data?.length ?? 0) === assignedUsers.length} onClick={() => setIsAddingUsers(true)}>Ajouter des assignés</Button>}
          {isAddingUsers && (
            <div>
              <select id="edit-add-assignees" multiple size={Math.min(Math.max((users.data?.length ?? 1) - assignedUsers.length, 3), 8)} value={usersToAdd} onChange={(event) => setUsersToAdd(Array.from(event.target.selectedOptions, (option) => option.value))} aria-describedby="edit-add-assignees-help">
                {(users.data ?? []).filter((user) => !assignedUsers.some((assigned) => assigned.id === user.id)).map((user) => (
                  <option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>
                ))}
              </select>
              <Text id="edit-add-assignees-help" color="fg.muted" fontSize="sm">Sélectionnez un ou plusieurs utilisateurs.</Text>
              <Button type="button" size="sm" mt={2} mr={2} disabled={usersToAdd.length === 0} onClick={addUsers}>Ajouter</Button>
              <Button type="button" size="sm" variant="outline" mt={2} onClick={() => { setUsersToAdd([]); setIsAddingUsers(false) }}>Annuler</Button>
            </div>
          )}
          {users.isPending && <Text role="status">Loading users…</Text>}
          {users.isError && <Text role="alert" color="red.700">Could not load users: {users.error.message}. Try again.</Text>}
        </Field.Root>
        {edit.isError && <Text role="alert" color="red.700" mt={3}>Could not save card: {edit.error.message}. Check your connection and try Save again.</Text>}
      </Drawer.Body>
      <Drawer.Footer>
        <Button type="button" variant="outline" disabled={edit.isPending} onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={!isValid || edit.isPending || users.isPending || users.isError}>Save</Button>
      </Drawer.Footer>
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
