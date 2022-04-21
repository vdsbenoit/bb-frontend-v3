# Créer une page

- créer une page : nouveau fichier dans `views/`
  - importer le component `HeaderTemplate` & set la prop `pageTitle` 
  - écrire le contenu du component dans une `<div id="container">`
- ajouter un élément dans le menu: `App.vue`
- ajouter un élément dans le router:  `router/main.ts`

Pour appliquer des css à toute l'app, le faire dans `App.vue`.

# Troubleshooting

Quand tu as ce genre d'erreur 

````javascript
Uncaught ReferenceError: Cannot access 'useAuthStore' before initialization
````

Ca veut dire que tu as une circular dependency dans tes imports. Check que tu n'importes pas d'autres services dans `users.ts` car ce module est importé presque partout.

# Tech stack

- vue 3 : frontend engine
- ionic 6 : UI 
- firebase : auth & db
- pinia : state management
- magnetar: firestore 
- Volar plugin (VS Code): I applied [this config](https://github.com/johnsoncodehk/volar/discussions/471).
- Auto generate build info file : https://www.npmjs.com/package/ionic-build-info



Auth management : https://dev.to/aaronksaunders/ionic-framework-v6-vuejs-and-firebase-authentication-flow-using-pinia-for-state-management-5aia

ionic form template : https://github.com/ionicthemes/ionic-forms-and-validations/blob/master/src/app/form/form.page.html

# ⚠ LAISSE LES DATA MAGNETAR DANS DES COMPUTED METHODS BEN !!

# To do 

- [x] Lire & comprendre `firebase.ts` et `user.ts
- [x] comprendre les base de la composition API
- [x] Continuer à parser les pages d'auth management depuis "vue-firebase-auth-tuto"
- [x] parser & adapter le popup manager depuis BadenBattle/frontend
- [x] merger login & settings page into ProfilePage
- [x] popup enregistrement settings
- [x] `users.ts`: retirer prop `error`
- [x] Magnetar
  - [x] checker si merge fonction avec les arrays (games.ts) -> non, il faut déstructurer l'array précédent et merger soi-même
- [x] Split profile & login
- [x] fix bug menu
- [x] Mettre à jour le field `teams` des documents de la collection sections
- [x] Refactor even with draw
- [x] Feuilles de route
- [x] Comparer & re-init db pour changer game_id en number
- [x] badges manquants
- [ ] config firebase blaze
- [ ] Ajouter les animateurs
- [ ] rules DB



# Pages

- [x] Accueil
  - [x] Si pas connecté : invitation à s'inscrire
  - [x] Si connecté
    - [x] Si pas de jeu : inviter à s'inscrire à un jeu / une équipe
    - [x] Sinon liens vers Mon programme / Mon jeu
    - [x] Compléter profil

- [x] About
  - [x] Explication sur le scoring (2 pt par victoire, 1pt par égalité)

- [x] Login
  - [x] Split login & profile
  - [x] RGPD
  
- [x] Profil (perso & qqun d'autre)

  - [x] mettre condition sur ce qu'on peut modifier
  - [x] erreurs enregistrement settings
  - [x] bouton pour demander une promotion
  
- [x] Equipe (avec liste matches, ordonnés par temps)

- [x] Jeu (avec liste matches, ordonnés par temps)
  - [x] Ajouter bouton "Inscrire quelqu'un"

- [x] Sections (avec liste d'équipe)

- [x] Match
  - [x] Enregistrer le score au niveau 
    - [x] du match
    - [x] des **équipes**
    - [x] des **sections**
  - [x] +2 par victoires
  - [x] +1 égalité
  - [x] Ajouter [back button](https://ionicframework.com/docs/api/back-button)

- [x] Liste des jeux 
  - [x] filtre par circuit
  - [x] si admin : bouton pour éditer nom & description
  
- [x] Liste matches, filter temps (pour vérifier les inscriptions)

- [ ] Liste utilisateurs
  - [ ] filtre par section
  - [ ] filtre demande de promotion
  - [ ] trier par date d'inscription
  
- [x] Classement

- [ ] Paramètres généraux de l'app

  - [ ] set schedule

- [ ] ignore_score

  - [ ] réduire nbTeams de la section (pour le score)
  - [ ] afficher l'équipe d'une certaine manière aux animateurs

- [ ] role guards -> ajouter au guards actuel

- [ ] Gestion équipes (voir app précédente)

- [x] Dark theme

  

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

- [x] Match : retirer game_name (on obtient cette info des documents de games)

  

# Règles db

- seuls les modos peuvent modifier les noms de jeu
- tous les users peuvent modifier leur profile sauf leur role
- seuls les admins peuvent modifier le profile des autres
- Seuls les admins peuvent voir le classement en temps réel
- Il faut être animateur pour s'inscrire à une épreuve
- seul les admins & propriétaire peuvent supprimer un profil
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
- [ ] Retirer tous les console.debug
- [ ] Hardcode schedule

# Nice to have

- Description de jeu
- Système de recherche de joueur
- séparation pour midi dans l'horaire
- Description de jeu
- Fix bug uncaught promise après déconnexion
- OSS License
- CI/CD pour check qu'un npm i fonctionne à travers le temps
- Cloud functions qui aggregate le score moyen de chaque section

# Next release

- Retirer matches des collection games & teams (utiliser des queries à la place). Vérifier tout de même si ce n'est pas utile pour la validation de la db à la fin de l'initialisation.
- QR codes
- Create DB from web app
- Faire des méthodes genre "getLeaderInfo" dans des cloud functions pour n'exposer qu'une partie des données.
- Get rid of snake case in the DB
- Keep match times starting at 1 instead of 0 (even though [it might sound retarded](https://preview.redd.it/iwnqgrrbls5z.png?auto=webp&s=746c0b97fbb5ba8effbe596ad9f2e5c38832bea2)). That's useful in some checks like in the `MatchesPage`. Same same for game numbers
- Mettre tous les checks au même endroit (par ex, c'est fait au niveau service pour setMorningLeaders pas pour setGameScore). Je verrais mieux ça au niveau des Pages, vu que ça touche à plusieurs services.
- Trouver un moyen efficace de calculer le classement en temps réel et l'afficher dans les équipes & sections
- La catégorie `Animateurs` n'est actuellement pas créée dans settings/app/categories par le script d'init DB 
- Modifier détails section depuis SectionsPage
- remove weights
- Push notification (par ex pour rappeler d'enregistrer un score manquant)
- Optimize index (game_id>time and time>game_id)
- Intégrer la couleur d'équipe dans l'app et la DB

# Désistement

- Si bcp de désistements, activer l'argument "ignore_score" des équipes manquantes. Les équipes qui se retrouvent seules à un jeu joue contre elle même et sont directement marquées comme gagnantes