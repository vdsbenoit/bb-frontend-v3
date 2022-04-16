<template>
  <ion-page>
    <header-template pageTitle="Paramètres"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Données</ion-card-title>
        </ion-card-header>
        <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-label></ion-label>
              
              </ion-item>
            </ion-list>

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
import { getCategories, getLeaderCategoryName, isShowRankingToAll } from "@/services/settings";
import { confirmPopup } from "@/services/popup";

const user = useAuthStore();
const route = useRoute();
const router = useIonRouter();

// reactive data


// lifecicle hooks

onBeforeMount(async () => {
  console.log("placeholder");
});

// Computed


// Watchers


// Methods


</script>
<style scoped>

</style>
