import { useId, useState } from 'react'
import { Button, Heading, Input, Stack, Text } from '@chakra-ui/react'
import type { ChecklistItem } from '../../types/board'
import type { EditorProps } from './types'
import { ChecklistTask } from './ChecklistTask'

export function Checklist({ items, blocked, onEdit }: EditorProps & {
  items: ChecklistItem[]
}) {
  const id = useId()
  const [draft, setDraft] = useState('')
  return (
    <Stack as="section" aria-label="Checklist" gap={3}>
      <Heading as="h3" size="md">Checklist</Heading>
      <Text color="fg.muted">{items.filter(item => item.done).length} / {items.length} tâches terminées</Text>
      {items.length === 0 && <Text color="fg.muted">Aucune tâche.</Text>}
      {items.map((item, index) => <ChecklistTask
        key={index}
        item={item}
        index={index}
        blocked={blocked}
        onEdit={onEdit}
      />)}
      <form onSubmit={async (event) => {
        event.preventDefault()
        if (await onEdit({ kind: 'add-task', description: draft }))
          setDraft('')
      }}>
        <Stack gap={2}>
          <label htmlFor={id}>Nouvelle tâche</label>
          <Input
            id={id}
            value={draft}
            required
            disabled={blocked}
            onChange={event => setDraft(event.currentTarget.value)}
          />
          <Button type="submit" alignSelf="start" disabled={blocked || !draft.trim()}>Ajouter la tâche</Button>
        </Stack>
      </form>
    </Stack>
  )
}
