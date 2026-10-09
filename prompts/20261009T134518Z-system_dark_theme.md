I want a system-driven dark theme for this app.
- On load, use the OS color scheme (prefers-color-scheme) as the initial light/dark theme, on / and /board.
- Add a visible toggle button in Header so the user can switch light/dark while using the page.
- If the OS preference changes AND the user has NOT used the toggle, follow the new OS preference.
- Do not persist the manual choice (no localStorage, no cookie): on reload, start again from the current OS preference.
- Keep text, cards, columns, links and buttons readable in both themes, and keep the existing routes and board behavior.
Constraints: keep the code simple and readable for a beginner (explicit steps, named variables, short comments). Avoid new dependencies unless clearly necessary, and justify any you propose. There is no test framework in this project: do not add one.
Verification: npm run lint and npm run build must pass. The dev server runs at http://localhost:5173.
First explore the code and propose a short plan: files to change, approach, and how each criterion will be checked. Do not implement before my go.
