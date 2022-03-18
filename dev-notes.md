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



# To do 

- [x] Lire & comprendre `firebase.ts` et `user.ts`
- [ ] Lire https://ionicframework.com/docs/vue/your-first-app & comprendre les base de la composition API
- [ ] Continuer à parser les pages d'auth management depuis "vue-firebase-auth-tuto"
- [ ] parser & adapter le popup manager depuis BadenBattle/frontend