import type { CardData } from '../types/board'

/*
 * ChecklistSection
 *
 * RESPONSIBILITY
 *   Show the checklist of ONE card, let the user add an item, and check or
 *   uncheck an existing one.
 *
 * PROPS
 *   card      the card shown (read only). card.checklistItems is a list of
 *             { description, done }. Items have NO id from the API.
 *   onAdd     called with the description of a new item (already trimmed).
 *   onToggle  called with the INDEX of the item to flip between done and not done.
 *
 * ACTIONS AND DATA OWNER
 *   Triggers: "add item" (text field + button) and a checkbox per item.
 *   Data owned here: only the form draft (text being typed).
 *   Data owned by the parent that renders this component: the card and the
 *   request. Items are identified by their position in the array. The parent
 *   sends PATCH /cards/:cardId with the FULL checklistItems array: for an add,
 *   the existing items plus { description, done: false }; for a toggle, the same
 *   items with only the one at that index flipped. PATCH replaces the whole
 *   array, so sending only the changed item would erase the others.
 *
 * CASES THAT PROVE IT WORKS
 *   1. Adding an item appends it unchecked and keeps the existing ones.
 *   2. Checking then unchecking an item changes only that item.
 *   3. A blank description cannot be added.
 *   4. A card with an empty checklist shows an empty state and accepts an item.
 *   5. If the API refuses the change, the UI does not show it as saved.
 *   6. After a page reload, items and their done state come from the API.
 */