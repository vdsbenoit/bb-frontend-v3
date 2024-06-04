import { useCurrentUserProfile } from "@/composables/users"
import { Ref, ref, watchEffect } from "vue"
import { canSetScoreAnywhere, isScoresFrozen } from "../services/settings"
import { ROLES } from "../services/users"
import { Game } from "./games"

// composables

export function useCanEditScore(game: Ref<Game>) {
  const canEditGameScore = ref(false)
  const currentUserProfile = useCurrentUserProfile()

  watchEffect(() => {
    if (!currentUserProfile.value) {
      console.debug("Cannot set score, user is not authenticated")
      canEditGameScore.value = false
      return
    }

    // Check frozen score
    if (isScoresFrozen()) {
      console.debug("Cannot set score, score registration is frozen")
      canEditGameScore.value = false
      return
    }
    // Check if not leader
    if (currentUserProfile.value.role < ROLES.Animateur) {
      console.debug(`User ${currentUserProfile.value.uid} cannot edit game ${game.value.id} score. Insufficient role`)
      canEditGameScore.value = false
      return
    }
    // Check if moderator
    if (currentUserProfile.value.role >= ROLES.Organisateur) {
      canEditGameScore.value = true
      return
    }
    // Check if global setting allow leaders to set any scores
    if (canSetScoreAnywhere()) {
      canEditGameScore.value = true
      return
    }
    // Check if leader assigned to the game
    if (
      game.value.morningLeaders.includes(currentUserProfile.value.uid) &&
      currentUserProfile.value.morningGame == game.value.id
    ) {
      canEditGameScore.value = true
      return
    }
    if (
      game.value.afternoonLeaders.includes(currentUserProfile.value.uid) &&
      currentUserProfile.value.afternoonGame == game.value.id
    ) {
      canEditGameScore.value = true
      return
    }
    console.debug(`Cannot set score, user ${currentUserProfile.value.uid} is not registered at ${game.value.id}`)
    canEditGameScore.value = false
  })

  return canEditGameScore
}

export function useCanRegister() {
  const canRegister = ref(false)
  const currentUserProfile = useCurrentUserProfile()
  const appSettings = useAppSettings()

  watchEffect(() => {
    if (!currentUserProfile.value) {
      console.debug("User cannot register to match. User is not authenticated")
      return (canRegister.value = false)
    }
    if (currentUserProfile.value.role < ROLES.Animateur) {
      console.debug(`User  ${currentUserProfile.value.uid} cannot register to match. Insufficient role`)
      return (canRegister.value = false)
    }
    if (!appSettings.value?.leaderRegistration) {
      console.debug(`Leader registration is currently not open`)
      return (canRegister.value = false)
    }
    canRegister.value = true
  })

  return canRegister
}
