import { Ref } from "vue"
import { VueFirestoreDocumentData} from "vuefire"

export type Match = {
  id: string
  game_id: number
  game_name: string
  time: number
  player_ids: string[]
  player_numbers: number[]
  winner: string
  loser: string
  draw: boolean
  reporter: string
  lastModified: string
  hasScore: boolean // todo: remove this in next release
  noScores: boolean
}

export type RefMatch = Ref<VueFirestoreDocumentData<Match> | undefined>
