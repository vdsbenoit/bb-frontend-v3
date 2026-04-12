<script setup lang="ts">
import type { VueFireGame } from '@/types'
import {
  IonBadge,
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  isPlatform,
  useIonRouter,
} from '@ionic/vue'
import {
  arrowUpOutline,
  arrowUpSharp,
  checkmarkOutline,
  checkmarkSharp,
  closeOutline,
  closeSharp,
  pencilOutline,
  pencilSharp,
} from 'ionicons/icons'
import { computed, ref, watch } from 'vue'
import GameAvailabilities from '@/components/GameAvailabilities.vue'
import HeaderComponent from '@/components/HeaderComponent.vue'
import RefresherComponent from '@/components/RefresherComponent.vue'
import { useAppConfig, useAppSettings } from '@/composables/app'
import { useCircuitGames } from '@/composables/game'
import { useCanEditGames } from '@/composables/rights'
import { DEFAULT_CIRCUIT_VALUE, DEFAULT_GAME_ID } from '@/constants'
import { setGameName } from '@/utils/game'
import { toastPopup } from '@/utils/popup'

// reactive data
const editMode = ref(false)
const selectedCircuit = ref(DEFAULT_CIRCUIT_VALUE)
const editedGameId = ref(DEFAULT_GAME_ID)
const newGameName = ref('')
const isUpdating = ref(false)

// composables

const router = useIonRouter()
const { data: games, pending: isLoadingGames, error: errorLoadingGames } = useCircuitGames(selectedCircuit)
const { data: appConfig, pending: isLoadingAppConfig, error: errorLoadingConfig } = useAppConfig()
const appSettings = useAppSettings()
const canEditGames = useCanEditGames()

watch([errorLoadingGames, errorLoadingConfig], (errors) => {
  if (errors[0]) {
    console.error('Error loading games:', errors[0])
  }
  if (errors[1]) {
    console.error('Error loading app config:', errors[1])
  }
})

// Computed
const circuits = computed(() => {
  if (!appConfig.value) return undefined
  return appConfig.value.circuits
})
function getGroupCategoryName(circuitLetter: string) {
  if (!appConfig.value) return undefined
  if (!circuitLetter || circuitLetter === DEFAULT_CIRCUIT_VALUE) return undefined
  const groupCategoryId = appConfig.value.circuits[circuitLetter]
  return appConfig.value.groupCategories[groupCategoryId].name
}

const pageTitle = computed(() => {
  if (editMode.value) return `Modification des épreuves`
  return 'Épreuves'
})
const showGameAvailabilities = computed(() => {
  if (!appSettings.value) return false
  return appSettings.value.isGameAvailabilitiesDisplayed
})

// Methods

function toggleEditMode() {
  editMode.value = !editMode.value
}
function goToGamePage(gameId: string) {
  if (!editMode.value) router.push(`/game/${gameId}`)
}
function editGame(game: VueFireGame) {
  newGameName.value = game.name
  editedGameId.value = game.id
}
function clearEdition() {
  newGameName.value = ''
  editedGameId.value = DEFAULT_GAME_ID
}
async function updateGameName() {
  isUpdating.value = true
  await setGameName(editedGameId.value, newGameName.value)
  void toastPopup('Le nom du jeu a bien été mis à jour')
  isUpdating.value = false
  clearEdition()
}
</script>

