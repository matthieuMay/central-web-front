import { Box, Button, Drawer, Field, Input, Portal, Text, Textarea } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useEditCard } from '../api/mutations'
import type { CardData, User } from '../types/board'
import { editElementId } from './cardIds'
import { CardAssignees } from './CardAssignees'
import { CardChecklist } from './CardChecklist'

type Fields = { title: string; description: string }

function EditForm({ card, onClose, users, usersLoading, usersError }: { card: CardData; onClose: () => void; users: User[]; usersLoading: boolean; usersError: string | null }) {
  const edit = useEditCard()
  const [checklistError, setChecklistError] = useState<string | null>(null)
  const [assigneeError, setAssigneeError] = useState<string | null>(null)
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
    try {
      await edit.mutateAsync({ cardId: card.id, title: values.title.trim(), description: values.description || null })
      onClose()
    } catch {
      // Keep the form and its values in place so the user can retry.
    }
  }

  async function saveChecklist(checklistItems: CardData['checklistItems']) {
    setChecklistError(null)
    try {
      await edit.mutateAsync({ cardId: card.id, checklistItems })
    } catch (error) {
      setChecklistError(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  async function saveAssignees(assignees: string[]) {
    setAssigneeError(null)
    try {
      await edit.mutateAsync({ cardId: card.id, assignees })
    } catch (error) {
      setAssigneeError(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
      <Drawer.Header><Drawer.Title>Edit card</Drawer.Title></Drawer.Header>
      <Drawer.Body overflowY="auto" minH={0}>
        <Box borderWidth="1px" borderColor="border" borderRadius="lg" overflow="hidden">
          <Box px={4} py={2} bg="bg.subtle" borderBottomWidth="1px" borderColor="border">
            <Text as="h3" fontSize="sm" fontWeight="bold">✎ Edit card</Text>
          </Box>
          <Box p={4}>
            <Field.Root invalid={!!errors.title} mb={4}>
              <Field.Label htmlFor="edit-title">Title</Field.Label>
              <Input id="edit-title" data-autofocus aria-invalid={!!errors.title} {...register('title', { validate: (value) => !!value.trim() || 'Title is required' })} />
              {errors.title && <Field.ErrorText role="alert">{errors.title.message}</Field.ErrorText>}
            </Field.Root>
            <Field.Root>
              <Field.Label htmlFor="edit-description">Description (optional)</Field.Label>
              <Textarea id="edit-description" rows={5} {...register('description')} />
            </Field.Root>
          </Box>
        </Box>
        <Box mt={4} borderWidth="1px" borderColor="border" borderRadius="lg" overflow="hidden">
          <Box px={4} py={2} bg="bg.subtle" borderBottomWidth="1px" borderColor="border">
            <Text as="h3" fontSize="sm" fontWeight="bold">👥 Assignees</Text>
          </Box>
          <Box p={4}>
            <CardAssignees
              variant="editor"
              showLabel={false}
              assigneeIds={card.assignees}
              users={users}
              onChange={(assignees) => { void saveAssignees(assignees) }}
              disabled={edit.isPending || usersLoading || !!usersError || users.length === 0}
              loading={usersLoading}
              error={usersError ?? (users.length === 0 ? 'No users are available to assign.' : assigneeError)}
              errorType={usersError || users.length === 0 ? 'load' : 'update'}
            />
          </Box>
        </Box>
        <Box mt={4} borderWidth="1px" borderColor="border" borderRadius="lg" overflow="hidden">
          <Box px={4} py={2} bg="bg.subtle" borderBottomWidth="1px" borderColor="border">
            <Text as="h3" fontSize="sm" fontWeight="bold">☑ Checklist</Text>
          </Box>
          <Box p={4}>
            <CardChecklist showLabel={false} items={card.checklistItems ?? []} onChange={(items) => { void saveChecklist(items) }} disabled={edit.isPending} />
            {checklistError && <Text role="alert" color="red.700" mt={3}>Could not save checklist: {checklistError}. Try again.</Text>}
          </Box>
        </Box>
        {edit.isError && <Text role="alert" color="red.700" mt={3}>Could not save card: {edit.error.message}. Check your connection and try Save again.</Text>}
      </Drawer.Body>
      <Drawer.Footer>
        <Button type="button" variant="outline" disabled={edit.isPending} onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={!isValid || edit.isPending}>Save</Button>
      </Drawer.Footer>
    </form>
  )
}

export function EditCardDrawer({ card, onClose, users, usersLoading, usersError }: { card: CardData | null; onClose: () => void; users: User[]; usersLoading: boolean; usersError: string | null }) {
  const lastEditedId = useRef<string | null>(null)
  useEffect(() => { if (card) lastEditedId.current = card.id }, [card])
  return (
    <Drawer.Root open={!!card} onOpenChange={({ open }) => { if (!open) onClose() }} finalFocusEl={() => lastEditedId.current ? document.getElementById(editElementId(lastEditedId.current)) : null}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            {card && <EditForm key={card.id} card={card} onClose={onClose} users={users} usersLoading={usersLoading} usersError={usersError} />}
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
