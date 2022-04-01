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



Auth management : https://dev.to/aaronksaunders/ionic-framework-v6-vuejs-and-firebase-authentication-flow-using-pinia-for-state-management-5aia

ionic form template : https://github.com/ionicthemes/ionic-forms-and-validations/blob/master/src/app/form/form.page.html



# To do 

- [x] Lire & comprendre `firebase.ts` et `user.ts`
- [ ] Lire https://ionicframework.com/docs/vue/your-first-app 
- [x] comprendre les base de la composition API
- [x] Continuer à parser les pages d'auth management depuis "vue-firebase-auth-tuto"
- [x] parser & adapter le popup manager depuis BadenBattle/frontend
- [x] merger login & settings page into ProfilePage
- [ ] popup enregistrement settings
- [ ] erreurs enregistrement settings
- [ ] Etendre service firebase: lire docs & collections, écrire docs
- [ ] Créer une collection "sections". Un document contient toutes les infos de sections d'une année dans un dict { sectionCity: {sectionName [ teams]}}

## Nice to have

- Pas d'information post-connexion (choisir son équipe / jeu)
- Système de recherche de joueur

# Pages

- [ ] Accueil: invitation à s'inscrire - si connecté : Mon programme / Mon jeu
- [x] Login
- [x] Profil (perso & qqun d'autre)
- [x] Equipe (avec liste matches, ordonnés par temps)
- [ ] Jeu (avec liste matches, ordonnés par temps)
- [x] Sections (avec liste d'équipe)
- [ ] Match
- [ ] Listes
  - [ ] Liste des jeux (filtre par circuit) + inscription
  - [ ] Utilisateurs
  - [ ] Liste de matches (filtre temps et filtre circuit)

- [ ] Chercher un match: lecture seule si pas connecté
- [ ] Classement
- [ ] Gestion équipes (voir app précédente)
- [ ] Gestion jeux (voir app précédente)
- [ ] Paramètres généraux de l'app
- [ ] Enregistrer score: seule les animateurs d'un match peuvent y ajouter des points

# Règles db

- tous les users peuvent modifier leur profile sauf leur role
- seuls les admins peuvent modifier le profile des autres
- Seuls les admins peuvent voir le classement en temps réel

# Avant de mettre en prod

- [ ] vérifier les DB rules
- [ ] Désactiver les API key inutiles [ici](https://console.cloud.google.com/apis/credentials?project=badenbattle-a0dec)
- [ ] Désactiver les domaines inutiles [ici](https://console.firebase.google.com/u/0/project/badenbattle-a0dec/authentication/providers)
- [ ] Désactiver le login par mdp

# Next release

- QR codes
- Create DB from web app