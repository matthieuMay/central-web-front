# Validation finale du ticket 02 — 2026-10-09

Ticket : [02 — Garantir la lisibilité du tableau et préserver les fonctionnalités](issues/02-theme-readability.md).

Implémentation terminée ; aucun commit ni push. Les scénarios ci-dessous ont été exécutés avec Chrome DevTools MCP sur l'application Vite locale, après les modifications finales. Aucun scénario ne reste à réaliser manuellement.

## Travail examiné et conservé

Diff Git et liste des fichiers non suivis examinés avant modification. Les adaptations préexistantes des surfaces (`bg`, `bg.subtle`, `bg.muted`), descriptions (`fg.muted`), liens (`blue.fg`) et navigation ont été réutilisées. Le hook non suivi du ticket 01 a été lu et conservé. Les documents `.scratch/`, prompts existants et modifications de `.codex/config.toml` ont été préservés ; les prompts stockés n'ont pas été lus.

Modifications applicatives de cette intervention : `Card.tsx`, `Column.tsx`, `Header.tsx`, `HomePage.tsx`, `NotFoundPage.tsx`, `index.css`.

- Bordures sémantiques `fg.muted` pour cartes, colonnes, Header et bouton ; ajout d'une bordure aux colonnes.
- Texte du bouton en `fg`, survol en `bg.muted`, focus en `blue.focusRing`.
- Focus des liens des pages en `blue.focusRing`.
- Navigation active soulignée, en complément du fond et du texte bleus ; l'état ne dépend donc pas uniquement de la couleur du fond.

Défauts mesurés avant correction : texte du bouton sombre 1,34:1 ; bordures autour de 1,2:1 ; focus du lien principal clair 2,46:1. Mesures finales ci-dessous.

## Contrastes finaux

Calcul WCAG à partir des styles calculés du navigateur : conversion sRGB en luminance relative, rapport `(Lmax + 0,05) / (Lmin + 0,05)`. Fonds transparents résolus sur les ancêtres ; compositing alpha prévu. Ratios arrondis à deux décimales. Les bordures sont comparées aux deux surfaces adjacentes ; leur minimum est indiqué. Les contours de focus décalés sont comparés au fond extérieur. Les mesures portent sur les couleurs CSS, pas sur les pixels anti-aliasés du texte.

| Élément / état | Clair | Sombre | Seuil |
| --- | ---: | ---: | ---: |
| Texte principal sur fond de page / titre du tableau | 19,06 | 18,09 | 4,5 (3 pour grand texte) |
| Titres des colonnes | 18,10 | 16,97 | 4,5 |
| Titres des cartes | 19,90 | 19,06 | 4,5 |
| Descriptions des cartes | 7,73 | 7,76 | 4,5 |
| Message de colonne vide | 7,03 | 6,91 | 4,5 |
| Navigation inactive | 7,73 | 7,76 | 4,5 |
| Navigation active / survolée, texte et soulignement | 7,63 | 9,68 | 4,5 (texte), 3 (indicateur) |
| Liens des pages, repos / survol / focus | 8,92 | 11,62 | 4,5 |
| Texte du bouton au repos / focus | 19,90 | 19,06 | 4,5 |
| Texte du bouton survolé | 18,10 | 16,97 | 4,5 |
| Bordures cartes / colonnes, minimum adjacent | 7,03 | 6,91 | 3 |
| Séparation du Header, minimum adjacent | 7,41 | 7,37 | 3 |
| Bordure du bouton au repos | 7,73 | 7,76 | 3 |
| Bordure du bouton survolé, minimum adjacent | 7,03 | 6,91 | 3 |
| Focus navigation / bouton | 3,68 | 5,41 | 3 |
| Focus liens des pages | 3,52 | 5,13 | 3 |

Mesures sur `/` et `/board`, y compris survol réel par MCP et focus par Tab. Page introuvable également contrôlée : lien de retour et focus aux mêmes ratios que l'accueil. Les surfaces sont délimitées par les bordures contrastées ; le fond bleu de navigation est accompagné du soulignement contrasté.

## Critères et scénarios navigateur

