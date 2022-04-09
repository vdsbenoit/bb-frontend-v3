<template>
  <ion-page>
    <header-template :pageTitle="pageTitle"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card class="ion-no-margin ion-margin-bottom" v-if="showFillingInfo">
        <ion-card-content>
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
              <ion-label position="stacked">Nom</ion-label>
              <ion-input v-model="profile.name" name="name" type="text"></ion-input>
            </ion-item>
            <ion-item lines="full">
              <ion-label position="stacked">Section</ion-label>
              <ion-input v-model="profile.sectionName" name="section" type="text"></ion-input>
            </ion-item>
            <ion-item lines="full">
              <ion-label position="stacked" color="primary">Role</ion-label>
              <ion-select v-model="profile.role" cancel-text="Annuler" ok-text="OK">
                <ion-select-option v-for="(value, role) in ROLES" :key="value" :value="value">{{ role }}</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item lines="full">
              <ion-label position="stacked" color="primary">Équipe</ion-label>
              <ion-select v-model="profile.team" cancel-text="Annuler" ok-text="OK">
                <ion-select-option v-for="team in getTeams()" :key="team" :value="team">{{ team }}</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item lines="full">
              <ion-label position="stacked" color="primary">Jeu</ion-label>
              <ion-select v-model="profile.morningGame" cancel-text="Annuler" ok-text="OK">
                <ion-select-option v-for="game in getGames()" :key="game" :value="game">{{ game }}</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>
        </form>

        <ion-grid>
          <ion-row>
            <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
              <ion-button v-if="!editMode" expand="block" color="primary" @click="editMode=true"> Modifier </ion-button>
              <ion-button v-if="editMode" expand="block" color="success" @click="saveProfile"> Enregistrer </ion-button>
            </ion-col>
            <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
              <ion-button v-if="isOwnProfile && !editMode" expand="block" @click="logOut" color="danger"> Se déconnnecter </ion-button>
              <ion-button v-if="editMode" expand="block" color="danger" @click="editMode=false" > Annuler </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-card>
      <ion-text class="ion-padding" color="danger" :hidden="!user.error">
        <p class="ion-padding-start">{{ user.error }}</p>
      </ion-text>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonInput, IonText, IonButton, IonSelect, IonSelectOption, IonCard, IonCardContent,
IonGrid, IonRow, IonCol } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES, Profile, usersDefaults } from "@/services/users";
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { errorPopup } from "@/services/popup";

const user = useAuthStore();
const router = useRouter();
const route = useRoute();

const profile = ref<Profile>(usersDefaults());
const editMode = ref(false);

onMounted(async () => {
  if (isOwnProfile.value) {
    profile.value = user.profile;
  } else {
    try {
      profile.value = await user.getProfile(route.params.id as string);
    } catch (e: any) {
      errorPopup(e.message);
    }
  }
});

const isOwnProfile = computed(() => {
  return !route.params.id || route.params.id === user.uid;
});

const activeUserId = computed((): string => {
  return route.params.id ? (route.params.id as string) : user.uid;
});

const showFillingInfo = computed(() => {
  return isOwnProfile.value && !user.profile.totem && !user.profile.name;
});

const pageTitle = computed(() => {
  if (isOwnProfile.value) {
    return "Ton profil";
  } else {
    let name = "undefined";
    if (profile.value.totem) {
      name = profile.value.totem;
    } else if (profile.value.name) {
      name = profile.value.name;
    } else if (profile.value.email) {
      name = profile.value.email;
    }
    return `Profil de ${name}`;
  }
});

const getTeams = () => {
  return ["A1", "A2", "A3"];
};
const getGames = () => {
  return ["1", "2", "3"];
};

const saveProfile = async () => {
  user.updateProfile(activeUserId.value, profile.value);
};
const logOut = async () => {
  await user.logout();
};
</script>

<style scoped>
</style>
