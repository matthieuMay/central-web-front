# Sprint 5 — validation du 13 octobre 2026

Implémentation terminée, sans commit ni push. Référence de revue : `4ad696f936f7e2961a3c1e04b855384cb556d0e2` sur `hugoc/sprint5`.

## Méthode

Frontend existant sur http://localhost:5173 ; API sur http://localhost:3000. Tests Chrome DevTools MCP avec GET/PATCH/PUT réels sur le tableau de développement. Interactions natives : sélection de membres/auteur, boutons, clavier, focus, drag-and-drop et navigation. Des événements DOM publics et soumissions de formulaires ont aussi servi aux scénarios de répétition et de défaut réseau ; aucun appel aux hooks ou au cache privé de l'application.

Les défauts sont injectés dans `window.fetch` dans le navigateur, sans changement backend : refus 400 avant écriture, délai avant PATCH/PUT, perte de réponse après PATCH réel, échec de GET. La préférence reduced-motion et son événement change sont simulés par une MediaQueryList avant chargement ; aucun réglage du système Windows n'a été modifié. Les injections disparaissent au rechargement.

## Critères

| Critère | Résultat et preuve |
| --- | --- |
| S5-CA1 | GET /users partagé, noms affichés. Échec simulé : alerte et sélecteurs désactivés, checklist encore disponible. Réessayer restaure les utilisateurs. |
| S5-CA2 | Alex puis Daniel associés à card-1 ; retrait d'Alex conserve Daniel. Nouveau cycle via select/bouton MCP validé. PATCH ne contient que assignees. |
| S5-CA3 | Deux commentaires Daniel publiés et affichés chronologiquement. Nouveau commentaire sans createdAt ; second PATCH conserve la première date serveur. Texte composé uniquement d'espaces désactive la publication. |
| S5-CA4 | Deux tâches créées, première cochée/décochée puis renommée ; seconde conservée. Édition place le focus dans le champ ; succès et annulation le rendent à Modifier. Progression confirmée. |
| S5-CA5 | Corps PATCH observés : une seule liste complète à chaque opération. Autres collections de card-1 conservées après PATCH et PUT. CardData retourné est intégré au BoardData complet. |
| S5-CA6 | Double requestSubmit pendant délai : un seul PATCH ; tâche absente avant confirmation et contrôles désactivés. Fermeture pendant PATCH puis ArrowRight : aucun PUT, colonne inchangée. Modification distante de la première tâche détectée par GET frais : alerte, aucun PATCH de l'intention obsolète. |
| S5-CA7 | Refus 400 : alerte, liste inchangée, brouillon conservé. Réponse perdue après écriture : GET/PATCH/GET, résultat relu, brouillon conservé et invitation à vérifier, sans retry. Échec de lecture préparatoire : commandes bloquées, bouton de reprise fonctionnel. |
| S5-CA8 | Reload conserve Daniel, les deux commentaires et leurs dates, les descriptions et états de checklist. Carte card-5 vide : messages explicites pour les trois collections, formulaires disponibles. |
| S5-CA9 | Quatre flèches, Entrée/Espace, Échap, focus sur carte confirmée, DnD interne et vers voisine validés. DnD Doing→Done interdit sans PUT. Navigation Accueil/Tableau conserve les collections. Confettis : 0 pendant PUT retardé, 40 après confirmation vers Done, 0 au reload et après PATCH ; reduced-motion supprime une animation active et empêche le prochain déclenchement. |
| S5-CA10 | Fiche modale accessible nommée, Tab reste dans la fiche, Échap rend le focus au bouton d'ouverture, retrait membre mène au heading Membres. Bouton interne ne déclenche pas les flèches du tableau. Thèmes clair/sombre et viewport 375/1280/1440 vérifiés. À 375 px : fiche 343 px, scrollWidth=clientWidth=326, pas de débordement horizontal. |

Les dates des deux commentaires après reload sont `2026-10-13T14:06:06.530Z` et `2026-10-13T14:06:06.965Z`. La fiche affiche les dates localisées, avec attributs time/dateTime correspondants.

## Contrôles et revues

- `npm run lint` : succès, aucun avertissement.
- `npm run build` : succès TypeScript/Vite ; avertissement de taille du bundle (700,91 kB, gzip 205,05 kB), pas de dépendance ajoutée.
- `git diff --check` : succès ; avertissements Git de conversion LF→CRLF uniquement.
- Console Chrome finale : aucun error/warn.
- Revue Standards : aucun constat.
- Revue Spec : défaut de focus corrigé, aucune observation restante lors de la seconde revue.

## Fichiers livrés

- Modifiés : `src/api/board.ts`, `src/types/board.ts` (contrats et transport), `src/pages/BoardPage.tsx` (composition), `src/components/Board.tsx`, `src/components/Column.tsx`, `src/components/Card.tsx` (résumés et ouverture), `src/index.css` (fiche et contrôles thémés).
- Créés : `src/card-editing.ts` (intentions et listes), `src/hooks/useBoardController.ts` (écritures et cache), `src/components/CardDetails.tsx` (dialog), `src/components/card-details/Members.tsx`, `Comments.tsx`, `Checklist.tsx`, `types.ts` (sections et contrats).
- Documentation : `.scratch/sprint5-card-details/spec.md`, ce rapport et `prompts/20261013T133900Z-implement_sprint_5.md` (prompt initial archivé, anciens prompts non consultés).

## Données et limites

card-1 est revenue dans Doing, en fin de colonne, après les déplacements de test. Ses deux tâches de base sont décochées. Les données de test clairement préfixées « Essai Sprint 5 » restent dans cette carte : un membre, deux commentaires et cinq tâches (dont délai, double soumission et réponse perdue). Aucun reset, migration, suppression de carte ou modification backend effectué ; aucun secret lu.

Le verrou protège les intentions rapprochées d'un même QueryClient, y compris les mouvements. La lecture fraîche réduit les écrasements d'un autre client mais le contrat sans version/ETag ne peut garantir une écriture concurrente entre GET et PATCH. La checklist sans identifiants ne permet pas de distinguer deux tâches identiques après réorganisation distante ; index et snapshot empêchent les conflits détectables.

Validation sous Chrome ; pas de matrice Safari/Firefox ni de nouveau framework de tests automatisés. Le paramètre système reduced-motion a été simulé dans le navigateur pour vérifier le changement pendant une animation. Les scénarios d'erreur n'arrêtent aucun service réel.
