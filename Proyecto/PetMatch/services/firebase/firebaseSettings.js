import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra || {};

const API_KEY = extra.FB_API_KEY;
const AUTH_DOMAIN = extra.FB_AUTH_DOMAIN;
const PROJECT_ID = extra.FB_PROJECT_ID;
const STORAGE_BUCKET = extra.FB_STORAGE_BUCKET;
const MESSAGING_SENDER_ID = extra.FB_MESSAGING_SENDER_ID;
const APP_ID = extra.FB_APP_ID;

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
