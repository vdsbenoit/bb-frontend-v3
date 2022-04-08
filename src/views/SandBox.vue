<template>
  <ion-page>
    <header-template pageTitle="Sections"></header-template>
    <ion-content :fullscreen="true" class="ion-padding">
    <ion-card>
      <ion-card-content class="ion-no-padding">
        <ion-button expand="block" @click="testMethod1()" color="success">One</ion-button>
        <ion-button expand="block" @click="testMethod2()" color="danger">Two</ion-button>
        <br/>
        <h2>Profile: {{profile}}</h2>
        <br/>
        <h2>Game: {{game}}</h2>
        <br/>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonItem, IonLabel, IonNote, 
IonGrid, IonRow, IonCol, IonListHeader, IonIcon, IonSelect, IonSelectOption, IonBadge, IonButton
} from "@ionic/vue";
import { closeOutline, ellipsisHorizontalOutline, swapHorizontalOutline, trophyOutline} from 'ionicons/icons';
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES, errorPopup } from "@/services";
import { computed, ref } from "@vue/reactivity";
import { usersModule } from "@/services/users";
import { getGame, setAfternoonLeader, setMorningLeader } from "@/services/games";

const uid = ref("");
// const profile = computed(() => {
//   return uid.value ? getUserProfileFoo(uid.value) : {};
// })

const profile = computed(() => {
  usersModule.doc("foo").fetch();
  return usersModule.doc("foo").data;
})

const game = computed(() => {
  return getGame("1");
})


const testMethod1 = () => {
  setMorningLeader("1", "foo").catch(error => {
    errorPopup(error.message);
  });
}
const testMethod2 = () => {
  setAfternoonLeader("1", "foo").catch(error => {
    errorPopup(error.message);
  });
}


</script>
<style scoped>
</style>