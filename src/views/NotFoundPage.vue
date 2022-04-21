<template>
  <ion-page>
    <header-template pageTitle="404"></header-template>
    <ion-content :fullscreen="true">
      <div class="not-found">
        <strong class="capitalize">C'est page n'existe pas ou plus</strong>
        <p>Retour à <a  @click="router.go(-1)" >la page précédente</a></p>
        <p>Retour à <a  @click="router.replace('/home')" >l'accueil</a></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<style scoped>
</style>