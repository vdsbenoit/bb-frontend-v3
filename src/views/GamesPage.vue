<template>
  <ion-page>
    <header-template :pageTitle="pageTitle">
      <ion-button v-if="canEditGames" @click="toggleEditMode">
        <ion-label v-if="isPlatform('ios')" color="primary">{{ editMode ? "done" : "edit" }}</ion-label>
        <ion-icon v-else slot="icon-only" :icon="editMode ? closeSharp : pencilSharp"></ion-icon>
      </ion-button>
    </header-template>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <ion-item color="primary">
        <ion-label class="ion-text-center">Sélectionne un circuit</ion-label>
        <ion-spinner v-if="isLoadingAppConfig"></ion-spinner>
        <ion-select v-else-if="circuits" v-model="selectedCircuit" interface="popover">
          <ion-select-option v-for="letter in Object.keys(circuits).sort()" :value="letter" :key="letter"> {{ letter }} ({{ circuits[letter] }})</ion-select-option>
        </ion-select>
        <div v-else-if="errorLoadingConfig">Erreur</div>
        <div v-else>Pas de circuit</div>
      </ion-item>
      <ion-list v-if="selectedCircuit" lines="full">
        <div v-if="isLoadingGames" class="ion-text-center" style="background: transparent">
          <ion-spinner></ion-spinner>
        </div>
        <div v-else-if="games && games.length > 0">
          <div v-for="game in games" :key="game.id">
            <div v-if="editMode">
              <div v-if="game.id === editedGameId && !isUpdating">
                <ion-item>
                  <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ game.id }}</ion-badge>
                  <ion-input type="text" v-model="newGameName" v-on:keyup.enter="updateGameName()"></ion-input>
                  <ion-button @click="updateGameName()" color="success"><ion-icon slot="icon-only" :ios="checkmarkOutline" :md="checkmarkSharp"></ion-icon></ion-button>
                  <ion-button @click="clearEdition()" color="danger"><ion-icon slot="icon-only" :ios="closeOutline" :md="closeSharp"></ion-icon></ion-button>
                </ion-item>
              </div>
              <div v-else>
                <ion-item>
                  <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ game.id }}</ion-badge>
                  <ion-input type="text" :readonly="true" >{{ game.name }}</ion-input>
                  <ion-spinner v-if="isUpdating && game.id === editedGameId" slot="end"></ion-spinner>
                  <ion-icon v-else @click="editGame(game)" slot="end" :ios="pencilOutline" :md="pencilSharp"></ion-icon>
                </ion-item>
              </div>
            </div>
            <div v-else>
              <ion-item @click="goToGamePage(game.id)">
                <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ game.id }}</ion-badge>
                <ion-label>
                  <ion-text>{{ game.name }}</ion-text>
                </ion-label>
                <div v-if="showGameAvailabilities">
                  <div v-for="availability in getAvailabilities(game)" :key="availability.text">
                    <ion-badge slot="end" class="ion-no-margin" :color="availability.color">{{ availability.text }}</ion-badge>
                  </div>
                </div>
              </ion-item>
            </div>
          </div>
        </div>
      </ion-list>
      <div v-else class="not-found">
        <h2 class="ion-text-center ion-align-items-center" >Sélectionne un circuit <ion-icon :ios="arrowUpOutline" :md="arrowUpSharp"></ion-icon></h2>
      </div>
      <div v-if="gamesNotFound" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">Pas d'épreuves</h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { useCircuitGames } from "@/composables/games";
import { useCanEditGames } from "@/composables/rights";
import { useAppConfig, useAppSettings } from "@/composables/settings";
import { DEFAULT_CIRCUIT_VALUE, DEFAULT_GAME_ID } from "@/constants";
import { toastPopup } from "@/services/popup";
import { VueFireGame } from "@/types";
import { setGameName } from "@/utils/game";
import { IonBadge, IonButton, IonContent, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonSelect, IonSelectOption, IonSpinner, IonText, isPlatform, useIonRouter } from "@ionic/vue";
import { computed, ref } from "@vue/reactivity";
import { arrowUpOutline, arrowUpSharp, checkmarkOutline, checkmarkSharp, closeOutline, closeSharp, pencilOutline, pencilSharp } from "ionicons/icons";
import { watch } from "vue";

// reactive data
const editMode = ref(false);
const selectedCircuit = ref(DEFAULT_CIRCUIT_VALUE);
const editedGameId = ref(DEFAULT_GAME_ID);
const newGameName = ref("");
const isUpdating = ref(false);

// composables

const router = useIonRouter()
const { data: games, pending: isLoadingGames, error: errorLoadingGames } = useCircuitGames(selectedCircuit)
const { data: appConfig, pending: isLoadingAppConfig, error: errorLoadingConfig } = useAppConfig()
const appSettings = useAppSettings()
const canEditGames = useCanEditGames()

// Computed
const circuits = computed(() => {
  if (!appConfig.value) return []
  return appConfig.value.circuits
});
const pageTitle = computed(() => {
  if (editMode.value) return `Édition des épreuves`;
  return "Épreuves";
});
const editIcon = computed(() => {
  return (editMode.value) ? closeSharp : pencilSharp
});
const gamesNotFound = computed(() => {
  if (errorLoadingGames) return true
  return selectedCircuit.value && !isLoadingGames.value && (!games.value || games.value.length === 0);
})
const showGameAvailabilities = computed(() => {
  return appSettings.value?.showGameAvailabilities
})
const attendantTimings = computed(() => {
  if (!appConfig.value) return []
  return appConfig.value.attendantTimings.filter(timing => timing.isGame)

})

// Methods

const getAvailabilities = (game: VueFireGame) => {
  const maxGameLeaders = appSettings.value?.maxGameLeaders ?? 2
  const availabilities = []
  for (const timing of attendantTimings.value){
    const nbAttendants = game.attendants.filter(attendant => attendant.timingId === timing.id).length
    const text = timing.name + ' ' + nbAttendants
    let color = "success"
    if (nbAttendants === 0) color = "danger"
    if (nbAttendants < maxGameLeaders) color = "warning"
    availabilities.push({ text, color })
  }
  return availabilities
}
const toggleEditMode = () => {
  editMode.value = !editMode.value;
}
const goToGamePage = (gameId: string) => {
  if (!editMode.value) router.push(`/game/${gameId}`);
}
const editGame = (game: VueFireGame) => {
  newGameName.value = game.name
  editedGameId.value = game.id
}
const clearEdition = () => {
  newGameName.value = "";
  editedGameId.value = DEFAULT_GAME_ID;  
}
const updateGameName = async () => {
  isUpdating.value = true;
  await setGameName(editedGameId.value, newGameName.value);
  toastPopup("Le nom du jeu a bien été mis à jour");
  isUpdating.value = false;
  clearEdition();

}
</script>
<style scoped>
.item-no-padding {
  --padding-start: 0px;
  --padding-end: 0px;
  --inner-padding-start: 0px;
  --inner-padding-end: 0px;
}
</style>
