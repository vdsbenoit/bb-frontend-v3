import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

export type Section = {
  id: number
  name: string
  city: string
  unit: string
  sectionType: string
  scores: number[]
  score: number
  teams: string[]
  nbPlayers: number
  nbLeaders: number
  nbTeams: number
  playersPerTeam: number
  meanScore: number
}
export type RefSection = Ref<VueFirestoreDocumentData<Section> | undefined>
