# central-web-front

The customer-facing web front end: a React + Chakra UI v3 single-page application.

## Language

**Color Mode**:
The active light or dark appearance of the interface.
_Avoid_: Theme, color scheme

**System Preference**:
The operating system's color-scheme signal (`prefers-color-scheme`), and the default source of Color Mode.
_Avoid_: OS theme, device setting

**Color Mode Preference**:
The user's chosen Color Mode source, one of `system`, `light`, or `dark`; defaults to `system`.
_Avoid_: Theme setting, dark mode toggle value

**Automatic Dark Mode**:
Color Mode deriving from System Preference without user action.
_Avoid_: Auto theme, adaptive mode

**Board**:
The Kanban board the app renders: has many Columns, presented left to right in array order.
_Avoid_: project, workspace

**Column**:
A named list on a Board holding Cards in order.
_Avoid_: list, lane, stack

**Card**:
A task item in a Column: a title, an optional description, and a position within its Column.
_Avoid_: ticket, issue, task

**Move**:
A change to a Card's Column or its position among that Column's Cards, persisted as one operation.
_Avoid_: drag (the gesture that performs a Move, not the Move itself), transfer, update

**Position**:
A Card's zero-based rank within its Column, counted after the Card is removed from any earlier place. The UI's "rank" and the API's "position" are the same concept; say *position*.
_Avoid_: rank, index, order

**Destination Column**:
The Column a Move sends a Card to; the Card's current Column for a reorder.
_Avoid_: target list, drop column

**Final Column**:
The last Column of the Board, the end of the workflow (currently titled "Done ✅").
_Avoid_: done column, last list

**Completion Celebration**:
The Confetti effect shown when a Move lands a Card in the Final Column; never on a reorder inside it.
_Avoid_: reward, prize, animation

**User**:
A person the API exposes for assignment and authorship, identified by `id` and shown by `firstname` `lastname`.
_Avoid_: member, person, account

**Assignee**:
A User associated with a Card as one of the people responsible for it; a Card's Assignees are unique.
_Avoid_: member, owner

**Comment**:
A note left on a Card: its text, the User who wrote it, and a server-created timestamp.
_Avoid_: message, note, reply

**Acting Author**:
The User selected in the Card Detail whose identity is attached to the next Comment written.
_Avoid_: current user, selected user

**Checklist Item**:
A checkable to-do on a Card: a description and a done flag, with no identity of its own.
_Avoid_: todo, task, subtask, step

**Card Detail**:
The Dialog surface where a Card's Assignees, Comments, and Checklist Items are viewed and changed.
_Avoid_: card modal, card panel, card editor