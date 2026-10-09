import { useState } from 'react'
import { Button, Checkbox, HStack, Input, Stack, Text } from '@chakra-ui/react'
import type { ChecklistItem } from '../types/board'

/**
 * CardChecklist — the Tâches à cocher section of a Card Detail.
 *
 * Responsibility: list a Card's Checklist Items and let the user create and
 * toggle them.
 * Props: { items: ChecklistItem[]; onAdd: (description: string) => void;
 *   onToggle: (index: number) => void }.
 * Events: onAdd appends a new description; onToggle flips the item at its
 *   index. Identity is the array index because the API gives items no id and
 *   only add + toggle are in scope (see `src/board/collections.ts`).
 * Data owner: none — the board query owns `checklistItems`; CardDetail sends
 *   the whole next array.
 * Correct when: adding appends without dropping or reordering existing items,
 *   and toggling flips exactly the addressed item.
 */
type CardChecklistProps = {
  items: ChecklistItem[]
  onAdd: (description: string) => void
  onToggle: (index: number) => void
}

export function CardChecklist({ items, onAdd, onToggle }: CardChecklistProps) {
  const [draft, setDraft] = useState('')

  function submit() {
    const description = draft.trim()
    if (!description) return
    onAdd(description)
    setDraft('')
  }

  return (
    <Stack gap={3}>
      {items.length === 0 && <Text color="fg.muted" fontSize="sm">Aucune tâche.</Text>}
      {items.map((item, index) => (
        <Checkbox.Root
          key={index}
          checked={item.done}
          onCheckedChange={() => onToggle(index)}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Label textDecoration={item.done ? 'line-through' : undefined}>
            {item.description}
          </Checkbox.Label>
        </Checkbox.Root>
      ))}
      <HStack>
        <Input
          size="sm"
          aria-label="Nouvelle tâche"
          placeholder="Nouvelle tâche"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              submit()
            }
          }}
        />
        <Button size="sm" onClick={submit}>Ajouter</Button>
      </HStack>
    </Stack>
  )
}
