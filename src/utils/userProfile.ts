import type { MaybeRefOrGetter } from 'vue'
import type { RefUserProfile, UserProfile } from '@/types'
import { Timestamp } from '@firebase/firestore'
import { deleteUser } from 'firebase/auth'
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { toValue } from 'vue'
import {
  DEFAULT_GROUP_ID,
  DEFAULT_TEAM_ID,
  DEFAULT_USER_ID,
  USER_PROFILES_COLLECTION_NAME,
  USER_PROFILES_COLLECTION_REF,
  USER_ROLES,
} from '@/constants'
import { db, fbSignOut, getAuthInstance } from '@/services/firebase'

// getters

export function getRoleByValue(roleNumber: number): string {
  for (const [key, value] of Object.entries(USER_ROLES)) {
    if (value === roleNumber) return key
  }
  throw new Error(`Unknown role : ${roleNumber}`)
}
export function getUserName(rProfile: MaybeRefOrGetter<UserProfile> | RefUserProfile) {
  const profile = toValue(rProfile)
  if (!profile) return getRoleByValue(USER_ROLES.Anonyme)
  if (profile.name) return profile.name
  return profile.email
}
export async function getUserProfile(uid: string): Promise<UserProfile | undefined> {
  if (uid === DEFAULT_USER_ID) throw new Error('User id is the default value')
  const docSnap = await getDoc(doc(USER_PROFILES_COLLECTION_REF, uid))
  if (docSnap.exists()) return docSnap.data() as UserProfile
  return undefined
}

// Setters

export async function createUserProfile(uid: string, email: string) {
  const newProfile: UserProfile = {
    creationDate: Timestamp.now(),
    lastLogin: Timestamp.now(),
    email,
    name: '',
    role: USER_ROLES.Newbie,
    hasDoneOnboarding: false,
    groupId: DEFAULT_GROUP_ID,
    groupName: '',
    teamId: DEFAULT_TEAM_ID,
  }
  const docRef = doc(USER_PROFILES_COLLECTION_REF, uid)
  return setDoc(docRef, newProfile).then(() => console.debug(`Created new user profile : ${uid}`))
}

export async function updateUserProfile(uid: string, profileData: Partial<UserProfile>) {
  console.debug(`Updating user ${uid} profile with data :`, profileData)
  const dbRef = doc(db, USER_PROFILES_COLLECTION_NAME, uid)
  return updateDoc(dbRef, profileData).then(() => console.debug(`User ${uid} profile updated`))
}

export async function signOut() {
  return fbSignOut()
}

export async function removeFirebaseAccount(uid: string) {
  const dbRef = doc(db, USER_PROFILES_COLLECTION_NAME, uid)
  const auth = getAuthInstance()
  if (!auth) throw new Error('Cannot access the firebase auth object')
  const user = auth.currentUser
  if (!user) throw new Error('User not found in the auth db')
  const deleteDocPromise = deleteDoc(dbRef)
  const deleteUserPromise = deleteUser(user)
  return Promise.all([deleteDocPromise, deleteUserPromise]).then(() => console.debug(`Removed user ${uid}`))
}
