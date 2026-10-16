import type { CardData } from '../types/board'
import { Box, Stack, Text } from '@chakra-ui/react'
import { useState, type FormEvent } from 'react'

type ChecklistSectionProps = {
	card: CardData
	disabled?: boolean
	onAdd: (description: string) => Promise<void>
	onToggle: (index: number) => Promise<void>
}

/*
 * ChecklistSection
 *
 * RESPONSIBILITY
 *   Show the checklist of ONE card, let the user add an item, and check or
 *   uncheck an existing one.
 *
 * PROPS
 *   card      the card shown (read only). card.checklistItems is a list of
 *             { description, done }. Items have NO id from the API.
 *   onAdd     called with the description of a new item (already trimmed).
 *   onToggle  called with the INDEX of the item to flip between done and not done.
 *
 * ACTIONS AND DATA OWNER
 *   Triggers: "add item" (text field + button) and a checkbox per item.
 *   Data owned here: only the form draft (text being typed).
 *   Data owned by the parent that renders this component: the card and the
 *   request. Items are identified by their position in the array. The parent
 *   sends PATCH /cards/:cardId with the FULL checklistItems array: for an add,
 *   the existing items plus { description, done: false }; for a toggle, the same
 *   items with only the one at that index flipped. PATCH replaces the whole
 *   array, so sending only the changed item would erase the others.
 *
 * CASES THAT PROVE IT WORKS
 *   1. Adding an item appends it unchecked and keeps the existing ones.
 *   2. Checking then unchecking an item changes only that item.
 *   3. A blank description cannot be added.
 *   4. A card with an empty checklist shows an empty state and accepts an item.
 *   5. If the API refuses the change, the UI does not show it as saved.
 *   6. After a page reload, items and their done state come from the API.
 */

export function ChecklistSection({ card, disabled = false, onAdd, onToggle }: ChecklistSectionProps) {
	const [description, setDescription] = useState('')

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const trimmed = description.trim()
		if (!trimmed || disabled) return
		try {
			await onAdd(trimmed)
			setDescription('')
		} catch {
			// Keep the draft so the user can retry after a failed request.
		}
	}

	return (
		<Box as="section" aria-label={`Checklist for ${card.title}`} mt={3}>
			<Text fontWeight="semibold" fontSize="sm" mb={2}>Checklist</Text>
			{card.checklistItems.length === 0 ? (
				<Text color="var(--app-muted)" fontSize="sm" mb={2}>No checklist items</Text>
			) : (
				<Stack gap={2} mb={3}>
					{card.checklistItems.map((item, index) => (
						<label key={`${index}-${item.description}`}>
							<input
								type="checkbox"
								checked={item.done}
								disabled={disabled}
								onChange={() => { void onToggle(index).catch(() => {}) }}
							/>{' '}
							<Text as="span" textDecoration={item.done ? 'line-through' : undefined}>
								{item.description}
							</Text>
						</label>
					))}
				</Stack>
			)}
			<form onSubmit={submit}>
				<Stack gap={2}>
					<label htmlFor={`checklist-${card.id}`}>Add checklist item</label>
					<input
						id={`checklist-${card.id}`}
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						required
						disabled={disabled}
					/>
					<button type="submit" disabled={disabled || !description.trim()}>Add item</button>
				</Stack>
			</form>
		</Box>
	)
}