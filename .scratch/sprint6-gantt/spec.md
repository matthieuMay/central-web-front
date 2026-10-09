# Sprint 6 — Gantt local

Status: ready-for-agent

## Intention et conception

Planifier les cartes existantes depuis le Kanban vers un Gantt sur la même page, sans modification de `src/api/` ni du backend. Une carte a une période prévue et un historique indépendant des statuts confirmés.

Skills lus : design-taste-frontend, gpt-taste, ui-ux-pro-max, frontend-design. UI UX Pro Max est déjà installé. Recherche effectuée dans sa base de recommandations ; les prescriptions de sites marketing sont écartées au profit du brief de cette interface de travail.

```text
Titre du tableau                         Nombre de cartes
Actions Kanban
┌────────────── Kanban compact, défilant ──────────────┐
│ Backlog       Doing          Review       Done       │
└─────────────────────────────────────────────────────┘
Planning                    Aujourd’hui   ← semaine →
Légende des statuts                           JSON ↗ ↙
Carte / dates / actions (alternative au glisser-déposer)
┌─────────────┬───────── dates fixes ──────────────────┐
│ Titres fixes│ lun mar mer jeu ven sam dim …          │
│ Carte, noms │   Prévu  [────────────]                │
│ Checklist   │   Réel  [gris][bleu][orange]◆          │
└─────────────┴───────────────────────────────────────┘
```

Typographie et surfaces existantes ; grille neutre, accent bleu existant, couleurs sémantiques stables pour les colonnes. L’historique incertain combine hachures, texte et dates accessibles. Les poignées et commandes restent utilisables au clavier et les dates s’affichent pendant la manipulation. Pas de nouvelle dépendance.

## Contrat

- Sept jours calendaires au premier dépôt ; un nouveau dépôt conserve la durée. Déplacement et redimensionnement aux jours entiers, minimum un jour ; retrait du planning sans supprimer l’historique.
- Quatre semaines, navigation par semaine, aujourd’hui et week-ends visibles. Membres et progression de checklist.
- JSON v1 par tableau dans localStorage : identifiants de cartes, périodes inclusives, observations UTC, dernière observation. Export/import validé, remplacement confirmé. Erreurs sans écrasement des sauvegardes existantes.
- Les lectures réseau réussies sont la seule source d’historique. Les changements locaux confirmés sont datés à leur observation ; les changements externes et reprises après absence indiquent l’intervalle inconnu. Les modifications optimistes ne comptent pas.
- L’historique commence à la première observation. `done` marque une fin ; une réouverture reprend la barre. Les périodes prévues n’altèrent jamais les événements réels.
- Données locales, non partagées. L’historique de statuts ne mesure pas du temps de travail.

## Validation prévue

Tests purs de dates, manipulation et parsing ; tests de stockage et observation du cache Query réel ; tests existants, lint et build. Revue navigateur ordinateur/mobile, thèmes clair/sombre, clavier, drag/resize et absence de requêtes d’écriture lors de la planification.
