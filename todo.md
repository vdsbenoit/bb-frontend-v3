# To do

## Next
- Faire la distribution + générer les roadmaps/badges dans l'app
  - Créer des utilisateurs
  - Créer les équipes (cf distribution équipe ci dessous)
    - Séparer la création de chaque type de sections. Par ex, la création des équipes louveteaux ont leur propre paramètre MIN et MAX
    - Faire en sorte que l'on puisse refaire la distributions de équipes une fois que les pios ont déjà commencé à s'inscrire. En gros, ne pas toucher à la db de jeux, uniquement aux équipes.
  - Créer des jeux

## User feedback

- Mettre le plan en dessous de chaque épreuve
- Système pour générer un version imprimable des classements
- Bouton pour demander de l'aide -> notif aux organisateurs

## Notes 2025

- Enregistrer qui accepte un applicant
- Badges blancs sur blancs
- Revoir les roles : Erreur, anonyme, nouveau compte, en attente de validation, player, etc
- Revoir les groupe roles. Pq pas une liste de user rôles acceptés par le groupe ?
- Page pour créer sections animateurs

## Features

- Paramètres généraux de l'app
  - set schedule
  - set leaderTimings
- ignoreScore (team) : quand une section ne peut pas honorer le nombre d'inscrits, on désactive une ou plusieurs team car on ne peut pas refaire la distribution
  - réduire nbTeams de la section (pour le score)
  - afficher l'équipe d'une certaine manière aux animateurs
- Tableau de gestion équipes (voir app précédente)
- Système de recherche par numéro d’une team. Dire où elle joue en ce moment
- Système de recheche d'utilisateur


## Parking

- Use Firestore References between Game & Match instead of id -> check if the ID are not necessary for the distribution script or DB validation script
  - Profile morningGame should be a Reference too
  - Limit VueFire nesting to 1
- Add [recaptcha](https://firebase.google.com/docs/app-check/web/recaptcha-provider?authuser=1&hl=fr)
- Push notification (par ex pour rappeler d'enregistrer un score manquant)
- Déplacer les opérations de données en cloud functions
- Trouver un moyen efficace de calculer le classement en temps réel et indiquer la position dans le classement sur les page Team & Section
  - Cloud functions qui aggregate le score moyen de chaque section
- Modifier détails section depuis SectionsPage
- Renommer jeux depuis l'app (attention: appliquer la modification à tous les matchs)
- Intégrer les couleurs d'équipe dans l'app et la DB
- Update docs/
- Ensure users cannot exists without required UserProfile properties (redirect to onboarding if needed)
- Create AppSettings & AppConfig in the init process
- Retirer groupName des profils (créer une function getGroupName(groupId: string))

## Nice to have

- Description de jeu
- Regular CI/CD pour check qu'un npm i fonctionne à travers le temps
- Avoid undefined values.
      For instance, set default game (e.g. afternoonGame) value to 0. Where 0 means no game is set yet.
- QR codes pour vérifier la présence des animateurs
  - Les organisateurs scan le QR code des animateurs
  - Le QR code contient l'ID de l'animateur + un timestamp pour éviter les screenshots
- Get rid of `?` and handle undefined data.
- Refactor matches to duels
- Appliquer `cursor: pointer;` sur tous les éléments clickables
