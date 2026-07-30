# Sprint Retrospective — Release v1.0.0

**Équipe :** projet Quiz Dynamique  
**Format :** Qu’est-ce qui a bien marché / À améliorer / Actions

## Ce qui a bien marché
- Respect du Gitflow : `feature/*` → `develop` → `release/1.0.0` → `main` + tag
- Découpage clair via le PRODUCT BACKLOG Trello (user stories + critères d’acceptation)
- Collaboration possible sur `develop` (mélange, stats, récap intégrés en parallèle)
- Mise en prod rapide avec GitHub Pages
- Critères d’acceptation courts → implémentation ciblée

## Ce qui a moins bien marché
- Conflits / divergences sur `develop` (push rejetés, besoin de `git pull --no-rebase`)
- Compte SSH GitHub (`jeremychambon`) ≠ compte du fork (`Jerxmyy`) → blocage push initial
- Script multi-features fragile (erreur de quoting sur `feature/audio`)
- Branches de suivi avec commits vides pour certaines features (suivi Trello ≠ historique parfait)
- Cartes Trello pas toujours déplacées en même temps que le code (DOING / DONE désynchronisés)
- Items Sass du SPRINT BACKLOG non traités

## Actions pour le prochain sprint
| Action | Responsable | Quand |
|---|---|---|
| Mettre à jour le Kanban dès qu’une US est mergée (→ REVIEW puis DONE) | Toute l’équipe | À chaque merge |
| Uniformiser l’auth Git (HTTPS + `gh` / une seule clé SSH) | Dev concerné | Immédiat |
| Traiter Sass + stylisation ou les renvoyer au PRODUCT BACKLOG | Équipe | Sprint suivant |
| Créer 1 branche = 1 commit réel de code (éviter commits vides) | Dev | Prochaines features |
| Ajouter une checklist DoD sur chaque carte (tests manuels + push + move Trello) | Scrum Master / PO | Sprint planning |

## Vote d’énergie (à compléter en réunion)
- Ambiance / collaboration : _/5
- Qualité du livrable : _/5
- Process Git / Trello : _/5
