import { computed } from "vue";
import { magnetar } from "./magnetar";
import { toastPopup } from "./popup";

const SETTINGS_COLLECTION_NAME = "settings";
const SETTINGS_DOCUMENT_KEY = "app";

/////////////////////
/// configuration //
//////////////////

interface Schedule {
  start: string;
  stop: string;
}

// App settings (from firestore, through magneta)
export interface AppSetting {
  maxGameLeaders: number; // max allowed leaders per game
  freezeScore: boolean;
  categories: string[];
  circuits: string[];
  leaderCategoryName: string;
  everyoneCanSetScoreAnywhere: boolean;
  leaderRegistration: boolean; // true when the leader can register to games
  schedule: Schedule[];
  showRankingToAll: boolean;
}

export const appSettingsDefaults = {
  maxGameLeaders: 2,
  freezeScore: true,
  categories: [],
  circuits: [],
  leaderCategoryName: "Animateurs",
  everyoneCanSetScoreAnywhere: false,
  leaderRegistration: true,
  schedule: [] as Schedule[],
  showRankingToAll: false,
};

function appSettingsDefaultsFunc(payload?: Partial<AppSetting>): AppSetting {
  return { ...appSettingsDefaults, ...payload }
}
const appSettingsModule = magnetar.doc<AppSetting>(`${SETTINGS_COLLECTION_NAME}/${SETTINGS_DOCUMENT_KEY}`, {
  modifyPayloadOn: { insert: appSettingsDefaultsFunc },
  modifyReadResponseOn: { added: appSettingsDefaultsFunc },
});
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
export const getCategories = async () => {
  if (!appSettingsModule.data) await appSettingsModule.fetch();
  return appSettingsModule.data?.categories;
};
export const getCircuits = async () => {
  if (!appSettingsModule.data) await appSettingsModule.fetch();
  return appSettingsModule.data?.circuits;
};
export const getLeaderCategoryName = (): string => {
  if (appSettingsModule.data?.schedule) return appSettingsModule.data.leaderCategoryName;
  console.error("appSettings not loaded, returning default leaderCategoryName");
  return appSettingsDefaults.leaderCategoryName;
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
  return appSettingsModule.merge({ schedule });
}