import { useCurrentUserProfile } from "@/composables/users";
import { ROLES } from '@/constants';
import { Ref, ref, watchEffect } from "vue";
import { useAppSettings } from "./settings";
import { Game } from "@/types";

// composables

export function useCanEditScore(game: Ref<Game>) {
  const canEditGameScore = ref(false)
  const currentUserProfile = useCurrentUserProfile()
  const appSettings = useAppSettings()

  watchEffect(() => {
    if (!currentUserProfile.value) {
      console.debug("Cannot set score, user is not authenticated")
      canEditGameScore.value = false
      return
    }

    // Check frozen score
    if (appSettings.value.isScoresFrozen) {
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
    if (appSettings.value.canSetScoreAnywhere) {
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

// todo: check that these rules match with the setLeaders setters
export function useCanRegister() {
  const result = ref(false)
  const reason = ref("")
  const currentUserProfile = useCurrentUserProfile()
  const appSettings = useAppSettings()

  watchEffect(() => {
    if (!currentUserProfile.value) {
      reason.value = "User cannot register to a game. User is not authenticated"
      result.value = false
      return
    }
    if (currentUserProfile.value.role == ROLES.Animateur || currentUserProfile.value.role == ROLES.Chef) {
      reason.value = `User  ${currentUserProfile.value.uid} cannot register to a game. Insufficient role`
      result.value = false
      return
    }
    if (!appSettings.value?.leaderRegistration) {
      reason.value = `Leader registration is currently closed`
      result.value = false
      return
    }
    reason.value = ""
    result.value = true
  })

  return { result, reason }
}

export function useCanRegisterSomeone() {
  const result = ref(false)
  const reason = ref("")
  const currentUserProfile = useCurrentUserProfile()
  const appSettings = useAppSettings()

  watchEffect(() => {
    if (!currentUserProfile.value) {
      reason.value = "The user cannot register someone to a game. The user is not authenticated"
      result.value = false
      return
    }
    if (currentUserProfile.value.role >= ROLES.Organisateur) {
      reason.value = ""
      result.value = true
      return
    }
    if (currentUserProfile.value.role < ROLES.Chef) {
      reason.value = `User  ${currentUserProfile.value.uid} cannot register someone to a game. Insufficient role`
      result.value = false
      return
    }
    if (!appSettings.value?.leaderRegistration) {
      reason.value = `Leader registration is currently closed`
      result.value = false
      return
    }
    reason.value = ""
    result.value = true
  })

  return { result, reason }
}