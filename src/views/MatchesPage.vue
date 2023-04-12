<template>
  <ion-page>
    <header-template pageTitle="Duels"> </header-template>
    <ion-content :fullscreen="true">
      <ion-item color="primary">
        <ion-label class="ion-text-center">Choisir un horaire</ion-label>
        <ion-select v-model="selectedTime" interface="popover">
          <ion-select-option v-for="(timing, index) in schedules" :value="index + 1" :key="index">{{ timing.start }} - {{ timing.stop }}</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-list v-if="selectedTime">
        <div v-if="matches && matches.size > 0">
          <ion-item v-for="match in matches.values()" :key="match.id" :routerLink="`/match/${match.id}`" class="">
            <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ match.game_id }}</ion-badge>
            <ion-label>
              <ion-text color="primary" style="font-weight: bold">{{ match.player_ids[0] }}</ion-text>
              <ion-text> vs </ion-text>
              <ion-text color="primary" style="font-weight: bold">{{ match.player_ids[1] }}</ion-text>
            </ion-label>
            <ion-badge v-if="getWinner(match)" slot="end" class="ion-no-margin" :color="match.draw ? 'warning' : 'success'">{{ getWinner(match) }}</ion-badge>
            <ion-badge v-else slot="end" class="ion-no-margin" color="danger">Pas de score</ion-badge>
          </ion-item>
        </div>
        <div v-else-if="isLoading" class="ion-text-center" style="background: transparent">
          <ion-spinner></ion-spinner>
        </div>
      </ion-list>
      <div v-else class="not-found">
        <h2 class="ion-text-center ion-align-items-center">Sélectionne un horaire <ion-icon :ios="arrowUpOutline" :md="arrowUpSharp"></ion-icon></h2>
      </div>
      <div v-if="selectedTime && !isLoading && (!matches || matches.size < 1)" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">Aucun duel trouvé</h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonBadge, IonText, IonSpinner, IonSelect, IonSelectOption, IonIcon } from "@ionic/vue";
import { arrowUpOutline, arrowUpSharp } from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { computed, ref } from "@vue/reactivity";
import { getSchedules } from "@/services/settings";
import { getTimeMatches, Match } from "@/services/matches";
import { onMounted } from "vue";

// reactive data
const selectedTime = ref(0);
const isLoading = ref(true);

// lifecycle hooks
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 5000);
});

// Computed
const schedules = computed(() => {
  console.log("schedules", getSchedules());
  return getSchedules();
});
const matches = computed((): Map<string, Match> | undefined => {
  return getTimeMatches(selectedTime.value);
});

// Watchers

// Methods

const getWinner = (match: any) => {
  if (match.winner) return match.winner;
  if (match.draw === true) return "Égalité";
  return "";
};

</script>
<style scoped>
.item-no-padding {
  --padding-start: 0px;
  --padding-end: 0px;
  --inner-padding-start: 0px;
  --inner-padding-end: 0px;
}
</style>
