<template>
  <ion-page>
    <header-template :pageTitle="pageTitle">
      <ion-button v-if="canEditProfile" @click="toggleEditMode"><ion-icon slot="icon-only" :ios="editIcon.ios" :md="editIcon.md"></ion-icon></ion-button>
    </header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="isProfile">
        <info-card-component
          v-if="showFillingInfo"
          message="Nhésite pas à compléter ou corriger les champs si dessous. 
                    Ca rend l'utilisation de l'app plus facile."
        >
        </info-card-component>
        <ion-card class="ion-no-margin ion-margin-bottom ion-padding-bottom">
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
                <ion-select v-else v-model="modifiedProfile.role" cancel-text="Annuler" ok-text="OK" disabled="true">
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
                <ion-label position="stacked" color="primary">Épreuve du matin</ion-label>
                <ion-input v-if="!editMode" type="text" readonly="true">{{ userProfile.morningGame }}</ion-input>
                <ion-select v-else v-model="modifiedProfile.morningGame" cancel-text="Annuler" ok-text="OK">
                  <ion-select-option v-for="game in getGames()" :key="game" :value="game">{{ game }}</ion-select-option>
                </ion-select>
              </ion-item>
              <ion-item lines="full">
                <ion-label position="stacked" color="primary">Épreuve de l'après-midi</ion-label>
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
                <ion-button v-if="!editMode && isOwnProfile" expand="block" @click="logOut" color="danger"> Se déconnnecter </ion-button>
                <ion-button v-if="editMode" expand="block" color="success" @click="saveProfile"> Enregistrer </ion-button>
              </ion-col>
              <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
                <ion-button v-if="editMode && canDeleteProfile" expand="block" color="danger" @click="deleteAccount"> Supprimer le compte </ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card>
      </div>
      <div v-else class="not-found ion-padding">
        <strong class="capitalize">Nous n'avons pas trouvé ce profil...</strong>
        <p>Retour à <a @click="router.go(-1)">la page précédente</a></p>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonInput, IonText, IonButton, IonSelect, IonSelectOption, IonCard, IonGrid, IonRow, IonCol } from "@ionic/vue";
import { checkmarkOutline, checkmarkSharp, pencilOutline, pencilSharp, closeOutline, closeSharp } from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES, getRoleByValue, Profile, usersDefaults } from "@/services/users";
import { useRoute, useRouter } from "vue-router";
import { computed, onBeforeMount, ref } from "vue";
import { confirmPopup, errorPopup, loadingPopup, toastPopup } from "@/services/popup";
import InfoCardComponent from "../components/InfoCardComponent.vue";
import { stopMagnetar } from "@/services/magnetar";

const userStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// reactive data
const userId = ref(userStore.uid);
const modifiedProfile = ref<Profile>(usersDefaults());
const editMode = ref(false);

// lifecicle hooks

onBeforeMount(() => {
  userId.value = route.params.userId ? (route.params.userId as string) : userStore.uid;
});

// Computed variables

// The profile to be displayed in the current page
const userProfile = computed((): Profile => {
  return userStore.getProfile(userId.value) as Profile;
});
const isProfile = computed(() => {
  return userProfile.value?.email ? true : false;
});
const isOwnProfile = computed(() => {
  if(!route.params.userId) return false;
  return route.params.userId === userStore.uid;
});
const canEditProfile = computed(() => {
  if(userStore.profile.role >= ROLES.Moderateur) return true;
  return isOwnProfile.value;
});
const showFullProfile = computed(() => {
  return canEditProfile.value;
});
const canChangeRole = computed(() => {
  return userStore.profile.role >= ROLES.Administrateur;
});
const canDeleteProfile = computed(() => {
  if(userStore.profile.role >= ROLES.Administrateur) return true;
  return isOwnProfile.value;
});
const showFillingInfo = computed(() => {
  return isOwnProfile.value && !userStore.profile.totem && !userStore.profile.name;
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
const editIcon = computed(() => {
  return (editMode.value) ? {ios: closeOutline, md: closeSharp} : {ios: pencilOutline, md: pencilSharp}
});

// Methods
const toggleEditMode = () => {
  if (!editMode.value) modifiedProfile.value = userProfile.value;
  editMode.value = !editMode.value;
} 

const getTeams = () => {
  return ["1A", "2A", "3A"];
};
const getGames = () => {
  return ["1", "2", "3"];
};
const saveProfile = async () => {
  const loading = await loadingPopup();
  userStore.updateProfile(userId.value, modifiedProfile.value).then(() => {
    toastPopup("Le profil a bien été mis à jour");
    loading?.dismiss();
  });
  editMode.value = false;
};
const logOut = async () => {
  const loading = await loadingPopup("Déconnexion");
  await stopMagnetar();
  const result = await userStore.logout();
  if (result) router.replace("/guest");
  loading.dismiss();
};
const deleteAccount = async () => {
  const confirmTitle = "Es-tu sûr.e ?"
  const confirmMessage = "Cette opération supprimera toute les données liées à ton profil";
  const removeAccountHandler = async () => {
    const wasOwnProfile = isOwnProfile.value;
    const loading = await loadingPopup("Suppression du profil");
    try{
      await userStore.removeAccount(userId.value);
    } catch(error: any){
      errorPopup(`Une erreur est survenue durant la suppression du profil: ${error.message}`);
    }
    loading.dismiss();
    if (wasOwnProfile) await logOut();
  }
  confirmPopup(confirmMessage, removeAccountHandler, null, confirmTitle);
}
</script>

<style scoped></style>
