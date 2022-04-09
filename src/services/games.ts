import { useAuthStore, ROLES, getRoleByValue } from './users';
import { magnetar } from "./magnetar";
import { isGameDbOutdated, setlastGameDbUpdate, getMaxGameLeaders } from "./settings";

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
    weight: 0,
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
  const gameModule = gamesModule.doc(gameId);
  await gameModule.fetch();
  return (gameModule.data?.morning_leaders.includes(uid) || gameModule.data?.afternoon_leaders.includes(uid));
}

///////////////
/// Setters //
/////////////

/**
 * This setter add the current user to the morning leaders a game.
 * To set a leader, the user must be on a game page.
 * When a game page is opened, a stream is created for the game data.
 * Therefore, by design, it is not required to fetch the game data here.
 */
export const setMorningLeader = async (gameId: string, uid="") => {
  if (uid === "") uid = user.uid;
  const profile = await user.getProfileData(uid);
  const gameModule =  gamesModule.doc(gameId);
  if (profile.role < ROLES.Animateur) throw new Error(`L'utilisateur n'a pas le droit de s'inscrire à une épreuve car son role est ${getRoleByValue(profile.role)}`);
  const maxGameLeaders = await getMaxGameLeaders();
  if (gameModule.data?.morning_leaders.length as number >= maxGameLeaders) throw new Error("Le nombre maximum d'animateurs a été atteint pour cette épreuve au matin");
  gameModule.merge({ morning_leaders: [...gameModule.data?.morning_leaders as string[], uid] });
}

export const setAfternoonLeader = async (gameId: string, uid="") => {
  if (uid === "") uid = user.uid;
  const profile = await user.getProfileData(uid);
  const gameModule =  gamesModule.doc(gameId);
  if (profile.role < ROLES.Animateur) throw new Error(`L'utilisateur n'a pas le droit de s'inscrire à une épreuve car son role est ${getRoleByValue(profile.role)}`);
  const maxGameLeaders = await getMaxGameLeaders();
  if (gameModule.data?.afternoon_leaders.length as number >= maxGameLeaders) throw new Error("Le nombre maximum d'animateurs a été atteint pour cette épreuve l'après-midi");
  gameModule.merge({ afternoon_leaders: [...gameModule.data?.afternoon_leaders as string[], uid] });
}
