Sprint 6 — Tableau de bord du sprint. Implémente les TODO "Sprint 6" déjà préparés,
sans changer les props ni les responsabilités décrites dans les commentaires :
1. src/components/CardBadges.tsx : les 3 badges (👤 membres, ☑ fait/total, 💬 commentaires),
   un badge à 0 est caché, la checklist passe en vert quand tout est fait.
2. src/components/SprintProgress.tsx : "X cards · Y done · Z %" + une barre de progression
   (une Box dont la largeur vaut Z %). La dernière colonne = terminé. Pas de division par 0.
3. src/components/MemberLoad.tsx : une ligne par membre "Prénom Nom · N cards"
   + "Unassigned · N cards", avec useQuery({ queryKey: ['users'], queryFn: getUsers }).
4. src/components/Column.tsx : afficher le nombre de cartes à côté du titre ("Doing · 3")
   à l'endroit du commentaire Sprint 6.

Contraintes : code simple et lisible pour un étudiant débutant. Utilise seulement
useState/useQuery, les props, .map, .filter, .length, des conditions simples et des
composants Chakra UI avec les tokens sémantiques (bg.muted, fg.muted…) pour que le
mode sombre fonctionne. Pas de nouvelle librairie, pas de useMemo, pas de reduce,
aucune modification de l'API ni des types. Rien n'est envoyé au serveur.
À la fin, lance npm run lint et npm run build, puis explique-moi en français,
fichier par fichier, ce que fait le code.
