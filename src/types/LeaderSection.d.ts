import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

export type LeaderSection = {
  name: string
  city: string
  unit: string
  isStaff: boolean
}

export type RefLeaderSection = Ref<VueFirestoreDocumentData<LeaderSection> | undefined>
