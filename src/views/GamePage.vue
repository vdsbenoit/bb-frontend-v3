<template>
  <ion-page>
    <header-template :pageTitle="'Épreuve ' + (gameId ? gameId : 'inconnu')"></header-template>
    <ion-content :fullscreen="true">
    <div v-if="gameId">
      <ion-grid class="ion-padding-horizontal ion-padding-top">
        <ion-row class="ion-align-items-center">
            <ion-col class="ion-padding-start">
              <ion-card-subtitle>Circuit {{gameCircuit}}</ion-card-subtitle>
              <h1 class="ion-no-margin" style="font-weight: bold">{{gameName}}</h1>
            </ion-col>
            <ion-col class="numberCircle ion-padding-end">
              <span>
                  {{gameId}}
              </span>
            </ion-col>
          </ion-row>
      </ion-grid>
      
      <ion-card>
        <ion-card-header>
          <ion-card-title style="font-size: 24px">Programme</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list  v-if="matches.length > 0">
            <ion-item v-for="match in matches" :key="match.id" routerLink="/match/{{match.id}}" class="ion-no-padding">
              <ion-label>
                <ion-text color="tertiary" style="font-weight: bold">⌚ {{match.start_time}} - {{match.stop_time}} : </ion-text>
                <ion-text>{{match.player_ids[0]}} vs {{match.player_ids[1]}}</ion-text>
              </ion-label>
              <ion-badge slot="end" class="ion-no-margin" :color="match.even ? 'warning' : 'success'" :class="getWinner(match) ? '' : 'ion-hide'">{{getWinner(match)}}</ion-badge>
            </ion-item>
          </ion-list>
          <ion-list-header v-else>
            Aucun jeu trouvé
          </ion-list-header>
        </ion-card-content>
      </ion-card>
      </div>
      <div v-else class="not-found">
        <strong class="capitalize">Nous n'avons pas trouvé cette épreuve...</strong>
        <p>Retour à <a  @click="router.go(-1)" >la page précédente</a></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonItem, IonLabel, IonNote, 
IonRow, IonCol, IonListHeader, IonIcon, IonBadge, IonGrid, IonText
} from "@ionic/vue";
import { timeOutline, timeSharp, ellipsisHorizontalOutline, swapHorizontalOutline, trophyOutline} from 'ionicons/icons';
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES } from "@/services";
import { computed } from "@vue/reactivity";
import { useRoute, useRouter } from "vue-router";

const store = useAuthStore();
const route = useRoute();
const router = useRouter();

const showRanking = computed(() => {
  return store.profile.role >= ROLES.Moderateur ? "" : "ion-hide"
});

const gameId = computed(() => {
  if (route.params.id) return route.params.id;
  if (store.profile.game) return store.profile.game;
  return undefined;
});
const gameName = "Pierre papier ciseaux";
const gameCircuit = "A";
const matches: any = [
  {id: 1, game_id: 1, game_name: "Chateau gonflable", player_ids: ["A15", "A25"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 2, game_id: 2, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 3, game_id: 3, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 4, game_id: 4, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 5, game_id: 5, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 6, game_id: 6, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 7, game_id: 7, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 8, game_id: 8, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 9, game_id: 9, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 10, game_id: 10, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 11, game_id: 11, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 12, game_id: 12, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 13, game_id: 13, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 14, game_id: 14, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 15, game_id: 15, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 16, game_id: 16, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 17, game_id: 17, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
];
const getWinner = (match: any) => {
  if (match.winner) return match.winner ;
  if (match.even === true) return "Égalité";
  return "";
};

</script>
<style scoped>
.numberCircle {
    border-radius: 50%;
    width: 50px;
    height: 50px;
    padding: 15px;
    display: inline-flex;
    flex-grow: 0;
    background: var(--ion-color-primary);
}
.numberCircle span {
    text-align: center;
    width: 25px;
    display: inline-block;
    margin: auto;
    color: #ffffff;
    font-size: 18px;
    font-weight: bold;
}
ion-item {
  --padding-start: 0px;
  --padding-end: 0px;
  --inner-padding-start: 0px;
  --inner-padding-end: 0px;
}
</style>