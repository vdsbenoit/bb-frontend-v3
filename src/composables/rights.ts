import type { RefGame, RefUserProfile } from '@/types'
import { computed, reactive, watchEffect } from 'vue'
import { useCurrentUserProfile } from '@/composables/userProfile'
import { DEFAULT_GROUP_ID, USER_ROLES } from '@/constants'
import { useAppSettings } from './app'

export function useCanSeeRanking() {
  const currentUserProfile = useCurrentUserProfile()
  const appSettings = useAppSettings()
  return computed(() => {
    if (appSettings.value?.isRankingPublic) return true
    if (!currentUserProfile.value) return false
    return currentUserProfile.value.role >= USER_ROLES.Administrateur
  })
}

export function useEditScoreRights(rGame: RefGame) {
  const currentUserProfile = useCurrentUserProfile()
  const appSettings = useAppSettings()

  const canEditScoresAt = (timingId: string) => {
    if (!rGame.value) {
      console.debug('Cannot edit score, game variable is not set yet')
      return false
    }
    if (!currentUserProfile.value) {
      console.debug('Cannot edit score, user is not authenticated')
      return false
    }
    // Check if moderator
    if (currentUserProfile.value.role >= USER_ROLES.Organisateur) {
      return true
    }
    // Check if global setting allow attendants to set any scores
    if (appSettings.value?.canSetAnyScores) {
      return true
    }
    if (!(timingId in rGame.value.attendants)) {
      console.debug(`Cannot edit score, timing with id ${timingId} not found in game ${rGame.value.id} attendants`)
      return false
    }
    if (rGame.value.attendants[timingId].map(attendant => attendant.id).includes(currentUserProfile.value.id)) {
      return true
    } else {
      console.debug(
        `Cannot edit score, user ${currentUserProfile.value.id} is not registered to set scores at game ${rGame.value.id}`,
      )
      return false
    }
  }

  const canEditScores = computed(() => {
    if (!rGame.value) {
      console.debug('Cannot edit score, game variable is not set yet')
      return false
    }
    if (!currentUserProfile.value) {
      console.debug('Cannot edit score, user is not authenticated')
      return false
    }

    // Check frozen score
    if (!appSettings.value?.canSetScores) {
      console.debug('Cannot edit score. Score registration is not enabled yet')
      return false
    }
    // Check if not attendant
    if (currentUserProfile.value.role < USER_ROLES.Animateur) {
      console.debug(`User ${currentUserProfile.value.id} cannot edit game ${rGame.value.id} score. Insufficient role`)
      return false
    }
    // Check if moderator
    if (currentUserProfile.value.role >= USER_ROLES.Organisateur) {
      return true
    }
    // Check if global setting allow attendants to set any scores
    if (appSettings.value.canSetAnyScores) {
      return true
    }
    // Check if attendant is assigned to at least a game
    if (!currentUserProfile.value.games) {
      console.debug(`User ${currentUserProfile.value.id} is not registered to set score in any games`)
      return false
    }
    // Check if attendant is assigned to the game
    const gameAttendantsIds = Object.values(rGame.value.attendants)
      .flat()
      .map(attendant => attendant.id)
    const userGamesIds = Object.values(currentUserProfile.value.games).map(game => game.id)
    if (gameAttendantsIds.includes(currentUserProfile.value.id) && userGamesIds.includes(rGame.value.id)) {
      return true
    }
    console.debug(`Cannot set score, user ${currentUserProfile.value.id} is not registered at ${rGame.value.id}`)
    return false
  })

  return { canEditScores, canEditScoresAt }
}

// todo: check that these rules match with the Game registration setters
export function useCanRegister() {
  const canRegister = reactive({
    itself: false,
    group: false,
    anyone: false,
  })
  const currentUserProfile = useCurrentUserProfile()
  const appSettings = useAppSettings()

  watchEffect(() => {
    canRegister.itself = false
    canRegister.group = false
    canRegister.anyone = false
    if (!currentUserProfile.value) {
      console.debug('User cannot register to a game. User is not authenticated')
      return
    }
    if (currentUserProfile.value.role >= USER_ROLES.Organisateur) {
      canRegister.group = true
      canRegister.anyone = true
      return
    }
    if (!appSettings.value?.isAttendantRegistrationOpen) {
      console.debug(`Attendant registration is currently closed`)
      return
    }
    if (currentUserProfile.value.role < USER_ROLES.Animateur) {
      console.debug(`User ${currentUserProfile.value.id} cannot register to a game. Insufficient role`)
      return
    }
    if (currentUserProfile.value.role === USER_ROLES.Animateur) {
      canRegister.itself = true
    }
    if (currentUserProfile.value.role === USER_ROLES.Chef) {
      canRegister.itself = true
      canRegister.group = true
    }
  })

  return canRegister
}

