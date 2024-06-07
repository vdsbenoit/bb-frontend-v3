import { DocumentReference } from "firebase/firestore"
import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"

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
  games?: {
    game: DocumentReference
    timingId: sting
  }[]
  settings?: any
}

export type RefUserProfile = Ref<VueFirestoreDocumentData<UserProfile> | undefined>
