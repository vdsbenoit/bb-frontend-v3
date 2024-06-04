import { db } from "@/services/firebase"
import { Timestamp } from "@firebase/firestore"
import { deleteUser } from "firebase/auth"
// prettier-ignore
import { DocumentReference, addDoc, collection, deleteDoc, doc, limit as fbLimit, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { MaybeRefOrGetter, computed, toValue } from "vue"
// prettier-ignore
import { useCollection, useCurrentUser, useDocument, useFirebaseAuth } from 'vuefire';
import { DEFAULT_SECTION_ID } from "./sections"

// constants

const PROFILES_COLLECTION_NAME = "users"
const PROFILES_COLLECTION_REF = collection(db, PROFILES_COLLECTION_NAME)
export const DEFAULT_USER_ID = ""
// prettier-ignore
export const ROLES = {
  Anonyme:        0,
  Newbie:         1,
  Participant:    2,
  Animateur:      4,
  Chef:           5,
  Organisateur:   6,
  Administrateur: 8,
}

export type UserProfile = {
  uid: string
  creationDate: Timestamp
  email: string
  name: string
  settings: any
  team: string
  morningGame?: number
  afternoonGame?: number
  role: number
  sectionId?: number
  sectionName?: string
  requestedRole: number
  requestedSectionId: number
  requestedSectionName: string
  rejectionReason?: string
  hasDoneOnboarding: boolean
}

// getters

export const getRoleByValue = (roleNumber: number): string => {
  for (const [key, value] of Object.entries(ROLES)) {
    if (value === roleNumber) return key
  }
  throw Error(`Unknown role : ${roleNumber}`)
}

// composables

export function useUserProfile(rUid: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const uid = toValue(rUid)
    if (uid === DEFAULT_USER_ID) {
      console.debug(`User profile not fetched because the provided uid is the default one (uid is ${uid})`)
      return null
    }
    console.debug(`Fetching user profile ${uid}`)
    return doc(PROFILES_COLLECTION_REF, uid)
  })
  return useDocument<UserProfile>(dbRef)
}

export function useCurrentUserProfile() {
  const currentUser = useCurrentUser()
  const uid = computed(() => {
    if (currentUser.value === undefined) {
      console.debug(`Cannot fetch current user profile because the Auth module is still loading`)
      return DEFAULT_USER_ID
    }
    if (currentUser.value === null) {
      console.debug(`Cannot fetch current user profile because it does not exist in the Auth db`)
      return DEFAULT_USER_ID
    }
    return currentUser.value.uid
  })
  return useUserProfile(uid)
}

export function useUsersFromSection(rSectionId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const sectionId = toValue(rSectionId)
    if (sectionId === DEFAULT_SECTION_ID) return null
    console.debug(`Fetching users from section ${sectionId}`)
    // prettier-ignore
    return query(
      PROFILES_COLLECTION_REF, 
      where("sectionId", "==", sectionId)
    )
  })
  return useCollection<UserProfile>(dbRef)
}

export function useApplicantsToSection(rSectionId: MaybeRefOrGetter<string>, rLimit: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const sectionId = toValue(rSectionId)
    const limit = toValue(rLimit)
    if (sectionId === DEFAULT_SECTION_ID) return null
    console.debug(`Fetching users who requested to be member of section ${sectionId}`)
    // prettier-ignore
    return query(
      PROFILES_COLLECTION_REF, 
      where("requestedSectionId", "==", sectionId),
      fbLimit(limit)
    )
  })
  return useCollection<UserProfile>(dbRef)
}

export function useAllApplicants(rLimit: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const currentUserProfile = useCurrentUserProfile()
    if (!currentUserProfile.value) return null
    const maxRole = currentUserProfile.value.role
    const limit = toValue(rLimit)
    console.debug(`Fetching all pending applicants for a ${getRoleByValue(maxRole)}`)
    // prettier-ignore
    return query(
      PROFILES_COLLECTION_REF, 
      where("requestedRole", "<=", maxRole),
      orderBy("requestedRole", "desc"),
      fbLimit(limit)
    )
  })
  return useCollection<UserProfile>(dbRef)
}

export function useLatestUsers(rLimit: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const limit = toValue(rLimit)
    console.debug(`Fetching latest registered users`)
    // prettier-ignore
    return query(
      PROFILES_COLLECTION_REF, 
      orderBy("creationDate", "desc"),
      fbLimit(limit)
    )
  })
  return useCollection<UserProfile>(dbRef)
}

// Setters

export async function createProfile(uid: string, email: string) {
  // prettier-ignore
  return addDoc(PROFILES_COLLECTION_REF, {
    uid, 
    email,
    role: ROLES.Newbie,
    creationDate: Timestamp.now(),
  }).then((docRef: DocumentReference) => console.debug(`Created new user profile : ${docRef.id}`))
}
export async function removeAccount(uid: string) {
  const dbRef = doc(db, PROFILES_COLLECTION_NAME, uid)
  const auth = useFirebaseAuth()
  if (!auth) throw Error("removeAccount() can only run on client side")
  const user = auth.currentUser
  if (!user) throw Error("User not found in the auth db")
  const deleteDocPromise = deleteDoc(dbRef)
  const deleteUserPromise = deleteUser(user)
  // prettier-ignore
  return Promise.all([
    deleteDocPromise,
    deleteUserPromise
  ]).then(() => console.debug(`Removed user ${uid}`))
}

export async function updateProfile(uid: string, profileData: any) {
  const dbRef = doc(db, PROFILES_COLLECTION_NAME, uid)
  return updateDoc(dbRef, profileData).then(() => console.debug(`User profile updated for ${uid}`))
}

export function useUserName(uid: MaybeRefOrGetter<string>) {
  const profile = useUserProfile(uid)
  return computed(() => {
    if (!profile.value) return `User ${uid}`
    if (profile.value.name) return profile.value.name
    return profile.value.email
  })
}
