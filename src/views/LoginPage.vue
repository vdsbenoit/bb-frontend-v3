<template>
  <ion-page>
    <header-template pageTitle="Connexion"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="logo">
        <img src="@/assets/img/Logo-bb.png" alt="Logo Baden Battle" />
      </div>
      <ion-text class="ion-text-center" v-if="props.redirect">
        <p>Connecte-toi pour accéder à ce contenu</p>
      </ion-text>
      <form v-on:submit.prevent="sendEmail">
        <ion-list  id="login-form">
          <ion-item lines="full">
            <ion-label position="stacked">Email</ion-label>
            <ion-input placeholder="Entre ton email ici" v-model="email" name="email" type="email" inputmode="email" autocomplete="email" required autocapitalize="off" clear-input="true"></ion-input>
          </ion-item>
          <ion-item lines="none">
          <ion-checkbox slot="start" class="ion-no-margin ion-margin-end" v-model="dgprChecked"></ion-checkbox>
          <ion-label class="">J'accepte les <a @click="showPrivacyNotice">conditions d'utilisation</a></ion-label>
          </ion-item>
          <ion-button expand="block"  @click="sendEmail" :color="sendButtonColor" :disabled="!dgprChecked">
              <ion-spinner v-if="isSendingEmail"></ion-spinner>
              <span v-else>{{sendButtonText}}</span>
          </ion-button>
        </ion-list>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonInput, IonText, IonButton, IonSpinner, IonCheckbox } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore } from "@/services/users";
import { errorPopup, infoPopup, toastPopup } from "@/services/popup";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { defineProps } from "vue";
import { computed } from "@vue/reactivity";

const props = defineProps(["validation", "redirect"]);
const user = useAuthStore();
const { sendSignInEmail, processSignInLink } = user;
const router = useRouter();

// reactive data

const email = ref("");
const isSendingEmail = ref(false);
const isEmailSent = ref(false);
const dgprChecked = ref(false);

// lifecicle hooks

onMounted(async () => {
  if (props.validation) {
    const success = await processSignInLink(window.location.href);
    if (success) router.replace("/home");
  }
});

// computed data

const sendButtonText = computed(() => {
  return isEmailSent.value ? "Renvoyer un mail" : "Ca part";
});
const sendButtonColor = computed(() => {
  return isEmailSent.value ? "medium": "primary";
})

// methods

const sendEmail = async () => {
  if (!dgprChecked.value || !email.value) return;
  isSendingEmail.value = true;
  try {
    await sendSignInEmail(email.value);
    isEmailSent.value = true;
    toastPopup("On t'a envoyé un email<br/>Clique sur le lien qui s'y trouve pour te connecter", 10000);
  } catch(error: any){
    errorPopup(`Impossible de se connecter: ${error.message}`)
  }
  isSendingEmail.value = false;
};

const showPrivacyNotice = () => {
  const privacyNotice = `
  Pour le bon fonctionnement de l'application, des données liées à utilisateur sont enregistrées telles que son nom, 
  son totem, le nom de sa section, la ville de sa section et son adresse email.<br/><br/>
  Ces données sont partagées à l'application par l'utilisateur de manière volontaire. 
  A tout moment, l'utilisateur peut supprimer son profil ainsi que toutes les données qui y sont liées. 
  Les données des utilisateurs sont effacées chaque année.<br/><br/>
  Les utilisateurs ne peuvent voir que le totem, le nom et la section des autres utilisateurs. 
  Seuls les modérateurs & administrateurs de l'application peuvent voir les profils des autres utilisateurs.<br/><br/>
  La base de donnée est localisée en Europe, sur le serveur europe-west3 appartenant à Google et situé à Francfort. 
  Cette application a été développée dans un but non-commercial. Aucune donnée n'est revendue à des tiers.<br/><br/>
  Cette application est la propriété de Benoit Vander Stappen. 
  Pour toute question relative à ces conditions, veuillez le contacter sur <a href="mailto:vdsbenoit@gmail.com"> son adresse email</a>.  
  `;
  infoPopup(privacyNotice, "Vie privée & utilisation des données");
}

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
  margin-top:5px;
}
.logo img {
  max-width: 100%;
  max-height: 100%;
}
ion-button {
  margin: 15px;
}
#login-form {
  max-width: 400px;
  margin: 0 auto;
}
</style>
