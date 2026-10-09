import { Heading } from '@chakra-ui/react'
import { toggleAssignee } from '../api/collections'
import type { User } from '../types/board'
import { userName } from './userName'

export type MemberPickerProps = {
  users: User[]
  assignees: string[]
  disabled: boolean
  // Resolves once saved, rejects if the API refused.
  onChange: (next: string[]) => Promise<void>
}

// Responsibility: list the people from GET /users and toggle which are on the card.
// Props: every user, the card's assignee ids, whether a save is in progress.
// Action: onChange with the whole next list, [...assignees, id] to add or
// assignees without id to remove. Holds no data of its own.
// Cases to verify:
// - adding or removing one person keeps all the others;
// - adding never duplicates an id;
// - an assignee id missing from /users stays listed (as unknown) so it can be removed;
// - with no assignees every person can still be added.
export function MemberPicker({ users, assignees, disabled, onChange }: MemberPickerProps) {
  const unknown = assignees.filter((id) => !users.some((user) => user.id === id))
  const options = [...users.map((user) => user.id), ...unknown]

  function toggle(id: string) {
    // The parent shows the error; the checkbox follows the rolled-back cache.
    onChange(toggleAssignee(assignees, id)).catch(() => {})
  }

  return (
    <section aria-labelledby="card-members" className="card-section">
      <Heading as="h3" size="sm" id="card-members">Members <span className="card-section-count">{assignees.length}</span></Heading>
      <ul className="check-list">
        {options.map((id) => (
          <li key={id}>
            <label className="check-row">
              <input type="checkbox" checked={assignees.includes(id)} disabled={disabled} onChange={() => toggle(id)} />
              <span>{userName(users, id)}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
