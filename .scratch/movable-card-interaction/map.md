## Destination

Produce a handoff-ready product and delivery contract for movable board cards: pointer drag-and-drop and existing-selection keyboard movement, ordered placement across and within columns, accessible and visible interaction states, completion celebration, API integration, dependency choices, and lint/build/browser verification. This map must stop before implementation.

## Notes

Domain: ordered workflow board interaction.

The user has explicitly asked not to implement before giving a later go-ahead. Use the project glossary and domain-modeling language. Preserve the existing card-selection model: cards remain click-selected rather than becoming full Tab/Enter/Space selection controls. The move API accepts `column` and post-removal zero-based `position` and returns authoritative `BoardData`.

## Decisions so far

- [Researching dependency compatibility](issues/03-dependency-compatibility.md): use matching `react-dnd`/HTML5 backend `16.0.1` and wrap `react-confetti` `6.4.0` client-side with explicit reduced-motion handling; portal only when stacking/overflow requires it.

## Not yet specified

- The exact pointer drag preview, drop-target affordances, insertion marker, and selected-versus-dragging visual hierarchy.
- The precise accessible announcement wording and how drag/drop status is exposed without changing the click-only selection model.
- The smallest browser acceptance matrix covering cross-column moves, same-column reordering, empty columns, keyboard boundaries, failure recovery, and completion celebration.

## Out of scope

- Implementing the interaction, changing dependencies, or modifying application code in this planning map; those actions require a later explicit go-ahead.
