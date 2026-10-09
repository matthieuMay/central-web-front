import { Heading } from '@chakra-ui/react'
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
export function Checklist(_props: ChecklistProps) {
  return (
    <section aria-labelledby="card-checklist">
      <Heading as="h3" size="sm" id="card-checklist">Checklist</Heading>
    </section>
  )
}
