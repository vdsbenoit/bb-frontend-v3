<template>
  <ion-page>
    <header-template pageTitle="Accueil"></header-template>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <div class="logo">
        <img src="@/assets/img/logo-bb.png" alt="Logo Baden Battle" />
      </div>
      <info-card-component v-if="showPendingRequestInfo" class="ion-margin-horizontal">
          Ton inscription est en attente de validation par un {{ requestValidator }}. 
          N'hésite pas à les contacter pour accélérer ta demande.
      </info-card-component>
      <ion-grid class="home-grid">
        <ion-row>
          <!-- participant -->
          <tile-col v-if="showSelectTeam" :target="`/section/${user.profile.sectionId}`">Choisis une équipe</tile-col>
          <tile-col v-if="showSectionButton" :target="`/section/${user.profile.sectionId}`">Ma section</tile-col>
          <tile-col v-if="user.profile.team" :target="`/team/${user.profile.team}`">Mon équipe</tile-col>

          <!-- >= chef -->
          <tile-col v-if="nbPendingRequests" target="/requests">
            {{ nbPendingRequests }} demande{{ typeof nbPendingRequests == 'string' || nbPendingRequests > 1  ? "s" : "" }} d'accès
          </tile-col>

          <!-- chef -->
          <tile-col v-if="showRegisterLeaders" :target="`/leader/${user.profile.sectionId}`">Inscris tes animés à des épreuves</tile-col>

          <!-- animateur -->
          <tile-col v-if="showSelectMorningGame" target="/games">Inscris-toi à une épreuve du matin</tile-col>
          <tile-col v-if="showSelectAfternoonGame" target="/games">Inscris-toi à une épreuve de l'aprèm</tile-col>
          <tile-col v-if="showLeaderSectionButton" :target="`/leader/${user.profile.sectionId}`">Ma section</tile-col>
          <tile-col v-if="user.profile.morningGame" :target="`/game/${user.profile.morningGame}`">Mon épreuve du matin</tile-col>
          <tile-col v-if="user.profile.afternoonGame" :target="`/game/${user.profile.afternoonGame}`">Mon épreuve de l'aprèm</tile-col>

          <!-- organisateur -->
          <tile-col v-if="user.profile.role >= ROLES.Organisateur" target="/leaders">Animateurs</tile-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonGrid, IonRow } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { ROLES, useAuthStore } from "@/services/users";
import TileCol from "@/components/TileCol.vue";
import { computed } from "vue";
import { isLeaderRegistrationOpen } from "@/services/settings";
import InfoCardComponent from "../components/InfoCardComponent.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";

const user = useAuthStore();

// Computed vars
const showPendingRequestInfo = computed(() => {
  return user.profile.role === ROLES.Newbie && user.profile.hasDoneOnboarding;
});
const showSelectTeam = computed(() => {
  return user.profile.role === ROLES.Participant && !user.profile.team;
});
const showSectionButton = computed(() => {
  return user.profile.role === ROLES.Participant && user.profile.sectionId;
});
const showLeaderSectionButton = computed(() => {
  return user.profile.role >= ROLES.Animateur && user.profile.sectionId;
});
const showRegisterLeaders = computed(() => {
  return (user.profile.role === ROLES.Chef) && isLeaderRegistrationOpen();
});
const showSelectMorningGame = computed(() => {
  if (!isLeaderRegistrationOpen()) return false;
  return ((user.profile.role === ROLES.Animateur || user.profile.role === ROLES.Chef) && !user.profile.morningGame);
});
const showSelectAfternoonGame = computed(() => {
  if (!isLeaderRegistrationOpen()) return false;
  return ((user.profile.role === ROLES.Animateur || user.profile.role === ROLES.Chef) && !user.profile.afternoonGame);
});
const pendingRequests = computed(() => {
  if (user.profile.role === ROLES.Chef) {
    return user.getSectionApplicants(15, user.profile.sectionId);
  }
  if (user.profile.role > ROLES.Chef) {
    return user.getApplicants(15);
  }
  return new Map();
});
const nbPendingRequests = computed(() => {
  return pendingRequests.value.size <= 15 ? pendingRequests.value.size : "15+";
});
const requestValidator = computed(() => {
  switch (user.profile.requestedRole) {
    case ROLES.Animateur:
    case ROLES.Chef:
      return "chef de ta section";
    case ROLES.Organisateur:
      return "organisateur de la Baden Battle";
    case ROLES.Administrateur:
      return "administrateur de l'app";
    default:
      return "";
  }
});
</script>

<style scoped>
.logo {
  background-color: var(--ion-background-color);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: min(1%, 20px);
  width: 100%;
  height: 30%;
  margin-bottom: 20px;
  margin-top: 10px;
}
.logo img {
  max-width: 100%;
  max-height: 100%;
}
.container{
  text-align: center;
}
h1 {
  color: var(--ion-color-primary);
  font-size: 40px;
}
p {
  line-height: 30px;
}
</style>
