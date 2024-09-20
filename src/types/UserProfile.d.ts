import { DocumentReference } from "firebase/firestore"
import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"
import { VueFireGame } from "./Game"

export type UserProfile = {
  creationDate: Timestamp
  email: string
  name: string
  role: number
  hasDoneOnboarding: boolean
  requestedRole?: number
  requestedSectionId?: number
  requestedSectionName?: string
  rejectionReason?: string
  sectionId: string
  sectionName?: string
  team?: string
  games?: { [timingId: string]: VueFireGame }
  settings?: any
}

export type VueFireUserProfile = UserProfile & { readonly id: string }
export type RefUserProfile = Ref<VueFirestoreDocumentData<UserProfile> | undefined>
