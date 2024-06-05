import { DEFAULT_SECTION_TYPE_VALUE, DEFAULT_TEAM_ID, TEAMS_COLLECTION_NAME, TEAMS_COLLECTION_REF } from "@/constants"
import { incrementDocField } from "@/services/firebase"
import { Team } from "@/types"
import { doc, limit as fbLimit, orderBy, query, where } from "firebase/firestore"
import { MaybeRefOrGetter, computed, toValue } from "vue"
import { useCollection, useDocument } from "vuefire"

// Composables

export function useTeam(rId: MaybeRefOrGetter<string>) {
  const dbRef = computed(() => {
    const id = toValue(rId)
    if (id === DEFAULT_TEAM_ID) return null
    console.debug(`Fetching team ${id}`)
    return doc(TEAMS_COLLECTION_REF, id)
  })
  return useDocument<Team>(dbRef)
}

export function useTopTeams(rSectionType: MaybeRefOrGetter<string>, rLimit: MaybeRefOrGetter<number>) {
  const dbRef = computed(() => {
    const sectionType = toValue(rSectionType)
    const limit = toValue(rLimit)
    if (sectionType === DEFAULT_SECTION_TYPE_VALUE) return null
    console.debug(`Fetching the ${limit} top teams from sectionType ${sectionType}`)
    // prettier-ignore
    return query(
      TEAMS_COLLECTION_REF, 
      where("sectionType", "==", sectionType),
      orderBy("score", "desc"),
      fbLimit(limit),
    )
  })
  return useCollection<Team>(dbRef)
}

// Setters

export const addTeamWin = async (teamId: string) => {
  console.debug(`Adding 2 points to team ${teamId}`)
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, "score", 2)
}
export const removeTeamWin = async (teamId: string) => {
  console.debug(`Removing 2 points to team ${teamId}`)
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, "score", -2)
}
export const addTeamDraw = async (teamId: string) => {
  console.debug(`Adding 1 points to team ${teamId}`)
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, "score", 1)
}
export const removeTeamDraw = async (teamId: string) => {
  console.debug(`Removing 1 points to team ${teamId}`)
  await incrementDocField(TEAMS_COLLECTION_NAME, teamId, "score", -1)
}
