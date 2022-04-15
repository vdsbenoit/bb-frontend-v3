<template>
  <ion-page>
    <header-template :pageTitle="pageTitle"></header-template>
    <ion-content :fullscreen="true">
      <div v-if="isGame || isLoading">
        <ion-grid class="ion-padding-horizontal ion-padding-top">
          <ion-row class="ion-align-items-center">
            <ion-col class="ion-padding-start">
              <ion-card-subtitle>Circuit {{ game?.circuit }}</ion-card-subtitle>
              <h1 v-if="game?.name" class="ion-no-margin" style="font-weight: bold">{{ game.name }}</h1>
              <ion-spinner v-else></ion-spinner>
            </ion-col>
            <ion-col class="numberCircle ion-padding-end">
              <span v-if="gameId">
                {{ gameId }}
              </span>
              <ion-spinner v-else></ion-spinner>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Responsables</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="none" class="ion-no-margin ion-no-padding">
              <ion-text color="primary"><h2>Matin</h2></ion-text>
              <ion-spinner class="ion-margin-start" v-if="isLoadingMorningLeaders"></ion-spinner>
              <div v-else>
                <span class="ion-padding-start" v-if="leaders.morning.length < 1">Pas encore de responsable inscrit</span>
              </div>
              <ion-item v-for="leader in leaders.morning" :key="leader.uid" :routerLink="`/profile/${leader.uid}`">
                <ion-label class="ion-text-wrap">
                  <ion-text style="font-weight: bold">{{ leader.name }}</ion-text>
                  <ion-text color="medium" v-if="leader.section">&nbsp;({{ leader.section }})</ion-text>
                </ion-label>
              </ion-item>
            </ion-list>
            <ion-list lines="none" class="ion-no-margin ion-no-padding">
              <ion-text color="primary"><h2>Après-midi</h2></ion-text>
              <ion-spinner  class="ion-margin-start" v-if="isLoadingAfternoonLeaders"></ion-spinner>
              <div v-else>
                <span class="ion-padding-start" v-if="leaders.afternoon.length < 1">Pas encore de responsable inscrit</span>
              </div>
              <ion-item v-for="leader in leaders.afternoon" :key="leader.uid" :routerLink="`/profile/${leader.uid}`">
                <ion-label class="ion-text-wrap">
                  <ion-text style="font-weight: bold">{{ leader.name }}</ion-text>
                  <ion-text color="medium" v-if="leader.section">&nbsp;({{ leader.section }})</ion-text>
                </ion-label>
              </ion-item>
            </ion-list>

            <ion-grid class="ion-margin-top">
              <ion-row>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
                    <ion-button @click="register" expand="block" color="primary" v-if="canRegister" >
                      S'inscrire
                    </ion-button>
                </ion-col>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
                  <ion-button @click="unRegister" expand="block" color="danger" v-if="canRegister" >
                    Se désinscrire
                  </ion-button>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Programme</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="isLoading || matches.size > 0">
              <div v-if="isLoading" class="ion-text-center">
                <ion-spinner></ion-spinner>
              </div>
              <ion-item v-else v-for="match in matches.values()" :key="match.id" :routerLink="`/match/${match.id}`" class="item-no-padding">
                <ion-label>
                  <ion-text color="tertiary" style="font-weight: bold">⌚ {{ getSchedule(match.time-1).start }} - {{ getSchedule(match.time-1).stop }} : </ion-text>
                  <ion-text>{{ match.player_ids[0] }} vs {{ match.player_ids[1] }}</ion-text>
                </ion-label>
                <ion-badge slot="end" class="ion-no-margin" :color="match.even ? 'warning' : 'success'" v-if="getWinner(match)">{{ getWinner(match) }}</ion-badge>
              </ion-item>
            </ion-list>
            <ion-list-header v-else><h2>Aucun jeu trouvé</h2></ion-list-header>
          </ion-card-content>
        </ion-card>
      </div>
      <div v-else class="not-found">
        <strong class="capitalize">Nous n'avons pas trouvé cette épreuve...</strong>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonItem, IonLabel, IonRow, IonCol, IonListHeader, 
