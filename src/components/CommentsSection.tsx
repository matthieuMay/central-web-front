import type { CardData, UserData } from '../types/board'

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