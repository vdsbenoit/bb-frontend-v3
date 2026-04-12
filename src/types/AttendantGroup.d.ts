import type { Ref } from 'vue'
import type { VueFirestoreDocumentData } from 'vuefire'
import type { Group } from './Group'
import type { GROUP_ROLES } from '@/constants'

export interface AttendantGroup extends Group {
  role: GROUP_ROLES.Attendant
}

export interface VueFireAttendantGroup extends AttendantGroup {
  readonly id: string
}
export type RefAttendantGroup = Ref<VueFirestoreDocumentData<AttendantGroup> | undefined>
