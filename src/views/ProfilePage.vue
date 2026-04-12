<script setup lang="ts">
import type { VueFireGame } from '@/types'
import {
  IonButton,
  IonCard,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/vue'
import { useRouteParams } from '@vueuse/router'
import DOMPurify from 'dompurify'
import { checkmarkOutline, checkmarkSharp, closeOutline, closeSharp, pencilOutline, pencilSharp } from 'ionicons/icons'
import { computed, reactive, ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig, useAppSettings } from '@/composables/app'
import { useAttendantGroups } from '@/composables/attendantGroup'
import { useGames } from '@/composables/game'
import { usePlayerGroup, usePlayerGroups } from '@/composables/playerGroup'
import { useEditProfileRights } from '@/composables/rights'
import { useCurrentUserProfile, useUserProfile } from '@/composables/userProfile'
import {
  DEFAULT_GAME_ID,
  DEFAULT_GROUP_CATEGORY_ID,
  DEFAULT_GROUP_ID,
  DEFAULT_TEAM_ID,
  DEFAULT_USER_ID,
  DEFAULT_USER_ROLE_VALUE,
  USER_ROLES,
} from '@/constants'
import { addAttendant, removeAttendant } from '@/utils/game'
import { confirmPopup, errorPopup, infoPopup, loadingPopup, toastPopup } from '@/utils/popup'
import { getRoleByValue, removeFirebaseAccount, signOut, updateUserProfile } from '@/utils/userProfile'

// reactive form data
const formData = reactive({
  name: {
    isEditing: false,
    isUpdating: false,
    value: '',
  },
  role: {
    isEditing: false,
    isUpdating: false,
    value: DEFAULT_USER_ROLE_VALUE,
  },
  playerGroup: {
    isEditing: false,
    isUpdating: false,
    categoryId: DEFAULT_GROUP_CATEGORY_ID,
    id: DEFAULT_GROUP_ID,
    name: '',
  },
  team: {
    isEditing: false,
    isUpdating: false,
    value: DEFAULT_TEAM_ID,
  },
  attendantGroup: {
    isEditing: false,
    isUpdating: false,
    id: DEFAULT_GROUP_ID,
    name: '',
  },
  attendantGames: {
    isEditing: false,
    isUpdating: false,
    ids: {} as { [timingId: string]: string },
    names: {} as { [timingId: string]: string },
  },
})

// Composables & computed variables

const router = useRouter()
const appConfig = useAppConfig()
const appSettings = useAppSettings()
const attendantSchedule = computed(() => appConfig.value?.attendantSchedule ?? [])
const currentUserProfile = useCurrentUserProfile()
const queryUserId = useRouteParams<string>('userId', DEFAULT_USER_ID)
const userId = computed(() => {
  if (!currentUserProfile.value) return DEFAULT_USER_ID
  return queryUserId.value === DEFAULT_USER_ID ? currentUserProfile.value.id : queryUserId.value
})
const userProfile = useUserProfile(userId)

const selectableRoles = computed(() => {
  return Object.fromEntries(
    Object.entries(USER_ROLES).filter(
      ([, value]) => (
        ![USER_ROLES.Erreur, USER_ROLES.Anonyme, USER_ROLES.Newbie].includes(value)
        && value <= (currentUserProfile.value?.role ?? DEFAULT_USER_ROLE_VALUE)
      ),
    ),
  )
})

// Checks & rights
const isProfile = computed(() => {
  return !!userProfile.value?.email
})
const isPlayer = computed(() => {
  if (!userProfile.value) return false
  return userProfile.value.role === USER_ROLES.Participant
})
const isAttendant = computed(() => {
  if (!userProfile.value) return false
  return userProfile.value.role === USER_ROLES.Animateur || userProfile.value.role === USER_ROLES.Chef
})
const isStaff = computed(() => {
  if (!userProfile.value) return false
  return userProfile.value.role >= USER_ROLES.Organisateur
})
const {
  isOwnProfile,
  canEditProfile,
  canSeeEmail,
  canEditGames,
  canEditAttendantGroup,
  canEditRole,
  canResetOnboarding,
  canDeleteProfile,
} = useEditProfileRights(userProfile)

function isTimeSlotFull(game: VueFireGame, timeSlotId: string) {
  if (!appSettings.value) return false
  if (!game.attendants || !game.attendants[timeSlotId]) return false
  return game.attendants[timeSlotId].length >= appSettings.value.maxGameAttendants
}

const pageTitle = computed(() => {
  if (isOwnProfile.value) return 'Ton profil'
  if (!userProfile.value || !userProfile.value.email) return 'Profil inconnu'
  if (userProfile.value.name) return `Profil de ${userProfile.value.name}`
  return `Profil de ${userProfile.value.email}`
})

// Lazy loading of all player groups
// They are only loaded after the user starts editing the player group
const selectedPlayergroupCategoryId = computed(() => {
  return formData.playerGroup.isEditing ? formData.playerGroup.categoryId : DEFAULT_GROUP_CATEGORY_ID
})
const playerGroups = usePlayerGroups(selectedPlayergroupCategoryId)

// This computed variable is necessary in order to keep the reactivity
const selectedPlayerGroupId = computed(() => {
  return formData.playerGroup.id
})
const selectedPlayerGroup = usePlayerGroup(selectedPlayerGroupId)

// Lazy loading of games
// They are only loaded after the user starts editing the attendantGames
const shouldLoadGames = ref(true)
const games = useGames(shouldLoadGames)

// Lazy loading of attendant groups
// They are only loaded after the user starts editing the field
const shouldLoadAttendantGroups = ref(false)
const loadStaffGroups = computed(() => (formData.role.value >= USER_ROLES.Organisateur ? 'only' : 'exclude'))
const attendantGroups = useAttendantGroups(shouldLoadAttendantGroups, loadStaffGroups, true, currentUserProfile)

/**
 * Update formData with selected user profile data
 * Does not update the form data if the user is editing the field
 */
function resetFormData() {
  if (!userProfile.value) return

  // common fields
  if (!formData.name.isEditing && !formData.name.isUpdating) formData.name.value = userProfile.value.name
  if (!formData.role.isEditing && !formData.role.isUpdating)
    formData.role.value = userProfile.value.role ?? DEFAULT_USER_ROLE_VALUE

  // players
  if (userProfile.value.role === USER_ROLES.Participant) {
    if (!formData.team.isEditing && !formData.team.isUpdating)
      formData.team.value = userProfile.value.teamId ?? DEFAULT_TEAM_ID
    if (!formData.playerGroup.isEditing && !formData.playerGroup.isUpdating) {
      formData.playerGroup.id = userProfile.value.groupId ?? DEFAULT_GROUP_ID
      formData.playerGroup.name = userProfile.value.groupName ?? ''
      formData.playerGroup.categoryId = selectedPlayerGroup.value?.groupCategoryId ?? DEFAULT_GROUP_CATEGORY_ID
    }
  }

  // attendants & staff
  if (
    userProfile.value.role >= USER_ROLES.Animateur
    && !formData.attendantGroup.isEditing
    && !formData.attendantGroup.isUpdating
  ) {
    formData.attendantGroup.id = userProfile.value.groupId ?? DEFAULT_GROUP_ID
    formData.attendantGroup.name = userProfile.value.groupName ?? ''
  }

  // attendants
  if (
    (userProfile.value.role === USER_ROLES.Animateur || userProfile.value.role === USER_ROLES.Chef)
    && !formData.attendantGames.isEditing
    && !formData.attendantGames.isUpdating
  ) {
    formData.attendantGames.ids = {} as { [timingId: string]: string }
    formData.attendantGames.names = {} as { [timingId: string]: string }
    if (userProfile.value.games) {
      for (const [timeSlotId, game] of Object.entries(userProfile.value.games)) {
        formData.attendantGames.ids[timeSlotId] = game.id
        formData.attendantGames.names[timeSlotId] = game.name
      }
    }
  }

  // reset formData isEditing state
  formData.name.isEditing = false
  formData.role.isEditing = false
  formData.team.isEditing = false
  formData.playerGroup.isEditing = false
  formData.attendantGroup.isEditing = false
  formData.attendantGames.isEditing = false

  formData.name.isUpdating = false
  formData.role.isUpdating = false
  formData.team.isUpdating = false
  formData.playerGroup.isUpdating = false
  formData.attendantGroup.isUpdating = false
  formData.attendantGames.isUpdating = false
}

function editGames() {
  shouldLoadGames.value = true
  formData.attendantGames.isEditing = true
}

function editAttendantGroup() {
  shouldLoadAttendantGroups.value = true
  formData.attendantGroup.isEditing = true
}

function onCategoryChange() {
  formData.playerGroup.id = DEFAULT_GROUP_ID
  formData.playerGroup.name = ''
}

// Watchers

// Update the form data when the user profile changes
watch(userProfile, (newProfileValue) => {
  if (newProfileValue) {
    resetFormData()
  }
})
watch(selectedPlayerGroup, (newGroupValue) => {
  if (newGroupValue) {
    resetFormData()
  }
})
// this is necessary to keep userProfile.games reactive
watchEffect(() => {
  if (!userProfile.value) return
  if (userProfile.value.games) resetFormData()
})

// Go to pages

function goToPlayerGroupPage(groupId: string) {
  if (groupId !== DEFAULT_GROUP_ID) void router.push(`/player-group/${groupId}`)
}
function goToAttendantGroupPage(groupId: string) {
  if (groupId !== DEFAULT_GROUP_ID) void router.push(`/attendant-group/${groupId}`)
}
function goToTeamPage(teamId: string) {
  if (teamId !== DEFAULT_TEAM_ID) void router.push(`/team/${teamId}`)
}
function goToGamePage(gameId: string) {
  if (gameId !== DEFAULT_GAME_ID) void router.push(`/game/${gameId}`)
}

// Setters

/**
 * Setters
 *
 * Each setter is responsible for updating the user profile with the new data
 * It also handles the loading and error states
 *
 * The resetFormData function is called at the end of each setter to reset the form data
 *
 * If an error occurs, the function throws an error and the form data is not reset
 */

/**
 * Set a new name for the user
 * Sanitize the input before updating the user profile
 */
async function setName() {
  if (!formData.name.value) {
    void toastPopup('Erreur : aucun nom n\'a été entré')
    resetFormData()
    return
  }
  formData.name.isEditing = false
  formData.name.isUpdating = true
  await updateUserProfile(userId.value, { name: DOMPurify.sanitize(formData.name.value) }).catch((error) => {
    void errorPopup(error.message, `Le n'a pas pu être mis à jour`)
  })
  resetFormData()
}

/**
 * Set a new role for the user
 * If the user was registered to games & that the new roles is not an attendant, remove the games
 * Throw an error if trying to upgrade a participant to an higher role
 * Throw an error if trying to downgrade an attendant (or higher) to a participant
 */
async function setRole() {
  if (!formData.role.value || formData.role.value === DEFAULT_USER_ROLE_VALUE) {
    void toastPopup('Erreur : aucun rôle n\'a été sélectionné')
    resetFormData()
    return
  }
  if (!userProfile.value) {
    void errorPopup('Le profil de l\'utilisateur n\'a pas été chargé')
    resetFormData()
    return
  }
  if (userProfile.value.role === USER_ROLES.Participant && formData.role.value > USER_ROLES.Participant) {
    void errorPopup(
      'Pour cela, il faut supprimer et recréer l\'utilisateur',
      'Il n\'est pas possible de changer le rôle d\'un participant',
    )
    resetFormData()
    return
  }
  if (userProfile.value.role >= USER_ROLES.Animateur && formData.role.value < USER_ROLES.Animateur) {
    void errorPopup(
      'Pour cela, il faut supprimer et recréer l\'utilisateur',
      'Il n\'est pas possible de rétrograder un utilisateur au role de participant',
    )
    resetFormData()
    return
  }
  formData.role.isEditing = false
  formData.role.isUpdating = true
  console.log('ROLE 1', formData.role.value)
  // if the user was registered to games & that the new roles is not an attendant, remove the games
  if (
    userProfile.value.games
    && Object.values(userProfile.value.games).length > 0
    && formData.role.value > USER_ROLES.Chef
  ) {
    for (const [timeSlotId, game] of Object.entries(userProfile.value.games)) {
      try {
        await removeAttendant(game.id, userProfile.value.id, timeSlotId)
      } catch (error: any) {
        void errorPopup(error.message, `Erreur lors du désenregistrement de l'utilisateur à l'épreuve ${game}`)
        resetFormData()
        throw error
      }
      void toastPopup('L\'utilisateur a été désinscrit de ses épreuves car son nouveau rôles n\'est plus dans l\'animation')
    }
  }
  console.log('ROLE 2', formData.role.value)
  try {
    await updateUserProfile(userProfile.value.id, {
      role: formData.role.value,
      groupId: DEFAULT_GROUP_ID,
      groupName: '',
    })
    void infoPopup('Tu dois à présent re-configurer la section de l\'utilisateur', 'Attention')
  } catch (error: any) {
    void errorPopup(error.message, `Le rôle n'a pas pu être mis à jour`)
    resetFormData()
    throw error
  }
  resetFormData()
  console.log('ROLE 3', formData.role.value)
}

/**
 * Set a new player group
 * Side effect: it resets the team value
 */
async function setPlayerGroup() {
  if (formData.playerGroup.id === DEFAULT_GROUP_ID) {
    resetFormData()
    return
  }
  formData.playerGroup.isEditing = false
  formData.playerGroup.isUpdating = true
  const selectedGroup = playerGroups.value.find(group => group.id === formData.playerGroup.id)
  if (!selectedGroup) {
    resetFormData()
    return
  }
  try {
    await updateUserProfile(userId.value, {
      groupId: formData.playerGroup.id,
      groupName: selectedGroup.name,
      teamId: DEFAULT_TEAM_ID,
    })
  } catch (error: any) {
    void errorPopup(error.message, `La section n'a pas pu être mise à jour`)
    resetFormData()
    throw error
  }
  void toastPopup('Vu que la section a changé, l\'équipe a été effacée du profil')
  resetFormData()
}

/**
 * Set a new team
 */
async function setTeam() {
  if (formData.team.value === DEFAULT_TEAM_ID) {
    void toastPopup('Erreur : aucune équipe n\'a été sélectionnée')
    resetFormData()
    return
  }
  formData.team.isEditing = false
  formData.team.isUpdating = true
  try {
    await updateUserProfile(userId.value, { teamId: formData.team.value })
  } catch (error: any) {
    void errorPopup(error.message, `L'équipe n'a pas pu être mise à jour`)
    resetFormData()
    throw error
  }
  resetFormData()
}

/**
 * Set a new attendant group
 */
async function setAttendantGroup() {
  if (formData.attendantGroup.id === DEFAULT_GROUP_ID) {
    void toastPopup('Erreur : aucune section n\'a été sélectionnée')
    resetFormData()
    return
  }
  formData.attendantGroup.isEditing = false
  formData.attendantGroup.isUpdating = true
  const selectedGroup = attendantGroups.value.find(group => group.id === formData.attendantGroup.id)
  if (!selectedGroup) {
    void errorPopup('La section n\'a pas été trouvée')
    resetFormData()
    return
  }
  try {
    await updateUserProfile(userId.value, {
      groupId: formData.attendantGroup.id,
      groupName: selectedGroup.name,
    })
  } catch (error: any) {
    void errorPopup(error.message, `La section n'a pas pu être mise à jour`)
    resetFormData()
    throw error
  }
  resetFormData()
}

/**
 * Set a new game for the user
 * If the user was already registered to a game, remove the user from the previous game
 */
async function setGame(timeSlotId: string) {
  if (!formData.attendantGames.ids[timeSlotId]) {
    void toastPopup('Erreur : aucun jeu n\'a été sélectionné')
    resetFormData()
    return
  }
  if (!userProfile.value) {
    void errorPopup('Le profil de l\'utilisateur n\'a pas été chargé')
    resetFormData()
    return
  }
  formData.attendantGames.isEditing = false
  formData.attendantGames.isUpdating = true

  // if the user was already registered to a game
  if (userProfile.value.games && userProfile.value.games[timeSlotId]) {
    // if the user is already registered to this game, cancel the operation and notify the user
    if (userProfile.value.games[timeSlotId].id === formData.attendantGames.ids[timeSlotId]) {
      void toastPopup('L\'utilisateur est déjà inscrit à cette épreuve')
      resetFormData()
      return
    }
    // else, remove the user from the previous game
    try {
      await removeAttendant(userProfile.value.games[timeSlotId].id, userProfile.value.id, timeSlotId)
    } catch (error: any) {
      void errorPopup(
        error.message,
        `Erreur lors du désenregistrement de l'utilisateur à l'épreuve ${userProfile.value.games[timeSlotId]}`,
      )
      resetFormData()
      throw error
    }
  }
  try {
    await addAttendant(formData.attendantGames.ids[timeSlotId], userProfile.value.id, timeSlotId)
  } catch (error: any) {
    void errorPopup(
      error.message,
      `Erreur lors de l'enregistrement de l'utilisateur à l'épreuve ${formData.attendantGames.ids[timeSlotId]}`,
    )
    resetFormData()
    throw error
  }
  resetFormData()
}

// Actions

/**
 * Reset the onboarding process
 */
async function resetOnboarding() {
  const loading = await loadingPopup('Réinitialisation de l\'onboarding')
  try {
    await updateUserProfile(userId.value, {
      role: USER_ROLES.Newbie,
      groupId: DEFAULT_GROUP_ID,
      groupName: '',
      hasDoneOnboarding: false,
    })
  } catch (error: any) {
    void errorPopup(error.message, `L'onboarding n'a pas pu être réinitialisée`)
  }
  await loading.dismiss()
}

/**
 * Log out the user
 */
function logOut() {
  void confirmPopup('Es-tu certain.e de vouloir te déconnecter ?', async () => {
    const loading = await loadingPopup('Déconnexion')
    try {
      await signOut()
      void router.replace('/home')
    } catch (error: any) {
      void errorPopup(error.message, `Une erreur est survenue durant la déconnexion`)
    }
    await loading.dismiss()
  })
}

async function removeAccount() {
  const confirmTitle = 'Es-tu sûr.e ?'
  const confirmMessage = 'Cette opération supprimera toutes les données liées au profil'
  const removeAccountHandler = async () => {
    if (!userProfile.value) {
      void errorPopup('Le profil de l\'utilisateur n\'a pas été chargé')
      return
    }
    const wasOwnProfile = isOwnProfile.value
    const loading = await loadingPopup('Suppression du profil')
    if (userProfile.value.games) {
      for (const [timeSlotId, game] of Object.entries(userProfile.value.games)) {
        try {
          await removeAttendant(game.id, userProfile.value.id, timeSlotId)
        } catch (error: any) {
          void errorPopup(
            error.message,
            `Erreur lors du désenregistrement de l'utilisateur ${userProfile.value.id} à l'épreuve ${game}`,
          )
        }
      }
    }
    try {
      await removeFirebaseAccount(userProfile.value.id)
    } catch (error: any) {
      void errorPopup(error.message, `Erreur Lors de la suppression de l'utilisateur ${userProfile.value.email}`)
    }
    if (wasOwnProfile) {
      await signOut()
      void router.replace('/home')
    }
    await loading.dismiss()
  }
  void confirmPopup(confirmMessage, removeAccountHandler, null, confirmTitle)
}
</script>

<template>
  <IonPage>
    <HeaderComponent :page-title="pageTitle" />
    <IonContent :fullscreen="true" class="ion-padding">
      <RefresherComponent />
      <div v-if="!isProfile" class="not-found ion-padding">
        <strong class="capitalize">Nous n'avons pas trouvé ce profil...</strong>
        <p>Retour à <a @click="router.go(-1)">la page précédente</a></p>
      </div>
      <IonCard v-else class="ion-no-margin ion-margin-bottom ion-padding-bottom">
        <IonList>
          <!-- Name (edit mode) -->
          <IonItem v-if="formData.name.isEditing" lines="full">
            <IonInput
              v-model="formData.name.value"
              name="name"
              type="text"
              label="Nom"
              label-placement="stacked"
              @keydown.enter="setName"
            />
            <IonIcon slot="end" :ios="checkmarkOutline" :md="checkmarkSharp" @click="setName" />
            <IonIcon slot="end" :ios="closeOutline" :md="closeSharp" @click="resetFormData()" />
          </IonItem>
          <!-- Name (read mode) -->
          <IonItem v-else lines="full">
            <IonInput
              name="name"
              type="text"
              :readonly="true"
              inputmode="none"
              label="Nom"
              label-placement="stacked"
              :value="formData.name.value"
            />
            <IonSpinner v-if="formData.name.isUpdating" />
            <IonIcon
              v-else-if="canEditProfile"
              slot="end"
              :ios="pencilOutline"
              :md="pencilSharp"
              @click="formData.name.isEditing = true"
            />
          </IonItem>
          <!-- Role (edit mode) -->
          <IonItem v-if="formData.role.isEditing" lines="full">
            <IonSelect
              v-model="formData.role.value"
              cancel-text="Annuler"
              interface="action-sheet"
              label="Role"
              label-placement="stacked"
              @ion-change="setRole"
              @ion-cancel="resetFormData()"
            >
              <IonSelectOption v-for="(value, role) in selectableRoles" :key="value" :value="value">
                {{ role }}
              </IonSelectOption>
            </IonSelect>
            <IonIcon
              slot="end"
              :ios="closeOutline"
              :md="closeSharp"
              @click="resetFormData()"
            />
          </IonItem>
          <!-- Role (read mode) -->
          <IonItem v-else lines="full">
            <IonInput
              type="text"
              :readonly="true"
              inputmode="none"
              label="Role"
              label-placement="stacked"
              :value="getRoleByValue(formData.role.value)"
            />
            <IonSpinner v-if="formData.role.isUpdating" />
            <IonIcon
              v-else-if="canEditRole"
              slot="end"
              :ios="pencilOutline"
              :md="pencilSharp"
              @click="formData.role.isEditing = true"
            />
          </IonItem>
          <!-- PLAYER FIELDS -->
          <div v-if="isPlayer">
            <!-- Player Group Category (edit mode) -->
            <IonItem v-if="formData.playerGroup.isEditing" lines="full">
              <IonInput
                v-if="!appConfig"
                type="text"
                readonly
                value="Error: cannot load group categories (i.e. appConfig)"
              />
              <IonSelect
                v-else
                v-model="formData.playerGroup.categoryId"
                cancel-text="Annuler"
                interface="action-sheet"
                label="Catégorie de section"
                label-placement="stacked"
                @ion-change="onCategoryChange()"
                @ion-cancel="resetFormData()"
              >
                <IonSelectOption
                  v-for="(groupCategory, groupCategoryId) in appConfig.groupCategories"
                  :key="groupCategoryId"
                  :value="groupCategoryId"
                >
                  {{ groupCategory.name }}
                </IonSelectOption>
              </IonSelect>
              <IonIcon
                slot="end"
                :ios="closeOutline"
                :md="closeSharp"
                @click="resetFormData()"
              />
            </IonItem>
            <!-- Player Group Category (read mode) -->
            <IonItem v-else lines="full">
              <p v-if="!appConfig" class="field-error">
                Error: cannot load group categories (i.e. appConfig)
              </p>
              <IonInput
                v-else-if="appConfig"
                type="text"
                readonly
                label="Catégorie de section"
                label-placement="stacked"
                :value="appConfig.groupCategories[formData.playerGroup.categoryId]?.name"
              />
              <IonSpinner v-else />
              <IonSpinner v-if="formData.playerGroup.isUpdating" />
              <IonIcon
                v-else-if="canEditProfile"
                slot="end"
                :ios="pencilOutline"
                :md="pencilSharp"
                @click="formData.playerGroup.isEditing = true"
              />
            </IonItem>
            <!-- Player Group (edit mode) -->
            <IonItem v-if="formData.playerGroup.isEditing" lines="full">
              <p v-if="formData.playerGroup.categoryId === DEFAULT_GROUP_CATEGORY_ID" class="field-error">
                Selectionne d'abord un type de section
              </p>
              <IonSelect
                v-else-if="playerGroups.length > 0"
                v-model="formData.playerGroup.id"
                cancel-text="Annuler"
                interface="action-sheet"
                label="Section"
                label-placement="stacked"
                @ion-dismiss="setPlayerGroup"
                @ion-cancel="resetFormData()"
              >
                <IonSelectOption v-for="playerGroup in playerGroups" :key="playerGroup.id" :value="playerGroup.id">
                  {{ playerGroup.name }}
                </IonSelectOption>
              </IonSelect>
              <p v-else class="field-error">
                Pas de section pour ce type de section
              </p>
              <IonIcon slot="end" :ios="closeOutline" :md="closeSharp" @click="resetFormData()" />
            </IonItem>
            <!-- Player Group (read mode) -->
            <IonItem v-else lines="full">
              <IonInput
                name="playerGroup"
                type="text"
                :readonly="true"
                inputmode="none"
                label="Section"
                label-placement="stacked"
                :value="formData.playerGroup.name"
                @click="goToPlayerGroupPage(formData.playerGroup.id)"
              />
              <IonSpinner v-if="formData.playerGroup.isUpdating" />
              <IonIcon
                v-else-if="canEditProfile"
                slot="end"
                :ios="pencilOutline"
                :md="pencilSharp"
                @click="formData.playerGroup.isEditing = true"
              />
            </IonItem>
            <!-- Team (edit mode) -->
            <IonItem v-if="formData.team.isEditing" lines="full">
              <IonSelect
                v-if="selectedPlayerGroup && selectedPlayerGroup.teams.length > 0"
                v-model="formData.team.value"
                cancel-text="Annuler"
                interface="action-sheet"
                label="Équipe"
                label-placement="stacked"
                @ion-change="setTeam"
                @ion-cancel="resetFormData()"
              >
                <IonSelectOption v-for="team in selectedPlayerGroup.teams" :key="team" :value="team">
                  {{ team }}
                </IonSelectOption>
              </IonSelect>
              <p v-else class="field-error">
                Pas de team pour cette section
              </p>
              <IonIcon
                slot="end"
                :ios="closeOutline"
                :md="closeSharp"
                @click="resetFormData()"
              />
            </IonItem>
            <!-- Team (read mode) -->
            <IonItem v-else lines="full">
              <IonInput
                type="text"
                :readonly="true"
                inputmode="none"
                label="Équipe"
                label-placement="stacked"
                :value="formData.team.value"
                @click="goToTeamPage(formData.team.value)"
              />
              <IonSpinner v-if="formData.team.isUpdating" />
              <IonIcon
                v-else-if="canEditProfile"
                slot="end"
                :ios="pencilOutline"
                :md="pencilSharp"
                @click="formData.team.isEditing = true"
              />
            </IonItem>
          </div>
          <div v-if="isAttendant || isStaff">
            <!-- Attendant Group (edit mode) -->
            <IonItem v-if="formData.attendantGroup.isEditing" lines="full">
              <IonSelect
                v-if="attendantGroups.length > 0"
                v-model="formData.attendantGroup.id"
                cancel-text="Annuler"
                interface="action-sheet"
                label="Section"
                label-placement="stacked"
                @ion-change="setAttendantGroup"
                @ion-cancel="resetFormData()"
              >
                <IonSelectOption
                  v-for="attenantGroup in attendantGroups"
                  :key="attenantGroup.id"
                  :value="attenantGroup.id"
                >
                  {{ attenantGroup.name }}
                </IonSelectOption>
              </IonSelect>
              <p v-else class="field-error">
                Pas de section
              </p>
              <IonIcon
                slot="end"
                :ios="closeOutline"
                :md="closeSharp"
                @click="resetFormData()"
              />
            </IonItem>
            <!-- Attendant Group (read mode) -->
            <IonItem v-else lines="full">
              <IonInput
                name="attendantGroup"
                type="text"
                :readonly="true"
                inputmode="none"
                label="Section"
                label-placement="stacked"
                :value="formData.attendantGroup.name"
                @click="goToAttendantGroupPage(formData.attendantGroup.id)"
              />
              <IonSpinner v-if="formData.attendantGroup.isUpdating" />
              <IonIcon
                v-else-if="canEditAttendantGroup"
                slot="end"
                :ios="pencilOutline"
                :md="pencilSharp"
                @click="editAttendantGroup"
              />
            </IonItem>
          </div>
          <div v-if="isAttendant">
            <div v-for="timeSlot in attendantSchedule" :key="timeSlot.id">
              <!-- Attendant Game (edit mode) -->
              <IonItem v-if="formData.attendantGames.isEditing" lines="full">
                <IonSelect
                  v-model="formData.attendantGames.ids[timeSlot.id]"
                  cancel-text="Annuler"
                  interface="action-sheet"
                  :label="`Épreuve ${timeSlot.name}`"
                  label-placement="stacked"
                  @ion-change="setGame(timeSlot.id)"
                  @ion-cancel="resetFormData()"
                >
                  <IonSelectOption v-for="game in games" :key="game.id" :value="game.id">
                    {{ game.id }}{{ isTimeSlotFull(game, timeSlot.id) ? ' [COMPLET] ' : ' ' }}{{ game.name }}
                  </IonSelectOption>
                </IonSelect>
                <IonIcon
                  slot="end"
                  :ios="closeOutline"
                  :md="closeSharp"
                  @click="resetFormData()"
                />
              </IonItem>
              <!-- Attendant Game (read mode) -->
              <IonItem v-else lines="full">
                <IonInput
                  v-if="timeSlot.id in formData.attendantGames.names"
                  type="text"
                  :readonly="true"
                  inputmode="none"
                  :label="`Épreuve ${timeSlot.name}`"
                  label-placement="stacked"
                  :value="`${formData.attendantGames.ids[timeSlot.id]} ${formData.attendantGames.names[timeSlot.id]}`"
                  @click="goToGamePage(formData.attendantGames.ids[timeSlot.id])"
                />
                <IonInput
                  v-else
                  type="text"
                  :readonly="true"
                  inputmode="none"
                  :label="`Épreuve ${timeSlot.name}`"
                  label-placement="stacked"
                  value="Pas d'épreuve sélectionnée"
                />
                <IonSpinner v-if="formData.attendantGames.isUpdating" />
                <IonIcon
                  v-else-if="canEditGames"
                  slot="end"
                  :ios="pencilOutline"
                  :md="pencilSharp"
                  @click="editGames()"
                />
              </IonItem>
            </div>
          </div>

          <!-- email -->
          <IonItem v-if="canSeeEmail" lines="full">
            <IonInput
              v-if="userProfile"
              type="text"
              :readonly="true"
              inputmode="none"
              label="Adresse email"
              label-placement="stacked"
              :value="userProfile.email"
            />
            <p v-else class="field-error">
              Erreur: impossible de charger l'adresse email
            </p>
          </IonItem>
        </IonList>
        <IonGrid class="ion-no-padding ion-margin-top">
          <IonRow>
            <IonCol v-if="isOwnProfile" size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
              <IonButton expand="block" class="" color="warning" @click="logOut">
                Se déconnecter
              </IonButton>
            </IonCol>
            <IonCol v-if="canDeleteProfile" size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
              <IonButton expand="block" class="" color="danger" @click="removeAccount">
                Supprimer le compte
              </IonButton>
            </IonCol>
            <IonCol v-if="canResetOnboarding" size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
              <IonButton expand="block" class="" color="medium" @click="resetOnboarding">
                Reset onboarding
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCard>
    </IonContent>
  </IonPage>
</template>

<style scoped>
ion-select {
  width: 100%;
  max-width: 100%;
}
.field-error {
  color: var(--ion-color-danger);
  font-size: small;
  text-align: center;
  margin: auto auto;
}
ion-item ion-icon {
  align-self: center;
}
ion-item ion-spinner {
  align-self: center;
}
</style>
