import { NativeSelect } from '@chakra-ui/react'
import type { User } from '../types/board'

/**
 * UserSelect — the Acting Author control for a Card Detail.
 *
 * Responsibility: let the user pick which User authors the next Comment.
 * Props: { users: User[]; value: string; onChange: (userId: string) => void;
 *   label: string }.
 * Events: onChange emits the chosen User's id; the component stores ids, never
 *   display names.
 * Data owner: none — the parent (CardDetail) owns the selected author; the
 *   Users come from the `useUsers` query passed down as props.
 * Correct when: the control lists every User as `firstname lastname`, shows
 *   the current selection, and reports the id on change.
 */
type UserSelectProps = {
  users: User[]
  value: string
  onChange: (userId: string) => void
  label: string
}

export function UserSelect({ users, value, onChange, label }: UserSelectProps) {
  return (
    <NativeSelect.Root size="sm" maxW="xs">
      <NativeSelect.Field
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.firstname} {user.lastname}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  )
}
