# To do

## Now

- [x] Backup DB 2022
- [x] fix infinite spinner on empty ranking page
- [ ] Inscription aux épreuves
- [x] Refactor `categories` into  `sectionType`
- [x] Split SectionsPage in two -> LeadersPage
- [x] Fix SectionsPage
- [x] Ajouter fields membres & chefs dans LeaderSection -> non, le faire via une query
- [x] Dans MatchPage, créer un boutton "Reset scores"
- [x] Add info ribbon homePage when pending request
- [x] Add info ribbon when request is rejected

## User feedback

- [ ] indiquer lorsqu'un timing a complétement été encodé
- [x] ajouter un attribut sur les épreuves sans score (e.g. pause)
- [x] ajouter un attribut aux matches du type "noScores"
  - [x] créer un bouton pour configurer ceci sur GamePage

- [x] ne pas mettre libre sur les épreuves où il y a déjà 1 personne. Avoir un 3e state
- [ ] Mettre le plan en dessous de chaque épreuve
- [x] Faire en sorte que les sections ne tombent pas contre elles-mêmes (sinon ça fait tjrs une défaite et une victoire dans la même section)
- [ ] Système pour générer un version imprimable des classements
- [ ] Bouton pour demander de l'aide -> notif aux modérateurs

## Pages

- [ ] Paramètres généraux de l'app

  - [ ] set schedule
- [ ] ignore_score

  - [ ] réduire nbTeams de la section (pour le score)
  - [ ] afficher l'équipe d'une certaine manière aux animateurs
- [ ] Tableau de gestion équipes (voir app précédente)
- [x] Inscription : 
  - [x] choisir sa section et son rôle
  - [x] Compléter son profil
- [x] Animateurs : liste des animateurs avec filtre par section
- [x] Notifications : demande d'accès

## Modification DB

- [ ] 

## Keep in mind

- Keep match times starting at 1 instead of 0 (even though [it might sound retarded](https://preview.redd.it/iwnqgrrbls5z.png?auto=webp&s=746c0b97fbb5ba8effbe596ad9f2e5c38832bea2)). That's useful in some checks like in the `MatchesPage`. Same same for game numbers

## Next release

- [ ] Retirer matches des collection games & teams (utiliser des queries à la place). Vérifier tout de même si ce n'est pas utile pour la validation de la db à la fin de l'initialisation.
- [ ] Faire des méthodes genre "getLeaderInfo" dans des cloud functions pour n'exposer qu'une partie des données.
- [ ] Get rid of snake case in the DB
- [ ] Mettre tous les checks au même endroit (par ex, c'est fait au niveau service pour setMorningLeaders pas pour setGameScore). Je verrais mieux ça au niveau des Pages, vu que ça touche à plusieurs services.
- [ ] Trouver un moyen efficace de calculer le classement en temps réel et l'afficher dans les équipes & sections
  - [ ] Cloud functions qui aggregate le score moyen de chaque section
- [ ] Modifier détails section depuis SectionsPage
- [ ] remove weights
- [ ] Push notification (par ex pour rappeler d'enregistrer un score manquant)
- [ ] ? Optimize index (game_id>time and time>game_id)
- [ ] Intégrer la couleur d'équipe dans l'app et la DB
- [ ] Faire la distribution + générer les roadmaps/badges dans l'app
  - Créer des utilisateurs	
  - Créer les équipes (cf distribution équipe ci dessous)
  - Créer des jeux
- [ ] add [recaptcha](https://firebase.google.com/docs/app-check/web/recaptcha-provider?authuser=1&hl=fr)
- [ ] Try to replace some .stream() with .fetch() (the bug may be fixed)
- [ ] get rid of snake case in firestore (e.g. matches collection)

## Nice to have

- [ ] Description de jeu
- [ ] séparation visuelle pour midi dans l'horaire
- [ ] Système de recherche de joueur
- [ ] Fix bug uncaught promise après déconnexion
- [ ] OSS License
- [ ] Regular CI/CD pour check qu'un npm i fonctionne à travers le temps
- [ ] Avoid undefined values. 
  For instance, set default game (e.g. afternoonGame) value to 0. Where 0 means no game is set yet.
- [ ] QR codes pour vérifier la présence des animateurs
  - [ ] Les organisateurs scan le QR code des animateurs
  - [ ] Le QR code contient l'ID de l'animateur + un timestamp pour éviter les screenshots
- [ ] Get rid of `?` and handle undefined data.