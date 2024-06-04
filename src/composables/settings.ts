// Constants & db references

const APP_COLLECTION_NAME = "app";

const GAMES_COLLECTION_REF = collection(db, GAMES_COLLECTION_NAME);
export const DEFAULT_GAME_ID = 0
export const DEFAULT_CIRCUIT_VALUE = ""

// Types

export type Game = {
  id: number;
  hash: string;
  name: string;
  circuit: string;
  morningLeaders: string[];
  afternoonLeaders: string[];
  matches: string[];
  weight: number;
  noScores: boolean;
};

type RefGame = Ref<VueFirestoreDocumentData<Game> | undefined>

// Getters


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