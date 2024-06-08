import { createApp } from 'vue'
import App from './App.vue'
import router from './router';
import './registerServiceWorker';
import { IonicVue } from '@ionic/vue';
import { VueFire, VueFireAuth, globalFirestoreOptions } from 'vuefire'
import { app as firebaseApp } from './services/firebase'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

// Above the createApp() line
import { defineCustomElements } from '@ionic/pwa-elements/loader';

import Nprogress from 'nprogress';


const app = createApp(App)
  .use(IonicVue)
  .use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
})
globalFirestoreOptions.maxRefDepth = 1

app.use(router)
router.isReady().then(() => {
  app.mount('#app')
})

// Call the element loader after the platform has been bootstrapped
defineCustomElements(window);

Nprogress.configure({ parent: '#app' })
