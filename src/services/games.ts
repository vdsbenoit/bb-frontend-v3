import { confirmPopup, toastPopup } from "./popup";
import { useAuthStore, ROLES, getRoleByValue } from "./users";
import { magnetar } from "./magnetar";
import { getMaxGameLeaders, canSetScoreAnywhere, isScoresFrozen } from "./settings";
import { DocInstance } from "magnetar";

const GAMES_COLLECTION = "games";
const user = useAuthStore();

/////////////////////
/// configuration //
//////////////////
export interface Game {
  id: number;
  hash: string;
  name: string;
  circuit: string;
  morningLeaders: string[];
  afternoonLeaders: string[];
  matches: string[];
  weight: number;
}

export function gamesDefaults(payload?: Partial<Game>): Game {
  const defaults = {
    id: -1,
    hash: "",
    name: "",
    circuit: "",
    morningLeaders: [],
    afternoonLeaders: [],
    matches: [],
    weight: 1,
  };
  return { ...defaults, ...payload };
}
const gamesModule = magnetar.collection<Game>(GAMES_COLLECTION, {
  modifyPayloadOn: { insert: gamesDefaults },
  modifyReadResponseOn: { added: gamesDefaults },
});

///////////////
/// Getters //
/////////////

export const getGames = (circuit: string) => {
  if(!circuit) return undefined;
  console.log(`Streaming games from circuit '${circuit}'`);
  const filteredGamesModule = gamesModule.where("circuit", "==", circuit).orderBy("id");
  filteredGamesModule.stream().catch((error) => {
    console.error(`Error occurred while streaming the ${GAMES_COLLECTION} collection`, error);
  });
  return filteredGamesModule.data;
};
// This method opens a stream on the game to get live updates
export const getGame = (id: string) => {
  if(!id) return undefined;
  const gameModule = gamesModule.doc(id);
  gameModule.stream().catch((error) => {
    console.error(`Game ${id} stream was closed due to an error`, error);
  });
  return gameModule.data;
};

export const canSetGameScore = async (gameId: string) => {
  if (isScoresFrozen()) {
    console.log("Cannot set score, score registration is closed")
    return false;
  }
  if (user.profile.role < ROLES.Animateur){ 
    console.log(`User ${user.uid} cannot edit game ${gameId} score. Insufficient role`);
    return false;
  }
  if (user.profile.role >= ROLES.Moderateur) return true;
  if (canSetScoreAnywhere()) return true;
  const gameModule = gamesModule.doc(gameId);
  await gameModule.fetch();
  if (gameModule.data?.morningLeaders.includes(user.uid) || gameModule.data?.afternoonLeaders.includes(user.uid)){
    return true;
  } else {
    console.log(`User ${user.uid} is note registered at ${gameId}`);
    return false;
  }
};

///////////////
/// Setters //
/////////////

/**
 * These methods actually update the DB, after the checks in setters below passed.
 */
const updateMorningLeaders = async (gameModule: DocInstance<Game>, gameId: string, uid: string) => {
  console.log(`Adding user ${uid} to game ${gameId}`);
  const gameMergePromise = gameModule.merge({ morningLeaders: [...(gameModule.data?.morningLeaders as string[]), uid] });
  const userMergePromise = user.updateProfile(uid, { morningGame: gameId });
  await Promise.all([gameMergePromise, userMergePromise]);
  toastPopup("Responsables du matin mis à jour");
};
const updateAfternoonLeaders = async (gameModule: DocInstance<Game>, gameId: string, uid: string) => {
  console.log(`Adding user ${uid} to game ${gameId}`);
  const gameMergePromise = gameModule.merge({ afternoonLeaders: [...(gameModule.data?.afternoonLeaders as string[]), uid] });
  const userMergePromise = user.updateProfile(uid, { afternoonGame: gameId });
  await Promise.all([gameMergePromise, userMergePromise]);
  toastPopup("Responsables de l'après-midi mis à jour");
};
/**
 * This setter add the current user to the morning leaders a game.
 * To set a leader, the user must be on a game page.
 * When a game page is opened, a stream is created for the game data.
 * Therefore, by design, it is not required to fetch the game data here.
 */
export const setMorningLeader = async (gameId: string, uid = "") => {
  if (uid === "") uid = user.uid;
  const profile = await user.getLatestProfileData(uid);
  const gameModule = gamesModule.doc(gameId);
  // Checks
  if (gameModule.data?.morningLeaders.includes(uid)) throw Error("Déjà inscrit.e à cette épreuve");
  if (profile.role < ROLES.Animateur) throw new Error(`Le role ${getRoleByValue(profile.role)} ne permet pas de s'inscrire à une épreuve`);
  const maxGameLeaders = await getMaxGameLeaders();
  if ((gameModule.data?.morningLeaders.length as number) >= maxGameLeaders) throw new Error("Le nombre maximum d'animateurs a été atteint pour cette épreuve au matin");
  if (profile.morningGame) {
    const message = uid === user.uid ? `Tu es déjà inscrit.e à l'épreuve ${profile.morningGame} le matin. Veux-tu te désincrire ?` : `${user.getName(uid)} est déjà inscrit.e à l'épreuve ${profile.morningGame} le matin. Le/la désincrire ?`;
    confirmPopup(
      message,
      async () => {
        await removeLeader(profile.morningGame, uid, true, false);
        await updateMorningLeaders(gameModule, gameId, uid);
      },
      () => toastPopup("Enresitrement annulé")
    );
  } else updateMorningLeaders(gameModule, gameId, uid);
};

