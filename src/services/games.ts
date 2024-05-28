import { confirmPopup, toastPopup } from "./popup";
import { useAuthStore, ROLES, getRoleByValue } from "./users";
import { magnetar } from "./magnetar";
import { getMaxGameLeaders, canSetScoreAnywhere, isScoresFrozen } from "./settings";
import { addToDocArray, removeFromDocArray } from "./firebase";

const GAMES_COLLECTION_NAME = "games";
const user = useAuthStore();

/////////////////////
/// configuration //
//////////////////
type Game = {
  id: number;
  hash: string;
  name: string;
  circuit: string;
  morningLeaders: string[];
  afternoonLeaders: string[];
  matches: string[];
  weight: number;
  noScores: boolean;
}

function gamesDefaults(payload: Partial<Game>): Game {
  const defaults: Game = {
    id: -1,
    hash: "",
    name: "",
    circuit: "",
    morningLeaders: [],
    afternoonLeaders: [],
    matches: [],
    weight: 1,
    noScores: false,
  };
  return { ...defaults, ...payload };
}
const gamesModule = magnetar.collection<Game>(GAMES_COLLECTION_NAME, {
  modifyPayloadOn: { insert: (payload) => gamesDefaults(payload) },
  modifyReadResponseOn: { added: (payload) => gamesDefaults(payload) },
});

///////////////
/// Getters //
/////////////

const getAllGames = () => {
  console.log(`Streaming all games`); // using stream because the fetch() method is bugged
  gamesModule.orderBy("id").stream().catch((error) => {
    console.error(`Error occurred while streaming the ${GAMES_COLLECTION_NAME} collection`, error);
  });
  return gamesModule.data;
};
const getCircuitGames = (circuit: string) => {
  if(!circuit) return undefined;
  console.log(`Streaming games from circuit '${circuit}'`);
  const filteredGamesModule = gamesModule.where("circuit", "==", circuit).orderBy("id");
  filteredGamesModule.stream().catch((error) => {
    console.error(`Error occurred while streaming the ${GAMES_COLLECTION_NAME} collection`, error);
  });
  return filteredGamesModule.data;
};
// This method opens a stream on the game to get live updates
const streamGame = (id: number) => {
  if(!id) return undefined;
  const gameModule = gamesModule.doc(id.toString());
  gameModule.stream().catch((error) => {
    console.error(`Game ${id} stream was closed due to an error`, error);
  });
  return gameModule.data;
};
/**
 * Force fetch a game and return it
 */
const forceFetchGame = (id: number) => {
  if(!id) return undefined;
  return gamesModule.doc(id.toString()).fetch({force: true});
}
const getGameName = (id: number) => {
  if(!id) return undefined;
  const gameModule = gamesModule.doc(id.toString());
  gameModule.fetch()
  return gameModule.data?.name;
};
const canSetGameScore = async (gameId: number) => {
  // Check frozen score
  if (isScoresFrozen()) {
    console.log("Cannot set score, score registration is closed")
    return false;
  }
  // Check if not leader
  if (user.profile.role < ROLES.Animateur){ 
    console.log(`User ${user.uid} cannot edit game ${gameId} score. Insufficient role`);
    return false;
  }
  // Check if moderator
  if (user.profile.role >= ROLES.Organisateur) return true;
  // Check if global setting allow leaders to set any scores
  if (canSetScoreAnywhere()) return true;
  // Check if leader assinged to the game
  const gameModule = gamesModule.doc(gameId.toString());
  await gameModule.fetch();
  if (gameModule.data?.morningLeaders.includes(user.uid) || gameModule.data?.afternoonLeaders.includes(user.uid)){
    return true;
  } else {
    console.log(`User ${user.uid} is not registered at ${gameId}`);
    return false;
  }
};

///////////////
/// Setters //
/////////////

