import { computed } from "vue";
import { magnetar } from "./magnetar";
import { toastPopup } from "./popup";

const APP_COLLECTION_NAME = "app";
const SETTINGS_DOCUMENT_KEY = "settings";
const CONFIGURATION_DOCUMENT_KEY = "configuration";

////////////////
/// Settings //
// App settings (from firestore, through magneta)

type AppSettings = {
  maxGameLeaders: number; // max allowed leaders per game
  freezeScore: boolean;
  everyoneCanSetScoreAnywhere: boolean;
  leaderRegistration: boolean; // true when the leader can register to games
  showRankingToAll: boolean;
  showGameAvailabilities: boolean;
}

const appSettingsDefaults: AppSettings = {
  maxGameLeaders: 2,
  freezeScore: true,
  everyoneCanSetScoreAnywhere: false,
  leaderRegistration: true,
  showRankingToAll: false,
  showGameAvailabilities: true,
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

type AppConfiguration = {
  sectionTypes: string[];
  circuits: any;
  schedule: Schedule[];
}

const appConfigurationDefaults: AppConfiguration = {
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

const streamSettings = () => {
  appSettingsModule.stream().catch(error => {
    console.error(`App settings stream failed`, error);
  })
}
const closeSettingsStream = () => {
  appSettingsModule.closeStream();
}
const fetchAppConfiguration = () => {
  appConfigurationModule.fetch().catch(error => {
    console.error(`App configuration fetch failed`, error);
  })
}

///////////////
/// Getters //
/////////////

// App settings

const isScoresFrozen = (): boolean | undefined => {
  return appSettingsModule.data?.freezeScore;
};
const getMaxGameLeaders = (): number => {
  return appSettingsModule.data?.maxGameLeaders ?? appSettingsDefaults.maxGameLeaders;
};
const canSetScoreAnywhere = (): boolean | undefined => {
  return appSettingsModule.data?.everyoneCanSetScoreAnywhere;
};
const isLeaderRegistrationOpen = () => {
  return appSettingsModule.data?.leaderRegistration;
}
const isRankingPublic = (): boolean => {
  if (appSettingsModule.data?.showRankingToAll) return appSettingsModule.data.showRankingToAll;
  return appSettingsDefaults.showRankingToAll;
};
const isShowGameAvailabilities = (): boolean | undefined => {
  return appSettingsModule.data?.showGameAvailabilities;
};
const getAppSettings = computed(() => {
  return appSettingsModule.data;
});

// App configuration

const getSchedule = (time: number): Schedule => {
  if (appConfigurationModule.data?.schedule) return appConfigurationModule.data.schedule[time];
  console.error("appSettingsModule not loaded, returning empty schedule");
  return {start: "", stop: ""} as Schedule;
};
const getSchedules = (): Schedule[] => {
  return appConfigurationModule.data?.schedule ?? [] as Schedule[];
};
const getSectionTypes = (): string[] | undefined => {
  if (!appConfigurationModule.data) appConfigurationModule.fetch();
  return appConfigurationModule.data?.sectionTypes;
};
const getCircuits = () => {
  if (!appConfigurationModule.data) appConfigurationModule.fetch();
  return appConfigurationModule.data?.circuits;
};


///////////////
/// Setters //
/////////////

const updateAppSettings = async (settingsData: any) => {
  await appSettingsModule.merge(settingsData);
  toastPopup("Les paramètres de l'app ont été mis à jour");
} 
const setSchedule = async (schedule: Schedule[]) => {
  return appConfigurationModule.merge({ schedule });
} 

// fixme
const hardcodeSchedule = async () => {
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
// hardcodeSchedule();