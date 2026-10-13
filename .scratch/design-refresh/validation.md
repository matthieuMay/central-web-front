# Refonte UI/UX — validation

13 octobre 2026, branche hugoc/sprint6. Aucun commit ni push.

## Livraison

Thème sémantique turquoise/violet/ciel/lavande, fonds gris clair ou sombres désaturés, surfaces pastel et ombres légères. Header avec marque, navigation active et lien d'évitement. Kanban 1/2/4 colonnes préservé, compteurs et état vide. Cartes avec description courte, checklist, commentaires et initiales accessibles. Fiche centrale de 64rem, sections Membres/Checklist/Commentaires, tous les formulaires. Analytics avec KPI et profils colorés. Accueil avec deux accès directs et illustration décorative sans données fictives.

Nouveaux fichiers : `src/theme.ts`, `src/components/visual/column-tone.ts`, `Surface.tsx`, `StatTile.tsx`, `MemberAvatar.tsx`.

Fichiers modifiés pour la refonte : `src/main.tsx`, `src/index.css`, `src/components/Header.tsx`, `Layout.tsx`, `Board.tsx`, `Column.tsx`, `Card.tsx`, `CardDetails.tsx`, `src/components/card-details/Members.tsx`, `Checklist.tsx`, `Comments.tsx`, `src/components/analytics/MetricBar.tsx`, `SprintOverview.tsx`, `TeamWorkload.tsx`, `src/pages/AnalyticsPage.tsx`, `BoardPage.tsx`, `HomePage.tsx`.

Les changements Sprint 6 préexistants sont conservés. Revue de la refonte contre la copie exacte de src avant modification : `C:/Users/hugoc/AppData/Local/Temp/design-refresh-baseline-20261013T145627Z/src`. Contrôleurs, API/contrats, calculs Analytics, helpers et hook de thème/confettis inchangés. Empreintes du contrôleur et des calculs vérifiées identiques. Prompt initial archivé dans `prompts/20261013T145627Z-design_refresh.md`, aucun ancien prompt lu.

## Étapes et critères

Chaque étape a été suivie de diff-check, build ou vérification navigateur : thème/Header, colonnes/cartes, fiche, Analytics, accueil/finitions.

| Critère | Résultat |
| --- | --- |
| D1 | Tokens adaptatifs, palette et contrastes conformes sur les états mesurés. Compteur turquoise corrigé après détection d'un ratio 4,22:1. |
| D2 | Navigation et lien actif ; Tab puis Entrée sur Aller au contenu place le focus dans main-content. Thème automatique sombre, bascule claire et retour sombre après reload validés. |
| D3 | Accents et compteurs, grille 1/2/4, état vide et absence de débordement vérifiés. |
| D4 | Quatre flèches : positions PUT 1 puis 0, aller/retour vers voisine, focus maintenu. Drag natif interne et vers voisine ; Backlog→Done refusé sans PUT. Marqueur violet 4px observé puis nettoyé. |
| D5 | Fiche 1024px desktop, centrée dans la largeur disponible ; 343px à 375px, scrollWidth=clientWidth=326. Tab reste dedans avec outline 3px ; Échap rend le focus au bouton d'ouverture. |
| D6 | Données réelles inchangées : 6 cartes, 2 terminées (33,3 %), checklist 2/7 (28,6 %), 10 utilisateurs. Sept tests de calcul réussis. |
| D7 | Accueil inspecté par capture ; accès Tableau/Analytics et navigation trois routes fonctionnels. Illustration abstraite aria-hidden. |
| D8 | Survol discret, fiche 160ms. Simulation reduced-motion : transition carte 0s, animation modale none ; confettis 0 avant confirmation, 40 après et 0 après changement de préférence pendant animation. |
| D9 | Aucune dépendance/backend/base/secrets/contrat/controller/commit/push. GET réels uniquement ; écritures simulées dans Chrome. |
| D10 | Contrôles, revues et documentation terminés. |

## Membres, commentaires, checklist et persistance

Tests dans une fixture interceptant window.fetch, avec rechargement depuis sessionStorage uniquement : Maya ajoutée puis retirée conserve Alex ; focus vers Membres après retrait. Nouveau commentaire envoyé sans createdAt ; ancien commentaire/date conservés. Tâche ajoutée, tâche existante cochée/décochée puis renommée sans toucher l'autre. Focus dans le champ d'édition puis sur Modifier après confirmation. Refus 400 : alerte, brouillon conservé, liste inchangée. Reload retrouve les collections et ne rejoue aucun confetti.

Les PUT/PATCH de fixture n'atteignent jamais le backend. Reload réel retrouve les six cartes et card-1 avec Daniel, deux commentaires (dates 2026-10-13T14:06:06.530Z et 2026-10-13T14:06:06.965Z) et cinq tâches. Réseau final : GET seulement ; console sans error/warn.

## Responsive et contrastes

Trois routes × deux thèmes × tailles 1440×900, 768×1024 et 375×812 contrôlées. Largeurs du document ≤ viewport. Captures de l'accueil, du Kanban, de la fiche et d'Analytics inspectées. Le centrage explicite margin:auto et l'alignement supérieur des sections ont été ajustés après inspection.

| Écran | Minimum texte clair | Minimum texte sombre |
| --- | --- | --- |
| Accueil | 4,69:1 | 6,64:1 |
| Tableau | 4,73:1 | 6,14:1 |
| Analytics | 5,06:1 | 7,45:1 |
| Fiche | 4,69:1 | 6,14:1 |

Ratios calculés depuis les couleurs CSS effectives et le fond opaque, avec les deux couleurs du dégradé de l'accueil. Contours des contrôles et paires d'accents/focus dépassent 3:1 ; les textes actifs dépassent 4,5:1. Les contrôles désactivés et éléments décoratifs ne servent pas de preuve AA. Les couleurs de thème basculent instantanément, même dans les boutons Chakra, pour éviter une perte de contraste pendant interpolation ; seules ombres/bordures sont en transition.

## Commandes et revues

```powershell
npm run lint
npm run build
node --experimental-strip-types --test tests/analytics.test.mjs
git diff --check
```

Windows : npm.cmd ; Git avec `-c safe.directory=C:/Users/hugoc/central-web-front`.

- Lint : succès sans avertissement.
- Build TypeScript/Vite : succès ; JS 737,16 kB, gzip 216,45 kB. Avertissement >500kB déjà présent avant refonte.
- Tests existants : 7/7.
- Diff check : succès, avertissements LF→CRLF uniquement.

### Standards

Revue indépendante : 0 constat. Thème et composants partagés, métier séparé, conventions respectées.

### Spec

Revue indépendante et contrôle après finitions : 0 constat restant. Modale, aide repliable et transitions conformes, fichiers métier intacts.

## Limites

Validation Chrome, sans matrice Safari/Firefox ni audit exhaustif lecteur d'écran. Les mesures satisfont les seuils AA sur les états contrôlés, sans constituer une certification complète WCAG.

Le MCP disponible ne propose pas reduced-motion natif : simulation du MediaQueryList et activation des règles CSS correspondantes dans Chrome, sans changer Windows. Persistance des écritures simulée pour ne modifier aucune donnée PostgreSQL ; persistance des données existantes vérifiée par GET réel après reload.

Captures examinées dans la conversation, non exportées : le MCP refuse le chemin local demandé. Résultats et décisions enregistrés ici ; aucun changement de configuration pour cet export facultatif.
