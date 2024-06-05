import { useAuthStore } from './users';
import { magnetar } from "./magnetar";

const MATCHES_COLLECTION_NAME = "matches";
const user = useAuthStore();

/////////////////////
/// configuration //
//////////////////

type Match = {
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
  hasScore: boolean; // fixme: remove this in next release
  noScores: boolean;
}

function matchesDefaults(payload: Partial<Match>): Match {
  const defaults: Match = { 
    id: "",
    game_id: 0,
    game_name: "",
    time: 0,
    player_ids: [],
    player_numbers: [],
    winner: "",
    loser: "",
    draw: false,
    reporter: "",
    lastModified: "",
    hasScore: false,
    noScores: false,
  }
  return { ...defaults, ...payload }
}
const matchesModule = magnetar.collection<Match>(MATCHES_COLLECTION_NAME, {
  modifyPayloadOn: { insert: (payload) => matchesDefaults(payload) },
  modifyReadResponseOn: { added: (payload) => matchesDefaults(payload) },
});

///////////////
/// Getters //
/////////////

// This method opens a stream on the match to get live updates
const streamMatch = (id: string) => {
  if(!id) return undefined;
  const matchModule = matchesModule.doc(id);
  matchModule.stream().catch((error) => {
    console.error(`Match ${id} stream was closed due to an error`, error);
  });
  return matchModule.data;
};

const streamGameMatches = (gameId: number) => {
  if(!gameId) return undefined;
  const matches = matchesModule.where("game_id", "==", gameId).orderBy("time", "asc");
  matches.stream();
  return matches.data;
};

const streamTeamMatches = (teamId: string) => {
  if(!teamId) return undefined;
  const matches = matchesModule.where("player_ids", "array-contains", teamId).orderBy("time", "asc");
  matches.stream();
  return matches.data;
};

const streamTimeMatches = (time: number) => {
  if(time < 1) return undefined;
  const matches = matchesModule.where("time", "==", time).orderBy("game_id", "asc");
  matches.stream();
  return matches.data;
};

///////////////
/// Setters //
/////////////

const setMatchScore = async (matchId: string, winner: string, loser: string) => {
  const reporter = user.uid;
  const lastModified = new Date().toISOString()
  const match = matchesModule.doc(matchId);
  return match.merge({winner, loser, draw: false, reporter, lastModified});
};

const setMatchDraw = async (matchId: string) => {
  const reporter = user.uid;
  const lastModified = new Date().toISOString()
  const match = matchesModule.doc(matchId);
  return match.merge({winner: "", loser: "", draw: true, reporter, lastModified});
};

const resetMatchScore = async (matchId: string) => {
  const reporter = user.uid;
  const lastModified = new Date().toISOString()
  const match = matchesModule.doc(matchId);
  return match.merge({winner: "", loser: "", draw: false, reporter, lastModified});
};

const setMatchNoScores = async (matchId: string, noScores: boolean) => {
  const match = matchesModule.doc(matchId);
  return match.merge({ noScores: noScores });
}