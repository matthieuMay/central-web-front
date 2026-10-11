import { Button, Dialog, Field, Input, Portal, Text, Textarea } from '@chakra-ui/react'
import { useRef, type FormEvent, type RefObject } from 'react'

type AddCardPopupProps = {
  open: boolean
  columnTitle: string
  title: string
  description: string
  pending: boolean
  error: string | null
  triggerRef: RefObject<HTMLButtonElement | null>
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onClose: () => void
}

export function AddCardPopup({ open, columnTitle, title, description, pending, error, triggerRef, onTitleChange, onDescriptionChange, onSubmit, onClose }: AddCardPopupProps) {
  const titleRef = useRef<HTMLInputElement>(null)

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: nextOpen }) => { if (!nextOpen) onClose() }}
      initialFocusEl={() => titleRef.current}
      finalFocusEl={() => triggerRef.current}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>New card title in {columnTitle}</Dialog.Title>
            </Dialog.Header>
            <form onSubmit={onSubmit}>
              <Dialog.Body>
                <Field.Root required>
                  <Field.Label>Title</Field.Label>
                  <Input ref={titleRef} value={title} onChange={(event) => onTitleChange(event.target.value)} required />
                </Field.Root>
                <Field.Root mt={4}>
                  <Field.Label>Description</Field.Label>
                  <Textarea value={description} onChange={(event) => onDescriptionChange(event.target.value)} />
                </Field.Root>
                {pending && <Text role="status" mt={3}>Adding card…</Text>}
                {error && <Text role="alert" mt={3} color="red.700">{error}</Text>}
              </Dialog.Body>
              <Dialog.Footer>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" bg="blue.100" color="blue.800" _hover={{ bg: 'blue.200' }} _dark={{ bg: 'blue.800', color: 'blue.100', _hover: { bg: 'blue.700' } }} disabled={pending || !title.trim()}>Add Card</Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}