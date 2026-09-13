# Mini-Trello Front

Student-facing React UI for the kanban clone. Talks to the teacher API from Sprint 3.

## Language

**Board**:
Root UI for the kanban: owns state and renders Columns.
_Avoid_: page, app shell (use Layout for chrome)

**Column**:
Vertical list of Cards under one title.
_Avoid_: list component name in domain talk

**Card**:
Single task tile: title required.
_Avoid_: ticket

**Tag d’étape**:
Git tag `start/…` or `end/…` bounding a lab step. End tag is the corrected snapshot.
_Avoid_: solution branch as the primary reset tool

**Mock**:
Local JSON board data before the real API (Sprints 1–2).
_Avoid_: fixture as the domain word in slides
