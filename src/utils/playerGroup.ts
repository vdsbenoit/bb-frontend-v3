import type { AttendantGroup, PlayerGroup, PlayerTeam, UserProfile } from '@/types'
import { doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import {
  DEFAULT_GROUP_ID,
  GROUPS_COLLECTION_NAME,
  GROUPS_COLLECTION_REF,
  TEAMS_COLLECTION_REF,
  USER_PROFILES_COLLECTION_REF,
} from '@/constants'
import { incrementDocField } from '@/services/firebase'

// Getters

/**
 * Get the group data of a given player group id
 * @param playerGroupId a player group id
 * @returns the group data (without the id)
 */
export async function getPlayerGroup(playerGroupId: string): Promise<PlayerGroup> {
  if (!playerGroupId) throw new Error('Cannot get player group : groupId is undefined')
  if (playerGroupId === DEFAULT_GROUP_ID) throw new Error('Cannot get player group : groupId is the default value')
  const docSnap = await getDoc(doc(GROUPS_COLLECTION_REF, playerGroupId))
  if (docSnap.exists()) return docSnap.data() as PlayerGroup
  else throw new Error(`Player group not found with id ${playerGroupId}`)
}

/**
 * Get the group data of a given group id, whether it's a player or an attendant group
 * @param groupId a player group id
 * @returns the group data (without the id)
 */
export async function getGroup(groupId: string): Promise<PlayerGroup | AttendantGroup> {
  if (!groupId) throw new Error('Cannot get group : groupId is undefined')
  if (groupId === DEFAULT_GROUP_ID) throw new Error('Cannot get group : groupId is the default value')
  const docSnap = await getDoc(doc(GROUPS_COLLECTION_REF, groupId))
  if (!docSnap.exists()) throw new Error(`Player group not found with id ${groupId}`)
  if (!docSnap.data().role) throw new Error(`Group ${groupId} has no role attribute`)
  if (docSnap.data().role >= 4) return docSnap.data() as AttendantGroup
  return docSnap.data() as PlayerGroup
}

// Setters

export async function setGroupName(groupId: string, newGroupName: string) {
  const promises = []
  const dbRefGroup = doc(GROUPS_COLLECTION_REF, groupId)
  promises.push(updateDoc(dbRefGroup, { name: newGroupName } as Partial<PlayerGroup>))
  const dbRefUsers = query(USER_PROFILES_COLLECTION_REF, where('groupId', '==', groupId))
  const querySnapshotUsers = await getDocs(dbRefUsers)
  querySnapshotUsers.forEach((doc) => {
    promises.push(updateDoc(doc.ref, { groupName: newGroupName } as Partial<UserProfile>))
  })
  const dbRefPlayerTeams = query(TEAMS_COLLECTION_REF, where('groupId', '==', groupId))
  const querySnapshotTeams = await getDocs(dbRefPlayerTeams)
  querySnapshotTeams.forEach((doc) => {
    promises.push(updateDoc(doc.ref, { groupName: newGroupName } as Partial<PlayerTeam>))
  })
  return Promise.all(promises).then(() => console.debug(`${groupId} group name has been set to ${newGroupName}`))
}

// fixme: move this to cloud function
export async function updateGroupMeanScore(playerGroupId: string) {
  const playerGroup = await getPlayerGroup(playerGroupId)
  const meanScore = +(playerGroup.score / playerGroup.nbTeams || 0).toFixed(2)
  const dbRef = doc(GROUPS_COLLECTION_REF, playerGroupId)
  return updateDoc(dbRef, { meanScore }).then(() =>
    console.debug(`The mean score of player group ${playerGroupId} has been set to ${meanScore}`),
  )
}
export async function addGroupWin(playerGroupId: string) {
  if (!playerGroupId) throw new Error('Cannot update score (addGroupWin) : group is undefined')
  console.debug(`Adding 2 points to player group ${playerGroupId}`)
  await incrementDocField(GROUPS_COLLECTION_NAME, playerGroupId, 'score', 2)
  await updateGroupMeanScore(playerGroupId)
}
export async function removeGroupWin(playerGroupId: string) {
  if (!playerGroupId) throw new Error('Cannot update score (removeGroupWin) : group is undefined')
  console.debug(`Removing 2 points to player group ${playerGroupId}`)
  await incrementDocField(GROUPS_COLLECTION_NAME, playerGroupId, 'score', -2)
  await updateGroupMeanScore(playerGroupId)
}
export async function addGroupDraw(playerGroupId: string) {
  if (!playerGroupId) throw new Error('Cannot update score (addGroupDraw) : group is undefined')
  console.debug(`Adding 1 points to player group ${playerGroupId}`)
  await incrementDocField(GROUPS_COLLECTION_NAME, playerGroupId, 'score', 1)
  await updateGroupMeanScore(playerGroupId)
}
export async function removeGroupDraw(playerGroupId: string) {
  if (!playerGroupId) throw new Error('Cannot update score (removeGroupDraw) : group is undefined')
  console.debug(`Removing 1 points to player group ${playerGroupId}`)
  await incrementDocField(GROUPS_COLLECTION_NAME, playerGroupId, 'score', -1)
  await updateGroupMeanScore(playerGroupId)
}
