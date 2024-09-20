import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"
import { DocumentReference } from "firebase/firestore"
import { VueFireUserProfile } from "./UserProfile"

export type Game = {
  hash: string
  name: string
  circuit: string
  attendants:  { [timingId: string]: VueFireUserProfile[] }
  matches: string[]
  noScores: boolean
}

export type VueFireGame = Game & { readonly id: string }
export type RefGame = Ref<VueFirestoreDocumentData<Game> | undefined>
