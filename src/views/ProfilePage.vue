<template>
  <ion-page>
    <header-template :pageTitle="pageTitle">
      <ion-button v-if="canEditProfile" @click="toggleEditMode">
        <ion-spinner v-if="isUpdating"></ion-spinner>
        <ion-icon v-else slot="icon-only" :ios="editIcon.ios" :md="editIcon.md"></ion-icon>
      </ion-button>
    </header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="isProfile">
        <info-card-component class="ion-no-margin ion-margin-bottom" v-if="showFillingInfo"> 
          Nhésite pas à compléter ou corriger les champs si dessous. Ca rend l'utilisation de l'app plus facile.
        </info-card-component>
        <ion-card class="ion-no-margin ion-margin-bottom ion-padding-bottom">
          <ion-list>
            <ion-item lines="full">
              <ion-label position="stacked" color="primary">Totem</ion-label>
              <ion-input v-if="editMode" v-model="modifiedProfile.totem" name="totem" type="text" autocorrect="off"></ion-input>
              <ion-input v-else name="totem" type="text" readonly="true" inputmode="none">{{ userProfile.totem }}</ion-input>
            </ion-item>
            <ion-item lines="full">
              <ion-label position="stacked" color="primary">Nom</ion-label>
              <ion-input v-if="editMode" v-model="modifiedProfile.name" name="name" type="text"></ion-input>
              <ion-input v-else name="name" type="text" readonly="true" inputmode="none">{{ userProfile.name }}</ion-input>
            </ion-item>
            <ion-item lines="full">
              <ion-label position="stacked" color="primary">Catégorie</ion-label>
              <ion-select v-if="editMode && isPlayer" v-model="modifiedProfile.category" cancel-text="Annuler">
                <ion-select-option v-for="(category, index) in categories" :key="index" :value="category">{{ category }}</ion-select-option>
              </ion-select>
              <ion-input v-else name="category" type="text" readonly="true">{{ userProfile.category }}</ion-input>
            </ion-item>
            <ion-item lines="full">
              <ion-label position="stacked" color="primary">Section</ion-label>
              <ion-select v-if="editMode && modifiedProfile.category && categorySections.size > 0" v-model="modifiedProfile.sectionId" cancel-text="Annuler">
                <ion-select-option v-for="section in categorySections.values()" :key="section.id" :value="section.id">{{ section.name }}</ion-select-option>
              </ion-select>
              <p v-if="editMode && !modifiedProfile.category" class="missing-field-alert">Selectionne d'abord une catégorie</p>
              <ion-input v-if="!editMode" name="section" type="text" readonly="true" @click="goToSectionPage(userProfile.sectionId)">{{ userProfile.sectionName }}</ion-input>
            </ion-item>
            <ion-item lines="full" v-if="isPlayer">
              <ion-label position="stacked" color="primary">Équipe</ion-label>
              <ion-select v-if="editMode && modifiedProfile.sectionId && sectionTeams.length > 0" v-model="modifiedProfile.team" cancel-text="Annuler">
                <ion-select-option v-for="team in sectionTeams" :key="team" :value="team">{{ team }}</ion-select-option>
              </ion-select>
              <p v-if="editMode && !modifiedProfile.sectionId" class="missing-field-alert">Selectionne d'abord une section</p>
              <ion-input v-if="!editMode" type="text" readonly="true" inputmode="none" @click="goToTeamPage(userProfile.team)">{{ userProfile.team }}</ion-input>
            </ion-item>
            <div v-if="showFullProfile">
              <ion-item lines="full" v-if="isLeader">
                <ion-label position="stacked" color="primary">Épreuve du matin</ion-label>
                <ion-select v-if="editMode && editGames" v-model="modifiedProfile.morningGame" cancel-text="Annuler">
                  <ion-select-option v-for="game in games.values()" :key="game.id" :value="game.id"> {{ isGameFullEmoji(game.morningLeaders) }}{{ game.id }} - {{ game.name }} </ion-select-option>
                </ion-select>
                <ion-input v-else type="text" readonly="true" inputmode="none" @click="goToGamePage(userProfile.morningGame)">
                  <span v-if="userProfile.morningGame">{{ userProfile.morningGame }}: {{ getGameName(userProfile.morningGame) }}</span>
                </ion-input>
                <ion-icon v-if="editMode && !editGames" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="loadGames"></ion-icon>
              </ion-item>
              <ion-item lines="full" v-if="isLeader">
                <ion-label position="stacked" color="primary">Épreuve de l'après-midi</ion-label>
                <ion-select v-if="editMode && editGames" v-model="modifiedProfile.afternoonGame" cancel-text="Annuler">
                  <ion-select-option v-for="game in games.values()" :key="game.id" :value="game.id" color="danger"> {{ isGameFullEmoji(game.afternoonLeaders) }}{{ game.id }} - {{ game.name }} </ion-select-option>
                </ion-select>
                <ion-input v-else type="text" readonly="true" inputmode="none" @click="goToGamePage(userProfile.afternoonGame)">
                  <span v-if="userProfile.afternoonGame">{{ userProfile.afternoonGame }}: {{ getGameName(userProfile.afternoonGame) }}</span>
                </ion-input>
                <ion-icon v-if="editMode && !editGames" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="loadGames"></ion-icon>
              </ion-item>
              <ion-item lines="full">
                <ion-label position="stacked" color="primary">Role</ion-label>
                <ion-select v-if="editMode && canSetRole" v-model="modifiedProfile.role" cancel-text="Annuler">
                  <ion-select-option v-for="(value, role) in ROLES" :key="value" :value="value">{{ role }}</ion-select-option>
                </ion-select>
                <ion-input v-else type="text" readonly="true" inputmode="none">{{ getRoleByValue(userProfile.role) }}</ion-input>
              </ion-item>
              <ion-item lines="full" v-if="editMode && !canSetRole && isOwnProfile">
                <ion-button v-if="userProfile.promotionRequested" expand="block" color="medium" disabled="true">
                  <ion-spinner v-if="isRequestingPromotion"></ion-spinner>
                  <span v-else>Promotion demandée</span>
                </ion-button>
                <ion-button v-else expand="block" color="primary" @click="requestPromotion">
                  <ion-spinner v-if="isRequestingPromotion"></ion-spinner>
                  <span v-else>Demander une promotion</span>
                </ion-button>
              </ion-item>
              <ion-item lines="full">
                <ion-label position="stacked" color="primary">Adresse email</ion-label>
                <ion-input type="text" readonly="true" inputmode="none">{{ userProfile.email }}</ion-input>
              </ion-item>
            </div>
          </ion-list>
          <ion-grid class="ion-no-padding">
            <ion-row>
              <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
                <ion-button v-if="!editMode && isOwnProfile" expand="block" class="ion-margin-top" color="danger" @click="logOut"> Se déconnnecter </ion-button>
                <ion-button v-if="editMode" expand="block" class="ion-margin-top" color="success" @click="saveProfile" :disabled="isUpdating">
                  <ion-spinner v-if="isUpdating"></ion-spinner>
                  <span v-else>Enregistrer</span>
                </ion-button>
              </ion-col>
              <ion-col size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
                <ion-button v-if="editMode && canDeleteProfile" expand="block" class="ion-margin-top" color="danger" @click="deleteAccount"> Supprimer le compte </ion-button>
                <ion-button slot="end" expand="block" color="medium" @click="requestPromotion">Demander promotion</ion-button>
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
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonCard, IonGrid, IonRow, IonCol, IonIcon, IonSpinner } from "@ionic/vue";
import { pencilOutline, pencilSharp, closeOutline, closeSharp } from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES, getRoleByValue, Profile, usersDefaults } from "@/services/users";
import { useRoute, useRouter } from "vue-router";
import { computed, onBeforeMount, ref, watch } from "vue";
import { confirmPopup, errorPopup, loadingPopup, toastPopup } from "@/services/popup";
import InfoCardComponent from "../components/InfoCardComponent.vue";
import { stopMagnetar } from "@/services/magnetar";
import { getAppSettings, getMaxGameLeaders } from "@/services/settings";
import { getCategorySections, getSection } from "@/services/sections";
import { getAllGames, getGameName, setMorningLeader, setAfternoonLeader, removeAfternoonLeader, removeMorningLeader } from "@/services/games";

const userStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// reactive data
const userId = ref(userStore.uid);
const modifiedProfile = ref(usersDefaults());
const editMode = ref(false);
const editGames = ref(false);
const games = ref();
const isUpdating = ref(false);
const isRequestingPromotion = ref(false);

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
  if (!route.params.userId) return true;
  return route.params.userId === userStore.uid;
});
const canEditProfile = computed(() => {
  if (userStore.profile.role >= ROLES.Modérateur) return true;
  return isOwnProfile.value;
});
const isPlayer = computed(() => {
  return userProfile.value.role == ROLES.Participant;
});
const isLeader = computed(() => {
  return userProfile.value.role >= ROLES.Animateur; 
});
const showFullProfile = computed(() => {
  return canEditProfile.value;
});
const canSetRole = computed(() => {
  return userStore.profile.role >= ROLES.Administrateur;
});
const canDeleteProfile = computed(() => {
  if (userStore.profile.role >= ROLES.Administrateur) return true;
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
  return editMode.value ? { ios: closeOutline, md: closeSharp } : { ios: pencilOutline, md: pencilSharp };
});
const categories = computed(() => {
  return getAppSettings.value?.categories;
});
const categorySections = computed(() => {
  return modifiedProfile.value.category ? getCategorySections(modifiedProfile.value.category) : new Map();
});
const sectionTeams = computed((): string[] => {
  if(modifiedProfile.value.sectionId){
    const section = getSection(modifiedProfile.value.sectionId);
    return section?.teams ?? [];
  } else return [];
});

