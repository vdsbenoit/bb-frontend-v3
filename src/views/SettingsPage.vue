<script setup lang="ts">
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSpinner,
  IonText,
  IonToggle,
  useIonRouter,
} from '@ionic/vue'
import { addOutline, removeOutline } from 'ionicons/icons'
import { reactive, watch } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppSettings } from '@/composables/app'
import { updateAppSettings } from '@/utils/app'
import { loadingPopup } from '@/utils/popup'

// reactive data

const formData = reactive({
  maxGameAttendants: {
    value: 2,
    isUpdating: false,
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
 */
function resetFormData() {
  if (!appSettings.value) return
  formData.maxGameAttendants.value = appSettings.value.maxGameAttendants
}
// Update the form data when the appSettings object is updated
watch(appSettings, (newAppSettings) => {
  if (newAppSettings) {
    resetFormData()
  }
})

// Methods

async function updateMaxAttendants(step: number) {
  if (formData.maxGameAttendants.isUpdating || !appSettings.value) return
  const nextValue = Math.max(1, formData.maxGameAttendants.value + step)
  if (nextValue === formData.maxGameAttendants.value) return

  formData.maxGameAttendants.value = nextValue
  formData.maxGameAttendants.isUpdating = true
  try {
    await updateAppSettings({ maxGameAttendants: nextValue })
  } catch (error) {
    console.error('Error updating max game attendants:', error)
    resetFormData()
  } finally {
    formData.maxGameAttendants.isUpdating = false
  }
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
    <IonContent :fullscreen="true">
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
            <IonItem>
              <IonLabel>Max animateurs par épreuve</IonLabel>
              <div slot="end" class="stepper">
                <IonButton
                  fill="outline"
                  size="small"
                  color="medium"
                  :disabled="formData.maxGameAttendants.value <= 1 || formData.maxGameAttendants.isUpdating"
                  @click="updateMaxAttendants(-1)"
                >
                  <IonIcon slot="icon-only" :icon="removeOutline" />
                </IonButton>
                <div class="stepper-value">
                  {{ formData.maxGameAttendants.value }}
                </div>
                <IonButton
                  fill="outline"
                  size="small"
                  color="medium"
                  :disabled="formData.maxGameAttendants.isUpdating"
                  @click="updateMaxAttendants(1)"
                >
                  <IonIcon slot="icon-only" :icon="addOutline" />
                </IonButton>
              </div>
            </IonItem>
            <IonItem>
              <IonLabel>Geler les scores</IonLabel>
              <IonToggle slot="end" :checked="!appSettings.canSetScores" @ion-change="freezeScores" />
            </IonItem>
            <IonItem>
              <IonLabel class="ion-text-wrap"> Rendre les classements publiques </IonLabel>
              <IonToggle slot="end" :checked="appSettings.isRankingPublic" @ion-change="showRanking" />
            </IonItem>
            <IonItem>
              <IonLabel class="ion-text-wrap"> Inscriptions aux épreuves </IonLabel>
              <IonToggle
                slot="end"
                :checked="appSettings.isAttendantRegistrationOpen"
                @ion-change="setAttendantRegistration"
              />
            </IonItem>
            <IonItem>
              <IonLabel class="ion-text-wrap"> Afficher la disponibilités des épreuves </IonLabel>
              <IonToggle
                slot="end"
                :checked="appSettings.isGameAvailabilitiesDisplayed"
                @ion-change="setGameAvailabilites"
              />
            </IonItem>
            <IonItem lines="none">
              <IonLabel class="ion-text-wrap">
                <h2>Autoriser l'enregistrement de scores partout</h2>
                <p>Ne pas tenir compte des inscriptions aux épreuves</p>
              </IonLabel>
              <IonToggle slot="end" :checked="appSettings.canSetAnyScores" @ion-change="setCanSetAnyScores" />
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.stepper {
  display: inline-flex;
  gap: 8px;
}

.stepper-value {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-width: 2ch;
  padding: 0 4px;
}
</style>
