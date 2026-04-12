import type { Ref } from 'vue'
import type { VueFirestoreDocumentData } from 'vuefire'
import type { Group } from './Group'
import type { GROUP_ROLES } from '@/constants'

export interface PlayerGroup extends Group {
  number: number
  groupCategoryId: string
  teams: string[]
  nbTeams: number
  nbPlayers: number
  nbLeaders: number
  playersPerTeam: number
  meanScore: number
  score: number
  role: GROUP_ROLES.Player
}

export interface VueFirePlayerGroup extends PlayerGroup {
  readonly id: string
}
export type RefPlayerGroup = Ref<VueFirestoreDocumentData<PlayerGroup> | undefined>
