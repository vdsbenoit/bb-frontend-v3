<template>
  <ion-page>
    <header-template pageTitle="Paramètres"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Utilisateurs</ion-card-title>
        </ion-card-header>
        <ion-card-content class="ion-no-padding">
            <ion-list >
              <ion-item routerLink="/promotions" class="item-no-padding">
                <ion-label>Demandes de promotions</ion-label>
                <ion-icon slot="end" :ios="chevronForwardOutline" :md="chevronForwardSharp"></ion-icon>
              </ion-item>
            </ion-list>
            <ion-list>
              <ion-item routerLink="/users">
                <ion-label>Nouveaux utilisateurs</ion-label>
                <ion-icon slot="end" :ios="chevronForwardOutline" :md="chevronForwardSharp"></ion-icon>
              </ion-item>
            </ion-list>

        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonIcon, IonList, IonItem, IonLabel, IonNote, IonGrid, IonRow, IonCol, IonListHeader, IonSelect, IonSelectOption, IonBadge, useIonRouter, IonSpinner, IonButton } from "@ionic/vue";
import { chevronForwardOutline, chevronForwardSharp } from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES, Profile } from "@/services/users";
import { computed, ref } from "@vue/reactivity";
import { useRoute } from "vue-router";
import { getCategorySections, getSection, Section } from "@/services/sections";
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
