import type { AppSettings, AttendantTimeSlot } from '@/types'
import { getDoc, updateDoc } from 'firebase/firestore'
import {
  APP_COLLECTION_NAME,
  APP_CONFIG_DOC_NAME,
  APP_CONFIG_DOC_REF,
  APP_SETTINGS_DOC_REF,
  ATTENDANT_SCHEDULE_KEY,
  GAMES_COLLECTION_NAME,
  USER_PROFILES_COLLECTION_NAME,
  USER_PROFILES_GAMES_KEY,
} from '@/constants'
import { addToDocArray, generateRandomId, updateFieldInCollection } from '@/services/firebase'

// Getters

export async function isRankingPublic(): Promise<boolean> {
  const docSnap = await getDoc(APP_SETTINGS_DOC_REF)
  if (docSnap.exists()) return docSnap.data().isRankingPublic
  return false
}

// Setters

export async function updateAppSettings(settingsData: Partial<AppSettings>) {
  return updateDoc(APP_SETTINGS_DOC_REF, settingsData)
}

export async function addAttendantTiming(attendantTimeSlot: AttendantTimeSlot) {
  attendantTimeSlot.id = generateRandomId()
  return addToDocArray(APP_COLLECTION_NAME, APP_CONFIG_DOC_NAME, ATTENDANT_SCHEDULE_KEY, attendantTimeSlot)
}

/**
 * @deprecated One should not remove the attendantTiming separately. Instead, reset all of them.
 * Removing a attendantTiming value expose the app to attendants registered to unknownn timing ids.
 */
export function removeAttendantTiming(): never {
  throw new Error('One should not remove the attendantTiming one by one')
}
const defaultAttendantTimings: AttendantTimeSlot[] = [
  { start: '08h30', stop: '12h00', id: '', name: 'Matin' },
  { start: '13h00', stop: '17h00', id: '', name: 'Après-midi' },
]
/**
 * Reset attendants timings
 * Do not use if attendant have already registered to games as it would reset the id of the timings
 * @param attendantTimings new attendant timings
 */
export async function resetAttendantTimings(attendantTimings: AttendantTimeSlot[] = defaultAttendantTimings) {
  for (let i = 0; i < attendantTimings.length; i++) {
    if (!attendantTimings[i].name) attendantTimings[i].name = String(i + 1)
    attendantTimings[i].id = generateRandomId()
  }
  // remove all attendant registrations in games and users collections
  const gamesCleaningPromise = updateFieldInCollection(GAMES_COLLECTION_NAME, ATTENDANT_SCHEDULE_KEY, {})
  const usersCleaningPromise = updateFieldInCollection(USER_PROFILES_COLLECTION_NAME, USER_PROFILES_GAMES_KEY, {})
  await Promise.all([gamesCleaningPromise, usersCleaningPromise])
  // apply new attendant timings
  return updateDoc(APP_CONFIG_DOC_REF, { attendantTimings })
}
