import { User as fbUser } from "firebase/auth";
import { defineStore } from "pinia";
import {
  fbAuthStateListener,
  fbResetUserProfile,
  fbSetUserProfile,
  fbGetUserProfile,
  fbSendSignInEmail,
  fbSignInWithEmailLink,
  fbSignOut,
} from "./firebase";

export const ROLES = {
  "Anonyme": 0,
  "Participant": 2,
  "Animateur": 4,
  "Moderateur": 8,
  "Administrateur": 10,
}

export interface Profile {
  email: string;
  totem: string;
  firstName: string;
  lastName: string;
  role: number;
  settings: any[];
  team: string;
  game: string;
  section: string;
}

export const emptyProfile = (email=""): Profile => ({
  email: email,
  totem: "",
  firstName: "",
  lastName: "",
  role: 0,
  settings: [],
  team: "",
  game: "",
  section: "",
})

interface State {
  user: fbUser | null;
  profile: Profile;
  error: any;
}

export const useAuthStore = defineStore("authStore", {
  state: (): State => ({
    user: null,
    profile: emptyProfile(),
    error: null,
  }),
  getters: {
    isLoggedIn: (state) => state.user !== null,
    userError: (state) => state.error,
    uid: (state): string => state.user ? state.user.uid : "",
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
          this.user = user ? user : null;

          if (user) {
            try{
              const profile = (await fbGetUserProfile(user.uid as string)) as Profile;
              this.profile = profile;
            } catch (e: any) {
              this.profile = emptyProfile();
              console.error(e);
            }
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
        this.error = e;
        console.error(e);
      }
    },
    async processSignInLink(href: string) {
      let email = window.localStorage.getItem('emailForSignIn');
      //fixme: replace this with an error, it should not happen
      if (!email) {
        email = window.prompt('Quel email as-tu utilisé pour te connecter ?')!;
      }
      try {
        if(!email) throw "Impossible de récupérer l'email d'authentification"
        const response = await fbSignInWithEmailLink(email, href);
        console.debug("auth response", response); //fixme
        this.user = response.user ? response.user as fbUser : null;
        if (!this.user) {
          console.error(response);
          throw "undefined user in sign in response" ;
        }
        const profile = await fbGetUserProfile(this.user.uid as string);
        if (!profile) {
          console.debug("Create a new profile for a new user");
          const profile = await fbResetUserProfile();
          this.profile = profile ? profile : this.profile;
        }
        this.error = null;
      } catch (e: any) {
        this.user = null;
        this.profile = emptyProfile();
        this.error = e;
      } finally {
        window.localStorage.removeItem('emailForSignIn');
      }
    },
    /**
     *
     * @param data
     */
    async logoutUser() {
      try {
        await fbSignOut();
        this.user = null;
        this.profile = emptyProfile();
        this.error = null;
        return true;
      } catch (e: any) {
        this.error = e;
        return false;
      }
    },
  },
});
