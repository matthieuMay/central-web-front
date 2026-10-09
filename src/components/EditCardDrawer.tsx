import { Button, Drawer, Field, Input, Portal, Text, Textarea } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useEditCard } from '../api/mutations'
import type { CardData } from '../types/board'
import { editElementId } from './cardIds'

type Fields = { title: string; description: string }

// Responsibility: edit a card's title and description in an isolated form.
// Props provide the selected card and close callback; the mutation owns
// persistence and errors, while this form owns validation and unsaved values.
// Actions: submit validates and saves, Cancel closes without saving, and a
// successful save closes the drawer.
// Needs: card activity must be readable and a comment publish action must
// use an author chosen in the interface.
// Correctness: blank titles are rejected, failed saves preserve input, and
// successful saves return focus to the card's edit control.
function EditForm({ card, onClose }: { card: CardData; onClose: () => void }) {
  const edit = useEditCard()
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
        {edit.isError && <Text role="alert" color="red.700" mt={3}>Could not save card: {edit.error.message}. Check your connection and try Save again.</Text>}
      </Drawer.Body>
      <Drawer.Footer>
        <Button type="button" variant="outline" disabled={edit.isPending} onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={!isValid || edit.isPending}>Save</Button>
      </Drawer.Footer>
    </form>
  )
}

// Responsibility: manage the drawer shell for the currently edited Card.
// Props provide the optional Card and close callback; EditForm owns the form
// data and the mutation owns persistence.
// Correctness: the drawer opens only for a Card, closes on dismissal, and
// returns focus to that Card's edit control.
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
