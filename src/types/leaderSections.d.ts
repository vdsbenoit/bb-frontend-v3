import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

export type LeaderSection = {
  id: number
  name: string
  city: string
  unit: string
  isStaff: boolean
}

export type RefLeaderSection = Ref<VueFirestoreDocumentData<LeaderSection> | undefined>
