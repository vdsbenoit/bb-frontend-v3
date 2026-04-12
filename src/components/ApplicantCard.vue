<template>
  <ion-card v-if="isLoadingApplicants || errorLoadingApplicants || applicants.length > 0">
    <ion-card-header>
      <ion-card-title>{{ attendantGroupName }} ({{ attendantGroupCity }})</ion-card-title>
    </ion-card-header>
    <ion-card-content class="ion-no-padding ion-padding-vertical">
      <div v-if="isLoadingApplicants" class="not-found" style="background: transparent">
        <ion-spinner />
      </div>
      <div v-else-if="errorLoadingApplicants" class="not-found">
        <strong class="capitalize">Erreur</strong>
        <ion-text color="error">
          Impossible de charger les candidats
        </ion-text>
      </div>
      <ion-list lines="full">
        <ion-item v-for="applicant in applicants" :key="applicant.id" @click="handleRequest(applicant)">
          <ion-label>
            <ion-text style="font-weight: bold">
              {{ applicant.name }}
            </ion-text>
            <ion-text>&nbsp;{{ applicant.email }}</ion-text>
          </ion-label>
          <ion-badge slot="end" :color="badgeColor(applicant)">
            {{ getRoleByValue(applicant.requestedRole ?? -1) }}
          </ion-badge>
        </ion-item>
      </ion-list>
    </ion-card-content>
  </ion-card>
</template>

<script lang="ts" setup>
import type { VueFireUserProfile } from '@/types'
import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonText,
} from '@ionic/vue'
import { defineEmits, defineProps, watch } from 'vue'
import { useCurrentUserProfile, useGroupApplicants } from '@/composables/userProfile'
import { DEFAULT_USER_ROLE_VALUE, USER_ROLES } from '@/constants'
import { choicePopup, errorPopup, textInputPopup } from '@/utils/popup'
import { getRoleByValue, getUserName, updateUserProfile } from '@/utils/userProfile'

const props = defineProps<{
  attendantGroupId: string
  attendantGroupName: string
  attendantGroupCity: string
  limit: number
}>()
const emit = defineEmits(['hasApplicants'])

// composables

const currentUser = useCurrentUserProfile()
const {
  data: applicants,
  pending: isLoadingApplicants,
  error: errorLoadingApplicants,
} = useGroupApplicants(props.limit, props.attendantGroupId)

// watchers

watch(applicants, (newApplicants) => {
  if (newApplicants && newApplicants.length < 1 && !errorLoadingApplicants.value) {
    emit('hasApplicants', false)
  } else {
    emit('hasApplicants', true)
  }
})

// methods

/**
 * Returns the color of the badge based on the user's requested role.
 *
 * @param {VueFireUserProfile} user - The user object.
 * @returns {string} - The Ionic color of the badge.
 */
function badgeColor(user: VueFireUserProfile) {
  switch (user.requestedRole) {
    case USER_ROLES.Animateur:
      return 'success'
    case USER_ROLES.Chef:
      return 'primary'
    case USER_ROLES.Organisateur:
      return 'warning'
    case USER_ROLES.Administrateur:
      return 'danger'
    default:
      return 'medium'
  }
}

/**
 * Handles the request for an applicant.
 *
 * @param {VueFireUserProfile} applicant - The applicant's profile.
 *
 * This function performs the following steps:
 * 1. Checks if the current user is available. If not, displays an error popup.
 * 2. Checks if the applicant's requested role is defined. If not, displays an error popup.
 * 3. Constructs a message based on the applicant's requested role.
 * 4. Displays an error popup if the role does not exist.
 * 5. Defines choices for the popup and a reason message for rejection.
 * 6. Defines handlers for accepting and rejecting the request.
 * 7. Displays a choice popup with the constructed message and handles the user's choice.
 *
 * @param applicant - The applicant object.
 */

function handleRequest(applicant: VueFireUserProfile) {
  if (!currentUser.value) {
    errorPopup('Impossible de récupérer les informations de l\'utilisateur actuel')
    return
  }
  if (!applicant.requestedRole) {
    errorPopup(`requestedRole n'est pas défini pour ${getUserName(applicant)}`)
    return
  }
  let message = ''
  if (applicant.requestedRole === USER_ROLES.Animateur || applicant.requestedRole === USER_ROLES.Chef) {
    message = `Veux-tu ajouter ${getUserName(applicant)}
    comme <b>${getRoleByValue(applicant.requestedRole)}</b> de la section ${props.attendantGroupName}.`
  }
  if (applicant.requestedRole >= USER_ROLES.Organisateur) {
    message = `Veux-tu ajouter ${getUserName(applicant)}
    comme <b>${getRoleByValue(applicant.requestedRole)}</b> de la Baden Battle.`
  }
  if (!message) {
    errorPopup(`Ce rôle n'existe pas (${applicant.requestedRole})`)
    return
  }
  const choices = ['Accepter', 'Refuser', 'Annuler']
  const reasonMessage = `Pourquoi refuse-tu la demande de ${getUserName(applicant)} ?`
  const acceptHandler = () => {
    updateUserProfile(applicant.id, {
      role: applicant.requestedRole,
      groupId: applicant.requestedGroupId,
      groupName: applicant.requestedGroupName,
      requestedRole: DEFAULT_USER_ROLE_VALUE,
      requestedGroupId: '',
      rejectionReason: '',
    })
  }
  const rejectHandler = (reason: string) => {
    const fullReason = `${getUserName(currentUser)} (${getRoleByValue(currentUser.value?.role ?? -1)}) dit : ${reason}`
    updateUserProfile(applicant.id, {
      requestedRole: -1,
      requestedGroupId: '',
      rejectionReason: fullReason,
      hasDoneOnboarding: false,
    })
  }
  const choicePopupHandler = (choice: string) => {
    switch (choice) {
      case 'Accepter':
        acceptHandler()
        break
      case 'Refuser':
        textInputPopup(reasonMessage, rejectHandler, 'Raison', 'Brève explication')
        break
      default:
        break
    }
  }
  choicePopup('Continuer?', choices, choicePopupHandler, '', message)
}
</script>

<style scoped></style>
