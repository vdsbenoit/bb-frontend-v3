import { addToDocArray, db, removeFromDocArray } from "@/services/firebase";
import { confirmPopup, toastPopup } from "@/services/popup";
import { getMaxGameLeaders } from "@/services/settings";
import { ROLES, getRoleByValue, useAuthStore } from "@/services/users";
import { collection, doc, orderBy, query, updateDoc, where } from "firebase/firestore";
import { MaybeRefOrGetter, Ref, computed, toValue } from "vue";
import { VueFirestoreDocumentData, useCollection, useDocument } from "vuefire";

// Constants & db references

const GAMES_COLLECTION_NAME = "games";
const GAMES_COLLECTION_REF = collection(db, GAMES_COLLECTION_NAME);
export const DEFAULT_GAME_ID = 0

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

export function isDefaultGameId(id: number){
  return id === DEFAULT_GAME_ID
}

// Composables 

export function useGame(rId: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const id = toValue(rId)
    console.debug(`Fetching game ${id}`)
    if (isDefaultGameId(id)) return null
    return doc(GAMES_COLLECTION_REF, id.toString())
  })
  return useDocument<Game>(dbRef)
}

export function useGames() {
  console.debug(`Fetching all games`)
  const dbRef = query(GAMES_COLLECTION_REF, orderBy("id"));
  return useCollection<Game>(dbRef);
}

export function useCircuitGames(rCircuit: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const circuit = toValue(rCircuit)
    console.debug(`Fetching games from circuit ${circuit}`)
    if (!circuit) return null
    return query(
      GAMES_COLLECTION_REF, 
      where("circuit", "==", circuit),
      orderBy("id")
    )
  })
  return useCollection<Game>(dbRef);
}

// Setters

const user = useAuthStore();

export const setName = (gameId: number, name: string) => {
  console.debug(`Changing the name of game ${gameId} to ${name}`);
  const dbRef = doc(GAMES_COLLECTION_REF, gameId.toString())
  return updateDoc(dbRef, { name })
} 

/**
 * These methods actually update the DB, after the checks in setters below passed.
 */
const addMorningLeaders = async (gameId: number, uid: string) => {
  console.debug(`Adding user ${uid} to game ${gameId}`);
  const gameMergePromise = addToDocArray(GAMES_COLLECTION_NAME, gameId.toString(), "morningLeaders", uid)
  console.debug(`Adding game ${gameId} to user ${uid}`);
  const userMergePromise = user.updateProfile(uid, { morningGame: gameId });
  return Promise.all([gameMergePromise, userMergePromise]).then(() => {
    toastPopup("Responsables du matin mis à jour");
  })
};
const addAfternoonLeaders = async (gameId: number, uid: string) => {
  console.debug(`Adding user ${uid} to game ${gameId}`);
  const gameMergePromise = addToDocArray(GAMES_COLLECTION_NAME, gameId.toString(), "afternoonLeaders", uid)
  console.debug(`Adding game ${gameId} to user ${uid}`);
  const userMergePromise = user.updateProfile(uid, { afternoonGame: gameId });
  return Promise.all([gameMergePromise, userMergePromise]).then(() => {
    toastPopup("Responsables de l'après-midi mis à jour");
  })
};



/**
 * The two following setters adds a user to the morning leaders a game.
 * To set a leader, the user must have loaded the either the game lists or the game page.
 * Therefore, by design, it is not required to fetch the game data here.
 */
export const setMorningLeader = async (game: RefGame , uid = "") => {
  if (uid === "") uid = user.uid;
  if (uid !== user.uid && user.profile.role < ROLES.Chef) throw new Error(
    `Tu n'as pas le droit d'assigner des gens à un jeu. Le rôle minimum pour inscrire quelqu'un à une épreuve est ${getRoleByValue(5)}`
  );
  const profile = await user.getLatestProfileData(uid);
  if(!profile) throw new Error(`Nous n'avons pas réussi à retrouver le profil de l'utilisateur ${uid}`);
  // Checks
  if (!game || !game.value) throw Error('Undefined game')
  const gameId = game.value.id
  if (game.value.morningLeaders.includes(uid)) throw Error(`Déjà inscrit.e à l'épreuve ${gameId} le matin`);
  if (profile?.role < ROLES.Animateur) throw new Error(`Le rôle de ${user.getName(uid)} est ${getRoleByValue(profile.role)}. Le rôle minimum pour s'inscrire à une épreuve est ${getRoleByValue(4)}`);
  const maxGameLeaders = await getMaxGameLeaders();
  if ((game.value.morningLeaders.length as number) >= maxGameLeaders) throw new Error(`Le nombre maximum d'animateurs a été atteint pour l'épreuve ${gameId} au matin`);
  if (profile.morningGame) {
    const message = uid === user.uid ? `Tu es déjà inscrit.e à l'épreuve ${profile.morningGame} le matin. Veux-tu te désincrire ?` : `${user.getName(uid)} est déjà inscrit.e à l'épreuve ${profile.morningGame} le matin. Le/la désincrire ?`;
    confirmPopup(
      message,
      async () => {
        await removeMorningLeader(profile.morningGame, uid);
        await addMorningLeaders(gameId, uid);
      },
      () => toastPopup("Enregistrement annulé")
    );
  } else {
    await addMorningLeaders(gameId, uid);
  }
};

