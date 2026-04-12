<script setup lang="ts">
import { IonCol, IonRippleEffect } from '@ionic/vue'
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps(['target'])
const router = useRouter()
</script>

<template>
  <IonCol size="6" size-sm="4" size-lg="2" @click="router.replace(props.target)">
    <div class="tile ion-activatable ripple-parent">
      <span class="ion-padding"><slot /></span>
      <IonRippleEffect class="ripple" />
    </div>
  </IonCol>
</template>

<style scoped>
.tile {
  border-radius: 15px;
  background-color: var(--ion-color-primary);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 35px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
}
.ripple {
  border-radius: 15px;
}
.tile span {
  color: var(--ion-color-light);
}
</style>