<template>
  <IonPage>
    <HeaderComponent :page-title="pageTitle">
      <IonButton v-if="canEditGames" @click="toggleEditMode">
        <IonLabel v-if="isPlatform('ios')" color="primary">
          {{ editMode ? 'done' : 'edit' }}
        </IonLabel>
        <IonIcon v-else slot="icon-only" :icon="editMode ? closeSharp : pencilSharp" />
      </IonButton>
    </HeaderComponent>
    <IonContent :fullscreen="true">
      <RefresherComponent />
      <IonItem color="primary">
        <IonSpinner v-if="isLoadingAppConfig" />
        <IonSelect
          v-else-if="circuits"
          v-model="selectedCircuit"
          interface="popover"
          placeholder="Sélectionne un circuit"
        >
          <IonSelectOption v-for="letter in Object.keys(circuits).sort()" :key="letter" :value="letter">
            {{ letter }} - {{ getGroupCategoryName(letter) }}
          </IonSelectOption>
        </IonSelect>
        <div v-else-if="errorLoadingConfig">
          Erreur
        </div>
        <div v-else>
          Pas de circuit
        </div>
      </IonItem>
      <div v-if="!selectedCircuit" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">
          Sélectionne un circuit <IonIcon :ios="arrowUpOutline" :md="arrowUpSharp" />
        </h2>
      </div>
      <div v-else>
        <div v-if="isLoadingGames" class="ion-text-center" style="background: transparent">
          <IonSpinner />
        </div>
        <div v-else-if="errorLoadingGames" class="not-found">
          <strong class="capitalize">Erreur</strong>
          <IonText color="error">
            Impossible de charger les jeux
          </IonText>
        </div>
        <IonList v-else-if="games && games.length > 0" lines="full">
          <div v-for="game in games" :key="game.id">
            <div v-if="editMode">
              <div v-if="game.id === editedGameId && !isUpdating">
                <IonItem>
                  <IonBadge slot="start" class="ion-no-margin ion-margin-end" color="medium">
                    {{ game.id }}
                  </IonBadge>
                  <IonInput
                    v-model="newGameName"
                    type="text"
                    label="Nom de l'épreuve"
                    @keyup.enter="updateGameName()"
                  />
                  <IonButton color="success" @click="updateGameName()">
                    <IonIcon slot="icon-only" :ios="checkmarkOutline" :md="checkmarkSharp" />
                  </IonButton>
                  <IonButton color="danger" @click="clearEdition()">
                    <IonIcon slot="icon-only" :ios="closeOutline" :md="closeSharp" />
                  </IonButton>
                </IonItem>
              </div>
              <div v-else>
                <IonItem>
                  <IonBadge slot="start" class="ion-no-margin ion-margin-end" color="medium">
                    {{ game.id }}
                  </IonBadge>
                  <IonInput type="text" :readonly="true" label="Nom de l'épreuve" :value="game.name" />
                  <IonSpinner v-if="isUpdating && game.id === editedGameId" slot="end" />
                  <IonIcon v-else slot="end" :ios="pencilOutline" :md="pencilSharp" @click="editGame(game)" />
                </IonItem>
              </div>
            </div>
            <div v-else>
              <IonItem @click="goToGamePage(game.id)">
                <IonBadge slot="start" class="ion-no-margin ion-margin-end" color="medium">
                  {{ game.id }}
                </IonBadge>
                <IonLabel>
                  <IonText>{{ game.name }}</IonText>
                </IonLabel>
                <GameAvailabilities v-if="showGameAvailabilities" :game="game" />
              </IonItem>
            </div>
          </div>
        </IonList>
        <div v-else class="not-found">
          <h2 class="ion-text-center ion-align-items-center">
            Pas d'épreuves
          </h2>
        </div>
      </div>
    </IonContent>
  </IonPage>
</template>

<style scoped>
.item-no-padding {
  --padding-start: 0px;
  --padding-end: 0px;
  --inner-padding-start: 0px;
  --inner-padding-end: 0px;
}
ion-select {
  display: block;
  width: min(100%, 320px);
  margin-inline: auto;
  text-align: center;
  --placeholder-opacity: 1;
}

ion-select::part(wrapper),
ion-select::part(inner),
ion-select::part(container) {
  justify-content: center;
}

ion-select::part(placeholder) {
  text-align: center;
  width: 100%;
}

ion-select::part(icon) {
  position: absolute;
  right: 0;
}
</style>
