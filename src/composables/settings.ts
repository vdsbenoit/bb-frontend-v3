// Constants & db references

import { db } from "@/services/firebase";
import { collection, doc } from "firebase/firestore";
import { useDocument } from "vuefire";

const APP_COLLECTION_NAME = "app"
const SETTINGS_DOC_NAME = "settings"
const CONFIG_DOC_NAME = "configuration"

const APP_COLLECTION_REF = collection(db, APP_COLLECTION_NAME);
const SETTINGS_DOC_REF = doc(APP_COLLECTION_REF, SETTINGS_DOC_NAME)
const CONFIG_DOC_REF = doc(APP_COLLECTION_REF, CONFIG_DOC_NAME)


// Types

export type AppSettings = {
  maxGameLeaders: number; // max allowed leaders per game
  freezeScore: boolean;
  everyoneCanSetScoreAnywhere: boolean;
  leaderRegistration: boolean; // true when the leader can register to games
  showRankingToAll: boolean;
  showGameAvailabilities: boolean;
}

type Schedule = {
  start: string;
  stop: string;
}

export type AppConfig = {
  sectionTypes: string[];
  circuits: any;
  schedule: Schedule[];
}

// Getters


// Composables 

export function useAppSettings() {
  return useDocument<AppSettings>(SETTINGS_DOC_REF)
}
export function useAppConfig() {
  return useDocument<AppConfig>(CONFIG_DOC_REF)
}
