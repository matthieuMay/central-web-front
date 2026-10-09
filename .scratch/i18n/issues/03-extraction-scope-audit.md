# Extraction-scope audit: every string and its placeholder shape

Type: grilling
Status: resolved
Blocked by: 01

## Question

Enumerate every user-facing and accessible string in `src` and decide, for each, how wuchale will see it — especially the ones that are not plain JSX text. At minimum:

- JSX text and headings across `Header`, `HomePage`, `NotFoundPage`, `Board`, `Column`, `Card`, `CardDetail`, `CardAssignees`, `CardComments`, `CardChecklist`, `UserSelect`, `Layout`.
- `aria-label` / `placeholder` / `label` attributes (`Navigation principale`, `Ouvrir la carte ${card.title}`, `Auteur du commentaire`, `Nouvelle tâche`, `Écrire un commentaire`, `Chargement des personnes`, `Board announcements`, …).
- The **dynamic** ones and whether they express cleanly as wuchale placeholders: `Mode de couleur : ${PREFERENCE_LABELS[preference]}`, `Ouvrir la carte ${card.title}`.
- Strings held in constants/records rather than markup: `PREFERENCE_LABELS` (`Système`/`Clair`/`Sombre`), the endonym list, the app name `Mini-Trello`.
- What must **not** be extracted: API/user data (Card titles, descriptions, Comments, User names) and test files.

Decide whether any of these force a component restructure (e.g. building a message from parts) versus a simple interpolation, and settle the placeholder convention. Produce the definitive in-scope list and the out-of-scope exclusions; this becomes the migration checklist for ticket 06.

## Answer

All user-facing and accessible strings are in scope and extracted: JSX text, `aria-label`, `placeholder`, `label`, headings, buttons, loading/error text, and the color-mode names. Dynamic strings use wuchale placeholders (`Mode de couleur : {0}`, `Ouvrir la carte {0}`, `Moved {0} to {1}`). A custom heuristic in `wuchale.config.js` excludes keyboard `event.key` names (`Arrow*`, `Enter`, `Escape`, …). API/user content is data and never extracted. `src/api/board.ts` status error strings are left out as infrastructure errors (consistent with the spec exclusion of server error messages). Two wuchale parser quirks were worked around: a text element adjacent to a JSX expression sibling and a Button text after a mapped list — CardDetail members branch wrapped in `Box`, CardChecklist label hoisted to `addLabel`.
