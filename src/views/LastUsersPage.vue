<script setup lang="ts">
import type { AlertInput } from '@ionic/vue'
import type { FirestoreError } from 'firebase/firestore'
import {
  alertController,
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSpinner,
  IonText,
} from '@ionic/vue'
import { settingsOutline, settingsSharp } from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useLastUsers } from '@/composables/userProfile'
import { toastPopup } from '@/utils/popup'
import { getRoleByValue, getUserName } from '@/utils/userProfile'

const props = defineProps({
  order: {
    'type': String,
    'default': 'new',
  },
})

const pageTitle = computed(() => {
  return props.order === 'new' ? 'Nouveaux utilisateurs' : 'Utilisateurs récemment connectés'
})

// reactive data
const limit = ref(15)

// Composables

const {
  data: latestUsers,
  pending: isLoadingUsers,
  error: errorLoadingUsers,
} = useLastUsers(limit, props.order === 'new' ? 'creationDate' : 'lastLogin')

// Watchers

watch(errorLoadingUsers, (error: FirestoreError | undefined) => {
  if (error) {
    void toastPopup('Erreur lors du chargement des utilisateurs')
    console.error(`Error loading users: ${error.message}`)
  }
})

// Methods

function parseDate(timestamp: any) {
  const date = timestamp.toDate()
  return date.toLocaleString('fr-BE')
}
/**
 * @description Set the number of users to display
 */
async function setLimit() {
  const inputs = [] as AlertInput[]
  const options = [15, 50, 100, 500]
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
    header: 'Afficher combien d\'utilisateurs ?',
    inputs,
    buttons: ['OK'],
  })
  await alert.present()
}
</script>

<template>
  <IonPage>
    <HeaderComponent :page-title="pageTitle">
      <IonButton @click="setLimit">
        <IonIcon slot="icon-only" :ios="settingsOutline" :md="settingsSharp" />
      </IonButton>
    </HeaderComponent>
    <IonContent :fullscreen="true">
      <RefresherComponent />
      <div v-if="isLoadingUsers" class="ion-text-center" style="background: transparent">
        <IonSpinner />
      </div>
      <div v-if="!latestUsers || latestUsers.length < 1" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">
          Pas d'utilisateurs
        </h2>
      </div>
      <IonList v-else>
        <div v-for="user in latestUsers" :key="user.id">
          <div>
            <IonItem>
              <IonLabel :router-link="`/profile/${user.id}`" router-direction="forward">
                <IonText>{{ getUserName(user) }} ({{ getRoleByValue(user.role) }}) </IonText>
                <p>{{ parseDate(user.creationDate) }}</p>
              </IonLabel>
            </IonItem>
          </div>
        </div>
      </IonList>
    </IonContent>
  </IonPage>
</template>

<style scoped></style>
