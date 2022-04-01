<template>
  <ion-page>
    <header-template :pageTitle="pageTitle"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="store.isLoggedIn">
      <ion-card class="ion-no-margin ion-margin-bottom" :class="showFillingInfo">
        <ion-card-content >
          <p>Libre à toi de compléter les champs si dessous. Ca rendra l'utilisation de l'application plus facile</p>
        </ion-card-content>
      </ion-card>
      <ion-card class="ion-no-margin ion-margin-bottom">
        <form>
          <ion-list>
            <ion-item lines="full">
              <ion-label position="stacked">Totem</ion-label>
              <ion-input v-model="profile.totem" name="totem" type="text"></ion-input>
            </ion-item>
            <ion-item lines="full">
              <ion-label position="stacked">Prénom</ion-label>
              <ion-input v-model="profile.firstName" name="firstName" type="text"></ion-input>
            </ion-item>
            <ion-item lines="full">
              <ion-label position="stacked">Nom de famille</ion-label>
              <ion-input v-model="profile.lastName" name="lastName" type="text"></ion-input>
            </ion-item>
            <ion-item lines="full">
              <ion-label position="stacked" color="primary">Role</ion-label>
              <ion-select v-model="profile.role" cancel-text="Annuler" ok-text="OK">
                <ion-select-option v-for="(value, role) in ROLES" :key="value" :value="value">{{role}}</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item lines="full">
              <ion-label position="stacked" color="primary">Équipe</ion-label>
              <ion-select v-model="profile.team" cancel-text="Annuler" ok-text="OK">
                <ion-select-option v-for="team in getTeams()" :key="team" :value="team">{{team}}</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item lines="full">
              <ion-label position="stacked" color="primary">Jeu</ion-label>
              <ion-select v-model="profile.game" cancel-text="Annuler" ok-text="OK">
                <ion-select-option v-for="game in getGames()" :key="game" :value="game">{{game}}</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>
        </form>
      </ion-card>
        <ion-button @click="saveProfile" expand="block" color="success">
          Enregistrer
        </ion-button>
        <ion-button v-if="isOwnProfile" expand="block" @click="logOut" color="danger">
          Se déconnnecter
        </ion-button>
        
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
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonInput, IonText, IonButton, IonSelect, IonSelectOption, IonCard, IonCardContent } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import LoginComponent from "@/components/LoginComponent.vue";
import { useAuthStore, fbGetUserProfile, Profile, emptyProfile, ROLES, fbSetUserProfile} from "@/services";
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { defineProps } from "vue";

const props = defineProps(["validation", "id"]);
const store = useAuthStore();
const { processSignInLink, logoutUser } = store;
const router = useRouter();
const route = useRoute();

const profile = ref<Profile>(emptyProfile());

const isOwnProfile = computed(() => {
  return !route.params.id || route.params.id === store.uid;
});

const activeUserId = computed(() : string => {
  return route.params.id ? route.params.id as string : store.uid
});

const showFillingInfo = computed(() => {
  return !store.profile.totem || !store.profile.firstName || !store.profile.lastName ? "" : "ion-hide"
});

const getTeams = () => {
  return ["A1", "A2", "A3"];
}
const getGames = () => {
  return ["1", "2", "3"];
}

const pageTitle = computed(() => {
  if (!store.isLoggedIn) return "Connexion";
  if (isOwnProfile.value){
    return "Ton profil"
  } else {
    let name = "undefined";
    if (profile.value.totem) {
      name = profile.value.totem;
    } else if (profile.value.firstName) {
      name = profile.value.firstName;
    } else if (profile.value.email) {
      name = profile.value.email;
    }
    return `Profil de ${name}`;
  }
});
onMounted(async () => {
  if (props.validation) {
    await processSignInLink(window.location.href);
    router.replace("/profile");
  }
  if (isOwnProfile.value) {
    profile.value = store.profile;
  } else {
    try {
      profile.value = await fbGetUserProfile(route.params.id as string);
    } catch (e: any) {
      store.error = e;
    }
  }
});
const logOut = async () => {
  await logoutUser();
};
const saveProfile = async () => {
  fbSetUserProfile(activeUserId.value, profile.value);
};
</script>

<style scoped>
</style>