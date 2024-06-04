import { addToDocArray, db, removeFromDocArray } from "@/services/firebase"
import { confirmPopup, toastPopup } from "@/services/popup"
import { getMaxGameLeaders } from "@/services/settings"
import { ROLES, getRoleByValue, useAuthStore } from "@/services/users"
import { collection, doc, getDoc, orderBy, query, updateDoc, where } from "firebase/firestore"
import { MaybeRefOrGetter, Ref, computed, toValue } from "vue"
import { VueFirestoreDocumentData, useCollection, useCurrentUser, useDocument } from "vuefire"
import { RefUserProfile, getUserName, getUserProfile, updateUserProfile, useCurrentUserProfile } from "./users"
import { RefAppSettings } from "./settings"

// Constants & db references

const GAMES_COLLECTION_NAME = "games"
const GAMES_COLLECTION_REF = collection(db, GAMES_COLLECTION_NAME)
export const DEFAULT_GAME_ID = 0
export const DEFAULT_CIRCUIT_VALUE = ""

// Types

export type Game = {
  id: number
  hash: string
  name: string
  circuit: string
  morningLeaders: string[]
  afternoonLeaders: string[]
  matches: string[]
  weight: number
  noScores: boolean
}

type RefGame = Ref<VueFirestoreDocumentData<Game> | undefined>

// Getters

async function getGame(id: number){
  if (id === DEFAULT_GAME_ID) throw Error("Game id is the default value")
  const docSnap = await getDoc(doc(GAMES_COLLECTION_REF, id.toString()))
  if (docSnap.exists()) return docSnap.data()
  else throw Error(`Game not found for id ${id}`)
}

// Composables

export function useGame(rId: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const id = toValue(rId)
    if (id === DEFAULT_GAME_ID) return null
    console.debug(`Fetching game ${id}`)
    return doc(GAMES_COLLECTION_REF, id.toString())
  })
  return useDocument<Game>(dbRef)
}

export function useGames() {
  console.debug(`Fetching all games`)
  const dbRef = query(GAMES_COLLECTION_REF, orderBy("id"))
  return useCollection<Game>(dbRef)
}

export function useCircuitGames(rCircuit: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const circuit = toValue(rCircuit)
    if (circuit === DEFAULT_CIRCUIT_VALUE) return null
    console.debug(`Fetching games from circuit ${circuit}`)
    // prettier-ignore
    return query(
      GAMES_COLLECTION_REF, 
      where("circuit", "==", circuit),
      orderBy("id")
    )
  })
  return useCollection<Game>(dbRef)
}

// Setters

export const setGameName = (gameId: number, name: string) => {
  console.debug(`Changing the name of game ${gameId} to ${name}`)
  const dbRef = doc(GAMES_COLLECTION_REF, gameId.toString())
  return updateDoc(dbRef, { name })
}

/**
 * These methods actually update the DB, after the checks in setters below passed.
 */
const addMorningLeaders = async (gameId: number, uid: string) => {
  console.debug(`Adding user ${uid} to game ${gameId}`)
  const gameMergePromise = addToDocArray(GAMES_COLLECTION_NAME, gameId.toString(), "morningLeaders", uid)
  console.debug(`Adding game ${gameId} to user ${uid}`)
  const userMergePromise = updateUserProfile(uid, { morningGame: gameId })
  return Promise.all([gameMergePromise, userMergePromise]).then(() => {
    toastPopup("Responsables du matin mis à jour")
  })
}
const addAfternoonLeaders = async (gameId: number, uid: string) => {
  console.debug(`Adding user ${uid} to game ${gameId}`)
  const gameMergePromise = addToDocArray(GAMES_COLLECTION_NAME, gameId.toString(), "afternoonLeaders", uid)
  console.debug(`Adding game ${gameId} to user ${uid}`)
  const userMergePromise = updateUserProfile(uid, { afternoonGame: gameId })
  return Promise.all([gameMergePromise, userMergePromise]).then(() => {
    toastPopup("Responsables de l'après-midi mis à jour")
  })
}

// todo : move this to the Game component
/**
 * The two following setters adds a user to the morning leaders a game.
 */
export const setMorningLeader = async (rGame: RefGame, rTargetUser: RefUserProfile, rCurrentUser: RefUserProfile, rAppSettings: RefAppSettings) => {
  const game = toValue(rGame)
  const targetUser = toValue(rTargetUser)
  const currentUser = toValue(rCurrentUser)
  // arguments checks
  if (!game) throw Error("Undefined game")
  if (!targetUser) throw Error("Undefined targetUser")
  if (!currentUser) throw Error("Undefined currentUser")
  if (!rAppSettings.value) throw Error("Undefined appSettings")

  const maxGameLeaders = rAppSettings.value.maxGameLeaders
  const isCurrentUser =  targetUser.uid === currentUser.uid


  // applicability checks
  // prettier-ignore
  if (!isCurrentUser && currentUser.role < ROLES.Chef) throw new Error(
    `Tu n'as pas le droit d'assigner des gens à un jeu. ` +
    `Le rôle minimum pour inscrire quelqu'un à une épreuve est ${getRoleByValue(ROLES.Chef)}`
  )
  // prettier-ignore
  if (targetUser.role < ROLES.Animateur) throw new Error(
    `Le rôle de ${getUserName(targetUser)} est ${getRoleByValue(targetUser.role)}. `+
    `Le rôle minimum pour s'inscrire à une épreuve est ${getRoleByValue(ROLES.Animateur)}`
  )
  if (game.morningLeaders.includes(targetUser.uid)) throw Error(
    isCurrentUser
      ? `Tu es déjà inscrit.e à l'épreuve ${game.id} le matin`
      : `${getUserName(targetUser)} est déjà inscrit.e à l'épreuve ${game.id} le matin.`
  )
  if ((game.morningLeaders.length) >= maxGameLeaders)
    throw new Error(`Le nombre maximum d'animateurs a été atteint pour l'épreuve ${game.id} au matin`)
  if (targetUser.morningGame) {
    const currentGameId = targetUser.morningGame
    const message =
      isCurrentUser
        ? `Tu es déjà inscrit.e à l'épreuve ${currentGameId} le matin. Veux-tu te désincrire ?`
        : `${getUserName(targetUser)} est déjà inscrit.e à l'épreuve ${currentGameId} le matin. Le/la désincrire ?`
    confirmPopup(
      message,
      async () => {
        await removeMorningLeader(currentGameId, targetUser.uid)
        await addMorningLeaders(game.id, targetUser.uid)
      },
      () => toastPopup("Enregistrement annulé")
    )
  } else {
    await addMorningLeaders(game.id, targetUser.uid)
  }
}

