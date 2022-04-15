<template>
  <ion-page>
    <header-template pageTitle="Sections"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card>
        <ion-card-content class="ion-no-padding">
          <ion-grid>
            <ion-row>
              <ion-col size="12" size-sm="6">
                <ion-select v-model="selectedCategory" interface="popover" placeholder="Catégorie">
                  <ion-select-option v-for="(category, index) in categories" :value="category" :key="index">{{ category }}</ion-select-option>
                </ion-select>
              </ion-col>
              <ion-col size="12" size-sm="6">
                <div v-if="selectedCategory">
                  <ion-spinner v-if="isLoadingSections"></ion-spinner>
                  <ion-select v-else v-model="selectedSectionId" placeholder="Section">
                    <ion-select-option color="dark" v-for="section in sections?.values()" :value="section.id" :key="section.id"> {{ section.name }} ({{ section.city }}) </ion-select-option>
                  </ion-select>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
      <ion-grid class="ion-no-padding">
        <ion-row>
          <ion-col size="12" size-sm="6">
            <ion-card v-if="selectedSectionId">
              <ion-card-header>
                <ion-card-title>Détails</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div v-if="isLoadingSection" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <ion-list v-else>
                  <ion-item> <ion-label>Nom</ion-label>{{ selectedSection.name }} </ion-item>
                  <ion-item> <ion-label>Ville</ion-label>{{ selectedSection.city }} </ion-item>
                  <ion-item> <ion-label>Unité</ion-label>{{ selectedSection.unit }} </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
            <ion-card v-if="showRanking && selectedSectionId">
              <ion-card-header>
                <ion-card-title> Classement </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div v-if="isLoadingSection" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <ion-list v-else class="ranking">
                  <ion-item>
                    <ion-label>Score accumulé</ion-label><ion-note slot="end">{{ selectedSection?.score }}</ion-note></ion-item
                  >
                  <ion-item>
                    <ion-label>Score moyen</ion-label><ion-note slot="end">{{ sectionMeanScore }}</ion-note>
                  </ion-item>
                </ion-list>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="12" size-sm="6">
            <ion-card v-if="selectedSectionId">
              <ion-card-header>
                <ion-card-title>Équipes</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div v-if="isLoadingSection" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <div v-else>
                  <ion-list v-if="selectedSection?.teams.length > 0">
                    <ion-item v-for="teamId in selectedSection.teams" :key="teamId" :routerLink="`/team/${teamId}`">
                      <ion-label>{{ teamId }}</ion-label>
                      <ion-badge v-if="teamId === user.profile.team" slot="end" color="success">Ton équipe</ion-badge>
                    </ion-item>
                  </ion-list>
                  <ion-list-header v-else> Aucune équipe trouvée </ion-list-header>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
      <ion-button v-if="!shouldLoadUsers && selectedSectionId && showUsers" expand="block" color="primary" @click="loadUsers" class="ion-margin-horizontal">
        Charger les utilisateurs
      </ion-button>
      <ion-card v-if="shouldLoadUsers && showUsers">
        <ion-card-header>
          <ion-card-title>Utilisateurs</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div v-if="isLoadingSection" class="ion-text-center ion-align-items-center">
            <ion-spinner></ion-spinner>
          </div>
          <div v-else>
            <ion-list-header v-if="sectionUsers.size < 1"><h2>Aucun utilisateur trouvé</h2></ion-list-header>
            <ion-list v-else>
              <ion-item v-for="sectionUser in sectionUsers.values()" :key="sectionUser.id" :routerLink="`/profile/${sectionUser.id}`">
                <ion-label>{{ user.getName(sectionUser.id) }}</ion-label>
                <div v-if="showLeaderRegistration">
                  <ion-badge slot="end" :color="registrationStatus(sectionUser).color">{{ registrationStatus(sectionUser).text }}</ion-badge>
                </div>
              </ion-item>
            </ion-list>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonItem, IonLabel, IonNote, IonGrid, IonRow, IonCol, IonListHeader, IonSelect, IonSelectOption, IonBadge, useIonRouter, IonSpinner, IonButton } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES, Profile } from "@/services/users";
import { computed, ref } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { fetchCategorySections, getSection, Section } from "@/services/sections";
import { onBeforeMount, onMounted, watch } from "vue";
import { getCategories, getLeaderCategoryName } from "@/services/settings";

const user = useAuthStore();
const route = useRoute();
const router = useIonRouter();

// reactive data

const selectedCategory = ref("");
const selectedSectionId = ref("");
const categories = ref();
const shouldLoadUsers = ref(false);

// lifecicle hooks

onBeforeMount(async () => {
  categories.value = await getCategories();
});

// Computed

const showRanking = computed(() => {
  return user.profile.role >= ROLES.Moderateur;
});
const showUsers = computed(() => {
  return user.profile.role >= ROLES.Moderateur;
});
const sections = computed((): Map<string, Section> | undefined => {
  return selectedCategory.value ? fetchCategorySections(selectedCategory.value) : undefined;
});
const selectedSection = computed((): Section | undefined => {
  return selectedSectionId.value ? getSection(selectedSectionId.value) : undefined;
});
const sectionMeanScore = computed(() => {
  return selectedSection.value?.score ? (selectedSection.value.score / selectedSection.value.scores.length || 0).toFixed(2) : 0;
});
const isLoadingSections = computed(() => {
  if (selectedCategory.value && !sections.value) return true;
  return false;
});
const isLoadingSection = computed(() => {
  if (selectedSection.value && !sections.value) return true;
  return false;
});
const sectionUsers = computed(() => {
  return shouldLoadUsers.value ? user.getSectionUsers(selectedSectionId.value) : new Map();
});
const showLeaderRegistration = computed(() => {
  return selectedSection.value?.category === getLeaderCategoryName();
});

// Watchers

watch(selectedSectionId, async () => {
  shouldLoadUsers.value = false;
});

// Methods

const loadUsers = () => {
  shouldLoadUsers.value = true;
};
const registrationStatus = (user: Profile) => {
  if (!user.morningGame && !user.afternoonGame) return { text: "Pas inscrit", color: "danger" };
  if (user.morningGame && !user.afternoonGame) return { text: "Matin", color: "warning" };
  if (!user.morningGame && user.afternoonGame) return { text: "Arpèm", color: "warning" };
  if (user.morningGame && user.afternoonGame) return { text: "Ok", color: "success" };
  return { text: "inconnu", color: "medium" };
};
</script>
<style scoped>
ion-select {
  max-width: 100%;
}
ion-card-title {
  font-size: 24px;
}
ion-select {
  width: 100%;
  text-align: center;
  justify-content: center;
  color: var(--ion-color-dark);
  --placeholder-color: var(--ion-color-dark);
  /* Set full opacity on the placeholder */
  --placeholder-opacity: 1;
}
</style>
