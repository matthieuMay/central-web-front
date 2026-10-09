# Validation des collections des cartes

Date : 2026-10-09. Implémentation des trois tickets et de l’affichage direct des collections sur les cartes ; aucune dépendance ni modification de l’API.

## Environnement et protection des données

Frontend local sur `http://localhost:5173/board`. Les essais navigateur utilisent le serveur API existant lancé séparément sur le port `3001`, avec `DB_DRIVER=sqlite` et `SQLITE_PATH=/private/tmp/central-card-collections-validation.sqlite`. La page de test intercepte ses requêtes `localhost:3000` pour les acheminer vers cette API isolée. Aucune réinitialisation ni écriture dans la base utilisateur ; les commentaires de validation restent uniquement dans la base temporaire.

Le contrat est confirmé par la documentation et le code serveur : `/users` renvoie `UserData[]`, les références utilisent `id`, le PATCH renvoie 200 avec la carte complète et conserve les dates des commentaires existants. Les nouveaux commentaires sont datés par le serveur. Le frontend ignore le corps redondant du PATCH et réconcilie par GET.

## Commandes automatisées

- `npm test` : **17 tests réussis**, dont 5 de construction des collections, 9 de mutation/verrou avec transport contrôlé et 3 de placement existants.
- `npm run build` : TypeScript et Vite réussis. Avertissement Vite de bundle supérieur à 500 kB ; aucun découpage supplémentaire ajouté pour cette fonctionnalité.
- `npm run lint` : réussi, aucune erreur.
- `git diff --check` : réussi.

Les tests couvrent conservation et immutabilité, propriétés omises contre listes vides, dates exactes, références inconnues, descriptions identiques, indices obsolètes, GET préalable, carte disparue, utilisateurs absents ou catalogue en erreur, double déclenchement, concurrence locale et verrou jusqu’à la réconciliation. Les échecs 4xx, 5xx et réseau, la confirmation suivie d’un GET échoué et une connexion perdue après commit simulé sont distingués. Les ajouts ne sont jamais automatiquement répétés.

## Parcours navigateur observés

Vérifications effectuées avec Playwright MCP sur l’API SQLite isolée :

- Commentaire désactivé avant choix explicite de l’auteur, puis publication de deux commentaires successifs ; conservation des dates du premier dans le second PATCH.
- Association successive de deux membres et conservation après recharge.
- Ajout de deux tâches portant la même description ; seule l’occurrence ciblée est cochée au clavier.
- Brouillons du titre et de la description conservés pendant les lectures des collections.
- Fermeture puis retour du focus au crayon ; persistance après recharge et changement de titre sans perte des collections.

- Rejet HTTP 400 intercepté avant le serveur : texte conservé, serveur inchangé, puis publication réussie après nouvel essai explicite.
- PATCH confirmé suivi d’un GET 503 intercepté : texte soumis vidé, toutes les écritures bloquées ; Actualiser relit sans doublon.
- Connexion interrompue avant PATCH : résultat signalé comme incertain, brouillon conservé ; le verrou et Actualiser restent accessibles sur le tableau après fermeture, y compris sur les formulaires de création.
- Deux déclenchements Publier dans le même tour JavaScript : un seul PATCH et un seul commentaire ajoutés.
- Retrait du dernier membre : payload `assignees: []`. Décocher la seconde tâche identique conserve la première occurrence, les autres collections et les dates.

