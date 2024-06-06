import { DEFAULT_LEADER_SECTION_ID, LEADER_SECTIONS_COLLECTION_REF } from "@/constants"
import { LeaderSection } from "@/types"
import { doc, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useDocument } from "vuefire"

export function useLeaderSection(rLeaderSectionId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rLeaderSectionId)
    if (id === DEFAULT_LEADER_SECTION_ID) return null
    console.debug(`Fetching leader section ${id}`)
    return doc(LEADER_SECTIONS_COLLECTION_REF, id)
  })
  return useDocument<LeaderSection>(dbRef)
}

export function useLeaderSections(rIncludeStaff: MaybeRefOrGetter<boolean>) {
  const dbRef = computed(() => {
    if (toValue(rIncludeStaff)) {
      console.debug(`Fetching all leader sections`)
      return query(LEADER_SECTIONS_COLLECTION_REF, orderBy("name"))
    } else {
      console.debug(`Fetching leader sections without the staff group`)
      return query(LEADER_SECTIONS_COLLECTION_REF, where("isStaff", "!=", true), orderBy("name"))
    }
  })
  return useCollection<LeaderSection>(dbRef)
}
