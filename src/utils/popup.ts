import { alertController, loadingController, toastController } from '@ionic/vue'

export async function errorPopup(text: string, title = 'Erreur') {
  const alert = await alertController.create({
    header: title,
    message: text,
    cssClass: 'preline-popup',
    buttons: ['OK'],
  })

  await alert.present()
  return alert.onDidDismiss()
}

export async function infoPopup(text: string, title?: string) {
  const alert = await alertController.create({
    header: title,
    message: text,
    cssClass: 'preline-popup',
    buttons: ['OK'],
  })

  await alert.present()
  return alert.onDidDismiss()
}

export async function confirmPopup(text: string, confirmHandler: any, declineHandler?: any, title = '') {
  const alert = await alertController.create({
    header: title,
    message: text,
    cssClass: 'preline-popup',
    buttons: [
      {
        text: 'Non',
        role: 'cancel',
        cssClass: 'choice-popup',
        handler: () => {
          console.debug(`User chose "no" to prompt "${text}"`)
          if (declineHandler) declineHandler()
        },
      },
      {
        text: 'Oui',
        handler: () => {
          console.debug(`User chose "yes" to prompt "${text}"`)
          confirmHandler()
        },
      },
    ],
  })

  await alert.present()
  return alert.onDidDismiss()
}

/**
 * Display a multiple choice popup.
 * Run the handler with the chosen option as parameter
 * @param title
 * @param options
 * @param handler
 */
export async function choicePopup(title: string, options: string[], handler: any, cssClass = '', message = '') {
  const buttons = [] as any[]
  options.forEach((option: string) => {
    buttons.push({
      text: option,
      handler: () => {
        console.debug(`User chose "${option}" to prompt "${title}"`)
        handler(option)
      },
    })
  })
  const alert = await alertController.create({
    header: title,
    message,
    cssClass: `preline-popup ${cssClass}`,
    buttons,
  })
  await alert.present()
  return alert.onDidDismiss()
}

export async function loadingPopup(message = 'Chargement', timeout = 60000) {
  const loading = await loadingController.create({
    message,
    duration: timeout,
  })
  setTimeout(() => void loading.dismiss(), timeout)
  void loading.present()
  return loading
}

export async function toastPopup(message: string, duration = 5000) {
  const toast = await toastController.create({
    message,
    duration,
    position: 'top',
    cssClass: 'ion-text-center toast-popup',
  })
  return toast.present()
}

export async function textInputPopup(message: string, handler: any, title = '', placeholder = '', cssClass = '') {
  const alert = await alertController.create({
    header: title,
    message,
    cssClass: `preline-popup ${cssClass}`,
    inputs: [
      {
        name: 'text',
        type: 'text',
        placeholder,
      },
    ],
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel',
        cssClass: 'choice-popup',
        handler: () => {
          console.debug(`User chose "cancel" to prompt "${message}"`)
        },
      },
      {
        text: 'OK',
        handler: (data) => {
          console.debug(`User chose "ok" to prompt "${message}"`)
          handler(data.text)
        },
      },
    ],
  })

  await alert.present()
  return alert.onDidDismiss()
}
