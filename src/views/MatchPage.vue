<template>
  <ion-page>
    <header-template :pageTitle="pageTitle"></header-template>
    <ion-content :fullscreen="true">
      <div v-if="isMatch">
        <ion-grid class="ion-padding-horizontal ion-padding-top">
          <ion-row class="ion-align-items-center">
            <ion-col class="ion-padding-start">
              <ion-card-subtitle>{{ getSchedule(match.time - 1).start }} - {{ getSchedule(match.time - 1).stop }}</ion-card-subtitle>
              <h1 class="ion-no-margin" style="font-weight: bold">{{ match.game_name }}</h1>
            </ion-col>
            <ion-col class="numberCircle ion-padding-end">
              <span @click="router.navigate(`/game/${match.game_id}`, 'back', 'push')">
                {{ match.game_id }}
              </span>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-card>
          <ion-card-content class="ion-no-padding ion-padding-vertical">
            <ion-grid class="score-grid">
              <ion-row class="ion-align-items-center ion-text-center">
                <ion-col size="5" @click="router.push(`/team/${firstPlayer?.id}`)" class="ion-no-padding">
                  <ion-text color="primary">
                    <h1>{{ firstPlayer?.id }}</h1>
                  </ion-text>
                  <ion-text color="dark">
                    <p>{{ firstPlayer?.sectionName }}</p>
                  </ion-text>
                  <ion-text color="medium">
                    <p>{{ firstPlayer?.city }}</p>
                  </ion-text>
                </ion-col>
                <ion-col size="1">
                  <ion-text> vs </ion-text>
                </ion-col>
                <ion-col size="5" @click="router.push(`/team/${secondPlayer?.id}`)" class="ion-no-padding">
                  <ion-text color="primary">
                    <h1>{{ secondPlayer?.id }}</h1>
                  </ion-text>
                  <ion-text color="dark">
                    <p>{{ secondPlayer?.sectionName }}</p>
                  </ion-text>
                  <ion-text color="medium">
                    <p>{{ secondPlayer?.city }}</p>
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
              <ion-row v-if="match.winner">
                <ion-col size="5">
                  <div class="score-div" :class="scoreColor(firstPlayer?.id)">
                    <ion-icon class="score-icon" :ios="scoreIcon(firstPlayer?.id).ios" :md="scoreIcon(firstPlayer?.id).md"></ion-icon>
                  </div>
                </ion-col>
                <ion-col size="1"></ion-col>
                <ion-col size="5">
                  <div class="score-div" :class="scoreColor(secondPlayer?.id)">
                    <ion-icon class="score-icon" :ios="scoreIcon(secondPlayer?.id).ios" :md="scoreIcon(secondPlayer?.id).md"></ion-icon>
                  </div>
                </ion-col>
              </ion-row>
            </ion-grid>
          </ion-card-content>
        </ion-card>
        <div class="ion-padding-horizontal" v-if="canSetScore">
          <ion-button @click="register" expand="block">
            <span v-if="match.winner || match.even">Modifier le score</span>
            <span v-else>Enregister le score</span>
          </ion-button>
        </div>
      </div>
      <div v-else class="not-found">
        <strong class="capitalize">Nous n'avons pas trouvé ce duel...</strong>
        <p>Retour à <a @click="router.back()">la page précédente</a></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardSubtitle, IonRow, IonCol, IonIcon, IonGrid, IonButton, IonText, useIonRouter } from "@ionic/vue";
import { closeOutline, closeSharp, trophyOutline, trophySharp } from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore } from "@/services/users";
import { computed, ref } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { onBeforeMount, watchEffect } from "vue";
import { getMatch, Match, setEven, setScore } from "@/services/matches";
import { getTeam } from "@/services/teams";
import { canSetGameScore } from "@/services/games";
import { isScoresFrozen } from "@/services/settings";
import { getSchedule } from "@/services/settings";
import { choicePopup, errorPopup } from "@/services/popup";

const store = useAuthStore();
const route = useRoute();
const router = useIonRouter();

// reactive data

const matchId = ref("");
const canSetScore = ref(false);

// lifecicle hooks

onBeforeMount(() => {
  if (route.params.matchId) matchId.value = route.params.matchId as string;
  if (!matchId.value) console.error("Match ID not set in the URL");
});

// Computed

const match = computed((): Match => {
  return getMatch(matchId.value as string) as Match;
});
const isMatch = computed(() => {
  if (match.value?.id) return true;
  return false;
});
const pageTitle = computed(() => {
  if (isMatch.value) return `Duel ${match.value.player_ids[0]} vs ${match.value.player_ids[1]}`;
  return "Duel inconnu";
});
const firstPlayer = computed(() => {
  return getTeam(match.value.player_ids[0]);
});
const secondPlayer = computed(() => {
  return getTeam(match.value.player_ids[1]);
});

// Watchers

// async update canSetScore value
watchEffect(async () => {
  if (!isMatch.value) return; // do not run this watcher if match is not initialized
  canSetScore.value = await canSetGameScore(match.value.game_id);
});

// Methods

const register = () => {
  if (isScoresFrozen()) {
    errorPopup("Il n'est pas ou plus possible d'enregistrer des scores");
    return;
  }
  if (!canSetScore) { // fixme: seems useless
    throw errorPopup(`Tu n'as pas le droit d'enregister de scores cette épreuve`);
  }
  choicePopup("Est-ce une victoire ?", ["Victoire", "Égalité"], (choice: string) => {
    if (choice === "Égalité") setEven(matchId.value);
    else if (choice === "Victoire")
      choicePopup("Qui est l'heureux gagnant ?", [match.value.player_ids[0], match.value.player_ids[1]], (winner: string) => {
        const loser = match.value.player_ids[0] === winner ? match.value.player_ids[1] : match.value.player_ids[0];
        setScore(matchId.value, winner, loser);
      });
    else console.error(`Unknown choice: ${choice}`);
  });
};

const scoreColor = (playerId: string | undefined) => {
  if (playerId === match.value.winner) return "winner-color";
  if (playerId === match.value.loser) return "loser-color";
  return "";
};
const scoreIcon = (playerId: string | undefined) => {
  if (playerId === match.value.winner) return { ios: trophyOutline, md: trophySharp };
  if (playerId === match.value.loser) return { ios: closeOutline, md: closeSharp };
  return { md: undefined, ios: undefined };
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
.even-span {
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
