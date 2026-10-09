# Mini-Trello front

Kanban board UI over the Mini-Trello API: Board / Column / Card, plus the collaboration layer (members, sub-tasks, comments) kept in the browser.

## Language

**Board**:
Kanban board: has many Columns.
_Avoid_: project, workspace

**Column**:
Named list on a Board: has many Cards.
_Avoid_: list

**Card**:
Task item in a Column: title required, description optional. Has Assignees, Sub-tasks and Comments.
_Avoid_: ticket, issue

**Member**:
A person from the fixed team list, with a first name, a last name and a colour that identifies them everywhere in the UI.
_Avoid_: user, account

**Current member**:
The Member the person at the keyboard has said they are ("Qui êtes-vous ?"). A self-declared identity for testing, not authentication.
_Avoid_: logged-in user, session

**Assignee**:
A Member assigned to a Card or to a Sub-task. Assignment grants no special rights.
_Avoid_: owner

**Sub-task** (Sous-tâche):
A checklist item inside a Card that shows how far the Card has progressed. Has a title, an optional description, a done state and at least one Assignee. Completing every Sub-task does not complete the Card.
_Avoid_: todo, todo task, checklist item

**Comment** (Commentaire):
A message a Member posts on a Card: text, Attachments, or both. Never edited or deleted once posted. Shown oldest first.
_Avoid_: note, message

**Attachment** (Pièce jointe):
A file shared in a Comment. Images are previewed; every Attachment can be downloaded. At most 10 MB each.
_Avoid_: document, upload
