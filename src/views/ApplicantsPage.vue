<template>
  <ion-page>
    <header-component page-title="Demandes d'accès">
      <ion-button @click="setLimit">
        <ion-icon slot="icon-only" :ios="settingsOutline" :md="settingsSharp" />
      </ion-button>
    </header-component>
    <ion-content :fullscreen="true">
      <refresher-component />
      <!-- Show applicants from all attendant groups to moderators -->
      <div v-if="canSeeModerationStuff">
        <div v-if="isLoadingAttendantGroups" class="not-found" style="background: transparent">
          <ion-spinner />
        </div>
        <div v-else-if="errorLoadingAttendantGroups" class="not-found">
          <strong class="capitalize">Erreur</strong>
          <ion-text color="error">
            Impossible de charger les sections
          </ion-text>
        </div>
        <applicant-card
          v-for="attendantgroup in attendantGroups"
          v-else
          :key="attendantgroup.id"
          :attendant-group-id="attendantgroup.id"
          :attendant-group-name="attendantgroup.name"
          :attendant-group-city="attendantgroup.city"
          :limit="limit"
          @has-applicants="(hasApplicants: boolean) => countCardsWithApplicants += hasApplicants ? 1 : -1"
        />
      </div>
      <!-- Show applicants from the current user group to leaders -->
      <div v-else>
        <div v-if="isLoadingCurrentUserData" class="not-found" style="background: transparent">
          <ion-spinner />
        </div>
        <div v-else-if="errorCurrentUserData" class="not-found">
          <strong class="capitalize">Erreur lors du chargement des données</strong>
        </div>
        <applicant-card
          v-else-if="currentUserAttendantGroup"
          :attendant-group-id="currentUserGroupId"
          :attendant-group-name="currentUserAttendantGroup.name"
          :attendant-group-city="currentUserAttendantGroup.city"
          :limit="limit"
          @has-applicants="(v:boolean) => hasApplicantsCurrentUserGroup = v"
        />
        <div v-else class="not-found">
          <h2 class="ion-text-center ion-align-items-center">
            Erreur lors de chargement de ta section
          </h2>
        </div>
      </div>
      <div v-if="isNoApplicants" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">
          Pas de demandes d'accès
        </h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import type { AlertInput } from '@ionic/vue'
import { alertController, IonButton, IonContent, IonIcon, IonPage, IonSpinner, IonText } from '@ionic/vue'
import { settingsOutline, settingsSharp } from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import ApplicantCard from '@/components/ApplicantCard.vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAttendantGroup, useAttendantGroups } from '@/composables/attendantGroup'
import { useCanSeeModerationStuff } from '@/composables/rights'
import { useCurrentUserProfile } from '@/composables/userProfile'
import { DEFAULT_GROUP_ID } from '@/constants'

// reactive data

const limit = ref(5)
const countCardsWithApplicants = ref(0)
const hasApplicantsCurrentUserGroup = ref(true)
const isNoApplicants = computed(() => {
  return countCardsWithApplicants.value === 0 && !hasApplicantsCurrentUserGroup.value
})

// composables

const canSeeModerationStuff = useCanSeeModerationStuff()
const { data: currentUser, pending: isLoadingCurrentUser, error: errorLoadingCurrentUser } = useCurrentUserProfile()
const {
  data: attendantGroups,
  pending: isLoadingAttendantGroups,
  error: errorLoadingAttendantGroups,
} = useAttendantGroups(canSeeModerationStuff, 'include', true, currentUser)
const currentUserGroupId = computed(() => {
  if (!currentUser.value || !currentUser.value.groupId) return DEFAULT_GROUP_ID
  return currentUser.value.groupId
})
const {
  data: currentUserAttendantGroup,
  pending: isLoadingCurrentUserAttendantGroup,
  error: errorLoadingCurrentUserAttendantGroup,
} = useAttendantGroup(currentUserGroupId)

watch([errorLoadingAttendantGroups, errorLoadingCurrentUser, errorLoadingCurrentUserAttendantGroup], (errors) => {
  if (errors[0]) {
    console.error('Error loading attendant groups:', errors[0])
  }
  if (errors[1]) {
    console.error('Error loading current user data:', errors[1])
  }
  if (errors[2]) {
    console.error('Error loading current user attendant group:', errors[2])
  }
})

// Computed

const isLoadingCurrentUserData = computed(() => isLoadingCurrentUser.value || isLoadingCurrentUserAttendantGroup.value)
const errorCurrentUserData = computed(
  () => errorLoadingCurrentUser.value ?? errorLoadingCurrentUserAttendantGroup.value,
)

// Methods

/**
 * @description Set the number of users to display
 */
async function setLimit() {
  const inputs = [] as AlertInput[]
  const options = [5, 10, 25]
  options.forEach((option: number) => {
    inputs.push({
      type: 'radio',
      label: option.toString(),
      value: option,
      handler: () => {
        limit.value = option
      },
      checked: option === limit.value,
    })
  })
  const alert = await alertController.create({
    header: 'Afficher combien d\'utilisateurs par section ?',
    inputs,
    buttons: ['OK'],
  })
  await alert.present()
}
</script>

<style scoped></style>
