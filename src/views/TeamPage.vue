<template>
  <ion-page>
    <header-template :pageTitle="'Equipe ' + (teamId ? teamId : 'inconnue')"></header-template>
    <ion-content :fullscreen="true">
    <div v-if="teamId">
      <ion-grid class="ion-padding-horizontal ion-padding-top">
        <ion-row class="ion-align-items-center">
            <ion-col class="ion-padding-start">
              <h1 class="ion-no-margin" style="font-weight: bold">{{teamName}}</h1>
              <ion-card-subtitle>Circuit {{teamCity}}</ion-card-subtitle>
            </ion-col>
            <ion-col class="numberCircle ion-padding-end">
              <span>
                  {{teamId}}
              </span>
            </ion-col>
          </ion-row>
      </ion-grid>

      <ion-card>
        <ion-card-content :class="showRanking">
          <ion-list>
            <ion-item>
              <ion-label>Score de l'équipe</ion-label><ion-note slot="end">5</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>Classement équipe</ion-label><ion-note slot="end">14</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>Moyenne section</ion-label><ion-note slot="end">7</ion-note>
            </ion-item>
            <ion-item>
              <ion-label>Classement section</ion-label><ion-note slot="end">3</ion-note>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title style="font-size: 24px">Programme</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list  v-if="matches.length > 0">
            <ion-item v-for="match in matches" :key="match.id" routerLink="/match/{{match.id}}" class="ion-no-padding"> 
              <ion-label>
                <span>{{match.game_name}}</span>
                <p>⌚ {{match.start_time}} - {{match.stop_time}} | 📍 Jeu n° {{match.game_id}}</p>
              </ion-label>
              <ion-icon :icon="status(match)" slot="end"></ion-icon>
            </ion-item>
          </ion-list>
          <ion-list-header v-else>
            Aucun jeu trouvé
          </ion-list-header>
        </ion-card-content>
      </ion-card>
      </div>
      <div v-else class="not-found">
        <strong class="capitalize">Nous n'avons pas trouvé cette équipe...</strong>
        <p>Retour à <a  @click="router.go(-1)" >la page précédente</a></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonItem, IonLabel, IonNote, 
IonRow, IonCol, IonListHeader, IonIcon, IonGrid
} from "@ionic/vue";
import { closeOutline, ellipsisHorizontalOutline, swapHorizontalOutline, trophyOutline} from 'ionicons/icons';
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

const teamId = computed(() => {
  if (route.params.id) return route.params.id;
  if (store.profile.team) return store.profile.team;
  return undefined;
});
const teamName = "Louveteaux Férao";
const teamCity = "Soignies";
const matches: any = [
  {id: 1, game_id: 1, game_name: "Chateau gonflable", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
  {id: 2, game_id: 2, game_name: "Pan t'es mort", player_ids: ["A1", "A2"], start_time: "11:15", stop_time: "11:27", winner: "", loser: "", even: false},
];
const status = (match: any) => {
  if (match.winner === teamId) return trophyOutline;
  if (match.loser === teamId) return closeOutline;
  if (match.even === true) return swapHorizontalOutline;
  return ellipsisHorizontalOutline;
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
</style>