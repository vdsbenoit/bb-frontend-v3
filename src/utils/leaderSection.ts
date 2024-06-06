import { LEADER_SECTIONS_COLLECTION_REF } from "@/constants"
import { getDocs, query, where } from "firebase/firestore"

// Getters

export const getStaffSectionId = async () => {
  try {
    const dbRef = query(LEADER_SECTIONS_COLLECTION_REF, where("isStaff", "==", true))
    const querySnapshot = await getDocs(dbRef)
    if (querySnapshot.empty) throw Error("Staff group not found in DB")
    if (querySnapshot.size > 1) throw Error("There is more than one staff group in the database")
    return querySnapshot.docs[0].id
  } catch (error) {
    console.error(`Staff group document could not be fetched`, error)
    return null
  }
}
