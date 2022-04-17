<template>
  <ion-card>
    <ion-card-content>
      <ion-grid class="ion-no-padding">
        <ion-row class="ion-align-items-center">
          <ion-col size="2">
            <div>
              <ion-icon style="font-size: 35px" :ios="infoIcon.ios" :md="infoIcon.md" slot="start"></ion-icon>
            </div>
          </ion-col>
          <ion-col size="10">
            <slot></slot>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonIcon } from "@ionic/vue";
import { informationCircleOutline, informationCircleSharp } from "ionicons/icons";
const infoIcon = { ios: informationCircleOutline, md: informationCircleSharp };
</script>
