# Review the insertion preview, movement and arrival confetti

Labels: wayfinder:prototype
Type: prototype
Status: open
Assignee: none
Blocked by: 01, 02

## Question

Which minimal interaction prototype makes the insertion point unmistakable, moves the card continuously to the chosen position, and celebrates visual arrival immediately, with a reverse movement if persistence later fails?

Work with the user using a small throwaway prototype before resolving this ticket. Reuse Chakra styles, Motion LayoutGroup/layoutId, and the existing Confetti component. Cover same-column, cross-column, empty/edge columns, cancellation, rapid successive actions, slow/failing requests, responsive layouts and reduced motion. Use one operation identity and actual animation completion; avoid a fixed timer. The user confirmed that confetti fires at forward visual arrival even while saving is pending; if the API later fails, reverse the move without a second burst. If failure interrupts forward travel before arrival, invalidate that arrival event.

Prototype should show one focused insertion treatment and localized burst. The user explicitly wants animated keyboard movements too. Resolve only after the user reviews the interaction, then sharpen the implementation sequence and acceptance checks in the draft spec.

Use Chrome MCP for interaction feedback against the already running frontend dev instance and local API. Reuse the configured services and hot reload for short, targeted checks rather than starting duplicate instances. Carry the same Chrome MCP requirement into final implementation tests and the final report; follow [Browser validation and feedback](../spec.md#browser-validation-and-feedback).
