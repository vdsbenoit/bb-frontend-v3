import { useCurrentUserProfile } from "@/composables/userProfile";
import { ROLES } from '@/constants';
import { RefGame } from "@/types";
import { computed, reactive, watchEffect } from "vue";
import { useAppSettings } from "./settings";

export function useCanEditScores(rGame: RefGame) {
  const currentUserProfile = useCurrentUserProfile()
  const appSettings = useAppSettings()

  const canEditTiming = (timingId: string) => {
    if (!rGame.value) {
      console.debug("Cannot edit score, game variable is not set yet")
      return false
    }
    if (!currentUserProfile.value) {
      console.debug("Cannot edit score, user is not authenticated")
      return false
    }
    // Check if moderator
    if (currentUserProfile.value.role >= ROLES.Organisateur) {
      return true
    }
    // Check if global setting allow leaders to set any scores
    if (appSettings.value?.canSetAnyScores) {
      return true
    }
    if (!(timingId in rGame.value.attendants)) {
      console.debug(`Cannot edit score, timing with id ${timingId} not found in game ${rGame.value.id} attendants`)
      return false
    }
    if (rGame.value.attendants[timingId].map(attendant => attendant.id).includes(currentUserProfile.value.id)) return true
    else {
      console.debug(`Cannot edit score, user ${currentUserProfile.value.id} is not registered to set scores at game ${rGame.value.id}`)
      return false
    }
  }

  const canEditScores = computed(() => {
    if (!rGame.value) {
      console.debug("Cannot edit score, game variable is not set yet")
      return false
    }
    if (!currentUserProfile.value) {
      console.debug("Cannot edit score, user is not authenticated")
      return false
    }

    // Check frozen score
    if (!appSettings.value?.canSetScores) {
      console.debug("Cannot edit score. Score registration is not enabled yet")
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
    const gameAttendantsIds = Object.values(rGame.value.attendants).flat().map(attendant => attendant.id)
    const userGamesIds = Object.values(currentUserProfile.value.games).map(g => g.id)
    if (
      gameAttendantsIds.includes(currentUserProfile.value.id) &&
      userGamesIds.includes(rGame.value.id)
    ) {
      return true
    }
    console.debug(`Cannot set score, user ${currentUserProfile.value.id} is not registered at ${rGame.value.id}`)
    return false 
  })

  return { canEditScores, canEditTiming }
}

// todo: check that these rules match with the Game registration setters
export function useCanRegister() {
  const canRegister = reactive({
    itself: false,
    section: false,
    anyone: false
  })
  const currentUserProfile = useCurrentUserProfile()
  const appSettings = useAppSettings()

  watchEffect(() => {
    canRegister.itself = false
    canRegister.section = false
    canRegister.anyone = false
    if (!currentUserProfile.value) {
      console.debug("User cannot register to a game. User is not authenticated")
      return
    }
    if (currentUserProfile.value.role >= ROLES.Organisateur) {
      canRegister.section = true
      canRegister.anyone = true
      return
    }
    if (!appSettings.value?.isLeaderRegistrationOpen) {
      console.debug(`Leader registration is currently closed`)
      return
    }
    if (currentUserProfile.value.role < ROLES.Animateur) {
      console.debug(`User  ${currentUserProfile.value.id} cannot register to a game. Insufficient role`)
      return
    }
    if (currentUserProfile.value.role == ROLES.Animateur) {
      canRegister.itself = true
    }
    if (currentUserProfile.value.role == ROLES.Chef) {
      canRegister.itself = true
      canRegister.section = true
    }
  })

  return canRegister
}

export function useCanEditGames(){
  const currentUserProfile = useCurrentUserProfile()
  return computed(() => {
    if(!currentUserProfile.value) return false
    return currentUserProfile.value.role >= ROLES.Organisateur
  })
}
