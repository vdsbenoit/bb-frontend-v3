import { db } from "@/services/firebase";
import { Timestamp } from "@firebase/firestore";
import { deleteUser } from "firebase/auth";
// prettier-ignore
import { DEFAULT_SECTION_ID, DEFAULT_USER_ID, ROLES, USER_PROFILES_COLLECTION_NAME, USER_PROFILES_COLLECTION_REF } from "@/constants";
import { UserProfile } from "@/types";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { MaybeRefOrGetter, toValue } from "vue";
import { useFirebaseAuth } from "vuefire";

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
export async function getUserProfile(uid: string): Promise<UserProfile | undefined> {
  if (uid === DEFAULT_USER_ID) throw Error("User id is the default value")
  const docSnap = await getDoc(doc(USER_PROFILES_COLLECTION_REF, uid))
  if (docSnap.exists()) return docSnap.data() as UserProfile
  return undefined
}

// Setters

export async function createUserProfile(uid: string, email: string) {
  const newProfile: UserProfile = {
    creationDate: Timestamp.now(),
    email,
    name: "",
    sectionId: DEFAULT_SECTION_ID,
    role: ROLES.Newbie,
    hasDoneOnboarding: false
  }
  const docRef = doc(USER_PROFILES_COLLECTION_REF, uid)
  return setDoc(docRef, newProfile).then(() => console.debug(`Created new user profile : ${uid}`))
}

export async function updateUserProfile(uid: string, profileData: any) {
  const dbRef = doc(db, USER_PROFILES_COLLECTION_NAME, uid)
  return updateDoc(dbRef, profileData).then(() => console.debug(`User profile updated for ${uid}`))
}

export async function removeAccount(uid: string) {
  const dbRef = doc(db, USER_PROFILES_COLLECTION_NAME, uid)
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
