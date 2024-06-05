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

type Timing = {
  start: string;
  stop: string;
  name: string;
  isGame: boolean;
}
export type AppConfig = {
  sectionTypes: string[];
  circuits: any;
  playerTimings: Timing[];
  attendantTimings: Timing[];
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
export const setPlayerTimings = async (playerTimings: Timing[]) => {
  for (let i=0; i< playerTimings.length; i++){
    if (!playerTimings[i].name) playerTimings[i].name = String(i+1)
  }
  return updateDoc(CONFIG_DOC_REF, { playerTimings })
} 
export const setAttendantTimings = async (attendantTimings: Timing[]) => {
  return updateDoc(CONFIG_DOC_REF, { attendantTimings })
} 

// fixme
export const hardcodeTimings = async () => {
  const playerTimings = [
    {start: "10h09", stop: "10h24", name: "", isGame: true},
    {start: "10h27", stop: "10h42", name: "", isGame: true},
    {start: "10h45", stop: "11h00", name: "", isGame: true},
    {start: "11h03", stop: "11h18", name: "", isGame: true},
    {start: "11h23", stop: "11h36", name: "", isGame: true},
    {start: "11h39", stop: "11h54", name: "", isGame: true},
    {start: "11h57", stop: "12h12", name: "", isGame: true},
    {start: "13h15", stop: "13h30", name: "", isGame: true},
    {start: "13h33", stop: "13h48", name: "", isGame: true},
    {start: "13h51", stop: "14h06", name: "", isGame: true},
    {start: "14h09", stop: "14h24", name: "", isGame: true},
    {start: "14h27", stop: "14h42", name: "", isGame: true},
    {start: "14h45", stop: "15h00", name: "", isGame: true},
    {start: "15h15", stop: "15h30", name: "", isGame: true},
    {start: "15h33", stop: "15h48", name: "", isGame: true},
    {start: "15h51", stop: "16h06", name: "", isGame: true},
    {start: "16h09", stop: "16h24", name: "", isGame: true},
  ]
  const attendantTimings = [
    {start: "08h30", stop: "12h00", isGame: true, name: "Matin"},
    {start: "12h00", stop: "13h00", isGame: false, name: "Pause de midi"},
    {start: "13h00", stop: "17h00", isGame: true, name: "Après-midi"}
  ]
  setPlayerTimings(playerTimings)
  setAttendantTimings(attendantTimings)
}
