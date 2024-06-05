import { DEFAULT_LEADER_SECTION_ID, LEADER_SECTIONS_COLLECTION_REF } from "@/constants"
import { LeaderSection } from "@/types"
import { doc, getDocs, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useDocument } from "vuefire"

// Getters

export const getStaffSectionId = async () => {
  try {
    const dbRef = query(LEADER_SECTIONS_COLLECTION_REF, where("isStaff", "==", true))
    const querySnapshot = await getDocs(dbRef)
    if (querySnapshot.empty) throw Error("Staff group not found in DB")
    if (querySnapshot.size > 1) throw Error("There is more than one staff group in the database")
    return querySnapshot.docs[0].id
  } catch (error) {
    console.error(`Staff group document could not be fetched`, error)
    return null
  }
}

// Composables

export function useLeaderSection(rLeaderSectionId: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const id = toValue(rLeaderSectionId)
    if (id === DEFAULT_LEADER_SECTION_ID) return null
    console.debug(`Fetching leader section ${id}`)
    return doc(LEADER_SECTIONS_COLLECTION_REF, id.toString())
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
