import { db, incrementDocField } from "@/services/firebase";
import { collection, doc, orderBy, query, updateDoc, where, limit as fbLimit } from "firebase/firestore";
import { MaybeRefOrGetter, Ref, computed, toValue } from "vue";
import { VueFirestoreDocumentData, useCollection, useDocument } from "vuefire";

// Constants

const SECTIONS_COLLECTION_NAME = "sections";
const SECTIONS_COLLECTION_REF = collection(db, SECTIONS_COLLECTION_NAME);
export const DEFAULT_SECTION_ID = ""

// Types

export type Section = {
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
type RefSection = Ref<VueFirestoreDocumentData<Section> | undefined>

// Getters

// Composables 

export function useSection(rId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rId)
    console.debug(`Fetching section ${id}`)
    if (id === DEFAULT_SECTION_ID) return null
    return doc(SECTIONS_COLLECTION_REF, id)
  })
  return useDocument<Section>(dbRef)
}

export function useSections(rSectionType: MaybeRefOrGetter<string> = "") {
  const dbRef = computed(() => {
    const sectionType = toValue(rSectionType)
    if (sectionType === "") {
      console.debug(`Fetching all sections`)
      return query(SECTIONS_COLLECTION_REF, orderBy("id"));
    } else {
      console.debug(`Fetching sections from ${sectionType}`)
      return query(
        SECTIONS_COLLECTION_REF, 
        where("sectionType", "==", sectionType), 
        orderBy("id")
      )
    }
  })
  return useCollection<Section>(dbRef);
}

export function useTopSections(rSectionType: MaybeRefOrGetter<string>, rLimit: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const sectionType = toValue(rSectionType)
    const limit = toValue(rLimit)
    console.debug(`Fetching the ${limit} top sections from sectionType ${sectionType}`)
    if (! sectionType) return null
    return query(
      SECTIONS_COLLECTION_REF, 
      where("sectionType", "==", sectionType),
      orderBy("score", "desc"),
      fbLimit(limit),
    )
  })
  return useCollection<Section>(dbRef);
}

  ///////////////
/// Setters //
/////////////

// fixme: move this to cloud function
export const updateSectionMeanScore = async (section: RefSection) => {
  if (!section.value) throw("Cannot updated mean score : section is undefined")
  const meanScore = + (section.value.score / section.value.nbTeams || 0).toFixed(2)
  const dbRef = doc(SECTIONS_COLLECTION_REF, section.value.id.toString())
  return updateDoc(dbRef, { meanScore }).then(() => 
    console.debug(`Updating the mean score of section ${section.value?.id} to ${meanScore}`)
  )
}

export const addSectionWin = async (section: RefSection) => {
  if (!section.value) throw Error("Cannot update score : section is undefined")
  console.log(`Adding 2 points to section ${section.value.id}`);
  await incrementDocField(SECTIONS_COLLECTION_NAME, section.value.id.toString(), "score", 2);
  await updateSectionMeanScore(section);
}
export const removeSectionWin = async (section: RefSection) => {
  if (!section.value) throw Error("Cannot update score : section is undefined")
  console.log(`Removing 2 points to section ${section.value.id}`);
  await incrementDocField(SECTIONS_COLLECTION_NAME, section.value.id.toString(), "score", -2);
  await updateSectionMeanScore(section);
}
export const addSectionDraw = async (section: RefSection) => {
  if (!section.value) throw Error("Cannot update score : section is undefined")
  console.log(`Adding 1 points to section ${section.value.id}`);
  await incrementDocField(SECTIONS_COLLECTION_NAME, section.value.id.toString(), "score", 1);
  await updateSectionMeanScore(section);
}
export const removeSectionDraw = async (section: RefSection) => {
  if (!section.value) throw Error("Cannot update score : section is undefined")
  console.log(`Removing 1 points to section ${section.value.id}`);
  await incrementDocField(SECTIONS_COLLECTION_NAME, section.value.id.toString(), "score", -1);
  await updateSectionMeanScore(section);
}
