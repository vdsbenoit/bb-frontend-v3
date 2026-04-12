<script setup lang="ts">
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { homeOutline } from 'ionicons/icons'
import { defineProps } from 'vue'

const props = defineProps(['pageTitle'])
</script>

<template>
  <IonHeader :translucent="true">
    <IonToolbar>
      <IonButtons slot="start">
        <!-- back button -->
        <IonBackButton />
        <!-- menu button -->
        <IonMenuButton color="primary" />
      </IonButtons>
      <IonTitle>{{ props.pageTitle }}</IonTitle>
      <IonButtons slot="end">
        <slot />
        <!-- home button -->
        <IonButton class="ion-no-margin" href="/home" router-direction="root">
          <IonIcon slot="icon-only" color="primary" :icon="homeOutline" />
        </IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
</template>

<style scoped>
.can-go-back ion-menu-button {
  display: none;
}
</style>
