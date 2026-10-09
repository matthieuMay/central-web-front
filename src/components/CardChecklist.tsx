import { useState, type FormEvent } from 'react'
import { Button, Input, Stack, Text } from '@chakra-ui/react'
import type { ChecklistItem } from '../types/board'

type CardChecklistProps = {
  items: ChecklistItem[];
  disabled?: boolean;
  onAddItem: (description: string) => Promise<boolean>;
  onToggleItem: (index: number) => Promise<boolean>;
};

export function CardChecklist({ items, disabled = false, onAddItem, onToggleItem }: CardChecklistProps) {
  const [description, setDescription] = useState('')

  async function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextDescription = description.trim()
    if (!nextDescription) return
    if (await onAddItem(nextDescription)) setDescription('')
  }

  return (
    <Stack gap={2}>
      {items.length === 0 && <Text color="var(--app-muted-text)" fontSize="sm">No checklist items yet</Text>}
      {items.map((item, index) => (
        <label key={`${item.description}-${index}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem' }}>
          <input
            type="checkbox"
            checked={item.done}
            disabled={disabled}
            onChange={() => { void onToggleItem(index) }}
          />
          <span style={{ textDecoration: item.done ? 'line-through' : undefined }}>{item.description}</span>
        </label>
      ))}
      <form onSubmit={(event) => { void submitItem(event) }}>
        <Stack direction="row" gap={2}>
          <Input
            aria-label="New checklist item"
            placeholder="Add a task"
            size="sm"
            value={description}
            disabled={disabled}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
          <Button type="submit" size="xs" disabled={disabled || !description.trim()}>
            Add
          </Button>
        </Stack>
      </form>
    </Stack>
  )
}