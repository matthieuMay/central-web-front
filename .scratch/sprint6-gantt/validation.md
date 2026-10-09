# Sprint 6 — Vérification du 9 octobre 2026

## Vérifications automatiques

- `npm test` : 30 tests réussis, dont 13 tests du calendrier.
- Dates : sept jours inclusifs, années bissextiles, mois, changement d’heure, déplacement à durée constante, deux poignées et minimum un jour.
- Historique : lectures confirmées, déplacements optimistes et annulations ignorés, absence, doublons, fin, réouverture et première observation.
- Stockage : sauvegarde/rechargement/export/import, identifiants inconnus, doublons, dates invalides, version incorrecte, stockage inaccessible ou JSON invalide sans écrasement, conflit entre onglets.
- Démo : initialisation unique, phases antérieures à la lecture réelle, backlog futur sans fausse phase de vérification, progression cohérente avec la colonne actuelle et un seul repère de fin.
- `npm run lint`, `npm run build` et `git diff --check` : réussis. Le build signale un bundle JavaScript supérieur à 500 Ko.
- Aucun changement dans `src/api/` depuis le début de Sprint 6.

## Navigateur

Chrome headless isolé via Puppeteer déjà installé, frontend à **http://localhost:5173**. Lectures et écritures API interceptées avec un tableau de quatre cartes ; aucune écriture sur le serveur réel. Les données temporaires appartiennent au profil de test.

- Premier lancement : périodes de démo, phases identifiées et liste compacte de titres ; éditeur de dates replié.
- Drag HTML5 natif d’un titre sur une date : période déplacée, durée conservée, aucune écriture API.
- Gestes natifs : resize aux deux extrémités, déplacement, Échap pour annuler ; resize au clavier.
- Export JSON identique à la sauvegarde, import validé avec confirmation, annulation, rejet d’un fichier invalide et conservation des données.
- Retrait de l’historique simulé suivi d’un rechargement : les dates restent et la démo ne revient pas automatiquement.
- Kanban : déplacement confirmé et enregistré dans l’historique réel, rejet simulé avec rollback sans événement ajouté ; drag natif vers une colonne vide.
- Ordinateur 1440 × 900 et mobile 390 × 844, clair et sombre : captures inspectées, absence de débordement de page et d’erreur JavaScript, titres fixes lors du défilement horizontal. Les phases colorées, les poignées et les repères de fin restent distincts.

## Limites

Le matériel MacBook/trackpad physique n’a pas été testé ; la page dédiée rapproche les titres des dates pour éviter le défilement pendant le drag. Sur mobile, le réglage des dates sert d’alternative au drag HTML5. Les tests de mutation du Kanban utilisent des réponses simulées, pas des écritures sur l’API réelle. L’historique demeure local et partiel ; les dates simulées sont explicitement identifiées.
