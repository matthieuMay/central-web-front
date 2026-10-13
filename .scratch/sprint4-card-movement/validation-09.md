# Ticket 09 — Validation globale du 13 octobre 2026

Sources : [ticket 09](issues/09-confirmed-confetti-validation.md), [spécification Sprint 4](spec.md), [validation 08](validation-08.md), [spécification du thème Sprint 3](../sprint3-dark-mode/spec.md).

## Périmètre et environnement

Implémentation du seul ticket 09, au-dessus des tickets 06/07/08 validés. Prompt initial archivé sans lecture des anciens prompts ; messages de reprise non archivés.

Au départ, API et Docker inaccessibles : signalement avant tests réels et aucun démarrage backend par l'agent. L'utilisateur a redémarré les services puis autorisé les tests d'intégration et PUT sur le tableau de développement. GET /health et GET /boards/mini-trello vérifiés. Frontend sur localhost:5173, API sur localhost:3000, PostgreSQL annoncé opérationnel par l'utilisateur. Aucun backend modifié, secret lu, migration supplémentaire, reset, suppression de données, commit ou push.

Point de test : application dans Chrome DevTools MCP avec observation des réponses HTTP. Drags natifs distingués des compléments synthétiques. Aucun framework ni dépendance ajoutés. Les simulations sont des adaptations temporaires de fetch/matchMedia/DOM dans les onglets de test, absentes du code applicatif ; les onglets contenant ces adaptations ont été fermés.

## Changements

- `src/pages/BoardPage.tsx` : capture de la source confirmée avant mutation ; succès PUT conserve le BoardData retourné pour évaluer la dernière colonne dans son ordre réel. Célébration seulement si la carte y arrive depuis une autre colonne, réponse valide, instance encore montée et aucune réconciliation GET.
- `src/components/Confetti.tsx` : déclencheur explicite `celebrate()` ; 40 particules générées hors rendu, formes stables, animation Motion existante conservée. Conteneur décoratif aria-hidden, pointer-events none, fixe et sans débordement.
- Préférence reduced-motion lue avant génération ; changement actif nettoie particules et timer immédiatement. Désactivation sans replay. Abonnement et timer nettoyés au démontage. Aucune célébration dérivée d'une lecture ou d'un effet rejoué par StrictMode.
- Instructions et annonces accessibles du mouvement restent indépendantes de l'animation. Helpers API, interactions clavier et DnD 06–08 réutilisés.

## Matrice CA1 à CA15

