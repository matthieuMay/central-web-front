# System-driven theme

## Summary

Add light and dark themes to Mini-Trello. The operating system's color-scheme
preference is the default and is followed live until the user chooses an
explicit theme. A visible control in the shared Header lets the user choose
System, Light, Dark, Red, Green, Yellow, Blue, Pink, or Rainbow for the current
page session.

## User behavior

- On every page load, start in System mode and resolve the active appearance
  from the current `prefers-color-scheme` setting.
- While System is selected, update the appearance when the OS preference
  changes.
- Selecting Light or Dark immediately applies that appearance and stops
  following OS changes for the remainder of the page session.
- Selecting System again immediately applies the current OS preference and
  resumes following subsequent OS changes.
- Selecting a color theme applies its palette for the remainder of the page
  session without changing the behavior of System, Light, or Dark.
- Do not save the selected mode or override in local storage, cookies, or
  another persistent store. A reload starts in System mode again.

## Scope and presentation

- Apply the theme to `/` and `/board`, including the shared Header, page
  backgrounds, text, links, and interactive controls.
- Add a visible, keyboard-operable System / Light / Dark / Red / Green /
  Yellow / Blue / Pink / Rainbow control to the Header.
  Expose its group label and selected state to assistive technology and retain
  a visible keyboard-focus indicator.
- Keep text, links, and controls legible in both themes. Meet WCAG AA contrast
  ratios: at least 4.5:1 for normal text, 3:1 for large text, and 3:1 for
  meaningful control boundaries and states.
- Keep the board's current data, layout/responsiveness, navigation, and other
  behavior unchanged. This change does not add theme settings to the board or
  alter routes.

## Acceptance criteria

1. With the OS set to light, a fresh visit to `/` and `/board` renders in light
   mode; with the OS set to dark, both render in dark mode.
2. Changing the OS preference updates the appearance while System is selected.
3. Choosing Light or Dark applies the selected appearance on either route and
   it remains selected across in-app navigation.
4. OS preference changes do not replace a manual Light or Dark selection.
5. Choosing System after a manual selection applies the current OS preference
   and resumes live updates.
6. Reloading after choosing Light or Dark returns to System mode using the
   OS's preference at reload time.
7. Each color theme applies its own palette, and selecting System, Light, or
   Dark retains its existing behavior.
8. The selector is operable with a keyboard, communicates its label and
   selected option to assistive technology, and has a visible focus indicator.
9. Text and controls meet the specified contrast ratios in each theme.
10. Board content, navigation, and existing board behavior remain unchanged.
