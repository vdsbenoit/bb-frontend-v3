<template>
  <ion-page>
    <header-component page-title="Accueil" />
    <ion-content :fullscreen="true">
      <refresher-component />
      <div class="homepage-logo">
        <img src="@/assets/img/logo-bb.png" alt="Logo Baden Battle">
      </div>
      <info-card-component v-if="showPendingRequestInfo" class="ion-margin-horizontal">
        Ton inscription est en attente de validation par un•e {{ requestValidator }}. N'hésite pas à les contacter pour
        accélérer ta demande.
      </info-card-component>
      <ion-grid v-if="userProfile" class="home-grid">
        <!-- animateur -->
        <ion-row v-if="userProfile.role === USER_ROLES.Animateur || userProfile.role === USER_ROLES.Chef">
          <ion-col v-for="timeSlot in attendantSchedule" :key="timeSlot.id" size="6" size-sm="4" size-lg="2">
            <tile-col
              v-if="userProfile.games && userProfile.games[timeSlot.id]"
              size="12"
              :target="`/game/${userProfile.games[timeSlot.id].id}`"
            >
              Mon épreuve ({{ timeSlot.name }})
            </tile-col>
            <tile-col v-else-if="appSettings && appSettings.isAttendantRegistrationOpen" size="12" target="/games">
              Inscris-toi à une épreuve ({{ timeSlot.name }})
            </tile-col>
          </ion-col>
        </ion-row>
        <ion-row>
          <!-- participant -->
          <tile-col v-if="showSelectTeam" :target="`/player-group/${userProfile.groupId}`">
            Choisis une équipe
          </tile-col>
          <tile-col v-if="showMyGroupButton" :target="`/player-group/${userProfile.groupId}`">
            Ma section
          </tile-col>
          <tile-col v-if="userProfile.teamId" :target="`/team/${userProfile.teamId}`">
            Mon équipe
          </tile-col>

          <!-- >= chef -->
          <tile-col v-if="nbApplicants" target="/applicants">
            {{ nbApplicants }} demande{{ typeof nbApplicants == 'string' || nbApplicants > 1 ? 's' : '' }} d'accès
          </tile-col>

          <!-- chef -->
          <tile-col v-if="showRegisterAttendants" :target="`/attendant-group/${userProfile.groupId}`">
            Inscris tes animés à des épreuves
          </tile-col>

          <!-- animateur -->
          <tile-col
            v-if="userProfile.role >= USER_ROLES.Animateur && userProfile.groupId"
            :target="`/attendant-group/${userProfile.groupId}`"
          >
            Ma section
          </tile-col>
          <!-- organisateur -->
          <tile-col v-if="userProfile.role >= USER_ROLES.Organisateur" target="/attendant-group">
            Animateurs
          </tile-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonCol, IonContent, IonGrid, IonPage, IonRow } from '@ionic/vue'
import { computed } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import InfoCardComponent from '@/components/InfoCardComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import TileCol from '@/components/TileCol.vue'
import { useAppConfig, useAppSettings } from '@/composables/app'
import { useApplicants, useCurrentUserProfile } from '@/composables/userProfile'
import { USER_ROLES } from '@/constants'

// Composables

const userProfile = useCurrentUserProfile()
const appSettings = useAppSettings()
const appConfig = useAppConfig()
const applicants = useApplicants(15)

// Computed vars
const attendantSchedule = computed(() => appConfig.value?.attendantSchedule ?? [])
const showPendingRequestInfo = computed(() => {
  if (!userProfile.value) return false
  return userProfile.value.role === USER_ROLES.Newbie && userProfile.value.hasDoneOnboarding
})
const showSelectTeam = computed(() => {
  if (!userProfile.value) return false
  return userProfile.value.role === USER_ROLES.Participant && !userProfile.value.teamId
})
const showMyGroupButton = computed(() => {
  if (!userProfile.value) return false
  return userProfile.value.role === USER_ROLES.Participant && userProfile.value.groupId
})
const showRegisterAttendants = computed(() => {
  if (!userProfile.value) return false
  if (!appSettings.value || !appSettings.value.isAttendantRegistrationOpen) return false
  return userProfile.value.role === USER_ROLES.Chef
})
const nbApplicants = computed(() => {
  if (!applicants.value) return 0
  return applicants.value.length <= 15 ? applicants.value.length : '15+'
})
const requestValidator = computed(() => {
  if (!userProfile.value) return ''
  switch (userProfile.value.requestedRole) {
    case USER_ROLES.Animateur:
    case USER_ROLES.Chef:
      return 'chef•fe de ta section'
    case USER_ROLES.Organisateur:
      return 'orga de la Baden Battle'
    case USER_ROLES.Administrateur:
      return 'admin de l\'app'
    default:
      return ''
  }
})
</script>

<style scoped>
.container {
  text-align: center;
}
h1 {
  color: var(--ion-color-primary);
  font-size: 40px;
}
p {
  line-height: 30px;
}
</style>
