import { streamSettings, closeSettingsStream } from './settings';
import { errorPopup, choicePopup, loadingPopup } from './popup';
import { User as fbUser } from "firebase/auth";
import { defineStore } from "pinia";
import {
  fbAuthStateListener,
  fbSendSignInEmail,
  fbSignInWithEmailLink,
  fbSignOut,
  isNewUser,
} from "./firebase";
import { magnetar } from "./magnetar";
import { Timestamp } from '@firebase/firestore';

const USER_PROFILES_COLLECTION_NAME = "users";

///////////////////////
/// Interfaces & co //
/////////////////////

export const ROLES = {
  Anonyme:        0,
  Participant:    2,
  Animateur:      4,
  Modérateur:     6,
  Administrateur: 8,
}

export const getRoleByValue = (role: number): string => {
  for (const [key, value] of Object.entries(ROLES)) {
    if (value === role)
      return key;
  }
  throw console.error(`Role inconnu: ${role}`);
}

export type Profile = {
  uid: string;
  email: string;
  role: number;
  creationDate: Timestamp;
  totem?: string;
  name?: string;
  settings?: any;
  team?: string;
  morningGame?: number;
  afternoonGame?: number;
  sectionName?: string;
  sectionId?: string;
  category?: string;
  promotionRequested?: boolean;
}

// Generate a timestamp in the Firestore format
const fireStoreNow = (): Timestamp => {
  return new Timestamp(Math.floor(Date.now() / 1000), 0)
}

const Profiledefaults: Profile = { 
  uid: "",
  email: "",
  totem: "",
  name: "",
  role: 0,
  settings: {},
  team: "",
  morningGame: 0,
  afternoonGame: 0,
  sectionName: "",
  sectionId: "",
  category: "",
  promotionRequested: false,
  creationDate: fireStoreNow(),
}

///////////////////////
/// Magnetar config //
/////////////////////

export function usersDefaults(payload: Partial<Profile>): Profile {
  return { ...Profiledefaults, ...payload }
}

const usersModule = magnetar.collection(USER_PROFILES_COLLECTION_NAME, {
  modifyPayloadOn: { insert: usersDefaults },
  modifyReadResponseOn: { added: usersDefaults },
});

//////////////////
// Pinia store //
////////////////

interface authStoreState {
  user: fbUser | null;
  profileObject: any;
}

