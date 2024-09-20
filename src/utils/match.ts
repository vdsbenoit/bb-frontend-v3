import { MATCHES_COLLECTION_REF } from "@/constants"
import { doc, updateDoc } from "firebase/firestore"

// Setters

export const setMatchScore = async (matchId: string, winner: string, loser: string, reporterUid: string) => {
  const lastModified = new Date().toISOString()
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { winner, loser, draw: false, reporter: reporterUid, lastModified }).then(() =>
    console.debug(`You've just set ${winner} as a winner and ${loser} as loser of match ${matchId}`)
  )
}

export const setMatchDraw = async (matchId: string, reporterUid: string) => {
  const lastModified = new Date().toISOString()
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { winner: "", loser: "", draw: true, reporter: reporterUid, lastModified }).then(() =>
    console.debug(`A draw has been set on match ${matchId}`)
  )
}

export const resetMatchScore = async (matchId: string, reporterUid: string) => {
  const lastModified = new Date().toISOString()
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { winner: "", loser: "", draw: false, reporter: reporterUid, lastModified }).then(() =>
    console.debug(`Scores have been reset on match ${matchId}`)
  )
}

export const setMatchNoScores = async (matchId: string, noScores: boolean) => {
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { noScores })
}
