<template>
  <ion-page>
    <header-template :pageTitle="pageTitle"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="store.isLoggedIn">
        <form>
          <ion-list>
            <ion-item lines="full">
              <ion-label position="floating">totem</ion-label>
              <ion-input v-model="profile.totem" name="totem" type="text"></ion-input>
            </ion-item>
          </ion-list>
        </form>

        <ion-button v-if="!props.id || props.id != store.uid" expand="block" @click="logOut" color="danger">
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
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonInput, IonText, IonButton } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import LoginComponent from "@/components/LoginComponent.vue";
import { useAuthStore, fbGetUserProfile, Profile, emptyProfile} from "@/services";
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
</script>

<style scoped>
</style>