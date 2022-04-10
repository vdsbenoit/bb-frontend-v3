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
            <ion-list v-if="matches.length > 0" lines="none" class="ion-no-margin ion-no-padding">
            <h2 class="ion-padding-start">Matin</h2>
              <ion-item v-for="leader in leaders.morning" :key="leader.uid" :routerLink="'/profile/' + leader.uid" class="ion-margin-start">
                <ion-label>
                  <ion-text style="font-weight: bold">{{ leader.name }}</ion-text>
                  <ion-text color="medium" v-if="leader.section">&nbsp;({{ leader.section }})</ion-text>
                </ion-label>
              </ion-item>
            </ion-list>
            <ion-list v-if="matches.length > 0" lines="none" class="ion-no-margin ion-no-padding">
            <h2 class="ion-padding-start">Après-midi</h2>
              <ion-item v-for="leader in leaders.afternoon" :key="leader.uid" :routerLink="'/profile/' + leader.uid" class="ion-margin-start">
                <ion-label>
                  <ion-text style="font-weight: bold">{{ leader.name }}</ion-text>
                  <ion-text color="medium" v-if="leader.section">&nbsp;({{ leader.section }})</ion-text>
                </ion-label>
              </ion-item>
            </ion-list>
            <ion-list-header v-else> Pas de responsable pour le moment </ion-list-header>

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

        <h3>morning_leaders</h3>
        <p>{{game.morning_leaders}}</p>
        <h3>leaders.morning</h3>
        <p>{{leaders.morning}}</p>

        <ion-card>
          <ion-card-header>
            <ion-card-title style="font-size: 24px">Programme</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="matches.length > 0">
              <ion-item v-for="match in matches" :key="match.id" :routerLink="`/match/${match.id}`" class="item-no-padding">
                <ion-label>
                  <ion-text color="tertiary" style="font-weight: bold">⌚ {{ match.start_time }} - {{ match.stop_time }} : </ion-text>
                  <ion-text>{{ match.player_ids[0] }} vs {{ match.player_ids[1] }}</ion-text>
                </ion-label>
                <ion-badge slot="end" class="ion-no-margin" :color="match.even ? 'warning' : 'success'" v-if="getWinner(match)">{{ getWinner(match) }}</ion-badge>
              </ion-item>
            </ion-list>
            <ion-list-header v-else> Aucun jeu trouvé </ion-list-header>
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
IonIcon, IonBadge, IonGrid, IonText, IonButton } from "@ionic/vue";
import { timeOutline, timeSharp, ellipsisHorizontalOutline, swapHorizontalOutline, trophyOutline } from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES } from "@/services/users";
import {  choicePopup, errorPopup } from "@/services/popup";
import { computed, reactive, ref } from "@vue/reactivity";
import { useRoute, useRouter } from "vue-router";
import { Game, getGame, removeLeader, setAfternoonLeader, setMorningLeader } from "@/services/games";
import { watch, watchEffect } from "vue";
import { isLeaderRegistrationOpen } from "@/services/settings";

const user = useAuthStore();
const route = useRoute();
const router = useRouter();

// reactive data
type leaderInfo = {
  uid: string,
  name: string,
  section: string,
}
const leaders = reactive({
  morning: [] as leaderInfo[],
  afternoon: [] as leaderInfo[]
})

// Computed 

const gameId = computed(() => {
    if (route.params.id) return route.params.id as string;
    return undefined;
})
const game = computed((): Game => {
  return getGame(gameId.value as string) as Game;
})

const isGame = computed(() => {
  if (!gameId.value) {
    console.error("Game ID not set in the URL");
    return false
  }
  if (!game.value?.circuit) return false;
  return true; 
})
const canRegister = computed(() => {
  return isLeaderRegistrationOpen() && user.profile.role >= ROLES.Animateur; 
})
const loadLeaderInfo = async (leaders: string[]) => {
  const leaderInfo = [] as leaderInfo[];

  for (const leaderId of leaders){
    await user.asyncFetchProfile(leaderId);
    const section = user.getProfile(leaderId).sectionName;
    const name = user.getName(leaderId);
    leaderInfo.push({uid: leaderId, name, section});
  }
  return leaderInfo;
}
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

const matches: any = [
  { id: 1, game_id: 1, game_name: "Chateau gonflable", player_ids: ["A15", "A25"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 2, game_id: 2, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 3, game_id: 3, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 4, game_id: 4, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 5, game_id: 5, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 6, game_id: 6, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 7, game_id: 7, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 8, game_id: 8, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 9, game_id: 9, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 10, game_id: 10, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 11, game_id: 11, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 12, game_id: 12, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 13, game_id: 13, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 14, game_id: 14, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 15, game_id: 15, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 16, game_id: 16, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
  { id: 17, game_id: 17, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false },
];

</script>
<style scoped>
.item-no-padding {
  --padding-start: 0px;
  --padding-end: 0px;
  --inner-padding-start: 0px;
  --inner-padding-end: 0px;
}
</style>
