# Sprint 6 — Gantt local

Status: ready-for-human

## Intention et conception

Planifier les cartes existantes dans une page Planning dédiée, sans modification de `src/api/` ni du backend. Une liste compacte de titres immédiatement au-dessus des dates évite de devoir faire défiler la page pendant un glisser-déposer au trackpad. Le Kanban garde sa page et ses interactions. Une carte a une période prévue et un historique indépendant des statuts confirmés.

Skills lus : design-taste-frontend, gpt-taste, ui-ux-pro-max, frontend-design. UI UX Pro Max est déjà installé. Recherche effectuée dans sa base de recommandations ; les prescriptions de sites marketing sont écartées au profit du brief de cette interface de travail.

```text
Navigation : Accueil / Tableau / Planning
Titre du tableau
Planning                    Aujourd’hui   ← semaine →
Légende des statuts                           JSON ↗ ↙
Démo identifiée / recharger / retirer les phases simulées
Régler les dates (zone dépliable, alternative au drag)
┌────────── titres à glisser, défilement horizontal ──┐
│ Carte A ⋮    Carte B ⋮    Carte C ⋮                 │
└─────────────────────────────────────────────────────┘
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
- Au premier lancement, planifier les cartes de l’API sans les modifier : backlog dans le futur, cartes en cours ou en vérification avec phases simulées antérieures, cartes terminées avec une seule fin. Ne jamais simuler une étape postérieure au statut actuel. Les phases simulées sont pointillées et nommées au survol/focus. La fenêtre commence la semaine précédente pour rendre ces phases visibles.
- Les sauvegardes existantes sont conservées. « Recharger la démo » exige la confirmation du remplacement des dates et de l’historique locaux. « Retirer l’historique démo » conserve dates et observations réelles. Une carte déjà terminée à sa première observation réelle n’a pas de date de fin inventée.
- Données locales, non partagées. L’historique de statuts ne mesure pas du temps de travail.

## Validation prévue

Tests purs de dates, manipulation et parsing ; tests de stockage et observation du cache Query réel ; tests existants, lint et build. Revue navigateur ordinateur/mobile, thèmes clair/sombre, clavier, drag/resize et absence de requêtes d’écriture lors de la planification.
