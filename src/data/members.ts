import type { MemberData } from '../types/board'

// The team is fixed: there is no way to add or remove Members from the UI.
export const members: MemberData[] = [
  { id: 'member-alice', firstName: 'Alice', lastName: 'Martin', color: 'blue' },
  { id: 'member-hugo', firstName: 'Hugo', lastName: 'Bernard', color: 'green' },
  { id: 'member-lea', firstName: 'Léa', lastName: 'Dubois', color: 'purple' },
  { id: 'member-karim', firstName: 'Karim', lastName: 'Benali', color: 'orange' },
  { id: 'member-sophie', firstName: 'Sophie', lastName: 'Moreau', color: 'pink' },
]

export function memberById(id: string) {
  return members.find((member) => member.id === id)
}

// First name, plus the last initial when another Member shares it.
export function memberLabel(member: MemberData) {
  const shared = members.some((other) => other.id !== member.id && other.firstName === member.firstName)
  return shared ? `${member.firstName} ${member.lastName[0]}.` : member.firstName
}
