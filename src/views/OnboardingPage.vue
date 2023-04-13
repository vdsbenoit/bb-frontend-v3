<template>
  <ion-page>
    <header-template pageTitle="Onboarding"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card>
        <ion-card-header v-if="userStore.profile.rejectionReason">
          <ion-card-title>Aille !</ion-card-title>
          <p>
            Il semblerait que ta demande d'accès ait été refusée. Voici la raison qui a été donnée :
            <br><br>
            {{ userStore.profile.rejectionReason }}
            <br><br>
            Est-ce que tu peux recommencer stp ?
          </p>
        </ion-card-header>
        <ion-card-header v-else>
          <ion-card-title>Bienvenue !</ion-card-title>
          <p>Avant d'aller plus loin, faisons connaissance.</p>
        </ion-card-header>
        <form @submit.prevent="submitForm"  @keydown.enter="submitForm">
          <ion-list class="ion-no-padding">
          <ion-item>
            <ion-label position="floating" color="primary">Totem</ion-label>
            <ion-input v-model="totem" name="totem" type="text" autocorrect="off" @ionChange="handleNameChange"></ion-input>
            <ion-note v-if="nameError" slot="error">Mentionne au minium ton totem ou ton nom</ion-note>
          </ion-item>
          <ion-item>
            <ion-label position="floating" color="primary">Nom</ion-label>
            <ion-input v-model="name" name="name" type="text" autocorrect="off" @ionChange="handleNameChange"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating" color="primary">Quel sera ton role durant la BB ?</ion-label>
            <ion-select v-model="selectedRole" required interface="popover" @ionChange="handleRoleChange">
              <ion-select-option v-for="(value, roleName) in roles" :key="value" :value="value">{{ roleName }}</ion-select-option>
            </ion-select>
          </ion-item>
  
          <ion-item v-if="isParticipant">
            <ion-label position="floating" color="primary">Type de section</ion-label>
            <ion-select v-model="selectedSectionType" interface="popover" required>
              <ion-select-option v-for="sectionType in sectionTypes" :key="sectionType" :value="sectionType">{{ sectionType }}</ion-select-option>
            </ion-select>
          </ion-item>  
          <ion-item v-if="isParticipant">
            <ion-label position="floating" color="primary">Section</ion-label>
            <ion-select v-model="selectedSectionId" interface="popover" required>
              <ion-select-option v-for="s in sections.values()" :key="s.id" :value="s.id"> {{ s.name }} ({{ s.city }}) </ion-select-option>
            </ion-select>
          </ion-item>
  
          <ion-item v-if="isLeader">
            <ion-label position="floating" color="primary">Section</ion-label>
            <ion-select v-model="selectedLeaderSectionId" interface="popover" required>
              <ion-select-option v-for="s in leaderSections.values()" :key="s.id" :value="s.id"> {{ s.name }} ({{ s.city }}) </ion-select-option>
            </ion-select>
          </ion-item>

        </ion-list>
          <ion-button type="submit" expand="block" class="ion-margin">
            Continuer
          </ion-button>
        </form>

      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonLabel, IonSelect, IonSelectOption, IonItem, IonInput, IonButton, IonCard, IonCardHeader, IonCardTitle, 
  IonNote, IonList } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useRouter } from 'vue-router';
import { computed, ref, watch } from "vue";
import { ROLES, useAuthStore } from "@/services/users";
import { confirmPopup, errorPopup, toastPopup } from "@/services/popup";
import { getSectionTypes } from "@/services/settings";
import { getSection, getSectionsBySectionType, Section } from "@/services/sections";
import { getLeaderSection, getLeaderSections, getStaffSectionId, LeaderSection } from "@/services/leaderSections";

const router = useRouter();
const userStore = useAuthStore();

// Strip Anonyme & Newbie from ROLES
const roles = Object.fromEntries(Object.entries(ROLES).filter(([, value]) => value !== ROLES.Anonyme && value !== ROLES.Newbie));

// reactive data

const name = ref('');
const totem = ref('');
const selectedRole = ref(-1);
const selectedSectionType = ref('');
const selectedSectionId = ref(-1);
const selectedLeaderSectionId = ref(-1);
const nameError = ref(false);
const isLoadingSections = ref(false);
const isUpdatingProfile = ref(false);

