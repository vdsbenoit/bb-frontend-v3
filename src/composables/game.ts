import type { MaybeRefOrGetter } from 'vue'
import type { Game } from '@/types'
import { doc, orderBy, query, where } from 'firebase/firestore'
import { computed, toValue } from 'vue'
import { useCollection, useDocument } from 'vuefire'
import { DEFAULT_CIRCUIT_VALUE, DEFAULT_GAME_ID, GAMES_COLLECTION_REF } from '@/constants'

export function useGame(rGameId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rGameId)
    if (id === DEFAULT_GAME_ID) return null
    console.debug(`Fetching game ${id}`)
    return doc(GAMES_COLLECTION_REF, id)
  })
  return useDocument<Game>(dbRef)
}

export function useGames(rShouldLoad: MaybeRefOrGetter<boolean> = true) {
  const dbRef = computed(() => {
    if (!toValue(rShouldLoad)) return null
    console.debug(`Fetching all games`)
    return query(GAMES_COLLECTION_REF, orderBy('number'))
  })
  return useCollection<Game>(dbRef)
}

export function useCircuitGames(rCircuit: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const circuit = toValue(rCircuit)
    if (circuit === DEFAULT_CIRCUIT_VALUE) return null
    console.debug(`Fetching games from circuit ${circuit}`)
    return query(GAMES_COLLECTION_REF, where('circuit', '==', circuit), orderBy('number'))
  })
  return useCollection<Game>(dbRef)
}
