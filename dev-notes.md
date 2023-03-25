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

- [ ] fix infinite spinner on empty ranking page
- [ ] add [recaptcha](https://firebase.google.com/docs/app-check/web/recaptcha-provider?authuser=1&hl=fr)
- [ ] Inscription aux épreuves
- [ ] Faire la distribution + générer les roadmaps/badges dans l'app

# User feedback

- [ ] indiquer lorsqu'un timing a complétement été encodé
- [ ] ajouter un attribut sur les épreuves sans score (e.g. pause)
- [ ] ajouter un attribut aux matches du type "hasScore" et le mettre à vrai pour les épreuve sans score
- [ ] ne pas mettre libre sur les épreuves où il y a déjà 1 personne. Avoir un 3e state
- [ ] Mettre le plan en dessous de chaque épreuve
- [ ] Faire en sorte que les sections ne tombent pas contre elles-mêmes (sinon ça fait tjrs une défaite et une victoire dans la même section)
- [ ] Imprimer les classements
- [ ] Système pour vérifier si les animateurs étaient présents ou non.
- [ ] Bouton pour demander de l'aide

# Pages

- [ ] Paramètres généraux de l'app

  - [ ] set schedule
- [ ] ignore_score

  - [ ] réduire nbTeams de la section (pour le score)
  - [ ] afficher l'équipe d'une certaine manière aux animateurs
- [ ] Gestion équipes (voir app précédente)

# Modification DB

- [ ] 

# Règles db

- [ ] seuls les modos peuvent modifier les noms de jeu
- [x] tous les users peuvent modifier leur profile sauf leur role
- [x] seuls les admins peuvent modifier le profile des autres
- [ ] Seuls les admins peuvent voir le classement en temps réel
- [x] il faut être au minimum animateurs pour écrire dans la db
- [x] seul les admins & propriétaire peuvent supprimer un profil
- [ ] Traduire les if conditions des services magnetar

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

- [x] vérifier les DB rules
- [ ] Désactiver les API key inutiles [ici](https://console.cloud.google.com/apis/credentials?project=badenbattle-a0dec)
- [ ] Désactiver les domaines inutiles [ici](https://console.firebase.google.com/u/0/project/badenbattle-a0dec/authentication/providers)
- [x] Désactiver le logging magnetar
- [x] Checker tous les fixme
- [x] Retirer tous les console.debug
- [x] Hardcode schedule

# Nice to have

- [ ] Description de jeu
- [ ] Système de recherche de joueur
- [ ] séparation pour midi dans l'horaire
- [ ] Description de jeu
- [ ] Fix bug uncaught promise après déconnexion
- [ ] OSS License
- [ ] CI/CD pour check qu'un npm i fonctionne à travers le temps
- [ ] Cloud functions qui aggregate le score moyen de chaque section

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
- Improve initialization script in order not to play against its own section or againt another section too many times (cf. validation script)

# Désistement

- Si bcp de désistements, activer l'argument "ignore_score" des équipes manquantes. Les équipes qui se retrouvent seules à un jeu joue contre elle même et sont directement marquées comme gagnantes