import { db } from "@/services/firebase";
import { Timestamp } from "@firebase/firestore";
import { UserProfile, deleteUser } from "firebase/auth";
// prettier-ignore
import { DEFAULT_SECTION_ID, DEFAULT_USER_ID, PROFILES_COLLECTION_NAME, PROFILES_COLLECTION_REF, ROLES } from "@/constants";
// prettier-ignore
import { DocumentReference, addDoc, deleteDoc, doc, limit as fbLimit, getDoc, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { MaybeRefOrGetter, computed, toValue } from "vue";
import { useCollection, useCurrentUser, useDocument, useFirebaseAuth } from 'vuefire';


// getters

export const getRoleByValue = (roleNumber: number): string => {
  for (const [key, value] of Object.entries(ROLES)) {
    if (value === roleNumber) return key
  }
  throw Error(`Unknown role : ${roleNumber}`)
}
export function getUserName(rProfile: MaybeRefOrGetter<UserProfile>) {
  const profile = toValue(rProfile)
  if (!profile) return getRoleByValue(ROLES.Anonyme)
  if (profile.name) return profile.name
  return profile.email
}
export async function getUserProfile(id: string): Promise<UserProfile>{
  if (id === DEFAULT_USER_ID) throw Error("User id is the default value")
  const docSnap = await getDoc(doc(PROFILES_COLLECTION_REF, id.toString()))
  if (docSnap.exists()) return docSnap.data() as UserProfile
  else throw Error(`User profile not found for id ${id}`)
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

export async function createUserProfile(uid: string, email: string) {
  // prettier-ignore
  const newProfile: UserProfile = {
    uid, 
    email,
    role: ROLES.Newbie,
    creationDate: Timestamp.now(),
    sectionId: DEFAULT_SECTION_ID,

  }
  return addDoc(PROFILES_COLLECTION_REF, newProfile).then((docRef: DocumentReference) => console.debug(`Created new user profile : ${docRef.id}`))
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

export async function updateUserProfile(uid: string, profileData: any) {
  const dbRef = doc(db, PROFILES_COLLECTION_NAME, uid)
  return updateDoc(dbRef, profileData).then(() => console.debug(`User profile updated for ${uid}`))
}