export const useAuthStore = defineStore("authStore", {
  state: (): authStoreState => ({
    user: null,
    profileObject: null,
  }),
  getters: {
    isLoggedIn: (state) => state.user !== null,
    profile: (state): Profile => state.profileObject?.data ? state.profileObject.data : Profiledefaults,
    uid: (state): string => state.user ? state.user.uid : "undefined",
  },
  actions: {
    /**
     * listens for state changes, ie a user logging in or out
     * and if logging in, loading the associated profile info
     * @returns
     */
    initializeAuthListener() {
      return new Promise((resolve) => {
        fbAuthStateListener(async (user: any) => {
          if (user) {
            this.user = user;
            streamSettings(); 
            this.streamProfile(user.uid as string);
            this.profileObject = usersModule.doc(user.uid as string);
          } else {
            if (this.profileObject) this.profileObject.closeStream();
            this.profileObject = null;
            closeSettingsStream();
            this.user = null;
          }
          resolve(true);
        });
      });
    },
    async sendSignInEmail(email: string) {
      email = email.trim();
      try {
        await fbSendSignInEmail(email);
        window.localStorage.setItem('emailForSignIn', email);
      } catch (e: any) {
        this.user = null;
        console.error(e);
        throw e;
      }
    },
    async processSignInLink(href: string) {
      let email = window.localStorage.getItem('emailForSignIn');
      let displayEmailError = true;
      if (!email) {
        const choiceHandler = (choice: string) => {
          switch(choice){
            case "D'accord":
              displayEmailError = false;
              break;
            case "Je veux quand même essayer ici":
              email = window.prompt('Quel email as-tu utilisé pour te connecter ?') ?? "";
              email = email.trim();
              break;
          }
        }
        await choicePopup(`On dirait que tu n'as pas ouvert le lien depuis le même endroit que là où tu as essayé.e de te connecter.\n\n
        Il devrait y avoir une option dans le menu en haut de ton écran pour ouvrir le lien dans ton navigateur ou dans l'app. 
        Si pas, essaie de copier/coller le lien dans ton navigateur.`, ["Je veux quand même essayer ici", "D'accord"], choiceHandler)   
      }
      if(!email){
        if(displayEmailError) throw new Error("Impossible de récupérer l'email d'authentification");
        else return;
      }
      const loading = await loadingPopup();
      try {
        const response = await fbSignInWithEmailLink(email, href);
        if(response.user) {
          this.user = response.user as fbUser;
          if(isNewUser(this.user)) this.createProfile(this.user.uid as string, this.user.email as string);
          window.localStorage.removeItem('emailForSignIn');
          loading.dismiss();
          return true;
        } else {
          this.user = null;
          loading.dismiss();
          return false;
        }
      } catch (e: any) {
        this.user = null;
        if (e.code === "auth/invalid-action-code") errorPopup(
          "Le lien que tu viens d'utiliser n'est plus valide. Clique sur le lien du dernier email que tu as reçu ou réessaie depuis le début."
          );
        else errorPopup(e.message);
        loading.dismiss();
        return false;
      }
    },
    /**
     *
     * @param data
     */
    async logout() {
      try {
        this.profileObject.closeStream();
        this.profileObject = null;
        await fbSignOut();
        this.user = null;
        return true;
      } catch (e: any) {
        errorPopup(e.message);
        return false;
      }
    },
    async removeAccount(uid: string) {
      return usersModule.doc(uid).delete();
    },
    streamProfile(uid: string) {
      if(!uid) return undefined;
      usersModule.doc(uid).stream().catch((error: any) => {
        if(error.code === 'resource-exhausted' ) errorPopup("Impossible de lancer l'app. Le quota Firestore est épuisé");
        console.error(`Error occurred while streaming the ${USER_PROFILES_COLLECTION_NAME} collection`, error);
      });
    },
    async createProfile(uid: string, email: string) {
      usersModule.doc(uid).insert({
        uid, email,
        role: ROLES.Participant,
        creationDate: fireStoreNow(),
      });
    },
    async updateProfile(uid: string, profileData: any) {
      return usersModule.doc(uid).merge(profileData);
    },

    /// Getters 

    isCurrentUserId(uid: string) {
      if (!this.isLoggedIn) return false;
      if (uid === this.uid) return true;
      return false;
    },
    /**
     * Force a fetch of the current user profile
     * Never use it in a computed property, it would lead to infinite db calls.
     */
    async forceFetchCurrentUserProfile(){
      usersModule.doc(this.uid).fetch({ force: true }).catch(error => {
        console.error(`Error occurred while fetching the current user profile: ${error.message}`);
      });
    },
    /**
     * Force a fetch of the latest profile data.
     * Never use it in a computed property, it would lead to infinite db calls.
     */
    async getLatestProfileData(uid: string){
      if (this.isCurrentUserId(uid)) return this.profile;
      const profile = usersModule.doc(uid)
      await profile.fetch({ force: true }).catch(error => {
        console.error(`Error occurred while fetching the profile uid ${uid}`, error);
      });
      return profile?.data;
    },
    /**
     * Fetch user profile & return the promise.
     */
    async asyncFetchProfile(uid: string){
      const profile = usersModule.doc(uid)
      await profile.fetch()
      return profile.data
    },
    /**
     * Get user profile data without waiting for it.
     * Fetch the profile asynchronously.
     */
    getProfile(uid: string): Profile{
      const profile = usersModule.doc(uid);
      profile.stream().catch(error => {
        console.error(`Error occurred while fetching the profile uid ${uid}`, error);
      });
      return profile.data as Profile;
    },
    /**
     * Get best matching user name.
     * This method does not fetch the profile.
     * Think about calling asyncFetchProfile() first if needed.
     */
    getName(uid: string){
      if(!uid) return undefined;
      const profile = usersModule.doc(uid).data;
      if (!profile) return `User ${uid}`;
      if (profile.totem) return profile.totem;
      if (profile.name) return profile.name;
      return profile.email.split("@")[0];
    },
    canRegister(){
      return this.profile.role >= ROLES.Animateur;
    },
    getSectionUsers(sectionId: string){
      console.log(`Fetching users from section '${sectionId}'`);
      const filteredUsersModule = usersModule.where("sectionId", "==", sectionId);
      filteredUsersModule.stream(); // using stream because fetch is buggy
      return filteredUsersModule.data;
    },
    getPromotionUsers(limit: number){
      console.log(`Fetching users who requested a promotion`);
      const filteredUsersModule = usersModule.where("promotionRequested", "==", true).limit(limit);
      filteredUsersModule.stream(); // using stream because fetch is buggy
      return filteredUsersModule.data;
    },
    getLatestUsers(limit: number){
      console.log(`Fetching latest registered userd`);
      const filteredUsersModule = usersModule.orderBy("creationDate", "desc").limit(limit);
      filteredUsersModule.stream(); // using stream because fetch is buggy
      return filteredUsersModule.data;
    },
    getUsersWithoutSection(limit: number){
      console.log(`Fetching users without any sections`);
      const filteredUsersModule = usersModule.where("sectionId", "==", []).orderBy("creationDate", "desc").limit(limit);
      filteredUsersModule.stream(); // using stream because fetch is buggy
      return filteredUsersModule.data;
    }
  },
});
