import { useAuthStore } from './users';
import { magnetar } from "./magnetar";
import { defineStore } from "pinia";

/////////////////////
/// configuration //
//////////////////

// App settings (from firestore, through magneta)
export interface AppSetting {
  lastGameDbUpdate: Date;
  maxGameLeaders: number;
  freezeScore: boolean;
}

const appSettingsDefaults = {
  lastGameDbUpdate: new Date(0),
  maxGameLeaders: 2,
  freezeScore: true,
};

function appSettingsDefaultsFunc(payload?: Partial<AppSetting>): AppSetting {
  return { ...appSettingsDefaults, ...payload }
}
const appSettingsModule = magnetar.doc("settings/app", {
  modifyPayloadOn: { insert: appSettingsDefaultsFunc },
  modifyReadResponseOn: { added: appSettingsDefaultsFunc },
});
appSettingsModule.stream();

// Local settings (from pinia store)
interface State {
  lastGameDbUpdate: Date;
}
const useStore = defineStore("localSettings", {
  state: (): State => {
    return appSettingsDefaults;
  },
});
const localStore = useStore();

///////////////
/// Getters //
/////////////

export const isGameDbOutdated = ():boolean => {
  if (appSettingsModule.data) return localStore.lastGameDbUpdate < appSettingsModule.data.lastGameDbUpdate;
  return true;
};

export const isScoresFrozen = ():boolean => {
  if (appSettingsModule.data) return appSettingsModule.data.freezeScore;
  console.log("appSettingsModule not loaded, returning default value for freezeScore");
  return appSettingsDefaults.freezeScore;
};

export const getMaxGameLeaders = ():number => {
  if (appSettingsModule.data) return appSettingsModule.data.maxGameLeaders;
  console.error("appSettingsModule not loaded, returning default value for maxGameLeaders");
  return appSettingsDefaults.maxGameLeaders;
};

///////////////
/// Setters //
/////////////

export const setlastGameDbUpdate = async () => {
  if (appSettingsModule.data) {
    localStore.lastGameDbUpdate = appSettingsModule.data.lastGameDbUpdate;
  } else{
    console.error("appSettingsModule not loaded, setting default value for lastGameDbUpdate");
  }
  localStore.lastGameDbUpdate = appSettingsDefaults.lastGameDbUpdate;
}