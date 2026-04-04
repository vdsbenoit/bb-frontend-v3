import { db } from '@/services/firebase'
import { collection, doc } from 'firebase/firestore'

// users

export const DEFAULT_USER_ID = ''
export const USER_PROFILES_COLLECTION_NAME = 'userProfiles'
export const USER_PROFILES_COLLECTION_REF = collection(db, USER_PROFILES_COLLECTION_NAME)
export const USER_PROFILES_GAMES_KEY = 'games'

export const USER_ROLES = {
  Erreur: -1, // Error
  Anonyme: 0, // Anonymous
  Newbie: 1, // Newbie
  Participant: 2, // Player
  Animateur: 4, // Attendant
  Chef: 5, // Leader
  Organisateur: 6, // Staff
  Administrateur: 8, // AppAdmin
}
export const DEFAULT_USER_ROLE_VALUE = USER_ROLES.Erreur

// groups

export const DEFAULT_GROUP_CATEGORY_ID = ''
export const DEFAULT_GROUP_ID = ''
export const GROUPS_COLLECTION_NAME = 'groups'
export const GROUPS_COLLECTION_REF = collection(db, GROUPS_COLLECTION_NAME)

export const GROUP_ROLES = {
  Erreur: -1, // Error
  Player: 2, // Player
  Attendant: 4, // Attendant
  AttendantAndStaff: 5, // Attendant and Staff
  Staff: 6, // Staff
}
export const DEFAULT_GROUP_ROLE_VALUE = GROUP_ROLES.Erreur

// player teams

export const DEFAULT_TEAM_ID = ''
export const TEAMS_COLLECTION_NAME = 'playerTeams'
export const TEAMS_COLLECTION_REF = collection(db, TEAMS_COLLECTION_NAME)

// games

export const DEFAULT_GAME_ID = ''
export const DEFAULT_CIRCUIT_VALUE = ''
export const GAMES_COLLECTION_NAME = 'games'
export const GAMES_COLLECTION_REF = collection(db, GAMES_COLLECTION_NAME)

// matches

export const DEFAULT_MATCH_ID = ''
export const DEFAULT_TIME_VALUE = -1
export const MATCHES_COLLECTION_NAME = 'matches'
export const MATCHES_COLLECTION_REF = collection(db, MATCHES_COLLECTION_NAME)

// app settings & configuration

export const APP_COLLECTION_NAME = 'app'
export const APP_COLLECTION_REF = collection(db, APP_COLLECTION_NAME)

export const APP_SETTINGS_DOC_NAME = 'settings'
export const APP_SETTINGS_DOC_REF = doc(APP_COLLECTION_REF, APP_SETTINGS_DOC_NAME)

export const APP_CONFIG_DOC_NAME = 'configuration'
export const APP_CONFIG_DOC_REF = doc(APP_COLLECTION_REF, APP_CONFIG_DOC_NAME)

export const ATTENDANT_SCHEDULE_KEY = 'attendantSchedule'
