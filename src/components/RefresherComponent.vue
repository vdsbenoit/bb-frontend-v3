<script setup lang="ts">
import { IonRefresher, IonRefresherContent } from '@ionic/vue'

function handleRefresh() {
  window.location.reload()
}
</script>

<template>
  <IonRefresher slot="fixed" @ion-refresh="handleRefresh()">
    <IonRefresherContent />
  </IonRefresher>
</template>

<style scoped></style>
