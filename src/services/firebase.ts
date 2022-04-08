import { firebaseConfig } from './firebaseConfig';
import { initializeApp } from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import {
  getFirestore,
  getDoc,
  doc,
  setDoc,
  getDocs,
  collection,
  onSnapshot,
} from "firebase/firestore";
import {
  getAuth,
  signOut,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  isSignInWithEmailLink,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const USER_DB_NAME = "users";

/**
 *
 * @param email
 * @returns
 */
 export const fbSendSignInEmail = async (email: string) => {
  const actionCodeSettings = {
    // URL you want to redirect back to.
    url: `https://${location.host}/profile`,
    // This must be true.
    handleCodeInApp: true
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);

};

/**
 *
 * @param email
 * @param href
 * @returns
 */
 export const fbSignInWithEmailLink = async (email: string, href: string) => {
  if (isSignInWithEmailLink(auth, href)) {
    const response = signInWithEmailLink(auth, email, href);
    console.debug(response);
    return response;
  } else {
    throw new Error("Incorrect validation url");
  }  
};

/**
 *
 * @returns
 */
export const fbSignOut = async () => {
  await signOut(auth);
  return true;
};

/**
 *
 * @param callback
 */
export const fbAuthStateListener = (callback: any) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User
      callback(user);
    } else {
      // User is signed out
      callback(null);
    }
  });
};

export { app, db, auth };
