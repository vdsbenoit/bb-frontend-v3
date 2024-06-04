import { db } from "@/services/firebase"
import { collection, doc, getDocs, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, Ref, computed, toValue } from "vue"
import { VueFirestoreDocumentData, useCollection, useDocument } from "vuefire"

// Constants & db references

const LEADER_SECTIONS_COLLECTION_NAME = "leadersections"
const LEADER_SECTIONS_COLLECTION_REF = collection(db, LEADER_SECTIONS_COLLECTION_NAME)
export const DEFAULT_LEADER_SECTION_ID = ""

// Types

export type LeaderSection = {
  id: number
  name: string
  city: string
  unit: string
  isAdmin: boolean
}

type RefLeaderSection = Ref<VueFirestoreDocumentData<LeaderSection> | undefined>

// Getters

export const getStaffSectionId = async () => {
  try {
    const dbRef = query(LEADER_SECTIONS_COLLECTION_REF, where("isAdmin", "==", true))
    const querySnapshot = await getDocs(dbRef)
    if (querySnapshot.empty) throw Error("Admin group not found in DB")
    if (querySnapshot.size > 1) throw Error("There is more than one admin group in the database")
    return querySnapshot.docs[0].id
  } catch (error) {
    console.error(`Admin group document could not be fetched`, error)
    return null
  }
}

// Composables

export function useLeaderSection(rId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rId)
    if (id === DEFAULT_LEADER_SECTION_ID) return null
    console.debug(`Fetching leader section ${id}`)
    return doc(LEADER_SECTIONS_COLLECTION_REF, id)
  })
  return useDocument<LeaderSection>(dbRef)
}

export function useLeaderSections(rIncludeAdmins: Ref<boolean>) {
  const dbRef = computed(() => {
    if (toValue(rIncludeAdmins)) {
      console.debug(`Fetching all leader sections`)
      return query(LEADER_SECTIONS_COLLECTION_REF, orderBy("name"))
    } else {
      console.debug(`Fetching leader sections without the admin group`)
      return query(LEADER_SECTIONS_COLLECTION_REF, where("isAdmin", "!=", true), orderBy("name"))
    }
  })
  return useCollection<LeaderSection>(dbRef)
}
