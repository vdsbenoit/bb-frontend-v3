<template>
  <ion-header :translucent="true">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-back-button></ion-back-button>
      </ion-buttons>
      <ion-buttons slot="start">
        <ion-menu-button color="primary"></ion-menu-button>
      </ion-buttons>
      <ion-title>{{ props.pageTitle }}</ion-title>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar, IonBackButton } from "@ionic/vue";
import { defineProps,   } from "vue";
const props = defineProps(["pageTitle"]);
</script>
<style scoped>
.can-go-back ion-menu-button {
    display: none;
}
</style>
