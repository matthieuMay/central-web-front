import { Button, CloseButton, Dialog, Field, Flex, Input, Portal, Separator, Text, Textarea } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useEditCard } from '../api/mutations'
import { addComment, saveCard, useCardCollections } from '../collab/storage'
import type { CardData } from '../types/board'
import { editElementId } from './cardIds'
import { Comments } from './Comments'
import { MemberPicker } from './Members'
import { Subtasks } from './Subtasks'

type Fields = { title: string; description: string }

function EditForm({ card, onClose }: { card: CardData; onClose: () => void }) {
  const edit = useEditCard()
  const collections = useCardCollections(card.id)
  // Assignees are a draft until Save, like the title and description. Sub-tasks save at once.
  const [assignees, setAssignees] = useState(collections.assignees)
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
      saveCard(card.id, { assignees })
      onClose()
    } catch {
      // Keep the form and its values in place so the user can retry.
    }
  }

  return (
    <>
      <Dialog.Header><Dialog.Title>Modifier la carte</Dialog.Title></Dialog.Header>
      <Dialog.CloseTrigger asChild><CloseButton size="sm" aria-label="Fermer" /></Dialog.CloseTrigger>
      <Dialog.Body pb={6}>
        <form onSubmit={handleSubmit(submit)} noValidate>
          <Field.Root invalid={!!errors.title} mb={4}>
            <Field.Label htmlFor="edit-title">Titre</Field.Label>
            <Input id="edit-title" data-autofocus aria-invalid={!!errors.title} {...register('title', { validate: (value) => !!value.trim() || 'Le titre est obligatoire' })} />
            {errors.title && <Field.ErrorText role="alert">{errors.title.message}</Field.ErrorText>}
          </Field.Root>
          <Field.Root mb={4}>
            <Field.Label htmlFor="edit-description">Description (facultative)</Field.Label>
            <Textarea id="edit-description" rows={5} {...register('description')} />
          </Field.Root>
          <Field.Root>
            <Field.Label>Assigné à</Field.Label>
            <MemberPicker label="Membres assignés à la carte" value={assignees} onChange={setAssignees} />
          </Field.Root>
          {edit.isError && <Text role="alert" color="red.700" mt={3}>Impossible d’enregistrer la carte : {edit.error.message}. Vérifiez votre connexion puis réessayez.</Text>}
          <Flex gap={3} justify="flex-end" mt={6}>
            <Button type="button" variant="outline" disabled={edit.isPending} onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={!isValid || edit.isPending}>Enregistrer</Button>
          </Flex>
        </form>
        <Subtasks subtasks={collections.subtasks} onChange={(subtasks) => saveCard(card.id, { subtasks })} />
        <Separator my={6} />
        <Comments comments={collections.comments} onAdd={(comment) => addComment(card.id, comment)} />
      </Dialog.Body>
    </>
  )
}

export function CardDialog({ card, onClose }: { card: CardData | null; onClose: () => void }) {
  const lastEditedId = useRef<string | null>(null)
  useEffect(() => { if (card) lastEditedId.current = card.id }, [card])
  return (
    <Dialog.Root size="xl" placement="center" scrollBehavior="inside" open={!!card} onOpenChange={({ open }) => { if (!open) onClose() }} finalFocusEl={() => lastEditedId.current ? document.getElementById(editElementId(lastEditedId.current)) : null}>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.400" />
        <Dialog.Positioner>
          <Dialog.Content borderRadius="xl" maxH="85dvh">
            {card && <EditForm key={card.id} card={card} onClose={onClose} />}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
