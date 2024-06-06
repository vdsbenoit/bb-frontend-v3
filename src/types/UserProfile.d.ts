import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

export type UserProfile = {
  creationDate: Timestamp
  email: string
  name: string
  team: string
  role: number
  hasDoneOnboarding: boolean
  requestedRole?: number
  requestedSectionId?: number
  requestedSectionName?: string
  rejectionReason?: string
  sectionId: string
  sectionName?: string
  morningGame?: string
  afternoonGame?: string
  settings?: any
}

export type RefUserProfile = Ref<VueFirestoreDocumentData<UserProfile> | undefined>
