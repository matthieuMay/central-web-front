# Board Interaction

This context defines the ordered workflow board and the interaction language used to move cards through it.

## Board structure

**Board**:
An ordered sequence of columns containing cards.

**Column**:
An ordered workflow stage within a board that contains zero or more cards.

**Card**:
An item represented in a column and movable to a different position or column.

**Completion column**:
The rightmost column in the board; entering it represents successful completion and may trigger celebration feedback.

## Interaction state

**Selected card**:
The card chosen by the existing selection interaction and eligible for keyboard movement.

**Move**:
A change that removes a card from its current ordered list and inserts it at a destination column and zero-based position.

## Card details

**Assignee**:
A user responsible for work represented by a card.
_Avoid_: Assigned user

**Comment**:
A note attached to a card and attributed to a user.
_Avoid_: Commentary

**Checklist item**:
A small piece of work tracked as part of a card's checklist, with a description and a done status.
_Avoid_: Checklist task

**Card details drawer**:
The panel opened from a card's edit control where the card's title, description, and checklist can be modified.
_Avoid_: Details panel, card modal

**Comments drawer**:
The left-side panel for viewing every comment on a card, adding a comment, and deleting a comment.
_Avoid_: Comment modal, comments panel
