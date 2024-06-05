import { incrementDocField } from './firebase';
import { magnetar } from "./magnetar";

const SECTIONS_COLLECTION_NAME = "sections";

/////////////////////
/// configuration //
//////////////////
type Section = {
  id: string;
  name: string;
  city: string;
  unit: string;
  sectionType: string;
  scores: number[];
  score: number;
  teams: string[];
  nbPlayers: number;
  nbLeaders: number;
  nbTeams: number;
  playersPerTeam: number;
  meanScore: number;
}

function sectionsDefaults(payload: Partial<Section>): Section {
  const defaults: Section = { 
    id: "",
    name: "",
    city: "",
    unit: "",
    sectionType: "",
    scores: [],
    score: 0,
    teams: [],
    nbPlayers: 0,
    nbLeaders: 0,
    nbTeams: 0,
    playersPerTeam: 0,
    meanScore: 0
  }
  return { ...defaults, ...payload }
}
const sectionsModule = magnetar.collection<Section>(SECTIONS_COLLECTION_NAME, {
  modifyPayloadOn: { insert: (payload) => sectionsDefaults(payload) },
  modifyReadResponseOn: { added: (payload) => sectionsDefaults(payload) },
});

///////////////
/// Getters //
/////////////

const getSectionsBySectionType = (sectionType: string): Map<string, Section> => {
  if (!sectionType) return new Map();
  const filteredSectionsModule = sectionsModule.where("sectionType", "==", sectionType).orderBy("id");
  filteredSectionsModule.stream(); // using stream because the fetch() method is bugged
  return filteredSectionsModule.data;
}
// This method opens a stream on the section to get live updates
const streamSection = (id: number) => {
  if(!id) return undefined;
  const sectionModule = sectionsModule.doc(id.toString());
  sectionModule.stream().catch((error) => {
    console.error(`Section ${id} stream was closed due to an error`, error);
  });
  return sectionModule.data;
}
const forceFetchSection = async (id: number) => {
  if(!id) return undefined;
  const section = sectionsModule.doc(id.toString());
  await section.fetch({force: true});
  return section.data;
}
const streamTopSections = (sectionType: string, limit: number) => {
  if (!sectionType) return undefined;
  const filteredSectionsModule = sectionsModule.where("sectionType", "==", sectionType).orderBy("meanScore", "desc").limit(limit);
  filteredSectionsModule.stream();
  return filteredSectionsModule.data;
}

///////////////
/// Setters //
/////////////

const updateSectionMeanScore = async (sectionId: number) => {
  const section = await forceFetchSection(sectionId);
  if (!section) throw new Error("Impossible de mettre à jour la moyenne de la section")
  const meanScore = + (section.score / section.nbTeams || 0).toFixed(2)
  return sectionsModule.doc(sectionId.toString()).merge({meanScore})
}

const addSectionWin = async (sectionId: number) => {
  console.log(`Adding 2 points to section ${sectionId}`);
  await incrementDocField(SECTIONS_COLLECTION_NAME, sectionId.toString(), "score", 2);
  await updateSectionMeanScore(sectionId);
}
const removeSectionWin = async (sectionId: number) => {
  console.log(`Removing 2 points to section ${sectionId}`);
  await incrementDocField(SECTIONS_COLLECTION_NAME, sectionId.toString(), "score", -2);
  await updateSectionMeanScore(sectionId);
}
const addSectionDraw = async (sectionId: number) => {
  console.log(`Adding 1 points to section ${sectionId}`);
  await incrementDocField(SECTIONS_COLLECTION_NAME, sectionId.toString(), "score", 1);
  await updateSectionMeanScore(sectionId);
}
const removeSectionDraw = async (sectionId: number) => {
  console.log(`Removing 1 points to section ${sectionId}`);
  await incrementDocField(SECTIONS_COLLECTION_NAME, sectionId.toString(), "score", -1);
  await updateSectionMeanScore(sectionId);
}
