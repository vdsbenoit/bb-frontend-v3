import { useAuthStore, ROLES, getRoleByValue } from './users';
import { magnetar } from "./magnetar";

const SECTIONS_COLLECTION = "sections";
const user = useAuthStore();

/////////////////////
/// configuration //
//////////////////
export interface Section {
  id: string;
  hash: string;
  number: number;
  sectionId: string;
  sectionName: string;
  city: string;
  category: string;
  scores: number[];
  matches: string[];
  nbPlayers: number;
  ignoreScore: boolean;
}

function sectionsDefaults(payload?: Partial<Section>): Section {
  const defaults = { 
    id: "",
    hash: "",
    number: -1,
    sectionId: "",
    sectionName: "",
    city: "",
    category: "",
    scores: [],
    matches: [],
    nbPlayers: 0,
    ignoreScore: false,
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

// This method opens a stream on the game to get live updates
export const getSection = (id: string) => {
  const sectionModule = sectionsModule.doc(id);
  sectionModule.stream().catch((error) => {
    console.error(`Section ${id} stream was closed due to an error`, error);
  });
  return sectionModule.data;
};

///////////////
/// Setters //
/////////////

