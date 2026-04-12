<script setup lang="ts">
import { IonCard, IonCardContent, IonCol, IonGrid, IonIcon, IonRow } from '@ionic/vue'
import { informationCircleOutline, informationCircleSharp } from 'ionicons/icons'

const infoIcon = { ios: informationCircleOutline, md: informationCircleSharp }
</script>

<template>
  <IonCard>
    <IonCardContent>
      <IonGrid class="ion-no-padding">
        <IonRow class="ion-align-items-center">
          <IonCol size="2">
            <div>
              <IonIcon slot="start" style="font-size: 35px" :ios="infoIcon.ios" :md="infoIcon.md" />
            </div>
          </IonCol>
          <IonCol size="10">
            <slot />
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonCardContent>
  </IonCard>
</template>
