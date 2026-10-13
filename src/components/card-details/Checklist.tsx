import { useId, useLayoutEffect, useRef, useState } from 'react'
import { Box, Button, Heading, Input, Stack, Text } from '@chakra-ui/react'
import type { ChecklistItem } from '../../types/board'
import type { EditorProps } from './types'

function Task({ item, index, blocked, onEdit }: EditorProps & { item: ChecklistItem; index: number }) {
  const id = useId()
  const [editing, setEditing] = useState<{ expected: ChecklistItem; draft: string } | null>(null)
  const modifyButton = useRef<HTMLButtonElement>(null)
  const restoreFocus = useRef(false)
  useLayoutEffect(() => {
    if (!editing && !blocked && restoreFocus.current) {
      restoreFocus.current = false
      modifyButton.current?.focus()
    }
  }, [editing, blocked])
  return (
    <Box borderWidth="1px" borderColor="fg.muted" borderRadius="md" p={3}>
      <Stack direction="row" gap={3} align="start" justify="space-between">
        <label className="task-label">
          <input type="checkbox" checked={item.done} disabled={blocked || editing !== null}
            onChange={() => void onEdit({ kind: 'set-task-done', index, expected: { ...item }, done: !item.done })} />
          <span>{item.description}</span>
        </label>
        {!editing && <Button ref={modifyButton} size="sm" variant="outline" disabled={blocked} aria-label={`Modifier la tâche ${index + 1}`}
          onClick={() => setEditing({ expected: { ...item }, draft: item.description })}>Modifier</Button>}
      </Stack>
      {editing && <form onSubmit={async event => {
        event.preventDefault()
        const focused = document.activeElement
        const ownedFocus = event.currentTarget.contains(focused)
        const dialog = event.currentTarget.closest('dialog')
        if (await onEdit({ kind: 'rename-task', index, expected: editing.expected, description: editing.draft })) {
          restoreFocus.current = ownedFocus && (document.activeElement === focused || document.activeElement === document.body || document.activeElement === dialog)
          setEditing(null)
        }
      }}>
        <Stack mt={3} gap={2}>
          <label htmlFor={id}>Description de la tâche {index + 1}</label>
          <Input id={id} value={editing.draft} autoFocus required disabled={blocked} onChange={event => {
            const draft = event.currentTarget.value
            setEditing(current => current && { ...current, draft })
          }} />
          <Stack direction="row" gap={2}>
            <Button type="submit" size="sm" disabled={blocked || !editing.draft.trim()}>Enregistrer la tâche</Button>
            <Button type="button" size="sm" variant="outline" disabled={blocked} onClick={() => { restoreFocus.current = true; setEditing(null) }}>Annuler</Button>
          </Stack>
        </Stack>
      </form>}
    </Box>
  )
}

export function Checklist({ items, blocked, onEdit }: EditorProps & { items: ChecklistItem[] }) {
  const id = useId()
  const [draft, setDraft] = useState('')
  return (
    <Stack as="section" aria-label="Checklist" gap={3}>
      <Heading as="h3" size="md">Checklist</Heading>
      <Text color="fg.muted">{items.filter(item => item.done).length} / {items.length} tâches terminées</Text>
      {items.length === 0 && <Text color="fg.muted">Aucune tâche.</Text>}
      {items.map((item, index) => <Task key={index} item={item} index={index} blocked={blocked} onEdit={onEdit} />)}
      <form onSubmit={async event => {
        event.preventDefault()
        if (await onEdit({ kind: 'add-task', description: draft })) setDraft('')
      }}>
        <Stack gap={2}>
          <label htmlFor={id}>Nouvelle tâche</label>
          <Input id={id} value={draft} required disabled={blocked} onChange={event => setDraft(event.currentTarget.value)} />
          <Button type="submit" alignSelf="start" disabled={blocked || !draft.trim()}>Ajouter la tâche</Button>
        </Stack>
      </form>
    </Stack>
  )
}