- Catalogue utilisateurs vide : auteur et commentaire désactivés, titre/checklist utilisables, anciens commentaires lisibles. Un GET `/users` 503 intercepté affiche Réessayer ; le catalogue récupère sans fermer le tiroir. La désactivation du sélecteur est portée par `Field.Root` pour respecter le contexte Chakra ; le DOM réel a été revérifié après correction.
- Vue mobile `390 × 844` : tiroir de 320 px de large à droite, aucun débordement horizontal, corps défilant (`scrollHeight: 1858`, `clientHeight: 710`). Trois formulaires frères, aucune imbrication ; Entrée ajoute une tâche et Espace la coche. Capture de contrôle inspectée : `/Users/gaspard/.codex/visualizations/2026/10/09/01a12074-c78a-7301-8e11-fd3c8b358778/browser-evidence/card-collections-mobile.png` (artefact de contrôle conservé hors du dépôt).
- Création d’une carte avec Entrée dans Review : trois listes vides reçues. Déplacement de la carte enrichie de Backlog vers Doing avec À droite et réduction des animations : objet `CardData` complet conservé à l’identique.
- Échec d’un refetch de fond du tableau avec le tiroir ouvert : toutes les écritures désactivées, alerte et Actualiser présents dans le tiroir. Après rétablissement du GET, la récupération annonce « Tableau actualisé… » et réactive les contrôles.

- Référence de membre absente du catalogue : GET `/users` intercepté pour masquer un utilisateur assigné, rechargement affichant sa case cochée avec le libellé « Utilisateur inconnu (id) ». Ajouter une troisième personne conserve les trois IDs serveur ; retirer explicitement la référence inconnue conserve les deux autres membres, les commentaires et la checklist.

Ces essais interceptent les erreurs avant l’API temporaire. Les écritures de succès utilisent l’API réelle isolée. La validation finale indépendante a reconfirmé les 17 tests, build, lint et `git diff --check` après la correction du sélecteur.

## Extension : collections visibles sur les cartes

Après la demande complémentaire de l’utilisateur, les cartes montrent toutes les tâches cochables, chaque membre sous forme d’initiales avec nom accessible et le nombre exact de commentaires, y compris zéro. Le catalogue Query et la mutation existante sont réutilisés ; aucune dépendance supplémentaire.

Vérifications navigateur sur la même API temporaire :

- Cliquer le libellé d’une tâche ne sélectionne pas la carte. La seconde occurrence d’une description dupliquée est la seule modifiée.
- Espace sur une case d’une carte déjà sélectionnée change la tâche sans désélection ; Flèche droite sur cette case ne déplace pas la carte.
- Les autres collections et les dates des commentaires restent intactes, et l’état coché persiste après recharge.
- Ajouter un membre et un commentaire dans le tiroir actualise ensuite directement la carte : trois avatars `CG`, `DC`, `EH` et le compteur exact `6 commentaires` observés.
- À `390 × 844`, la carte mesure 326 px de large ; aucun débordement horizontal dans la carte ou la page.
- Compteur vérifié pour zéro, un et plusieurs commentaires : `0 commentaires`, `1 commentaire`, `6 commentaires`. La capture `browser-evidence/card-collections-card.png` montre aussi la carte finale avec quatre avatars.

`npm test` (17 tests), `npm run build`, `npm run lint` et `git diff --check` réussis après l’ajout ; les scénarios de conservation/verrou utilisent la même mutation que les cases du tiroir. Une tâche confirmée est annoncée comme enregistrée, tandis que la récupération globale explique séparément un échec de lecture.

## Réessai des cases après rejet

Un défaut a été reproduit dans le contrôle natif Ark/Chakra : après un PATCH refusé, la valeur contrôlée du Root et l’état serveur restaient inchangés, mais `HiddenInput.checked` conservait le clic. Le clic suivant ne déclenchait donc pas la mutation. Les trois usages (`Card`, `CardChecklist`, `CardMembers`) synchronisent maintenant la propriété native `checked` avec la valeur serveur lors de chaque rendu via une ref. Aucun remount, ajout de dépendance ou mélange React `checked/defaultChecked`.

Vérifications navigateur déterministes après correction :

- Carte inline : initialement natif `false` et Root `unchecked` ; après rejet 400 intercepté, les deux restent `false/unchecked`. Le clic unique suivant sur le libellé réussit : exactement deux PATCH au total (rejet puis réessai), état final `true/checked`, carte jamais sélectionnée.
- Checklist du tiroir : clic refusé puis une seule touche Espace déclenche le réessai ; état natif cohérent et deux PATCH au total.
- Membre du tiroir : association refusée puis un seul clic sur le libellé suffit à réessayer ; état cohérent et deux PATCH au total.

