# Sprint 3 — System-driven dark mode

Status: ready-for-agent
Validation utilisateur : validée avec les précisions intégrées ci-dessous

## Problème

Mini-Trello doit suivre la préférence clair/sombre du système tout en permettant un choix manuel temporaire. L'accueil et le tableau doivent rester lisibles et conserver leurs fonctionnalités.

## Solution

Au chargement, appliquer la préférence système actuelle et suivre ses changements jusqu'à la première bascule manuelle. Le Header propose un bouton explicite permettant de passer au thème opposé. Le choix manuel est conservé pendant la navigation interne jusqu'au rechargement complet, sans stockage persistant.

## User stories

1. En tant qu'utilisateur d'un système clair, je veux démarrer en clair pour retrouver mon apparence préférée.
2. En tant qu'utilisateur d'un système sombre, je veux démarrer en sombre pour retrouver mon apparence préférée.
3. En tant qu'utilisateur, je veux suivre les changements système avant toute bascule pour garder une apparence cohérente.
4. En tant qu'utilisateur, je veux basculer manuellement pour adapter immédiatement ma lecture.
5. En tant qu'utilisateur, je veux un bouton indiquant l'action disponible pour comprendre le résultat d'un clic.
6. En tant qu'utilisateur au clavier, je veux atteindre et activer ce bouton avec un focus visible pour choisir sans souris.
7. En tant qu'utilisateur ayant choisi un thème, je veux ignorer les changements système pour garder le contrôle.
8. En tant qu'utilisateur, je veux basculer plusieurs fois sans réactiver le suivi système pour conserver le caractère manuel de mon choix.
9. En tant qu'utilisateur, je veux conserver mon choix entre l'accueil et le tableau pour éviter un changement inattendu.
10. En tant qu'utilisateur, je veux reprendre la préférence système au rechargement pour repartir sans choix mémorisé.
11. En tant qu'utilisateur, je veux lire cartes, colonnes, descriptions et contrôles dans les deux thèmes pour utiliser le tableau confortablement.
12. En tant qu'utilisateur, je veux conserver liens, navigation et disposition responsive pour retrouver toutes les fonctionnalités existantes.

## Comportements attendus

Deux modes de pilotage existent : **suivi système** et **choix manuel**. Le thème affiché est toujours clair ou sombre ; le mode de pilotage n'est pas un troisième thème.

| Événement | Suivi système | Choix manuel |
| --- | --- | --- |
| Chargement ou rechargement complet | Appliquer la préférence système actuelle | Revenir au suivi système avec la préférence actuelle |
| Changement système | Appliquer la nouvelle préférence | Conserver le thème affiché |
| Activation du bouton | Afficher le thème opposé et passer en choix manuel | Afficher le thème opposé et rester en choix manuel |
| Navigation interne entre `/` et `/board` | Conserver le suivi système | Conserver le thème et le choix manuel |

En clair, le bouton indique « Passer en mode sombre ». En sombre, il indique « Passer en mode clair ». Son nom accessible correspond à cette action.

## Critères d'acceptation

- **CA1 — Initialisation :** l'accès direct à `/` ou `/board` affiche le thème correspondant à la préférence système actuelle, claire ou sombre.
- **CA2 — Suivi :** avant toute bascule manuelle, les changements système dans les deux sens modifient le thème sur chacune des routes.
- **CA3 — Bascule :** chaque activation affiche le thème opposé et actualise le libellé du bouton.
- **CA4 — Priorité manuelle :** après la première bascule, aucun changement système ne modifie le thème jusqu'au rechargement.
- **CA5 — Retour à un thème identique :** revenir manuellement au thème actuel du système ne réactive pas le suivi système.
- **CA6 — Navigation :** les transitions internes entre `/` et `/board` conservent thème et mode de pilotage, y compris précédent/suivant dans cette navigation interne.
- **CA7 — Rechargement :** un rechargement complet sur chaque route abandonne le choix manuel et reprend la préférence système du moment.
- **CA8 — Stockage :** aucun choix de thème ni mode de pilotage n'est mémorisé dans localStorage, sessionStorage, cookies, base locale ou stockage distant.
- **CA9 — Clavier :** bouton accessible par Tab, activable par Entrée et Espace, focus visible et nom accessible explicite.
- **CA10 — Lisibilité :** fonds, titres, descriptions, colonnes vides, bordures, liens, navigation active et contrôles restent discernables dans les deux thèmes, au survol et au focus. Appliquer les seuils WCAG AA : contraste d'au moins 4,5:1 pour le texte normal et 3:1 pour les grands textes et les composants visuels essentiels. Réutiliser au maximum les mécanismes de theming de Chakra UI.
- **CA11 — Non-régression :** conserver les liens existants, l'ordre des colonnes/cartes, les descriptions facultatives, le message de colonne vide et le responsive à une, deux ou quatre colonnes.

