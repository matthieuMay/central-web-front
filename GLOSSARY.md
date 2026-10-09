# Board Interaction

This context defines the ordered workflow board and the interaction language used to move cards through it.

## Board structure

**Board**:
An ordered sequence of columns containing cards.

**Column**:
An ordered workflow stage within a board that contains zero or more cards.

**Card**:
An item represented in a column and movable to a different position or column.

**Completion column**:
The rightmost column in the board; entering it represents successful completion and may trigger celebration feedback.

## Interaction state

**Selected card**:
The card chosen by the existing selection interaction and eligible for keyboard movement.

**Move**:
A change that removes a card from its current ordered list and inserts it at a destination column and zero-based position.
