Type: grilling
Status: ready-for-human
Blocked by: 03

## Question

Define when a successful move should trigger Confetti and how repeated arrivals work.

The final Column is currently the last entry in `board.columns` (the seed's Done Column). An unused `Confetti` component already exists and `motion` is already installed; its `particleCount` prop starts an animation when changed to a positive value. It is not connected to movement or persistence.

Should Confetti play only after the server confirms a move from a different Column into the final Column, never for optimistic state, failed requests, or reordering within the final Column? Should leaving and later successfully returning to the final Column celebrate again?

### Recommendation

Trigger once per successful transition from a non-final Column to the current last Column, including a later re-entry; do not trigger for same-Column reorder or a failed PUT. Drive the signal from mutation success using source/destination IDs rather than inferring success from the optimistic Board render. Keep using the installed `Confetti`/`motion` implementation unless a small integration check identifies a concrete defect.

### Risks

An optimistic-render trigger can celebrate failed moves. A boolean/count that does not change between consecutive arrivals may fail to retrigger. Hard-coding the `done` ID would break if the final Column is reordered or renamed.