import { confirmPopup, errorPopup } from './services/popup';
import { buildInfo } from "@/app/buildinfo";
import * as semver from "semver";

/* eslint-disable no-console */
/* tslint:disable-next-line */
import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      )
    },
    registered () {
      console.log('Service worker has been registered.')
    },
    cached () {
      console.log('Content has been cached for offline use.')
    },
    updatefound () {
      console.log('Updated found')
    },
    updated () {
      const lastUpdate = localStorage.getItem('lastUpdateRefresh');
      if (!lastUpdate || semver.gt(buildInfo.buildVersion, lastUpdate)) {
        localStorage.setItem('lastUpdateRefresh', buildInfo.buildVersion);
        confirmPopup(
          `Elle ne sera appliquée qu'après avoir fermé redémarré l'app. Veux-tu le faire maintenant ?<br><br>
           Si ce popup apparait à chaque ouverture de l'app, clique sur non et ferme l'onglet ou le navigateur.`, 
          () => { 
            window.location.reload();
            setTimeout(() => {
              errorPopup("Ton navigateur ne veut visiblement pas rafraischir l'app. Fais le manuellement pour appliquer la mise à jour.");
            }, 1000)
          },
          () => void 0,
          "Mise à jour disponible"
        )
      }
    },
    offline () {
      console.log('No internet connection found. App is running in offline mode.')
    },
    error (error: any) {
      console.error('Error during service worker registration:', error)
    }
  })
}
