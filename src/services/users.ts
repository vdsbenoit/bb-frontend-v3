import { errorPopup } from './popup';
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
import { processIf } from '@vue/compiler-core';

const USER_PROFILES_COLLECTION = "users";

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

interface UserSettings {
  autoRefreshRaking: boolean;
}

export interface Profile {
  uid: string;
  email: string;
  totem: string;
  name: string;
  role: number;
  settings: UserSettings;
  team: string;
  morningGame: number;
  afternoonGame: number;
  sectionName: string;
  sectionId: string;
  category: string;
  promotionRequested: boolean;
}

///////////////////////
/// Magnetar config //
/////////////////////

export function usersDefaults(payload?: any) {
  const defaults = { 
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
  }
  return { ...defaults, ...payload }
}

// fixme: do not export
export const usersModule = magnetar.collection(USER_PROFILES_COLLECTION, {
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
    profile: (state): Profile => state.profileObject?.data ? state.profileObject.data : usersDefaults(),
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
            this.streamProfile(user.uid as string);
            this.profileObject = usersModule.doc(user.uid as string);
          } else {
            this.user = null;
            this.profileObject = null;
          }
          resolve(true);
        });
      });
    },
    async sendSignInEmail(email: string) {
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
      //fixme: replace this with an error, it should not happen
      if (!email) {
        email = window.prompt('Quel email as-tu utilisé pour te connecter ?')!;
      }
      try {
        if(!email) throw new Error("Impossible de récupérer l'email d'authentification");
        const response = await fbSignInWithEmailLink(email, href);
        if(response.user) {
          this.user = response.user as fbUser;
          if(isNewUser(this.user)) this.createProfile(this.user.uid as string, this.user.email as string);
          window.localStorage.removeItem('emailForSignIn');
          return true;
        } else {
          this.user = null;
          return false;
        }
      } catch (e: any) {
        this.user = null;
        if (e.code === "auth/invalid-action-code") errorPopup(
          "Le lien que tu viens d'utiliser n'est plus valide. Clique sur le lien du dernier email que tu as reçu."
          );
        else errorPopup(e.message);
        return false;
      }
    },
    /**
     *
     * @param data
     */
    async logout() {
      try {
        await fbSignOut();
        this.user = null;
        this.profileObject = null;
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
        console.error(`Error occurred while streaming the ${USER_PROFILES_COLLECTION} collection`, error);
      });
    },
    async createProfile(uid: string, email: string) {
      usersModule.doc(uid).insert({uid, email, role: ROLES.Participant});
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
     * Force a fetch of the latest profile data.
     * Never use it in a computed property, it would lead to infinite db calls.
     */
    async getLatestProfileData(uid: string){
      if (this.isCurrentUserId(uid)) return this.profile;
      const profile = await usersModule.doc(uid).fetch({ force: true }).catch(error => {
        console.error(`Error occurred while fetching the profile uid ${uid}`, error);
      });
      return profile?.data;
    },
    /**
     * Fetch user profile & return the promise.
     */
    async asyncFetchProfile(uid: string){
      return usersModule.doc(uid).fetch()
    },
    /**
     * Get user profile data without waiting for it.
     * Fetch the profile asynchronously.
     */
    getProfile(uid: string): Profile{
      const profile = usersModule.doc(uid);
      profile.fetch().catch(error => {
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
    }
  },
});
