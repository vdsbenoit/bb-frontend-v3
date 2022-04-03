<template>
  <ion-page>
    <header-template :pageTitle="'Épreuve ' + (game.id ? game.id : 'inconnu')"></header-template>
    <ion-content :fullscreen="true">
      <div v-if="game.id">
        <ion-grid class="ion-padding-horizontal ion-padding-top">
          <ion-row class="ion-align-items-center">
            <ion-col class="ion-padding-start">
              <ion-card-subtitle>Circuit {{ game.circuit }}</ion-card-subtitle>
              <h1 class="ion-no-margin" style="font-weight: bold">{{ game.name }}</h1>
            </ion-col>
            <ion-col class="numberCircle ion-padding-end">
              <span>
                {{ game.id }}
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
              <ion-item v-for="leader in game.leaderInfo" :key="leader.uid" :routerLink="'/profile/' + leader.uid" class="ion-margin-start">
                <ion-label>
                  <ion-text style="font-weight: bold">{{ leader.name }}</ion-text>
                  <ion-text color="medium" v-if="leader.section">&nbsp;({{ leader.section }})</ion-text>
                </ion-label>
              </ion-item>
            </ion-list>
            <ion-list v-if="matches.length > 0" lines="none" class="ion-no-margin ion-no-padding">
            <h2 class="ion-padding-start">Après-midi</h2>
              <ion-item v-for="leader in game.leaderInfo" :key="leader.uid" :routerLink="'/profile/' + leader.uid" class="ion-margin-start">
                <ion-label>
                  <ion-text style="font-weight: bold">{{ leader.name }}</ion-text>
                  <ion-text color="medium" v-if="leader.section">&nbsp;({{ leader.section }})</ion-text>
                </ion-label>
              </ion-item>
            </ion-list>
            <ion-list-header v-else> Pas de responsable pour le moment </ion-list-header>

            <ion-grid>
              <ion-row>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
                    <ion-button @click="register" expand="block" color="success" v-if="canRegister" >
                      S'inscrire
                    </ion-button>
                </ion-col>
                <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
                  <ion-button @click="register" expand="block" color="danger" v-if="canRegister" >
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
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonItem, IonLabel, IonNote, IonRow, IonCol, IonListHeader, IonIcon, IonBadge, IonGrid, IonText } from "@ionic/vue";
import { timeOutline, timeSharp, ellipsisHorizontalOutline, swapHorizontalOutline, trophyOutline } from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES, fbGetUserProfile, errorPopup } from "@/services";
import { computed, reactive, ref } from "@vue/reactivity";
import { useRoute, useRouter } from "vue-router";
import { onMounted } from "vue";

const store = useAuthStore();
const route = useRoute();
const router = useRouter();

const register = () => {
  // popup pour choisir matin ou soir
  return "";
};

interface leaderInfo {
  uid: string,
  name: string,
  section: string;
}

const canRegister = computed(() => {
  return store.profile.role >= ROLES.Animateur;
})

const game = reactive({
  id: computed(() => {
    if (route.params.id) return route.params.id;
    if (store.profile.game) return store.profile.game;
    return undefined;
  }),
  name: "",
  circuit: "",
  leaderIds: [""],
  leaderInfo: [{}] as leaderInfo[],
});

const loadLeadersInfo = async () => {
  game.leaderInfo = [] as leaderInfo[];
  game.leaderIds.forEach(async (uid: string) => {
    try {
      const profile = await fbGetUserProfile(uid);
      let section = profile.section;
      let name = "undefined";
      if (profile.totem) {
        name = profile.totem;
      } else if (profile.firstName) {
        name = profile.firstName;
      } else if (profile.email) {
        name = profile.email;
      }
      game.leaderInfo.push({ uid, name, section })
    } catch (e: any) {
      errorPopup("Une erreur est survenue lors du chargement des animateurs\n" + e);
    }
  });
};
game.leaderIds = ["TWADOkcQcgTsU5GXZ8wiFMLL8Y22", "ijDd9Asg6hORfi3lhCbODSjMwl13"];
loadLeadersInfo();
onMounted(async () => {
  game.name = "Pierre papier ciseaux";
  game.circuit = "A";
  
});
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
</style>
