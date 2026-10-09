import { Box, Button, Drawer, Field, Input, Portal, Text, Textarea } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useEditCard } from '../api/mutations'
import type { CardData } from '../types/board'
import { editElementId } from './cardIds'

type Fields = { title: string; description: string }

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
    <Box asChild display="flex" flexDirection="column" flex="1" minH={0}>
    <form onSubmit={handleSubmit(submit)} noValidate>
      <Drawer.Header borderBottomWidth="1px" borderColor="var(--app-border)"><Drawer.Title>Modifier la carte</Drawer.Title></Drawer.Header>
      <Drawer.Body>
        <Field.Root invalid={!!errors.title} mb={4}>
          <Field.Label htmlFor="edit-title">Titre</Field.Label>
          <Input id="edit-title" data-autofocus bg="var(--app-surface)" disabled={edit.isPending} aria-invalid={!!errors.title} {...register('title', { validate: (value) => !!value.trim() || 'Le titre est obligatoire' })} />
          {errors.title && <Field.ErrorText role="alert">{errors.title.message}</Field.ErrorText>}
        </Field.Root>
        <Field.Root>
          <Field.Label htmlFor="edit-description">Description <Text as="span" color="fg.muted" fontWeight="400">(facultative)</Text></Field.Label>
          <Textarea id="edit-description" rows={5} bg="var(--app-surface)" disabled={edit.isPending} {...register('description')} />
        </Field.Root>
        {edit.isError && <Text role="alert" color="fg.error" mt={3}>Enregistrement impossible : {edit.error.message}. Vérifiez votre connexion et réessayez.</Text>}
      </Drawer.Body>
      <Drawer.Footer borderTopWidth="1px" borderColor="var(--app-border)">
        <Button type="button" variant="outline" disabled={edit.isPending} onClick={onClose}>Annuler</Button>
        <Button type="submit" colorPalette="blue" disabled={!isValid || edit.isPending} loading={edit.isPending} loadingText="Enregistrement…">Enregistrer</Button>
      </Drawer.Footer>
    </form>
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
