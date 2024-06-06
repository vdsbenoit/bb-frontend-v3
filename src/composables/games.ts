import { DEFAULT_CIRCUIT_VALUE, DEFAULT_GAME_ID, GAMES_COLLECTION_NAME, GAMES_COLLECTION_REF, ROLES } from "@/constants"
import { addToDocArray, removeFromDocArray } from "@/services/firebase"
import { confirmPopup, toastPopup } from "@/services/popup"
import { Game, RefAppSettings, RefGame, RefUserProfile } from "@/types"
import { doc, getDoc, orderBy, query, updateDoc, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useDocument } from "vuefire"
import { getRoleByValue, getUserName, updateUserProfile } from "./userProfile"

// Getters

export async function getGame(gameId: string){
  if (gameId === DEFAULT_GAME_ID) throw Error("Game id is the default value")
  const docSnap = await getDoc(doc(GAMES_COLLECTION_REF, gameId))
  if (docSnap.exists()) return docSnap.data()
  else throw Error(`Game not found with id ${gameId}`)
}

// Composables

export function useGame(rGameId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rGameId)
    if (id === DEFAULT_GAME_ID) return null
    console.debug(`Fetching game ${id}`)
    return doc(GAMES_COLLECTION_REF, id)
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

export const setGameName = (gameId: string, name: string) => {
  console.debug(`Changing the name of game ${gameId} to ${name}`)
  const dbRef = doc(GAMES_COLLECTION_REF, gameId)
  return updateDoc(dbRef, { name })
}

/**
 * These methods actually update the DB, after the checks in setters below passed.
 */
const addMorningLeaders = async (gameId: string, uid: string) => {
  console.debug(`Adding user ${uid} to game ${gameId}`)
  const gameMergePromise = addToDocArray(GAMES_COLLECTION_NAME, gameId, "morningLeaders", uid)
  console.debug(`Adding game ${gameId} to user ${uid}`)
  const userMergePromise = updateUserProfile(uid, { morningGame: gameId })
  return Promise.all([gameMergePromise, userMergePromise]).then(() => {
    toastPopup("Responsables du matin mis à jour")
  })
}
const addAfternoonLeaders = async (gameId: string, uid: string) => {
  console.debug(`Adding user ${uid} to game ${gameId}`)
  const gameMergePromise = addToDocArray(GAMES_COLLECTION_NAME, gameId, "afternoonLeaders", uid)
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
  const isCurrentUser =  targetUser.id === currentUser.id


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
  if (game.morningLeaders.includes(targetUser.id)) throw Error(
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
        await removeMorningLeader(currentGameId, targetUser.id)
        await addMorningLeaders(game.id, targetUser.id)
      },
      () => toastPopup("Enregistrement annulé")
    )
  } else {
    await addMorningLeaders(game.id, targetUser.id)
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
  const isCurrentUser =  targetUser.id === currentUser.id


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
  if (game.afternoonLeaders.includes(targetUser.id)) throw Error(
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
        await removeAfternoonLeader(currentGameId, targetUser.id)
        await addAfternoonLeaders(game.id, targetUser.id)
      },
      () => toastPopup("Enregistrement annulé")
    )
  } else {
    await addAfternoonLeaders(game.id, targetUser.id)
  }
}

/**
 * Remove leader from both the game and his profile data
 */
export const removeMorningLeader = async (gameId: string, uid: string) => {
  // remove from game
  console.debug(`Removing user ${uid} from game ${gameId} (morning)`)
  const gameMergePromise = removeFromDocArray(GAMES_COLLECTION_NAME, gameId, "morningLeaders", uid)

  // remove from user profile
  console.debug(`Removing game ${gameId} from user profile ${uid} (morning)`)
  const userMergePromise = updateUserProfile(uid, { morningGame: "" })

  return Promise.all([gameMergePromise, userMergePromise]).then(() => {
    toastPopup(`Désinscription à l'épreuve ${gameId} effectuée`)
  })
}
export const removeAfternoonLeader = async (gameId: string, uid = "") => {
  // remove from game
  console.debug(`Removing user ${uid} from game ${gameId} (afternoon)`)
  const gameMergePromise = removeFromDocArray(GAMES_COLLECTION_NAME, gameId, "afternoonLeaders", uid)

  // remove from user profile
  console.debug(`Removing game ${gameId} from user profile ${uid} (afternoon)`)
  const userMergePromise = updateUserProfile(uid, { afternoonGame: "" })

  return Promise.all([gameMergePromise, userMergePromise]).then(() => {
    toastPopup(`Désinscription à l'épreuve ${gameId} effectuée`)
  })
}

export const setGameNoScores = async (gameId: string, noScores: boolean) => {
  const dbRef = doc(GAMES_COLLECTION_REF, gameId)
  return updateDoc(dbRef, { noScores }).then(() => {
    toastPopup(`Les scores de l'épreuve ${gameId} ont été ${noScores ? "désactivés" : "activés"}`)
  })
}
