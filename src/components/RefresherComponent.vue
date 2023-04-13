<template>
  <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
      <ion-refresher-content></ion-refresher-content>
  </ion-refresher>
</template>

<script setup lang="ts">
import { IonRefresher, IonRefresherContent } from "@ionic/vue";
const handleRefresh = (event: CustomEvent) => {
  window.location.reload();
};
</script>
<style scoped>
</style>
