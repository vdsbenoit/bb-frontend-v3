<template>
  <ion-page>
    <header-template :pageTitle="pageTitle">
      <ion-button @click="setLimit"><ion-icon slot="icon-only" :ios="settingsOutline" :md="settingsSharp"></ion-icon></ion-button>
    </header-template>
    <ion-content :fullscreen="true" class="ion-padding">
      <ion-list v-if="users || isLoading">
        <div v-if="!users || users?.size < 1" class="ion-text-center" style="background: transparent">
          <ion-spinner></ion-spinner>
        </div>
        <div v-else v-for="user in users.values()" :key="user.uid">
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
                <ion-text v-if="userFilter == ''" style="font-size: small;">{{ user.creationDate.toLocaleString("fr-BE") }}</ion-text>
                <ion-text style="font-weight: bold"  class="ion-padding-start">{{ userStore.getName(user.uid) }} </ion-text>
              </ion-label>
              <!-- <ion-input slot="end" type="text" readonly="true">{{ getRoleByValue(user.role) }}</ion-input> -->
              <ion-icon @click="toggleEditRole(user as Profile)" slot="end" :ios="pencilOutline" :md="pencilSharp"></ion-icon>
            </ion-item>
          </div>
        </div>
      </ion-list>
      <div v-else class="not-found">
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
import { onBeforeMount, onMounted, defineProps } from "vue";

const props = defineProps(["promotions"]);
const userStore = useAuthStore();

// reactive data

const userFilter = ref("");
const pageSize = ref(15);
const isLoading = ref(true);
const editedUid = ref("");
const editedRoleValue = ref(0);

// lifecicle hooks

onBeforeMount(async () => {
  if (props.promotions) {
    userFilter.value = "promotions";
  }
});
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 5000);
});

// Computed

const users = computed(() => {
  switch (userFilter.value) {
    case "promotions":
      return userStore.getPromotionUsers(pageSize.value);
    default:
      return userStore.getLatestUsers(pageSize.value);
  }
});
const pageTitle = computed(() => {
  switch (userFilter.value) {
    case "promotions":
      return "Demandes de promotions";
    default:
      return "Utilisateurs";
  }
});

// Watchers


// Methods

const removePromotion = (uid: string) => {
  return userStore.updateProfile(uid, { promotionRequested: false });
};
const toggleEditRole = (user: Profile | null) => {
  if (user) {
    console.debug("toggleEdit", user);
    editedRoleValue.value = user.role;
    editedUid.value = user.uid;
  } else {
    editedUid.value = "";
  }
};
const setRole = (uid: string) => {
  userStore.updateProfile(uid, { role: editedRoleValue.value });
  toggleEditRole(null);
};
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
