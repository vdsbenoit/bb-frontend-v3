# Créer une page

- créer une page : nouveau fichier dans `views/`
  - importer le component `HeaderTemplate` & set la prop `pageTitle` 
  - écrire le contenu du component dans une `<div id="container">`
- ajouter un élément dans le menu: `App.vue`
- ajouter un élément dans le router:  `router/main.ts`

Pour appliquer des css à toute l'app, le faire dans `App.vue`.

# Tech stack

- vue 3 : frontend engine
- ionic 6 : UI 
- firebase : auth & db
- pinia : state management
- magnetar: firestore 
- Volar plugin (VS Code): I applied [this config](https://github.com/johnsoncodehk/volar/discussions/471).



Auth management : https://dev.to/aaronksaunders/ionic-framework-v6-vuejs-and-firebase-authentication-flow-using-pinia-for-state-management-5aia

ionic form template : https://github.com/ionicthemes/ionic-forms-and-validations/blob/master/src/app/form/form.page.html

# ⚠ LAISSE LES DATA MAGNETAR DANS DES COMPUTED METHODS BEN !!

# To do 

- [x] Lire & comprendre `firebase.ts` et `user.ts
- [x] comprendre les base de la composition API
- [x] Continuer à parser les pages d'auth management depuis "vue-firebase-auth-tuto"
- [x] parser & adapter le popup manager depuis BadenBattle/frontend
- [x] merger login & settings page into ProfilePage
- [ ] disclaimer rgpd dans about
- [x] popup enregistrement settings
- [ ] `users.ts`: retirer prop `error`
- [x] Magnetar
  - [x] checker si merge fonction avec les arrays (games.ts) -> non, il faut déstructurer l'array précédent et merger soi-même
- [ ] save score au niveau des matches & équipes
  - [ ] seule les animateurs d'un match peuvent y ajouter des points
- [x] Split profile & login
- [x] fix bug menu
- [ ] Mettre à jour le field `teams` des documents de la collection sections

# Pages

- [ ] Accueil: invitation à s'inscrire - si connecté : Mon programme / Mon jeu

- [x] Login
  - [x] Split login & profile
  
- [x] Profil (perso & qqun d'autre)

  - [ ] mettre condition sur ce qu'on peut modifier
  - [ ] erreurs enregistrement settings

- [x] Equipe (avec liste matches, ordonnés par temps)

  - [ ] fetch classement

- [x] Jeu (avec liste matches, ordonnés par temps)

- [x] Sections (avec liste d'équipe)

- [x] Match
  - [ ] Enregistrer le score au niveau 
    - [x] du match
    - [ ] des **équipes**
    - [ ] des **sections**
  - [ ] +2 par victoires
  - [ ] +1 égalité
  - [x] Ajouter [back button](https://ionicframework.com/docs/api/back-button)

- [ ] Listes
  - [ ] Liste des jeux 
    - [ ] filtre par circuit
    - [ ] si admin : bouton pour éditer nom & description
  - [ ] Utilisateurs
    - [ ] filtrepar section
  - [ ] Liste de matches 
    - [ ] filtre temps et filtre circuit
    - [ ] bouton "charger" pour éviter trop de requêtes)

- [ ] Chercher un match: lecture seule si pas connecté

- [ ] Classement

- [ ] Gestion équipes (voir app précédente)

- [ ] Paramètres généraux de l'app

  - [ ] set schedule

  

# Modification DB

- [x] games
  - [x] faire morningLeaders & afternoonLeaders

- [x] teams
  - [x] ajouter scores: number[]

- [x] Créer une DB "sections". 
  - [x] ~~Chaque collection est un type de section (e.g. loups, lutins, baladins, animateurs).~~ 
  - [x] Chaque document est une section
  - [x] Fields name, city, code d'unité, category (loups, lutins, balas, animateur), nbTeams, teams: []
  - [x] La liste teams se fait compléter par le script de distribution

- [x] Créer une DB settigns avec 1 seul document avec les settings de l'app
  - freezeScores: boolean
  - gameLeaderSections : [] (liste des noms de sections animatrices)
  - lastGameDbUpdate: date de la dernière modification de la db de jeu
  - maxGameLeaders : number (max amount of leaders per game)

- [ ] Match : retirer game_name (on obtient cette info des documents de games)

  

# Règles db

- tous les users peuvent modifier leur profile sauf leur role
- seuls les admins peuvent modifier le profile des autres
- Seuls les admins peuvent voir le classement en temps réel
- Il faut être animateur pour s'inscrire à une épreuve
- Traduire les if conditions des services magnetar

````typescript
export const setScore = async (matchId: string, winner: string, loser: string) => {
  const match = matchesModule.doc(matchId);
  const canSetScoreResult = await canSetScore(matchId);
  if (! canSetScoreResult) throw new Error(`Tu n'as pas le droit d'enregister de scores à l'épreuve ${match.data?.game_id}`);
  if (!match.data?.player_ids.includes(winner)) throw new Error(`L'équipe ${winner} n'est pas assignée à cette épreuve`);
  if (!match.data?.player_ids.includes(loser)) throw new Error(`L'équipe ${loser} n'est pas assignée à cette épreuve`);

  match.merge({winner, loser, even: false});
};

export const setEven = async (matchId: string) => {
  const match = matchesModule.doc(matchId);
  const canSetScoreResult = await canSetScore(matchId);
  if (! canSetScoreResult) throw new Error(`Tu n'as pas le droit d'enregister de scores à l'épreuve ${match.data?.game_id}`);

  match.merge({winner: "", loser: "", even: true});
}
````



# Avant de mettre en prod

- [ ] vérifier les DB rules
- [ ] Désactiver les API key inutiles [ici](https://console.cloud.google.com/apis/credentials?project=badenbattle-a0dec)
- [ ] Désactiver les domaines inutiles [ici](https://console.firebase.google.com/u/0/project/badenbattle-a0dec/authentication/providers)
- [ ] Désactiver le logging magnetar
- [ ] Checker tous les fixme
- [ ] Checker tous les console.debug

# Nice to have

- Page d'information post-connexion (choisir son équipe / jeu)
- PWA
- Dark theme
- Description de jeu
- Système de recherche de joueur
- séparation pour midi dans l'horaire
- Description de jeu
- Fix bug uncaught promise après déconnexion

# Next release

- [Pull-to-refresh](https://ionicframework.com/docs/api/refresher)
- Retirer matches des collection games & teams (utiliser des queries à la place)
- QR codes
- Create DB from web app
- Faire des méthodes genre "getLeaderInfo" dans des cloud functions pour n'exposer qu'une partie des données.
- Refactor even with draw
- match time start at 0 ([instead of 1](https://preview.redd.it/iwnqgrrbls5z.png?auto=webp&s=746c0b97fbb5ba8effbe596ad9f2e5c38832bea2))
- Mettre tous les checks au même endroit (par ex, c'est fait au niveau service pour setMorningLeaders pas pour setGameScore)
- Trouver un moyen efficace de calculer le classement en temps réel et l'afficher dans les équipes & sections
- La catégorie `Animateurs` n'est pas créée dans settings/app/categories par le script d'init DB 

# Désistement

- Si bcp de désistement, activer l'argument "ignore_score" des équipes manquantes. Les équipes qui se retrouvent seules à un jeu joue contre elle même et sont directement marquées comme gagnantes