/**
 * The two following setters adds a user to the afternoon leaders a game.
 */
export const setAfternoonLeader = async (rGame: RefGame, rTargetUser: RefUserProfile, rCurrentUser: RefUserProfile, rAppSettings: RefAppSettings) => {
  const game = toValue(rGame)
  const targetUser = toValue(rTargetUser)
  const currentUser = toValue(rCurrentUser)
  // arguments checks
  if (!game) throw Error("Undefined game")
  if (!targetUser) throw Error("Undefined targetUser")
  if (!currentUser) throw Error("Undefined currentUser")
  if (!rAppSettings.value) throw Error("Undefined appSettings")

  const maxGameLeaders = rAppSettings.value.maxGameLeaders
  const isCurrentUser =  targetUser.uid === currentUser.uid


  // applicability checks
  // prettier-ignore
  if (!isCurrentUser && currentUser.role < ROLES.Chef) throw new Error(
    `Tu n'as pas le droit d'assigner des gens à un jeu. ` +
    `Le rôle minimum pour inscrire quelqu'un à une épreuve est ${getRoleByValue(ROLES.Chef)}`
  )
  // prettier-ignore
  if (targetUser.role < ROLES.Animateur) throw new Error(
    `Le rôle de ${getUserName(targetUser)} est ${getRoleByValue(targetUser.role)}. `+
    `Le rôle minimum pour s'inscrire à une épreuve est ${getRoleByValue(ROLES.Animateur)}`
  )
  if (game.afternoonLeaders.includes(targetUser.uid)) throw Error(
    isCurrentUser
      ? `Tu es déjà inscrit.e à l'épreuve ${game.id} le matin`
      : `${getUserName(targetUser)} est déjà inscrit.e à l'épreuve ${game.id} le matin.`
  )
  if ((game.afternoonLeaders.length) >= maxGameLeaders)
    throw new Error(`Le nombre maximum d'animateurs a été atteint pour l'épreuve ${game.id} au matin`)
  if (targetUser.afternoonGame) {
    const currentGameId = targetUser.afternoonGame
    const message =
      isCurrentUser
        ? `Tu es déjà inscrit.e à l'épreuve ${currentGameId} le matin. Veux-tu te désincrire ?`
        : `${getUserName(targetUser)} est déjà inscrit.e à l'épreuve ${currentGameId} le matin. Le/la désincrire ?`
    confirmPopup(
      message,
      async () => {
        await removeAfternoonLeader(currentGameId, targetUser.uid)
        await addAfternoonLeaders(game.id, targetUser.uid)
      },
      () => toastPopup("Enregistrement annulé")
    )
  } else {
    await addAfternoonLeaders(game.id, targetUser.uid)
  }
}

/**
 * Remove leader from both the game and his profile data
 */
export const removeMorningLeader = async (gameId: number, uid: string) => {
  // remove from game
  console.debug(`Removing user ${uid} from game ${gameId} (morning)`)
  const gameMergePromise = removeFromDocArray(GAMES_COLLECTION_NAME, gameId.toString(), "morningLeaders", uid)

  // remove from user profile
  console.debug(`Removing game ${gameId} from user profile ${uid} (morning)`)
  const userMergePromise = updateUserProfile(uid, { morningGame: "" })

  return Promise.all([gameMergePromise, userMergePromise]).then(() => {
    toastPopup(`Désinscription à l'épreuve ${gameId} effectuée`)
  })
}
export const removeAfternoonLeader = async (gameId: number, uid = "") => {
  // remove from game
  console.debug(`Removing user ${uid} from game ${gameId} (afternoon)`)
  const gameMergePromise = removeFromDocArray(GAMES_COLLECTION_NAME, gameId.toString(), "afternoonLeaders", uid)

  // remove from user profile
  console.debug(`Removing game ${gameId} from user profile ${uid} (afternoon)`)
  const userMergePromise = updateUserProfile(uid, { afternoonGame: "" })

  return Promise.all([gameMergePromise, userMergePromise]).then(() => {
    toastPopup(`Désinscription à l'épreuve ${gameId} effectuée`)
  })
}

export const setGameNoScores = async (gameId: number, noScores: boolean) => {
  const dbRef = doc(GAMES_COLLECTION_REF, gameId.toString())
  return updateDoc(dbRef, { noScores }).then(() => {
    toastPopup(`Les scores de l'épreuve ${gameId} ont été ${noScores ? "désactivés" : "activés"}`)
  })
}
