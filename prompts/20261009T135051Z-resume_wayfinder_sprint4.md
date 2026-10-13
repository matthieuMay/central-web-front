Je souhaite poursuivre le workflow Wayfinder du Sprint 4, sans recommencer le travail déjà effectué.

Voici les informations qui manquaient lors de ton audit.

1. Consignes du professeur : clavier gauche/droite vers colonnes voisines ; haut/bas pour ordre interne ; respect des limites ; drag-and-drop même colonne ou voisine, insertion visée et colonne vide ; confettis après arrivée confirmée dans dernière colonne ; prefers-reduced-motion ; persistance après rechargement.

Contrat : PUT /cards/:cardId, body {"column":"doing","position":1}, réponse BoardData. Position basée sur zéro après retrait ; sans position, ajout à la fin.

2. Backend : C:\Users\hugoc\central-web-api ; dépôt officiel https://github.com/matthieuMay/central-web-api ; origin/main récent 9ab0b4a (mutations, utilisateurs, assignations/checklists, commentaires datés, migrations PostgreSQL). PostgreSQL fonctionne avec Docker port 5432. Vérifier commit local, routes, contrats et démarrage en lecture seule. Ne pas lire les secrets .env, modifier backend ou lancer migrations sans autorisation.

3. Examiner hugoc/sprint2 en lecture seule pour déplacements et DnD réutilisables, sans merge/cherry-pick.

4. Décisions validées : gauche/droite en fin de voisine ; haut/bas interne ; DnD même colonne/voisine ; une mutation réseau à la fois ; aucun refus serveur présenté enregistré ; confettis après confirmation API arrivée d'une autre colonne dans dernière ; aucun confetti reduced-motion. Privilégier TanStack Query installé.

5. Reprendre cinq tickets existants, résoudre questions possibles, signaler seulement décisions importantes restantes, proposer to-spec une fois cadrage complet. Respecter AGENTS.md ; archiver prompt sans lire anciens. Aucun code applicatif ni implémentation. Répondre français.
