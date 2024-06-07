import { DEFAULT_SECTION_ID, DEFAULT_USER_ID, USER_PROFILES_COLLECTION_REF } from "@/constants"
import { UserProfile } from "@/types"
import { getRoleByValue } from "@/utils/userProfile"
import { doc, limit as fbLimit, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useCurrentUser, useDocument } from "vuefire"

export function useUserProfile(rUid: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const uid = toValue(rUid)
    if (uid === DEFAULT_USER_ID) {
      console.debug(`User profile not fetched because the provided uid is the default one (uid is ${uid})`)
      return null
    }
    console.debug(`Fetching user profile ${uid}`)
    return doc(USER_PROFILES_COLLECTION_REF, uid)
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
      USER_PROFILES_COLLECTION_REF, 
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
      USER_PROFILES_COLLECTION_REF, 
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
      USER_PROFILES_COLLECTION_REF, 
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
      USER_PROFILES_COLLECTION_REF, 
      orderBy("creationDate", "desc"),
      fbLimit(limit)
    )
  })
  return useCollection<UserProfile>(dbRef)
}