// Watchers
watch(
  () => modifiedProfile.value.category,
  (newCategory, oldCategory) => {
    if(newCategory && oldCategory && newCategory != oldCategory) {
      modifiedProfile.value.sectionId = "";
      modifiedProfile.value.team = "";
    }
  }
);
watch(
  () => modifiedProfile.value.sectionId,
  (newSectionId, oldSectionId) => {
    if(newSectionId && oldSectionId && newSectionId != oldSectionId) {
      modifiedProfile.value.team = "";
    }
  }
);

// Methods

const toggleEditMode = () => {
  if (!editMode.value) modifiedProfile.value = { ...userProfile.value }; // deep copy
  editMode.value = !editMode.value;
};
const loadGames = () => {
  games.value = getAllGames();
  editGames.value = true;
};
const goToSectionPage = (sectionId: string) => {
  if (sectionId) router.push(`/sections/${sectionId}`);
};
const goToTeamPage = (teamId: string) => {
  if (teamId) router.push(`/team/${teamId}`);
};
const goToGamePage = (gameId: number) => {
  if (editMode.value) loadGames();
  else if (gameId) router.push(`/game/${gameId}`);
};
const filterObject = (obj: any, acceptedKeys: string[]) => {
  return Object.fromEntries(Object.entries(obj).filter(([key, val]) => acceptedKeys.includes(key)));
};
const saveProfile = async () => {
  let newProfile = { ...modifiedProfile.value }; // deep copy before transformation
  const toUpdateKeys = ["totem", "name", "category", "role"];
  isUpdating.value = true;
  let morningGamePromise = null;
  let afternoonGamePromise = null;
  if (newProfile.sectionId) {
    const section = getSection(newProfile.sectionId);
    newProfile.sectionName = section?.name ?? "Not found";
    toUpdateKeys.push("sectionId", "sectionName");
    if (newProfile.sectionName == "Not found") console.error("Cannot retrieve section name");
  }
  if (newProfile.team) toUpdateKeys.push("team");
  // Treat games separately
  if (newProfile.morningGame && newProfile.morningGame != userProfile.value.morningGame) {
    console.log("Updating morning game");
    morningGamePromise = setMorningLeader(newProfile.morningGame, userId.value).catch((error) => {
      errorPopup(`Le jeu du matin n'a pas pu être mis à jour : ${error.message}`);
    });
  }
  if (newProfile.afternoonGame && newProfile.afternoonGame != userProfile.value.afternoonGame) {
    console.log("Updating afternoon game");
    afternoonGamePromise = setAfternoonLeader(newProfile.afternoonGame, userId.value).catch((error) => {
      errorPopup(`Le jeu de l'après midi n'a pas pu être mis à jour : ${error.message}`);
    });
  }
  await Promise.all([morningGamePromise, afternoonGamePromise]);
  // filter keys to be updated
  newProfile = filterObject(newProfile, toUpdateKeys);
  userStore
    .updateProfile(userId.value, newProfile)
    .then(() => {
      toastPopup("Le profil a été mis à jour");
      isUpdating.value = false;
    })
    .catch((error: any) => {
      errorPopup(`Le n'a pas pu être mis à jour : ${error.message}`);
      isUpdating.value = false;
    });
  editMode.value = false;
  editGames.value = false;
};
const logOut = () => {
  confirmPopup("Es-tu certain.e de vouloir te déconnecter ?", async () => {
    const loading = await loadingPopup("Déconnexion");
    await stopMagnetar();
    const result = await userStore.logout();
    if (result) router.replace("/home");
    loading.dismiss();
  });
};
const deleteAccount = async () => {
  const confirmTitle = "Es-tu sûr.e ?";
  const confirmMessage = "Cette opération supprimera toute les données liées à ton profil";
  const removeAccountHandler = async () => {
    const wasOwnProfile = isOwnProfile.value;
    const loading = await loadingPopup("Suppression du profil");
    let removeMorningGamePromise = null;
    let removeAfternoonGamePromise = null;
    try {
      if (userProfile.value.morningGame) removeMorningGamePromise = removeMorningLeader(userProfile.value.morningGame, userId.value);
      if (userProfile.value.afternoonGame) removeAfternoonGamePromise = removeAfternoonLeader(userProfile.value.afternoonGame, userId.value);
      const removeAccountPromise = userStore.removeAccount(userId.value);
      await Promise.all([removeMorningGamePromise, removeAfternoonGamePromise, removeAccountPromise]);
    } catch (error: any) {
      errorPopup(`Une erreur est survenue durant la suppression du profil: ${error.message}`);
    }
    loading.dismiss();
    if (wasOwnProfile) await logOut();
  };
  confirmPopup(confirmMessage, removeAccountHandler, null, confirmTitle);
};
const requestPromotion = () => {
  if (userProfile.value.promotionRequested) return errorPopup("Tu as déjà demandé une promotion");
  isRequestingPromotion.value = true;
  userStore
    .updateProfile(userId.value, { promotionRequested: true })
    .then(() => {
      toastPopup("Une demande de promotion a été envoyé aux administrateurs");
      isRequestingPromotion.value = false;
    })
    .catch((error: any) => {
      errorPopup(`La requête à échoué: ${error.message}`);
      isRequestingPromotion.value = false;
    });
};
const isGameFullEmoji = (leaders: string[]): string => {
  return leaders.length >= getMaxGameLeaders() ? "❌ " : "";
};
</script>

<style scoped>
ion-select {
  width: 100%;
  max-width: 100%;
}
.missing-field-alert {
  color: var(--ion-color-danger);
  font-size: small;
  text-align: center;
  margin: auto auto;
}
</style>
