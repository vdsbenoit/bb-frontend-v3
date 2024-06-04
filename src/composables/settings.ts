// Constants & db references

import { db } from "@/services/firebase";
import { collection, doc, updateDoc } from "firebase/firestore";
import { Ref } from "vue";
import { VueFirestoreDocumentData, useDocument } from "vuefire";

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
export type RefAppSettings = Ref<VueFirestoreDocumentData<AppSettings> | undefined>

type Schedule = {
  start: string;
  stop: string;
}
export type AppConfig = {
  sectionTypes: string[];
  circuits: any;
  schedule: Schedule[];
}
export type RefAppConfig = Ref<VueFirestoreDocumentData<AppConfig> | undefined>

// Getters


// Composables 

export function useAppSettings() {
  return useDocument<AppSettings>(SETTINGS_DOC_REF)
}
export function useAppConfig() {
  return useDocument<AppConfig>(CONFIG_DOC_REF)
}

// Setters

export const updateAppSettings = async (settingsData: any) => {
  return updateDoc(SETTINGS_DOC_REF, settingsData)
} 
export const setSchedule = async (schedule: Schedule[]) => {
  return updateDoc(CONFIG_DOC_REF, { schedule })
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
  return updateDoc(CONFIG_DOC_REF, { schedule })
}
