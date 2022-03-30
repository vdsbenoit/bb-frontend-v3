<template>
  <ion-page>
    <header-template pageTitle="Joueur"></header-template>
    <ion-content :fullscreen="true">
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
      <ion-fab-button @click="openModal">
        <ion-icon :icon="qrCodeOutline"></ion-icon>
      </ion-fab-button>
    </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonFab, IonFabButton } from '@ionic/vue';
import { qrCodeOutline } from 'ionicons/icons';
import HeaderTemplate from '@/components/HeaderTemplate.vue'
const openModal = () => {
  return
}
</script>

<style scoped>
</style>