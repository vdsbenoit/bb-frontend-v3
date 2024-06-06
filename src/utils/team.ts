import { TEAMS_COLLECTION_NAME } from "@/constants"
import { incrementDocField } from "@/services/firebase"

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
