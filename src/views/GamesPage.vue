<template>
  <ion-page>
      <ion-header :translucent="true">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-back-button></ion-back-button>
      </ion-buttons>
      <ion-buttons slot="start">
        <ion-menu-button color="primary"></ion-menu-button>
      </ion-buttons>
      <ion-title>{{ pageTitle }}</ion-title>
      <ion-buttons slot="end" v-if="canEditGames">
        <ion-button @click="toggleEditMode"><ion-icon slot="icon-only" :ios="editIcon.ios" :md="editIcon.md"></ion-icon></ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
    <ion-content :fullscreen="true">
      <ion-item color="primary">
        <ion-label class="ion-text-center">Circuit</ion-label>
        <ion-select v-model="selectedCircuit" interface="popover">
          <ion-select-option v-for="(circuit, index) in circuits" :value="circuit" :key="index">{{ circuit }}</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-list v-if="selectedCircuit">
        <div v-if="games?.size < 1" class="ion-text-center" style="background: transparent">
          <ion-spinner></ion-spinner>
        </div>
        <div v-else v-for="game in games?.values()" :key="game.id">
          <div v-if="editMode">
            <div v-if="game.id === editedGameId && !isUpdating">
              <ion-item>
                <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ game.id }}</ion-badge>
                <ion-input type="text" v-model="newGameName" ></ion-input>
                <ion-button @click="updateGameName()" color="success"><ion-icon slot="icon-only" :ios="checkmarkOutline" :md="checkmarkSharp"></ion-icon></ion-button>
                <ion-button @click="clearEdition()" color="danger"><ion-icon slot="icon-only" :ios="closeOutline" :md="closeSharp"></ion-icon></ion-button>
              </ion-item>
            </div>
            <div v-else>
              <ion-item>
                <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ game.id }}</ion-badge>
                <ion-input type="text" readonly="true" >{{ game.name }}</ion-input>
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
              <ion-badge slot="end" class="ion-no-margin" :color="getStatus(game).color">{{ getStatus(game).text }}</ion-badge>
            </ion-item>
          </div>
        </div>
      </ion-list>
      <div v-else class="not-found">
        <h2 class="ion-text-center ion-align-items-center" >Sélectionner un circuit</h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonBackButton, IonList, IonItem, IonLabel, IonBadge, IonText, 
useIonRouter, IonSpinner, IonSelect, IonSelectOption, IonButton, IonIcon, IonInput } from "@ionic/vue";
import { checkmarkOutline, checkmarkSharp, pencilOutline, pencilSharp, closeOutline, closeSharp } from "ionicons/icons";
import { ROLES, useAuthStore } from "@/services/users";
import { choicePopup, errorPopup, toastPopup } from "@/services/popup";
import { computed, ref } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { Game, getGames, setName } from "@/services/games";
import { onBeforeMount, onMounted } from "vue";
import { getCircuits, getMaxGameLeaders } from "@/services/settings";
import { toastController } from "@ionic/core";

const user = useAuthStore();
const route = useRoute();
const router = useIonRouter();

// reactive data
const editMode = ref(false);
const circuits = ref();
const selectedCircuit = ref("");
const editedGameId = ref(-1);
const newGameName = ref("");
const isUpdating = ref(false);

// lifecicle hooks

onBeforeMount(async () => {
  // We take this approach to ensure circuits is not stuck to undefined
  circuits.value = await getCircuits();
});

// Computed
const games = computed((): Map<string, Game> | undefined => {
  return selectedCircuit.value ? getGames(selectedCircuit.value) : new Map();
});
const pageTitle = computed(() => {
  if (editMode.value) return `Édition des épreuves`;
  return "Épreuves";
});
const canEditGames = computed(() => {
  return user.profile.role >= ROLES.Moderateur;
});
const editIcon = computed(() => {
  return (editMode.value) ? {ios: checkmarkOutline, md: checkmarkSharp} : {ios: pencilOutline, md: pencilSharp}
});

// Watchers

// Methods
const isFull = (leaderList: string[]) => {
  return leaderList.length >= getMaxGameLeaders();
};
const getStatus = (game: Game) => {
  if(!game.morningLeaders || ! game.afternoonLeaders) return { text: "inconnu", color: "medium" };
  if (isFull(game.morningLeaders) && isFull(game.afternoonLeaders)) return { text: "Complet", color: "danger" };
  if (!isFull(game.morningLeaders) && isFull(game.afternoonLeaders)) return { text: "Matin", color: "warning" };
  if (isFull(game.morningLeaders) && !isFull(game.afternoonLeaders)) return { text: "Arpèm", color: "warning" };
  if (!isFull(game.morningLeaders) && !isFull(game.afternoonLeaders)) return { text: "Libre", color: "primary" };
  return { text: "inconnu", color: "medium" };
};
const toggleEditMode = () => {
  editMode.value = !editMode.value 
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
  await setName(editedGameId.value, newGameName.value);
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
ion-card-title {
  font-size: 24px;
}
.can-go-back ion-menu-button {
    display: none;
}
</style>
