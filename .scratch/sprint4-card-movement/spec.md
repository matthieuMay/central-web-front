# Sprint 4 — Déplacements persistants des cartes

Status: ready-for-agent
Validation utilisateur : décisions Wayfinder validées ; présente spécification soumise à validation.
Autorisation : rédaction uniquement ; ni to-tickets ni implémentation à ce stade.

## Problème

L'utilisateur doit déplacer et réordonner ses cartes au clavier ou par drag-and-drop, retrouver leur position après rechargement et recevoir une confirmation fiable. Le checkout actuel affiche un tableau statique ; le Sprint 2 possède des interactions réutilisables, mais ses déplacements restent locaux et son helper PUT n'est pas connecté.

## Solution

Lire le tableau depuis l'API existante avec TanStack Query et conserver ce tableau confirmé comme source de vérité. Clavier et drag-and-drop produisent la même intention de déplacement, envoyée au serveur sans réorganisation optimiste. Après confirmation, afficher la réponse, préserver le focus et célébrer uniquement une arrivée depuis une autre colonne dans la dernière colonne, sans confettis lorsque les mouvements sont réduits.

## User stories

1. En tant qu'utilisateur, je veux charger mon tableau enregistré afin de travailler sur les données actuelles.
2. En tant qu'utilisateur, je veux voir le chargement et les erreurs afin de savoir si le tableau est disponible.
3. En tant qu'utilisateur au clavier, je veux atteindre et sélectionner une carte afin de la manipuler sans souris.
4. En tant qu'utilisateur au clavier, je veux déplacer une carte à gauche ou à droite afin de la placer en fin de colonne voisine.
5. En tant qu'utilisateur au clavier, je veux utiliser haut/bas afin de changer sa priorité dans la même colonne.
6. En tant qu'utilisateur, je veux que les limites empêchent les déplacements impossibles afin de conserver un ordre valide.
7. En tant qu'utilisateur à la souris, je veux réordonner une carte par drag-and-drop afin de choisir sa position.
8. En tant qu'utilisateur à la souris, je veux déposer dans une colonne voisine afin de changer l'étape de la carte.
9. En tant qu'utilisateur, je veux une cible avant/après visible afin d'anticiper l'insertion.
10. En tant qu'utilisateur, je veux déposer dans une colonne vide afin de pouvoir l'alimenter.
11. En tant qu'utilisateur, je veux pouvoir annuler un drag sans mutation afin de garder mon tableau intact.
12. En tant qu'utilisateur, je veux distinguer attente et confirmation afin de ne pas croire un déplacement enregistré trop tôt.
13. En tant qu'utilisateur, je veux recevoir une erreur accessible afin de comprendre un refus ou une panne.
14. En tant qu'utilisateur, je veux une seule mutation en cours afin d'éviter des déplacements fondés sur un ordre périmé.
15. En tant qu'utilisateur au clavier, je veux conserver le focus après déplacement afin de poursuivre mon travail.
16. En tant qu'utilisateur, je veux retrouver mes déplacements après rechargement afin de ne pas perdre mon organisation.
17. En tant qu'utilisateur, je veux préserver les autres informations des cartes afin qu'un mouvement n'altère pas leur contenu.
18. En tant qu'utilisateur, je veux une célébration après une arrivée réellement confirmée dans la dernière colonne afin de reconnaître cette progression.
19. En tant qu'utilisateur préférant les mouvements réduits, je veux une confirmation sans confettis afin d'éviter une animation indésirable.
20. En tant qu'utilisateur, je veux conserver thèmes, navigation et disposition responsive afin de retrouver les acquis du Sprint 3.

## Décisions d'implémentation

### Réutilisation et responsabilités

