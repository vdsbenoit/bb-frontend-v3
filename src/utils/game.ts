import type { Game } from '@/types'
import { deleteField, doc, getDoc, updateDoc } from 'firebase/firestore'
import { DEFAULT_GAME_ID, GAMES_COLLECTION_NAME, GAMES_COLLECTION_REF, USER_PROFILES_COLLECTION_REF } from '@/constants'
import { addToDocArray, removeFromDocArray, updateGameNameInMatches } from '@/services/firebase'
import { updateUserProfile } from '@/utils/userProfile'

// Getters

export async function getGame(gameId: string): Promise<Game> {
  if (gameId === DEFAULT_GAME_ID) throw new Error('Game id is the default value')
  const docSnap = await getDoc(doc(GAMES_COLLECTION_REF, gameId))
  if (docSnap.exists()) return docSnap.data() as Game
  else throw new Error(`Game not found with id ${gameId}`)
}

// Setters

export async function setGameName(gameId: string, name: string) {
  const promises = []
  console.debug(`Changing the name of game ${gameId} to ${name}`)
  const dbRef = doc(GAMES_COLLECTION_REF, gameId)
  promises.push(updateDoc(dbRef, { name }))
  // update the game name in all the match documents where match.gameId === gameId
  promises.push(updateGameNameInMatches(gameId, name))
  return Promise.all(promises)
}

/**
 * Add the attendant to the game document, and the game to the attendant profile
 */
export async function addAttendant(gameId: string, uid: string, timeSlotId: string) {
  const userDocRef = doc(USER_PROFILES_COLLECTION_REF, uid)
  const gameDocRef = doc(GAMES_COLLECTION_REF, gameId)
  console.debug(`Adding user ${uid} to game ${gameId} at timing id ${timeSlotId}`)
  const gameMergePromise = addToDocArray(GAMES_COLLECTION_NAME, gameId, `attendants.${timeSlotId}`, userDocRef)
  console.debug(`Adding game ${gameId} to user ${uid}`)
  const userMergePromise = updateUserProfile(uid, { [`games.${timeSlotId}`]: gameDocRef })
  return Promise.all([gameMergePromise, userMergePromise])
}

/**
 * Remove attendant from the game, and the game from the attendant profile
 */
export async function removeAttendant(gameId: string, uid: string, timeSlotId: string) {
  const userDocRef = doc(USER_PROFILES_COLLECTION_REF, uid)
  // remove from game
  console.debug(`Removing user ${uid} from game ${gameId} at timing id ${timeSlotId}`)
  const gameMergePromise = removeFromDocArray(GAMES_COLLECTION_NAME, gameId, `attendants.${timeSlotId}`, userDocRef)

  // remove from user profile
  console.debug(`Removing game ${gameId} from user profile ${uid} at timing id ${timeSlotId}`)
  const userMergePromise = updateUserProfile(uid, { [`games.${timeSlotId}`]: deleteField() })

  return Promise.all([gameMergePromise, userMergePromise])
}

export async function setGameNoScores(gameId: string, noScores: boolean) {
  const dbRef = doc(GAMES_COLLECTION_REF, gameId)
  return updateDoc(dbRef, { noScores })
}
