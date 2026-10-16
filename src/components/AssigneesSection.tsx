import type { CardData, UserData } from '../types/board'
import { Box, Flex, Stack, Text } from '@chakra-ui/react'

type AssigneesSectionProps = {
	card: CardData
	users: UserData[]
	disabled?: boolean
	onChange: (assignees: string[]) => void
}

/*
 * AssigneesSection
 *
 * RESPONSIBILITY
 *   Show who is assigned to ONE card, and let the user add or remove a member.
 *   It never calls the API itself.
 *
 * PROPS
 *   card      the card shown (read only). card.assignees is a list of user ids.
 *   users     every user from GET /users: used to pick someone and to turn an
 *             id into a readable name.
 *   onChange  called with the COMPLETE new list of user ids after an add or a
 *             remove (never just the id that changed).
 *
 * ACTIONS AND DATA OWNER
 *   Triggers: "add member" (choose a user not yet assigned) and "remove member".
 *   Data owner: the parent component that renders this one. It loads the users
 *   and sends PATCH /cards/:cardId with { assignees }. PATCH replaces the whole
 *   array, so onChange must always give the full list, otherwise members are lost.
 *
 * CASES THAT PROVE IT WORKS
 *   1. Adding a member keeps the existing ones.
 *   2. Removing a member keeps the others.
 *   3. A card with no assignees renders and can receive its first member.
 *   4. The same user cannot be added twice (the API rejects duplicates).
 *   5. If the API refuses the change, the UI does not show it as saved.
 *   6. After a page reload, the assignees shown are the ones the API returns.
 */

export function AssigneesSection({ card, users, disabled = false, onChange }: AssigneesSectionProps) {
	const assignedUsers = users.filter((user) => card.assignees.includes(user.id))
	const availableUsers = users.filter((user) => !card.assignees.includes(user.id))

	function addAssignee(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const form = new FormData(event.currentTarget)
		const userId = form.get('assignee')
		if (typeof userId !== 'string' || !userId || card.assignees.includes(userId)) return
		onChange([...card.assignees, userId])
	}

	return (
		<Box as="section" aria-label={`Assignees for ${card.title}`} mt={3}>
			<Text fontWeight="semibold" fontSize="sm" mb={2}>Assigned members</Text>
			{assignedUsers.length === 0 ? (
				<Text color="var(--app-muted)" fontSize="sm" mb={2}>No members assigned</Text>
			) : (
				<Stack gap={2} mb={2}>
					{assignedUsers.map((user) => {
						const name = `${user.firstname} ${user.lastname}`
						return (
							<Flex key={user.id} align="center" justify="space-between" gap={2}>
								<Text fontSize="sm">{name}</Text>
								<button
									type="button"
									aria-label={`Remove ${name}`}
									disabled={disabled}
									onClick={() => onChange(card.assignees.filter((id) => id !== user.id))}
								>
									Remove
								</button>
							</Flex>
						)
					})}
				</Stack>
			)}
			{availableUsers.length > 0 && (
				<form onSubmit={addAssignee}>
					<label htmlFor={`assignee-${card.id}`}>Add member</label>
					<Flex gap={2} wrap="wrap">
						<select id={`assignee-${card.id}`} name="assignee" disabled={disabled}>
							{availableUsers.map((user) => (
								<option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>
							))}
						</select>
						<button type="submit" disabled={disabled}>Add member</button>
					</Flex>
				</form>
			)}
		</Box>
	)
}