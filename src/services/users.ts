import { User as fbUser } from "firebase/auth";
import { defineStore } from "pinia";
import {
  fbAuthStateListener,
  fbSendSignInEmail,
  fbSignInWithEmailLink,
  fbSignOut,
} from "./firebase";
import { magnetar } from "./magnetar";

const USER_PROFILES_COLLECTION = "users";

///////////////////////
/// Interfaces & co //
/////////////////////

export const ROLES = {
  Anonyme:        0,
  Participant:    2,
  Animateur:      4,
  Moderateur:     8,
  Administrateur: 10,
}

export const getRoleByValue = (role: number): string => {
  for (const [key, value] of Object.entries(ROLES)) {
    if (value === role)
      return key;
  }
  throw new Error(`Role inconnu: ${role}`);
}

interface UserSettings {
  autoRefreshRaking: boolean;
}

export interface Profile {
  email: string;
  totem: string;
  name: string;
  role: number;
  settings: UserSettings;
  team: string;
  morningGame: string;
  afternoonGame: string;
  sectionName: string;
  sectionId: string;
}

///////////////////////
/// Magnetar config //
/////////////////////

export function usersDefaults(payload?: any) {
  const defaults = { 
    email: "",
    totem: "",
    name: "",
    role: 0,
    settings: {},
    team: "",
    morningGame: "",
    afternoonGame: "",
    sectionName: "",
    sectionId: "",
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
  profile: Profile;
  error: any;
}

export const useAuthStore = defineStore("authStore", {
  state: (): authStoreState => ({
    user: null,
    profile: usersDefaults(),
    error: null,
  }),
  getters: {
    isLoggedIn: (state) => state.user !== null,
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
            this.user = user
            this.streamProfile(user.uid as string);
            this.profile = await usersModule.doc(user.uid as string).fetch() ?? usersDefaults();
          } else {
            this.user = null;
            this.profile = usersDefaults();
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
        console.debug("auth response", response); //fixme
        if(response.user) {
          this.user = response.user as fbUser;
          this.createProfile(response.user.uid as string, response.user.email as string);
        } else this.user = null;
      } catch (e: any) {
        this.user = null;
        this.error = e;
      } finally {
        window.localStorage.removeItem('emailForSignIn');
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
        this.error = null;
        return true;
      } catch (e: any) {
        this.error = e;
        return false;
      }
    },
    streamProfile(uid: string) {
      usersModule.doc(uid).stream();
    },
    async createProfile(uid: string, email: string) {
      await usersModule.doc(uid).fetch().catch(error => {
        console.error(`Error occurred while fetching the profile of uid ${uid}`, error);
      });
      if (!usersModule.doc(uid).data?.email) usersModule.doc(uid).insert({email: email});
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
      const profile = usersModule.doc(uid).data;
      if (!profile) return `User ${uid}`;
      if (profile.totem) return profile.totem;
      if (profile.name) return profile.name;
      return profile.email;
    },
    canRegister(){
      return this.profile.role >= ROLES.Animateur;
    },
  },
});