## Cas limites

- Bascules répétées : la parité des activations détermine le thème ; le pilotage reste manuel après la première activation.
- Préférence système devenue identique au choix manuel : cette égalité ne change pas le mode de pilotage.
- Changement système après navigation : suivi actif sans bascule préalable, suspendu sinon.
- Accès direct à `/board` : mêmes règles que sur `/`, sans passage préalable par l'accueil.
- Nouvel onglet : initialisation indépendante selon le système, sans partage du choix manuel.
- Aucune demande de thème sombre détectée : utiliser le thème clair. La prise en charge d'un navigateur dépourvu d'API de préférence système n'a pas été validée comme exigence.
- React StrictMode : les montages de vérification ne doivent pas accumuler d'abonnements ni altérer le bouton.
- Description absente, colonne vide ou texte long : préserver le contenu, la lisibilité et le comportement responsive.

## Décisions d'implémentation

- Réutiliser React, Chakra UI et le Header/Layout partagés ; privilégier une solution simple sans nouvelle dépendance.
- Garder le choix manuel uniquement en mémoire, dans une portée survivant à la navigation interne.
- Lire la préférence via le mécanisme navigateur prévu pour la préférence de couleur ; écouter ses changements et nettoyer les abonnements.
- Réutiliser les mécanismes de thème et couleurs sémantiques Chakra UI, y compris pour les surfaces, textes, contrôles et styles de navigation.
- Ne modifier ni modèle de tableau ni données ; aucun nouvel appel réseau métier.
- Le détail du hook ou du partage d'état reste un choix d'implémentation et non un critère d'acceptation.

## Décisions de test et vérifications nécessaires

**Point de test validé : l'application dans le navigateur**, avec émulation de la préférence système et interactions sur le Header et la navigation. Vérifier tous les scénarios fonctionnels sur `/` et `/board`, en privilégiant Chrome DevTools MCP s'il est disponible et utilisable ; sinon effectuer des tests manuels et consigner leurs résultats. Tester les comportements observables, sans dépendre des classes CSS ou de la structure interne des hooks. Aucun dispositif de tests applicatifs n'est actuellement documenté dans le dépôt. Ne pas introduire de framework de tests supplémentaire sans justification.

Exécuter les scénarios sur `/` et `/board`, en réinitialisant par rechargement entre les scénarios indépendants :

| Scénario | Résultat attendu |
| --- | --- |
| Accès direct avec système clair puis sombre | Thème et libellé corrects |
| Changement système dans les deux sens sans clic | Le thème suit |
| Bascule manuelle puis changements système dans les deux sens | Le choix manuel reste affiché |
| Deux bascules ramenant au thème système puis changement système | Le suivi reste suspendu |
| Navigation aller-retour sans bascule | Le suivi reste actif |
| Navigation aller-retour après bascule, puis précédent/suivant | Le choix manuel reste actif |
| Rechargement après bascule avec préférence système différente | Reprise de la préférence actuelle |
| Tab, Entrée et Espace | Focus visible, activation et libellé corrects |
| Inspection du code et des stockages | Aucune mémorisation du choix de thème |
| Deux thèmes sur mobile et bureau | Textes, surfaces, bordures, états des liens et contrôles lisibles ; contrastes vérifiés |
| Liens et tableau | Données, ordre, descriptions facultatives, colonne vide et responsive préservés |

Compléter par `npm run build` et `npm run lint`. Distinguer avertissements préexistants et régressions. Les essais d'une version antérieure ne valent pas validation de la future implémentation approuvée.

## Hors périmètre

- Persistance et synchronisation du thème entre sessions ou onglets.
- Troisième option « automatique » ou retour au suivi système sans rechargement.
- Refonte visuelle, modification des données ou nouvelles fonctionnalités métier.
- Garantie formelle d'absence de flash avant le premier rendu : non discutée et non ajoutée comme exigence.

## Notes complémentaires

- Q1, Q2 et Q3 du grill-with-docs ont été explicitement validées par l'utilisateur.
- Le point de test navigateur et les seuils WCAG AA ont été validés avec les précisions intégrées ci-dessus. Privilégier une solution simple, maintenable et cohérente avec l'architecture existante.
- Aucune consigne distincte du professeur concernant Sprint 3 n'a été trouvée dans le dépôt. Cette spécification repose sur les exigences fournies et les décisions validées.
- Le statut `ready-for-agent` suit la convention du skill to-spec. La spécification est validée ; aucun point bloquant de spécification ne subsiste. L'utilisateur demande de ne pas commencer ni poursuivre l'implémentation à ce stade : la validation du document ne vaut pas autorisation de reprise du code.
- Des modifications de code ont été réalisées avant la demande de spécification. Ce document ne les approuve pas ; aucune modification supplémentaire du code applicatif n'est effectuée pour cette demande.
