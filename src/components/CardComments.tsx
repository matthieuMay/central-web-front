import { Box, Heading, Text } from '@chakra-ui/react'
import type { CardComment, User } from '../types/board'

type NewComment = {
  user: string // id of the author chosen in the interface
  comment: string
}

type CardCommentsProps = {
  comments: CardComment[]
  users: User[] // every User from GET /users, to choose the author and show names
  isSaving: boolean
  onAdd: (newComment: NewComment) => void // only the new comment, without createdAt
}

/*
 * CardComments — the activity of this Card.
 *
 * Responsibility:
 *   - Shows the existing comments: author name, text and date (createdAt).
 *   - Lets the user write a comment and choose its author among the Users.
 *
 * Action: calls onAdd with the new comment only. CardDetails builds the full list:
 * existing comments WITH their createdAt + the new one WITHOUT createdAt.
 * Who holds the data: CardDetails / the Board from the API.
 *
 * Cases to check:
 *   - Publishing keeps the history and the original dates.
 *   - An author must be chosen and the text must not be blank.
 *   - No comments yet: show "No comments" and the form still works.
 *   - Controls are disabled while isSaving.
 */
export function CardComments(props: CardCommentsProps) {
  // Temporary render
  return (
    <Box>
      <Heading as="h3" size="sm">Comments</Heading>
      <Text fontSize="sm" color="fg.muted">{props.comments.length} comment(s) — to implement</Text>
    </Box>
  )
}