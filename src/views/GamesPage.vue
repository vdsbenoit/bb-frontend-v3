<template>
  <ion-page>
    <header-template :pageTitle="pageTitle"></header-template>
    <ion-content :fullscreen="true">
      <ion-item>
        <ion-label class="ion-text-center">Circuit</ion-label>
        <ion-select v-model="selectedCircuit" interface="popover">
          <ion-select-option v-for="(circuit, index) in circuits" :value="circuit" :key="index">{{ circuit }}</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-list v-if="selectedCircuit && (isLoading || games.size > 0)">
        <div v-if="isLoading" class="ion-text-center" style="background: transparent">
          <ion-spinner></ion-spinner>
        </div>
        <ion-item v-else v-for="game in games?.values()" :key="game.id" :routerLink="`/game/${game.id}`" class="">
          <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ game.id }}</ion-badge>
          <ion-label>
            <ion-text>{{ game.name }}</ion-text>
          </ion-label>
          <ion-badge slot="end" class="ion-no-margin" :color="getStatus(game).color">{{ getStatus(game).text }}</ion-badge>
        </ion-item>
      </ion-list>
      <div v-else class="not-found">
        <h2 class="ion-text-center ion-align-items-center" >Aucune épreuve trouvée</h2>
      </div>
      
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonItem, IonLabel, IonRow, IonCol, IonListHeader, IonBadge, IonGrid, IonText, IonButton, useIonRouter, IonSpinner, IonSelect, IonSelectOption } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore } from "@/services/users";
import { choicePopup, errorPopup } from "@/services/popup";
import { computed, ref } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { Game, getGames } from "@/services/games";
import { onBeforeMount, onMounted } from "vue";
import { getCircuits, getMaxGameLeaders } from "@/services/settings";

const user = useAuthStore();
const route = useRoute();
const router = useIonRouter();

// reactive data
const isLoading = ref(true);
const editMode = ref(false);
const circuits = ref();
const selectedCircuit = ref("");

// lifecicle hooks

onBeforeMount(async () => {
  // We take this approach to ensure circuits is not stuck to undefined
  circuits.value = await getCircuits();
});
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 5000);
});

// Computed
const games = computed((): Map<string, Game> | undefined => {
  return selectedCircuit.value ? getGames(selectedCircuit.value) : undefined;
});
const pageTitle = computed(() => {
  if (editMode.value) return `Édition des épreuves`;
  return "Épreuves";
});

// Watchers

// Methods
const isFull = (leaderList: string[]) => {
  return leaderList.length >= getMaxGameLeaders();
};
const getStatus = (game: Game) => {
  if(!game.morning_leaders || ! game.afternoon_leaders) return { text: "inconnu", color: "medium" };
  if (isFull(game.morning_leaders) && isFull(game.afternoon_leaders)) return { text: "Complet", color: "danger" };
  if (!isFull(game.morning_leaders) && isFull(game.afternoon_leaders)) return { text: "Matin", color: "warning" };
  if (isFull(game.morning_leaders) && !isFull(game.afternoon_leaders)) return { text: "Arpèm", color: "warning" };
  if (!isFull(game.morning_leaders) && !isFull(game.afternoon_leaders)) return { text: "Libre", color: "primary" };
  return { text: "inconnu", color: "medium" };
};
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
</style>
