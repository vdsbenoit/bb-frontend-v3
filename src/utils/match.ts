import { doc, updateDoc } from 'firebase/firestore'
import { MATCHES_COLLECTION_REF } from '@/constants'

// Setters

export async function setMatchScore(matchId: string, winnerTeamId: string, loserTeamId: string, reporterUid: string) {
  const lastModified = new Date().toISOString()
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { winnerTeamId, loserTeamId, draw: false, reporter: reporterUid, lastModified }).then(() =>
    console.debug(`User ${winnerTeamId} was set as winner and ${loserTeamId} as loser of match ${matchId}`),
  )
}

export async function setMatchDraw(matchId: string, reporterUid: string) {
  const lastModified = new Date().toISOString()
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { winnerTeamId: '', loserTeamId: '', draw: true, reporter: reporterUid, lastModified }).then(
    () => console.debug(`A draw has been set on match ${matchId}`),
  )
}

export async function resetMatchScore(matchId: string, reporterUid: string) {
  const lastModified = new Date().toISOString()
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { winnerTeamId: '', loserTeamId: '', draw: false, reporter: reporterUid, lastModified }).then(
    () => console.debug(`Scores have been reset on match ${matchId}`),
  )
}

export async function setMatchNoScores(matchId: string, noScores: boolean) {
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { noScores })
}
