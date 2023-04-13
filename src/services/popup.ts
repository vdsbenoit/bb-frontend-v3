import { alertController, loadingController, toastController } from "@ionic/vue";

export const errorPopup = async (text: string, title = "Erreur") => {
  const alert = await alertController.create({
    header: title,
    message: text,
    buttons: ["OK"],
  });

  await alert.present();
  return alert.onDidDismiss();
};

export const infoPopup = async (text: string, title?: string) => {
  const alert = await alertController.create({
    header: title,
    message: text,
    buttons: ["OK"],
  });

  await alert.present();
  return alert.onDidDismiss();
};

export const confirmPopup = async (text: string, confirmHandler: any, declineHandler?: any, title="") => {
  const alert = await alertController.create({
    header: title,
    message: text,
    buttons: [
      {
        text: "Non",
        role: "cancel",
        cssClass: "choice-popup",
        handler: () => {
          console.log('User chose "no" to prompt "' + text + '"');
          if (declineHandler) declineHandler();
        },
      },
      {
        text: "Oui",
        handler: () => {
          console.log('User chose "yes" to prompt "' + text + '"');
          confirmHandler();
        },
      },
    ],
  });

  await alert.present();
  return alert.onDidDismiss();
};

/**
 * Display a multiple choice popup. 
 * Run the handler with the chosen option as parameter
 * @param title 
 * @param options 
 * @param handler 
 */
export const choicePopup = async (title: string, options: string[], handler: any, cssClass="", message="") => {
  const buttons = [] as any[];
  options.forEach((option: string) => {
    buttons.push(
      {
        text: option,
        handler: () => {
          console.log(`User chose "${option}" to prompt "${title}"`);
          handler(option);
        },
      },
    ) 
  })
  const alert = await alertController.create({
    header: title,
    message: message,
    cssClass: cssClass,
    buttons: buttons,
  });
  await alert.present();
  return alert.onDidDismiss();
};

export const loadingPopup = async (message = "Chargement", timeout = 60000) => {
  const loading = await loadingController.create({
    message: message,
    duration: timeout,
  });
  setTimeout(() => loading.dismiss(), timeout);
  loading.present();
  return loading;
};

export const toastPopup = async (message: string, duration = 3000) => {
  const toast = await toastController.create({
    message: message,
    duration: duration,
    position: "bottom",
    cssClass: "ion-text-center",
  });
  return toast.present();
};

export const textInputPopup = async (message: string, handler: any, title="", placeholder="", cssClass = "") => {
  const alert = await alertController.create({
    header: title,
    message: message,
    cssClass: cssClass,
    inputs: [
      {
        name: "text",
        type: "text",
        placeholder: placeholder,
      },
    ],
    buttons: [
      {
        text: "Annuler",
        role: "cancel",
        cssClass: "choice-popup",
        handler: () => {
          console.log('User chose "cancel" to prompt "' + message + '"');
        },
      },
      {
        text: "OK",
        handler: (data) => {
          console.log('User chose "ok" to prompt "' + message + '"');
          handler(data.text);
        },
      },
    ],
  });

  await alert.present();
  return alert.onDidDismiss();
}