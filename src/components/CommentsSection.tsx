import type { CardData, UserData } from '../types/board'
import { Box, Stack, Text } from '@chakra-ui/react'
import { useState, type FormEvent } from 'react'

type CommentsSectionProps = {
	card: CardData
	users: UserData[]
	disabled?: boolean
	onAdd: (userId: string, text: string) => Promise<void>
}

/*
 * CommentsSection
 *
 * RESPONSIBILITY
 *   Show the comment history of ONE card (author, text, date) and let the user
 *   publish a new comment with an author chosen in the interface.
 *
 * PROPS
 *   card   the card shown (read only). card.comments is the history, oldest first.
 *   users  every user from GET /users: fills the author picker and turns a
 *          comment's user id into a readable name.
 *   onAdd  called with (userId, text) when the user publishes a comment.
 *          The text is already trimmed.
 *
 * ACTIONS AND DATA OWNER
 *   Trigger: "publish comment" (author picker + text field + button).
 *   Data owned here: only the form draft (selected author, text being typed).
 *   Data owned by the parent that renders this component: the card and the
 *   request. The parent sends PATCH /cards/:cardId with the FULL comments array:
 *   existing comments unchanged (each KEEPS its createdAt) followed by the new
 *   comment WITHOUT createdAt (the API creates the date). A wrong or missing
 *   createdAt on an existing comment makes the whole PATCH fail with 400.
 *
 * CASES THAT PROVE IT WORKS
 *   1. Publishing a comment shows it with the chosen author's name and a date.
 *   2. Publishing a second comment does not change the first one's date.
 *   3. A blank or whitespace-only comment cannot be published.
 *   4. A card with no comments shows an empty state and still accepts one.
 *   5. If the API refuses the comment, the UI does not show it as saved and
 *      the typed text is not lost.
 *   6. After a page reload, the history and its dates come from the API.
 */

export function CommentsSection({ card, users, disabled = false, onAdd }: CommentsSectionProps) {
	const [text, setText] = useState('')
	const [userId, setUserId] = useState('')
	const availableUserId = users.some((user) => user.id === userId) ? userId : users[0]?.id ?? ''

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		const trimmed = text.trim()
		if (!trimmed || !availableUserId || disabled) return
		try {
			await onAdd(availableUserId, trimmed)
			setText('')
		} catch {
			// Keep the draft so the user can retry after a failed request.
		}
	}

	return (
		<Box as="section" aria-label={`Comments for ${card.title}`} mt={3}>
			<Text fontWeight="semibold" fontSize="sm" mb={2}>Comments</Text>
			{card.comments.length === 0 ? (
				<Text color="var(--app-muted)" fontSize="sm" mb={2}>No comments yet</Text>
			) : (
				<Stack as="ol" gap={2} mb={3} pl={5}>
					{card.comments.map((comment, index) => {
						const author = users.find((user) => user.id === comment.user)
						const authorName = author ? `${author.firstname} ${author.lastname}` : 'Unknown member'
						return (
							<Box as="li" key={`${comment.createdAt}-${index}`}>
								<Text fontSize="sm"><strong>{authorName}</strong>: {comment.comment}</Text>
								<time dateTime={comment.createdAt} style={{ color: 'var(--app-muted)', fontSize: '0.75rem' }}>
									{new Date(comment.createdAt).toLocaleString('fr-FR')}
								</time>
							</Box>
						)
					})}
				</Stack>
			)}
			<form onSubmit={submit}>
				<Stack gap={2}>
					<label htmlFor={`comment-author-${card.id}`}>Comment author</label>
					<select
						id={`comment-author-${card.id}`}
						value={availableUserId}
						onChange={(event) => setUserId(event.target.value)}
						disabled={disabled || users.length === 0}
					>
						{users.map((user) => (
							<option key={user.id} value={user.id}>{user.firstname} {user.lastname}</option>
						))}
					</select>
					<label htmlFor={`comment-text-${card.id}`}>Write a comment</label>
					<textarea
						id={`comment-text-${card.id}`}
						value={text}
						onChange={(event) => setText(event.target.value)}
						rows={2}
						required
						disabled={disabled}
					/>
					<button type="submit" disabled={disabled || !availableUserId || !text.trim()}>
						Publish comment
					</button>
				</Stack>
			</form>
		</Box>
	)
}