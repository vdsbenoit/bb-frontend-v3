import { useCurrentUserProfile } from "@/composables/userProfile";
import { ROLES } from '@/constants';
import { RefGame } from "@/types";
import { computed } from "vue";
import { useAppSettings } from "./settings";

export function useCanEditScores(rGame: RefGame) {
  const currentUserProfile = useCurrentUserProfile()
  const appSettings = useAppSettings()

  return computed(() => {
    if (!rGame.value) {
      console.debug("Cannot set score, game variable is not set yet")
      return false
    }
    if (!currentUserProfile.value) {
      console.debug("Cannot set score, user is not authenticated")
      return false
    }

    // Check frozen score
    if (!appSettings.value?.canSetScores) {
      console.debug("Cannot set score. Score registration is not enabled yet")
      return false
    }
    // Check if not leader
    if (currentUserProfile.value.role < ROLES.Animateur) {
      console.debug(`User ${currentUserProfile.value.id} cannot edit game ${rGame.value.id} score. Insufficient role`)
      return false
    }
    // Check if moderator
    if (currentUserProfile.value.role >= ROLES.Organisateur) {
      return true
    }
    // Check if global setting allow leaders to set any scores
    if (appSettings.value.canSetAnyScores) {
      return true
    }
    // Check if leader is assigned to at least a game
    if (!currentUserProfile.value.games) {
      console.debug(`User ${currentUserProfile.value.id} is not registered to set score in any games`)
      return false
    }
    // Check if leader is assigned to the game
    const gameAttendantsIds = rGame.value.attendants.map(attendant => attendant.user.id)
    const userGamesIds = currentUserProfile.value.games.map(g => g.game.id)
    if (
      gameAttendantsIds.includes(currentUserProfile.value.id) &&
      userGamesIds.includes(rGame.value.id)
    ) {
      return true
    }
    console.debug(`Cannot set score, user ${currentUserProfile.value.id} is not registered at ${rGame.value.id}`)
    return false 
  })
}

// todo: check that these rules match with the setLeaders setters
export function useCanRegister() {
  const currentUserProfile = useCurrentUserProfile()
  const appSettings = useAppSettings()

  return computed(() => {
    if (!currentUserProfile.value) {
      console.debug("User cannot register to a game. User is not authenticated")
      return false
    }
    if (currentUserProfile.value.role == ROLES.Animateur || currentUserProfile.value.role == ROLES.Chef) {
      console.debug(`User  ${currentUserProfile.value.id} cannot register to a game. Insufficient role`)
      return false
    }
    if (!appSettings.value?.leaderRegistration) {
      console.debug(`Leader registration is currently closed`)
      return false
    }
    return true
  })
}

export function useCanRegisterSomeone() {
  const currentUserProfile = useCurrentUserProfile()
  const appSettings = useAppSettings()

  return computed(() => {
    if (!currentUserProfile.value) {
      console.debug("The user cannot register someone to a game. The user is not authenticated")
      return false
    }
    if (currentUserProfile.value.role >= ROLES.Organisateur) {
      return true
    }
    if (currentUserProfile.value.role < ROLES.Chef) {
      console.debug(`User ${currentUserProfile.value.id} cannot register someone to a game. Insufficient role`)
      return false
    }
    if (!appSettings.value?.leaderRegistration) {
      console.debug(`Leader registration is currently closed`)
      return false
    }
    return true
  })

}
export function useCanEditGames(){
  const currentUserProfile = useCurrentUserProfile()
  return computed(() => {
    if(!currentUserProfile.value)  return false
    return currentUserProfile.value.role >= ROLES.Organisateur
  })
}
