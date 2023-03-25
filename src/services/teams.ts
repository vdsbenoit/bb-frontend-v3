import { incrementDocField } from './firebase';
import { magnetar } from "./magnetar";

const TEAMS_COLLECTION_NAME = "teams";

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
const teamsModule = magnetar.collection<Team>(TEAMS_COLLECTION_NAME, {
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
export const forceFetchTeam = async (id: string) => {
  if(!id) return undefined;
  const team = teamsModule.doc(id);
  await team.fetch({force: true});
  return team.data;
}
export const getTopTeams = (category: string, limit: number) => {
  console.log(`Fetching top teams from category '${category}'`);
  if (!category) return undefined;
  const filteredTeamsModule = teamsModule.where("category", "==", category).orderBy("score", "desc").limit(limit);
  filteredTeamsModule.stream();
  return filteredTeamsModule.data;
}

///////////////
/// Setters //
/////////////

export const addTeamWin = async (teamId: string) => {
  console.log(`Adding 2 points to team ${teamId}`);
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, "score", 2);
  await forceFetchTeam(teamId);
}
export const removeTeamWin = async (teamId: string) => {
  console.log(`Removing 2 points to team ${teamId}`);
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, "score", -2);
  await forceFetchTeam(teamId);
}
export const addTeamDraw = async (teamId: string) => {
  console.log(`Adding 1 points to team ${teamId}`);
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, "score", 1);
  await forceFetchTeam(teamId);
}
export const removeTeamDraw = async (teamId: string) => {
  console.log(`Removing 1 points to team ${teamId}`);
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, "score", -1);
  await forceFetchTeam(teamId);
}
