import { DEFAULT_SECTION_ID, SECTIONS_COLLECTION_REF } from "@/constants"
import { Section } from "@/types"
import { doc, limit as fbLimit, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useDocument } from "vuefire"

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
