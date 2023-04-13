<template>
  <ion-page>
    <header-template pageTitle="Animateurs"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card>
        <ion-card-content class="ion-no-padding">
          <ion-grid class="">
            <ion-row>
              <ion-col size="12" size-sm="6">
                  <ion-select v-if="sections" v-model="sectionId" placeholder="Section" interface="popover">
                    <ion-select-option color="dark" v-for="section in sections.values()" :value="section.id" :key="section.id"> {{ section.name }} ({{ section.city }}) </ion-select-option>
                  </ion-select>
                  <ion-spinner v-else-if="isLoadingSections"></ion-spinner>
                  <div v-else>Pas de section configurée</div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>
      <ion-grid class="ion-no-padding" v-if="sectionId">
        <ion-row>
          <ion-col size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Détails</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list v-if="section">
                  <ion-item> <ion-label>Nom</ion-label>{{ section.name }} </ion-item>
                  <ion-item> <ion-label>Ville</ion-label>{{ section.city }} </ion-item>
                  <ion-item> <ion-label>Unité</ion-label>{{ section.unit }} </ion-item>
                </ion-list>
                <div v-else-if="isLoadingSection" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <ion-list-header v-else>
                  <h2>Aucune section trouvée</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col  size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title>Membres</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-item v-if="pendingMembers > 0" routerLink="/requests">
                  <ion-label>Membres en attente de validation</ion-label>
                  <ion-badge slot="end" color="warning">{{ pendingMembers }}</ion-badge>
                </ion-item>
                <ion-list v-if="sectionMembers && sectionMembers.size > 0">
                  <ion-item v-for="member in sectionMembers.values()" :key="member.uid" :routerLink="`/profile/${member.uid}`">
                    <ion-label>{{ userStore.getName(member.uid) }}</ion-label>
                    <ion-badge v-if="member.role <= ROLES.Chef" slot="end" :color="registrationStatus(member).color">{{ registrationStatus(member).text }}</ion-badge>
                  </ion-item>
                </ion-list> 
                <div v-else-if="isLoadingSection" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>  
                <ion-list-header v-else>
                  <h2>Aucun membre trouvé</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col  size="12" size-sm="6">
            <ion-card>
              <ion-card-header>
                <ion-card-title v-if="isStaff">Administrateur</ion-card-title>
                <ion-card-title v-else>Chefs</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-list v-if="sectionLeaders && sectionLeaders.length > 0">
                  <ion-item v-for="leader in sectionLeaders" :key="leader.uid" :routerLink="`/profile/${leader.uid}`">
                    <ion-label>{{ userStore.getName(leader.uid) }}</ion-label>
                    <ion-badge v-if="leader.role <= ROLES.Chef" slot="end" :color="registrationStatus(leader).color">{{ registrationStatus(leader).text }}</ion-badge>
                  </ion-item>
                </ion-list>
                <div v-else-if="isLoadingSection" class="ion-text-center ion-align-items-center">
                  <ion-spinner></ion-spinner>
                </div>
                <ion-list-header v-else>
                  <h2>Aucun chef trouvé</h2>
                </ion-list-header>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
      <div v-else class="not-found">
        <h2 class="ion-text-center ion-align-items-center" >Sélectionne une catégorie et une section <ion-icon :ios="arrowUpOutline" :md="arrowUpSharp"></ion-icon></h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { getLeaderSection, getLeaderSections, getStaffSectionId, LeaderSection } from "@/services/leaderSections";
import { ROLES, useAuthStore } from "@/services/users";
import { IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonPage, IonRow, IonSelect, IonSelectOption, IonSpinner } from "@ionic/vue";
import { computed, ref } from "@vue/reactivity";
import { arrowUpOutline, arrowUpSharp } from "ionicons/icons";
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";


const userStore = useAuthStore();
const route = useRoute();

// reactive data

const sectionId = ref(0);
const isLoadingSections = ref(true);
const isLoadingSection = ref(false);
const staffSectionId = ref(0);


// lifecycle hooks

onMounted(() => {
  if (route.params.sectionId) {
    sectionId.value = Number(route.params.sectionId);
  }
  setTimeout(() => {
    isLoadingSections.value = false;
  }, 5000);
  getStaffSectionId().then((id) => {
    staffSectionId.value = id;
});
});

// Watchers
watch(sectionId, (newVal) => {
  if (newVal) {
    isLoadingSection.value = true;
    setTimeout(() => {
      isLoadingSection.value = false;
    }, 5000);
  }
});

// Computed

const sections = computed((): Map<string, LeaderSection> => {
  return getLeaderSections();
});
const section = computed((): LeaderSection | undefined => {
  return sectionId.value ? getLeaderSection(sectionId.value) : undefined;
});
const sectionMembers = computed(() => {
  return userStore.getSectionMembers(sectionId.value);
});
const sectionLeaders = computed(() => {
  return Array.from(sectionMembers.value.values()).filter((user) => user.role === ROLES.Chef || user.role === ROLES.Administrateur);
});
const isStaff = computed(() => {
  return section.value && section.value.id === staffSectionId.value;
});
const pendingMembers = computed(() => {
  if(!sectionId.value) return 0;
  return userStore.getSectionApplicants(50, sectionId.value).size;
});

// Methods

const registrationStatus = (user: any) => {
  if (!user.morningGame && !user.afternoonGame) return { text: "Pas inscrit", color: "danger" };
  if (user.morningGame && !user.afternoonGame) return { text: "Matin", color: "warning" };
  if (!user.morningGame && user.afternoonGame) return { text: "Arpèm", color: "warning" };
  if (user.morningGame && user.afternoonGame) return { text: "Matin & aprèm", color: "success" };
  return { text: "inconnu", color: "medium" };
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
