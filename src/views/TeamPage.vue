<template>
  <ion-page>
    <header-template :pageTitle="pageTitle">
      <ion-button v-if="isMyTeam" @click="unRegisterPlayer"><ion-icon slot="icon-only" :icon="star"></ion-icon></ion-button>
      <ion-button v-if="showRegisterButton" @click="registerPlayer"><ion-icon slot="icon-only" :icon="starOutline"></ion-icon></ion-button>
    </header-template>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <div v-if="isTeam || isLoading">
        <ion-grid class="ion-padding-horizontal ion-padding-top">
          <ion-row class="ion-align-items-center">
            <ion-col class="ion-padding-start" :router-link="`/section/${section?.id}`">
              <ion-card-subtitle v-if="team?.city">{{ team.city }}</ion-card-subtitle>
              <h1 v-if="team?.sectionName" class="ion-no-margin" style="font-weight: bold">{{ team.sectionName }}</h1>
              <ion-spinner v-else></ion-spinner>
            </ion-col>
            <ion-col class="numberCircle ion-padding-end">
              <span v-if="teamId">
                {{ teamId }}
              </span>
              <ion-spinner v-else></ion-spinner>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-card v-if="showRanking">
          <ion-card-header>
            <ion-card-title>Score</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div v-if="isLoading" class="ion-text-center">
              <ion-spinner></ion-spinner>
            </div>
            <ion-list v-else class="no-pointer">
              <ion-item class="ion-no-padding">
                <ion-label>Score de l'équipe</ion-label><ion-note slot="end">{{ team?.score }}</ion-note></ion-item
              >
              <ion-item class="ion-no-padding">
                <ion-label>Score de la section</ion-label><ion-note slot="end">{{ section?.score }}</ion-note></ion-item
              >
              <ion-item class="ion-no-padding">
                <ion-label>Moyenne de la section</ion-label><ion-note slot="end">{{ sectionMean }}</ion-note></ion-item
              >
            </ion-list>
            <ion-button expand="block" color="medium" :router-link="`/section/${section?.id}`" router-direction="back">
              Voir section
            </ion-button>
          </ion-card-content>
        </ion-card>
        <ion-button v-if="showRegisterButton" :disabled="isRegistering" expand="block" color="primary" @click="registerPlayer" class="ion-margin">
          <ion-spinner v-if="isRegistering"></ion-spinner>
          <span v-else>C'est mon équipe </span>
        </ion-button>
        <ion-card>
          <ion-card-header>
            <ion-card-title>Programme</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="matches && matches.size > 0">
              <ion-item v-for="match in matches.values()" :key="match.id" :routerLink="`/match/${match.id}`" class="ion-no-padding">
                <ion-label>
                  <span>{{ match.game_name }}</span>
                  <p>⌚ {{ getSchedule(match.time - 1).start }} - {{ getSchedule(match.time - 1).stop }} | 📍 Jeu n° {{ match.game_id }}</p>
                </ion-label>
                <ion-icon :ios="statusIcon(match).ios" :md="statusIcon(match).md" :color="statusIcon(match).color" slot="end"></ion-icon>
              </ion-item>
            </ion-list>
            <div v-else-if="isLoading" class="ion-text-center">
              <ion-spinner></ion-spinner>
            </div>
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
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { DEFAULT_TEAM_ID, useTeam } from "@/composables/teams";
import { streamTeamMatches } from "@/services/matches";
import { errorPopup, toastPopup } from "@/services/popup";
import { Section, streamSection } from "@/services/sections";
import { getSchedule, isRankingPublic } from "@/services/settings";
import { ROLES, useAuthStore } from "@/services/users";
import {
  IonButton,
  IonCard, IonCardContent, IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem, IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonRow,
  IonSpinner,
  useIonRouter
} from "@ionic/vue";
import { computed, ref } from "@vue/reactivity";
import { useRouteParams } from "@vueuse/router";
import { closeOutline, closeSharp, reorderTwoOutline, reorderTwoSharp, star, starOutline, trophyOutline, trophySharp } from "ionicons/icons";
import { onMounted, watchEffect } from "vue";
import { useRoute } from "vue-router";

// reactive data

const isRegistering = ref(false);

// composables

const user = useAuthStore();
const route = useRoute();
const router = useIonRouter();
const teamId = useRouteParams('teamId', DEFAULT_TEAM_ID)
const { data: team, pending: isLoading, error: errorLoading } = useTeam(teamId);

// lifecycle hooks

onMounted(() => {
if (teamId.value === DEFAULT_TEAM_ID) {
    const msg = "Team ID missing from the url"
    toastPopup(msg)
    console.error(msg)
  }
});

// Computed

const section = computed((): Section | undefined => {
  return team.value?.sectionId ? streamSection(team.value.sectionId) : undefined;
});
const isTeam = computed(() => !errorLoading && team.value && team.value.id)
const pageTitle = computed(() => {
  if (isTeam.value) return `Equipe ${team.value?.id}`;
  if (isLoading.value) return "Chargement";
  return "Équipe inconnue";
});
const matches = computed(() => {
  return team.value?.id ? streamTeamMatches(team.value?.id) : new Map();
});
const showRanking = computed(() => {
  if(isRankingPublic()) return true;
  return user.profile.role >= ROLES.Organisateur;
});
const showRegisterButton = computed(() => {
  if (isMyTeam.value) return false;
  return user.profile.role == ROLES.Participant;
});
const isMyTeam = computed(() => {
  if (!user.profile.team) return false;
  return user.profile.team === teamId.value;
})

// Watchers

const sectionMean = ref("0");
// async update sectionScore
watchEffect(async () => {
  if (!isTeam.value) return; // do not run this watcher if team is not initialized
  const nbTeams = section.value?.nbTeams;
  if (!nbTeams) return;
  sectionMean.value = (section.value.score / nbTeams || 0).toFixed(2);
});

// Methods

const statusIcon = (match: any) => {
  if (match.draw) return { ios: reorderTwoOutline, md: reorderTwoSharp, color: "warning" };
  if (match.winner === teamId.value) return { ios: trophyOutline, md: trophySharp, color: "success" };
  if (match.loser === teamId.value) return { ios: closeOutline, md: closeSharp, color: "danger" };
  return { md: undefined, ios: undefined, color: ""};
};
const registerPlayer = () => {
  if (team.value) user.updateProfile(
    user.uid, {
      team: team.value.id,
      sectionId: team.value?.sectionId,
      sectionName: team.value?.sectionName,
      sectionType: team.value?.sectionType,
      }
    ).then(() => {
    toastPopup(`L'équipe ${team.value?.id} a été enregistrée comme ton équipe`);
  }).catch((e) => {
    errorPopup(`Une erreur s'est produite lors de la modification de ton profil`); 
    console.error(e);
  });
}
const unRegisterPlayer = () => {
  if (team.value) user.updateProfile(user.uid, {team: ""}).then(() => {
    toastPopup(`Nous t'avons désincrit.e de cette équipe`);
  }).catch((e) => {
    errorPopup(`Une erreur s'est produite lors de la modification de ton profil`); 
    console.error(e);
  });
}
</script>
<style scoped></style>
