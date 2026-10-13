# Ticket 06 — Validation du 13 octobre 2026

Périmètre : ticket 06 uniquement, changements non commités depuis `051d590e2ddbae72d6958c13d1274527c7969c17`. Spécification : [Sprint 4](spec.md). Aucun changement backend, lecture de secret, lancement API, migration, reset, suppression de données, commit ou push.

## Implémentation

- Adaptation ciblée de `hugoc/sprint2` : clé `['board', 'mini-trello']`, URL `VITE_API_URL` ou `http://localhost:3000`, helper HTTP, sélection et calcul des voisines. Aucun merge/cherry-pick.
- `useQuery` lit le tableau réel et consomme le signal d'annulation. Le cache contient la réponse BoardData complète ; aucun tableau local dupliqué ni fallback JSON.
- `useMutation` envoie uniquement `column` au PUT, sans retry et sans réorganisation optimiste. Validation des réponses complètes, annulation des lectures avant/après mouvement, blocage des mouvements pendant une lecture ou une mutation.
- Refus documenté 400/404 avec erreur JSON : état conservé. Autre échec, JSON illisible ou confirmation incohérente : GET de réconciliation. Échec GET : état non actualisé, verrou partagé par QueryClient conservé après navigation, reprise par lecture explicite.
- Cartes articles focusables, sélection clic/Entrée/Espace et Échap, commandes horizontales locales à la carte sélectionnée focalisée. Focus restauré après confirmation sauf déplacement volontaire vers une autre commande ; repli tableau si carte absente.

## Scénarios exécutés

Chrome DevTools MCP, onglet isolé `sprint4-ticket06-validation`, frontend `http://localhost:5173/board`, API opérationnelle `http://localhost:3000`. Les PUT des scénarios de succès et de perte de réponse atteignent réellement l'API et la base de développement. Les injections de panne sont des wrappers temporaires de fetch dans le navigateur ; aucun fichier backend modifié.

| Critère | Résultat observé |
| --- | --- |
| CA1 | GET réel sur accès direct/rechargement ; chargement visible avec lecture retardée. Échec GET simulé : erreur accessible, aucune carte statique ; bouton de reprise puis GET réel réussi. |
| CA2 | Tab atteint la carte avec outline 3 px ; Entrée/Espace sélectionnent, Échap désélectionne, clic sélectionne. Libellé accessible et texte visible « Sélectionnée ». Flèche sur bouton du thème : aucun PUT. |
| CA3 | Limite gauche du backlog : zéro PUT. Déplacement droite vers Doing : corps `{"column":"doing"}`, insertion après les cartes existantes. Déplacements successifs confirmés vers Review puis Done, limite droite sans changement ; retours gauche confirmés. |
| CA7 | Réponse réelle PUT retenue jusqu'à libération d'une promesse : deux flèches produisent un seul PUT, ordre affiché inchangé et statut d'attente avant libération ; aucun mouvement en file après confirmation. |
| CA8 | Après libération : nouvelle colonne, carte sélectionnée et focus restauré. Focus déplacé volontairement vers bouton du thème pendant attente : reste sur ce bouton après succès. Lecture GET retardée : commandes bloquées jusqu'à fin de lecture, donc aucune ancienne lecture ne chevauche une nouvelle intention. |
| CA9 refus | Réponse 400 simulée avant appel réseau : aucun mouvement, message d'erreur, focus à l'origine. |
| CA9 incertitude | PUT réel réussi puis exception simulant réponse perdue : un PUT, un GET réel, réconciliation sans retry PUT. JSON illisible simulé après écriture réelle : même résultat. |
| CA9 panne GET | PUT réel puis réponse perdue et GET en échec simulé : un PUT/un GET, erreur d'état non actualisé, nouvelles flèches bloquées, relance explicite réelle restaure le tableau. Même résultat après navigation /board → / → /board avant libération du PUT. |
| CA8 carte absente | GET de réconciliation simulé sans la carte déplacée, après PUT réel : sélection effacée et focus de repli sur tableau. Reload réel restaure la carte ; aucune suppression en base. |
| CA10 | GET après rechargement complet retrouve `card-3` en fin de Done avec `card-6` avant elle. Titres, descriptions et tableaux enrichis identiques avant/après déplacement lors de la comparaison des cartes triées par identifiant. |
| CA13 | Navigation accueil/tableau, changement manuel du thème, reload, navigation pendant mutation sans annonce tardive de l'ancienne page. Grille 1/2/4 colonnes à 375/800/1440 px, colonne vide, absence de débordement ; texte long sans espaces injecté temporairement dans le DOM à 375 px sans débordement. |
| CA14 | Mesures sur couleurs réellement calculées, ci-dessous. |
| CA15 | StrictMode actif : lectures abandonnées visibles dans le réseau, pas de deuxième PUT. Console après rechargement sans erreur/avertissement. Lint, build avec typage et diff check réussis. |

