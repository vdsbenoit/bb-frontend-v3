<template>
  <ion-page>
    <header-template :pageTitle="'Equipe ' + (team?.id ? team.id : 'inconnue')"></header-template>
    <ion-content :fullscreen="true">
      <div v-if="isTeam">
        <ion-grid class="ion-padding-horizontal ion-padding-top">
          <ion-row class="ion-align-items-center">
            <ion-col class="ion-padding-start">
              <ion-card-subtitle>{{ team.city }}</ion-card-subtitle>
              <h1 class="ion-no-margin" style="font-weight: bold">{{ team?.sectionName }}</h1>
            </ion-col>
            <ion-col class="numberCircle ion-padding-end">
              <span>
                {{ team.id }}
              </span>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-card v-if="showRanking">
          <ion-card-content>
            <ion-list>
              <ion-item> <ion-label>Score de l'équipe</ion-label><ion-note slot="end">{{teamScore}}</ion-note></ion-item>
              <ion-item> <ion-label>Classement de l'équipe</ion-label><ion-note slot="end">placeholder</ion-note> </ion-item>
              <ion-item> <ion-label>Score de la section</ion-label><ion-note slot="end">{{sectionScore}}</ion-note></ion-item>
              <ion-item> <ion-label>Moyenne section</ion-label><ion-note slot="end">{{sectionMean}}</ion-note></ion-item>
              <ion-item> <ion-label>Classement section</ion-label><ion-note slot="end">placeholder</ion-note> </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title style="font-size: 24px">Programme</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="matches.size > 0">
              <ion-item v-for="match in matches.values()" :key="match.id" :routerLink="`/match/${match.id}`" class="ion-no-padding">
                <ion-label>
                  <span>{{ match.game_name }}</span>
                  <p>⌚ {{ getSchedule(match.time - 1).start }} - {{ getSchedule(match.time - 1).stop }} | 📍 Jeu n° {{ match.game_id }}</p>
                </ion-label>
                <ion-icon 
                :ios="statusIcon(match).ios" 
                :md="statusIcon(match).md" 
                :color="statusIcon(match).ios == trophyOutline ? 'success' : 'danger'" 
                v-if="statusIcon(match).md" 
                slot="end"></ion-icon>
                <ion-badge slot="end" class="ion-no-margin" color="warning" v-if="match.even">Égalité</ion-badge>
              </ion-item>
            </ion-list>
            <ion-list-header v-else><h2>Aucun jeu trouvé</h2></ion-list-header>
          </ion-card-content>
        </ion-card>
      </div>
      <div v-else class="not-found">
        <strong class="capitalize">Nous n'avons pas trouvé cette équipe...</strong>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonItem, IonLabel, IonNote, IonRow, IonCol, IonListHeader, IonIcon, IonGrid, useIonRouter, IonBadge } from "@ionic/vue";
import { closeOutline, closeSharp, trophyOutline, trophySharp } from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES } from "@/services/users";
import { computed, ref } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { onBeforeMount, watchEffect } from "vue";
import { getTeam, Team } from "@/services/teams";
import { getTeamMatches } from "@/services/matches";
import { getSchedule } from "@/services/settings";
import { getSection } from "@/services/sections";

const store = useAuthStore();
const route = useRoute();
const router = useIonRouter();

// reactive data

const teamId = ref("");

// lifecicle hooks

onBeforeMount(() => {
  if (route.params.teamId) teamId.value = route.params.teamId as string;
  if (!teamId.value) console.error("Team ID not set in the URL");
});

// Computed

const team = computed(() => {
  return getTeam(teamId.value as string) as Team;
});
const section = computed(() => {
  return getSection(team.value.sectionId);
});
const isTeam = computed(() => {
  if (team.value?.id) return true;
  return false;
});
const matches = computed(() => {
  return team.value?.id ? getTeamMatches(team.value?.id) : new Map();
});
const showRanking = computed(() => {
  return store.profile.role >= ROLES.Moderateur;
});
const teamScore = computed(() => {
  return sum(team.value.scores);
});


// Watchers

const sectionScore = ref(0);
const sectionMean = ref("0");
// async update sectionScore
watchEffect(async () => {
  if (!isTeam.value) return; // do not run this watcher if team is not initialized
  const sectionScores = section.value?.scores;
  if (!sectionScores) return;
  sectionScore.value = sum(sectionScores);
  sectionMean.value = ((sectionScore.value / sectionScores.length) || 0).toFixed(2);
})

// Methods

const sum = (numArray: number[]): number => {
  return numArray.reduce((a, b) => a + b, 0);
}
const statusIcon = (match: any) => {
  if (match.winner === teamId.value) return { ios: trophyOutline, md: trophySharp};
  if (match.loser === teamId.value) return { ios: closeOutline, md: closeSharp};
  return { md: undefined, ios: undefined };
};
</script>
<style scoped></style>
