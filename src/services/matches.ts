import { useAuthStore, ROLES } from './users';
import { canSetScore } from './games';
import { magnetar } from "./magnetar";
import { isScoresFrozen } from "./settings";

const MATCHES_COLLECTION = "matches";
const user = useAuthStore();

/////////////////////
/// configuration //
//////////////////

export interface Match {
  id: string;
  game_id: string;
  time: number;
  player_ids: string[];
  player_numbers: number[];
  winner: string;
  loser: string;
  even: boolean;
  reporter: string;
}

function matchesDefaults(payload?: Partial<Match>): Match {
  const defaults = { 
    id: "",
    game_id: "",
    time: 0,
    player_ids: [],
    player_numbers: [],
    winner: "",
    loser: "",
    even: false,
    reporter: "",
  }
  return { ...defaults, ...payload }
}
const matchesModule = magnetar.collection<Match>(MATCHES_COLLECTION, {
  modifyPayloadOn: { insert: matchesDefaults },
  modifyReadResponseOn: { added: matchesDefaults },
});

///////////////
/// Getters //
/////////////

// This method opens a stream on the match to get live updates
export const getMatch = (id: string) => {
  const matchModule = matchesModule.doc(id);
  matchModule.stream().catch((error) => {
    console.error(`Match ${id} stream was closed due to an error`, error);
  });
  return matchModule.data;
};

export const getGameMatches = (gameId: string) => {
  const matches = matchesModule.where("game_id", "==", gameId).orderBy("time", "asc");
  matches.stream()
  return matches.data;
};

export const getTeamMatches = (teamId: string) => {
  const matches = matchesModule.where("player_ids", "array-contains", teamId).orderBy("time", "asc");
  matches.stream()
  return matches.data;
};

///////////////
/// Setters //
/////////////

export const setScore = async (matchId: string, winner: string, loser: string) => {
  const profile = user.profile;
  const match = matchesModule.doc(matchId);

  const frozenScores = await isScoresFrozen();
  if (frozenScores) throw new Error("Il n'est pas ou plus possible d'enregistrer des scores");
  if (profile.role < ROLES.Animateur) throw new Error("Tu n'as pas le droit d'enregister de scores");
  if (profile.role === ROLES.Animateur) {
    const canSetScoreResult = await canSetScore(user.uid, matchId);
    if (!canSetScoreResult) {
      throw new Error(`L'utilisateur ${user.uid} n'est pas inscrit à l'épreuve ${matchId}`);
    }
  }
  if (!match.data?.player_ids.includes(winner)) throw new Error(`L'équipe ${winner} n'est pas assignée à cette épreuve`);
  if (!match.data?.player_ids.includes(loser)) throw new Error(`L'équipe ${loser} n'est pas assignée à cette épreuve`);
  
  match.merge({winner, loser});
};

export const setEven = async (matchId: string) => {
  const profile = user.profile;
  const match = matchesModule.doc(matchId);
  const frozenScores = await isScoresFrozen();
  if (frozenScores) throw new Error("Il n'est pas ou plus possible d'enregistrer des scores");
  if (profile.role < ROLES.Animateur) throw new Error("Tu n'as pas le droit d'enregister de scores");
  if (profile.role === ROLES.Animateur) {
    const canSetScoreResult = await canSetScore(user.uid, matchId);
    if (!canSetScoreResult) {
      throw new Error(`L'utilisateur ${user.uid} n'est pas inscrit à l'épreuve ${matchId}`);
    }
  }
  
  match.merge({ even: true});
}