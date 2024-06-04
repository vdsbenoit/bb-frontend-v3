import { incrementDocField } from './firebase';
import { magnetar } from "./magnetar";

const TEAMS_COLLECTION_NAME = "teams";

/////////////////////
/// configuration //
//////////////////
type Team = {
  id: string;
  hash: string;
  number: number;
  sectionType: string;
  sectionId: number;
  sectionName: string;
  city: string;
  scores: number[];
  score: number;
  matches: string[];
  nbPlayers: number;
  ignoreScore: boolean;
}

function teamsDefaults(payload: Partial<Team>): Team {
  const defaults: Team = { 
    id: "",
    hash: "",
    number: -1,
    sectionType: "",
    sectionId: -1,
    sectionName: "",
    city: "",
    scores: [],
    score: 0,
    matches: [],
    nbPlayers: 0,
    ignoreScore: false,
  }
  return { ...defaults, ...payload }
}
const teamsModule = magnetar.collection<Team>(TEAMS_COLLECTION_NAME, {
  modifyPayloadOn: { insert: (payload) => teamsDefaults(payload) },
  modifyReadResponseOn: { added: (payload) => teamsDefaults(payload) },
});

///////////////
/// Getters //
/////////////

// This method opens a stream on the team to get live updates
const streamTeam = (id: string) => {
  if(!id) return undefined;
  const teamModule = teamsModule.doc(id);
  teamModule.stream().catch((error) => {
    console.error(`Team ${id} stream was closed due to an error`, error);
  });
  return teamModule.data;
};
const forceFetchTeam = async (id: string) => {
  if(!id) return undefined;
  const team = teamsModule.doc(id);
  await team.fetch({force: true});
  return team.data;
}
const streamTopTeams = (sectionType: string, limit: number) => {
  console.log(`Fetching top teams from sectionType '${sectionType}'`);
  if (!sectionType) return undefined;
  const filteredTeamsModule = teamsModule.where("sectionType", "==", sectionType).orderBy("score", "desc").limit(limit);
  filteredTeamsModule.stream();
  return filteredTeamsModule.data;
}

///////////////
/// Setters //
/////////////

const addTeamWin = async (teamId: string) => {
  console.log(`Adding 2 points to team ${teamId}`);
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, "score", 2);
  await forceFetchTeam(teamId);
}
const removeTeamWin = async (teamId: string) => {
  console.log(`Removing 2 points to team ${teamId}`);
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, "score", -2);
  await forceFetchTeam(teamId);
}
const addTeamDraw = async (teamId: string) => {
  console.log(`Adding 1 points to team ${teamId}`);
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, "score", 1);
  await forceFetchTeam(teamId);
}
const removeTeamDraw = async (teamId: string) => {
  console.log(`Removing 1 points to team ${teamId}`);
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, "score", -1);
  await forceFetchTeam(teamId);
}
