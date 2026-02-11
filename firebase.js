import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBV60vkNivxFRQwjpXCb__8WBpooOdclk",
  authDomain: "juventude-financeiro.firebaseapp.com",
  projectId: "juventude-financeiro",
  storageBucket: "juventude-financeiro.firebasestorage.app",
  messagingSenderId: "1057728806591",
  appId: "1:1057728806591:web:2ba9e6f8edd33fd30e100a"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