const setName = (gameId: number, name: string) => {
  console.log(`Changing the name of game ${gameId} to ${name}`);
  return gamesModule.doc(gameId.toString()).merge({ name: name });
}
/**
 * These methods actually update the DB, after the checks in setters below passed.
 */
const addMorningLeaders = async (gameId: number, uid: string) => {
  console.log(`Adding user ${uid} to game ${gameId}`);
  const gameMergePromise = addToDocArray(GAMES_COLLECTION_NAME, gameId.toString(), "morningLeaders", uid)
  console.log(`Adding game ${gameId} to user ${uid}`);
  const userMergePromise = user.updateProfile(uid, { morningGame: gameId });
  await Promise.all([gameMergePromise, userMergePromise]);
  toastPopup("Responsables du matin mis à jour");
};
const addAfternoonLeaders = async (gameId: number, uid: string) => {
  console.log(`Adding user ${uid} to game ${gameId}`);
  const gameMergePromise = addToDocArray(GAMES_COLLECTION_NAME, gameId.toString(), "afternoonLeaders", uid)
  console.log(`Adding game ${gameId} to user ${uid}`);
  const userMergePromise = user.updateProfile(uid, { afternoonGame: gameId });
  await Promise.all([gameMergePromise, userMergePromise]);
  toastPopup("Responsables de l'après-midi mis à jour");
};




/**
 * The two following setters adds a user to the morning leaders a game.
 * To set a leader, the user must have loaded the either the game lists or the game page.
 * Therefore, by design, it is not required to fetch the game data here.
 */
const setMorningLeader = async (gameId: number, uid = "") => {
  if (uid === "") uid = user.uid;
  if (uid !== user.uid && user.profile.role < ROLES.Chef) throw new Error(`Tu n'as pas le droit d'assigner des gens à un jeu. Le rôle minimum pour inscrire quelqu'un à une épreuve est ${getRoleByValue(5)}`);
  const profile = await user.getLatestProfileData(uid);
  if(!profile) throw new Error(`Nous n'avons pas réussi à retrouver le profil de l'utilisateur ${uid}`);
  const gameModule = gamesModule.doc(gameId.toString());
  // Checks
  if (gameModule.data?.morningLeaders.includes(uid)) throw Error(`Déjà inscrit.e à l'épreuve ${gameId} le matin`);
  if (profile?.role < ROLES.Animateur) throw new Error(`Le rôle de ${user.getName(uid)} est ${getRoleByValue(profile.role)}. Le rôle minimum pour s'inscrire à une épreuve est ${getRoleByValue(4)}`);
  const maxGameLeaders = await getMaxGameLeaders();
  if ((gameModule.data?.morningLeaders.length as number) >= maxGameLeaders) throw new Error(`Le nombre maximum d'animateurs a été atteint pour l'épreuve ${gameId} au matin`);
  if (profile.morningGame) {
    const message = uid === user.uid ? `Tu es déjà inscrit.e à l'épreuve ${profile.morningGame} le matin. Veux-tu te désincrire ?` : `${user.getName(uid)} est déjà inscrit.e à l'épreuve ${profile.morningGame} le matin. Le/la désincrire ?`;
    confirmPopup(
      message,
      async () => {
        if (profile.morningGame) { //todo: set default profiel.afternoonGame value (e.g. 0 or -1) & remove if condition
          await removeMorningLeader(profile.morningGame, uid);
          await forceFetchGame(profile.morningGame);
        }
        await addMorningLeaders(gameId, uid);
        await forceFetchGame(gameId);
      },
      () => toastPopup("Enregistrement annulé")
    );
  } else {
    await addMorningLeaders(gameId, uid);
    await forceFetchGame(gameId);
  }
};