export function useCanEditGames() {
  const currentUserProfile = useCurrentUserProfile()
  return computed(() => {
    if (!currentUserProfile.value) return false
    return currentUserProfile.value.role >= USER_ROLES.Organisateur
  })
}

export function useCanSeeModerationStuff() {
  const currentUserProfile = useCurrentUserProfile()
  return computed(() => {
    if (!currentUserProfile.value) return false
    return currentUserProfile.value.role >= USER_ROLES.Organisateur
  })
}

export function useAcceptApplicantRights() {
  const currentUserProfile = useCurrentUserProfile()
  const canAcceptApplicants = computed(() => {
    if (!currentUserProfile.value) return false
    if (currentUserProfile.value.role === undefined) return false
    return currentUserProfile.value.role >= USER_ROLES.Chef
  })
  const maxApplicantRole = computed(() => {
    if (!currentUserProfile.value) return USER_ROLES.Anonyme
    return currentUserProfile.value.role
  })
  const applicantGroupIdFilter = computed(() => {
    if (!currentUserProfile.value) return DEFAULT_GROUP_ID // when this is true, canAcceptApplicants is false
    if (currentUserProfile.value.role > USER_ROLES.Chef) return DEFAULT_GROUP_ID
    if (!currentUserProfile.value.groupId) return DEFAULT_GROUP_ID
    return currentUserProfile.value.groupId
  })
  return { canAcceptApplicants, maxApplicantRole, applicantGroupIdFilter }
}

export function useEditProfileRights(targetUserProfile: RefUserProfile) {
  const currentUserProfile = useCurrentUserProfile()

  // Determine if the displayed profile is the current user's profile
  const isOwnProfile = computed(() => {
    if (!currentUserProfile.value) return false
    if (!targetUserProfile.value) return false
    return targetUserProfile.value.id === currentUserProfile.value.id
  })

  // User can edit profile if it is its own profile or if it is an organizer
  const canEditProfile = computed(() => {
    if (!currentUserProfile.value) return false
    if (currentUserProfile.value.role >= USER_ROLES.Organisateur) return true
    return isOwnProfile.value
  })

  // Only moderators & user itself can see email address (GPDR)
  const canSeeEmail = computed(() => {
    if (!currentUserProfile.value) return false
    if (currentUserProfile.value.role >= USER_ROLES.Organisateur) return true
    return isOwnProfile.value
  })

  // User can edit games if :
  // - it is its own profile
  // - it is an organizer
  // - it is a chef and the target user is in the same attendant group
  const canEditGames = computed(() => {
    if (!currentUserProfile.value) return false
    if (!targetUserProfile.value) return false
    if (canEditProfile.value) return true
    if (
      currentUserProfile.value.role === USER_ROLES.Chef
      && currentUserProfile.value.groupId === targetUserProfile.value.groupId
    ) {
      return true
    }
    return false
  })

  // User can edit group if it is an organizer
  const canEditAttendantGroup = computed(() => {
    if (!currentUserProfile.value) return false
    return currentUserProfile.value.role >= USER_ROLES.Organisateur
  })

  // User can set role if it is an organizer
  const canEditRole = computed(() => {
    if (!currentUserProfile.value) return false
    return currentUserProfile.value.role >= USER_ROLES.Organisateur
  })

  // User can reset the onboarding if it is an organizer
  const canResetOnboarding = computed(() => {
    if (!currentUserProfile.value) return false
    return currentUserProfile.value.role >= USER_ROLES.Organisateur
  })

  // User can delete profile if it is an organizer or if it is its own profile
  const canDeleteProfile = computed(() => {
    if (!currentUserProfile.value) return false
    if (currentUserProfile.value.role >= USER_ROLES.Administrateur) return true
    return isOwnProfile.value
  })

  return {
    isOwnProfile,
    canEditProfile,
    canSeeEmail,
    canEditGames,
    canEditAttendantGroup,
    canEditRole,
    canResetOnboarding,
    canDeleteProfile,
  }
}
