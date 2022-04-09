import { alertController, loadingController, toastController } from '@ionic/vue';

export const errorPopup = async (text: string, title='Erreur') => {
  const alert = await alertController.create({
    header: title,
    message: text,
    buttons: ['OK']
  });
  
  await alert.present();
}

export const infoPopup = async (text: string, title?: string) => {
  const alert = await alertController.create({
    header: title,
    message: text,
    buttons: ['OK']
  });
  
  await alert.present();
}

export const confirmPopup = async (text: string, confirmHandler: any, declineHandler?: any) => {
  const alert = await alertController.create({
    header: 'Tu confirmes ?',
    message: text,
    buttons: [
      {
        text: "Non",
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('User chose "no" to prompt "' + text + '"');
          if(declineHandler) declineHandler();
        }
      },
      {
        text: 'Oui',
        handler: () => {
          console.log('User chose "yes" to prompt "' + text + '"');
          confirmHandler();
        },
      }
    ]
  });
  
  await alert.present();
}

export const loadingPopup =async (timeout=60000, message='Chargement') => {
  const loading = await loadingController
    .create({
      message: message,
      duration: timeout,
    });
  setTimeout(() => loading.dismiss(), timeout);
  return loading;
}

export const toastPopup = async (message: string, duration=3000) => {
    const toast = await toastController
      .create({
        message: message,
        duration: duration,
        position : 'top',
        cssClass: "ion-text-center",
      })
    toast.present();
}