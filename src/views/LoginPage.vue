<template>
  <ion-page>
    <header-template pageTitle="Connexion"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
        <div class="logo">
          <img src="@/assets/img/Logo-bb.png" alt="Logo Baden Battle" />
        </div>

        <ion-text class="ion-padding" color="danger" :hidden="!store.error">
              <p class="ion-padding-start">{{ store.error }}</p>
        </ion-text>

        <form>
          <ion-list>
          <ion-item lines="full">
            <ion-label position="floating">Email</ion-label>
            <ion-input v-model="email" type="email" required></ion-input>
          </ion-item>
          <ion-item lines="full">
            <ion-label position="floating">Password</ion-label>
            <ion-input v-model="password" type="password" required></ion-input>
          </ion-item>
          <ion-button expand="block" @click="doLogin">Log In</ion-button>
          </ion-list>
        </form>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonInput, IonText, IonButton } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore } from "@/services";
import { useRouter } from "vue-router";
import { ref } from "vue";

const store = useAuthStore();
const { logInUser } = store;
const router = useRouter();
const email = ref("");
const password = ref("");

const doLogin = async () => {
  await logInUser(email.value, password.value);
  router.replace("/home");
};
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

ion-button {
  margin: 15px;
}

</style>