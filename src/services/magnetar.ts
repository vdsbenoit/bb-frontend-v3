import {  collection, doc } from "firebase/firestore";
import { CreatePlugin as PluginFirestore } from "@magnetarjs/plugin-firestore";
import { CreatePlugin as PluginVue } from "@magnetarjs/plugin-vue3";
import { Magnetar } from "magnetar";
import { logger } from "@magnetarjs/utils";
import { db } from './firebase'


/**
 * A helper function that generates a random Firestore ID
 * This function is used when you execute `insert` without specifying an ID
 */
function generateRandomId() {
  return doc(collection(db, "random")).id;
}

const remote = PluginFirestore({ db });
const local = PluginVue({ generateRandomId });

export const magnetar = Magnetar({
  stores: { local, remote },
  localStoreName: "local",
  executionOrder: {
    read: ["local", "remote"],
    write: ["local", "remote"],
    delete: ["local", "remote"],
  },
  on: { success: logger }, // fixme: disable this on production builds
});

export const stopMagnetar = async () => {
  await magnetar.closeAllStreams;
}
