<template>
  <ion-page>
    <header-template pageTitle="Demandes d'accès">
      <ion-button @click="setLimit"><ion-icon slot="icon-only" :ios="settingsOutline" :md="settingsSharp"></ion-icon></ion-button>
    </header-template>
    <ion-content :fullscreen="true">
      <refresher-component></refresher-component>
      <div v-if="showSpinner()" class="not-found" style="background: transparent">
        <ion-spinner></ion-spinner>
      </div>
      <div v-if="showUsers()">
        <ion-card v-for="[sectionId, users] in usersBySection" :key="sectionId">
          <ion-card-header>
            <ion-card-title>{{ streamLeaderSection(+sectionId)?.name }} ({{ streamLeaderSection(+sectionId)?.city }})</ion-card-title>
          </ion-card-header>
          <ion-card-content class="ion-no-padding ion-padding-vertical">
            <ion-list lines="full">
              <ion-item v-for="user in users" :key="user.uid" @click="handleRequest(user)">
                <ion-label>
                  <ion-text style="font-weight: bold">{{ userStore.getName(user.uid) }} </ion-text>
                  <ion-text> ({{ user.email }})</ion-text>
                </ion-label>
                <ion-badge slot="end" :color="badgeColor(user)"> {{ getRoleByValue(user.requestedRole)}} </ion-badge>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>
      <div v-if="showNotFound()" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">Pas de demande d'accès</h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonIcon, IonText, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonSpinner, IonItem, IonList, IonLabel, 
  IonButton, alertController, AlertInput, IonBadge} from "@ionic/vue";
import { settingsOutline, settingsSharp} from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES, Profile, getRoleByValue } from "@/services/users";
import { computed, ref } from "@vue/reactivity";
import { onMounted } from "vue";
import { streamLeaderSection } from "@/services/leaderSections";
import { choicePopup, textInputPopup } from "@/services/popup";
import RefresherComponent from "@/components/RefresherComponent.vue";

const userStore = useAuthStore();

// reactive data
const pageSize = ref(15);
const isLoading = ref(true);

// lifecycle hooks

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 5000);
});

// Computed

const usersBySection = computed(() => {
  let usersById = new Map<string, Profile>();
  let result = new Map<string, Profile[]>();
  if (userStore.profile.role === ROLES.Chef) {
    const sectionId = userStore.profile.sectionId;
    usersById =  userStore.getSectionApplicants(pageSize.value, sectionId);
    result.set(sectionId.toString(), [...usersById.values()]);
  }
  if (userStore.profile.role >= ROLES.Organisateur) {
    usersById = userStore.getApplicants(pageSize.value);
    result = Array.from(usersById.values()).reduce((map, profile: Profile) => {
      const { requestedSectionId } = profile;
      const profiles = map.get(requestedSectionId.toString()) ?? [];
      return map.set(requestedSectionId.toString(), [...profiles, profile]);
    }, new Map<string, Profile[]>());
  }
  return result;
});
const showSpinner = () => {
  return isLoading.value && (!usersBySection.value || usersBySection.value.size < 1);
}
const showUsers = () => {
  return usersBySection.value && usersBySection.value.size > 0
}
const showNotFound = () => {
  return !isLoading.value && (!usersBySection.value || usersBySection.value.size < 1);
}

// Watchers


// Methods

const badgeColor = (user: Profile) => {
  switch (user.requestedRole) {
    case ROLES.Animateur:
      return "success";
    case ROLES.Chef:
      return "primary";
    case ROLES.Organisateur:
      return "warning";
    case ROLES.Administrateur:
      return "danger";
    default:
      return "medium";
  }
}

const handleRequest = (user: Profile) => {
  let message = `Il y a une erreur, ce rôle n'existe pas (${user.requestedRole})`;
  if (user.requestedRole === ROLES.Animateur || user.requestedRole === ROLES.Chef) {
    message = `Tu es sur le point d'ajouter ${userStore.getName(user.uid)} (${user.email})
    comme <b>${getRoleByValue(user.requestedRole)}</b> de la section ${streamLeaderSection(user.requestedSectionId)?.name}.`;
  }
  if (user.requestedRole >= ROLES.Organisateur){
    message = `Tu es sur le point d'ajouter ${userStore.getName(user.uid)} (${user.email})
    comme <b>${getRoleByValue(user.requestedRole)}</b> de la Baden Battle.`;
  }
  const choices = ["Accepter", "Refuser", "Annuler"]
  const reasonMessage = `Pourquoi refuse-tu la demande de ${userStore.getName(user.uid)} ?`;
  const acceptHandler = () => {
    userStore.updateProfile(user.uid, { 
          role: user.requestedRole,
          sectionId: user.requestedSectionId,
          sectionName: user.requestedSectionName,
          requestedRole: -1,
          requestedSectionId: "",
          rejectionReason: "" 
    });
    
  }
  const rejectHandler = (reason: string) => {
    const fullReason = `${userStore.getName(userStore.uid)} (${getRoleByValue(userStore.profile.role)}) : "${reason}"`;
    userStore.updateProfile(user.uid, {  requestedRole: -1, requestedSectionId: "", rejectionReason: fullReason, hasDoneOnboarding: false });
  }
  const choicePopupHandler = (choice: string) => {
    switch (choice) {
      case "Accepter":
        acceptHandler();
        break;
      case "Refuser":
        textInputPopup(reasonMessage, rejectHandler, "Raison", "Brève explication");
        break;
      default:
        break;
    }
  }
  choicePopup("Continuer?", choices, choicePopupHandler, "", message);
}
/**
 * @description Set the number of users to display
 */
const setLimit = async () => {
  const inputs = [] as AlertInput[];
  const options = [15, 50, 100, 500]
  options.forEach((option: number) => {
    inputs.push({
      type: 'radio',
      label: option.toString(),
      value: option,
      handler: () => {
        pageSize.value = option;
      },
      checked: option === pageSize.value,
    }) 
  })
  const alert = await alertController.create({
    header: "Afficher combien d'utilisateurs ?",
    inputs: inputs,
    buttons: ["OK"],
  });
  await alert.present();
}
</script>
<style scoped></style>
