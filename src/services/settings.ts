import { magnetar } from "./magnetar";

const SETTINGS_COLLECTION = "settings";
const SETTINGS_DOCUMENT = "app";

/////////////////////
/// configuration //
//////////////////

interface Schedule {
  start: string;
  stop: string;
}

// App settings (from firestore, through magneta)
export interface AppSetting {
  lastGameDbUpdate: Date; // last time the game DB was updated on the remote, to avoid streaming it
  maxGameLeaders: number; // max allowed leaders per game
  freezeScore: boolean;
  categories: string[];
  leaderCategoryName: string;
  everyoneCanSetScoreAnywhere: boolean;
  leaderRegistration: boolean; // true when the leader can register to games
  schedule: Schedule[];
}

const appSettingsDefaults = {
  lastGameDbUpdate: new Date(0),
  maxGameLeaders: 2,
  freezeScore: true,
  categories: [],
  leaderCategoryName: "Animateurs",
  everyoneCanSetScoreAnywhere: false,
  leaderRegistration: true, // fixme: change to false
  schedule: [] as Schedule[],
};

function appSettingsDefaultsFunc(payload?: Partial<AppSetting>): AppSetting {
  return { ...appSettingsDefaults, ...payload }
}
const appSettingsModule = magnetar.doc<AppSetting>(`${SETTINGS_COLLECTION}/${SETTINGS_DOCUMENT}`, {
  modifyPayloadOn: { insert: appSettingsDefaultsFunc },
  modifyReadResponseOn: { added: appSettingsDefaultsFunc },
});
appSettingsModule.stream().catch(error => {
  console.error(`App settings stream failed`, error);
});

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
  console.error("appSettingsModule not loaded, returning default value for leaderRegistration");
  return appSettingsDefaults.leaderRegistration; 
}
export const getSchedule = (time: number): Schedule => {
  if (appSettingsModule.data?.schedule) return appSettingsModule.data.schedule[time];
  console.error("appSettingsModule not loaded, returning empty schedule");
  return {start: "", stop: ""} as Schedule;
};
export const getCategories = async () => {
  const appSettings = await appSettingsModule.fetch()
  if (appSettings) return appSettings.categories;
  console.error("appSettingsModule could not be loaded, returning empty category list");
  return appSettingsDefaults.categories;
};
export const getLeaderCategoryName = (): string => {
  if (appSettingsModule.data?.schedule) return appSettingsModule.data.leaderCategoryName;
  console.error("appSettings not loaded, returning default leaderCategoryName");
  return appSettingsDefaults.leaderCategoryName;
};

///////////////
/// Setters //
/////////////

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