# Membres, commentaires et tâches à cocher

State: conception SDD dans le code ; types et composants temporaires intégrés, comportements à implémenter dans un second commit.

## Objectif et périmètre

Enrichir le tiroir `EditCardDrawer` existant avec trois sections : Membres, Commentaires et Tâches à cocher. Conserver la modification du titre et de la description, la création des cartes, leur déplacement et le retour du focus. Le premier commit contient les types et trois composants montés dans le tiroir avec des props typées, un rendu temporaire et des commentaires de responsabilité/cas à vérifier. Le second commit implémentera les comportements et la persistance.

Arbre préparé : `BoardPage → EditCardDrawer → EditForm → CardMembers / CardComments / CardChecklist`. Les trois sections sont hors du formulaire titre/description pour permettre leurs futurs formulaires indépendants. Le catalogue est temporairement vide, les actions désactivées et leurs callbacks sans effet ; aucun nouvel appel API n'est branché dans cette étape.

- Membres : associer ou retirer une personne fournie par `GET /users`.
- Commentaires : lire l'activité et publier un commentaire avec un auteur explicitement choisi parmi ces personnes.
- Tâches à cocher : ajouter une tâche non cochée, la cocher et la décocher.
- Pas de suppression/modification des commentaires, suppression/réorganisation des tâches, comptes connectés, recherche de membres ni résumé supplémentaire sur les cartes à ce stade.

## Contrat HTTP

Sources : exigences de l'utilisateur et lectures locales du 2026-10-09. `GET /users` et `GET /boards/mini-trello` ont été vérifiés sans modifier les données. Aucun PATCH n'a été exécuté.

| Opération | Contrat |
| --- | --- |
| `GET /users` | Réponse directe `UserData[]` : `{ id: string, firstname: string, lastname: string }`. |
| `GET /boards/mini-trello` | `BoardData` ; chaque carte observée contient `assignees`, `comments`, `checklistItems`, y compris quand ces listes sont vides. Toutes les listes observées étaient vides. |
| `PATCH /cards/:cardId` | JSON ; chaque liste envoyée remplace entièrement la liste correspondante. Une propriété absente reste inchangée. `[]` vide explicitement une liste. |

L'interface utilisera `UserData.id` pour l'assignation et l'auteur. Vérifier cette correspondance dans le contrat serveur avant les premiers essais d'écriture : les GET observés ne contiennent pas de références existantes. Le corps de réponse et les statuts de succès du PATCH restent à confirmer ; ne pas supposer qu'il renvoie une carte ou un tableau, ni appeler `response.json()` sur un éventuel `204`. Le GET du tableau reste la source d'autorité après une écriture.

### Types intégrés

- `src/types/user.ts` : `UserData`.
- `src/types/board.ts` : `CardComment`, `NewCardComment`, `CardChecklistItem`, `CardCollections`, `CardCollectionsPatch` et `CardData` enrichi.
- `CardComment.createdAt` est obligatoire dans les données reçues. `NewCardComment.createdAt?: never` interdit de fournir une date au nouveau commentaire.
- `CardCollectionsPatch.comments` accepte les commentaires existants datés et le nouveau commentaire sans date.
- `checklistItems` est un tableau de `{ description: string, done: boolean }`. Aucun ID serveur ou client n'est ajouté au payload.
- Les nouvelles cartes optimistes ont trois listes vides. La fixture statique et les cartes des tests de placement suivent le même contrat.

### Invariants de conservation

