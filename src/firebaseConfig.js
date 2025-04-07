// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCsQJda74HTRJQ-RRRCBCtmeY6VKuRGips",
  authDomain: "golf-scorecard-e9a19.firebaseapp.com",
  databaseURL: "https://golf-scorecard-e9a19-default-rtdb.firebaseio.com",
  projectId: "golf-scorecard-e9a19",
  storageBucket: "golf-scorecard-e9a19.appspot.com",
  messagingSenderId: "824895151600",
  appId: "1:824895151600:web:a5d6e6995bade890a51135",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
