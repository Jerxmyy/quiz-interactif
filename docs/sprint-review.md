# Sprint Review — Release v1.0.0

**Projet :** Quiz Dynamique (Rhéa_TP_Quiz)  
**Date :** 30 juillet 2026  
**Branche de release :** `release/1.0.0`  
**Tag :** `v1.0.0`  
**Production :** https://jerxmyy.github.io/quiz-interactif/

## Objectif du sprint

Livrer un incrément jouable du quiz, versionné en Gitflow, déployé sur GitHub Pages, à partir du backlog Trello et du cahier des charges Notion.

## Démonstration (incrément livré)

### Déjà en DONE (socle)
- Chronomètre par question
- Feedback immédiat (vert / rouge)
- Barre de progression
- Meilleur score local (`localStorage`)

### Livré pendant ce sprint
| User story Trello | Statut | Preuve repo |
|---|---|---|
| Option de mode sombre | Livré | `feature/mode-sombre` |
| Partage sur les réseaux sociaux | Livré | `feature/partage` |
| Indice par question | Livré | `feature/indice` |
| Mode infini | Livré | `feature/mode-infini` |
| Système de récompenses (badges) | Livré | `feature/badges` |
| Audio pour les questions | Livré (dans le code) | lecture via `speechSynthesis` |
| Mélanger l’ordre des questions | Livré | `feature/melange-questions` |
| Statistiques détaillées après le quiz | Livré | stats sur l’écran résultat |
| Récapitulatif des questions après le quiz | Livré | `feature/recap-questions` |

### Hors sprint / non livré
- Item Sass + stylisation (encore dans SPRINT BACKLOG)
- Autres idées backlog : multi-thème, contre-la-montre, flashcard, etc.

## Definition of Done respectée
- [x] Code sur branches `feature/*` puis intégré dans `develop`
- [x] Release Gitflow `release/1.0.0` fusionnée dans `main`
- [x] Tag `v1.0.0`
- [x] Site accessible en production (GitHub Pages, status `built`)

## Feedback attendu (Sprint Review)
1. Le quiz est-il utilisable de bout en bout sur la prod ?
2. Les user stories livrées correspondent-elles aux critères d’acceptation Trello ?
3. Que prioriser pour le prochain sprint (Sass ? multi-thème ? dettes) ?
