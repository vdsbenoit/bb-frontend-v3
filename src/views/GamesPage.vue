<template>
  <ion-page>
    <header-template :pageTitle="pageTitle">
      <ion-button v-if="canEditGames" @click="toggleEditMode"><ion-icon slot="icon-only" :ios="editIcon.ios" :md="editIcon.md"></ion-icon></ion-button>
    </header-template>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <ion-item color="primary">
        <ion-label class="ion-text-center">Sélectionne un circuit</ion-label>
        <ion-select v-if="circuits" v-model="selectedCircuit" interface="popover">
          <ion-select-option v-for="letter in Object.keys(circuits).sort()" :value="letter" :key="letter"> {{ letter }} ({{ circuits[letter] }})</ion-select-option>
        </ion-select>
        <ion-spinner v-else-if="isLoadingCircuits"></ion-spinner>
        <div v-else>Pas de circuits configuré</div>
      </ion-item>
      <ion-list v-if="selectedCircuit" lines="full">
        <div v-if="games && games.length > 0">
          <div v-for="game in games?.values()" :key="game.id">
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
                <ion-badge v-if="showGameAvailabilities()" slot="end" class="ion-no-margin" :color="getStatus(game.morningLeaders).color">M{{ getStatus(game.morningLeaders).nbLeaders }}</ion-badge>
                <ion-badge v-if="showGameAvailabilities()" slot="end" class="ion-no-margin ion-margin-start" :color="getStatus(game.afternoonLeaders).color">A{{ getStatus(game.afternoonLeaders).nbLeaders }}</ion-badge>
              </ion-item>
            </div>
          </div>
        </div>
        <div v-else-if="isLoadingGames" class="ion-text-center" style="background: transparent">
          <ion-spinner></ion-spinner>
        </div>
      </ion-list>
      <div v-else class="not-found">
        <h2 class="ion-text-center ion-align-items-center" >Sélectionne un circuit <ion-icon :ios="arrowUpOutline" :md="arrowUpSharp"></ion-icon></h2>
      </div>
      <div v-if="gamesNotFound()" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">Pas d'épreuves</h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonBadge, IonText, useIonRouter, IonSpinner, IonSelect, IonSelectOption, IonButton, IonIcon, IonInput } from "@ionic/vue";
import { checkmarkOutline, checkmarkSharp, pencilOutline, pencilSharp, closeOutline, closeSharp, arrowUpOutline, arrowUpSharp } from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { ROLES, useAuthStore } from "@/services/users";
import { toastPopup } from "@/services/popup";
import { computed, ref } from "@vue/reactivity";
import { onMounted, watch } from "vue";
import { getCircuits, getMaxGameLeaders, isShowGameAvailabilities } from "@/services/settings";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { DEFAULT_CIRCUIT_ID, Game, setGameName, useCircuitGames } from "@/composables/games";

const user = useAuthStore();
const router = useIonRouter();

// reactive data
const editMode = ref(false);
const selectedCircuit = ref(DEFAULT_CIRCUIT_ID);
const editedGameId = ref(-1);
const newGameName = ref("");
const isUpdating = ref(false);
const isLoadingCircuits = ref(true);
const isLoadingGames = ref(false);

// lifecycle hooks
onMounted(() => {
  setTimeout(() => {
    isLoadingCircuits.value = false;
  }, 5000);
});

// Watchers
watch(selectedCircuit, () => {
  if (selectedCircuit.value) {
    isLoadingGames.value = true;
    setTimeout(() => {
      isLoadingGames.value = false;
    }, 5000);
  }
});

// Computed
const circuits = computed(() => {
  return getCircuits();
});
const games = useCircuitGames(selectedCircuit)
const pageTitle = computed(() => {
  if (editMode.value) return `Édition des épreuves`;
  return "Épreuves";
});
const canEditGames = computed(() => {
  return user.profile.role >= ROLES.Organisateur;
});
const editIcon = computed(() => {
  return (editMode.value) ? {ios: closeOutline, md: closeSharp} : {ios: pencilOutline, md: pencilSharp}
});
const gamesNotFound = () => {
  return selectedCircuit.value && !isLoadingGames.value && (!games.value || games.value.length === 0);
}
const showGameAvailabilities = () => {
  return isShowGameAvailabilities();
}

// Methods
const getStatus = (leaders: string[]) => {
  const nbLeaders = leaders.length;
  if (nbLeaders === 0) return { nbLeaders, color: "danger" };
  if (nbLeaders < getMaxGameLeaders()) return { nbLeaders, color: "warning" };
  return { nbLeaders, color: "success" };
};
const toggleEditMode = () => {
  editMode.value = !editMode.value;
}
const goToGamePage = (gameId: number) => {
  if (!editMode.value) router.push(`/game/${gameId}`);
}
const editGame = (game: Game) => {
  newGameName.value = game.name;
  editedGameId.value = game.id;
}
const clearEdition = () => {
  newGameName.value = "";
  editedGameId.value = -1;  
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
