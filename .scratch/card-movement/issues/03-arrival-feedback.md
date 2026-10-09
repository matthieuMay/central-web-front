# Review the insertion preview, movement and arrival confetti

Labels: wayfinder:prototype
Type: prototype
Status: resolved
Assignee: codex
Blocked by: 01, 02

## Question

Which minimal interaction prototype makes the insertion point unmistakable, moves the card continuously to the chosen position, and celebrates visual arrival immediately, with a reverse movement if persistence later fails?

Work with the user using a small throwaway prototype before resolving this ticket. Reuse Chakra styles, Motion LayoutGroup/layoutId, and the existing Confetti component. Cover same-column, cross-column, empty/edge columns, cancellation, rapid successive actions, slow/failing requests, responsive layouts and reduced motion. Use one operation identity and actual animation completion; avoid a fixed timer. The user confirmed that confetti fires at forward visual arrival even while saving is pending; if the API later fails, reverse the move without a second burst. If failure interrupts forward travel before arrival, invalidate that arrival event.

Prototype should show one focused insertion treatment and localized burst. The user explicitly wants animated keyboard movements too. Resolve only after the user reviews the interaction, then sharpen the implementation sequence and acceptance checks in the draft spec.

Use Chrome MCP for interaction feedback against the already running frontend dev instance and local API. Reuse the configured services and hot reload for short, targeted checks rather than starting duplicate instances. Carry the same Chrome MCP requirement into final implementation tests and the final report; follow [Browser validation and feedback](../spec.md#browser-validation-and-feedback).

## Answer

The user authorized direct implementation in place of a separate prototype session, then requested translucent/tilted drag feedback and corrected landing to begin at the release position. Delivered a custom React DnD preview with matching card dimensions, a stable insertion line, Motion neighbor/card transitions, release-origin landing and reverse rollback from the current visual position. Confetti fires once at forward arrival without waiting for saving and never fires on rollback, cancelled/unchanged drops or refetch.

Verified through Chrome MCP against the running frontend/API, including real mouse dragging, delayed/failing requests, destination index/body, focus and reduced-motion behavior. Full evidence and limits: [validation](../validation.md). No touch or multi-card dragging in this version.
