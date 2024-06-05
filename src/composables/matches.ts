import { DEFAULT_GAME_ID, DEFAULT_MATCH_ID, DEFAULT_TEAM_ID, DEFAULT_TIME_VALUE, MATCHES_COLLECTION_REF } from "@/constants"
import { Match } from "@/types"
import { doc, orderBy, query, updateDoc, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useDocument } from "vuefire"

// Getters

// Composables

export function useMatch(rId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rId)
    if (id === DEFAULT_MATCH_ID) return null
    console.debug(`Fetching match ${id}`)
    return doc(MATCHES_COLLECTION_REF, id)
  })
  return useDocument<Match>(dbRef)
}

export function useGameMatches(rGameId: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const id = toValue(rGameId)
    if (id === DEFAULT_GAME_ID) return null
    console.debug(`Fetching matches from game ${id}`)
    // prettier-ignore
    return query(
      MATCHES_COLLECTION_REF, 
      where("game_id", "==", id),
      orderBy("time", "asc")
    )
  })
  return useCollection<Match>(dbRef)
}
export function useTeamMatches(rTeamId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rTeamId)
    if (id === DEFAULT_TEAM_ID) return null
    console.debug(`Fetching matches from team ${id}`)
    // prettier-ignore
    return query(
      MATCHES_COLLECTION_REF, 
      where("player_ids", "array-contains", id),
      orderBy("time", "asc")
    )
  })
  return useCollection<Match>(dbRef)
}
export function useTimeMatches(rTime: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const time = toValue(rTime)
    if (time === DEFAULT_TIME_VALUE) return null
    console.debug(`Fetching matches from time ${time}`)
    // prettier-ignore
    return query(
      MATCHES_COLLECTION_REF, 
      where("time", "==", time),
      orderBy("game_id", "asc")
    )
  })
  return useCollection<Match>(dbRef)
}

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
  return updateDoc(dbRef, { noScores }).then(() =>
    console.debug(`Scores have been ${noScores ? "disabled" : "enabled"} on match ${matchId}`)
  )
}
