import { confirmPopup } from './services/popup';
/* eslint-disable no-console */
/* tslint:disable-next-line */
import { register } from 'register-service-worker'
import { infoPopup } from './services/popup'

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
      console.log('New content is downloading.')
    },
    updated () {
      confirmPopup(
        "Elle ne sera appliquée qu'après avoir fermé complètement l'app. Veux-tu le faire maintenant ?", 
        () => { window.close() },
        () => void 0,
        "Mise à jour disonible"
      )
    },
    offline () {
      console.log('No internet connection found. App is running in offline mode.')
    },
    error (error: any) {
      console.error('Error during service worker registration:', error)
    }
  })
}
