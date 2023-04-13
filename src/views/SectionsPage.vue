<template>
  <ion-page>
    <header-template pageTitle="Sections"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <refresher-component></refresher-component>
      <ion-card>
        <ion-card-content class="ion-no-padding">
          <ion-grid class="">
            <ion-row>
              <ion-col size="12" size-sm="6">
                <ion-select v-if="sectionTypes && sectionTypes.length > 0" v-model="selectedSectionType" interface="popover" placeholder="Type de section">
                  <ion-select-option v-for="(sectionType, index) in sectionTypes" :value="sectionType" :key="index">{{ sectionType }}</ion-select-option>
                </ion-select>
                <ion-spinner v-else-if="isLoadingSectionTypes"></ion-spinner>
                <div v-else>Pas de type de section configuré</div>
              </ion-col>
              <ion-col size="12" size-sm="6" v-if="selectedSectionType">
                <ion-select v-if="sections && sections.size > 0" v-model="selectedSectionId" placeholder="Section" interface="popover">
                  <ion-select-option color="dark" v-for="section in sections.values()" :value="section.id" :key="section.id"> {{ section.name }} ({{ section.city }}) </ion-select-option>
                </ion-select>
                <ion-spinner v-else-if="isLoadingSections"></ion-spinner>
                <div v-else>Pas de section configurée</div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
      <ion-grid class="ion-no-padding" v-if="selectedSectionId">
        <ion-row>
          <ion-col size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Détails</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list v-if="selectedSection">
                  <ion-item> <ion-label>Nom</ion-label>{{ selectedSection.name }} </ion-item>
                  <ion-item> <ion-label>Ville</ion-label>{{ selectedSection.city }} </ion-item>
                  <ion-item> <ion-label>Unité</ion-label>{{ selectedSection.unit }} </ion-item>
                  <ion-item> <ion-label>Nombre d'animés inscrits</ion-label>{{ selectedSection.nbPlayers }} </ion-item>
                  <ion-item> <ion-label>Nombre d'animateurs inscrits</ion-label>{{ selectedSection.nbLeaders }} </ion-item>
                  <ion-item> <ion-label>Nombre d'équipes</ion-label>{{ selectedSection.nbTeams }} </ion-item>
                </ion-list>
                <div v-else-if="isLoadingSection" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <ion-list-header v-else>
                  <h2>Nous n'avons pas trouvé cette section</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
            <ion-card v-if="showRanking">
              <ion-card-header>
                <ion-card-title> Classement </ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list v-if="selectedSection" class="no-pointer">
                  <ion-item>
                    <ion-label>Score accumulé</ion-label><ion-note slot="end">{{ selectedSection.score }}</ion-note></ion-item>
                  <ion-item>
                    <ion-label>Score moyen</ion-label><ion-note slot="end">{{ selectedSection.meanScore }}</ion-note>
                  </ion-item>
                </ion-list>
                <div v-else-if="isLoadingSection" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <ion-list-header v-else>
                  <h2>Nous n'avons pas trouvé cette section</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Équipes</ion-card-title>
              </ion-card-header>
                <info-card-component v-if="selectedSectionId && user.profile.role == ROLES.Participant && !user.profile.team">
                  Tu peux sélectionner une équipe ci-dessous et la marquer comme ton équipe
                </info-card-component>
              <ion-card-content>
                <div v-if="selectedSection">
                  <ion-list v-if="selectedSection.teams.length > 0">
                    <ion-item v-for="teamId in selectedSection.teams" :key="teamId" :routerLink="`/team/${teamId}`">
                      <ion-label>{{ teamId }}</ion-label>
                      <ion-badge v-if="teamId === user.profile.team" slot="end" color="primary" class="ion-padding-horizontal">Ton équipe</ion-badge>
                    </ion-item>
                  </ion-list>
                  <ion-list-header v-else> Aucune équipe trouvée </ion-list-header>
                </div>
                <div v-else-if="isLoadingSection" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <ion-list-header v-else>
                  <h2>Nous n'avons pas trouvé cette section</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col  size="12" size-sm="6" v-if="canSeeMembers">
             <ion-button v-if="!shouldLoadMembers && selectedSectionId" expand="block" color="primary" @click="loadUsers" class="ion-margin-horizontal">
              Charger les membres
            </ion-button>
            <ion-card v-if="shouldLoadMembers">
              <ion-card-header>
                <ion-card-title>Membres</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list v-if="sectionMembers && sectionMembers.size > 0">
                  <ion-item v-for="member in sectionMembers.values()" :key="member.uid" :routerLink="`/profile/${member.uid}`">
                    <ion-label>{{ user.getName(member.uid) }}</ion-label>
                  </ion-item>
                </ion-list>
                <div v-else-if="isLoadingMembers" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <ion-list-header v-else>
                  <h2>Aucun membre trouvé</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
      <div v-else class="not-found">
        <h2 class="ion-text-center ion-align-items-center" >Sélectionne un type de section et une section <ion-icon :ios="arrowUpOutline" :md="arrowUpSharp"></ion-icon></h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonLabel, IonNote, IonGrid, IonRow, IonCol, IonIcon,
