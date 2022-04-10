<template>
  <ion-page>
    <header-template :pageTitle="pageTitle"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="isProfile">
        <info-card-component
          v-if="showFillingInfo"
          message="Nhésite pas à compléter ou corriger les champs si dessous. 
                    Ca rend l'utilisation de l'app plus facile."
        >
        </info-card-component>
        <ion-card class="ion-no-margin ion-margin-bottom">
          <form>
            <ion-list>
              <ion-item lines="full">
                <ion-label position="stacked" color="primary">Totem</ion-label>
                <ion-input v-if="editMode" v-model="modifiedProfile.totem" name="totem" type="text" autocorrect="off"></ion-input>
                <ion-input v-if="!editMode" v-model="userProfile.totem" name="totem" type="text" readonly="true"></ion-input>
              </ion-item>
              <ion-item lines="full">
                <ion-label position="stacked" color="primary">Nom</ion-label>
                <ion-input v-if="editMode" v-model="modifiedProfile.name" name="name" type="text"></ion-input>
                <ion-input v-if="!editMode" v-model="userProfile.name" name="name" type="text" readonly="true"></ion-input>
              </ion-item>
              <ion-item lines="full">
                <ion-label position="stacked" color="primary">Section</ion-label>
                <ion-input v-if="editMode" v-model="modifiedProfile.sectionName" name="section" type="text" autocomplete="given-name"></ion-input>
                <ion-input v-if="!editMode" v-model="userProfile.sectionName" name="section" type="text" readonly="true"></ion-input>
              </ion-item>
              <ion-item lines="full">
                <ion-label position="stacked" color="primary">Role</ion-label>
                <ion-input v-if="!editMode" type="text" readonly="true">{{ getRoleByValue(userProfile.role) }}</ion-input>
                <ion-select v-else v-model="modifiedProfile.role" cancel-text="Annuler" ok-text="OK">
                  <ion-select-option v-for="(value, role) in ROLES" :key="value" :value="value">{{ role }}</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item lines="full">
                <ion-label position="stacked" color="primary">Équipe</ion-label>
                <ion-input v-if="!editMode" type="text" readonly="true">{{ userProfile.team }}</ion-input>
                <ion-select v-else v-model="modifiedProfile.team" cancel-text="Annuler" ok-text="OK">
                  <ion-select-option v-for="team in getTeams()" :key="team" :value="team">{{ team }}</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item lines="full">
                <ion-label position="stacked" color="primary">Jeu du matin</ion-label>
                <ion-input v-if="!editMode" type="text" readonly="true">{{ userProfile.morningGame }}</ion-input>
                <ion-select v-else v-model="modifiedProfile.morningGame" cancel-text="Annuler" ok-text="OK">
                  <ion-select-option v-for="game in getGames()" :key="game" :value="game">{{ game }}</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item lines="full">
                <ion-label position="stacked" color="primary">Jeu de l'après-midi</ion-label>
                <ion-input v-if="!editMode" type="text" readonly="true">{{ userProfile.afternoonGame }}</ion-input>
                <ion-select v-else v-model="modifiedProfile.afternoonGame" cancel-text="Annuler" ok-text="OK">
                  <ion-select-option v-for="game in getGames()" :key="game" :value="game">{{ game }}</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-list>
          </form>

          <ion-grid>
            <ion-row>
              <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
                <ion-button v-if="!editMode" expand="block" color="primary" @click="editProfile"> Modifier </ion-button>
                <ion-button v-if="editMode" expand="block" color="success" @click="saveProfile"> Enregistrer </ion-button>
              </ion-col>
              <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
                <ion-button v-if="isOwnProfile && !editMode" expand="block" @click="logOut" color="danger"> Se déconnnecter </ion-button>
                <ion-button v-if="editMode" expand="block" color="danger" @click="editMode = false"> Annuler </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card>
        <ion-text class="ion-padding" color="danger" :hidden="!user.error">
          <p class="ion-padding-start">{{ user.error }}</p>
        </ion-text>
      </div>
      <div v-else class="not-found ion-padding">
        <strong class="capitalize">Nous n'avons pas trouvé ce profil...</strong>
        <p>Retour à <a @click="router.go(-1)">la page précédente</a></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonInput, IonText, IonButton, IonSelect, IonSelectOption, IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonIcon } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES, getRoleByValue, Profile, usersDefaults } from "@/services/users";
import { useRoute, useRouter } from "vue-router";
import { computed, onBeforeMount, onMounted, ref } from "vue";
import { errorPopup, toastPopup } from "@/services/popup";
import InfoCardComponent from "../components/InfoCardComponent.vue";

const user = useAuthStore();
const router = useRouter();
const route = useRoute();

// reactive data
const isOwnProfile = ref(false);
const userId = ref(user.uid);
const modifiedProfile = ref<Profile>(usersDefaults());
const editMode = ref(false);

// lifecicle hooks

onBeforeMount(() => {
  userId.value = route.params.userId ? (route.params.userId as string) : user.uid;
  isOwnProfile.value = !route.params.userId || route.params.userId === user.uid;
})

// Computed variables

// The profile to be displayed in the current page
const userProfile = computed((): Profile => {
  return user.getProfile(userId.value) as Profile;
});
const isProfile = computed(() => {
  return userProfile.value?.email ? true : false;
});
const showFillingInfo = computed(() => {
  return isOwnProfile.value && !user.profile.totem && !user.profile.name;
});
const pageTitle = computed(() => {
  if (isOwnProfile.value) {
    return "Ton profil";
  } else if (!isProfile.value) {
    return "Profil inconnu";
  } else {
    let name = userProfile.value.email;
    if (userProfile.value.totem) {
      name = userProfile.value.totem;
    } else if (userProfile.value.name) {
      name = userProfile.value.name;
    }
    return `Profil de ${name}`;
  }
});

// Methods

const getTeams = () => {
  return ["A1", "A2", "A3"];
};
const getGames = () => {
  return ["1", "2", "3"];
};
const editProfile = () => {
  editMode.value = true;
  modifiedProfile.value = userProfile.value;
};
const saveProfile = async () => {
  user.updateProfile(userId.value, modifiedProfile.value).then(() => {
    toastPopup("Le profil a bien été mis à jour");
  });
  editMode.value = false;
};
const logOut = async () => {
  await user.logout();
};
</script>

<style scoped>
</style>
