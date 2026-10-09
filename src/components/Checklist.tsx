import { Heading } from '@chakra-ui/react'
import { useState, type FormEvent } from 'react'
import { addChecklistItem, toggleChecklistItem } from '../api/collections'
import type { ChecklistItem } from '../types/board'

export type ChecklistProps = {
  items: ChecklistItem[]
  disabled: boolean
  // Resolves once saved, rejects if the API refused.
  onChange: (next: ChecklistItem[]) => Promise<void>
}

// Responsibility: list the card's tasks, add one, check and uncheck them.
// Items have no id, so they are addressed (and keyed) by index.
// Props: the card's items and whether a save is in progress. The new task's
// description is local form state.
// Action: onChange with the whole next list: the item at `index` flipped, or the
// new item { description, done: false } appended.
// Cases to verify:
// - toggling item n changes only item n;
// - adding keeps every existing item and its state;
// - a blank description cannot be added;
// - the input is cleared only after a successful save;
// - with no items the add form still works.
export function Checklist({ items, disabled, onChange }: ChecklistProps) {
  const [draft, setDraft] = useState('')
  const done = items.filter((item) => item.done).length

  async function add(event: FormEvent) {
    event.preventDefault()
    if (disabled || !draft.trim()) return
    try {
      await onChange(addChecklistItem(items, draft))
      setDraft('')
    } catch {
      // Keep the draft so the user can retry; the parent shows the error.
    }
  }

  return (
    <section aria-labelledby="card-checklist" className="card-section">
      <Heading as="h3" size="sm" id="card-checklist">Checklist <span className="card-section-count">{done}/{items.length}</span></Heading>
      {items.length > 0 && (
        <ul className="check-list">
          {items.map((item, index) => (
            // No id from the API: the index is the item's identity.
            <li key={index}>
              <label className="check-row" data-done={item.done || undefined}>
                <input type="checkbox" checked={item.done} disabled={disabled} onChange={() => { onChange(toggleChecklistItem(items, index)).catch(() => {}) }} />
                <span>{item.description}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={add} className="inline-form">
        <label htmlFor="checklist-new">New task</label>
        <div className="inline-form-row">
          <input id="checklist-new" value={draft} onChange={(event) => setDraft(event.target.value)} />
          <button type="submit" disabled={disabled || !draft.trim()}>Add</button>
        </div>
      </form>
    </section>
  )
}
