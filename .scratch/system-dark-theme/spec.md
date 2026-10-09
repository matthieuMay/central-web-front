# System-driven dark theme

Status: ready-for-agent

## Problem Statement

Mini-Trello currently renders only a light visual theme. Users whose operating
system is configured for dark mode receive a light page, and users cannot
change the theme while using the application. This makes the home page and
board less comfortable to use in different environments and can reduce
readability when the operating system theme changes.

## Solution

Use the operating system color-scheme preference as the initial theme for the
application. Add a visible light/dark toggle in the shared Header so the user
can override the system choice for the current page session. While the
application is following the system preference, changes to the OS preference
must update the rendered theme immediately. Once the user manually chooses
light or dark, later OS preference changes must not change the theme.

Do not provide a system reset action. After the user manually changes the
theme, that choice remains active for the current page session and is not
changed by later OS preference changes. A reload must begin by evaluating the
current OS preference again and must not restore the previous session’s choice.

Apply the theme to `/` and `/board`, including shared layout surfaces, Header
navigation, page text, controls, board columns, cards, borders, and empty-state
copy. Keep the existing blue navigation accent. Use accessible neutral light
and dark surfaces with readable foregrounds and visible focus indicators.
Preserve the existing read-only board data, column/card ordering, responsive
layout, and route behavior.

## User Stories

1. As a visitor whose OS prefers light mode, I want Mini-Trello to start in light mode, so that the page matches my environment without configuration.
2. As a visitor whose OS prefers dark mode, I want Mini-Trello to start in dark mode, so that the page matches my environment without configuration.
3. As a visitor on `/`, I want the theme applied to the page background, Header, navigation, heading, body copy, and link, so that the entire home page remains readable.
4. As a visitor on `/board`, I want the theme applied to the board background, title, columns, cards, headings, descriptions, borders, and empty-state text, so that board content remains readable.
5. As a user following the OS preference, I want a visible light/dark toggle in the Header, so that I can change the theme without leaving the page.
6. As a user following the OS preference, I want activating the toggle to mark my light/dark choice as a manual override, so that my explicit choice is respected.
7. As a user who has manually selected light mode, I want the application to remain light when the OS changes to dark mode, so that the application does not undo my choice.
8. As a user who has manually selected dark mode, I want the application to remain dark when the OS changes to light mode, so that the application does not undo my choice.
9. As a user who has not manually overridden the theme, I want a live OS preference change to update the page, so that the application continues to track my environment.
10. As a user with an active manual override, I want no system reset button in the Header, so that the Header remains focused on the single theme toggle.
11. As a user who manually changes the theme, I want the control’s text and accessible name to communicate the available theme action, so that I can understand and operate it without relying on color alone.
12. As a keyboard user, I want to focus and activate the theme control with the keyboard, so that theme changes do not require a pointer.
13. As a user with reduced vision, I want sufficient contrast for text, controls, borders, links, and focus indicators in both themes, so that all required content remains usable.
14. As a screen-reader user, I want the theme control to have a meaningful accessible label, so that I can understand and operate it.
15. As a user who reloads the page after manually changing the theme, I want the application to start from the current OS preference, so that manual choices are not persisted.
16. As a user who navigates between `/` and `/board` in the same session, I want the active theme and override state to remain consistent, so that navigation does not unexpectedly reset the appearance.
17. As a board user, I want the board’s existing columns, cards, empty states, ordering, and responsive arrangement to remain unchanged, so that the visual feature does not alter board behavior.
18. As a user on an unsupported or unrelated route, I want the shared layout and theme behavior to remain internally consistent, without changing route matching or navigation behavior.
19. As a maintainer, I want the theme behavior to be driven by one shared application-level state seam, so that `/` and `/board` cannot drift into different theme behavior.

## Implementation Decisions

- Treat the theme as a session-scoped application concern owned above the routed
  pages and consumed by the shared layout/Header and themed content.
- Initialize the effective theme from `window.matchMedia('(prefers-color-scheme:
  dark)')` when the application session starts.
- Track whether the application is following the system or has a manual
  light/dark override. OS media-query changes affect the effective theme only
  in system-following mode.
- The light/dark Header control changes the effective theme and activates the
  manual override. There is no system reset control; the override ends only
  when the page is reloaded.
- Do not use local storage, cookies, URL parameters, server state, or another
  persistence mechanism for the theme or override.
- Use the existing Chakra UI provider and semantic theme capabilities rather
  than introducing a second styling system. Theme values must cover the shared
  layout, Header, home content, board, columns, cards, links, borders, empty
  states, control states, and focus states.
- Preserve the existing blue navigation accent in both themes while selecting
  light/dark neutral surfaces and foregrounds that maintain readable contrast.
- Keep the existing Header as the single visible location for the theme
  controls. Do not add a separate settings page, modal, or route.
- Keep the existing board data contract and rendering structure. Theme support
  must not change card/column data, ordering, interaction behavior, or
  responsive breakpoints.
- The control must expose an accessible name, keyboard operation, readable
  text, and visible focus treatment in both themes.
- The implementation should subscribe to and clean up the
  `MediaQueryList` change listener so OS preference changes are handled without
  leaking listeners.

## Testing Decisions

- Validate external behavior at the highest-level frontend seam: render the
  application with a controllable `matchMedia` implementation and interact
  with the visible Header controls.
- Verify initial light and dark rendering from both OS preference values.
- Verify that changing the OS preference updates the rendered theme while the
  application is following the system.
- Verify that either manual choice blocks subsequent OS preference changes.
- Verify that no “Système” control is rendered and that a manual choice remains
  active when the OS preference changes later in the same page session.
- Verify that a reload does not restore the manual override and instead
  re-evaluates the current OS preference.
- Verify that the theme and override state remain consistent while navigating
  between `/` and `/board`.
- Verify readable semantic content and controls in both themes, including
  navigation links, home link, board headings, card text, empty-state text,
  borders, focus indicators, and theme controls.
- Verify that the board’s existing title, columns, cards, empty states, order,
  responsive arrangement, and read-only behavior are unchanged.
- Prefer existing frontend test infrastructure if present. If no test runner
  exists, add only the smallest project-standard test capability needed for this
  high-level behavior seam; do not replace behavior checks with implementation
  details.
- Run the frontend lint and build commands after implementation. This
  specification-only change does not run either command because it changes no
  application code.

## Out of Scope

- Providing a system reset action or any other in-session return to OS-following
  mode.
- Persisting a theme choice across reloads, tabs, browsers, or devices.
- Adding a user account preference or API/database field for theme selection.
- Adding a separate theme settings page or route.
- Changing board data, mutations, API behavior, card/column interactions, or
  route definitions.
- Redesigning the existing blue navigation accent or introducing a broader
  visual rebrand.
- Supporting additional appearance modes such as high contrast, sepia,
  scheduled themes, or custom color palettes.
- Changing the OS color-scheme preference from the application.
- Adding theme controls to pages other than the shared Header.

## Further Notes

- “System-following mode” means the effective theme is derived from the current
  OS media-query preference and remains subscribed to its changes.
- “Manual override” means a user-selected light or dark theme that lasts only
  until the page is reloaded.
- The requested implementation must be approved by the user before any
  application code is changed.
