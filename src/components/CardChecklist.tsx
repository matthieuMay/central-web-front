import { Box, Button, Field, Input, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import type { ChecklistItem } from '../types/board'

export type CardChecklistProps = {
  items: ChecklistItem[]
  onChange?: (items: ChecklistItem[]) => void
  readOnly?: boolean
  allowToggle?: boolean
  disabled?: boolean
  showLabel?: boolean
}

export function CardChecklist({ items, onChange, readOnly = false, allowToggle = false, disabled = false, showLabel = true }: CardChecklistProps) {
  const [draft, setDraft] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingDraft, setEditingDraft] = useState('')

  function addItem() {
    const description = draft.trim()
    if (!description || !onChange) return
    onChange([...items, { description, done: false }])
    setDraft('')
  }

  function saveEdit(index: number) {
    const description = editingDraft.trim()
    if (!description || !onChange) return
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, description } : item))
    setEditingIndex(null)
  }

  return (
    <Box data-component="card-checklist" data-item-count={items.length} mt={4}>
      {showLabel && <Text fontWeight="semibold" fontSize="sm" mb={2}>Checklist</Text>}
      <Stack gap={2}>
        {items.map((item, index) => (
          <Box key={`${index}-${item.description}`} display="flex" alignItems="center" gap={2}>
            {allowToggle && <input type="checkbox" checked={item.done} disabled={disabled} aria-label={`${item.description}${item.done ? ', done' : ', not done'}`} onChange={() => onChange?.(items.map((current, itemIndex) => itemIndex === index ? { ...current, done: !current.done } : current))} />}
            {editingIndex === index && !readOnly
              ? <Input size="sm" value={editingDraft} onChange={(event) => setEditingDraft(event.target.value)} aria-label={`Edit checklist item ${index + 1}`} />
              : <Text flex="1" textDecoration={allowToggle && item.done ? 'line-through' : undefined}>{item.description}</Text>}
            {!readOnly && editingIndex === index
              ? <Button type="button" size="xs" disabled={disabled || !editingDraft.trim()} onClick={() => saveEdit(index)}>Save</Button>
              : !readOnly && <Button type="button" size="xs" variant="outline" disabled={disabled} onClick={() => { setEditingIndex(index); setEditingDraft(item.description) }}>Edit</Button>}
            {!readOnly && <Button type="button" size="xs" variant="outline" colorPalette="red" disabled={disabled} onClick={() => onChange?.(items.filter((_, itemIndex) => itemIndex !== index))}>Delete</Button>}
          </Box>
        ))}
      </Stack>
      {!readOnly && (
        <Field.Root mt={3}>
          <Field.Label htmlFor="new-checklist-item">Add checklist item</Field.Label>
          <Box display="flex" gap={2}>
            <Input id="new-checklist-item" size="sm" value={draft} disabled={disabled} onChange={(event) => setDraft(event.target.value)} />
            <Button type="button" size="sm" disabled={disabled || !draft.trim()} onClick={addItem}>Add</Button>
          </Box>
        </Field.Root>
      )}
    </Box>
  )
}
