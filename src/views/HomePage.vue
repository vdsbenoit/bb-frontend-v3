<template>
  <ion-page>
    <header-template pageTitle="Accueil"></header-template>
    <ion-content :fullscreen="true">
      <div class="logo">
        <img src="@/assets/img/Logo-bb.png" alt="Logo Baden Battle" />
      </div>
      <div v-if="user.isLoggedIn">
      <ion-grid class="home-grid">
        <ion-row>
          <tile-col v-if="showUpdateProfile" target="/profile">Compléter mon profil</tile-col>
          <tile-col v-if="showSelectGame" target="/games">M'inscire à une épreuve</tile-col>
          <tile-col v-if="showSelectTeam" target="/sections">Trouver ma section</tile-col>
          <tile-col v-if="user.profile.morningGame" :target="`/team/${user.profile.morningGame}`">Mon épreuve du matin</tile-col>
          <tile-col v-if="user.profile.afternoonGame" :target="`/team/${user.profile.afternoonGame}`">Mon épreuve de l'après-midi</tile-col>
          <tile-col v-if="user.profile.team" :target="`/team/${user.profile.team}`">Mon équipe</tile-col>
        </ion-row>
      </ion-grid>
      </div>
      <div v-else class="container">
        <h1 color="primary">Bienvenue</h1>
        <p>Pour utiliser l'app, il faut d'abord</p>
        <ion-button class="ion-text-lowercase" color="primary" @click="router.push('/login')">te connecter</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonButton, IonGrid, IonRow } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/services/users";
import TileCol from "@/components/TileCol.vue";
import { computed } from "vue";

const router = useRouter();
const user = useAuthStore();

// Computed vars

const showUpdateProfile = computed(() => {
  if (!user.profile.email) return false;
  return !user.profile.totem && !user.profile.name;
});
const showSelectTeam = computed(() => {
  if (!user.profile.email) return false;
  return !user.profile.team;
});
const showSelectGame = computed(() => {
  if (!user.profile.email) return false;
  return !user.profile.morningGame || !user.profile.afternoonGame;
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