export const setAfternoonLeader = async (game: RefGame, uid = "") => {
  if (uid === "") uid = user.uid;
  if (uid !== user.uid && user.profile.role < ROLES.Chef) throw new Error(`Tu n'as pas le droit d'assigner des gens à un jeu. Le rôle minimum pour inscrire quelqu'un à une épreuve est ${getRoleByValue(5)}`);
  const profile = await user.getLatestProfileData(uid);
  if(!profile) throw new Error(`Nous n'avons pas réussi à retrouver le profil de l'utilisateur ${uid}`);
  // Checks
  if (!game || !game.value) throw Error('Undefined game')
  const gameId = game.value.id
  if (game.value.afternoonLeaders.includes(uid)) throw Error(`Déjà inscrit.e à l'épreuve ${gameId} l'après-midi`);
  if (profile.role < ROLES.Animateur) throw new Error(`Le rôle de ${user.getName(uid)} est ${getRoleByValue(profile.role)}. Le rôle minimum pour s'inscrire à une épreuve est ${getRoleByValue(4)}`);
  const maxGameLeaders = await getMaxGameLeaders();
  if ((game.value.afternoonLeaders.length as number) >= maxGameLeaders) throw new Error(`Le nombre maximum d'animateurs a été atteint pour l'épreuve ${gameId} l'après-midi`);
  if (profile.afternoonGame) {
    const message = uid === user.uid ? `Tu es déjà inscrit.e à l'épreuve ${profile.afternoonGame} l'après-midi. Veux-tu te désincrire ?` : `${user.getName(uid)} est déjà inscrit.e à l'épreuve ${profile.afternoonGame} l'après-midi. Le/la désincrire ?`;
    confirmPopup(
      message,
      async () => {
        await removeAfternoonLeader(profile.afternoonGame, uid); 
        await addAfternoonLeaders(gameId, uid);
      },
      () => toastPopup("Enregistrement annulé")
    );
  } else {
    await addAfternoonLeaders(gameId, uid);
  }
  
};

/**
 * Remove leader from both the game and his profile data
 */
export const removeMorningLeader = async (gameId: number, uid = "") => {
  if (uid === "") uid = user.uid;

  // remove from game
  console.debug(`Removing user ${uid} from game ${gameId} (morning)`);
  const gameMergePromise = removeFromDocArray(GAMES_COLLECTION_NAME, gameId.toString(), "morningLeaders", uid);

  // remove from user profile
  console.debug(`Removing game ${gameId} from user profile ${uid} (morning)`);
  const userMergePromise = user.updateProfile(uid, { morningGame: "" });

  return Promise.all([gameMergePromise, userMergePromise]).then(() => {
    toastPopup(`Désinscription à l'épreuve ${gameId} effectuée`);
  });
}
export const removeAfternoonLeader = async (gameId: number, uid = "") => {
  if (uid === "") uid = user.uid;

  // remove from game
  console.debug(`Removing user ${uid} from game ${gameId} (afternoon)`);
  const gameMergePromise = removeFromDocArray(GAMES_COLLECTION_NAME, gameId.toString(), "afternoonLeaders", uid);

  // remove from user profile
  console.debug(`Removing game ${gameId} from user profile ${uid} (afternoon)`);
  const userMergePromise = user.updateProfile(uid, { afternoonGame: "" });

  return Promise.all([gameMergePromise, userMergePromise]).then(() => {
    toastPopup(`Désinscription à l'épreuve ${gameId} effectuée`);
  });
}

export const setGameNoScores = async (gameId: number, noScores: boolean) => {
  const dbRef = doc(GAMES_COLLECTION_REF, gameId.toString())
  return updateDoc(dbRef, { noScores }).then(() => {
    toastPopup(`Les scores de l'épreuve ${gameId} ont été ${ noScores ? "désactivés" : "activés" }`);
  })
};