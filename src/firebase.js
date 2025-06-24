
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "TON_PROJECT_ID.firebaseapp.com",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_PROJECT_ID.appspot.com",
  messagingSenderId: "TON_MESSAGING_SENDER_ID",
  appId: "TON_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