- Adapter les interactions et helpers du Sprint 2 de manière ciblée, sans merge/cherry-pick automatique ni remplacement des styles du Sprint 3.
- Le module d'accès API porte lecture et PUT ; la page du tableau porte le chargement ; Board/Column/Card portent les interactions, la sélection et le focus ; Confetti porte uniquement l'animation décorative.
- Utiliser useQuery pour le tableau et useMutation pour le mouvement. Le cache conserve le BoardData complet confirmé ; aucune copie locale durable du tableau ni ledger optimiste de création/édition.
- Réutiliser la clé de query du tableau existante. Consommer le signal d'annulation et empêcher une lecture commencée avant le mouvement d'écraser une confirmation plus récente.
- Ne pas ajouter de dépendance ou de schéma backend. Toute exception exige une justification concrète.

### Contrat API existant

| Opération | Contrat |
| --- | --- |
| Lecture | GET /boards/mini-trello → BoardData |
| Mouvement | PUT /cards/:cardId, JSON avec column obligatoire et position facultative → BoardData |
| column | Identifiant de la colonne cible ; identifiant de carte encodé dans l'URL |
| position | Entier sûr basé sur zéro, calculé **après retrait** ; omission = ajout en fin |
| Plage | Même colonne : 0 à longueur initiale − 1 ; autre colonne : 0 à longueur cible ; colonne vide : 0 |
| Refus | 400 pour corps/position invalides, 404 pour carte/colonne absente ; erreurs JSON avec error |

Conserver l'ordre fourni par les tableaux et les champs des cartes : titre, description, assignees, comments avec createdAt, checklistItems. Le PUT ne doit envoyer que column et éventuellement position. Aucun appel aux routes de création, édition, utilisateurs ou commentaires n'est nécessaire.

URL API configurable selon le helper existant, localhost:3000 par défaut ; utiliser une origine frontend compatible avec le CORS documenté localhost:5173. Ne pas lire les secrets pour déterminer ces valeurs. Pas de fallback silencieux vers le tableau JSON statique en cas d'erreur API.

### Clavier et focus

- Cartes accessibles par Tab avec focus visible. Conserver la sélection par clic/Entrée/Espace et la désélection par Échap ; état sélectionné perceptible visuellement et par les aides techniques.
- Les flèches s'appliquent à la carte sélectionnée ayant le focus, jamais depuis un champ, lien, bouton interne ou autre commande. Éviter une sémantique de bouton contenant d'autres boutons.
- Gauche/droite : colonne immédiatement précédente/suivante dans l'ordre du tableau, insertion en fin ; la disposition responsive ne change pas le voisinage.
- Haut/bas : déplacer d'un rang dans la colonne actuelle. À l'indice i, la cible est i−1 ou i+1 après retrait.
- Une limite, une carte/cible absente ou un mouvement sans effet ne produit ni PUT ni célébration et conserve le focus.
- Après succès, conserver la sélection et restaurer le focus sur la carte déplacée ; après refus, le garder sur la carte d'origine. Ne pas voler le focus si l'utilisateur l'a volontairement déplacé ailleurs pendant l'attente. Si la carte n'existe plus après resynchronisation, effacer la sélection et proposer un focus de repli sur le tableau.

### Drag-and-drop et positions

- Drag natif réutilisable : transmettre l'identifiant de carte, valider sa présence dans le tableau confirmé et autoriser uniquement la colonne actuelle ou une voisine.
- Moitié supérieure d'une carte cible = avant ; moitié inférieure = après. Afficher un repère d'insertion distinct du contenu enregistré. Le vide de la colonne sert de zone de fin ; une colonne vide accueille à l'indice 0.
- Calculer la cible sur la liste sans la carte déplacée, pour éviter le décalage dans la même colonne. Exemple [A,B,C], B après C → [A,C,B], position 2 ; B avant A → [B,A,C], position 0.
- Un dépôt sur la position actuelle, sur la carte elle-même, dans une colonne distante ou hors cible est sans effet. Nettoyer le repère au dépôt, à la sortie de zone, à l'annulation et au démontage.
- À la confirmation d'un drag, rendre la carte déplacée sélectionnable/focusable dans sa destination sans détourner le focus d'une autre commande utilisée entre-temps.

