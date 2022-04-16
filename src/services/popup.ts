import { alertController, loadingController, toastController } from "@ionic/vue";

export const errorPopup = async (text: string, title = "Erreur") => {
  const alert = await alertController.create({
    header: title,
    message: text,
    buttons: ["OK"],
  });

  return alert.present();
};

export const infoPopup = async (text: string, title?: string) => {
  const alert = await alertController.create({
    header: title,
    message: text,
    buttons: ["OK"],
  });

  return alert.present();
};

export const confirmPopup = async (text: string, confirmHandler: any, declineHandler?: any, title="") => {
  const alert = await alertController.create({
    header: title,
    message: text,
    buttons: [
      {
        text: "Non",
        role: "cancel",
        cssClass: "secondary",
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

  return alert.present();
};

/**
 * Display a multiple choice popup. 
 * Run the handler with the chosen option as parameter
 * @param text 
 * @param options 
 * @param handler 
 */
export const choicePopup = async (text: string, options: string[], handler: any) => {
  const buttons = [] as any[];
  options.forEach((option: string) => {
    buttons.push(
      {
        text: option,
        cssClass: "secondary",
        handler: () => {
          console.log(`User chose "${option}" to prompt "${text}"`);
          handler(option);
        },
      },
    ) 
  })
  const alert = await alertController.create({
    header: "Choisi une option",
    message: text,
    buttons: buttons,
  });
  return alert.present();
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
    position: "top",
    cssClass: "ion-text-center",
  });
  return toast.present();
};
