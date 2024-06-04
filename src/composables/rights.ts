import { useCurrentUserProfile } from "@/composables/users";
import { Ref, ref, watchEffect } from "vue";
import { Game } from "./games";
import { canSetScoreAnywhere, isScoresFrozen } from "../services/settings";
import { ROLES } from "../services/users";

// composables

export function useCanEditScore(game: Ref<Game>) {
  const canEditGameScore = ref(false)
  const currentUserProfile = useCurrentUserProfile()

  watchEffect(() => {
    if (!currentUserProfile.value) {
      console.debug("Cannot set score, user is not authenticated")
      return canEditGameScore.value = false
    }

    // Check frozen score
    if (isScoresFrozen()) {
      console.debug("Cannot set score, score registration is frozen")
      return canEditGameScore.value = false
    }
    // Check if not leader
    if (currentUserProfile.value.role < ROLES.Animateur){ 
      console.debug(`User ${currentUserProfile.value.uid} cannot edit game ${game.value.id} score. Insufficient role`);
      return canEditGameScore.value = false
    }
    // Check if moderator
    if (currentUserProfile.value.role >= ROLES.Organisateur) return canEditGameScore.value = true
    // Check if global setting allow leaders to set any scores
    if (canSetScoreAnywhere()) return canEditGameScore.value = true
    // Check if leader assigned to the game
    if (game.value.morningLeaders.includes(currentUserProfile.value.uid) && currentUserProfile.value.morningGame == game.value.id){
      return canEditGameScore.value = true
    }
    if (game.value.afternoonLeaders.includes(currentUserProfile.value.uid) && currentUserProfile.value.afternoonGame == game.value.id){
      return canEditGameScore.value = true
    }
    console.debug(`Cannot set score, user ${currentUserProfile.value.uid} is not registered at ${game.value.id}`);
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
      console.debug('User cannot register to match. User is not authenticated')
      return canRegister.value = false
    }
    if (currentUserProfile.value.role < ROLES.Animateur) {
      console.debug(`User  ${currentUserProfile.value.uid} cannot register to match. Insufficient role`)
      return canRegister.value = false
    }
    if (!appSettings.value?.leaderRegistration) {
      console.debug(`Leader registration is currently not open`)
      return canRegister.value = false
    }
    canRegister.value = true
  })

  return canRegister
}