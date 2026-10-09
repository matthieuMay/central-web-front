import { Box, Button, Flex, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { useState, type KeyboardEvent } from 'react'
import { v7 as uuidv7 } from 'uuid'
import type { SubtaskData } from '../types/board'
import { MemberList, MemberPicker } from './Members'

// Every change (tick, add, delete) is saved at once: no confirmation step.
type SubtasksProps = { subtasks: SubtaskData[]; onChange: (subtasks: SubtaskData[]) => void }

export function Subtasks({ subtasks, onChange }: SubtasksProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeIds, setAssigneeIds] = useState<string[]>([])
  const canAdd = !!title.trim() && assigneeIds.length > 0

  function toggle(id: string) {
    onChange(subtasks.map((subtask) => subtask.id === id ? { ...subtask, done: !subtask.done } : subtask))
  }

  function add() {
    if (!canAdd) return
    const trimmed = description.trim()
    onChange([...subtasks, { id: uuidv7(), title: title.trim(), ...(trimmed ? { description: trimmed } : {}), done: false, assigneeIds }])
    setTitle('')
    setDescription('')
    setAssigneeIds([])
  }

  // Enter in either field adds the Sub-task.
  function onEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    add()
  }

  return (
    <Box as="section" aria-labelledby="subtasks-heading" mt={6}>
      <Heading as="h3" size="sm" id="subtasks-heading" mb={3}>Sous-tâches</Heading>
      <Stack as="ul" gap={2} listStyleType="none" mb={4}>
        {subtasks.length === 0 && <Text as="li" color="fg.muted" fontSize="sm">Aucune sous-tâche</Text>}
        {subtasks.map((subtask) => (
          <Flex as="li" key={subtask.id} gap={2} align="flex-start">
            <input type="checkbox" id={`subtask-${subtask.id}`} checked={subtask.done} onChange={() => toggle(subtask.id)} style={{ marginTop: '0.3rem' }} />
            <Box flex="1" minW={0}>
              <label htmlFor={`subtask-${subtask.id}`}>
                <Text as="span" fontSize="sm" textDecoration={subtask.done ? 'line-through' : undefined}>{subtask.title}</Text>
              </label>
              {subtask.description && <Text fontSize="xs" color="fg.muted">{subtask.description}</Text>}
              <Text fontSize="xs" color="fg.muted"><MemberList memberIds={subtask.assigneeIds} /></Text>
            </Box>
            <Button type="button" size="2xs" variant="ghost" aria-label={`Supprimer ${subtask.title}`} onClick={() => onChange(subtasks.filter((other) => other.id !== subtask.id))}>✕</Button>
          </Flex>
        ))}
      </Stack>
      <Stack gap={2} borderWidth="1px" borderColor="border" borderRadius="md" p={3}>
        <Text fontSize="sm" fontWeight="semibold">Ajouter une sous-tâche</Text>
        <Input size="sm" aria-label="Titre de la sous-tâche" placeholder="Titre" value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={onEnter} />
        <Input size="sm" aria-label="Description de la sous-tâche (facultative)" placeholder="Description (facultative)" value={description} onChange={(event) => setDescription(event.target.value)} onKeyDown={onEnter} />
        <Flex align="center" gap={2} wrap="wrap">
          <Text fontSize="xs" color="fg.muted">Assignée à (au moins un membre)</Text>
          <MemberPicker label="Membres assignés à la sous-tâche" value={assigneeIds} onChange={setAssigneeIds} />
        </Flex>
        <Button type="button" size="sm" alignSelf="flex-start" disabled={!canAdd} onClick={add}>Ajouter</Button>
      </Stack>
    </Box>
  )
}
