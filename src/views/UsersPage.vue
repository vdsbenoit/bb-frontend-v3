<template>
  <ion-page>
    <header-template :pageTitle="pageTitle">
      <ion-button @click="setLimit"><ion-icon slot="icon-only" :ios="settingsOutline" :md="settingsSharp"></ion-icon></ion-button>
    </header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <div v-if="showSpinner()" class="ion-text-center" style="background: transparent">
        <ion-spinner></ion-spinner>
      </div>
      <ion-list v-if="showUsers()">
        <div v-for="user in users.values()" :key="user.uid">
          <div v-if="user.uid === editedUid">
            <ion-item>
              <ion-label :routerLink="`/profile/${user.uid}`">
                <ion-text style="font-weight: bold">{{ userStore.getName(user.uid) }}</ion-text>
              </ion-label>
              <ion-select v-model="editedRoleValue" cancel-text="Annuler" interface="popover">
                <ion-select-option v-for="(value, role) in ROLES" :key="value" :value="value">{{ role }}</ion-select-option>
              </ion-select> 
              <ion-button @click="setRole(user.uid)" color="success"><ion-icon slot="icon-only" :ios="checkmarkOutline" :md="checkmarkSharp"></ion-icon></ion-button>
              <ion-icon @click="toggleEditRole(null)" slot="end" :ios="pencilOutline" :md="pencilSharp"></ion-icon>
            </ion-item>
          </div>
          <div v-else>
            <ion-item>
              <ion-icon v-if="userFilter == 'promotions'" @click="removePromotion(user.uid)" slot="start" :ios="closeOutline" :md="closeSharp"></ion-icon>
              <ion-label :routerLink="`/profile/${user.uid}`">
                <ion-text v-if="userFilter == ''" style="font-size: small;">{{ parseDate(user.creationDate) }}</ion-text>
                <ion-text style="font-weight: bold"  class="ion-padding-start">{{ userStore.getName(user.uid) }} </ion-text>
              </ion-label>
              <!-- <ion-input slot="end" type="text" readonly="true">{{ getRoleByValue(user.role) }}</ion-input> -->
              <ion-icon @click="toggleEditRole(user as Profile)" slot="end" :ios="pencilOutline" :md="pencilSharp"></ion-icon>
            </ion-item>
          </div>
        </div>
      </ion-list>
      <div v-if="showNotFound()" class="not-found">
        <h2 class="ion-text-center ion-align-items-center">Pas d'utilisateurs</h2>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage, IonIcon, IonText, IonSelect, IonSelectOption, IonSpinner, IonItem, IonList, IonLabel, IonButton, alertController, AlertInput} from "@ionic/vue";
import { pencilOutline, pencilSharp, closeOutline, closeSharp, checkmarkOutline, checkmarkSharp, settingsOutline, settingsSharp} from "ionicons/icons";
import HeaderTemplate from "@/components/HeaderTemplate.vue";
import { useAuthStore, ROLES, Profile } from "@/services/users";
import { computed, ref } from "@vue/reactivity";
import { onMounted, defineProps } from "vue";

const props = defineProps(["userFilter"]);
const userStore = useAuthStore();

// reactive data
const pageSize = ref(15);
const isLoading = ref(true);
const editedUid = ref("");
const editedRoleValue = ref(0);

// lifecycle hooks

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 5000);
});

// Computed

const users = computed(() => {
  switch (props.userFilter) {
    case "promotions":
      return userStore.getApplicants(pageSize.value, userStore.profile.role);
    case "withoutSection":
      return userStore.getUsersWithoutSection(pageSize.value, userStore.profile.role);
    default:
      return userStore.getLatestUsers(pageSize.value, userStore.profile.role);
  }
});
const pageTitle = computed(() => {
  switch (props.userFilter) {
    case "promotions":
      return "Demandes de promotions";
    case "withoutSection":
      return "Utilisateurs sans section";
    default:
      return "Utilisateurs";
  }
});
const showSpinner = () => {
  return isLoading.value && (!users.value || users.value.size < 1);
}
const showUsers = () => {
  return users.value && users.value.size > 0
}
const showNotFound = () => {
  return !isLoading.value && (!users.value || users.value.size < 1);
}

// Watchers


// Methods

const parseDate = (timestamp: any) => {
  const date = timestamp.toDate();
  return date.toLocaleString("fr-BE");
}
const removePromotion = (uid: string) => {
  return userStore.updateProfile(uid, { promotionRequested: false });
};
const toggleEditRole = (user: Profile | null) => {
  if (user) {
    editedRoleValue.value = user.role;
    editedUid.value = user.uid;
  } else {
    editedUid.value = "";
  }
};
/**
 * @description Set the role of the user
 * @param uid The user id
 */
const setRole = (uid: string) => {
  userStore.updateProfile(uid, { role: editedRoleValue.value });
  toggleEditRole(null);
};
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