export const setAfternoonLeader = async (gameId: string, uid = "") => {
  if (uid === "") uid = user.uid;
  const profile = await user.getLatestProfileData(uid);
  const gameModule = gamesModule.doc(gameId);
  // Checks
  if (gameModule.data?.afternoonLeaders.includes(uid)) throw Error("Tu es déjà inscrit à cette épreuve");
  if (profile.role < ROLES.Animateur) throw new Error(`Le role ${getRoleByValue(profile.role)} ne permet pas de s'inscrire à une épreuve`);
  const maxGameLeaders = await getMaxGameLeaders();
  if ((gameModule.data?.afternoonLeaders.length as number) >= maxGameLeaders) throw new Error("Le nombre maximum d'animateurs a été atteint pour cette épreuve l'après-midi");
  if (profile.afternoonGame) {
    const message = uid === user.uid ? `Tu es déjà inscrit.e à l'épreuve ${profile.afternoonGame} l'après-midi. Veux-tu te désincrire ?` : `${user.getName(uid)} est déjà inscrit.e à l'épreuve ${profile.afternoonGame} l'après-midi. Le/la désincrire ?`;
    confirmPopup(
      message,
      async () => {
        await removeLeader(profile.afternoonGame, uid, false, true);
        await updateAfternoonLeaders(gameModule, gameId, uid);
      },
      () => toastPopup("Enresitrement annulé")
    );
  } else updateAfternoonLeaders(gameModule, gameId, uid);
};

export const removeLeader = async (gameId: string, uid = "", morningOnly = false, afternoonOnly = false) => {
  if (uid === "") uid = user.uid;
  const gameModule = gamesModule.doc(gameId);
  const game = await gameModule.fetch();
  // find where to remove the leader from
  let removedMorningLeader = false;
  const morningLeaders = game?.morningLeaders;
  if (!morningLeaders) console.error(`Cannot fetch morning leaders for game${gameId}`);
  if (!afternoonOnly && morningLeaders) {
    const index = morningLeaders.indexOf(uid);
    if (index > -1) {
      morningLeaders.splice(index, 1);
      removedMorningLeader = true;
    }
  }
  let removedAfternoonLeader = false;
  const afternoonLeaders = game?.afternoonLeaders;
  if (!afternoonLeaders) console.error(`Cannot fetch afternoon leaders for game${gameId}`);
  if (!morningOnly && afternoonLeaders) {
    const index = afternoonLeaders.indexOf(uid);
    if (index > -1) {
      afternoonLeaders.splice(index, 1);
      removedAfternoonLeader = true;
    }
  }
  // Apply change in game
  let gameMergePromise = null;
  let userMergePromise = null;

  if (morningOnly && removedMorningLeader) {
    gameMergePromise = gameModule.merge({ morningLeaders: morningLeaders });
    console.log(`Removing user ${uid} from game ${gameId} (morning only)`);
  } else if (afternoonOnly && removedAfternoonLeader) {
    gameMergePromise = gameModule.merge({ afternoonLeaders: afternoonLeaders });
    console.log(`Removing user ${uid} from game ${gameId} (afternoon only)`);
  } else if (removedMorningLeader || removedAfternoonLeader) {
    // make a single write in DB
    gameMergePromise = gameModule.merge({ morningLeaders: morningLeaders, afternoonLeaders: afternoonLeaders });
    console.log(`Removing user ${uid} from game ${gameId} (both morning & afternoon)`);
  }
  // Apply change in user profile
  if (removedMorningLeader && !afternoonOnly) {
    userMergePromise = user.updateProfile(uid, { morningGame: "" });
    console.log(`Removing game ${gameId} from user profile ${uid} (morning)`);
  }
  if (removedAfternoonLeader && !morningOnly) {
    userMergePromise = user.updateProfile(uid, { afternoonGame: "" });
    console.log(`Removing game ${gameId} from user profile ${uid} (afternoon)`);
  }
  await Promise.all([gameMergePromise, userMergePromise]);
  toastPopup(`Désinscription à l'épreuve ${gameId} effectuée`);
};

export const hardcodeGameNames = () => {
  const gameNames = [
    ""
  ]
  let i = 1;
  for (const gameName of gameNames) {
    gamesModule.doc(`${i}`).merge({name: gameName});
    i++;
  }
}