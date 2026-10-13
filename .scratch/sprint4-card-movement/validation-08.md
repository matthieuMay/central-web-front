# Ticket 08 — Validation du 13 octobre 2026

Périmètre : [ticket 08](issues/08-precise-card-drop.md), [spécification](spec.md). Tickets 06/07 acceptés comme point de départ ; 09 non traité. Prompt initial archivé sans lecture des anciens prompts. Aucun changement backend, secret lu, lancement API, migration, reset, suppression de données, commit ou push par l'agent.

## Fichiers applicatifs modifiés

- `src/board-movement.ts` : validation commune des intentions et calcul de dépôt après retrait ; même colonne ou voisine, rejet des indices invalides et positions sans effet.
- `src/components/Board.tsx` : drag actif, calcul avant/après selon la moitié survolée, dépôt et nettoyage ; clavier et drag partagent les intentions persistantes.
- `src/components/Column.tsx` : événements dragover/drop/dragleave, repère décoratif avant/après et surface de fin/vide.
- `src/components/Card.tsx` : draggable hors attente et payload natif ; champs/contrôles internes protégés.
- `src/pages/BoardPage.tsx` : même mutation 06 désormais appelée avec une intention commune validée, pour clavier et drag. Couche HTTP/API inchangée.

Réutilisation ciblée de `hugoc/sprint2` inspecté via git show : text/plain, effectAllowed/dropEffect, prévention du dragover et nettoyage dragleave. Aucun merge/cherry-pick, copie optimiste de tableau, nouveau framework ou dépendance. Les styles sémantiques restent ceux du Sprint 3.

## Tests exécutés

Chrome DevTools MCP, frontend localhost:5173, API localhost:3000 déjà opérationnelle, tableau PostgreSQL de développement. Les drags ci-dessous utilisent l'outil drag avec événements natifs `isTrusted: true`. Pour viser exactement la moitié supérieure/inférieure, petites cibles géométriques temporaires ajoutées au DOM, retirées par rechargement ; aucun ajout de ces cibles au code applicatif. L'observation HTTP et l'ordre visible prouvent les déplacements, pas un appel direct au helper.

| Critères | Résultat |
| --- | --- |
| CA5 réorganisation | Liste `[card-5,card-1,card-2]` : card-1 après card-2 → `[card-5,card-2,card-1]`, PUT position 2. Card-1 avant card-5 → `[card-1,card-5,card-2]`, PUT position 0. |
| CA6 voisinage | Dépôt réel backlog → Doing à position précise, puis Doing → backlog en fin. Review → Doing en fin également vérifié. |
| CA5–CA6 fin/vide | Card-1 première dans Doing déposée en fin → position 2. Card-4 déplacée hors de Review puis déposée dans Review vide → `{"column":"review","position":0}`, statut 200 et card-4 visible. |
| CA6 interdits/no-op | Doing → Done refusé sans PUT. Card-1 déposée sur elle-même ou avant sa suivante immédiate : aucun PUT. Drag hors tableau vers bouton du thème : aucune mutation. |
| CA5–CA6 repère | Repère observé durant dragover natif : hauteur 3 px, pointer-events none, aria-hidden. Compteur à zéro après succès, refus, dépôt interdit, sans effet et hors cible. |
| CA7 attente | PUT réel retenu côté navigateur avant remise de la réponse : ordre affiché inchangé, statut d'attente, cartes draggable=false. ArrowRight pendant attente : aucun second PUT. Après libération : seule réponse confirmée affichée. |
| CA8 focus | Carte déposée sélectionnée et focalisée après confirmation, y compris déplacement de colonne. Focus volontairement placé sur bouton du thème pendant attente : reste sur ce bouton. |
| CA9 refus | Drag réel, réponse 400 JSON simulée avant appel API : erreur accessible, ordre inchangé, focus carte conservé, repère nettoyé. |
| CA9 incertitude | Drag réel puis réponse perdue simulée après PUT réellement enregistré : un PUT et un GET de réconciliation, sans retry PUT ; ordre réconcilié, focus cohérent et repère absent. |
| CA6 compléments | Séquence d'événements synthétiques dans le navigateur : drag actif bloque ArrowRight ; Échap efface repère et sélection sans PUT ; payload remplacé par identifiant inconnu avant drop → aucun PUT et repère effacé. Ces compléments sont distingués des drags natifs ci-dessus. |
| CA10 persistance | Reload complet puis GET réel : ordre/colonnes identiques à l'affichage confirmé. Titres et descriptions conservés, collections enrichies toujours présentes et vides. |
| CA2–CA4 clavier | Après DnD : haut/bas backlog positions 0/1, droite vers Doing sans position, haut/bas Doing positions 1/2, gauche vers backlog sans position. Focus/sélection conservés. Après reload à 375 px : Tab atteint carte, Entrée/Espace sélectionnent et Échap désélectionne. |
| CA13–CA14 | Deux thèmes à 375/800/1440 px, grilles 1/2/4 colonnes sans débordement avec repère actif. Texte long sans espaces injecté dans DOM à 375 px : pas de débordement ; reload retire la fixture. |
| CA15 | StrictMode actif, aucune double mutation dans test retardé, console finale sans erreur/avertissement. Contrôles ci-dessous réussis. |

## État final et limites

Ordre relevé au début de cette session de validation puis restauré, confirmé par GET et reload final :

- sprint-backlog : `[card-3,card-1]`
- doing : `[card-5,card-2]`
- review : `[card-4]`
- done : `[card-6]`

Descriptions finales : card-1 « Keep the four columns readable on small screens. » ; card-4 « Render each card from the JSON data. ». Aucun contenu de carte envoyé dans les PUT.

Les collections assignees/comments/checklistItems de la base de développement sont vides : leur forme est conservée, scénario PostgreSQL avec collections non vides non exécuté. Pas de test tactile/mobile natif, lecteur d'écran ou profil mémoire prolongé. Le drag natif est testé sur desktop ; le responsive est vérifié aux trois largeurs. Les mécanismes de panne de relecture et navigation du ticket 06 restent réutilisés sans répétition exhaustive de tous leurs scénarios. Aucun test non exécuté déclaré réussi.

## Contrastes et contrôles

Repère / fond de colonne mesuré sur couleurs calculées dans le navigateur : **8,47:1 en clair**, **10,91:1 en sombre**, aux trois largeurs ; seuil essentiel 3:1 respecté. Le repère ne capte pas les interactions.

- `npm.cmd run lint` : succès, uniquement deux avertissements préexistants Confetti (purity, set-state-in-effect).
- `npm.cmd run build` : succès, typage inclus ; avertissement préexistant bundle >500 kB.
- `git -c safe.directory=C:/Users/hugoc/central-web-front diff --check` : succès. Git signale aussi la normalisation LF/CRLF du helper, sans erreur whitespace.
- Aucun script de suite unitaire frontend disponible ; point navigateur/HTTP convenu utilisé, aucune dépendance ajoutée.

## Standards

Revue indépendante de l'incrément par rapport à une copie du travail 07 validé enregistrée avant modification : 0 constat. Calcul métier regroupé, vocabulaire du domaine respecté, responsabilités interactions/mutation préservées.

## Spec

Revue indépendante : 0 défaut identifié. Indices après retrait, interdits/no-op, état confirmé, sélection/focus et nettoyage conformes. Aucun confetti ni changement backend.

Résultat final : Standards 0 constat ; Spec 0 constat. Les limites de validation ci-dessus demeurent.