Trace HTTP représentative : PUT `http://localhost:3000/cards/card-3`, statut 200, corps `{"column":"done"}`, réponse avec CORS autorisant `http://localhost:5173`. GET de rechargement et ordre affiché : Done contient `[card-6, card-3]`.

Les déplacements effectués sur `card-3` ont été annulés par des mouvements horizontaux confirmés dans l'interface. État final réel, vérifié par GET et affichage après reload, identique à l'ordre relevé au début des tests isolés :

- sprint-backlog : `[card-3]`
- doing : `[card-5, card-1, card-2]`
- review : `[card-4]`
- done : `[card-6]`

## Contrastes

Rapports calculés selon la luminance relative des couleurs calculées dans le navigateur. Aucun seuil déduit de la seule présence d'un token.

| Élément | Clair | Sombre |
| --- | --- | --- |
| Texte de carte sélectionnée / fond | 16,31:1 | 15,07:1 |
| Libellé Sélectionnée / fond | 7,63:1 | 9,68:1 |
| Bordure sélectionnée / fond de carte | 7,63:1 | 9,68:1 |
| Outline focus / fond de colonne | 8,47:1 | 10,91:1 |
| Description / fond de carte | 7,73:1 | 7,76:1 |

## Contrôles et limites

- `npm.cmd run lint` : succès, uniquement les deux avertissements préexistants de Confetti (purity et set-state-in-effect).
- `npm.cmd run build` : succès, typage inclus ; avertissement préexistant sur bundle >500 kB.
- `git -c safe.directory=C:/Users/hugoc/central-web-front diff --check` : succès.
- Aucun script de tests unitaires frontend n'est disponible ; aucun framework ni dépendance ajoutés. La matrice navigateur constitue le point de test convenu.
- Les cartes réelles ont des tableaux assignees/comments/checklistItems vides : conservation de leur forme observée, mais scénario PostgreSQL avec ces collections non vides non exécuté. Aucune création/édition de contenu pour fabriquer ce scénario.
- Pas de test utilisateur avec lecteur d'écran, de profil mémoire prolongé, ni de reprise exhaustive de tous les critères du thème Sprint 3. CA13–CA15 sont vérifiés pour le socle livré, avec ces limites.
- Le chevauchement d'une ancienne lecture et d'un nouveau PUT est empêché par le verrou pendant lecture ; scénario volontairement concurrent non provoqué via accès aux hooks/cache privés.
- Tickets 07, 08 et 09 non implémentés : pas de réorganisation verticale, drag-and-drop ou confettis.

## Standards

Revue indépendante du code non commité : aucune violation documentée ni smell nécessitant correction. La recherche de voisine dans Board et BoardPage protège deux frontières distinctes, interaction et mutation sur données courantes.

## Spec

Revue indépendante : un écart CA9 initial concernait le retour sur la page pendant PUT suivi d'un GET échoué. Corrigé par verrou de fiabilité partagé par QueryClient et retest navigateur : un PUT/un GET, blocage et reprise explicite. Revue finale : aucun autre écart identifié dans le périmètre 06.

Résultat des revues finales : Standards 0 constat ; Spec 0 constat restant. Les limitations de validation ci-dessus demeurent.
