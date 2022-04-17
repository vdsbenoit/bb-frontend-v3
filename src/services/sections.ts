import { incrementDocField } from './firebase';
import { magnetar } from "./magnetar";

const SECTIONS_COLLECTION = "sections";

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
  }
  return { ...defaults, ...payload }
}
const sectionsModule = magnetar.collection<Section>(SECTIONS_COLLECTION, {
  modifyPayloadOn: { insert: sectionsDefaults },
  modifyReadResponseOn: { added: sectionsDefaults },
});

///////////////
/// Getters //
/////////////

export const fetchCategorySections = (category: string) => {
  console.log(`Fetching sections from category '${category}'`);
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
export const forceFetchSection = (id: string) => {
  if(!id) return undefined;
  return sectionsModule.doc(id).fetch({force: true});
}

///////////////
/// Setters //
/////////////

export const addSectionWin = async (sectionId: string) => {
  console.log(`Adding 2 points to section ${sectionId}`);
  await incrementDocField(SECTIONS_COLLECTION, sectionId, "score", 2);
  await forceFetchSection(sectionId);
}
export const removeSectionWin = async (sectionId: string) => {
  console.log(`Removing 2 points to section ${sectionId}`);
  await incrementDocField(SECTIONS_COLLECTION, sectionId, "score", -2);
  await forceFetchSection(sectionId);
}
export const addSectionDraw = async (sectionId: string) => {
  console.log(`Adding 1 points to section ${sectionId}`);
  await incrementDocField(SECTIONS_COLLECTION, sectionId, "score", 1);
  await forceFetchSection(sectionId);
}
export const removeSectionDraw = async (sectionId: string) => {
  console.log(`Removing 1 points to section ${sectionId}`);
  await incrementDocField(SECTIONS_COLLECTION, sectionId, "score", -1);
  await forceFetchSection(sectionId);
}
