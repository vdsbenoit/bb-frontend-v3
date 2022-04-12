<template>
  <ion-page>
    <header-template pageTitle="Bientôt"></header-template>
    <ion-content :fullscreen="true">
      <div class="not-found">
        <strong class="capitalize">🚧 En construction 🚧</strong>
        <p>L'application sera bientôt disponible</p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
</script>

<style scoped>
</style>