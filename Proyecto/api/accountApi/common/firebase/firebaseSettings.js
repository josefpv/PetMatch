const { initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");

const env = process.env;

const API_KEY = env.FB_API_KEY;
const AUTH_DOMAIN = env.FB_AUTH_DOMAIN;
const PROJECT_ID = env.FB_PROJECT_ID;
const STORAGE_BUCKET = env.FB_STORAGE_BUCKET;
const MESSAGING_SENDER_ID = env.FB_MESSAGING_SENDER_ID;
const APP_ID = env.FB_APP_ID;

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};

const app = initializeApp(firebaseConfig);

module.exports = {
  auth: getAuth(app),
};
