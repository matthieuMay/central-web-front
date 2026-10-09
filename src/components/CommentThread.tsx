import { Heading } from '@chakra-ui/react'
import { useState, type FormEvent } from 'react'
import { appendComment } from '../api/collections'
import type { Comment, NewComment, User } from '../types/board'
import { userName } from './userName'

export type CommentThreadProps = {
  comments: Comment[]
  users: User[]
  disabled: boolean
  // Resolves once saved, rejects if the API refused.
  onPost: (next: NewComment[]) => Promise<void>
}

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })

function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateFormat.format(date)
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
export function CommentThread({ comments, users, disabled, onPost }: CommentThreadProps) {
  const [author, setAuthor] = useState('')
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState<NewComment | null>(null)
  const canPost = !disabled && !!author && !!draft.trim()

  async function post(event: FormEvent) {
    event.preventDefault()
    if (!canPost) return
    const next = appendComment(comments, author, draft)
    setPending(next[next.length - 1])
    try {
      // Resolves after the board refetch, so the API-dated comment is already listed.
      await onPost(next)
      setDraft('')
    } catch {
      // Keep the draft so the user can retry; the parent shows the error.
    } finally {
      setPending(null)
    }
  }

  return (
    <section aria-labelledby="card-comments" className="card-section">
      <Heading as="h3" size="sm" id="card-comments">Comments <span className="card-section-count">{comments.length}</span></Heading>
      {(comments.length > 0 || pending) && (
        <ol className="comment-list">
          {comments.map((comment, index) => (
            <li key={`${comment.createdAt}-${index}`}>
              <div className="comment-meta">
                <strong>{userName(users, comment.user)}</strong>
                <time dateTime={comment.createdAt}>{formatDate(comment.createdAt)}</time>
              </div>
              <p>{comment.comment}</p>
            </li>
          ))}
          {pending && (
            <li aria-busy="true" data-pending>
              <div className="comment-meta">
                <strong>{userName(users, pending.user)}</strong>
                <span role="status">Posting…</span>
              </div>
              <p>{pending.comment}</p>
            </li>
          )}
        </ol>
      )}
      <form onSubmit={post} className="inline-form">
        <label htmlFor="comment-author">Author</label>
        <select id="comment-author" value={author} onChange={(event) => setAuthor(event.target.value)}>
          <option value="">Choose who is writing</option>
          {users.map((user) => <option key={user.id} value={user.id}>{userName(users, user.id)}</option>)}
        </select>
        <label htmlFor="comment-text">Comment</label>
        <textarea id="comment-text" rows={3} value={draft} onChange={(event) => setDraft(event.target.value)} />
        <button type="submit" disabled={!canPost}>Post</button>
      </form>
    </section>
  )
}
