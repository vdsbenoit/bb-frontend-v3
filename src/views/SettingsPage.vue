<template>
  <ion-page>
    <header-component page-title="Paramètres" />
    <ion-content :fullscreen="true" class="ion-padding">
      <refresher-component />
      <ion-card>
        <ion-card-header>
          <ion-card-title>Utilisateurs</ion-card-title>
        </ion-card-header>
        <ion-card-content class="ion-no-padding">
          <ion-list>
            <ion-item router-link="/new-users" router-direction="forward" button>
              <ion-label>Nouveaux utilisateurs</ion-label>
            </ion-item>
            <ion-item router-link="/login-users" router-direction="forward" button class="ion-text-wrap" lines="none">
              <ion-label>Utilisateurs récemment connectés</ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
      <ion-card>
        <ion-card-header>
          <ion-card-title>Paramètres généraux</ion-card-title>
        </ion-card-header>
        <ion-card-content class="ion-no-padding">
          <div v-if="isLoadingAppSettings" class="ion-text-center" style="background: transparent">
            <ion-spinner />
          </div>
          <div v-else-if="errorLoadingAppSettings" class="not-found">
            <strong class="capitalize">Erreur</strong>
            <ion-text color="error">
              Impossible de charger les paramètres
            </ion-text>
            <p>Retour à <a @click="router.back()">la page précédente</a></p>
          </div>
          <div v-else-if="!appSettings" class="not-found">
            <strong class="capitalize">Erreur</strong>
            <ion-text color="error">
              The app settings document is empty
            </ion-text>
            <p>Retour à <a @click="router.back()">la page précédente</a></p>
          </div>
          <ion-list v-else>
            <ion-item v-if="formData.maxGameAttendants.isEditting">
              <!-- todo add keyup event handler -->
              <ion-input
                slot="start"
                v-model="formData.maxGameAttendants.value"
                name="maxGameAttendants"
                type="number"
                autocorrect="off"
                label="Max animateurs par épreuve"
              />
              <ion-button slot="end" color="success" @click="setMaxAttendants">
                <ion-icon slot="icon-only" :ios="checkmarkOutline" :md="checkmarkSharp" />
              </ion-button>
            </ion-item>
            <ion-item v-else @click="formData.maxGameAttendants.isEditting = true">
              <ion-input
                slot="end"
                name="maxGameAttendants"
                type="number"
                :readonly="true"
                inputmode="none"
                label="Max animateurs par épreuve"
                :value="appSettings.maxGameAttendants"
              />
            </ion-item>
            <ion-item>
              <ion-label>Geler les scores</ion-label>
              <ion-toggle :checked="!appSettings.canSetScores" @ion-change="freezeScores" />
            </ion-item>
            <ion-item>
              <ion-label class="ion-text-wrap"> Rendre les classements publiques </ion-label>
              <ion-toggle :checked="appSettings.isRankingPublic" @ion-change="showRanking" />
            </ion-item>
            <ion-item>
              <ion-label class="ion-text-wrap"> Inscriptions aux épreuves </ion-label>
              <ion-toggle :checked="appSettings.isAttendantRegistrationOpen" @ion-change="setAttendantRegistration" />
            </ion-item>
            <ion-item>
              <ion-label class="ion-text-wrap"> Afficher la disponibilités des épreuves </ion-label>
              <ion-toggle :checked="appSettings.isGameAvailabilitiesDisplayed" @ion-change="setGameAvailabilites" />
            </ion-item>
            <ion-item lines="none">
              <ion-label class="ion-text-wrap">
                <h2>Autoriser l'enregistrement de scores partout</h2>
                <p>Ne pas tenir compte des inscriptions aux épreuves</p>
              </ion-label>
              <ion-toggle :checked="appSettings.canSetAnyScores" @ion-change="setCanSetAnyScores" />
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSpinner,
  IonText,
  IonToggle,
  useIonRouter,
} from '@ionic/vue'
import { checkmarkOutline, checkmarkSharp } from 'ionicons/icons'
import { reactive, watch } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppSettings } from '@/composables/app'
import { updateAppSettings } from '@/utils/app'
import { loadingPopup } from '@/utils/popup'

// reactive data

const formData = reactive({
  maxGameAttendants: {
    isEditting: false,
    value: 2,
  },
})

// Composables

const router = useIonRouter()
const { data: appSettings, pending: isLoadingAppSettings, error: errorLoadingAppSettings } = useAppSettings()
watch(errorLoadingAppSettings, (error) => {
  if (error) {
    console.error('Error loading app settings:', error)
  }
})
/**
 * Update formData with the current appSettings values
 * Does not update the form data if the user is editting the field
 */
function resetFormData() {
  if (!appSettings.value) return
  if (!formData.maxGameAttendants.isEditting) formData.maxGameAttendants.value = appSettings.value.maxGameAttendants
}
// Update the form data when the appSettings object is updated
watch(appSettings, (newAppSettings) => {
  if (newAppSettings) {
    resetFormData()
  }
})

// Methods

async function setMaxAttendants() {
  const loading = await loadingPopup()
  await updateAppSettings({ maxGameAttendants: formData.maxGameAttendants.value })
  formData.maxGameAttendants.isEditting = false
  await loading.dismiss()
}
async function freezeScores(event: any) {
  const loading = await loadingPopup()
  await updateAppSettings({ canSetScores: !event.detail.checked })
  await loading.dismiss()
}
async function showRanking(event: any) {
  const loading = await loadingPopup()
  await updateAppSettings({ isRankingPublic: event.detail.checked })
  await loading.dismiss()
}
async function setAttendantRegistration(event: any) {
  const loading = await loadingPopup()
  await updateAppSettings({ isAttendantRegistrationOpen: event.detail.checked })
  await loading.dismiss()
}
async function setGameAvailabilites(event: any) {
  const loading = await loadingPopup()
  await updateAppSettings({ isGameAvailabilitiesDisplayed: event.detail.checked })
  await loading.dismiss()
}
async function setCanSetAnyScores(event: any) {
  const loading = await loadingPopup()
  await updateAppSettings({ canSetAnyScores: event.detail.checked })
  await loading.dismiss()
}
</script>

<style scoped>
.fixedLabel {
  /* width: 100%; */
  min-width: 30% !important;
}
</style>
