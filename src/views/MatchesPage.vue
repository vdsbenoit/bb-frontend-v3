<template>
  <ion-page>
    <header-template pageTitle="Check scores"> </header-template>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <ion-item color="primary">
        <ion-label>Choisir un horaire</ion-label>
        <ion-select v-model="selectedTime" interface="popover">
          <ion-select-option v-for="(timing, index) in schedules" :value="index + 1" :key="index">{{ timing.start }} - {{ timing.stop }}</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item v-if="isFilled" color="warning">
        <ion-label class="ion-text-center">Complet</ion-label>
      </ion-item>
      <ion-list v-if="selectedTime">
        <div v-if="matches && matches.size > 0">
          <ion-item v-for="match in matches.values()" :key="match.id" :routerLink="`/match/${match.id}`" class="">
            <ion-badge slot="start" class="ion-no-margin ion-margin-end" color="medium">{{ match.game_id }}</ion-badge>
            <ion-label>
              {{ match.game_name }}
            </ion-label>
            <ion-icon v-if="isScoreRecorded(match)" :color="iconColor(match)" slot="end" :ios="checkmarkCircle" :md="checkmarkCircleSharp"></ion-icon>
            <ion-icon v-else color="danger" slot="end" :ios="closeCircle" :md="closeCircleSharp"></ion-icon>
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
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonBadge, IonSpinner, IonSelect, IonSelectOption, IonIcon } from "@ionic/vue";
import { arrowUpOutline, arrowUpSharp, checkmarkCircle, checkmarkCircleSharp, closeCircle, closeCircleSharp} from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { computed, ref } from "@vue/reactivity";
import { getSchedules } from "@/services/settings";
import { getTimeMatches, Match } from "@/services/matches";
import { onMounted } from "vue";
import RefresherComponent from "@/components/RefresherComponent.vue";

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
const isFilled = computed(() => {
  if (matches.value && matches.value.size > 0) {
    for (const match of matches.value.values()) {
      if (match.noScores) continue
      if (match.winner) continue
      if (match.draw) continue
      return false;
    }
    return true;
  }
  return false;
});

// Watchers

// Methods

const iconColor = (match: Match) => {
  if (match.noScores) return "medium";
  return 'success'
};
const isScoreRecorded = (match: Match) => {
  return (match.winner || match.draw || match.noScores)
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
