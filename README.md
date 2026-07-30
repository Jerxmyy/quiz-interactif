# Quiz Dynamique

Quiz interactif en HTML / CSS / JavaScript natif.

**Démo en ligne :** https://jerxmyy.github.io/quiz-interactif/  
**Quiz :** https://jerxmyy.github.io/quiz-interactif/pages/index.html  
**Repo :** https://github.com/Jerxmyy/quiz-interactif  
**Release :** `v1.0.0`

## Fonctionnalités

### Socle
- Chronomètre par question
- Feedback visuel immédiat (vert / rouge)
- Barre de progression
- Meilleur score en `localStorage`

### Sprint v1.0.0
- Mode sombre
- Partage du score (lien généré)
- Indice par question
- Mode infini
- Badges / récompenses
- Audio des questions (lecture vocale)
- Mélange aléatoire des questions
- Statistiques détaillées
- Récapitulatif des réponses

### Backlog suivant
- Multi-thème (culture / maths / images)
- Contre-la-montre (temps global)
- Difficulté progressive
- Réponses images
- Mode Flashcard
- Changement de langue (FR / EN)

## Installation

```bash
git clone https://github.com/Jerxmyy/quiz-interactif.git
cd quiz-interactif
```

Ouvrir `pages/index.html` (ou `index.html` qui redirige) dans un navigateur.

## Utilisation

- **Commencer le quiz** : mode classique mélangé
- **Mode infini** : questions sans limite, bouton pour arrêter
- **Indice / Lecture** : aide textuelle et audio
- **Partager** : génère un lien contenant le score
- **Mode sombre** : bascule de thème mémorisée

## Workflow Git

- `main` : version stable déployée
- `develop` : intégration des features
- `feature/…` : une fonctionnalité
- `release/…` : préparation de version
- Tag `v1.0.0` : release actuelle

## Documentation sprint

- [Sprint Review](docs/sprint-review.md)
- [Sprint Retrospective](docs/sprint-retrospective.md)

## Auteurs

Projet pédagogique : développement web, Gitflow, Scrum (backlog, user stories, sprint).
