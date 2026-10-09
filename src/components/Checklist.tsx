import { useState } from 'react'
import { Button, Checkbox, HStack, Input, Stack, Text } from '@chakra-ui/react'
import type { ChecklistItemData } from '../types/board'

/**
 * Checklist — section « Tâches à cocher » d'une carte.
 *
 * Responsabilité : lister les tâches, en ajouter une, la cocher puis la
 * décocher. Composant de présentation. Les items n'ont pas d'id fourni par
 * l'API : leur identité est leur index dans la liste.
 *
 * Props :
 * - items : ChecklistItemData[] — tâches de la carte.
 * - onChange : (items: ChecklistItemData[]) => void — remonte la liste complète.
 *
 * Action déclenchée : ajouter une tâche, basculer `done` → `onChange`.
 *
 * Cas à vérifier :
 * - Ajouter une tâche conserve les tâches existantes.
 * - Cocher/décocher ne modifie que la tâche visée.
 * - Une description vide n'est pas ajoutée.
 */
type ChecklistProps = {
  items: ChecklistItemData[]
  onChange: (items: ChecklistItemData[]) => void
}

export function Checklist({ items, onChange }: ChecklistProps) {
  const [description, setDescription] = useState('')

  function add() {
    const trimmed = description.trim()
    if (!trimmed) return
    onChange([...items, { description: trimmed, done: false }])
    setDescription('')
  }

  function toggle(index: number, done: boolean) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? { ...item, done } : item)))
  }

  return (
    <Stack gap={3}>
      <Text fontWeight="medium">Checklist</Text>
      {items.length === 0 ? (
        <Text color="fg.muted" fontSize="sm">
          No tasks yet
        </Text>
      ) : (
        <Stack gap={1}>
          {items.map((item, index) => (
            <Checkbox.Root
              key={index}
              checked={item.done}
              onCheckedChange={(details) => toggle(index, details.checked === true)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label textDecoration={item.done ? 'line-through' : undefined}>
                {item.description}
              </Checkbox.Label>
            </Checkbox.Root>
          ))}
        </Stack>
      )}
      <HStack gap={2}>
        <Input
          size="sm"
          value={description}
          placeholder="Add a task"
          aria-label="New task"
          onChange={(event) => setDescription(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
        />
        <Button size="sm" onClick={add} disabled={!description.trim()}>
          Add
        </Button>
      </HStack>
    </Stack>
  )
}
