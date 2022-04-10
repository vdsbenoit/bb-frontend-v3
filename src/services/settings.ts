import { useAuthStore } from './users';
import { magnetar } from "./magnetar";
import { defineStore } from "pinia";

const SETTINGS_COLLECTION = "settings";
const SETTINGS_DOCUMENT = "app";

/////////////////////
/// configuration //
//////////////////

// App settings (from firestore, through magneta)
export interface AppSetting {
  lastGameDbUpdate: Date; // last time the game DB was updated on the remote, to avoid streaming it
  maxGameLeaders: number; // max allowed leaders per game
  freezeScore: boolean;
  categories: string[];
  gameLeaderSections: string[];
  everyoneCanSetScoreAnywhere: boolean;
  leaderRegistration: boolean; // true when the leader can register to games
}

const appSettingsDefaults = {
  lastGameDbUpdate: new Date(0),
  maxGameLeaders: 2,
  freezeScore: true,
  categories: [],
  gameLeaderSections: [],
  everyoneCanSetScoreAnywhere: false,
  leaderRegistration: true, // fixme: change to false
};

function appSettingsDefaultsFunc(payload?: Partial<AppSetting>): AppSetting {
  return { ...appSettingsDefaults, ...payload }
}
const appSettingsModule = magnetar.doc(`${SETTINGS_COLLECTION}/${SETTINGS_DOCUMENT}`, {
  modifyPayloadOn: { insert: appSettingsDefaultsFunc },
  modifyReadResponseOn: { added: appSettingsDefaultsFunc },
});
appSettingsModule.stream().catch(error => {
  console.error(`App settings stream failed`, error);
});

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

export const isGameDbOutdated = (): boolean => {
  if (appSettingsModule.data) return localStore.lastGameDbUpdate < appSettingsModule.data.lastGameDbUpdate;
  return true;
};

export const isScoresFrozen = (): boolean => {
  if (appSettingsModule.data) return appSettingsModule.data.freezeScore;
  console.log("appSettingsModule not loaded, returning default value for freezeScore");
  return appSettingsDefaults.freezeScore;
};

export const getMaxGameLeaders = (): number => {
  if (appSettingsModule.data) return appSettingsModule.data.maxGameLeaders;
  console.error("appSettingsModule not loaded, returning default value for maxGameLeaders");
  return appSettingsDefaults.maxGameLeaders;
};

export const canSetScoreAnywhere = (): boolean => {
  if (appSettingsModule.data) return appSettingsModule.data.everyoneCanSetScoreAnywhere;
  console.error("appSettingsModule not loaded, returning default value for everyoneCanSetScoreAnywhere");
  return appSettingsDefaults.everyoneCanSetScoreAnywhere;
};

export const isLeaderRegistrationOpen = () => {
  if (appSettingsModule.data) return appSettingsModule.data.leaderRegistration;
  console.error("appSettingsModule not loaded, returning default value for leaderRegistration");
  return appSettingsDefaults.leaderRegistration; 
}

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