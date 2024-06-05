import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

export type UserProfile = {
  uid: string
  creationDate: Timestamp
  email: string
  name: string
  team: string
  morningGame?: number
  afternoonGame?: number
  role: number
  sectionId: number
  sectionName: string
  requestedRole: number
  requestedSectionId: number
  requestedSectionName: string
  rejectionReason?: string
  hasDoneOnboarding: boolean
  settings?: any
}

export type RefUserProfile = Ref<VueFirestoreDocumentData<UserProfile> | undefined>
