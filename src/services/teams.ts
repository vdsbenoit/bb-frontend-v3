import { useAuthStore, ROLES, getRoleByValue } from './users';
import { magnetar } from "./magnetar";

const TEAMS_COLLECTION = "teams";
const user = useAuthStore();

/////////////////////
/// configuration //
//////////////////
export interface Team {
  id: string;
  hash: string;
  number: number;
  sectionId: string;
  sectionName: string;
  city: string;
  category: string;
  scores: number[];
  score: number;
  matches: string[];
  nbPlayers: number;
  ignoreScore: boolean;
}

function teamsDefaults(payload?: Partial<Team>): Team {
  const defaults = { 
    id: "",
    hash: "",
    number: -1,
    sectionId: "",
    sectionName: "",
    city: "",
    category: "",
    scores: [],
    score: 0,
    matches: [],
    nbPlayers: 0,
    ignoreScore: false,
  }
  return { ...defaults, ...payload }
}
const teamsModule = magnetar.collection<Team>(TEAMS_COLLECTION, {
  modifyPayloadOn: { insert: teamsDefaults },
  modifyReadResponseOn: { added: teamsDefaults },
});

///////////////
/// Getters //
/////////////

// This method opens a stream on the game to get live updates
export const getTeam = (id: string) => {
  if(!id) return undefined;
  const teamModule = teamsModule.doc(id);
  teamModule.stream().catch((error) => {
    console.error(`Team ${id} stream was closed due to an error`, error);
  });
  return teamModule.data;
};

///////////////
/// Setters //
/////////////

export const addWin = (teamId: string) => {
  return 
}
export const removeWin = (teamId: string) => {
  return 
}
export const addDraw = (teamId: string) => {
  return 
}
export const removeDraw = (teamId: string) => {
  return 
}