import { getTeam } from './teams';
import { useAuthStore, ROLES } from './users';
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
  game_name: string;
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
    game_name: "",
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
  if(!id) return undefined;
  const matchModule = matchesModule.doc(id);
  matchModule.stream().catch((error) => {
    console.error(`Match ${id} stream was closed due to an error`, error);
  });
  return matchModule.data;
};

export const getGameMatches = (gameId: string) => {
  if(!gameId) return undefined;
  const matches = matchesModule.where("game_id", "==", gameId).orderBy("time", "asc");
  matches.stream()
  return matches.data;
};

export const getTeamMatches = (teamId: string) => {
  if(!teamId) return undefined;
  const matches = matchesModule.where("player_ids", "array-contains", teamId).orderBy("time", "asc");
  matches.stream()
  return matches.data;
};

///////////////
/// Setters //
/////////////

export const setScore = async (matchId: string, winner: string, loser: string) => {
  const match = matchesModule.doc(matchId);
  match.merge({winner, loser, even: false});
};

export const setEven = async (matchId: string) => {
  const match = matchesModule.doc(matchId);
  match.merge({winner: "", loser: "", even: true});
}