// watchers 

watch(selectedSectionType, (newVal) => {
  if (newVal) {
    isLoadingSections.value = true;
    setTimeout(() => {
      isLoadingSections.value = false;
    }, 5000);
  }
});

// computed data

const sectionTypes = computed(() => {
  return getSectionTypes();
});
const sections = computed((): Map<string, Section> => {
  return getSectionsBySectionType(selectedSectionType.value); 
});
const leaderSections = computed((): Map<string, LeaderSection> => {
  return getLeaderSections();
});
const isParticipant = computed(() => selectedRole.value === ROLES.Participant && !nameError.value);
const isLeader = computed(() => (selectedRole.value === ROLES.Animateur || selectedRole.value === ROLES.Chef) && !nameError.value);

// methods

const handleRoleChange = () => {
    // Reset section and leaderSection values when changing the role
    selectedSectionType.value = ''
    selectedSectionId.value = -1
    selectedLeaderSectionId.value = -1
    if (!name.value && !totem.value) nameError.value = true;
}
const handleNameChange = () => {
    if (name.value || totem.value) nameError.value = false;
}

const processForm = () => {
  isUpdatingProfile.value = true;
  let newProfile = {};
  if (selectedRole.value === ROLES.Participant) {
    newProfile = {
      totem: totem.value,
      name: name.value,
      role: ROLES.Participant,
      sectionId: selectedSectionId.value,
      sectionName: getSection(selectedSectionId.value)?.name,
      hasDoneOnboarding: true,
    };
  } else {
    newProfile = {
      totem: totem.value,
      name: name.value,
      requestedRole: selectedRole.value,
      requestedSectionId: selectedLeaderSectionId.value,
      hasDoneOnboarding: true,
    }
  }
  userStore
    .updateProfile(userStore.uid, newProfile)
    .then(() => {
      toastPopup("Ton profil a été mis à jour");
      isUpdatingProfile.value = false;
    })
    .catch((error: any) => {
      errorPopup(`Le n'a pas pu être mis à jour : ${error.message}`);
      isUpdatingProfile.value = false;
    })
    .finally(() => {
      router.replace({ name: "home" });
    });
  console.log("Profile udpated", newProfile);
}

const submitForm = async () => {
  if (!name.value && !totem.value) return errorPopup('Mentionne au minium ton totem ou ton nom');
  if (selectedRole.value < ROLES.Participant) return errorPopup('Choisis un role');
  if (selectedRole.value === ROLES.Participant){
    if (selectedSectionId.value) return processForm();
    else return errorPopup('Choisis une section');
  }

  let message="";
  if (selectedRole.value === ROLES.Animateur) {
    if (selectedLeaderSectionId.value){
      const leaderSectionName = getLeaderSection(selectedLeaderSectionId.value)?.name;
      message = `Tu es choisi le role d'animateur. 
      Cela signifie qu'un des chefs de la section ${leaderSectionName} ou un organisateur de la Baden Battle devra
      <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`;
    } else return errorPopup('Choisis une section');
  }
  if (selectedRole.value === ROLES.Chef) {
    if (selectedLeaderSectionId.value){
      const leaderSectionName = getLeaderSection(selectedLeaderSectionId.value)?.name;
      message = `Tu es choisi le role de chef. 
      Cela signifie qu'un des chefs de la section ${leaderSectionName} ou un organisateur de la Baden Battle devra
      <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`;
    } else return errorPopup('Choisis une section');
  }
  if (selectedRole.value === ROLES.Organisateur) {
    selectedLeaderSectionId.value = await getStaffSectionId();
    message = `Tu es choisi le role d'organisateur de la Baden Battle. 
    Cela signifie qu'un autre organisateur de la Baden Battle devra <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`;
  }
  if (selectedRole.value === ROLES.Administrateur) {
    selectedLeaderSectionId.value = await getStaffSectionId();
    message = `Tu es choisi le role d'administrateur de l'application. 
    Cela signifie qu'un autre administrateur devra <b>valider ta demande</b> avant que tu ne puisses utiliser l'app.`;
  }
  message += ` Veux-tu continuer ?`
  const handler = () => processForm();
  return confirmPopup(message, handler, null, 'Attention');
  // Handle form submission

  }

</script>

<style scoped>
</style>