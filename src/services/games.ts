import { confirmPopup, toastPopup } from "./popup";
import { useAuthStore, ROLES, getRoleByValue } from "./users";
import { magnetar } from "./magnetar";
import { isGameDbOutdated, setlastGameDbUpdate, getMaxGameLeaders, canSetScoreAnywhere, isScoresFrozen } from "./settings";
import { DocInstance } from "magnetar";

const GAMES_COLLECTION = "games";
const user = useAuthStore();

/////////////////////
/// configuration //
//////////////////
export interface Game {
  id: string;
  hash: string;
  name: string;
  circuit: string;
  morning_leaders: string[];
  afternoon_leaders: string[];
  matches: string[];
  weight: number;
}

export function gamesDefaults(payload?: Partial<Game>): Game {
  const defaults = {
    id: "",
    hash: "",
    name: "",
    circuit: "",
    morning_leaders: [],
    afternoon_leaders: [],
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

export const getGames = () => {
  let forceUpdate = false;
  if (isGameDbOutdated()) {
    console.log("Game store is outdated, fetching data from firestore");
    forceUpdate = true;
    setlastGameDbUpdate();
  }
  gamesModule.fetch({ force: forceUpdate }).catch((error) => {
    console.error(`Error occurred while fetching the ${GAMES_COLLECTION} collection`, error);
  });
  return gamesModule.data;
};

// This method opens a stream on the game to get live updates
export const getGame = (id: string) => {
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
  if (gameModule.data?.morning_leaders.includes(user.uid) || gameModule.data?.afternoon_leaders.includes(user.uid)){
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
const updateMorningLeaders = (gameModule: DocInstance<Game>, gameId: string, uid: string) => {
  gameModule.merge({ morning_leaders: [...(gameModule.data?.morning_leaders as string[]), uid] });
  user.updateProfile(uid, { morningGame: gameId });
  console.log(`Adding user ${uid} to game ${gameId}`);
};
const updateAfternoonLeaders = (gameModule: DocInstance<Game>, gameId: string, uid: string) => {
  gameModule.merge({ afternoon_leaders: [...(gameModule.data?.afternoon_leaders as string[]), uid] });
  user.updateProfile(uid, { afternoonGame: gameId });
  console.log(`Adding user ${uid} to game ${gameId}`);
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
  if (gameModule.data?.morning_leaders.includes(uid)) throw Error("Tu es déjà inscrit à cette épreuve");
  if (profile.role < ROLES.Animateur) throw new Error(`Le role ${getRoleByValue(profile.role)} ne permet pas de s'inscrire à une épreuve`);
  const maxGameLeaders = await getMaxGameLeaders();
  if ((gameModule.data?.morning_leaders.length as number) >= maxGameLeaders) throw new Error("Le nombre maximum d'animateurs a été atteint pour cette épreuve au matin");
  if (profile.morningGame) {
    const message = uid === user.uid ? `Tu es déjà inscrit.e à l'épreuve ${profile.morningGame} le matin. Est-ce que tu veux te désincrire ?` : `${user.getName(uid)} est déjà inscrit.e à l'épreuve ${profile.morningGame} le matin. Le/la désincrire ?`;
    confirmPopup(
      message,
      () => {
        removeLeader(profile.morningGame, uid, true, false);
        updateMorningLeaders(gameModule, gameId, uid);
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
  if (gameModule.data?.afternoon_leaders.includes(uid)) throw Error("Tu es déjà inscrit à cette épreuve");
  if (profile.role < ROLES.Animateur) throw new Error(`Le role ${getRoleByValue(profile.role)} ne permet pas de s'inscrire à une épreuve`);
  const maxGameLeaders = await getMaxGameLeaders();
  if ((gameModule.data?.afternoon_leaders.length as number) >= maxGameLeaders) throw new Error("Le nombre maximum d'animateurs a été atteint pour cette épreuve l'après-midi");
  if (profile.afternoonGame) {
    const message = uid === user.uid ? `Tu es déjà inscrit.e à l'épreuve ${profile.afternoonGame} l'après-midi. Est-ce que tu veux te désincrire ?` : `${user.getName(uid)} est déjà inscrit.e à l'épreuve ${profile.afternoonGame} l'après-midi. Le/la désincrire ?`;
    confirmPopup(
      message,
      () => {
        removeLeader(profile.afternoonGame, uid, false, true);
        updateAfternoonLeaders(gameModule, gameId, uid);
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
  const morningLeaders = game?.morning_leaders;
  if (!morningLeaders) console.error(`Cannot fetch morning leaders for game${gameId}`);
  if (!afternoonOnly && morningLeaders) {
    const index = morningLeaders.indexOf(uid);
    if (index > -1) {
      morningLeaders.splice(index, 1);
      removedMorningLeader = true;
    }
  }
  let removedAfternoonLeader = false;
  const afternoonLeaders = game?.afternoon_leaders;
  if (!afternoonLeaders) console.error(`Cannot fetch afternoon leaders for game${gameId}`);
  if (!morningOnly && afternoonLeaders) {
    const index = afternoonLeaders.indexOf(uid);
    if (index > -1) {
      afternoonLeaders.splice(index, 1);
      removedAfternoonLeader = true;
    }
  }
  // Apply change in game
  if (morningOnly && removedMorningLeader) {
    gameModule.merge({ morning_leaders: morningLeaders });
    console.log(`Removing user ${uid} from game ${gameId} (morning only)`);
  } else if (afternoonOnly && removedAfternoonLeader) {
    gameModule.merge({ afternoon_leaders: afternoonLeaders });
    console.log(`Removing user ${uid} from game ${gameId} (afternoon only)`);
  } else if (removedMorningLeader || removedAfternoonLeader) {
    // make a single write in DB
    gameModule.merge({ morning_leaders: morningLeaders, afternoon_leaders: afternoonLeaders });
    console.log(`Removing user ${uid} from game ${gameId} (both morning & afternoon)`);
  }
  // Apply change in user profile
  if (removedMorningLeader && !afternoonOnly) {
    user.updateProfile(uid, { morningGame: "" });
    console.log(`Removing game ${gameId} from user profile ${uid} (morning)`);
  }
  if (removedAfternoonLeader && !morningOnly) {
    user.updateProfile(uid, { afternoonGame: "" });
    console.log(`Removing game ${gameId} from user profile ${uid} (afternoon)`);
  }
};
