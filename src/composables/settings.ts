import { APP_CONFIG_DOC_REF, APP_SETTINGS_DOC_REF } from "@/constants";
import { AppSettings, Timing } from "@/types";
import { updateDoc } from "firebase/firestore";
import { AppConfig } from "vue";
import { useDocument } from "vuefire";


// Composables 

export function useAppSettings() {
  return useDocument<AppSettings>(APP_SETTINGS_DOC_REF)
}
export function useAppConfig() {
  return useDocument<AppConfig>(APP_CONFIG_DOC_REF)
}

// Setters

export const updateAppSettings = async (settingsData: any) => {
  return updateDoc(APP_SETTINGS_DOC_REF, settingsData)
} 
export const setPlayerTimings = async (playerTimings: Timing[]) => {
  for (let i=0; i< playerTimings.length; i++){
    if (!playerTimings[i].name) playerTimings[i].name = String(i+1)
  }
  return updateDoc(APP_CONFIG_DOC_REF, { playerTimings })
} 
export const setAttendantTimings = async (attendantTimings: Timing[]) => {
  return updateDoc(APP_CONFIG_DOC_REF, { attendantTimings })
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
