import type { CardData, UserData } from '../types/board'

/*
 * AssigneesSection
 *
 * RESPONSIBILITY
 *   Show who is assigned to ONE card, and let the user add or remove a member.
 *   It never calls the API itself.
 *
 * PROPS
 *   card      the card shown (read only). card.assignees is a list of user ids.
 *   users     every user from GET /users: used to pick someone and to turn an
 *             id into a readable name.
 *   onChange  called with the COMPLETE new list of user ids after an add or a
 *             remove (never just the id that changed).
 *
 * ACTIONS AND DATA OWNER
 *   Triggers: "add member" (choose a user not yet assigned) and "remove member".
 *   Data owner: the parent component that renders this one. It loads the users
 *   and sends PATCH /cards/:cardId with { assignees }. PATCH replaces the whole
 *   array, so onChange must always give the full list, otherwise members are lost.
 *
 * CASES THAT PROVE IT WORKS
 *   1. Adding a member keeps the existing ones.
 *   2. Removing a member keeps the others.
 *   3. A card with no assignees renders and can receive its first member.
 *   4. The same user cannot be added twice (the API rejects duplicates).
 *   5. If the API refuses the change, the UI does not show it as saved.
 *   6. After a page reload, the assignees shown are the ones the API returns.
 */