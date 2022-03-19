<template>
  <ion-page>
    <header-template pageTitle="Connexion"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="store.isLoggedIn">
        <p>You are logged as {{ store.user.email }}</p>

        <ion-button expand="block" @click="logOut" color="danger">Se déconnnecter</ion-button>
      </div>
      <div v-else>
        <login-component></login-component>
      </div>
      <ion-text class="ion-padding" color="danger" :hidden="!store.error">
        <p class="ion-padding-start">{{ store.error }}</p>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonInput, IonText, IonButton } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import LoginComponent from "@/components/LoginComponent.vue";
import { useAuthStore } from "@/services";
import { useRoute, useRouter } from "vue-router";
import { onMounted } from "vue";
import { defineProps } from "vue";

const props = defineProps(['validation']);
const store = useAuthStore();
const { processSignInLink, logoutUser } = store;
const router = useRouter();
const route = useRoute();

onMounted(async () => {
  if (props.validation) {
    console.log(`validation : ${props.validation}`);
    await processSignInLink(window.location.href);
    router.replace("/profile");
  }
});

const logOut = async () => {
  await logoutUser();
};
</script>

<style scoped>
</style>