import { Box, Button, Checkbox, Field, Heading, HStack, Input, Stack, Text } from '@chakra-ui/react'
import { useState, type FormEvent } from 'react'
import type { ChecklistItem } from '../types/board'

type CardChecklistProps = {
  items: ChecklistItem[]
  isSaving: boolean
  // Receives the NEW full list of tasks. Resolves to true once it is saved,
  // false if the API refused it.
  onChange: (items: ChecklistItem[]) => Promise<boolean>
}

/*
 * CardChecklist — the tasks to tick on this Card.
 *
 * Responsibility:
 *   - Shows each task with a checkbox (done / not done).
 *   - Lets the user add a task (description must not be blank, it is trimmed).
 *   - Lets the user check and uncheck a task.
 *
 * Action: calls onChange with the complete new list. Tasks have no id: a task is
 * identified by its index, and only that index changes.
 * It clears the new task field only when onChange resolves to true; on false the
 * text stays, so the user can retry.
 * Who holds the data: CardDetails / the Board from the API.
 *
 * Cases to check:
 *   - Adding a task keeps the existing ones, in the same order.
 *   - Checking or unchecking one task does not change its neighbours.
 *   - No tasks yet: show "No tasks" and the add field still works.
 *   - Controls are disabled while isSaving.
 *   - A refused add keeps the typed text in the field.
 */
export function CardChecklist(props: CardChecklistProps) {
  const [description, setDescription] = useState('')

  function setDone(index: number, done: boolean) {
    props.onChange(props.items.map((item, i) => (i === index ? { ...item, done } : item)))
  }

  async function add(event: FormEvent) {
    event.preventDefault()
    const trimmed = description.trim()
    if (!trimmed) return
    const saved = await props.onChange([...props.items, { description: trimmed, done: false }])
    if (saved) setDescription('')
  }

  return (
    <Box>
      <Heading as="h3" size="sm" mb={2}>Checklist</Heading>
      {props.items.length === 0 ? (
        <Text fontSize="sm" color="fg.muted" mb={2}>No tasks</Text>
      ) : (
        <Stack as="ul" gap={1} mb={2} listStyleType="none">
          {props.items.map((item, index) => (
            // Tasks have no id: the index is their identity.
            <li key={index}>
              <Checkbox.Root size="sm" checked={item.done} disabled={props.isSaving}
                onCheckedChange={(details) => setDone(index, details.checked === true)}>
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label textDecoration={item.done ? 'line-through' : undefined}>{item.description}</Checkbox.Label>
              </Checkbox.Root>
            </li>
          ))}
        </Stack>
      )}
      <form onSubmit={add}>
        <Field.Root>
          <Field.Label htmlFor="card-task-input">Add a task</Field.Label>
          <HStack w="full">
            <Input id="card-task-input" size="sm" value={description} disabled={props.isSaving}
              onChange={(event) => setDescription(event.target.value)} />
            <Button type="submit" size="sm" disabled={props.isSaving || !description.trim()}>Add</Button>
          </HStack>
        </Field.Root>
      </form>
    </Box>
  )
}
