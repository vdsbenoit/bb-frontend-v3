<template>
  <ion-page>
    <header-template :pageTitle="`Duel ${match.player_ids[0]} vs ${match.player_ids[1]}`"></header-template>
    <ion-content :fullscreen="true">
    <div v-if="match.id">
      <ion-grid class="ion-padding-horizontal ion-padding-top">
        <ion-row class="ion-align-items-center">
            <ion-col class="ion-padding-start">
              <ion-card-subtitle>{{match.start_time}} - {{match.stop_time}}</ion-card-subtitle>
              <h1 class="ion-no-margin" style="font-weight: bold">{{match.gameName}}</h1>
            </ion-col>
            <ion-col class="numberCircle ion-padding-end">
              <span @click="router.replace(`/games/${match.gameId}`)">
                  {{match.gameId}}
              </span>
            </ion-col>
          </ion-row>
      </ion-grid>

      <ion-card>
        <ion-card-content  class="ion-no-padding ion-padding-vertical">
          <ion-grid class="score-grid" >
            <ion-row class="ion-align-items-center ion-text-center">
                <ion-col size="5">
                  <ion-text color="primary">
                    <h1>{{match.player_ids[0]}}</h1>
                  </ion-text>
                  <ion-text color="dark">
                    <p>{{match.player_sections[0]}}</p> 
                  </ion-text>
                  <ion-text color="medium">
                    <p>{{match.player_cities[0]}}</p> 
                  </ion-text>
                </ion-col>
                <ion-col size="1">
                  <ion-text>
                      vs
                  </ion-text>
                </ion-col>
                <ion-col size="5">
                  <ion-text color="primary">
                    <h1>{{match.player_ids[1]}}</h1>
                  </ion-text>
                  <ion-text color="dark">
                    <p>{{match.player_sections[1]}}</p> 
                  </ion-text>
                  <ion-text color="medium">
                    <p>{{match.player_cities[1]}}</p> 
                  </ion-text>
                </ion-col>
              </ion-row>

              <!-- Score icons -->
              <ion-row v-if="match.even" class="ion-align-items-center ion-text-center">
                <ion-col size="11">
                  <div class="score-div even-color">
                    <span class="even-span ion-text-uppercase">égalité</span>
                  </div>
                </ion-col>
              </ion-row>
              <ion-row v-else>
                <ion-col size="5">
                  <div class="score-div" :class="scoreColor(match.player_ids[0])">
                    <ion-icon class="score-icon" :ios="scoreIcon(match.player_ids[0]).ios" :md="scoreIcon(match.player_ids[0]).md"></ion-icon>
                  </div>
                </ion-col>
                <ion-col size="1"></ion-col>
                <ion-col size="5">
                  <div class="score-div" :class="scoreColor(match.player_ids[1])">
                    <ion-icon class="score-icon" :ios="scoreIcon(match.player_ids[1]).ios" :md="scoreIcon(match.player_ids[1]).md"></ion-icon>
                  </div>
                </ion-col>
              </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
      <div class="ion-padding-horizontal">
          <ion-button @click="register" expand="block" v-if="canRegister">
            <span v-if="match.winner || match.even">Modifier le score</span>
            <span v-else>Enregister le score</span>
          </ion-button>
      </div>
      </div>
      <div v-else class="not-found">
        <strong class="capitalize">Nous n'avons pas trouvé ce duel...</strong>
        <p>Retour à <a  @click="router.go(-1)" >la page précédente</a></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardTitle, IonCardSubtitle, 
IonRow, IonCol, IonIcon, IonGrid, IonButton, IonText
} from "@ionic/vue";
import { closeOutline, closeSharp, trophyOutline, trophySharp} from 'ionicons/icons';
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES } from "@/services";
import { computed, reactive } from "@vue/reactivity";
import { useRoute, useRouter } from "vue-router";

const store = useAuthStore();
const route = useRoute();
const router = useRouter();

const match = reactive({
  id: computed(() => {
    if (route.params.id) return route.params.id;
    return undefined;
  }),
  gameId: 1,
  gameName: "Chateau gonflable",
  player_ids: ["A1", "A2"],
  player_sections: ["Louveteaux Férao", "Louveteaux Waingunga"],
  player_cities: ["Soignies", "Soignies"],
  start_time: "11:15",
  stop_time: "11:27",
  winner: "A1",
  loser: "A2",
  even: false,
});

const scoreColor = (playerId: string) => {
  if (!match.even){
    if (playerId === match.winner) return 'winner-color';
    if (playerId === match.loser) return 'loser-color';
  }
  return 'ion-hide';
};
const scoreIcon = (playerId: string) => {
    if (playerId === match.winner) return  {ios: trophyOutline, md: trophySharp};
    if (playerId === match.loser) return {ios: closeOutline, md: closeSharp};
  return {md: undefined, ios: undefined};
};

const canRegister = computed(() => {
  return store.profile.role >= ROLES.Animateur;
});

const register = () => {
  // popup pour choisir gagnant
  return "";
};

</script>
<style scoped>
.score-grid {
  --ion-grid-columns: 11;
}
.score-div {
  margin-top: 10px;
  height: 30px;
  line-height: 30px;
  width: 100%;
  border-radius: 8px;
  text-align: center;
}
.winner-color {
  background-color: var(--ion-color-success);
}
.loser-color {
  background-color: var(--ion-color-danger);
}
.even-color {
  background-color: var(--ion-color-warning);
}
.even-span{
  display: inline-block;
  vertical-align: middle;
  line-height: normal;
  font-weight: bolder;
}
.score-icon {
    color: #dddddd;
    display: inline-block;
    vertical-align: middle;
    line-height: normal;
    height: 65%;
    width: 100%;
}

</style>