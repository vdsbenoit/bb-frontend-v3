<template>
    <div class="logo">
        <img src="@/assets/img/Logo-bb.png" alt="Logo Baden Battle" />
    </div>
    <ion-text class="ion-text-center">
              <p>Connecte-toi pour accéder à ce contenu</p>
        </ion-text>
        <form v-on:submit.prevent="sendEmail">
          <ion-list>
          <ion-item lines="full">
            <ion-label position="floating">Email</ion-label>
            <ion-input v-model="email" name="email" type="email" required autocapitalize="off"></ion-input>
          </ion-item>
          <ion-button expand="block" @click="sendEmail" >Envoyer un email</ion-button>
          </ion-list>
        </form>
</template>

<script setup lang="ts">
import { IonList, IonItem, IonLabel, IonInput, IonText, IonButton, loadingController } from "@ionic/vue";
import { useAuthStore } from "@/services";
import { ref } from "vue";

const store = useAuthStore();
const { sendSignInEmail } = store;
const email = ref("");

const sendEmail = async () => {
  const timeout = 120;
  const loading = await loadingController
    .create({
      message: 'Chargement...',
      duration: timeout,
    });
  setTimeout(() => loading.dismiss(), timeout);
  await sendSignInEmail(email.value);
  loading.dismiss()
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