1. Modifier des membres envoie seulement `assignees`, avec tous les membres conservés ; retirer le dernier membre envoie `assignees: []`. Ne pas créer de doublons, ne pas enlever les IDs inconnus du catalogue lors d'une autre action.
2. Ajouter un commentaire envoie seulement `comments`, avec tous les commentaires existants dans leur ordre et avec leurs dates exactes, suivi de `{ user, comment }`. Ne pas générer de date, ni reformater les dates existantes dans le payload.
3. Ajouter une tâche envoie seulement `checklistItems`, avec tous les items existants et un nouvel item `{ description, done: false }` en fin de liste.
4. Cocher/décocher remplace seulement `done` de l'item ciblé et conserve les autres items, descriptions, positions et états. Deux descriptions identiques restent deux tâches distinctes.
5. Enregistrer le titre/la description continue d'omettre les collections. Déplacer une carte conserve l'objet carte complet.
6. Les listes proviennent de la dernière lecture serveur réussie au moment de l'action, jamais d'un snapshot conservé à l'ouverture du tiroir. Si la lecture échoue ou la carte a disparu, ne pas PATCHer.

## Interface utilisateur

Le tiroir contient le formulaire titre/description existant et les trois sections. Les collections sont enregistrées immédiatement par action ; le bouton Enregistrer conserve son rôle pour le titre/la description et ferme le tiroir après succès. Les ajouts/modifications des collections gardent le tiroir ouvert. Renommer Annuler en Fermer : fermer abandonne seulement les brouillons non soumis, sans annuler les actions déjà enregistrées. Indiquer que les trois sections enregistrent chaque action immédiatement.

Les formulaires d'ajout ne doivent pas être imbriqués dans le formulaire titre/description : placer les sections comme frères de ce formulaire dans le corps du tiroir et garder des associations de boutons explicites.

- Membres : liste de personnes avec cases à cocher libellées par prénom/nom ; état sélectionné issu de `assignees`. Afficher aussi les IDs assignés absents du catalogue avec un libellé de repli et permettre leur retrait.
- Commentaires : liste dans l'ordre renvoyé, nom de l'auteur (ID en repli), texte rendu comme texte React, date lisible avec `<time dateTime={createdAt}>`. Sélecteur Auteur sans auteur présélectionné, champ Commentaire, bouton Publier. Désactiver la publication si auteur absent/indisponible ou texte vide après trim. Ne vider le brouillon qu'après confirmation du PATCH.
- Tâches à cocher : liste avec cases à cocher natives ou Chakra, description comme libellé ; champ Nouvelle tâche et bouton Ajouter. Refuser les descriptions vides après trim. Vider le champ après confirmation du PATCH.
- Sans utilisateurs : afficher un état vide et désactiver assignation/publication ; lecture des commentaires et checklist restent accessibles. Un échec de `/users` propose Réessayer sans bloquer titre/description ou checklist.
- Pendant une écriture/réconciliation : désactiver toutes les écritures du tiroir, y compris titre/description, conserver la lecture et annoncer le traitement. Les champs contrôlés conservent leurs brouillons lors d'une actualisation de la même carte.
- Erreurs affichées près de l'action avec `role="alert"` ; traitement et succès annoncés via une zone `aria-live="polite"`. Parcours complet au clavier, labels explicites, bouton Fermer et retour du focus sur le crayon de la carte. Sur écran étroit, une seule colonne et défilement du corps du tiroir.

## Modules et responsabilités

