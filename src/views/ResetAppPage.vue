<script setup lang="ts">
import type { ResetAppRequest } from '@/services/resetApi'
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCheckbox,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  useIonRouter,
} from '@ionic/vue'
import { computed, reactive, ref, watch } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { requestAppReset } from '@/services/resetApi'
import { confirmPopup, errorPopup, loadingPopup } from '@/utils/popup'

const router = useIonRouter()

const formData = reactive({
  gamesAndPlayers: false,
  registrations: false,
  attendantGroups: false,
  staffGroups: false,
  allUsers: false,
})
const isSubmitting = ref(false)

watch(() => formData.attendantGroups, (isSelected) => {
  if (!isSelected) {
    formData.staffGroups = false
  }
})

const areAllSelected = computed({
  get() {
    return [
      formData.gamesAndPlayers,
      formData.registrations,
      formData.attendantGroups,
      formData.staffGroups,
      formData.allUsers,
    ].every(Boolean)
  },
  set(value: boolean) {
    formData.gamesAndPlayers = value
    formData.registrations = value
    formData.attendantGroups = value
    formData.staffGroups = value
    formData.allUsers = value
  },
})

const canSubmit = computed(() => {
  if (isSubmitting.value) return false
  return [
    formData.gamesAndPlayers,
    formData.registrations,
    formData.attendantGroups,
    formData.staffGroups,
    formData.allUsers,
  ].some(Boolean)
})

function buildPayload(): ResetAppRequest {
  return {
    version: 1,
    gamesAndPlayers: formData.gamesAndPlayers,
    registrations: formData.registrations,
    attendantGroups: formData.attendantGroups,
    staffGroups: formData.staffGroups,
    allUsers: formData.allUsers,
  }
}

async function executeReset() {
  if (!canSubmit.value) return

  isSubmitting.value = true
  const loading = await loadingPopup('Suppression en cours...')

  try {
    const payload = buildPayload()
    await requestAppReset(payload)
    await loading.dismiss()
    router.push('/configuration')
  } catch (error: any) {
    await loading.dismiss()
    void errorPopup(error?.message ?? 'La suppression a échoué')
  } finally {
    isSubmitting.value = false
  }
}

function submitResetRequest() {
  if (!canSubmit.value) return

  const message = [
    'Tu es sur le point de lancer une réinitialisation.',
    'Cette action est destructive.',
  ].join('\n\n')

  void confirmPopup(message, () => {
    void executeReset()
  }, undefined, 'Es tu sûr•e ?')
}
</script>

<template>
  <IonPage>
    <HeaderComponent page-title="Réinitialisation" />
    <IonContent :fullscreen="true">
      <RefresherComponent />
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Que supprimer</IonCardTitle>
        </IonCardHeader>
        <IonCardContent class="ion-no-padding ion-padding-vertical">
          <IonList lines="none">
            <IonItem lines="full">
              <IonCheckbox slot="start" v-model="areAllSelected" />
              <IonLabel>Tout sélectionner</IonLabel>
            </IonItem>

            <IonItem>
              <IonCheckbox slot="start" v-model="formData.gamesAndPlayers" />
              <IonLabel>Jeux & joueurs</IonLabel>
            </IonItem>

            <IonItem>
              <IonCheckbox slot="start" v-model="formData.registrations" />
              <IonLabel>Inscriptions aux jeux</IonLabel>
            </IonItem>

            <IonItem>
              <IonCheckbox slot="start" v-model="formData.attendantGroups" />
              <IonLabel>Groupes d'animateurs</IonLabel>
            </IonItem>

            <IonItem v-if="formData.attendantGroups">
              <IonCheckbox
                slot="start"
                v-model="formData.staffGroups"
                :disabled="!formData.attendantGroups"
              />
              <IonLabel>
                Groupes staff
                <p> Par ex. Team BB </p>
              </IonLabel>
            </IonItem>

            <IonItem lines="none">
              <IonCheckbox slot="start" v-model="formData.allUsers" />
              <IonLabel>Tous les utilisateurs</IonLabel>
            </IonItem>
          </IonList>
          <IonButton
            expand="block"
            color="danger"
            :disabled="!canSubmit"
            class="ion-margin"
            @click="submitResetRequest"
          >
            Lancer la réinitialisation
          </IonButton>
          <IonText v-if="!canSubmit" color="medium" class="ion-text-center">
            <p>Coche au moins une option à supprimer.</p>
          </IonText>
        </IonCardContent>
      </IonCard>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.field-hint {
  display: block;
  margin-top: 2px;
  font-size: 12px;
}
</style>
