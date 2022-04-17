<template>
  <ion-page>
    <header-template pageTitle="Bientôt"></header-template>
    <ion-content :fullscreen="true">
      <div class="logo">
          <img src="@/assets/img/Logo-bb.png" alt="Logo Baden Battle" />
      </div>
      <h1 color="primary">Bienvenue</h1>
      <p>
        Pour utiliser cette app, il faut d'abord
        <ion-button class="ion-text-lowercase ion-margin-top" color="primary" @click="router.push('/login')">te connecter</ion-button>
      </p>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonButton } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<style scoped>
.logo {
  background-color: var(--ion-background-color);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: min(1%, 20px);
  width: 100%;
  height: 30%;
  margin-bottom: 20px;
}
.logo img {
  max-width: 100%;
  max-height: 100%;
}
h1 {
  text-align: center;
  color: var(--ion-color-primary);
  font-size: 40px;
}
p {
  text-align: center;
  line-height: 30px;
}
</style>