| Module / fichier prévu | Interface et responsabilité |
| --- | --- |
| `src/types/board.ts`, `src/types/user.ts` | Contrats des données reçues et des listes PATCH ; aucune logique UI. |
| `src/api/board.ts` | Réutiliser `apiUrl` et `request`. Ajouter `usersKey = ['users']`, `getUsers(): Promise<UserData[]>` et `patchCardCollections(cardId: string, patch: CardCollectionsPatch): Promise<void>`. N'envoyer que les collections présentes, encoder l'ID ; adapter la lecture de réponse au contrat PATCH confirmé. Garder `editCard` compatible. |
| `src/api/cardCollections.ts` | `buildCardCollectionsPatch(card: CardData, action: CardCollectionsAction): CardCollectionsPatch`. Construire immuablement une seule liste complète selon l'action ; préserver dates et doublons légitimes. Refuser un index invalide ou une opération de checklist devenue obsolète. |
| `src/api/mutations.ts` | `useUpdateCardCollections()` accepte `{ cardId, action }`. Contrôler les écritures en cours, lire le tableau, retrouver la carte, construire le PATCH, écrire, puis réconcilier. Garder le scope `board-writes`, sans optimisme de collections pour cette première version. Le hook expose pending/erreur/résultat au tiroir. |
| `src/components/EditCardDrawer.tsx` | Charger les utilisateurs avec Query ; coordonner la mutation unique, les brouillons, erreurs, disabled, focus et structure sans formulaires imbriqués. Fournir la carte courante reçue de `BoardPage`, pas une copie locale de ses collections. |
| `src/components/CardMembers.tsx` | Afficher membres/catalogue ; émettre une intention d'association ou retrait. Ne pas construire le payload ni appeler HTTP. |
| `src/components/CardComments.tsx` | Afficher l'activité, gérer auteur/texte du brouillon ; émettre un ajout valide et garder le brouillon en cas d'échec. |
| `src/components/CardChecklist.tsx` | Afficher la liste, gérer le brouillon d'ajout ; émettre ajout ou état explicite `done` d'une occurrence. |
| `src/pages/BoardPage.tsx` | Garder la carte éditée dérivée du cache par ID ; intégrer le verrou des nouvelles écritures aux contrôles existants. |

Les props sont exportées dans leurs fichiers de composants. Chaque section reçoit uniquement sa collection, ses éventuels utilisateurs, `disabled` et ses callbacks :

- `CardMembersProps` : `assignees`, `users`, `disabled`, `onChange(userId, assigned)`.
- `CardCommentsProps` : `comments`, `users`, `disabled`, `onPublish(comment)`.
- `CardChecklistProps` : `items`, `disabled`, `onAdd(description)`, `onSetDone(index, item, done)`.

Les callbacks retournent `Promise<void>` pour que chaque section puisse conserver son brouillon en cas de rejet et le vider après confirmation. Le tiroir les branchera à la mutation commune. L'intention utilisée par cette mutation reste un contrat proposé pour l'implémentation :

```typescript
type CardCollectionsAction =
  | { type: 'set-assignee'; userId: string; assigned: boolean }
  | { type: 'add-comment'; comment: NewCardComment }
  | { type: 'add-checklist-item'; description: string }
  | { type: 'set-checklist-done'; index: number; item: CardChecklistItem; done: boolean }
```

L'index désigne une occurrence, jamais une description. `item` capture description/état au clic : après lecture, comparer la valeur à l'index attendu, refuser si elle a changé et demander de réessayer depuis la liste actualisée. En l'absence de suppression/réorganisation locale, l'index sert aussi de clé React ; ne pas fabriquer d'UUID persisté. Une modification externe de deux occurrences identiques ne peut pas être identifiée avec certitude sans ID serveur.

## Écritures, cache et erreurs

- Une seule écriture acceptée pendant la lecture préalable, le PATCH et la réconciliation. Vérifier l'état actuel via `queryClient.isMutating` et le chargement du tableau au moment de déclencher ; un bouton disabled seul ne protège pas d'un double clic avant le rendu suivant.
- Réutiliser `scope: { id: 'board-writes' }` pour les requêtes, mais ne pas s'en contenter : la sérialisation réseau ne rafraîchit pas un payload déjà construit et les `onMutate` existants peuvent modifier le cache avant l'exécution réseau.
- Avant PATCH, effectuer un GET du tableau et construire la liste à partir de la carte retournée. Pour assignation/auteur, valider l'ID avec le dernier catalogue chargé ; conserver les références existantes inconnues. Valider trim et index à l'interface du module, pas seulement dans les contrôles.
- Pas de commentaire optimiste avec une fausse date : le serveur produit `createdAt` ; relire le tableau après PATCH. Attendre cette réconciliation avant de permettre la prochaine écriture.
- Si PATCH échoue avant confirmation : conserver les brouillons, montrer l'erreur, relire le tableau. Pas de réessai automatique (`retry: false`) pour les ajouts.
- Si PATCH réussit puis GET échoue : l'écriture est enregistrée, seul l'affichage est obsolète. Ne pas proposer de republier/rajouter ; proposer Actualiser et bloquer les nouvelles écritures jusqu'à une lecture réussie. Distinguer ce cas d'un rejet de PATCH.
- Si la connexion est perdue après un possible commit : signaler le résultat incertain et actualiser avant tout nouvel essai. Sans ID de commentaire ni clé d'idempotence serveur, une republication ne peut pas garantir l'absence de doublon.
- Deux clients peuvent encore écrire entre le GET et le PATCH : la conservation est garantie pour les actions locales successives, pas pour des modifications simultanées externes. Un contrôle de version/ETag ou des endpoints d'ajout atomique côté API serait nécessaire pour cette garantie supplémentaire.

