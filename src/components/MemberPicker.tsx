import { Heading } from '@chakra-ui/react'
import type { User } from '../types/board'

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
export function MemberPicker(_props: MemberPickerProps) {
  return (
    <section aria-labelledby="card-members">
      <Heading as="h3" size="sm" id="card-members">Members</Heading>
    </section>
  )
}
