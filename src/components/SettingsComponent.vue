<template>
  <form>
    <ion-list>
      <ion-item lines="full">
        <ion-label position="floating">totem</ion-label>
        <ion-input  name="totem" type="text"></ion-input>
      </ion-item>
    </ion-list>
  </form>

  <ion-text class="ion-padding" color="danger" :hidden="!store.error">
    <p class="ion-padding-start">{{ store.error }}</p>
  </ion-text>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonInput, IonText, IonButton } from "@ionic/vue";
import { defineProps } from "vue";
import { useAuthStore } from "@/services";
import { ref } from "vue";

const store = useAuthStore();

</script>
