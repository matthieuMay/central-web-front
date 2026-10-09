import { Box, Button, Checkbox, Field, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { useState, type FormEvent } from 'react'
import type { CardChecklistItem } from '../types/board'

export type CardChecklistProps = {
  items: CardChecklistItem[]
  disabled: boolean
  onAdd: (description: string) => Promise<void>
  onSetDone: (index: number, item: CardChecklistItem, done: boolean) => Promise<void>
}

export function CardChecklist({ items, disabled, onAdd, onSetDone }: CardChecklistProps) {
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  async function add(event: FormEvent) {
    event.preventDefault()
    if (disabled || !description.trim()) return
    setError('')
    try { await onAdd(description.trim()); setDescription('') } catch (failure) { setError(failure instanceof Error ? failure.message : 'Ajout impossible.') }
  }
  async function setDone(index: number, item: CardChecklistItem, done: boolean) {
    setError('')
    try { await onSetDone(index, item, done) } catch (failure) { setError(failure instanceof Error ? failure.message : 'Modification impossible.') }
  }
  return (
    <Box as="section" mt={6}>
      <Heading as="h3" size="sm" mb={3}>Tâches à cocher</Heading>
      {!items.length && <Text color="fg.muted" fontSize="sm" mb={3}>Aucune tâche.</Text>}
      <Stack gap={2} mb={4}>
        {items.map((item, index) => <Checkbox.Root key={index} checked={item.done} disabled={disabled} onCheckedChange={({ checked }) => void setDone(index, item, checked === true)}>
          {/* Rejected writes leave Root unchanged; resync Ark’s native input after every render. */}
            <Checkbox.HiddenInput ref={(input) => { if (input) input.checked = item.done }} /><Checkbox.Control /><Checkbox.Label overflowWrap="anywhere" textDecoration={item.done ? 'line-through' : undefined} color={item.done ? 'fg.muted' : undefined}>{item.description}</Checkbox.Label>
        </Checkbox.Root>)}
      </Stack>
      <form onSubmit={add}>
        <Field.Root>
          <Field.Label htmlFor="checklist-description">Nouvelle tâche</Field.Label>
          <Input id="checklist-description" value={description} disabled={disabled} onChange={(event) => setDescription(event.target.value)} bg="var(--app-surface)" />
        </Field.Root>
        <Button type="submit" size="sm" mt={3} disabled={disabled || !description.trim()}>Ajouter</Button>
        {error && <Text role="alert" color="fg.error" fontSize="sm" mt={2}>{error}</Text>}
      </form>
    </Box>
  )
}
