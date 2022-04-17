<template>
  <ion-col size="6" @click="router.replace(target)">
    <div class="tile ion-activatable ripple-parent">
      <span class="ion-padding"><slot></slot></span>
      <ion-ripple-effect class="ripple"></ion-ripple-effect>
    </div>
  </ion-col>
</template>

<script setup lang="ts">
import { IonCol, IonRippleEffect } from "@ionic/vue";
import { defineProps } from "vue";
import { useRouter } from "vue-router";
const props = defineProps(["target"]);
const router = useRouter();
</script>
<style scoped>
.tile {
  border: 3px;
  border-style: solid ;
  border-color: var(--ion-color-primary);
  border-radius: 15px;
  background-color: var(--ion-color-primary);
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 35px;
  font-size: large;
  font-weight: bold;
  cursor: pointer;
}
.ripple {
  border-radius: 15px;
}
.tile span {
  color: var(--ion-color-light)
}
</style>
