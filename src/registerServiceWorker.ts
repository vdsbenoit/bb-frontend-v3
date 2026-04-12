import semver from 'semver'
import { registerSW } from 'virtual:pwa-register'
import { buildInfo } from '@/app/buildinfo'

import { confirmPopup, errorPopup } from './utils/popup'

if (import.meta.env.PROD) {
  const updateServiceWorker = registerSW({
    immediate: true,
    onOfflineReady() {
      console.log('Content has been cached for offline use.')
    },
    onRegisteredSW(swUrl: string, registration: ServiceWorkerRegistration | undefined) {
      console.log(`Service worker has been registered at ${swUrl}.`)
      if (registration) {
        setInterval(() => {
          void registration.update()
        }, 60 * 60 * 1000)
      }
    },
    onNeedRefresh() {
      const lastUpdate = localStorage.getItem('lastUpdateRefresh')
      if (!lastUpdate || semver.gt(buildInfo.buildVersion, lastUpdate)) {
        localStorage.setItem('lastUpdateRefresh', buildInfo.buildVersion)
        void confirmPopup(
          `Elle ne sera appliquée qu'après avoir fermé redémarré l'app. Veux-tu le faire maintenant ?<br><br>
           Si ce popup apparait à chaque ouverture de l'app, clique sur non et ferme l'onglet ou le navigateur.`,
          () => {
            void updateServiceWorker()
            window.setTimeout(() => {
              void errorPopup(
                'Ton navigateur ne veut visiblement pas rafraischir l\'app. Fais le manuellement pour appliquer la mise à jour.',
              )
            }, 1000)
          },
          () => void 0,
          'Mise à jour disponible',
        )
      }
    },
    onRegisterError(error: unknown) {
      console.error('Error during service worker registration:', error)
    },
  })
}
