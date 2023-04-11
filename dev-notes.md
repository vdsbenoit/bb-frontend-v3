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

# Distribution équipes

### Paramètres

- `MIN_PLAYERS_PER_TEAM` 
- `MAX_PLAYERS_PER_TEAM`
- teams_per_circuit (games_per_circuit \* 2)
- nb_players (par sections)

### Conditions

-  `MAX_PLAYERS_PER_TEAM` >= `MIN_PLAYERS_PER_TEAM`

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

# Désistement

- Si bcp de désistements, activer l'argument "ignore_score" des équipes manquantes. Les équipes qui se retrouvent seules à un jeu joue contre elle même et sont directement marquées comme gagnantes

