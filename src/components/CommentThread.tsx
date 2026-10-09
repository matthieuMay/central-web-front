import { Heading } from '@chakra-ui/react'
import type { Comment, NewComment, User } from '../types/board'

export type CommentThreadProps = {
  comments: Comment[]
  users: User[]
  disabled: boolean
  // Resolves once saved, rejects if the API refused.
  onPost: (next: NewComment[]) => Promise<void>
}

// Responsibility: show the activity (author name, text, date) oldest first and a
// form to post a comment as an author picked in a select.
// Props: the card's comments, every user (for names and the author select), whether
// a save is in progress. The draft text and chosen author are local form state.
// Action: onPost([...comments, { user, comment }]); the new comment has no
// createdAt, the existing ones keep theirs.
// Cases to verify:
// - history order and dates survive a post and a reload;
// - an empty text or no author cannot be posted;
// - the draft is cleared only after a successful save and kept on failure;
// - a comment not yet dated by the API shows as pending, not with a fake date;
// - an author missing from /users still shows (as unknown).
export function CommentThread(_props: CommentThreadProps) {
  return (
    <section aria-labelledby="card-comments">
      <Heading as="h3" size="sm" id="card-comments">Comments</Heading>
    </section>
  )
}
