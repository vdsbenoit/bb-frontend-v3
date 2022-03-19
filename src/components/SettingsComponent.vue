<template>
        <ion-list>
          <ion-item lines="full">
            <ion-label position="floating">Email</ion-label>
            <ion-input v-model="email" name="email" type="email" required autocapitalize="off"></ion-input>
          </ion-item>
          </ion-list>
        </form>

        <ion-text class="ion-padding" color="danger" :hidden="!store.error">
              <p class="ion-padding-start">{{ store.error }}</p>
        </ion-text>
</template>

<script setup>
import { IonContent, IonPage, IonList, IonItem, IonLabel, IonInput, IonText, IonButton } from "@ionic/vue";
import { defineProps } from "vue";
import { useAuthStore } from "@/services";
import { ref } from "vue";

const store = useAuthStore();
const email = ref("");


</script>