IonListHeader, IonSelect, IonSelectOption, IonBadge, IonSpinner, IonButton } from "@ionic/vue";
import { arrowUpOutline, arrowUpSharp } from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES } from "@/services/users";
import { computed, ref } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { getSectionsBySectionType, getSection, Section } from "@/services/sections";
import { onMounted, watch, watchEffect } from "vue";
import { getSectionTypes, isShowRankingToAll } from "@/services/settings";
import InfoCardComponent from "@/components/InfoCardComponent.vue";
import RefresherComponent from "@/components/RefresherComponent.vue";


const user = useAuthStore();
const route = useRoute();

// reactive data

const selectedSectionType = ref("");
const selectedSectionId = ref(0);
const shouldLoadMembers = ref(false); // true after clicking on the show button
const isLoadingSectionTypes = ref(true);
const isLoadingSections = ref(false);
const isLoadingSection = ref(false);
const isLoadingMembers = ref(false);

// lifecycle hooks

onMounted(() => {
  setTimeout(() => {
    isLoadingSectionTypes.value = false;
  }, 5000);
  if (route.params.sectionId) {
    selectedSectionId.value = Number(route.params.sectionId);
  }
});

// Watchers

// The following watchEffect watcher complements the above onMounted definition
watchEffect(() => {
    if(
      selectedSectionId.value &&
      selectedSection.value && 
      selectedSection.value.sectionType && 
      !selectedSectionType.value
      ){
      selectedSectionType.value = selectedSection.value.sectionType;
    }
  }
);
watch(selectedSectionType, (newVal) => {
  if (newVal) {
    isLoadingSections.value = true;
    setTimeout(() => {
      isLoadingSections.value = false;
    }, 5000);
  }
});
watch(selectedSectionId, (newVal) => {
  if (newVal) {
    isLoadingSection.value = true;
    setTimeout(() => {
      isLoadingSection.value = false;
    }, 5000);
  }
});
watch(shouldLoadMembers, (newVal) => {
  if (newVal) {
    isLoadingMembers.value = true;
    setTimeout(() => {
      isLoadingMembers.value = false;
    }, 5000);
  }
});

// Computed
const sectionTypes = computed(() => {
  return getSectionTypes();
});
const showRanking = computed(() => {
  if(isShowRankingToAll()) return true;
  return user.profile.role >= ROLES.Administrateur;
});
const canSeeMembers = computed(() => {
  return user.profile.role >= ROLES.Organisateur;
});
const sections = computed((): Map<string, Section> => {
  return getSectionsBySectionType(selectedSectionType.value); 
});
const selectedSection = computed((): Section | undefined => {
  return selectedSectionId.value ? getSection(selectedSectionId.value) : undefined;
});
const sectionMembers = computed(() => {
  return shouldLoadMembers.value ? user.getSectionMembers(selectedSectionId.value) : new Map();
});


// Methods

const loadUsers = () => {
  shouldLoadMembers.value = true;
};
</script>
<style scoped>
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
