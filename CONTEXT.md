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