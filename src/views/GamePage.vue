<template>
  <ion-page>
    <header-template :pageTitle="'Épreuve ' + (gameId ? gameId : 'inconnue')"></header-template>
    <ion-content :fullscreen="true">
      <div v-if="isGame">
        <ion-grid class="ion-padding-horizontal ion-padding-top">
          <ion-row class="ion-align-items-center">
            <ion-col class="ion-padding-start">
              <ion-card-subtitle>Circuit {{ game?.circuit }}</ion-card-subtitle>
              <h1 class="ion-no-margin" style="font-weight: bold">{{ game?.name }}</h1>
            </ion-col>
            <ion-col class="numberCircle ion-padding-end">
              <span>
                {{ gameId }}
              </span>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-card>
          <ion-card-header>
            <ion-card-title style="font-size: 24px">Responsables</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list lines="none" class="ion-no-margin ion-no-padding">
              <ion-text color="primary"><h2>Matin</h2></ion-text>
              <span class="ion-padding-start" v-if="leaders.morning.length < 1">Pas encore de responsable inscrit</span>
              <ion-item v-for="leader in leaders.morning" :key="leader.uid" :routerLink="`/profile/${leader.uid}`">
                <ion-label class="ion-text-wrap">
                  <ion-text style="font-weight: bold">{{ leader.name }}</ion-text>
                  <ion-text color="medium" v-if="leader.section">&nbsp;({{ leader.section }})</ion-text>
                </ion-label>
              </ion-item>
            </ion-list>
            <ion-list lines="none" class="ion-no-margin ion-no-padding">
              <ion-text color="primary"><h2>Après-midi</h2></ion-text>
              <span class="ion-padding-start" v-if="leaders.afternoon.length < 1">Pas encore de responsable inscrit</span>
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
            <ion-card-title style="font-size: 24px">Programme</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="matches.size > 0">
            <!-- <ion-list> -->
              <ion-item v-for="match in matches.values()" :key="match.id" :routerLink="`/match/${match.id}`" class="item-no-padding">
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
        <p>Retour à <a @click="router.go(-1)">la page précédente</a></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonItem, IonLabel, IonNote, IonRow, IonCol, IonListHeader, 
IonIcon, IonBadge, IonGrid, IonText, IonButton, useIonRouter } from "@ionic/vue";
import { timeOutline, timeSharp, ellipsisHorizontalOutline, swapHorizontalOutline, trophyOutline } from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES } from "@/services/users";
import {  choicePopup, errorPopup } from "@/services/popup";
import { computed, reactive, ref } from "@vue/reactivity";
import { useRoute, useRouter } from "vue-router";
import { Game, gamesDefaults, getGame, removeLeader, setAfternoonLeader, setMorningLeader } from "@/services/games";
import { getGameMatches, Match } from "@/services/matches";
import { onBeforeMount, onMounted, watch, watchEffect } from "vue";
import { getSchedule, hardcodeSchedule, isLeaderRegistrationOpen } from "@/services/settings";

const user = useAuthStore();
const route = useRoute();
const router = useRouter();

// reactive data

const gameId = ref("");
type leaderInfo = {
  uid: string,
  name: string,
  section: string,
}
const leaders = reactive({
  morning: [] as leaderInfo[],
  afternoon: [] as leaderInfo[]
})

// lifecicle hooks

onBeforeMount(() => {
  if (route.params.gameId) gameId.value = route.params.gameId as string;
  if (!gameId.value) console.error("Game ID not set in the URL");
})

// Computed 

const game = computed((): Game => {
  return getGame(gameId.value as string) as Game;
})
const isGame = computed(() => {
  if (game.value?.id) return true;
  return false; 
})
const canRegister = computed(() => {
  return isLeaderRegistrationOpen() && user.profile.role >= ROLES.Animateur; 
})
const matches = computed(() => {
  return game.value?.id ? getGameMatches(game.value?.id) : new Map();
})

// Watchers

// async update morning leaders information
watchEffect(async () => {
  if (!isGame.value) return; // do not run this watcher if game is not initialized
  const newLeaderIds = game.value.morning_leaders;
  const newLeaders = await loadLeaderInfo(newLeaderIds);
  leaders.morning = newLeaders;
  console.log("Morning leaders info updated", newLeaders);
})
// async update morning leaders information
watchEffect(async () => {
  if (!isGame.value) return; // do not run this watcher if game is not initialized
  const newLeaderIds = game.value.afternoon_leaders;
  const newLeaders = await loadLeaderInfo(newLeaderIds);
  leaders.afternoon = newLeaders;
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

// Stubs

// const matches: any = [
//   { id: 1, game_id: 1, game_name: "Chateau gonflable", player_ids: ["A15", "A25"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 2, game_id: 2, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 3, game_id: 3, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 4, game_id: 4, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 5, game_id: 5, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 6, game_id: 6, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 7, game_id: 7, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 8, game_id: 8, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 9, game_id: 9, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 10, game_id: 10, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 11, game_id: 11, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 12, game_id: 12, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 13, game_id: 13, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 14, game_id: 14, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 15, game_id: 15, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 16, game_id: 16, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
//   { id: 17, game_id: 17, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
// ];

</script>
<style scoped>
.item-no-padding {
  --padding-start: 0px;
  --padding-end: 0px;
  --inner-padding-start: 0px;
  --inner-padding-end: 0px;
}
</style>
