<template>
  <ion-page>
    <header-template pageTitle="Paramètres"></header-template>
    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-header>
          <ion-card-title> Louveteaux Férao </ion-card-title>
          <ion-card-subtitle> Soignies </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-list>
            <ion-item class="ion-no-padding">
              <ion-label>Score de l'équipe</ion-label><ion-note slot="end" color="medium">5</ion-note>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonContent, IonPage, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonList, IonItem, IonLabel, IonNote } from "@ionic/vue";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
</script>

<style scoped>
</style>