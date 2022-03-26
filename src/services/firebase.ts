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
import { Profile, emptyProfile } from "./user";

const firebaseConfig = {
  apiKey: "AIzaSyBPS9sBLuX7ULxwqxVLI9e431w9ggmKiaM",
  authDomain: "badenbattle-a0dec.firebaseapp.com",
  databaseURL: "https://badenbattle-a0dec.firebaseio.com",
  projectId: "badenbattle-a0dec",
  storageBucket: "badenbattle-a0dec.appspot.com",
  messagingSenderId: "855454974300",
  appId: "1:855454974300:web:9904d0ea27239000038199",
  measurementId: "G-9SGHK33E8H",
};

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
    throw "Incorrect validation url";
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

/**
 * Reset the user profile to the intial state
 * Used for new users
 */
export const fbResetUserProfile = async () => {
  const user = auth.currentUser;
  const profile = emptyProfile(user?.email as string);

  const ref = doc(db, USER_DB_NAME, user?.uid as string);
  await setDoc(ref, profile );
  return profile;
};

/**
 * Set some of the profile data
 */
export const fbSetUserProfile = async (uid: string, profileData: any) => {
  const ref = doc(db, USER_DB_NAME, uid);
  await setDoc(ref, profileData, { merge: true });
};

/**
 *
 * @returns
 */
export const fbGetUserProfile = async (uid: string) => {
  console.log("Getting user profile", uid); //fixme

  const ref = doc(db, USER_DB_NAME, uid);
  const docSnap = await getDoc(ref);

  if (docSnap.exists()) {
    console.log("Firebase service fetched profile data:", docSnap.data());
    return {
      ...docSnap.data() as Profile
    };
  } else {
    // doc.data() will be undefined in this case
    console.log("Profile not found", uid);
    return emptyProfile();
  }
};

/**
 *
 * @param {*} param0
 */
export const queryObjectCollection = async ({
  collectionName,
}: {
  collectionName: string;
}) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  const results: any[] = [];

  querySnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    results.push({
      id: doc.id,
      ...doc.data(),
    });
  });
  return results;
};

/**
 * 
 * @param collectionName 
 * @param callback 
 */
export const fbCollectionListener = (collectionName: string, callback: any) => {
  const unsubscribe = onSnapshot(
    collection(db, collectionName),
    (snapshot) => {
      // ...
      console.log("Listening To Collection: " + collectionName, snapshot);
      const results: any[] = [];
      snapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      callback(results);
    },
    (error) => {
      // ...
      console.log("Error Listening To Collection: " + collectionName, error);
    }
  );
};

export { app, db, auth };

// fixme: remove unused method
/**
 *
 * @param email
 * @param password
 * @returns
 */
 export const fbCreateAccount = async (
  email: string,
  password: string,
  first: string,
  last: string
) => {
  const response = await createUserWithEmailAndPassword(auth, email, password);
  console.log(response);
  if (response) {
    const profile = await fbGetUserProfile(response.user.uid);
    return {
      user: response.user,
      profile,
    };
  } else {
    return {
      user: null,
      profile: null,
    };
  }
};

// fixme: remove unused method
/**
 *
 * @param email
 * @param password
 * @returns
 */
export const fbSignIn = async (email: string, password: string) => {
  const response = await signInWithEmailAndPassword(auth, email, password);
  console.log(response);
  return response;
};