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

<script setup>
import { IonButtons, IonHeader, IonMenuButton, IonTitle, IonToolbar } from '@ionic/vue';
import { defineProps } from "vue";
const props = defineProps(['pageTitle']);
</script>
