# User prompt

I want a system-driven dark theme: use the OS color scheme as the initial
light/dark theme. Add a visible toggle in Header so the user can override it
while using the page. If system preference changes and the user has not
overridden the theme, follow the system preference change. Do not persist the
manual choice: on reload, start from the current OS preference again. Apply the
theme on `/` and `/board`, keep text and controls readable, and preserve
existing board behavior. Show the files changed and the results of lint and
build. Do not implement before my go.
