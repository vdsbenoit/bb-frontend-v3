import { incrementDocField } from './firebase';
import { magnetar } from "./magnetar";

const SECTIONS_COLLECTION_NAME = "sections";

/////////////////////
/// configuration //
//////////////////
export interface Section {
  id: string;
  name: string;
  city: string;
  unit: string;
  category: string;
  scores: number[];
  score: number;
  teams: string[];
  nbPlayers: number;
  nbTeams: number;
  meanScore: number;
}

function sectionsDefaults(payload?: Partial<Section>): Section {
  const defaults = { 
    id: "",
    name: "",
    city: "",
    unit: "",
    category: "",
    scores: [],
    score: 0,
    teams: [],
    nbPlayers: 0,
    nbTeams: 0,
    meanScore: 0
  }
  return { ...defaults, ...payload }
}
const sectionsModule = magnetar.collection<Section>(SECTIONS_COLLECTION_NAME, {
  modifyPayloadOn: { insert: sectionsDefaults },
  modifyReadResponseOn: { added: sectionsDefaults },
});

///////////////
/// Getters //
/////////////

export const getCategorySections = (category: string) => {
  console.log(`Fetching sections from category '${category}'`);
  if (!category) return undefined;
  const filteredSectionsModule = sectionsModule.where("category", "==", category);
  filteredSectionsModule.stream(); // using stream because the fetch() method is bugged
  return filteredSectionsModule.data;
}
// This method opens a stream on the game to get live updates
export const getSection = (id: string) => {
  if(!id) return undefined;
  const sectionModule = sectionsModule.doc(id);
  sectionModule.stream().catch((error) => {
    console.error(`Section ${id} stream was closed due to an error`, error);
  });
  return sectionModule.data;
}
export const forceFetchSection = async (id: string) => {
  if(!id) return undefined;
  const section = sectionsModule.doc(id);
  await section.fetch({force: true});
  return section.data;
}
export const getTopSections = (category: string, limit: number) => {
  console.log(`Fetching top sections from category '${category}'`);
  if (!category) return undefined;
  const filteredSectionsModule = sectionsModule.where("category", "==", category).orderBy("meanScore", "desc").limit(limit);
  filteredSectionsModule.stream();
  return filteredSectionsModule.data;
}

///////////////
/// Setters //
/////////////

const updateSectionMeanScore =async (sectionId: string) => {
  const section = await forceFetchSection(sectionId);
  if (!section) throw new Error("Impossible de mettre à jour la moyenne de la section")
  const meanScore = + (section.score / section.nbTeams || 0).toFixed(2)
  return sectionsModule.doc(sectionId).merge({meanScore})
}

export const addSectionWin = async (sectionId: string) => {
  console.log(`Adding 2 points to section ${sectionId}`);
  await incrementDocField(SECTIONS_COLLECTION_NAME, sectionId, "score", 2);
  await updateSectionMeanScore(sectionId);
}
export const removeSectionWin = async (sectionId: string) => {
  console.log(`Removing 2 points to section ${sectionId}`);
  await incrementDocField(SECTIONS_COLLECTION_NAME, sectionId, "score", -2);
  await updateSectionMeanScore(sectionId);
}
export const addSectionDraw = async (sectionId: string) => {
  console.log(`Adding 1 points to section ${sectionId}`);
  await incrementDocField(SECTIONS_COLLECTION_NAME, sectionId, "score", 1);
  await updateSectionMeanScore(sectionId);
}
export const removeSectionDraw = async (sectionId: string) => {
  console.log(`Removing 1 points to section ${sectionId}`);
  await incrementDocField(SECTIONS_COLLECTION_NAME, sectionId, "score", -1);
  await updateSectionMeanScore(sectionId);
}