IonBadge, IonGrid, IonText, IonButton, useIonRouter, IonSpinner } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES } from "@/services/users";
import {  choicePopup, errorPopup } from "@/services/popup";
import { computed, reactive, ref } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { Game,  getGame, removeLeader, setAfternoonLeader, setMorningLeader } from "@/services/games";
import { getGameMatches } from "@/services/matches";
import { onBeforeMount, onMounted, watchEffect } from "vue";
import { getSchedule, isLeaderRegistrationOpen } from "@/services/settings";

const user = useAuthStore();
const route = useRoute();
const router = useIonRouter();

// reactive data

const gameId = ref("");
// store more information about the leaders than their IDs
type leaderInfo = {
  uid: string,
  name: string,
  section: string,
}
const leaders = reactive({
  morning: [] as leaderInfo[],
  afternoon: [] as leaderInfo[]
})
const isLoading = ref(true);
const isLoadingMorningLeaders = ref(false);
const isLoadingAfternoonLeaders = ref(false);

// lifecicle hooks

onBeforeMount(() => {
  if (route.params.gameId) gameId.value = route.params.gameId as string;
  if (!gameId.value) console.error("Game ID not set in the URL");
})
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 5000);
});

// Computed 

const game = computed((): Game => {
  return getGame(gameId.value as string) as Game;
})
const isGame = computed(() => {
  if (game.value?.id) {
    isLoading.value = false;
    return true;
  }
  return false; 
})
const canRegister = computed(() => {
  return isLeaderRegistrationOpen() && user.profile.role >= ROLES.Animateur; 
})
const matches = computed(() => {
  return game.value?.id ? getGameMatches(game.value?.id.toString()) : new Map();
})
const pageTitle = computed(() => {
  if (isGame.value) return `Épreuve ${gameId.value}`;
  if (isLoading.value) return "Chargement";
  return "Épreuve inconnue";
})

// Watchers

// async update morning leaders information
watchEffect(async () => {
  if (!isGame.value) return; // do not run this watcher if game is not initialized
  const newLeaderIds = game.value.morning_leaders;
  isLoadingMorningLeaders.value = true;
  const newLeaders = await loadLeaderInfo(newLeaderIds);
  leaders.morning = newLeaders;
  isLoadingMorningLeaders.value = false;
  console.log("Morning leaders info updated", newLeaders);
})
// async update morning leaders information
watchEffect(async () => {
  if (!isGame.value) return; // do not run this watcher if game is not initialized
  const newLeaderIds = game.value.afternoon_leaders;
  isLoadingAfternoonLeaders.value = true;
  const newLeaders = await loadLeaderInfo(newLeaderIds);
  leaders.afternoon = newLeaders;
  isLoadingAfternoonLeaders.value = false;
  console.log("Afternoon leaders info updated", newLeaders);
})

// Methods

const loadLeaderInfo = async (leaders: string[]) => {
  const leaderInfo = [] as leaderInfo[];
  await Promise.all(leaders.map(async (leaderId) => {
    await user.asyncFetchProfile(leaderId);
    const section = user.getProfile(leaderId).sectionName;
    const name = user.getName(leaderId);
    leaderInfo.push({uid: leaderId, name, section});
  }))
  return leaderInfo;
}

const register = () => {
  choicePopup("A quel moment de la journée ?", ["Matin", "Après-midi"], (choice: string) => {
    if (choice === "Matin") setMorningLeader(gameId.value as string).catch((error) => {
      errorPopup(error.message);
    });
    if (choice === "Après-midi") setAfternoonLeader(gameId.value as string).catch((error) => {
      errorPopup(error.message);
    });
  })
};
const unRegister = () => {
  removeLeader(gameId.value as string);
}
const getWinner = (match: any) => {
  if (match.winner) return match.winner;
  if (match.even === true) return "Égalité";
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
ion-card-title {
  font-size: 24px
}
</style>
