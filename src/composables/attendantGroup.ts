import type { MaybeRefOrGetter } from 'vue'
import type { AttendantGroup, RefUserProfile } from '@/types'
import { doc, documentId, orderBy, query, where } from 'firebase/firestore'
import { computed, toValue } from 'vue'
import { useCollection, useDocument } from 'vuefire'
import { DEFAULT_GROUP_ID, GROUP_ROLES, GROUPS_COLLECTION_REF } from '@/constants'

export function useAttendantGroup(rGroupId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const groupId = toValue(rGroupId)
    if (groupId === DEFAULT_GROUP_ID) return null
    console.debug(`Fetching attendant group ${groupId}`)
    return doc(GROUPS_COLLECTION_REF, groupId)
  })
  return useDocument<AttendantGroup>(dbRef)
}

/**
 * Fetch the list of attendant groups
 * @param rShouldLoad To be used to lazy load the collection
 * @param rStaffGroups To define if the staff groups should be included in the query, excluded or only the staff groups should be returned
 * @param rShowAllAttendantGroups If false, only the current user group will be returned
 */
export function useAttendantGroups(
  rShouldLoad: MaybeRefOrGetter<boolean> = true,
  rStaffGroups: MaybeRefOrGetter<'include' | 'exclude' | 'only'> = 'include',
  rShowAllAttendantGroups: MaybeRefOrGetter<boolean> = true,
  rCurrentUserProfile: RefUserProfile,
) {
  const dbRef = computed(() => {
    if (!rCurrentUserProfile.value) return null
    const staffGroups = toValue(rStaffGroups)
    const queryParams = []
    if (!toValue(rShouldLoad)) return null
    console.debug(`Fetching attendant groups`)
    // To be used to return only the current user group
    if (toValue(rShowAllAttendantGroups)) {
      if (staffGroups === 'exclude') {
        console.debug(`Excluding staff groups in the query`)
        queryParams.push(where('role', '<', GROUP_ROLES.Staff))
      }
      if (staffGroups === 'only') {
        console.debug(`Returning only staff groups in the query`)
        queryParams.push(where('role', '>=', GROUP_ROLES.AttendantAndStaff))
      } else {
        queryParams.push(where('role', '>=', GROUP_ROLES.Attendant))
      }
    } else {
      console.debug(`Filtering to current user group : ${rCurrentUserProfile.value.groupId}`)
      queryParams.push(where(documentId(), '==', rCurrentUserProfile.value.groupId))
    }
    queryParams.push(orderBy('name'))
    return query(GROUPS_COLLECTION_REF, ...queryParams)
  })
  return useCollection<AttendantGroup>(dbRef)
}
