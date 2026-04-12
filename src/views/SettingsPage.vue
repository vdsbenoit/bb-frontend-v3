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

<template>
  <IonPage>
    <HeaderComponent page-title="Paramètres" />
    <IonContent :fullscreen="true" class="ion-padding">
      <RefresherComponent />
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Utilisateurs</IonCardTitle>
        </IonCardHeader>
        <IonCardContent class="ion-no-padding">
          <IonList>
            <IonItem router-link="/new-users" router-direction="forward" button>
              <IonLabel>Nouveaux utilisateurs</IonLabel>
            </IonItem>
            <IonItem router-link="/login-users" router-direction="forward" button class="ion-text-wrap" lines="none">
              <IonLabel>Utilisateurs récemment connectés</IonLabel>
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Paramètres généraux</IonCardTitle>
        </IonCardHeader>
        <IonCardContent class="ion-no-padding">
          <div v-if="isLoadingAppSettings" class="ion-text-center" style="background: transparent">
            <IonSpinner />
          </div>
          <div v-else-if="errorLoadingAppSettings" class="not-found">
            <strong class="capitalize">Erreur</strong>
            <IonText color="error">
              Impossible de charger les paramètres
            </IonText>
            <p>Retour à <a @click="router.back()">la page précédente</a></p>
          </div>
          <div v-else-if="!appSettings" class="not-found">
            <strong class="capitalize">Erreur</strong>
            <IonText color="error">
              The app settings document is empty
            </IonText>
            <p>Retour à <a @click="router.back()">la page précédente</a></p>
          </div>
          <IonList v-else>
            <IonItem v-if="formData.maxGameAttendants.isEditting">
              <!-- todo add keyup event handler -->
              <IonInput
                slot="start"
                v-model="formData.maxGameAttendants.value"
                name="maxGameAttendants"
                type="number"
                autocorrect="off"
                label="Max animateurs par épreuve"
              />
              <IonButton slot="end" color="success" @click="setMaxAttendants">
                <IonIcon slot="icon-only" :ios="checkmarkOutline" :md="checkmarkSharp" />
              </IonButton>
            </IonItem>
            <IonItem v-else @click="formData.maxGameAttendants.isEditting = true">
              <IonInput
                slot="end"
                name="maxGameAttendants"
                type="number"
                :readonly="true"
                inputmode="none"
                label="Max animateurs par épreuve"
                :value="appSettings.maxGameAttendants"
              />
            </IonItem>
            <IonItem>
              <IonLabel>Geler les scores</IonLabel>
              <IonToggle :checked="!appSettings.canSetScores" @ion-change="freezeScores" />
            </IonItem>
            <IonItem>
              <IonLabel class="ion-text-wrap"> Rendre les classements publiques </IonLabel>
              <IonToggle :checked="appSettings.isRankingPublic" @ion-change="showRanking" />
            </IonItem>
            <IonItem>
              <IonLabel class="ion-text-wrap"> Inscriptions aux épreuves </IonLabel>
              <IonToggle :checked="appSettings.isAttendantRegistrationOpen" @ion-change="setAttendantRegistration" />
            </IonItem>
            <IonItem>
              <IonLabel class="ion-text-wrap"> Afficher la disponibilités des épreuves </IonLabel>
              <IonToggle :checked="appSettings.isGameAvailabilitiesDisplayed" @ion-change="setGameAvailabilites" />
            </IonItem>
            <IonItem lines="none">
              <IonLabel class="ion-text-wrap">
                <h2>Autoriser l'enregistrement de scores partout</h2>
                <p>Ne pas tenir compte des inscriptions aux épreuves</p>
              </IonLabel>
              <IonToggle :checked="appSettings.canSetAnyScores" @ion-change="setCanSetAnyScores" />
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.fixedLabel {
  /* width: 100%; */
  min-width: 30% !important;
}
</style>
