import { collection, doc, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { useAuthStore } from '../services/users';
import { db } from '@/services/firebase';
import { MaybeRefOrGetter, Ref, computed, toValue } from 'vue';
import { VueFirestoreDocumentData, useCollection, useDocument } from 'vuefire';
import { DEFAULT_GAME_ID } from './games';
import { DEFAULT_TEAM_ID } from './teams';

// Constants

const MATCHES_COLLECTION_NAME = "matches"
const MATCHES_COLLECTION_REF = collection(db, MATCHES_COLLECTION_NAME)
const DEFAULT_MATCH_ID = ""
const DEFAULT_TIME_VALUE = 0

// Types

export type Match = {
  id: string;
  game_id: number;
  game_name: string;
  time: number;
  player_ids: string[];
  player_numbers: number[];
  winner: string;
  loser: string;
  draw: boolean;
  reporter: string;
  lastModified: string;
  hasScore: boolean; // todo: remove this in next release
  noScores: boolean;
}

type RefMatch = Ref<VueFirestoreDocumentData<Match> | undefined>

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

export function useGameMatchs(rId: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const id = toValue(rId)
    if (id === DEFAULT_GAME_ID) return null 
    console.debug(`Fetching matches from game ${id}`)
    return query(
      MATCHES_COLLECTION_REF, 
      where("game_id", "==", id),
      orderBy("time", "asc")
    )
  })
  return useCollection<Match>(dbRef);
}
export function useTeamMatchs(rId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rId)
    if (id === DEFAULT_TEAM_ID) return null
    console.debug(`Fetching matches from team ${id}`)
    return query(
      MATCHES_COLLECTION_REF, 
      where("player_ids", "array-contains", id),
      orderBy("time", "asc")
    )
  })
  return useCollection<Match>(dbRef);
}
export function useTimeMatchs(rTime: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const time = toValue(rTime)
    if (time === DEFAULT_TIME_VALUE) return null
    console.debug(`Fetching matches from time ${time}`)
    return query(
      MATCHES_COLLECTION_REF, 
      where("time", "==", time),
      orderBy("game_id", "asc")
    )
  })
  return useCollection<Match>(dbRef);
}


// Setters

const user = useAuthStore();


export const setMatchScore = async (matchId: string, winner: string, loser: string) => {
  const reporter = user.uid;
  const lastModified = new Date().toISOString()
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { winner, loser, draw: false, reporter, lastModified }).then(() => 
    console.debug(`You've just set ${winner} as a winner and ${loser} as loser of match ${matchId}`)
  )
};

export const setMatchDraw = async (matchId: string) => {
  const reporter = user.uid;
  const lastModified = new Date().toISOString()
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { winner: "", loser: "", draw: true, reporter, lastModified }).then(() => 
    console.debug(`A draw has been set on match ${matchId}`)
  )
};

export const resetMatchScore = async (matchId: string) => {
  const reporter = user.uid;
  const lastModified = new Date().toISOString()
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { winner: "", loser: "", draw: false, reporter, lastModified }).then(() => 
    console.debug(`Scores have been reset on match ${matchId}`)
  )
};

export const setMatchNoScores = async (matchId: string, noScores: boolean) => {
  const dbRef = doc(MATCHES_COLLECTION_REF, matchId)
  return updateDoc(dbRef, { noScores }).then(() => 
    console.debug(`Scores have been ${ noScores ? 'disabled' : 'enabled' } on match ${matchId}`)
  )
}