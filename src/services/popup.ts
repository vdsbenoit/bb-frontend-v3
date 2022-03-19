import { alertController } from '@ionic/vue';

export const error = async (text: string, title='Erreur') => {
  const alert = await alertController.create({
    header: title,
    message: text,
    buttons: ['OK']
  });
  
  await alert.present();
}

export const info = async (text: string, title?: string) => {
  const alert = await alertController.create({
    header: title,
    message: text,
    buttons: ['OK']
  });
  
  await alert.present();
}

export const confirm = async (text: string, confirmHandler: any, declineHandler?: any) => {
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
