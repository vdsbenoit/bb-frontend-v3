<template>
  <ion-refresher slot="fixed" @ionRefresh="handleRefresh()">
      <ion-refresher-content></ion-refresher-content>
  </ion-refresher>
</template>

<script setup lang="ts">
import { IonRefresher, IonRefresherContent } from "@ionic/vue";
const handleRefresh = () => {
  window.location.reload();
};
</script>
<style scoped>
</style>
