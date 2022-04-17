<template>
  <ion-page>
    <header-template pageTitle="Connexion"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
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
            <ion-input v-model="email" name="email" type="email" inputmode="email" autocomplete="email" required autocapitalize="off" clear-input="true"></ion-input>
          </ion-item>
          <ion-button expand="block"  @click="sendEmail" :color="sendButtonColor">
              <ion-spinner v-if="isSendingEmail"></ion-spinner>
              <span v-else>{{sendButtonText}}</span>
          </ion-button>
        </ion-list>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonInput, IonText, IonButton, IonSpinner } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore } from "@/services/users";
import { loadingPopup, toastPopup } from "@/services/popup";
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { defineProps } from "vue";
import { computed } from "@vue/reactivity";

const props = defineProps(["validation"]);
const user = useAuthStore();
const { sendSignInEmail, processSignInLink } = user;
const router = useRouter();
const route = useRoute();

// reactive data

const email = ref("");
const isSendingEmail = ref(false);
const isEmailSent = ref(false);

// computed data

const sendButtonText = computed(() => {
  return isEmailSent.value ? "Renvoyer" : "Envoyer";
});
const sendButtonColor = computed(() => {
  return isEmailSent.value ? "medium": "primary";
})

// methods

const sendEmail = async () => {
  isSendingEmail.value = true;
  await sendSignInEmail(email.value);
  isEmailSent.value = true;
  toastPopup("On t'a envoyé un email<br/>Clique sur le lien qui s'y trouve pour te connecter", 10000);
  isSendingEmail.value = false;
};

onMounted(async () => {
  if (props.validation) {
    const success = await processSignInLink(window.location.href);
    if (success) router.replace("/home");
  }
});
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
