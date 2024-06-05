import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

export type Game = {
  id: number
  hash: string
  name: string
  circuit: string
  morningLeaders: string[]
  afternoonLeaders: string[]
  matches: string[]
  weight: number
  noScores: boolean
}

export type RefGame = Ref<VueFirestoreDocumentData<Game> | undefined>