### Confirmation, attente et erreurs

| État / événement | Comportement observable |
| --- | --- |
| Chargement initial | Statut de chargement, puis tableau GET ; erreur accessible si indisponible |
| PUT en cours | Tableau confirmé inchangé, attente annoncée ; nouvelles intentions de déplacement bloquées, sans file d'attente |
| Succès exploitable | Appliquer BoardData complet, annoncer le résultat, gérer le focus ; évaluer la célébration |
| Refus explicite | Aucun déplacement affiché comme enregistré, erreur accessible, reprise des commandes sur l'état fiable |
| Résultat inconnu | Perte réseau, réponse illisible/incohérente ou erreur pouvant masquer une écriture : annoncer l'incertitude et relire GET ; pas de célébration |
| Resynchronisation échouée | Dernier tableau connu identifié comme non actualisé ; mouvements bloqués et possibilité de relancer la lecture |

Une seule mutation par instance frontend, protégée dès l'acceptation de l'intention. Aucun retry automatique du PUT : une répétition pourrait s'appliquer à un ordre changé. Après une issue incertaine, la réussite du GET rétablit un état fiable sans convertir cette lecture en événement de célébration. Aucun contrat de coordination inter-onglets ou de versionnement supplémentaire n'est introduit.

### Confettis et mouvements réduits

- Comparer la colonne source confirmée avant PUT et la colonne de la carte dans la réponse valide. Célébrer seulement si la source était différente et la destination confirmée est la dernière colonne dans l'ordre de la réponse ; ne pas coder done en dur.
- Une mutation éligible déclenche un événement unique. Une lecture, invalidation, réorganisation interne, annulation, limite, erreur ou rechargement ne célèbre jamais. Une sortie puis une nouvelle entrée réelle peuvent célébrer à nouveau.
- Adapter Confetti sans refonte : déclencheur explicite, formes stables, nettoyage des particules/timeouts, conteneur décoratif qui ne bloque pas les interactions ni ne provoque de débordement. Prévenir les doubles événements sous StrictMode.
- prefers-reduced-motion actif : aucune génération/animation de confettis. Activation pendant une animation : arrêt immédiat ; désactivation : pas de replay d'un événement passé. La confirmation accessible demeure ; ne pas introduire de nouvelle animation de déplacement indispensable.

## Décisions de test

Point de test principal déjà retenu dans Wayfinder et validé avec ses décisions : **l'application dans le navigateur**, avec observation HTTP comme preuve du même scénario. Tester les résultats externes — ordre, colonne, focus, statut, requête et célébration — plutôt que la structure des hooks, les classes internes ou le cache privé. Les modules API/tableau/interactions/Confetti sont couverts ensemble par ce point de test.

Réutiliser Chrome DevTools MCP, les scénarios et mesures de contraste du Sprint 3. Les tests backend existants renseignent le contrat mais ne prouvent pas l'intégration frontend. Aucun nouveau framework prévu ; si des tests automatisés supplémentaires deviennent nécessaires, justifier le besoin et convenir de leurs points de test avant de les écrire.

### Critères d'acceptation observables

