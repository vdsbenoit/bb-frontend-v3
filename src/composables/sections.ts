import { DEFAULT_SECTION_ID, SECTIONS_COLLECTION_NAME, SECTIONS_COLLECTION_REF } from "@/constants"
import { incrementDocField } from "@/services/firebase"
import { RefSection, Section } from "@/types"
import { doc, limit as fbLimit, orderBy, query, updateDoc, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useDocument } from "vuefire"

// Composables

export function useSection(rSectionId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rSectionId)
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
      return query(SECTIONS_COLLECTION_REF, orderBy("id"))
    } else {
      console.debug(`Fetching sections from ${sectionType}`)
      // prettier-ignore
      return query(
        SECTIONS_COLLECTION_REF, 
        where("sectionType", "==", sectionType), 
        orderBy("id")
      )
    }
  })
  return useCollection<Section>(dbRef)
}

export function useTopSections(rSectionType: MaybeRefOrGetter<string>, rLimit: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const sectionType = toValue(rSectionType)
    const limit = toValue(rLimit)
    console.debug(`Fetching the ${limit} top sections from sectionType ${sectionType}`)
    if (!sectionType) return null
    // prettier-ignore
    return query(
      SECTIONS_COLLECTION_REF, 
      where("sectionType", "==", sectionType),
      orderBy("score", "desc"),
      fbLimit(limit),
    )
  })
  return useCollection<Section>(dbRef)
}

///////////////
/// Setters //
/////////////

// fixme: move this to cloud function
export const updateSectionMeanScore = async (sectionId: string, section: Section) => {
  const meanScore = +(section.score / section.nbTeams || 0).toFixed(2)
  const dbRef = doc(SECTIONS_COLLECTION_REF, sectionId)
  return updateDoc(dbRef, { meanScore }).then(() =>
    console.debug(`Updating the mean score of section ${sectionId} to ${meanScore}`)
  )
}
export const addSectionWin = async (rSection: RefSection) => {
  const section = toValue(rSection)
  if (!section) throw Error("Cannot update score : section is undefined")
  console.log(`Adding 2 points to section ${section.id}`)
  await incrementDocField(SECTIONS_COLLECTION_NAME, section.id, "score", 2)
  await updateSectionMeanScore(section.id, section)
}
export const removeSectionWin = async (rSection: RefSection) => {
  const section = toValue(rSection)
  if (!section) throw Error("Cannot update score : section is undefined")
  console.log(`Removing 2 points to section ${section.id}`)
  await incrementDocField(SECTIONS_COLLECTION_NAME, section.id, "score", -2)
  await updateSectionMeanScore(section.id, section)
}
export const addSectionDraw = async (rSection: RefSection) => {
  const section = toValue(rSection)
  if (!section) throw Error("Cannot update score : section is undefined")
  console.log(`Adding 1 points to section ${section.id}`)
  await incrementDocField(SECTIONS_COLLECTION_NAME, section.id, "score", 1)
  await updateSectionMeanScore(section.id, section)
}
export const removeSectionDraw = async (rSection: RefSection) => {
  const section = toValue(rSection)
  if (!section) throw Error("Cannot update score : section is undefined")
  console.log(`Removing 1 points to section ${section.id}`)
  await incrementDocField(SECTIONS_COLLECTION_NAME, section.id, "score", -1)
  await updateSectionMeanScore(section.id, section)
}
