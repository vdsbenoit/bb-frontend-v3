import { computed } from "vue";
import { magnetar } from "./magnetar";
import { toastPopup } from "./popup";

const APP_COLLECTION_NAME = "app";
const SETTINGS_DOCUMENT_KEY = "settings";
const CONFIGURATION_DOCUMENT_KEY = "configuration";

////////////////
/// Settings //
// App settings (from firestore, through magneta)

export type AppSettings = {
  maxGameLeaders: number; // max allowed leaders per game
  freezeScore: boolean;
  everyoneCanSetScoreAnywhere: boolean;
  leaderRegistration: boolean; // true when the leader can register to games
  schedule: Schedule[];
  showRankingToAll: boolean;
}

export const appSettingsDefaults: AppSettings = {
  maxGameLeaders: 2,
  freezeScore: true,
  everyoneCanSetScoreAnywhere: false,
  leaderRegistration: true,
  schedule: [] as Schedule[],
  showRankingToAll: false,
};

function appSettingsDefaultsFunc(payload: Partial<AppSettings>): AppSettings {
  return { ...appSettingsDefaults, ...payload }
}
const appSettingsModule = magnetar.doc<AppSettings>(`${APP_COLLECTION_NAME}/${SETTINGS_DOCUMENT_KEY}`, {
  modifyPayloadOn: { insert: (payload) => appSettingsDefaultsFunc(payload) },
  modifyReadResponseOn: { added: (payload) => appSettingsDefaultsFunc(payload) },
});


/////////////////////
/// Configuration //
// App configuration (from firestore, through magneta)

interface Schedule {
  start: string;
  stop: string;
}

export type AppConfiguration = {
  sectionTypes: string[];
  circuits: any;
  schedule: Schedule[];
}

export const appConfigurationDefaults: AppConfiguration = {
  sectionTypes: [] as string[],
  circuits: {},
  schedule: [] as Schedule[],
};

function appConfigurationDefaultsFunc(payload: Partial<AppConfiguration>): AppConfiguration {
  return { ...appConfigurationDefaults, ...payload }
}
const appConfigurationModule = magnetar.doc<AppConfiguration>(`${APP_COLLECTION_NAME}/${CONFIGURATION_DOCUMENT_KEY}`, {
  modifyPayloadOn: { insert: (payload) => appConfigurationDefaultsFunc(payload) },
  modifyReadResponseOn: { added: (payload) => appConfigurationDefaultsFunc(payload) },
});

///////////////
/// Streams //
/////////////

export const streamSettings = () => {
  appSettingsModule.stream().catch(error => {
    console.error(`App settings stream failed`, error);
  })
}
export const closeSettingsStream = () => {
  appSettingsModule.closeStream();
}

///////////////
/// Getters //
/////////////

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
  return appSettingsDefaults.leaderRegistration; 
}
export const getSchedule = (time: number): Schedule => {
  if (appSettingsModule.data?.schedule) return appSettingsModule.data.schedule[time];
  console.error("appSettingsModule not loaded, returning empty schedule");
  return {start: "", stop: ""} as Schedule;
};
export const getSectionTypes = async () => {
  if (!appConfigurationModule.data) await appConfigurationModule.fetch();
  return appConfigurationModule.data?.sectionTypes;
};
export const getCircuits = async () => {
  if (!appConfigurationModule.data) await appConfigurationModule.fetch();
  return appConfigurationModule.data?.circuits;
};
export const isShowRankingToAll = (): boolean => {
  if (appSettingsModule.data?.showRankingToAll) return appSettingsModule.data.showRankingToAll;
  return appSettingsDefaults.showRankingToAll;
};
export const getAppSettings = computed(() => {
  return appSettingsModule.data;
});

///////////////
/// Setters //
/////////////

export const updateAppSettings = async (settingsData: any) => {
  await appSettingsModule.merge(settingsData);
  toastPopup("Les paramètres de l'app ont été mis à jour");
} 
export const setSchedule = async (schedule: Schedule[]) => {
  return appSettingsModule.merge({ schedule });
} 

// fixme
export const hardcodeSchedule = async () => {
  const schedule = [
    {start: "10h09", stop: "10h24"},
    {start: "10h27", stop: "10h42"},
    {start: "10h45", stop: "11h00"},
    {start: "11h03", stop: "11h18"},
    {start: "11h23", stop: "11h36"},
    {start: "11h39", stop: "11h54"},
    {start: "11h57", stop: "12h12"},
    {start: "13h15", stop: "13h30"},
    {start: "13h33", stop: "13h48"},
    {start: "13h51", stop: "14h06"},
    {start: "14h09", stop: "14h24"},
    {start: "14h27", stop: "14h42"},
    {start: "14h45", stop: "15h00"},
    {start: "15h15", stop: "15h30"},
    {start: "15h33", stop: "15h48"},
    {start: "15h51", stop: "16h06"},
    {start: "16h09", stop: "16h24"},
  ]
  return appConfigurationModule.merge({ schedule });
}