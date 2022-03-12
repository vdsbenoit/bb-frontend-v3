<template>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ this.pageTitle }}</ion-title>
      </ion-toolbar>
    </ion-header>
</template>

<script lang="ts">
import { IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar } from '@ionic/vue';

export default {
  name: "HeaderTemplate",
  components: {
    IonButtons,
    IonHeader,
    IonMenuButton,
    IonTitle,
    IonToolbar
  },
  props: [
      "pageTitle",
  ],
}
</script>
