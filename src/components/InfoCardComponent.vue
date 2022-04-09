<template>
  <ion-card class="ion-no-margin ion-margin-bottom">
    <ion-card-content>
      <ion-grid class="ion-no-padding">
        <ion-row class="ion-align-items-center">
          <ion-col size="2">
            <div>
              <ion-icon style="font-size: 35px" :ios="infoIcon.ios" :md="infoIcon.md" slot="start"></ion-icon>
            </div>
          </ion-col>
          <ion-col size="10">
            <span> {{ props.message }} </span>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonIcon } from "@ionic/vue";
import { informationCircleOutline, informationCircleSharp } from "ionicons/icons";
import { defineProps } from "vue";
const props = defineProps(["message"]);
const infoIcon = { ios: informationCircleOutline, md: informationCircleSharp };
</script>
