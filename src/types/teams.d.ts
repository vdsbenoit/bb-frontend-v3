import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

export type Team = {
  id: string
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

export type RefTeam = Ref<VueFirestoreDocumentData<Team> | undefined>
