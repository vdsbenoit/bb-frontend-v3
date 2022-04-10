import { confirmPopup, toastPopup } from './popup';
import { useAuthStore, ROLES, getRoleByValue } from './users';
import { magnetar } from "./magnetar";
import { isGameDbOutdated, setlastGameDbUpdate, getMaxGameLeaders, canSetScoreAnywhere } from "./settings";
import { DocInstance } from 'magnetar';

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

function gamesDefaults(payload?: Partial<Game>): Game {
  const defaults = { 
    id: "",
    hash: "",
    name: "",
    circuit: "",
    morning_leaders: [],
    afternoon_leaders: [],
    matches: [],
    weight: 1,
  }
  return { ...defaults, ...payload }
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
  gamesModule.fetch({ force: forceUpdate }).catch(error => {
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

export const canSetScore = async (uid: string, gameId: string) => {
  if (canSetScoreAnywhere()) return true;
  const gameModule = gamesModule.doc(gameId);
  await gameModule.fetch();
  return (gameModule.data?.morning_leaders.includes(uid) || gameModule.data?.afternoon_leaders.includes(uid));
}

///////////////
/// Setters //
/////////////

/**
 * These methods actually update the DB, after the checks in setters below passed.
 */
const updateMorningLeaders = (gameModule: DocInstance<Game>, gameId: string, uid: string) => {
  gameModule.merge({ morning_leaders: [...gameModule.data?.morning_leaders as string[], uid] });
  user.updateProfile(uid, {morningGame: gameId});
}
const updateAfternoonLeaders = (gameModule: DocInstance<Game>, gameId: string, uid: string) => {
  gameModule.merge({ afternoon_leaders: [...gameModule.data?.afternoon_leaders as string[], uid] });
  user.updateProfile(uid, {afternoonGame: gameId});
}

/**
 * This setter add the current user to the morning leaders a game.
 * To set a leader, the user must be on a game page.
 * When a game page is opened, a stream is created for the game data.
 * Therefore, by design, it is not required to fetch the game data here.
 */
export const setMorningLeader = async (gameId: string, uid="") => {
  if (uid === "") uid = user.uid;
  const profile = await user.getLatestProfileData(uid);
  const gameModule =  gamesModule.doc(gameId);
  // Checks
  if (gameModule.data?.morning_leaders.includes(uid)) throw Error("Tu es déjà inscrit à cette épreuve");
  if (profile.role < ROLES.Animateur) throw new Error(`Le role ${getRoleByValue(profile.role)} ne permet pas de s'inscrire à une épreuve`);
  const maxGameLeaders = await getMaxGameLeaders();
  if (gameModule.data?.morning_leaders.length as number >= maxGameLeaders) throw new Error("Le nombre maximum d'animateurs a été atteint pour cette épreuve au matin");
  if(profile.morningGame) {
    const message = uid === user.uid ? 
    `Tu es déjà inscrit.e à l'épreuve ${profile.morningGame} le matin. Est-ce que tu veux te désincrire ?` : 
    `${user.getName(uid)} est déjà inscrit.e à l'épreuve ${profile.morningGame} le matin. Le/la désincrire ?`
    confirmPopup(
      message,
      () => {removeLeader(gameId, uid, true, false); updateMorningLeaders(gameModule, gameId, uid)},
      () => toastPopup("Enresitrement annulé")
      );
  } else updateMorningLeaders(gameModule, gameId, uid)
}

export const setAfternoonLeader = async (gameId: string, uid="") => {
  if (uid === "") uid = user.uid;
  const profile = await user.getLatestProfileData(uid);
  const gameModule =  gamesModule.doc(gameId);
  // Checks
  if (gameModule.data?.afternoon_leaders.includes(uid)) throw Error("Tu es déjà inscrit à cette épreuve");
  if (profile.role < ROLES.Animateur) throw new Error(`Le role ${getRoleByValue(profile.role)} ne permet pas de s'inscrire à une épreuve`);
  const maxGameLeaders = await getMaxGameLeaders();
  if (gameModule.data?.afternoon_leaders.length as number >= maxGameLeaders) throw new Error("Le nombre maximum d'animateurs a été atteint pour cette épreuve l'après-midi");
  if(profile.afternoonGame) {
    const message = uid === user.uid ? 
    `Tu es déjà inscrit.e à l'épreuve ${profile.afternoonGame} l'après-midi. Est-ce que tu veux te désincrire ?` : 
    `${user.getName(uid)} est déjà inscrit.e à l'épreuve ${profile.afternoonGame} l'après-midi. Le/la désincrire ?`
    confirmPopup(
      message, 
      () => {removeLeader(gameId, uid, false, true); updateAfternoonLeaders(gameModule, gameId, uid)},
      () => toastPopup("Enresitrement annulé")
      );
  } else updateAfternoonLeaders(gameModule, gameId, uid)
}

export const removeLeader = async (gameId: string, uid="", morningOnly=false, afternoonOnly=false) => {
  if (uid === "") uid = user.uid;
  const gameModule =  gamesModule.doc(gameId);
  // find where to remove the leader from
  let removedMorningLeader = false;
  let removedAfternoonLeader = false;
  const morningLeaders = gameModule.data?.morning_leaders
  if (!morningOnly && morningLeaders){
    const index = morningLeaders.indexOf(uid);
    if (index > -1) {
      morningLeaders.splice(index, 1);
      removedMorningLeader = true;
    }
  }
  const afternoonLeaders = gameModule.data?.afternoon_leaders
  if (!afternoonOnly && afternoonLeaders){
    const index = afternoonLeaders.indexOf(uid);
    if (index > -1) {
      afternoonLeaders.splice(index, 1);
      removedAfternoonLeader = true;
    }
  }
  // Apply change in game
  if (morningOnly && removedMorningLeader) gameModule.merge({ morning_leaders: morningLeaders })
  else if (afternoonOnly && removedAfternoonLeader) gameModule.merge({ afternoon_leaders: afternoonLeaders })
  else if (removedMorningLeader || removedAfternoonLeader) gameModule.merge({ morning_leaders: morningLeaders,  afternoon_leaders: afternoonLeaders });
  // Apply change in user profile
  if (removedMorningLeader && !afternoonOnly) user.updateProfile(uid, {morningGame: ""});
  if (removedAfternoonLeader && !morningOnly) user.updateProfile(uid, {afternoonGame: ""});
}