| Critère | Vérification et résultat attendu |
| --- | --- |
| CA1 — Lecture | Accès direct /board : GET réel, état chargement/erreur visible, tableau serveur et champs enrichis conservés, aucun fallback JSON |
| CA2 — Sélection | Tab, clic, Entrée/Espace, Échap : sélection accessible et focus visible ; aucune flèche interceptée dans un champ/contrôle |
| CA3 — Horizontal | Gauche/droite déplace en fin de voisine après confirmation ; limites extrêmes n'envoient aucun PUT |
| CA4 — Vertical | Haut/bas échange avec le rang adjacent ; première/dernière carte bloquées aux limites ; indice HTTP correct après retrait |
| CA5 — DnD interne | Déposer avant/après et en fin dans la même colonne : ordre et position HTTP conformes, notamment B après C dans [A,B,C] |
| CA6 — DnD voisin | Dépôt précis dans une voisine, y compris vide à position 0 ; colonne distante refusée ; cancellation et dépôt sans effet sans PUT |
| CA7 — Attente | Retarder la réponse : ordre inchangé avant succès, statut d'attente, aucune seconde mutation ni intention mise en file |
| CA8 — Confirmation/focus | Succès PUT : réponse complète affichée, sélection/focus cohérents ; une ancienne lecture retardée n'écrase pas le résultat |
| CA9 — Refus/incertitude | Refus simulé avant écriture : ordre inchangé, erreur accessible, aucun confetti ; perte de réponse après enregistrement : GET réconcilie sans retry PUT ni célébration |
| CA10 — Persistance | Après succès et rechargement complet, GET retrouve colonne/ordre ; descriptions, assignations, commentaires datés et checklists restent intacts |
| CA11 — Célébration | Réponse retardée : aucun confetti avant succès ; une seule célébration après arrivée externe en dernière colonne ; rien lors d'une réorganisation interne, lecture ou rechargement |
| CA12 — Reduced-motion | Préférence active avant mouvement : zéro confetti ; activation pendant animation : arrêt ; désactivation : aucun replay ; annonce de succès conservée |
| CA13 — Non-régression | / et /board : navigation et historique, dark mode CA1–CA9 du Sprint 3, grille 1/2/4 colonnes à 375/800/1440 px, texte long, colonne vide ; pas de débordement |
| CA14 — Lisibilité | Dans les deux thèmes : sélection, focus et repère de dépôt discernables ; textes ≥4,5:1, grands textes et composants essentiels ≥3:1, mesures des styles affichés |
| CA15 — Hygiène | StrictMode/démontage sans accumulation d'abonnements, handlers ou timers ; npm run lint, npm run build avec typage et git diff --check sans nouvelle régression |

Tester les cas haut/bas dans une colonne à une seule carte, plusieurs mouvements successifs confirmés, et navigation pendant attente sans mise à jour UI/célébration tardive sur une vue démontée. Pour les pannes, distinguer refus avant écriture et résultat réseau incertain après écriture. Consigner chaque résultat et tout scénario impossible à exécuter ; ne pas qualifier un test non exécuté de réussi.

## Hors périmètre

- Modification du backend, nouveau contrat API, schéma, migration, reset ou suppression de volume.
- Démarrage de l'API sans autorisation explicite ; lecture des secrets .env.
- Création/édition de cartes, utilisateurs, commentaires, assignations et checklists ; leurs données sont seulement préservées.
- Dépôt vers une colonne non voisine, coopération multi-utilisateur, file d'attente de mouvements et persistance locale alternative au serveur.
- Merge/cherry-pick automatique du Sprint 2, refonte complète, ajout de dépendance sans justification ou correction générale sans lien avec le Sprint.
- Implémentation et découpage to-tickets avant validation de cette spécification.

## Notes complémentaires

Sources de cadrage : [carte Wayfinder](map.md), [contrats backend vérifiés](backend-contracts.md), [réutilisation du Sprint 2](sprint2-reuse.md). Backend inspecté au commit 9ab0b4a, Sprint 2 au commit 5387444. Les consignes professeur ont été fournies et les décisions validées par l'utilisateur.

La disponibilité effective de l'API et sa connexion PostgreSQL ne sont pas encore testées. Dev/start du backend appelle une préparation pouvant migrer/seeder et compléter les anciens commentaires : une autorisation spécifique est requise avant lancement. Ne pas substituer une base différente pour prétendre valider la persistance existante.

Les deux avertissements préexistants de Confetti et celui de taille de bundle doivent être distingués des régressions. Les adaptations de Confetti nécessaires à cette fonctionnalité sont dans le périmètre, contrairement à un nettoyage général.

Le statut ready-for-agent suit la convention to-spec et ne vaut pas autorisation d'implémenter. Étape suivante après validation utilisateur : to-tickets.