| Critère | Scénarios exécutés | Résultat |
| --- | --- | --- |
| CA1 | Accès direct `/` et `/board`, préférence claire puis sombre | Thème et libellé corrects |
| CA2 | Changement clair → sombre → clair sans activation sur chaque route | Suivi actif dans les deux sens |
| CA3 | Activation Entrée, Espace et clic ; texte indiquant le thème opposé | Bascule et libellé corrects |
| CA4 | Choix manuel clair puis changements système clair / sombre sur chaque route | Choix conservé |
| CA5 | Deux bascules, retour au thème système, nouveau changement système | Suivi toujours suspendu |
| CA6 | Liens Header dans les deux sens, précédent/suivant, changements système après chaque navigation, en suivi puis en manuel | Thème et mode conservés |
| CA7 | Rechargement de chaque route après choix manuel avec système différent | Choix abandonné, système repris |
| CA8 | Inspection code et localStorage, sessionStorage, cookies, IndexedDB sur chaque route | Aucun stockage du thème ; stockages inspectés vides |
| CA9 | Tab sur navigation, bouton et liens ; Entrée et Espace sur bouton ; nom accessible dans snapshots | Activation correcte et focus visible, contraste vérifié dans les deux thèmes |
| CA10 | Mesures ci-dessus, survol/focus, capture visuelle bureau et mobile | Tous les seuils respectés |
| CA11 | Contenu comparé à `data/board.json`, liens et responsive | Fonctionnalités et contenu préservés |

Une lecture immédiate après émulation claire sur `/board` avait capturé l'ancien thème sombre. Le scénario a été repris en attendant 200 ms pour laisser parvenir l'événement de préférence système ; le thème clair et la préférence `matches=false` ont alors été confirmés. Aucun défaut applicatif reproduit.

Responsive : `/` et `/board` testés dans les deux thèmes à 375, 800 et 1440 px. Le tableau affiche respectivement une, deux et quatre colonnes ; aucun débordement horizontal et bouton entièrement dans le viewport. Ordre conservé : Sprint backlog, Doing, Review, Done ; six cartes, deux descriptions, quatre descriptions absentes, `No cards yet` dans Review. Aucun changement de données ou de modèle.

Texte long : remplacement temporaire dans le DOM d'un titre par 30 répétitions et d'une description par 80 répétitions sans espaces, sur mobile dans les deux thèmes. Aucun débordement de carte ni de page ; `overflow-wrap: anywhere` conservé. Rechargement ensuite pour restaurer le contenu ; aucun fichier de données modifié.

Liens : activation clavier du lien d'accueil vers `/board` et du lien de page introuvable vers `/`, dans les deux thèmes ; navigation Header et historique contrôlés dans les deux modes de pilotage.

Cas limites : nouvel onglet de même origine initialisé en clair tandis que l'onglet original conserve son choix manuel sombre avec la même préférence système claire. Instrumentation temporaire de `matchMedia` sous StrictMode : deux ajouts, un retrait, un abonnement actif ; compte inchangé après quatre navigations. Console de la page contrôlée : aucune erreur ni avertissement.

## Contrôles et revue

- `tsc -b` : réussi pendant l'implémentation.
- `npm run lint` : code de sortie 0, aucune erreur ; deux avertissements préexistants dans Confetti (purity et set-state-in-effect). Confetti inchangé.
- `npm run build` : réussi, typage inclus ; avertissement préexistant de bundle >500 kB (535,04 kB minifié, 152,22 kB gzip).
- `git diff --check` : réussi ; simple avis LF/CRLF pour `.codex/config.toml`, modifié hors de cette intervention.
- Aucun script de suite applicative configuré ; aucun framework ni dépendance ajouté. Validation au point de test navigateur préalablement convenu.
- Diff des données, du modèle, de Board, des dépendances et de Confetti : aucun changement.
- Revue Standards indépendante : aucun problème concret identifié.
- Revue Spec indépendante : aucun problème concret identifié, aucune régression CA1–CA9 identifiable dans le code.

Ticket 02 terminé ; Sprint 3 vérifié sur CA1 à CA11. Seuls les avertissements préexistants restent présents. Le statut de triage `ready-for-agent` est conservé faute de statut local « terminé » ; l'état d'implémentation est consigné séparément dans le ticket.
