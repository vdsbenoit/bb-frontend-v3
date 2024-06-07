import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

export type Team = {
  hash: string
  number: number
  sectionType: string
  sectionId: number
  sectionName: string
  city: string
  scores: number[]
  score: number
  matches: string[]
  nbPlayers: number
  ignoreScore: boolean
}

export type VueFireTeam = Team & { readonly id: string }
export type RefTeam = Ref<VueFirestoreDocumentData<Team> | undefined>
