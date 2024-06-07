import { Ref } from "vue"
import { VueFirestoreDocumentData } from "vuefire"
import { DocumentReference } from "firebase/firestore"

export type Game = {
  hash: string
  name: string
  circuit: string
  attendants: {
    user: DocumentReference
    timingId: string
  }[]
  matches: string[]
  noScores: boolean
}

export type RefGame = Ref<VueFirestoreDocumentData<Game> | undefined>