## Cas d'acceptation

| Cas | Vérification attendue |
| --- | --- |
| Collections vides | Sections utilisables sans exception, nouveaux champs de carte présents à la création. |
| Associer A puis B | PATCHs contiennent `[A]` puis `[A, B]` ; un rechargement conserve les deux. |
| Retirer A, puis dernier membre | B conservé, puis `assignees: []` ; autres listes absentes du payload. |
| Référence absente du catalogue | Affichage de repli, conservation lors d'une autre action ; retrait explicite possible. |
| Commentaire existant + deux ajouts | Chaque payload reprend tous les existants ; leurs dates restent identiques, chaque nouvel ajout omet `createdAt`. |
| Auteur/texte invalide | Aucune requête d'écriture ; texte trimé et auteur valide exigés. |
| Ajouter deux tâches | Les existantes sont conservées ; les nouvelles sont `done: false`, même si leurs descriptions sont identiques. |
| Cocher puis décocher | Une seule occurrence change ; aucun ID envoyé, état conservé après reload. |
| Index obsolète/invalide | Aucun PATCH si l'item a changé/disparu depuis le clic ; actualiser et réessayer. |
| Double clic / opérations successives | Une seule action acceptée pendant pending ; la suivante utilise le résultat réconcilié. |
| GET préalable échoue / carte disparue | Pas de PATCH destructif ; message et action de récupération. |
| PATCH rejeté | Pas de collections fantômes ; brouillon conservé, erreur visible, actualisation. |
| PATCH confirmé, GET échoue | Message de réconciliation, pas de nouvelle publication proposée, Actualiser seul. |
| Titre/description et déplacement | Ne changent aucune collection ; brouillons conservés pendant les refetchs de la même carte. |
| Fermer / rouvrir / changer de carte | Les collections déjà enregistrées persistent ; les brouillons appartiennent à la carte ouverte. |
| Clavier / mobile | Labels, ordre de focus, cases Espace, soumission explicite, texte long, défilement du tiroir, aucun raccourci du tableau déclenché depuis les champs. |

Tests du module de construction : conservation/immutabilité, propriétés omises vs `[]`, dates existantes/nouvelle date absente, descriptions dupliquées, indices invalides/obsolètes. Tests de mutation avec requêtes contrôlées : lecture-PATCH-réconciliation, verrou, échecs et résultat incertain. Essais navigateur ciblés : auteurs/membres, publication, checklist, recharge, clavier et régressions titre/déplacement. Ne pas écrire de tests qui se limitent à reproduire les types.

Pour le commit de conception : relire les props et les commentaires, lancer lint/build et les tests de placement existants. Les cas fonctionnels ci-dessus seront vérifiés après implémentation ; les rendus temporaires ne promettent pas ces comportements.

## Suite d'implémentation

1. [Contrat HTTP et conservation des collections](issues/01-collections-persistence.md).
2. [Sections du tiroir](issues/02-collections-sections.md).
3. [Intégration et validation](issues/03-integration-validation.md).

Les nouvelles sections réutiliseront Chakra, React Hook Form et TanStack Query déjà installés. Aucune dépendance, configuration ni abstraction de dépôt supplémentaire n'est nécessaire.