Les 17 tests, build, lint et diff-check passent après cette correction. Le navigateur constitue ici la vérification du comportement réel de la case, en complément des tests du transport et du verrou.

## Limites et vérifications hors périmètre

Le verrou protège les écritures de ce client. Deux clients peuvent encore remplacer leurs modifications entre GET et PATCH ; des versions serveur ou opérations atomiques seraient nécessaires pour garantir la concurrence externe. Sans identifiant serveur, deux occurrences de checklist identiques modifiées extérieurement ne peuvent pas être distinguées avec certitude. Sans clé d’idempotence, un résultat réseau incertain exige de vérifier la liste avant un nouvel essai.

Authentification, suppression/modification de commentaires et suppression/réorganisation de tâches restent hors périmètre.

Les quatre scénarios de déplacement par glisser-déposer, le drag tactile, plusieurs navigateurs écrivant simultanément et une session complète avec lecteur d’écran n’ont pas été rejoués dans cette validation. Le déplacement par bouton, le ciblage au clavier et les tests de placement couvrent les régressions touchées ; aucun comportement de drag ni configuration d’accessibilité supplémentaire n’a été modifié.

## Fin de validation

Les captures et traces `.playwright-mcp` sont conservées hors du dépôt dans `/Users/gaspard/.codex/visualizations/2026/10/09/01a12074-c78a-7301-8e11-fd3c8b358778/browser-evidence`. Toutes les interceptions réseau ont été retirées ; le navigateur est revenu au frontend réel utilisant l’API utilisateur sur le port 3000. L’instance API temporaire 3001 a été arrêtée (uniquement son PID 26968), sans toucher à l’API utilisateur. La revue indépendante n’a relevé aucune correction restante, y compris sur la synchronisation native des cases.

## Ajustements finaux : couleurs et tâches terminées

La dernière demande ajoute des couleurs aux avatars et masque les tâches terminées uniquement sur les cartes des colonnes. Dans Modifier, toutes les tâches restent présentes ; les tâches cochées sont barrées, et les décocher les fait réapparaître sur la carte. Les dix palettes Chakra sont associées au catalogue trié par ID et utilisent les tokens subtils/foreground pour des cercles et textes contrastés ; les références inconnues restent grises. La palette se répète au-delà de dix utilisateurs.

Ces essais utilisent une fixture de tableau entièrement interceptée, avec GET/PATCH simulés et **aucune écriture vers l’API réelle** :

- Dix utilisateurs connus produisent dix fonds calculés distincts. Une personne conserve sa couleur sur deux cartes dont les membres sont ordonnés à l’inverse ; inverser aussi la réponse GET `/users` conserve les dix couleurs distinctes.
- La tâche déjà terminée à l’index original 0 est masquée. Deux descriptions identiques restent visibles aux indices originaux 1 et 2 ; cliquer la seconde produit un PATCH contenant uniquement `checklistItems` et modifie seulement l’index 2. Une seule tâche reste affichée sur la carte.
- Modifier conserve les trois tâches : les libellés terminés ont `text-decoration: line-through`, le libellé non terminé n’est pas barré. Espace pour décocher la tâche d’index 0 produit un seul PATCH et retire sa décoration ; fermer le tiroir montre de nouveau la tâche sur la carte.
- Recocher les tâches directement sur la carte les masque toutes. Après rechargement de la page, elles restent masquées et les trois éléments sont toujours présents dans la fixture simulée ; aucune suppression de données.

Les 17 tests, build, lint et diff-check passent après ces derniers ajustements. La recharge ci-dessus valide l’affichage à partir de la fixture, sans constituer un essai de persistance serveur supplémentaire ; les essais API réels antérieurs sont décrits dans les sections précédentes.
