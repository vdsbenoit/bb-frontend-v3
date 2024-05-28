<template>
  <ion-page>
    <header-template :pageTitle="pageTitle">
    </header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <refresher-component></refresher-component>
      <div v-if="isProfile">
        <ion-card class="ion-no-margin ion-margin-bottom ion-padding-bottom">
          <ion-list>
            <!-- Totem -->
            <ion-item lines="full">
              <ion-label position="stacked" color="primary">Totem</ion-label>
              <ion-input v-if="isEditting.totem" v-model="target.totem" name="totem" type="text" autocorrect="off" @keydown.enter="setTotem"></ion-input>
              <ion-input v-else name="totem" type="text" :readonly="true" inputmode="none">{{ userProfile.totem }}</ion-input>
              <ion-spinner v-if="isUpdating.totem" slot="end"></ion-spinner>
              <ion-icon v-else-if="!isEditting.totem && canEditProfile" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="toggleEdit('totem')"></ion-icon>
              <ion-icon v-if="isEditting.totem" slot="end" :ios="checkmarkOutline" :md="checkmarkSharp" @click="setTotem"></ion-icon>
              <ion-icon v-if="isEditting.totem" slot="end" :ios="closeOutline" :md="closeSharp" @click="toggleEdit('totem')"></ion-icon>
            </ion-item>
            <!-- Name -->
            <ion-item lines="full">
              <ion-label position="stacked" color="primary">Nom</ion-label>
              <ion-input v-if="isEditting.name" v-model="target.name" name="name" type="text" @keydown.enter="setName"></ion-input>
              <ion-input v-else name="name" type="text" :readonly="true" inputmode="none">{{ userProfile.name }}</ion-input>
              <ion-spinner v-if="isUpdating.name" slot="end"></ion-spinner>
              <ion-icon v-else-if="!isEditting.name && canEditProfile" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="toggleEdit('name')"></ion-icon>
              <ion-icon v-if="isEditting.name" slot="end" :ios="checkmarkOutline" :md="checkmarkSharp" @click="setName"></ion-icon>
              <ion-icon v-if="isEditting.name" slot="end" :ios="closeOutline" :md="closeSharp" @click="toggleEdit('name')"></ion-icon>
            </ion-item>
            <div v-if="isPlayer">
              <!-- Section Type -->
              <ion-item lines="full" v-if="isEditting.section">
                <ion-label position="stacked" color="primary">Type de section</ion-label>
                <ion-select v-model="target.sectionType" cancel-text="Annuler" interface="action-sheet">
                  <ion-select-option v-for="(sectionType, index) in sectionTypes" :key="index" :value="sectionType">{{ sectionType }}</ion-select-option>
                </ion-select>
                <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="toggleEdit('section')"></ion-icon>
              </ion-item>
              <!-- Section (edit mode) -->
              <ion-item lines="full" v-if="isEditting.section">
                <ion-label position="stacked" color="primary">Section</ion-label>
                <p v-if="!target.sectionType" class="missing-field-alert">Selectionne d'abord un type de section</p>
                <ion-select v-else-if="sectionsBySectionType.size > 0" v-model="target.sectionId"
                @ion-change="setSection"
                cancel-text="Annuler" interface="action-sheet">
                  <ion-select-option v-for="section in sectionsBySectionType.values()" :key="section.id" :value="section.id">{{ section.name }}</ion-select-option>
                </ion-select>
                <p v-else class="missing-field-alert">Pas de section pour ce type de section</p>
                <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="toggleEdit('section')"></ion-icon>
              </ion-item>
              <!-- Section (read mode) -->
              <ion-item lines="full" v-else>
                <ion-label position="stacked" color="primary">Section</ion-label>
                <ion-input name="section" type="text" :readonly="true" inputmode="none" @click="goToSectionPage(userProfile.sectionId)">{{ userProfile.sectionName }}</ion-input>
                <ion-spinner v-if="isUpdating.section" slot="end"></ion-spinner>
                <ion-icon v-else-if="canEditSection" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="toggleEdit('section')"></ion-icon>
              </ion-item>
                <!-- Team (edit mode)-->
              <ion-item lines="full" v-if="isEditting.team">
                <ion-label position="stacked" color="primary">Équipe</ion-label>
                <ion-select v-if="sectionTeams.length > 0" v-model="target.team" 
                @ion-change="setTeam"
                cancel-text="Annuler" interface="action-sheet">
                  <ion-select-option v-for="team in sectionTeams" :key="team" :value="team">{{ team }}</ion-select-option>
                </ion-select>
                <p v-else class="missing-field-alert">Pas de team pour cette section</p>
                <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="toggleEdit('team')"></ion-icon>
              </ion-item>
              <!-- Team (read mode)-->
              <ion-item lines="full" v-else>
                <ion-label position="stacked" color="primary">Équipe</ion-label>
                <ion-input type="text" :readonly="true" inputmode="none" @click="goToTeamPage(userProfile.team)">{{ userProfile.team }}</ion-input>
                <ion-spinner v-if="isUpdating.team" slot="end"></ion-spinner>
                <ion-icon v-else-if="canEditProfile" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="toggleEdit('team')"></ion-icon>
              </ion-item>
            </div>
            <div v-if="isLeader || isStaff">
              <!-- Section (edit mode) -->
              <ion-item lines="full" v-if="isEditting.leaderSection">
                <ion-label position="stacked" color="primary">Section</ion-label>
                <ion-select v-if="leaderSections.size > 0" v-model="target.sectionId"
                @ion-change="setLeaderSection"
                cancel-text="Annuler" interface="action-sheet">
                  <ion-select-option v-for="section in leaderSections.values()" :key="section.id" :value="section.id">{{ section.name }}</ion-select-option>
                </ion-select>
                <p v-else class="missing-field-alert">Pas de section</p>
                <ion-icon slot="end" :ios="closeOutline" :md="closeSharp" @click="toggleEdit('leaderSection')"></ion-icon>
              </ion-item>
              <!-- Section (read mode) -->
              <ion-item lines="full" v-else>
                <ion-label position="stacked" color="primary">Section</ion-label>
                <ion-input name="section" type="text" :readonly="true" inputmode="none" @click="goToLeaderPage(userProfile.sectionId)">{{ userProfile.sectionName }}</ion-input>
                <ion-spinner v-if="isUpdating.leaderSection" slot="end"></ion-spinner>
                <ion-icon v-else-if="canEditSection" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="loadLeaderSections"></ion-icon>
              </ion-item>
            </div>
              <div v-if="isLeader">
                <ion-item lines="full">
                  <!-- morningGame -->
                  <ion-label position="stacked" color="primary">Épreuve du matin</ion-label>
                  <ion-select v-if="isEditting.morningGame" v-model="target.morningGame" 
                  @ion-change="setMorningGame" 
                  cancel-text="Annuler" interface="action-sheet">
                    <ion-select-option v-for="game in games.values()" :key="game.id" :value="game.id">{{ game.id }}{{ isGameFull(game.morningLeaders) ? " [COMPLET] " : " " }}{{ game.name }}</ion-select-option>
                  </ion-select>
                  <ion-input v-else type="text" :readonly="true" inputmode="none" @click="goToGamePage(userProfile.morningGame)">
                    <span v-if="userProfile.morningGame">{{ userProfile.morningGame }}: {{ morningGame?.name }}</span>
                  </ion-input>
                  <ion-icon v-if="isEditting.morningGame" slot="end" :ios="closeOutline" :md="closeSharp" @click="toggleEdit('morningGame')"></ion-icon>
                  <ion-spinner v-else-if="isUpdating.morningGame" slot="end"></ion-spinner>
                  <ion-icon v-else-if="canEditGames" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="toggleEdit('morningGame')"></ion-icon>
                </ion-item>
                <!-- afternoonGame -->
                <ion-item lines="full">
                  <ion-label position="stacked" color="primary">Épreuve de l'après-midi</ion-label>
                  <ion-select v-if="isEditting.afternoonGame" v-model="target.afternoonGame" 
                  @ion-change="setAfternoonGame" 
                  cancel-text="Annuler" interface="action-sheet">
                    <ion-select-option v-for="game in games.values()" :key="game.id" :value="game.id">{{ game.id }}{{ isGameFull(game.afternoonLeaders) ? " [COMPLET] " : " " }}{{ game.name }}</ion-select-option>
                  </ion-select>
                  <ion-input v-else type="text" :readonly="true" inputmode="none" @click="goToGamePage(userProfile.afternoonGame)">
                    <span v-if="userProfile.afternoonGame">{{ userProfile.afternoonGame }}: {{ afternoonGame?.name }}</span>
                  </ion-input>
                  <ion-icon v-if="isEditting.afternoonGame" slot="end" :ios="closeOutline" :md="closeSharp" @click="toggleEdit('afternoonGame')"></ion-icon>
                  <ion-spinner v-else-if="isUpdating.afternoonGame" slot="end"></ion-spinner>
                  <ion-icon v-else-if="canEditGames" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="toggleEdit('afternoonGame')"></ion-icon>
                </ion-item>
              </div>
              <!-- Role -->
              <ion-item lines="full">
                <ion-label position="stacked" color="primary">Role</ion-label>
                <ion-select v-if="isEditting.role" v-model="target.role" 
                @ion-change="setRole"
                cancel-text="Annuler" interface="action-sheet">
                  <ion-select-option v-for="(value, role) in ROLES" :key="value" :value="value">{{ role }}</ion-select-option>
                </ion-select>
                <ion-input v-else type="text" :readonly="true" inputmode="none">{{ getRoleByValue(userProfile.role) }}</ion-input>
                <ion-icon v-if="isEditting.role" slot="end" :ios="closeOutline" :md="closeSharp" @click="toggleEdit('role')"></ion-icon>
                <ion-spinner v-else-if="isUpdating.role" slot="end"></ion-spinner>
                <ion-icon v-else-if="canSetRole" slot="end" :ios="pencilOutline" :md="pencilSharp" @click="toggleEdit('role')"></ion-icon>
              </ion-item>
            <div v-if="showEmail">
              <!-- email -->
              <ion-item lines="full">
                <ion-label position="stacked" color="primary">Adresse email</ion-label>
                <ion-input type="text" :readonly="true" inputmode="none">{{ userProfile.email }}</ion-input>
              </ion-item>
            </div>
          </ion-list>
          <ion-grid class="ion-no-padding">
            <ion-row>
              <ion-col v-if="isOwnProfile" size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
                <ion-button expand="block" class="" color="warning" @click="logOut"> Se déconnecter </ion-button>
              </ion-col>
              <ion-col v-if="canDeleteProfile" size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
                <ion-button expand="block" class="" color="danger" @click="deleteAccount"> Supprimer le compte </ion-button>
              </ion-col>
              <ion-col v-if="canResetOnboarding" size="12" size-sm="6" class="ion-no-padding ion-padding-horizontal">
                <ion-button expand="block" class="" color="medium" @click="resetOnboarding"> Reset onboarding </ion-button>
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
import { pencilOutline, pencilSharp, closeOutline, closeSharp, checkmarkOutline, checkmarkSharp } from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES, getRoleByValue, Profile } from "@/services/users";
import { useRoute, useRouter } from "vue-router";
import { computed, onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import { confirmPopup, errorPopup, loadingPopup, toastPopup } from "@/services/popup";
import { stopMagnetar } from "@/services/magnetar";
import { getMaxGameLeaders, getSectionTypes } from "@/services/settings";
import { getSectionsBySectionType, streamSection, Section } from "@/services/sections";
import RefresherComponent from "@/components/RefresherComponent.vue";
import { getAllLeaderSections, streamLeaderSection, LeaderSection } from "@/services/leaderSections";
import { removeAfternoonLeader, removeMorningLeader, setAfternoonLeader, setMorningLeader, useGame, useGames } from "@/composables/games";

const userStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const games = useGames();

// reactive data
const userId = ref(userStore.uid);
const leaderSections = ref();
const target = reactive({
  totem: "",
  name: "",
  sectionType: "",
  sectionId: -1,
  team: "",
  morningGame: 0,
  afternoonGame: 0,
  role: -1,
})
const isEditting = reactive({
  totem: false,
  name: false,
  section: false,
  leaderSection: false,
  team: false,
  morningGame: false,
  afternoonGame: false,
  role: false,
})
const isUpdating = reactive({
  totem: false,
  name: false,
  section: false,
  leaderSection: false,
  team: false,
  morningGame: false,
  afternoonGame: false,
  role: false,
})

// lifecycle hooks

onBeforeMount(() => {
  userId.value = route.params.userId ? (route.params.userId as string) : userStore.uid;
});
onMounted(() => {
  if(! userProfile.value || !userProfile.value.email) userStore.forceFetchCurrentUserProfile();
});

// Computed variables

// The profile to be displayed in the current page
const userProfile = computed((): Profile => {
  return userStore.getProfile(userId.value) as Profile;
});
const isProfile = computed(() => {
  return userProfile.value?.email ? true : false;
});
const morningGame = useGame(userProfile.value.morningGame)
const afternoonGame = useGame(userProfile.value.afternoonGame)
const isOwnProfile = computed(() => {
  if (!route.params.userId) return true;
  return route.params.userId === userStore.uid;
});
const canEditProfile = computed(() => {
  if (userStore.profile.role >= ROLES.Organisateur) return true;
  return isOwnProfile.value;
});
const showEmail = computed(() => {
  return canEditProfile.value;
});
const canEditGames = computed(() => {
  if (canEditProfile.value) return true;
  if (userStore.profile.role == ROLES.Chef && userStore.profile.sectionId == userProfile.value.sectionId) return true;
  return false;
});
const canEditSection = computed(() => {
  if (userStore.profile.role >= ROLES.Organisateur) return true;
  return false;
});
const isPlayer = computed(() => {
  return userProfile.value.role == ROLES.Participant;
});
const isLeader = computed(() => {
  return userProfile.value.role === ROLES.Animateur || userProfile.value.role === ROLES.Chef; 
});
const isStaff = computed(() => {
  return userProfile.value.role >= ROLES.Organisateur;
});
const canSetRole = computed(() => {
  return userStore.profile.role >= ROLES.Organisateur;
});
const canResetOnboarding = computed(() => {
  return userStore.profile.role >= ROLES.Organisateur;
});
const canDeleteProfile = computed(() => {
  if (userStore.profile.role >= ROLES.Administrateur) return true;
  return isOwnProfile.value;
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
const sectionTypes = computed(() => {
  return getSectionTypes() ?? [];
});
const sectionsBySectionType = computed(() => {
  return target.sectionType ? getSectionsBySectionType(target.sectionType) : new Map();
});
const sectionTeams = computed((): string[] => {
  const section = streamSection(userProfile.value.sectionId);
  return section?.teams ?? [];
});
const targetSection = computed((): Section | LeaderSection | undefined => {
  if (target.sectionId == -1) return undefined;
  if (isPlayer.value) return streamSection(target.sectionId);
  if (isLeader.value || isStaff.value) return streamLeaderSection(target.sectionId);
  return undefined;
});

// Watchers
watch(
  () => target.sectionType,
  (newValue, oldValue) => {
    if(newValue && oldValue && newValue != oldValue) {
      target.sectionId = -1;
    }
  }
);

// Methods
const toggleEdit = (key: string) => {
  const editKey = key as keyof typeof isEditting;
  isEditting[editKey] = !isEditting[editKey];
};
const loadLeaderSections = () => {
  leaderSections.value = getAllLeaderSections();
  toggleEdit("leaderSection");
};
const goToSectionPage = (sectionId: number | undefined) => {
  if (sectionId) router.push(`/section/${sectionId}`);
};
const goToLeaderPage = (sectionId: number | undefined) => {
  if (sectionId) router.push(`/leader/${sectionId}`);
};
const goToTeamPage = (teamId: string | undefined) => {
  if (teamId) router.push(`/team/${teamId}`);
};
const goToGamePage = (gameId: number | undefined) => {
  if (gameId) router.push(`/game/${gameId}`);
};
const setTotem = async () => {
  if (!target.totem) {
    toastPopup("Erreur : aucun totem n'a été entré");
    return toggleEdit("totem");
  }
  toggleEdit("totem");
  isUpdating.totem = true;
  await userStore.updateProfile(userId.value, { totem: target.totem }).catch((error) => {
    errorPopup(`Le totem n'a pas pu être mis à jour : ${error.message}`);
  });
  isUpdating.totem = false;
  target.totem = "";
};
const setName = async () => {
  if (!target.name) {
    toastPopup("Erreur : aucun nom n'a été entré");
    return toggleEdit("name");
  }
  toggleEdit("name");
  isUpdating.name = true;
  await userStore.updateProfile(userId.value, { name: target.name }).catch((error) => {
    errorPopup(`Le n'a pas pu être mis à jour : ${error.message}`);
  });
  isUpdating.name = false;
  target.name = "";
};
const setSection = async () => {
  if (!target.sectionId) {
    toastPopup("Erreur : aucune section n'a été sélectionnée");
    return toggleEdit("section");
  }
  toggleEdit("section");
  isUpdating.section = true;
  await userStore.updateProfile(userId.value, { 
    sectionId: target.sectionId,
    sectionName: targetSection.value?.name,
    team: "",
  }).catch((error) => {
    errorPopup(`La section n'a pas pu être mise à jour : ${error.message}`);
  });
  isUpdating.section = false;
  target.sectionId = -1;
};
const setLeaderSection = async () => {
  if (!target.sectionId) {
    toastPopup("Erreur : aucune section n'a été sélectionnée");
    return toggleEdit("leaderSection");
  }
  toggleEdit("leaderSection");
  isUpdating.leaderSection = true;
  await userStore.updateProfile(userId.value, { 
    sectionId: target.sectionId,
    sectionName: targetSection.value?.name,
  }).catch((error) => {
    errorPopup(`La section n'a pas pu être mise à jour : ${error.message}`);
  });
  isUpdating.leaderSection = false;
  target.sectionId = -1;
};
const setTeam = async () => {
  if (!target.team) {
    toastPopup("Erreur : aucune équipe n'a été sélectionnée");
    return toggleEdit("team");
  }
  toggleEdit("team");
  isUpdating.team = true;
  await userStore.updateProfile(userId.value, { team: target.team }).catch((error) => {
    errorPopup(`L'équipe n'a pas pu être mise à jour : ${error.message}`);
  });
  isUpdating.team = false;
  target.team = "";
};
const setRole = async () => {
  if (!target.role) {
    toastPopup("Erreur : aucun rôle n'a été sélectionné");
    return toggleEdit("role");
  }
  toggleEdit("role");
  isUpdating.role = true;
  if (userProfile.value.morningGame) await removeMorningLeader(userProfile.value.morningGame, userId.value)
  if (userProfile.value.morningGame) {
    await removeMorningLeader(userProfile.value.morningGame, userId.value).catch((error) => {
      errorPopup(`Erreur lors de la suppression de l'utilisateur de l'épreuve du matin précédente : ${error.message}`);
      isUpdating.role = false;
      target.role = -1;
      return;
    });
  }
  if (userProfile.value.afternoonGame) {
    await removeAfternoonLeader(userProfile.value.afternoonGame, userId.value).catch((error) => {
      errorPopup(`Erreur lors de la suppression de l'utilisateur de l'épreuve de l'après-midi précédente : ${error.message}`);
      isUpdating.role = false;
      target.role = -1;
      return;
    });
  }
  await userStore.updateProfile(userId.value, { 
    role: target.role, 
    sectionId: -1, 
    sectionName: "", 
    team: "",
    morningGame: 0,
    afternoonGame: 0
  }).catch((error) => {
    errorPopup(`Le rôle n'a pas pu être mis à jour : ${error.message}`);
  });
  isUpdating.role = false;
  target.role = -1;
  target.sectionId = -1;
};

const targetMorningGame = useGame(target.morningGame)
const targetAfternoonGame = useGame(target.afternoonGame)
const setMorningGame = async () => {
  if (!target.morningGame) {
    toastPopup("Erreur : aucun match n'a été sélectionné");
    return toggleEdit("morningGame");
  }
  toggleEdit("morningGame");
  isUpdating.morningGame = true;
  if (target.morningGame != userProfile.value.morningGame){
    if (userProfile.value.morningGame) {
      await removeMorningLeader(userProfile.value.morningGame, userId.value).catch((error) => {
        errorPopup(`Erreur lors de la suppression de l'utilisateur de l'épreuve du matin précédente : ${error.message}`);
        isUpdating.morningGame = false;
        target.morningGame = 0;
        return;
      });
    }
    const promises = [];
    promises.push(setMorningLeader(targetMorningGame, userId.value).catch((error) => {
      errorPopup(`Le jeu du matin n'a pas pu être mis à jour : ${error.message}`);
    }));
    promises.push(userStore.updateProfile(userId.value, { morningGame: target.morningGame }).catch((error) => {
      errorPopup(`Le profil n'a pas pu être mis à jour : ${error.message}`);
    }));
    await Promise.all(promises);
  }
  isUpdating.morningGame = false;
  target.morningGame = 0;
};
const setAfternoonGame = async () => {
  if (!target.afternoonGame) {
    toastPopup("Erreur : aucun match n'a été sélectionné");
    return toggleEdit("afternoonGame");
  }
  toggleEdit("afternoonGame");
  isUpdating.afternoonGame = true;
  if (target.afternoonGame != userProfile.value.afternoonGame){
    if (userProfile.value.afternoonGame) {
      await removeAfternoonLeader(userProfile.value.afternoonGame, userId.value).catch((error) => {
        errorPopup(`Erreur lors de la suppression de l'utilisateur de l'épreuve du matin précédente : ${error.message}`);
        isUpdating.afternoonGame = false;
        target.afternoonGame = 0;
        return;
      });
    }
    const promises = [];
    promises.push(setAfternoonLeader(targetAfternoonGame, userId.value).catch((error) => {
      errorPopup(`Le jeu de l'après-midi n'a pas pu être mis à jour : ${error.message}`);
    }));
    promises.push(userStore.updateProfile(userId.value, { afternoonGame: target.afternoonGame }).catch((error) => {
      errorPopup(`Le profil n'a pas pu être mis à jour : ${error.message}`);
    }));
    await Promise.all(promises);
  }
  isUpdating.afternoonGame = false;
  target.afternoonGame = 0;
};
const resetOnboarding = async () => {
  const loading = await loadingPopup("Réinitialisation de l'onboarding");
  await userStore.updateProfile(userId.value, { hasDoneOnboarding: false }).catch((error) => {
    errorPopup(`L'onboarding n'a pas pu être réinitialisée : ${error.message}`);
  });
  loading.dismiss();
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
const isGameFull = (leaders: string[]): boolean => {
  return (leaders.length >= getMaxGameLeaders());
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
ion-item ion-icon {
  align-self: center;
}
ion-item ion-spinner{
  align-self: center;
}
</style>