| Critère | Vérification effectuée et résultat |
| --- | --- |
| CA1 lecture | Accès direct et reload avec GET réel. GET retenu : « Chargement du tableau… », aucune carte au chargement initial. GET initial en échec simulé : erreur accessible, zéro carte et zéro confetti, aucun fallback statique ; reprise explicite réelle retrouve six cartes. |
| CA2 sélection | Tab atteint carte et bouton du thème ; clic/Entrée/Espace sélectionnent, Échap désélectionne, libellé accessible et focus visible. Input/textarea/select/button/lien/contenteditable temporaires : 24 événements des quatre flèches sans preventDefault ni PUT. ArrowRight également envoyé réellement via MCP sur input : focus input, aucun PUT. |
| CA3 horizontal | Déplacements Doing → Review et retour via flèches : insertion en fin, PUT column seul, focus/sélection conservés. Carte en première colonne vers gauche et en dernière vers droite : aucune mutation supplémentaire. |
| CA4 vertical | Card-2 dans `[card-3,card-2,card-1]` : haut position 0, bas positions 1 puis 2, puis retour position 1. Première/dernière et carte seule : aucun PUT aux limites. Fixture de réponse à une seule colonne et une seule carte : quatre flèches, zéro PUT, focus conservé. |
| CA5 DnD interne | Drags natifs isTrusted=true : B après C dans `[A,B,C]` → position 2 et `[A,C,B]` ; B avant A → position 0 ; dépôt en fin → position 2. Petites cibles géométriques temporaires permettent de viser précisément les moitiés ; supprimées au reload. |
| CA6 DnD voisin | Drags réels dans les deux directions : Doing → backlog en fin, position 1 ; backlog → Doing avant card-1, position 1, retour à `[card-3,card-2,card-1]`. Doing → Review vide : position 0. Review → Done en fin : position 1. Colonne distante, fin déjà occupée par la source et dépôt hors tableau : aucun PUT ; repères absents après dépôt/annulation. |
| CA7 attente | PUT réel Review → Done dont la réponse est retenue côté navigateur : une seule mutation malgré deux flèches, tableau encore dans Review, statut d'attente, zéro particule. Toutes les cartes draggable=false pendant attente. Libération seulement ensuite : affichage confirmé et célébration unique. Aucun mouvement mis en file. |
| CA8 confirmation/focus | Après succès : carte sélectionnée et focalisée dans sa destination. Focus volontairement placé sur bouton du thème pendant PUT : reste sur ce bouton après confirmation/célébration. Carte absente d'une réponse GET de réconciliation simulée : sélection effacée et focus tableau. GET ancien retenu après remount : nouvelles intentions bloquées, aucun PUT pendant lecture ; pas de chevauchement pouvant écraser la confirmation. Navigation /board → / → /board pendant PUT : aucune annonce/célébration tardive de l'ancienne instance. |
| CA9 refus/incertitude | 400 simulé avant écriture : erreur, origine conservée, aucun confetti. Perte simulée de réponse après PUT réellement enregistré : un PUT/un GET, état réconcilié, aucun retry PUT ni célébration. GET de réconciliation en échec : un PUT/un GET, état non actualisé, mouvements bloqués, relance explicite réelle sans célébration. |
| CA10 persistance | Plusieurs succès clavier/DnD puis reload complet : GET retrouve colonne et ordre affichés. Comparaison finale du BoardData réel complet à la sauvegarde HTTP initiale : égalité exacte, titres/descriptions/collections compris. Limite des collections non vides ci-dessous. |
| CA11 célébration | Observer DOM : une émission de 40 particules uniquement après réponse PUT libérée. Réorganisation dans Done, limites, refus, résultat incertain, GET et reload : aucune nouvelle émission. Arrivée par drag : une émission ; sortie puis nouvelle entrée : seconde émission distincte. Fixture de réponse ordonnée `[sprint-backlog,doing,done,review]` : arrivée depuis Doing dans Review célèbre, prouvant que done n'est pas codé en dur. |
| CA12 mouvement réduit | Préférence matchMedia simulée active avant PUT : zéro émission/génération, annonce de succès conservée ; désactivation sans replay. Autre arrivée confirmée : 40 particules observées à 50 ms, formes inchangées après rerender du thème ; activation reduce à 100 ms : zéro particule à 125 ms ; désactivation à 150 ms : toujours zéro à 200 ms. |
| CA13 non-régression | / et /board, historique précédent/suivant, suivi système clair/sombre, bascules clavier répétées et maintien du choix manuel après retour au thème système, navigation et reload vérifiés. Aucun stockage de thème observé ; voir détail ci-dessous. Grilles 1/2/4 colonnes à 375/800/1440 px dans les deux thèmes, avec repère actif, sans débordement. Texte long sans espaces à 375 px sans débordement ; colonne vide réellement exercée. |
| CA14 lisibilité | Contrastes des couleurs réellement calculées sur sélection/focus/repère/description, aux trois largeurs et dans les deux thèmes : tableau ci-dessous, tous au-dessus des seuils. |
| CA15 hygiène | StrictMode actif, aucune double émission dans le scénario confirmé. Trois cycles accueil/tableau : abonnement reduced-motion 0 hors tableau, 1 sur tableau, sans accumulation. Démontage pendant animation : 40 particules à 50 ms, zéro après navigation, encore zéro après 2,2 s, aucune erreur console. Lint/build/diff check et deux revues réussis. Pas de profil mémoire prolongé. |

### Preuves spécifiques des confettis

- Réponse retardée : avant libération, `PUT {"column":"done"}` unique, colonne affichée Review, aucune émission ; après confirmation, un conteneur de 40 particules, pointer-events none et aria-hidden=true.
- DnD natif vers Review vide : `{"column":"review","position":0}`, puis vers Done : `{"column":"done","position":1}`. Une émission après cette arrivée ; sortie/entrée au clavier ajoute exactement une émission.
- Réorganisation dans Done : aucun nouvel événement. Reload : aucun conteneur confetti.
- Résultat réseau incertain : un PUT réellement enregistré puis un GET, sans émission ; la relecture n'est jamais convertie en confirmation de célébration.
- Nouvelle dernière colonne Review : fixture modifiant uniquement l'ordre de la réponse PUT, sans toucher les colonnes backend ; le PUT réel Doing → Review donne une émission de 40 particules. Cet essai de contrat utilise un événement clavier synthétique, distinct des scénarios natifs précédents.

### Thème Sprint 3

CA1–CA9 repris sur / et /board : initialisation sombre (fond Header rgb(9,9,11)), suivi clair (fond rgb(255,255,255)) et retour sombre ; bascule par Tab/Entrée/Espace ; deux bascules ramenant au thème système n'activent pas de nouveau le suivi ; choix manuel maintenu avec navigation et historique ; reload sur chacune des routes reprend le système. Nom du bouton cohérent (« Passer en mode clair/sombre »), outline clavier 2 px visible.

