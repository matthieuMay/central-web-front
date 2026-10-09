Type: grilling
Status: resolved
Blocked by:

## Question

How should the page session select and expose the current user, represent anonymous mode, normalize names from `/users`, allow switching from the top-right panel, and prevent anonymous users from posting comments while automatically assigning the selected user's display name to every new comment?

## Answer

On every page load, show a session chooser containing the users returned by `/users` and an explicit **Continue anonymously** option. The board remains blocked until one option is selected, and the choice is held only in in-memory React state; a refresh shows the chooser again.

Keep an always-visible session panel in the top-right corner. It displays the current identity and lets the user switch to another API user or anonymous mode without reloading. Existing comments remain unchanged when the session changes.

Normalize API user records through one shared display-name helper that supports the API's possible name fields. Remove the comment author input entirely. For a named session, new comments automatically store the selected user's resolved display name. Anonymous users can read existing comments but cannot submit comments; the UI must explain why.