const setAfternoonLeader = async (gameId: number, uid = "") => {
  if (uid === "") uid = user.uid;
  if (uid !== user.uid && user.profile.role < ROLES.Chef) throw new Error(`Tu n'as pas le droit d'assigner des gens à un jeu. Le rôle minimum pour inscrire quelqu'un à une épreuve est ${getRoleByValue(5)}`);
  const profile = await user.getLatestProfileData(uid);
  if(!profile) throw new Error(`Nous n'avons pas réussi à retrouver le profil de l'utilisateur ${uid}`);
  const gameModule = gamesModule.doc(gameId.toString());
  // Checks
  if (gameModule.data?.afternoonLeaders.includes(uid)) throw Error(`Déjà inscrit.e à l'épreuve ${gameId} l'après-midi`);
  if (profile.role < ROLES.Animateur) throw new Error(`Le rôle de ${user.getName(uid)} est ${getRoleByValue(profile.role)}. Le rôle minimum pour s'inscrire à une épreuve est ${getRoleByValue(4)}`);
  const maxGameLeaders = await getMaxGameLeaders();
  if ((gameModule.data?.afternoonLeaders.length as number) >= maxGameLeaders) throw new Error(`Le nombre maximum d'animateurs a été atteint pour l'épreuve ${gameId} l'après-midi`);
  if (profile.afternoonGame) {
    const message = uid === user.uid ? `Tu es déjà inscrit.e à l'épreuve ${profile.afternoonGame} l'après-midi. Veux-tu te désincrire ?` : `${user.getName(uid)} est déjà inscrit.e à l'épreuve ${profile.afternoonGame} l'après-midi. Le/la désincrire ?`;
    confirmPopup(
      message,
      async () => {
        if(profile.afternoonGame) { //todo: set default profiel.afternoonGame value (e.g. 0 or -1) & remove if condition
          await removeAfternoonLeader(profile.afternoonGame, uid); 
          await forceFetchGame(profile.afternoonGame);
        }
        await addAfternoonLeaders(gameId, uid);
        await forceFetchGame(gameId);
      },
      () => toastPopup("Enregistrement annulé")
    );
  } else {
    await addAfternoonLeaders(gameId, uid);
    await forceFetchGame(gameId);
  }
  
};

/**
 * Remove Leader from both the game and his profile data
 */
const removeMorningLeader = async (gameId: number, uid = "") => {
  if (uid === "") uid = user.uid;

  // remove from game
  console.log(`Removing user ${uid} from game ${gameId} (morning)`);
  const gameMergePromise = removeFromDocArray(GAMES_COLLECTION_NAME, gameId.toString(), "morningLeaders", uid);

  // remove from user profile
  console.log(`Removing game ${gameId} from user profile ${uid} (morning)`);
  const userMergePromise = user.updateProfile(uid, { morningGame: "" });

  return Promise.all([gameMergePromise, userMergePromise]).then(() => {
    toastPopup(`Désinscription à l'épreuve ${gameId} effectuée`);
  });
}
const removeAfternoonLeader = async (gameId: number, uid = "") => {
  if (uid === "") uid = user.uid;

  // remove from game
  console.log(`Removing user ${uid} from game ${gameId} (afternoon)`);
  const gameMergePromise = removeFromDocArray(GAMES_COLLECTION_NAME, gameId.toString(), "afternoonLeaders", uid);

  // remove from user profile
  console.log(`Removing game ${gameId} from user profile ${uid} (afternoon)`);
  const userMergePromise = user.updateProfile(uid, { afternoonGame: "" });

  return Promise.all([gameMergePromise, userMergePromise]).then(() => {
    toastPopup(`Désinscription à l'épreuve ${gameId} effectuée`);
  });
}

const setGameNoScores = async (gameId: number, noScores: boolean) => {
  const gameModule = gamesModule.doc(gameId.toString());
  await gameModule.merge({ noScores });
  toastPopup(`Les scores de l'épreuve ${gameId} ont été ${noScores ? "désactivés" : "activés"}`);
};


// todo: remove this
const hardcodeGameNames = () => {
  const gameNames = [
    ""
  ]
  let i = 1;
  for (const gameName of gameNames) {
    gamesModule.doc(`${i}`).merge({name: gameName});
    i++;
  }
}