Inspection des stockages : aucune clé de thème/couleur localStorage ou sessionStorage, aucun cookie de thème/couleur, zéro base IndexedDB. Le code du thème conserve son choix en mémoire uniquement. Aucune valeur de stockage sensible affichée.

## Contrastes

Mesures de luminance relative à partir des styles affichés, identiques aux trois largeurs.

| Élément | Clair | Sombre |
| --- | --- | --- |
| Texte / fond sélectionné | 16,31:1 | 15,07:1 |
| Bordure de sélection / fond sélectionné | 7,63:1 | 9,68:1 |
| Focus de carte / fond de colonne | 8,47:1 | 10,91:1 |
| Repère de dépôt / fond de colonne | 8,47:1 | 10,91:1 |
| Description / fond de carte | 7,73:1 | 7,76:1 |

## Restauration

État HTTP initial enregistré dans un fichier temporaire avant les tests ; restauration via PUT uniquement, sans création/suppression/reset. Restauration principale : quatre PUT nécessaires, positions déjà correctes ignorées. Les compléments de drag gauche/droite rendent directement card-2 à sa position initiale ; un dernier PUT remet card-4 dans Review après le test de focus pendant attente.

- sprint-backlog : `[card-5]`
- doing : `[card-3,card-2,card-1]`
- review : `[card-4]`
- done : `[card-6]`

GET final : `FullBoardMatchesInitial: true` ; contrôle ultérieur : `FullBoardStillMatchesInitial: true`. Dernier chargement frontend : même ordre, statut vide, zéro confetti. Les descriptions et autres champs réels sont inclus dans cette égalité complète.

## Limites explicites

- Collections assignees/comments/checklistItems réelles vides : conservation vérifiée pour les données existantes. Une réponse HTTP enrichie simulée avec assignee, commentaire daté et checklist non vides est acceptée par le frontend, et le PUT ne transmet que column/position. Leur persistance PostgreSQL non vide n'est pas prouvée ; aucune édition de contenu n'a été autorisée ou effectuée pour fabriquer ces données.
- Préférence reduced-motion modifiée par un adaptateur matchMedia temporaire dans le navigateur, avec événements de changement ; pas de bascule physique du réglage Windows. Le code utilise bien la préférence navigateur réelle en production.
- Tableau à une colonne, disparition de carte, réponse enrichie et changement de dernière colonne sont des fixtures de réponse, pas des modifications du schéma ou des données backend.
- Pas de test avec lecteur d'écran, de drag tactile natif ou de profil mémoire prolongé. Les libellés/roles/focus, le desktop natif, le responsive et le nettoyage d'abonnements/timer sont vérifiés comme indiqué.
- Ancienne lecture protégée par blocage pendant GET : aucune concurrence artificielle via les hooks/cache privés, conformément au point de test convenu.
- Les refus et pertes de réponse sont injectés côté navigateur. Les PUT des scénarios de succès/perte atteignent réellement PostgreSQL via l'API ; ils ne sont pas présentés comme de simples mocks de persistance.

## Vérifications finales

- `npm.cmd run lint` : succès, **aucun avertissement**. Les deux anciens avertissements de Confetti disparaissent grâce aux adaptations nécessaires à la fonctionnalité.
- `npm.cmd run build` : succès, typage inclus. Avertissement bundle >500 kB toujours présent : JS 679,01 kB, gzip 198,80 kB ; le branchement de Motion pour l'animation augmente le bundle par rapport au ticket 08. Aucun framework/dépendance ajouté.
- `git -c safe.directory=C:/Users/hugoc/central-web-front diff --check` : succès ; simple information LF/CRLF de Git.
- Aucune suite unitaire frontend disponible ; matrice navigateur/HTTP convenue exécutée, aucune suite backend destructive lancée.

## Standards

Revue indépendante du diff 09 depuis le code 08 validé, avec AGENTS.md, CONTEXT.md, conventions agents et baseline Fowler : aucun constat. Décision métier dans BoardPage, cycle des particules dans Confetti, noms explicites, Motion réutilisé, nettoyage conforme. Contrôles déjà couverts par le tooling exclus du rapport.

## Spec

Revue indépendante : aucun constat. Source capturée avant PUT et éligibilité dans la réponse valide ; exclusion de GET/refus/incertitude/rechargement/réorganisation ; reduced-motion avant génération, arrêt immédiat, aucun replay ; StrictMode et démontage pris en compte. Cette revue statique ne remplace pas les preuves navigateur consignées ci-dessus.

Résultat final des revues : Standards 0 constat ; Spec 0 constat. Les limites de validation restent celles listées ci-dessus.
