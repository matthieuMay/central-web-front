# Ticket 07 — Validation du 13 octobre 2026

Périmètre : [ticket 07](issues/07-keyboard-card-ordering.md), [spécification](spec.md). Ticket 06 accepté comme point de départ ; 08/09 non traités. Prompt initial archivé sans lecture des anciens prompts. Aucun commit/push, changement backend, secret lu, migration, reset ou suppression de données.

## Changements

- Helper partagé `getKeyboardMovement` : gauche/droite vers voisine en fin ; haut/bas à `i−1`/`i+1` après retrait. Carte absente, voisin absent ou rang hors limites ne produit aucune intention.
- Les quatre directions traversent les composants existants et la même mutation confirmée du ticket 06. Les deux validations, avant focus et avant mutation sur état courant, utilisent le helper commun.
- `moveCardApi` existant reçoit maintenant `position` facultative ; HTTP et validation BoardData conservés. La confirmation verticale doit placer la carte à la position demandée, sinon le résultat est incertain et déclenche la réconciliation existante.
- Aucune réorganisation optimiste, copie du tableau, nouvelle dépendance ou nouveau framework. Sélection/focus/verrous et traitement des erreurs réutilisés. Instructions clavier et annonce du rang confirmé adaptées.

## Tests navigateur et HTTP

Chrome DevTools MCP, onglet isolé `sprint4-ticket07`, frontend localhost:5173 et API localhost:3000 déjà opérationnelle. PUT autorisés sur le tableau de développement ; chaque panne est injectée temporairement dans fetch côté navigateur, jamais dans le backend.

| Critères | Scénario et preuve |
| --- | --- |
| CA4, test initial | Avant modification, ArrowUp sur card-1 ne produit aucun PUT, ordre Doing `[card-5,card-1,card-2]` inchangé : fonctionnalité manquante constatée. |
| CA3–CA4 | ArrowUp sur card-1 envoie `{"column":"doing","position":0}` ; résultat `[card-1,card-5,card-2]`. ArrowDown successifs envoient positions 1 puis 2 ; résultat `[card-5,card-2,card-1]`. Focus et sélection conservés. |
| CA3–CA4 limites | Première carte vers haut et dernière vers bas : zéro PUT supplémentaire. Card-3 seule dans backlog : haut/bas et gauche produisent zéro PUT, focus conservé. |
| CA3 horizontal | ArrowRight vers Review puis ArrowLeft vers Doing : succès, insertion en fin, focus sur card-1, comportement 06 conservé. |
| CA7 | Réponse réelle du PUT vertical retardée après écriture : deux ArrowUp puis ArrowLeft produisent un seul PUT position 1. Avant libération, ordre affiché inchangé et statut d'attente ; après libération, ordre confirmé affiché et aucune seconde demande mise en file. |
| CA8, focus volontaire | PUT ArrowDown retardé : focus déplacé vers bouton du thème ; après confirmation, focus reste sur ce bouton. |
| CA9 refus | 400 JSON simulé avant appel réseau : ordre inchangé, erreur accessible, sélection/focus conservés à l'origine. |
| CA9 incertitude | ArrowUp réel position 1 suivi de perte de réponse simulée : un PUT/un GET, ordre réconcilié `[card-5,card-1,card-2]`, aucun retry PUT. |
| CA8 carte absente | PUT ArrowUp réel position 0 puis réponse perdue ; GET réel dont la réponse est temporairement présentée sans card-1 : sélection effacée, focus tableau. Rechargement réel retrouve card-1 ; aucune suppression en base. |
| CA2 contrôles internes | Input, textarea, select, button, lien et contenteditable ajoutés temporairement au DOM d'une carte : 24 événements clavier (quatre flèches par contrôle), aucun preventDefault ni PUT. ArrowUp également envoyé réellement via Chrome sur l'input focalisé : aucun PUT, focus input. Contrôles retirés après essai. |
| CA2 navigation | Après reload, quatre Tab atteignent card-3 ; Entrée sélectionne, Échap désélectionne, Espace sélectionne ; libellé accessible, texte Sélectionnée et outline 3 px présents. Clic utilisé pour sélectionner card-1 pendant les scénarios. |
| CA10 | Rechargement complet après plusieurs réorganisations : GET et DOM donnent Doing `[card-5,card-2,card-1]`. Restauration ensuite par flèches puis GET final : ordre initial exact ci-dessous. |
| CA13–CA14 | Deux thèmes, 375/800/1440 px : grilles 1/2/4 colonnes sans débordement ; contrastes calculés ci-dessous. |
| CA15 | StrictMode actif : lecture abandonnée observée, aucune double mutation dans le scénario retardé. Console finale sans erreur/avertissement. Lint, build avec typage et diff check réussis. |

Trace réelle représentative : PUT `/cards/card-1` statut 200, `{"column":"doing","position":1}`, réponse BoardData complète. Les PUT ne transmettent aucun contenu de carte.

## Restauration et limites

Ordre initial puis final, vérifié par GET après rechargement :

- sprint-backlog : `[card-3]`
- doing : `[card-5,card-1,card-2]`
- review : `[card-4]`
- done : `[card-6]`

Les descriptions et titres sont conservés. Les six cartes ont des collections assignees/comments/checklistItems vides avant et après : conservation de la structure vérifiée, cas PostgreSQL avec collections non vides non exécuté. Aucune édition de contenu pour fabriquer des fixtures.

Les contrôles internes et disparition de carte sont des scénarios DOM/réponse simulés, explicitement distingués des mouvements et rechargements réels. Aucun test avec lecteur d'écran ni profil mémoire prolongé. Le cas tableau à une seule colonne et la carte absente avant intention sont couverts par la revue du calcul, sans scénario navigateur dédié. Les scénarios d'échec de resynchronisation du ticket 06 ne sont pas tous répétés ; leur mécanisme reste identique.

## Mesures de contraste

Luminance relative des couleurs calculées dans le navigateur, carte sélectionnée et focalisée.

| Élément | Clair | Sombre |
| --- | --- | --- |
| Texte / fond sélectionné | 16,31:1 | 15,07:1 |
| Bordure de sélection / fond | 7,63:1 | 9,68:1 |
| Outline focus / fond de colonne | 8,47:1 | 10,91:1 |

## Contrôles

- `npm.cmd run lint` : succès, uniquement les deux avertissements préexistants de Confetti (purity, set-state-in-effect).
- `npm.cmd run build` : succès, typage inclus, avertissement préexistant bundle >500 kB.
- `git -c safe.directory=C:/Users/hugoc/central-web-front diff --check` : succès.
- Pas de suite unitaire frontend disponible : vérification au point navigateur/HTTP déjà convenu, sans nouveau framework.

## Standards

Revue indépendante de l'incrément depuis l'état non commité du ticket 06, sauvegardé avant modification. Aucune violation documentée ni smell significatif. Le helper commun respecte la Position du domaine et évite une duplication des règles de limites.

## Spec

Revue indépendante : aucun écart identifié. Calcul après retrait, limites, confirmation à la position demandée et réutilisation des protections 06 conformes. Aucun ajout des tickets 08/09.

Résultat final : Standards 0 constat ; Spec 0 constat. Les limitations de validation ci-dessus demeurent.
